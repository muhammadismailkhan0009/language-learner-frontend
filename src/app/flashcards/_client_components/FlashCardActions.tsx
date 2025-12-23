"use client"

import { Button } from "@/components/ui/button";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
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
        <div className="flex gap-2 flex-wrap">
            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.EASY })}
                disabled={actions.input.disabled}
            >
                Easy
            </Button>

            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.GOOD })}
                disabled={actions.input.disabled}
            >
                Good
            </Button>

            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.HARD })}
                disabled={actions.input.disabled}
            >
                Hard
            </Button>

            <Button
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
        <div className="flex gap-4">
            {!actions.input.flipped ?
                // if
                (<Button 
                    onClick={() => actions.output.emit({ action: "flip" })}
                    disabled={actions.input.disabled}
                >
                    Show Answer
                </Button>)
                : actions.input.isRevision ?
                    (
                        (<Button 
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