"use client";

import { useEffect, useRef, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReadingPracticeSessionSummaryResponse } from "@/lib/types/responses/ReadingPracticeSessionSummaryResponse";
import { ReadingPracticeSessionResponse } from "@/lib/types/responses/ReadingPracticeSessionResponse";
import { Rating } from "@/lib/types/Rating";
import { AudioSpeed, getPlaybackRate, playTextAudio } from "@/lib/ttsGoogle";
import ReadingFlashcardReview from "./ReadingFlashcardReview";

export type ReadingPracticeViewOutput =
    | { type: "reload" }
    | { type: "create" }
    | { type: "openSession"; sessionId: string }
    | { type: "deleteSession"; sessionId: string }
    | { type: "clearSelection" }
    | { type: "flipFlashcard" }
    | { type: "rateFlashcard"; rating: Rating }
    | { type: "nextFlashcard" }
    | { type: "previousFlashcard" }
    | { type: "resetFlashcards" }
    | { type: "clearError" }
    | { type: "clearInfo" };

type ReadingPracticeViewProps = {
    input: {
        sessions: ReadingPracticeSessionSummaryResponse[];
        selectedSession: ReadingPracticeSessionResponse | null;
        activeSessionId: string | null;
        flashcardReview: {
            currentIndex: number;
            isCurrentCardFlipped: boolean;
            ratedCardIds: string[];
        };
        isLoadingSessions: boolean;
        isLoadingSessionDetail: boolean;
        isCreatingSession: boolean;
        isDeletingSession: boolean;
        isRatingFlashcard: boolean;
        error: string | null;
        infoMessage: string | null;
    };
    output: OutputHandle<ReadingPracticeViewOutput>;
};

function formatDate(dateValue: string): string {
    if (!dateValue) {
        return "-";
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
    }

    return parsed.toLocaleString();
}

async function sleep(ms: number, signal?: AbortSignal) {
    if (signal?.aborted) {
        return;
    }
    await new Promise<void>((resolve) => {
        const id = window.setTimeout(() => resolve(), ms);
        if (signal) {
            signal.addEventListener(
                "abort",
                () => {
                    window.clearTimeout(id);
                    resolve();
                },
                { once: true }
            );
        }
    });
}

export default function ReadingPracticeView({ input, output }: ReadingPracticeViewProps) {
    const {
        sessions,
        selectedSession,
        activeSessionId,
        flashcardReview,
        isLoadingSessions,
        isLoadingSessionDetail,
        isCreatingSession,
        isDeletingSession,
        isRatingFlashcard,
        error,
        infoMessage,
    } = input;

    const [isInfoFading, setIsInfoFading] = useState(false);
    const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>("normal");
    const [pauseSeconds, setPauseSeconds] = useState(2);
    const [isPlayingReading, setIsPlayingReading] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!infoMessage) {
            setIsInfoFading(false);
            return;
        }

        setIsInfoFading(false);
        const fadeTimer = window.setTimeout(() => setIsInfoFading(true), 4500);
        const clearTimer = window.setTimeout(() => output.emit({ type: "clearInfo" }), 5000);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(clearTimer);
        };
    }, [infoMessage, output]);

    const remainingCards = selectedSession
        ? selectedSession.vocabFlashcards.filter((card) => !flashcardReview.ratedCardIds.includes(card.id))
        : [];

    const readingParagraphs = selectedSession?.readingParagraphs ?? [];
    const fallbackReadingText = selectedSession?.readingText?.trim() ?? "";
    const sentenceAudioQueue = readingParagraphs.flatMap((paragraph) => paragraph.sentences ?? []).filter(Boolean);
    const hasSentenceAudio = sentenceAudioQueue.length > 0;

    const stopReadingPlayback = () => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setIsPlayingReading(false);
    };

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        stopReadingPlayback();
    }, [selectedSession?.sessionId]);

    const handlePlayReading = async () => {
        if (!hasSentenceAudio) {
            return;
        }

        stopReadingPlayback();
        const controller = new AbortController();
        controllerRef.current = controller;
        setIsPlayingReading(true);
        const playbackRate = getPlaybackRate(audioSpeed);
        const pauseMs = Math.max(0, pauseSeconds) * 1000;

        try {
            for (const sentence of sentenceAudioQueue) {
                if (controller.signal.aborted) {
                    return;
                }
                const cleaned = sentence.trim();
                if (!cleaned) {
                    continue;
                }
                await playTextAudio(cleaned, "de", playbackRate, controller.signal);
                if (pauseMs > 0) {
                    await sleep(pauseMs, controller.signal);
                }
            }
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setIsPlayingReading(false);
            }
        }
    };

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="mx-auto max-w-6xl space-y-6">
                {selectedSession ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{selectedSession.topic}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearSelection" })}>
                                    Back To Sessions
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={isDeletingSession}
                                    onClick={() => output.emit({ type: "deleteSession", sessionId: selectedSession.sessionId })}
                                >
                                    {isDeletingSession ? "Deleting..." : "Delete Session"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
                                <div className="text-xs text-muted-foreground">
                                    {hasSentenceAudio
                                        ? `${sentenceAudioQueue.length} sentence${sentenceAudioQueue.length === 1 ? "" : "s"}`
                                        : "No sentence audio available"}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        aria-label="Audio speed"
                                        value={audioSpeed}
                                        onChange={(e) => setAudioSpeed(e.target.value as AudioSpeed)}
                                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        disabled={!hasSentenceAudio || isPlayingReading}
                                    >
                                        <option value="slow">Slow</option>
                                        <option value="normal">Normal</option>
                                        <option value="fast">Fast</option>
                                    </select>
                                    <select
                                        aria-label="Pause duration"
                                        value={pauseSeconds}
                                        onChange={(e) => setPauseSeconds(Number(e.target.value))}
                                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        disabled={!hasSentenceAudio || isPlayingReading}
                                    >
                                        <option value={0}>No pause</option>
                                        <option value={1}>1s pause</option>
                                        <option value={2}>2s pause</option>
                                        <option value={3}>3s pause</option>
                                        <option value={5}>5s pause</option>
                                    </select>
                                    {isPlayingReading ? (
                                        <Button type="button" size="sm" variant="destructive" onClick={stopReadingPlayback}>
                                            Stop audio
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handlePlayReading}
                                            disabled={!hasSentenceAudio}
                                            title={hasSentenceAudio ? "Listen to reading text" : "Audio unavailable (no sentences)"}
                                        >
                                            Listen
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">Created {formatDate(selectedSession.createdAt)}</div>
                            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
                                {readingParagraphs.length > 0
                                    ? readingParagraphs
                                          .map((paragraph) => paragraph.paragraphText)
                                          .filter((text) => text && text.trim().length > 0)
                                          .join("\n\n")
                                    : fallbackReadingText || "No reading text available yet."}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Vocabulary flashcards</h3>
                                <ReadingFlashcardReview
                                    card={remainingCards[flashcardReview.currentIndex] ?? null}
                                    currentIndex={flashcardReview.currentIndex}
                                    totalCards={remainingCards.length}
                                    flipped={flashcardReview.isCurrentCardFlipped}
                                    isRating={isRatingFlashcard}
                                    onFlip={() => output.emit({ type: "flipFlashcard" })}
                                    onRate={(rating) => output.emit({ type: "rateFlashcard", rating })}
                                    onNext={() => output.emit({ type: "nextFlashcard" })}
                                    onPrevious={() => output.emit({ type: "previousFlashcard" })}
                                    onReset={() => output.emit({ type: "resetFlashcards" })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>Reading Practice</CardTitle>
                            <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => output.emit({ type: "reload" })}
                                    disabled={isLoadingSessions || isCreatingSession || isDeletingSession}
                                    className="flex-1 sm:flex-none"
                                >
                                    {isLoadingSessions ? "Refreshing..." : "Refresh"}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => output.emit({ type: "create" })}
                                    disabled={isCreatingSession || isLoadingSessions || isDeletingSession}
                                    className="flex-1 sm:flex-none"
                                >
                                    {isCreatingSession ? "Creating..." : "Create session"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sessions.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    {isLoadingSessions ? "Loading sessions..." : "No reading sessions yet."}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 md:hidden">
                                        {sessions.map((session) => {
                                            const isBusy =
                                                activeSessionId === session.sessionId &&
                                                (isLoadingSessionDetail || isDeletingSession);

                                            return (
                                                <div key={session.sessionId} className="rounded-lg border p-4 space-y-3">
                                                    <div className="space-y-1">
                                                        <p className="font-medium leading-tight break-words">{session.topic}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {session.vocabCount} vocabulary card{session.vocabCount === 1 ? "" : "s"}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        className="w-full"
                                                        disabled={isBusy || isCreatingSession}
                                                        onClick={() => output.emit({ type: "openSession", sessionId: session.sessionId })}
                                                    >
                                                        {isLoadingSessionDetail && activeSessionId === session.sessionId
                                                            ? "Opening..."
                                                            : "Open Session"}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Topic</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead>Vocabulary</TableHead>
                                                    <TableHead>Preview</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sessions.map((session) => {
                                                    const isBusy =
                                                        activeSessionId === session.sessionId &&
                                                        (isLoadingSessionDetail || isDeletingSession);

                                                    return (
                                                        <TableRow key={session.sessionId}>
                                                            <TableCell className="font-medium">{session.topic}</TableCell>
                                                            <TableCell>{formatDate(session.createdAt)}</TableCell>
                                                            <TableCell>{session.vocabCount}</TableCell>
                                                            <TableCell className="max-w-[20rem] truncate">{session.readingTextPreview}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={isBusy || isCreatingSession}
                                                                    onClick={() => output.emit({ type: "openSession", sessionId: session.sessionId })}
                                                                >
                                                                    {isLoadingSessionDetail && activeSessionId === session.sessionId
                                                                        ? "Opening..."
                                                                        : "Open"}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {infoMessage ? (
                    <div
                        className={`flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 transition-opacity duration-500 ${isInfoFading ? "opacity-0" : "opacity-100"}`}
                    >
                        <span>{infoMessage}</span>
                    </div>
                ) : null}

                {error ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <span>{error}</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => output.emit({ type: "clearError" })}>
                            Dismiss
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
