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
    const getFrontText = (card: FlashCard) => card.front?.wordOrChunk ?? "";
    const getBackText = (card: FlashCard) => card.back?.wordOrChunk ?? "";
    const isReversed = (card: FlashCard) => card.isReverse ?? card.isReversed ?? false;

    const handleCardAction = (cardId: string, action: CardActionWithoutId) => {
        // Add cardId to the action and emit
        if (action.action === "flip" || action.action === "rate" || action.action === "next") {
            props.output.emit({ ...action, cardId });
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {props.input.cards.map((cardWithState) => (
                    <div key={cardWithState.card.id} className="flex flex-col gap-3 min-w-0">
                        <Card className="h-full flex flex-col">
                            <CardContent className="px-4 py-5 sm:p-6 flex-1 flex flex-col justify-center items-center">
                                <div className="text-xl sm:text-2xl font-normal text-center leading-relaxed mb-4 sm:mb-6 break-words">
                                    {cardWithState.flipped
                                        ? getBackText(cardWithState.card)
                                        : getFrontText(cardWithState.card)}
                                </div>
                                {cardWithState.flipped && cardWithState.card.back?.sentences?.length ? (
                                    <div className="w-full space-y-3 mb-4">
                                        <div className="space-y-2">
                                            {cardWithState.card.back.sentences.map((sentence) => (
                                                <div key={sentence.id} className="rounded-md border bg-muted/30 p-2">
                                                    <div className="text-sm sm:text-base break-words">{sentence.sentence}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                                <Button
                                    size="lg"
                                    className="text-base sm:text-lg px-5 sm:px-6 py-3 w-full sm:w-auto"
                                    onClick={() => playCardAudio(
                                        cardWithState.card.id,
                                        isReversed(cardWithState.card)
                                            ? getBackText(cardWithState.card)
                                            : getFrontText(cardWithState.card),
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
