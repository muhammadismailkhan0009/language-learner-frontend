"use client";

import FlashCardActions, { CardActionWithoutId } from "@/app/flashcards/_client_components/FlashCardActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { playCardAudio } from "@/lib/ttsGoogle";
import { Rating } from "@/lib/types/Rating";
import { WritingVocabularyFlashCardView } from "@/lib/types/responses/WritingVocabularyFlashCardView";

type WritingFlashcardReviewProps = {
    card: WritingVocabularyFlashCardView | null;
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

function getFrontText(card: WritingVocabularyFlashCardView) {
    return card.front?.wordOrChunk ?? "";
}

function getBackText(card: WritingVocabularyFlashCardView) {
    return card.back?.wordOrChunk ?? "";
}

export default function WritingFlashcardReview({
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
}: WritingFlashcardReviewProps) {
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
                <CardContent className="flex flex-col items-center gap-4 px-4 py-6 sm:p-6">
                    <div className="text-center text-xl font-normal leading-relaxed break-words sm:text-2xl">
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
