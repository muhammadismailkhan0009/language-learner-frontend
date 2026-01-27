"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { sentencesFlow } from "../flows/sentencesFlow";

export function SentencesListView() {
    return (
        <div className="w-full min-h-screen py-6">
            <FlowRunner
                flow={sentencesFlow}
                initialData={{
                    flowData: {
                        sentences: [],
                        error: null,
                        selectedScenario: "all",
                        selectedFunction: "all",
                    }
                }}
            />
        </div>
    );
}
