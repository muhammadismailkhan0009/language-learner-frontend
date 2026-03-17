"use client";

import { useEffect, useState } from "react";
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
    const [showInformationExploration, setShowInformationExploration] = useState(false);

    useEffect(() => {
        setShowNotes(false);
        setShowInformationExploration(false);
    }, [card?.id]);

    if (!card) {
        return <div className="text-sm text-muted-foreground">All cards in this session are rated.</div>;
    }

    const frontHint = getFlashCardFrontHint(card);
    const backText = getFlashCardBackText(card);
    const backTranslation = getFlashCardBackTranslation(card);
    const backNotes = getFlashCardBackNotes(card);
    const backAnswerWords = getFlashCardBackAnswerWords(card);
    const backSentences = card.back?.sentences ?? [];
    const hasInformationExploration =
        frontHint.length > 0 ||
        backTranslation.length > 0 ||
        backNotes.length > 0 ||
        backAnswerWords.length > 0 ||
        backSentences.length > 0;

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
                        <div className="text-sm text-muted-foreground text-center">Hint: {frontHint}</div>
                    ) : null}
                    {flipped ? (
                        <div className="w-full space-y-3">
                            {backAnswerWords.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {backAnswerWords.map((word) => (
                                        <span key={`${card.id}-${word}`} className="rounded-full border px-3 py-1 text-sm">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                            {backText ? (
                                <div className="text-xl sm:text-2xl font-normal text-center leading-relaxed break-words">
                                    {backText}
                                </div>
                            ) : null}
                            {backTranslation ? (
                                <div className="text-sm text-muted-foreground text-center">{backTranslation}</div>
                            ) : null}
                            {backNotes ? (
                                <div className="flex justify-center">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNotes((v) => !v)}>
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : null}
                            {showNotes && backNotes ? (
                                <div className="rounded-md border bg-muted/30 p-2 text-sm text-muted-foreground">
                                    {backNotes}
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
                                card.isReversed ? backText : getFlashCardFrontText(card),
                                "de"
                            )
                        }
                        disabled={isRating}
                    >
                        Play Audio
                    </Button>
                </CardContent>
            </Card>

            {flipped && hasInformationExploration ? (
                <div className="space-y-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowInformationExploration((v) => !v)}
                        disabled={isRating}
                    >
                        {showInformationExploration ? "Hide Information Exploration" : "Information Exploration"}
                    </Button>

                    {showInformationExploration ? (
                        <div className="space-y-3 rounded-md border bg-muted/20 p-3">
                            <div className="text-sm font-medium">Explore vocabulary details</div>
                            {frontHint ? (
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Hint:</span> {frontHint}
                                </div>
                            ) : null}
                            {backAnswerWords.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="text-sm font-medium">Answer words</div>
                                    <div className="flex flex-wrap gap-2">
                                        {backAnswerWords.map((word) => (
                                            <span key={`exploration-${card.id}-${word}`} className="rounded-full border px-2 py-1 text-xs">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            {backTranslation ? (
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Translation:</span> {backTranslation}
                                </div>
                            ) : null}
                            {backNotes ? (
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Notes:</span> {backNotes}
                                </div>
                            ) : null}
                            {backSentences.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Examples from your reading practice</div>
                                    {backSentences.map((sentence) => (
                                        <div key={`exploration-${sentence.id}`} className="rounded-md border bg-muted/30 p-2 text-sm">
                                            {sentence.sentence}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
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
