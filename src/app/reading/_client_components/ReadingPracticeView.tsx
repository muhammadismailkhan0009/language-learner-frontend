"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReadingPracticeSessionSummaryResponse } from "@/lib/types/responses/ReadingPracticeSessionSummaryResponse";
import { ReadingPracticeSessionResponse } from "@/lib/types/responses/ReadingPracticeSessionResponse";
import { Rating } from "@/lib/types/Rating";
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
    | { type: "clearError" };

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
    } = input;

    const remainingCards = selectedSession
        ? selectedSession.vocabFlashcards.filter((card) => !flashcardReview.ratedCardIds.includes(card.id))
        : [];

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
                            <div className="text-xs text-muted-foreground">Created {formatDate(selectedSession.createdAt)}</div>
                            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
                                {selectedSession.readingText}
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
