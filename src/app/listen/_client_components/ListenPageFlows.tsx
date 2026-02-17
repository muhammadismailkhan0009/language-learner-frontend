"use client";

import { useMemo } from "react";
import { createFlowChannel, FlowRunner } from "@myriadcodelabs/uiflow";
import { addWordFlow } from "../flows/addWordFlow";
import { wordsListFlow } from "../flows/wordsListFlow";

export default function ListenPageFlows() {
    const wordsRefresh = useMemo(() => createFlowChannel<number>(0), []);

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-3xl space-y-6">
                <FlowRunner initialData={{}} flow={addWordFlow} eventChannels={{ wordsRefresh }} />

                <FlowRunner initialData={{}} flow={wordsListFlow} eventChannels={{ wordsRefresh }} />
            </div>
        </div>
    );
}
