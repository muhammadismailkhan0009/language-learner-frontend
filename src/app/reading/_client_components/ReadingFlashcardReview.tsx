"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FlashCardActions, { CardActionWithoutId } from "@/app/flashcards/_client_components/FlashCardActions";
import { ReadingVocabularyFlashCardView } from "@/lib/types/responses/ReadingVocabularyFlashCardView";
import { playCardAudio } from "@/lib/ttsGoogle";
import { Rating } from "@/lib/types/Rating";
import { Info } from "lucide-react";
import { getFlashCardBackAnswerWords, getFlashCardBackNotes, getFlashCardBackText, getFlashCardBackTranslation, getFlashCardFrontHint, getFlashCardFrontText } from "@/lib/flashcards/flashCardText";

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
    const [showNotes, setShowNotes] = useState(false);

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
                    {!flipped ? (
                        <div className="text-xl sm:text-2xl font-normal text-center leading-relaxed break-words">
                            {getFlashCardFrontText(card)}
                        </div>
                    ) : null}
                    {!flipped && getFlashCardFrontHint(card) ? (
                        <div className="text-sm text-muted-foreground text-center">Hint: {getFlashCardFrontHint(card)}</div>
                    ) : null}
                    {flipped ? (
                        <div className="w-full space-y-3">
                            {getFlashCardBackAnswerWords(card).length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {getFlashCardBackAnswerWords(card).map((word) => (
                                        <span key={`${card.id}-${word}`} className="rounded-full border px-3 py-1 text-sm">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                            {getFlashCardBackText(card) ? (
                                <div className="text-xl sm:text-2xl font-normal text-center leading-relaxed break-words">
                                    {getFlashCardBackText(card)}
                                </div>
                            ) : null}
                            {getFlashCardBackTranslation(card) ? (
                                <div className="text-sm text-muted-foreground text-center">{getFlashCardBackTranslation(card)}</div>
                            ) : null}
                            {getFlashCardBackNotes(card) ? (
                                <div className="flex justify-center">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNotes((v) => !v)}>
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : null}
                            {showNotes && getFlashCardBackNotes(card) ? (
                                <div className="rounded-md border bg-muted/30 p-2 text-sm text-muted-foreground">
                                    {getFlashCardBackNotes(card)}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            playCardAudio(
                                card.id,
                                card.isReversed ? getFlashCardBackText(card) : getFlashCardFrontText(card),
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
