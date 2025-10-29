"use client"

import {FlashCard} from "@/lib/types/responses/FlashCard";
import {Card, CardContent} from "@/components/ui/card";

type FlashCardViewProps = {
    flipped: boolean;
    card: FlashCard;
}
export default function FlashCardView(props: FlashCardViewProps) {

    return (
        <Card>
            <CardContent>
                {props.flipped ? props.card.back.text : props.card.front.text}
            </CardContent>
        </Card>
    )
}