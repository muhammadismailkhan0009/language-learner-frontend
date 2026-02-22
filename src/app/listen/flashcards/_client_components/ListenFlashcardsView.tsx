"use client";

import { useEffect, useMemo, useRef } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeckView } from "@/lib/types/responses/DeckView";
import fetchNextRevisionCardAction from "../_server_actions/fetchNextRevisionCardAction";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import { AudioSpeed, getPlaybackRate, playTextAudio } from "@/lib/ttsGoogle";

export type ListenFlashcardsViewOutput =
    | { type: "reload" }
    | { type: "selectDeck"; deckId: string }
    | { type: "setAudioSpeed"; speed: AudioSpeed }
    | { type: "startListening"; deckId: string }
    | { type: "stopListening"; deckId: string }
    | { type: "noCards" };

type ListenFlashcardsViewProps = {
    input: {
        decks: DeckView[];
        selectedDeckId: string | null;
        isListening: boolean;
        audioSpeed: AudioSpeed;
        isLoading: boolean;
        error: string | null;
        notice: string | null;
    };
    output: OutputHandle<ListenFlashcardsViewOutput>;
};

type CardLanguagePair = {
    german: string;
    english: string;
    germanSentences: string[];
};

function getCardLanguagePair(card: FlashCard): CardLanguagePair {
    const isReversed = card.isReverse ?? card.isReversed ?? false;
    const frontText = card.front?.wordOrChunk ?? "";
    const backText = card.back?.wordOrChunk ?? "";
    const german = isReversed ? backText : frontText;
    const english = isReversed ? frontText : backText;
    const germanSentences = (card.back?.sentences ?? []).map((sentence) => sentence.sentence);

    return {
        german,
        english,
        germanSentences,
    };
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

async function playCardSequence(card: FlashCard, playbackRate: number, signal?: AbortSignal) {
    if (signal?.aborted) {
        return;
    }

    const { german, english, germanSentences } = getCardLanguagePair(card);

    if (german.trim()) {
        await playTextAudio(german, "de", playbackRate, signal);
    }
    await sleep(10000, signal);
    if (signal?.aborted) {
        return;
    }

    if (english.trim()) {
        await playTextAudio(english, "en", playbackRate, signal);
    }
    await sleep(5000, signal);

    for (const sentence of germanSentences) {
        if (signal?.aborted) {
            return;
        }
        const cleaned = sentence.trim();
        if (!cleaned) {
            continue;
        }
        await playTextAudio(cleaned, "de", playbackRate, signal);
        await sleep(5000, signal);
    }
}

export default function ListenFlashcardsView({ input, output }: ListenFlashcardsViewProps) {
    const loopRef = useRef(0);
    const selectedDeck = useMemo(
        () => input.decks.find((deck) => deck.id === input.selectedDeckId) ?? null,
        [input.decks, input.selectedDeckId]
    );

    useEffect(() => {
        if (!input.isListening || !input.selectedDeckId) {
            return;
        }

        loopRef.current += 1;
        const loopId = loopRef.current;
        const controller = new AbortController();
        const playbackRate = getPlaybackRate(input.audioSpeed);
        const deckId = input.selectedDeckId;

        const runLoop = async () => {
            while (!controller.signal.aborted && loopId === loopRef.current) {
                const fetchPromise = fetchNextRevisionCardAction(deckId);
                await playTextAudio("Next Card", "en", playbackRate, controller.signal);
                await sleep(3000, controller.signal);
                const card = await fetchPromise;

                if (controller.signal.aborted || loopId !== loopRef.current) {
                    return;
                }

                if (!card) {
                    await playTextAudio("Session End", "en", playbackRate, controller.signal);
                    output.emit({ type: "noCards" });
                    return;
                }

                await playCardSequence(card, playbackRate, controller.signal);
                await sleep(5000, controller.signal);
            }
        };

        void runLoop();

        return () => {
            controller.abort();
        };
    }, [input.isListening, input.selectedDeckId, input.audioSpeed, output]);

    const hasDecks = input.decks.length > 0;

    return (
        <Card>
            <CardHeader className="space-y-2">
                <CardTitle>Listen to Flashcards</CardTitle>
                <div className="text-sm text-muted-foreground space-y-1">
                    <div>1. Select a deck to review.</div>
                    <div>2. Press Listen to hear the next card and example sentences.</div>
                    <div>3. Use each delay to actively recall the translation before it plays.</div>
                    <div>4. This is active recall via listening — focus on retrieval during the pauses.</div>
                    <div>5. Press Stop to pause listening at any time.</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => output.emit({ type: "reload" })}
                        disabled={input.isLoading}
                    >
                        {input.isLoading ? "Refreshing..." : "Reload decks"}
                    </Button>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>Speed</span>
                        <select
                            className="h-8 rounded-md border bg-background px-2 text-sm text-foreground"
                            value={input.audioSpeed}
                            onChange={(event) =>
                                output.emit({
                                    type: "setAudioSpeed",
                                    speed: event.target.value as AudioSpeed,
                                })
                            }
                        >
                            <option value="slow">Slow</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Fast</option>
                        </select>
                    </label>
                    {selectedDeck ? (
                        <div className="text-sm text-muted-foreground">
                            Selected: {selectedDeck.name} ({selectedDeck.totalCards} cards)
                        </div>
                    ) : null}
                </div>

                {input.error ? <div className="text-sm text-red-600">{input.error}</div> : null}
                {input.notice ? <div className="text-sm text-muted-foreground">{input.notice}</div> : null}

                {!input.error && !input.isLoading && input.decks.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No decks available for listening.</div>
                ) : null}

                {input.decks.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deck</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {input.decks.map((deck) => {
                                    const isSelected = deck.id === input.selectedDeckId;
                                    const isActive = input.isListening && isSelected;
                                    return (
                                        <TableRow
                                            key={deck.id}
                                            className={isSelected ? "bg-accent/70" : ""}
                                            onClick={() => output.emit({ type: "selectDeck", deckId: deck.id })}
                                        >
                                            <TableCell className="font-medium">{deck.name}</TableCell>
                                            <TableCell className="space-x-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isActive ? "destructive" : "default"}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        output.emit({
                                                            type: isActive ? "stopListening" : "startListening",
                                                            deckId: deck.id,
                                                        });
                                                    }}
                                                >
                                                    {isActive ? "Stop" : "Listen"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
