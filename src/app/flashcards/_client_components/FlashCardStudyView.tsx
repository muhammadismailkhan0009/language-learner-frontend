"use client";

import { createFlowChannel, FlowRunner } from "@myriadcodelabs/uiflow";
import { studyFlashCard } from "../flows/studyFlashCard";
import { studyCounterFlow } from "../flows/studyCounterFlow";

type FlashCardStudyViewProps = {
    deckId: string;
}

export function FlashcardStudyView({ deckId }: FlashCardStudyViewProps) {

    const studiedCounter = createFlowChannel<number>(0);

    return (
        <div className="w-full min-h-screen py-6">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Counter UI (independent flow) */}
                <div className="mb-6">
                    <FlowRunner
                        flow={studyCounterFlow}
                        initialData={{}}
                        eventChannels={{ studiedCounter }}
                    />
                </div>

                {/* Flash Cards */}
                <FlowRunner
                    flow={studyFlashCard}
                    initialData={{
                        deckId: deckId,
                        flowData: {
                            cards: [],
                            activeCardId: null
                        },
                    }}
                    eventChannels={{ studiedCounter }}
                />
            </div>
        </div>
    );
}
