"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { listenFlashcardsFlow } from "../flows/listenFlashcardsFlow";

export default function ListenFlashcardsPage() {
    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-4xl space-y-6">
                <FlowRunner initialData={{}} flow={listenFlashcardsFlow} />
            </div>
        </div>
    );
}
