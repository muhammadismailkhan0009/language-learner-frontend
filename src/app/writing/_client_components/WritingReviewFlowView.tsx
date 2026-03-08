"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rating } from "@/lib/types/Rating";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingScreenMode } from "../types";
import WritingFlashcardReview from "./WritingFlashcardReview";

export type WritingReviewFlowViewOutput =
    | { type: "flipFlashcard" }
    | { type: "rateFlashcard"; rating: Rating }
    | { type: "nextFlashcard" }
    | { type: "previousFlashcard" }
    | { type: "resetFlashcards" }
    | { type: "clearError" }
    | { type: "clearInfo" };

type WritingReviewFlowViewProps = {
    input: {
        mode: WritingScreenMode;
        session: WritingPracticeSessionResponse | null;
        flashcardReview: {
            currentIndex: number;
            isCurrentCardFlipped: boolean;
            ratedCardIds: string[];
        };
        isRatingFlashcard: boolean;
        error: string | null;
        infoMessage: string | null;
    };
    output: OutputHandle<WritingReviewFlowViewOutput>;
};

export default function WritingReviewFlowView({ input, output }: WritingReviewFlowViewProps) {
    if (input.mode !== "detail" || !input.session || !input.session.submittedAnswer?.trim()) {
        return null;
    }

    const remainingCards = input.session.vocabFlashcards.filter(
        (card) => !input.flashcardReview.ratedCardIds.includes(card.id)
    );
    const currentCard = remainingCards[input.flashcardReview.currentIndex] ?? null;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Your submitted answer</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
                        {input.session.submittedAnswer?.trim() || "No submitted answer recorded."}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Reference German paragraph</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
                        {input.session.germanParagraph?.trim() || "No German reference available yet."}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Vocabulary flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                    <WritingFlashcardReview
                        card={currentCard}
                        currentIndex={input.flashcardReview.currentIndex}
                        totalCards={remainingCards.length}
                        flipped={input.flashcardReview.isCurrentCardFlipped}
                        isRating={input.isRatingFlashcard}
                        onFlip={() => output.emit({ type: "flipFlashcard" })}
                        onRate={(rating) => output.emit({ type: "rateFlashcard", rating })}
                        onNext={() => output.emit({ type: "nextFlashcard" })}
                        onPrevious={() => output.emit({ type: "previousFlashcard" })}
                        onReset={() => output.emit({ type: "resetFlashcards" })}
                    />
                </CardContent>
            </Card>

            {input.infoMessage ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {input.infoMessage}
                </div>
            ) : null}

            {input.error ? (
                <div className="flex items-center gap-2 text-sm text-red-600">
                    <span>{input.error}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => output.emit({ type: "clearError" })}>
                        Dismiss
                    </Button>
                </div>
            ) : null}
        </>
    );
}
