"use client"

import { Button } from "@/components/ui/button";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Rating } from "@/lib/types/Rating";

type CardActionsProps = {
    input: {
        flipped?: boolean;
        isRevision: boolean;
        disabled?: boolean;
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
    },
    output: OutputHandle<CardActionWithoutId>
}

function ReviewAction(actions: CardActionsInternalProps) {

    return (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
            <Button
                size="lg"
                className="text-base sm:text-lg px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[110px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.EASY })}
                disabled={actions.input.disabled}
            >
                Easy
            </Button>

            <Button
                size="lg"
                className="text-base sm:text-lg px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[110px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.GOOD })}
                disabled={actions.input.disabled}
            >
                Good
            </Button>

            <Button
                size="lg"
                className="text-base sm:text-lg px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[110px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.HARD })}
                disabled={actions.input.disabled}
            >
                Hard
            </Button>

            <Button
                size="lg"
                className="text-base sm:text-lg px-4 sm:px-6 py-3 w-full sm:w-auto min-w-[110px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.AGAIN })}
                disabled={actions.input.disabled}
            >
                Again
            </Button>
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
