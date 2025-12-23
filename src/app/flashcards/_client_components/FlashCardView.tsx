"use client"

import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playCardAudio } from "@/lib/ttsGoogle";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
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
        if (action.action === "flip") {
            props.output.emit({ ...action, cardId });
        } else if (action.action === "rate") {
            props.output.emit({ ...action, cardId });
        } else if (action.action === "next") {
            props.output.emit({ ...action, cardId });
        }
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
                {props.input.cards.map((cardWithState) => (
                    <div key={cardWithState.card.id} className="flex flex-col gap-2">
                        <Card>
                            <CardContent className="p-4">
                                <div className="min-h-[100px] flex items-center justify-center">
                                    {cardWithState.flipped 
                                        ? cardWithState.card.back.text 
                                        : cardWithState.card.front.text}
                                </div>
                                <Button 
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