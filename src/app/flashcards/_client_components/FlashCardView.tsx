"use client"

import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playCardAudio } from "@/lib/ttsGoogle";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import FlashCardActions, { ShowCardOutput, CardActionWithoutId } from "./FlashCardActions";

type CardWithState = {
    card: FlashCard;
    flipped: boolean;
    disabled: boolean;
}

type FlashCardViewProps = {
    input: {
        cards: CardWithState[];
    },
    output: OutputHandle<ShowCardOutput>
}

export default function FlashCardView(props: FlashCardViewProps) {
    const handleCardAction = (cardId: string, action: CardActionWithoutId) => {
        // Add cardId to the action and emit
        if (action.action === "flip" || action.action === "rate" || action.action === "next") {
            props.output.emit({ ...action, cardId });
        }
    };

    return (
        <div className="w-full px-4">
            <div className="grid grid-cols-3 gap-6 w-full">
                {props.input.cards.map((cardWithState) => (
                    <div key={cardWithState.card.id} className="flex flex-col gap-3">
                        <Card className="h-full flex flex-col">
                            <CardContent className="p-4 flex-1 flex flex-col justify-center items-center ">
                                <div className="text-2xl font-normal text-center leading-relaxed mb-6">
                                    {cardWithState.flipped
                                        ? cardWithState.card.back.text
                                        : cardWithState.card.front.text}
                                </div>
                                <Button
                                    size="lg"
                                    className="text-lg px-6 py-3"
                                    onClick={() => playCardAudio(
                                        cardWithState.card.id,
                                        cardWithState.card.isReverse
                                            ? cardWithState.card.back.text
                                            : cardWithState.card.front.text,
                                        "de"
                                    )}
                                    disabled={cardWithState.disabled}
                                >
                                    Play Audio
                                </Button>
                            </CardContent>
                        </Card>
                        <FlashCardActions
                            input={{
                                flipped: cardWithState.flipped,
                                isRevision: cardWithState.card.isRevision,
                                disabled: cardWithState.disabled
                            }}
                            output={{
                                emit: (action: CardActionWithoutId) => handleCardAction(cardWithState.card.id, action)
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}