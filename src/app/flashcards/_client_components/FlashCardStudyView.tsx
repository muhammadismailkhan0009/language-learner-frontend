"use client";

import { useEffect, useState } from "react";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import { reviewStudiedCard } from "@/lib/clientbackendApiCalls";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import FlashCardView from "@/app/flashcards/_client_components/FlashCardView";
import FlashCardActions from "@/app/flashcards/_client_components/FlashCardActions";
import { Rating } from "@/lib/types/Rating";
import fetchFlashCardsAction from "../_server_actions/fetchFlashCardAction";

type FlashCardStudyViewProps = {
    deckId: string;
}

export function FlashcardStudyView({ deckId }: FlashCardStudyViewProps) {
    const [fetchNext, setFetchNext] = useState(false);
    const [flipped, setFlipped] = useState(false);

    const [nextCard, setNextCard] = useState<FlashCard | null>();

    const [loading, setLoading] = useState(true);

    async function loadNextCard() {

        const response = await fetchFlashCardsAction(deckId);
        console.log("response got.")
        if (response != null) {
            setNextCard(response);
            setFlipped(false);
            setFetchNext(false);
        }

        setLoading(false);
    }

    useEffect(() => {

        loadNextCard();
    }, [deckId, fetchNext]);

    if (loading) {
        return <p>Loading...</p>;
    }


    if (nextCard === null || !nextCard) {
        console.log("Next card not found");
        return (
            <div className="flex flex-col items-center gap-4">
                <p>All cards completed!</p>
                <Button onClick={() => redirect("decks")}>Back to Decks</Button>
            </div>
        );
    }

    async function handleReviewAction(rating: Rating) {
        if (!nextCard) {
            throw new Error("handleReviewAction called without an active card");
        }
        await reviewStudiedCard(deckId, nextCard.id, rating);
        loadNextCard();
    }
    return (
        <div className="flex flex-col items-center gap-4">
            <FlashCardView card={nextCard} flipped={flipped} />
            <FlashCardActions
                flipped={flipped}
                onFlipAction={() => setFlipped((f) => !f)}
                onNextAction={() => setFetchNext(true)}
                onReviewAction={handleReviewAction} />
        </div>
    );
}

