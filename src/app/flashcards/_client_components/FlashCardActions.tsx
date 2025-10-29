"use client"

import {Button} from "@/components/ui/button";
import {Rating} from "@/lib/types/Rating";

type CardActionsProps = {
    flipped?: boolean;
    onFlipAction?: () => void;
    onNextAction?: () => void;
    onReviewAction?: (rating: Rating) => void;
}

function ReviewAction(actions: CardActionsProps) {

    return (
        <div>
            <Button
                onClick={() =>actions.onReviewAction?.(Rating.EASY)}
            >
                Easy
            </Button>

            <Button
                onClick={() =>actions.onReviewAction?.(Rating.GOOD)}
            >
                Good
            </Button>

            <Button
                onClick={() =>actions.onReviewAction?.(Rating.HARD)}
            >
                Hard
            </Button>

            <Button
                onClick={() =>actions.onReviewAction?.(Rating.AGAIN)}
            >
                Again
            </Button>
        </div>
    )
}

export default function FlashCardActions(actions: CardActionsProps) {
    return (
        <div className="flex gap-4">
            {!actions.flipped ?
                // if
                (<Button onClick={actions.onFlipAction}>
                    Show Answer
                </Button>)
                :
                //else
                ReviewAction(actions)}


        </div>
    )
}