"use client"

import { Button } from "@/components/ui/button";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Rating } from "@/lib/types/Rating";

type CardActionsProps = {
    input: {
        flipped?: boolean;
        isRevision: boolean;
        disabled?: boolean;
        ratings?: readonly Rating[];
    },
    output: OutputHandle<CardActionWithoutId>
}


export type ShowCardOutput =
    | { action: "flip"; cardId: string }
    | { action: "rate"; rating: Rating; cardId: string }
    | { action: "next"; cardId: string };

// Internal action type without cardId (used by FlashCardActions component)
export type CardActionWithoutId =
    | { action: "flip" }
    | { action: "rate"; rating: Rating }
    | { action: "next" };

type CardActionsInternalProps = {
    input: {
        flipped?: boolean;
        isRevision: boolean;
        disabled?: boolean;
        ratings?: readonly Rating[];
    },
    output: OutputHandle<CardActionWithoutId>
}

function ReviewAction(actions: CardActionsInternalProps) {
    const ratings = actions.input.ratings ?? [Rating.EASY, Rating.GOOD, Rating.HARD, Rating.AGAIN];
    const labels: Record<Rating, string> = {
        [Rating.EASY]: "Easy",
        [Rating.GOOD]: "Good",
        [Rating.HARD]: "Hard",
        [Rating.AGAIN]: "Again",
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
            {ratings.map((rating) => (
                <Button
                    key={rating}
                    size="lg"
                    className="text-base sm:text-lg px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[110px]"
                    onClick={() => actions.output.emit({ action: "rate", rating })}
                    disabled={actions.input.disabled}
                >
                    {labels[rating]}
                </Button>
            ))}
        </div>
    )
}

export default function FlashCardActions(actions: CardActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {!actions.input.flipped ?
                // if
                (<Button 
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
                    onClick={() => actions.output.emit({ action: "flip" })}
                    disabled={actions.input.disabled}
                >
                    Show Answer
                </Button>)
                : actions.input.isRevision ?
                    (
                        (<Button 
                            size="lg"
                            className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
                            onClick={() => actions.output.emit({ action: "next" })}
                            disabled={actions.input.disabled}
                        >
                            Next
                        </Button>)
                    )
                    :
                    ReviewAction(actions)}


        </div>
    )
}
