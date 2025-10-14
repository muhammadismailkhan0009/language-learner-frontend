"use client";

import { useState } from "react";
import { DeckView } from "@/lib/types/responses/DeckView";
import { FlashcardStudy } from "../flashcard/flashcard-study";
import { Button } from "../ui/button";

export default function DeckListClient({ decks }: Readonly<{ decks: DeckView[] }>) {
    const [activeDeck, setActiveDeck] = useState<DeckView | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleStudy(deck: DeckView) {
        setLoading(true);
        setActiveDeck(deck);
        setLoading(false);

    }

    if (activeDeck) {
        return (
            <section>
                <h2>{activeDeck.name}</h2>
                <FlashcardStudy cards={activeDeck.deckCards} onExit={() => setActiveDeck(null)} />
            </section>
        );
    }

    return (
        <ul className="flex flex-row">
            {decks.map((deck) => (
                <li key={deck.id} className="flex justify-around">
                    <div>{deck.name}</div>
                    <div>{deck.deckCards.length} cards</div>
                    <Button onClick={() => handleStudy(deck)} disabled={loading}>
                        {loading ? "Loading..." : "Study"}
                    </Button>
                </li>
            ))}
        </ul>
    );
}
