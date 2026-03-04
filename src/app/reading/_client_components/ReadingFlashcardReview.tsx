"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FlashCardActions, { CardActionWithoutId } from "@/app/flashcards/_client_components/FlashCardActions";
import { ReadingVocabularyFlashCardView } from "@/lib/types/responses/ReadingVocabularyFlashCardView";
import { playCardAudio } from "@/lib/ttsGoogle";
import { Rating } from "@/lib/types/Rating";

type ReadingFlashcardReviewProps = {
    card: ReadingVocabularyFlashCardView | null;
    currentIndex: number;
    totalCards: number;
    flipped: boolean;
    isRating: boolean;
    onFlip: () => void;
    onRate: (rating: Rating) => void;
    onNext: () => void;
    onPrevious: () => void;
    onReset: () => void;
};

function getFrontText(card: ReadingVocabularyFlashCardView) {
    return card.front?.wordOrChunk ?? "";
}

function getBackText(card: ReadingVocabularyFlashCardView) {
    return card.back?.wordOrChunk ?? "";
}

export default function ReadingFlashcardReview({
    card,
    currentIndex,
    totalCards,
    flipped,
    isRating,
    onFlip,
    onRate,
    onNext,
    onPrevious,
    onReset,
}: ReadingFlashcardReviewProps) {
    if (!card) {
        return <div className="text-sm text-muted-foreground">All cards in this session are rated.</div>;
    }

    const handleAction = (action: CardActionWithoutId) => {
        if (action.action === "flip") {
            onFlip();
            return;
        }

        if (action.action === "next") {
            onNext();
            return;
        }

        if (action.action === "rate") {
            onRate(action.rating);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    Card {currentIndex + 1} of {totalCards}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={onReset}>
                    Restart
                </Button>
            </div>

            <Card>
                <CardContent className="px-4 py-6 sm:p-6 flex flex-col items-center gap-4">
                    <div className="text-xl sm:text-2xl font-normal text-center leading-relaxed break-words">
                        {flipped ? getBackText(card) : getFrontText(card)}
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            playCardAudio(
                                card.id,
                                card.isReversed ? getBackText(card) : getFrontText(card),
                                "de"
                            )
                        }
                        disabled={isRating}
                    >
                        Play Audio
                    </Button>
                </CardContent>
            </Card>

            {flipped && card.back?.sentences?.length ? (
                <div className="space-y-2">
                    {card.back.sentences.map((sentence) => (
                        <div key={sentence.id} className="rounded-md border bg-muted/30 p-2 text-sm">
                            {sentence.sentence}
                        </div>
                    ))}
                </div>
            ) : null}

            <FlashCardActions
                input={{
                    flipped,
                    isRevision: false,
                    disabled: isRating,
                }}
                output={{
                    emit: (action: CardActionWithoutId) => handleAction(action),
                }}
            />

            <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={currentIndex === 0 || isRating}>
                    Previous
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={isRating}>
                    Next
                </Button>
            </div>
        </div>
    );
}
