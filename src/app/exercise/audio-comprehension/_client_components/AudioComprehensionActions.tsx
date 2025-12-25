"use client"

import { Button } from "@/components/ui/button";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
import { Rating } from "@/lib/types/Rating";

type AudioComprehensionActionsProps = {
    input: {
        flipped: boolean;
        disabled?: boolean;
    },
    output: OutputHandle<AudioComprehensionActionWithoutOption>
}

export type AudioComprehensionOutput =
    | { action: "flip" }
    | { action: "showFront" }
    | { action: "rate"; rating: Rating }
    | { action: "next" };

// Internal action type (used by AudioComprehensionActions component)
export type AudioComprehensionActionWithoutOption =
    | { action: "flip" }
    | { action: "rate"; rating: Rating }
    | { action: "next" };

function ReviewAction(actions: AudioComprehensionActionsProps) {
    return (
        <div className="flex gap-3 flex-wrap justify-center">
            <Button
                size="lg"
                className="text-lg px-6 py-3 min-w-[100px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.EASY })}
                disabled={actions.input.disabled}
            >
                Easy
            </Button>

            <Button
                size="lg"
                className="text-lg px-6 py-3 min-w-[100px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.GOOD })}
                disabled={actions.input.disabled}
            >
                Good
            </Button>

            <Button
                size="lg"
                className="text-lg px-6 py-3 min-w-[100px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.HARD })}
                disabled={actions.input.disabled}
            >
                Hard
            </Button>

            <Button
                size="lg"
                className="text-lg px-6 py-3 min-w-[100px]"
                onClick={() => actions.output.emit({ action: "rate", rating: Rating.AGAIN })}
                disabled={actions.input.disabled}
            >
                Again
            </Button>
        </div>
    )
}

export default function AudioComprehensionActions(actions: AudioComprehensionActionsProps) {
    return (
        <div className="flex gap-4 justify-center">
            {!actions.input.flipped ? (
                // Show "Show Answer" button when not flipped
                <Button 
                    size="lg"
                    className="text-lg px-8 py-3"
                    onClick={() => actions.output.emit({ action: "flip" })}
                    disabled={actions.input.disabled}
                >
                    Show Answer
                </Button>
            ) : (
                // Show rating buttons when flipped
                ReviewAction(actions)
            )}
        </div>
    )
}

