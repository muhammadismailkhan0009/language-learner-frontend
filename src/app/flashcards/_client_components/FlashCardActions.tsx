"use client"

import { Button } from "@/components/ui/button";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
import { Rating } from "@/lib/types/Rating";

type CardActionsProps = {
    input: {
        flipped?: boolean;
        isRevision: boolean;
    },
    output: OutputHandle<ShowCardOutput>
}


export type ShowCardOutput =
    | { action: "flip" }
    | { action: "rate"; rating: Rating }
    | { action: "next" };

function ReviewAction(actions: CardActionsProps) {

    return (
        <div>
            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.EASY })}
            >
                Easy
            </Button>

            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.GOOD })}
            >
                Good
            </Button>

            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.HARD })}
            >
                Hard
            </Button>

            <Button
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.AGAIN })}
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
                (<Button onClick={() => actions.output.emit({ action: "flip" })}>
                    Show Answer
                </Button>)
                : actions.input.isRevision ?
                    (
                        (<Button onClick={() => actions.output.emit({ action: "next" })}>
                            Next
                        </Button>)
                    )
                    :
                    ReviewAction(actions)}


        </div>
    )
}