"use client"

import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playCardAudio } from "@/lib/ttsGoogle";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
import { useEffect, useRef } from "react";
import FlashCardActions, { ShowCardOutput } from "./FlashCardActions";

type FlashCardViewProps = {
    input: {
        flipped: boolean;
        card: FlashCard;
    },
    output: OutputHandle<ShowCardOutput>
}
export default function FlashCardView(props: FlashCardViewProps) {

    console.log(props.input.card);
    return (
        <div>
            
            <Card>
                <CardContent>
                    {props.input.flipped ? props.input.card.back.text : props.input.card.front.text}
                </CardContent>
                <Button onClick={() => playCardAudio(props.input.card.id, props.input.card.isReverse ? props.input.card.back.text : props.input.card.front.text, "de")}>Play Audio</Button>
            </Card>
            <FlashCardActions
                input={{ flipped: props.input.flipped,isRevision: props.input.card.isRevision }}
                output={props.output}></FlashCardActions>
        </div>
    )
}