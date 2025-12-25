"use client"

import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playCardAudio } from "@/lib/ttsGoogle";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
import AudioComprehensionActions, { AudioComprehensionOutput } from "./AudioComprehensionActions";

type AudioComprehensionCardViewProps = {
    input: {
        card: FlashCard;
        flipped: boolean;
        disabled: boolean;
        showFrontText: boolean;
    },
    output: OutputHandle<AudioComprehensionOutput>
}

export default function AudioComprehensionCardView(props: AudioComprehensionCardViewProps) {
    const handleAction = (action: AudioComprehensionOutput) => {
        props.output.emit(action);
    };

    const frontText = props.input.card.isReverse 
        ? props.input.card.back.text 
        : props.input.card.front.text;
    const backText = props.input.card.isReverse 
        ? props.input.card.front.text 
        : props.input.card.back.text;

    return (
        <div className="w-full px-4 flex justify-center">
            <div className="w-full max-w-2xl">
                <Card className="h-full flex flex-col">
                    <CardContent className="p-8 flex-1 flex flex-col justify-center items-center gap-6">
                        {/* Front text - shown when button is clicked, above Play Audio */}
                        {props.input.showFrontText && (
                            <div className="text-2xl font-normal text-center leading-relaxed mb-2">
                                {frontText}
                            </div>
                        )}

                        {/* Button to show front text - comes before Play Audio */}
                        {!props.input.showFrontText && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-4"
                                onClick={() => handleAction({ action: "showFront" })}
                                disabled={props.input.disabled}
                            >
                                Show Text
                            </Button>
                        )}

                        {/* Audio button - always visible */}
                        <Button
                            size="lg"
                            className="text-lg px-8 py-4"
                            onClick={() => playCardAudio(
                                props.input.card.id,
                                frontText,
                                "de"
                            )}
                            disabled={props.input.disabled}
                        >
                            Play Audio
                        </Button>

                        {/* Answer (back text) - shown when flipped */}
                        {props.input.flipped && (
                            <div className="w-full mt-4">
                                <div className="text-lg font-semibold mb-2 text-center">
                                    Answer:
                                </div>
                                <div className="text-2xl font-normal text-center leading-relaxed">
                                    {backText}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="mt-6">
                    <AudioComprehensionActions
                        input={{
                            flipped: props.input.flipped,
                            disabled: props.input.disabled
                        }}
                        output={{
                            emit: (action) => handleAction(action)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

