"use client";

import { useState } from "react";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function FlashcardStudy({
    cards,
    onExit,
}: Readonly<{
    cards: FlashCard[];
    onExit: () => void;
}>) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const current = cards[index];

    if (!current) {
        return (
            <div>
                <p>All cards completed!</p>
                <button onClick={onExit}>Back to Decks</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <Card>
                <CardContent>
                    {flipped ? current.back.text : current.front.text}
                </CardContent>
            </Card>
            <div className="flex gap-4">
                <Button onClick={() => setFlipped((f) => !f)}>
                    {flipped ? "Show Front" : "Flip"}
                </Button>
                <Button
                    onClick={() => {
                        setFlipped(false);
                        setIndex((i) => i + 1);
                    }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
