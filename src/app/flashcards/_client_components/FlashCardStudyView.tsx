"use client";

import { createFlowChannel, FlowRunner } from "@/lib/custom_lib_ui/flow";
import { studyFlashCard } from "../flows/studyFlashCard";
import { studyCounterFlow } from "../flows/studyCounterFlow";

type FlashCardStudyViewProps = {
    deckId: string;
}

export function FlashcardStudyView({ deckId }: FlashCardStudyViewProps) {

    const studiedCounter = createFlowChannel<number>(0);

    return (

        <div className="flex flex-col items-center gap-4">


            {/* Counter UI (independent flow) */}
            <FlowRunner
                flow={studyCounterFlow}
                initialData={{}}
                eventChannels={{ studiedCounter }}
            />


            <FlowRunner
                flow={studyFlashCard}
                initialData={{
                    deckId: deckId,
                    flowData: {
                        card: null,
                        flipped: false,
                        rating: null
                    },
                }}
                eventChannels={{ studiedCounter }}

            />


        </div>
    );
}

