"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Rating } from "@/lib/types/Rating";
import { ReadingParagraphClozeSessionCardResponse, ReadingParagraphClozeSessionResponse } from "@/lib/types/responses/ReadingParagraphClozeSessionResponse";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import ReadingFlashcardReview from "@/app/reading/_client_components/ReadingFlashcardReview";
import { ReadingVocabularyFlashCardView } from "@/lib/types/responses/ReadingVocabularyFlashCardView";

export type ReadingParagraphClozeViewOutput =
    | { type: "refresh" }
    | { type: "updateLimit"; limit: number }
    | { type: "createSession" }
    | { type: "flipCard" }
    | { type: "nextCard" }
    | { type: "previousCard" }
    | { type: "resetCards" }
    | { type: "rateCard"; flashcardId: string; rating: Rating }
    | { type: "clearError" };

type Props = {
    input: {
        session: ReadingParagraphClozeSessionResponse | null;
        limit: number;
        currentCard: ReadingParagraphClozeSessionCardResponse | null;
        currentCardIndex: number;
        isCardFlipped: boolean;
        isLoading: boolean;
        isCreating: boolean;
        isRating: boolean;
        error: string | null;
    };
    output: OutputHandle<ReadingParagraphClozeViewOutput>;
};

export default function ReadingParagraphClozeView({ input, output }: Props) {
    const canCreate = !input.isCreating && !input.isLoading && !input.isRating;
    const currentCard = input.currentCard;
    const reviewCard: ReadingVocabularyFlashCardView | null = currentCard
        ? {
              id: currentCard.flashcardId,
              front: {
                  clozeText: currentCard.blankToken,
                  hint: currentCard.translation,
                  wordOrChunk: currentCard.blankToken,
              },
              back: {
                  answerWords: currentCard.answerWords,
                  answerText: currentCard.surface,
                  answerTranslation: currentCard.translation,
                  notes: "",
                  wordOrChunk: currentCard.surface,
                  sentences: [],
              },
              isReversed: true,
          }
        : null;

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="mx-auto max-w-5xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Reading Paragraph Cloze</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="w-full sm:w-48 space-y-1">
                                <div className="text-sm text-muted-foreground">Word limit (1-300)</div>
                                <Input
                                    type="number"
                                    min={1}
                                    max={300}
                                    value={input.limit}
                                    onChange={(event) => output.emit({ type: "updateLimit", limit: Number(event.target.value) || 1 })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => output.emit({ type: "refresh" })} disabled={!canCreate}>
                                    {input.isLoading ? "Loading..." : "Load Active"}
                                </Button>
                                <Button type="button" onClick={() => output.emit({ type: "createSession" })} disabled={!canCreate}>
                                    {input.isCreating ? "Creating..." : "Create Session"}
                                </Button>
                            </div>
                        </div>

                        {input.error ? (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <span>{input.error}</span>
                                <Button type="button" size="sm" variant="outline" onClick={() => output.emit({ type: "clearError" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {!input.session ? (
                    <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">No active paragraph cloze session found.</CardContent>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>{input.session.topic}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                    Status: {input.session.status} | Rated: {input.session.ratedCount}/{input.session.totalCount}
                                </div>
                                <p className="leading-8 whitespace-pre-wrap">{input.session.clozeParagraph}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Hint Meanings (English)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {input.session.cards.map((card, index) => (
                                        <div key={card.cardId} className="rounded border p-2 text-sm">
                                            {index + 1}. {card.translation}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Card Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ReadingFlashcardReview
                                    card={reviewCard}
                                    currentIndex={input.currentCardIndex}
                                    totalCards={input.session.cards.length}
                                    flipped={input.isCardFlipped}
                                    isRating={input.isRating}
                                    onFlip={() => output.emit({ type: "flipCard" })}
                                    onRate={(rating) => {
                                        if (!currentCard) {
                                            return;
                                        }
                                        output.emit({ type: "rateCard", flashcardId: currentCard.flashcardId, rating });
                                    }}
                                    onNext={() => output.emit({ type: "nextCard" })}
                                    onPrevious={() => output.emit({ type: "previousCard" })}
                                    onReset={() => output.emit({ type: "resetCards" })}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
