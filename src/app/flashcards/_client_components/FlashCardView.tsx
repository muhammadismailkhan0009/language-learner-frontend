"use client"

import {FlashCard} from "@/lib/types/responses/FlashCard";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {playCardAudio} from "@/lib/ttsGoogle";

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
            <Button onClick={() => playCardAudio(props.card.id,props.card.front.text,"de")}>Play Audio</Button>

        </Card>
    )
}