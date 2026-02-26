"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { listenScenariosFlow } from "../flows/listenScenariosFlow";

export default function ListenScenariosPage() {
    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-4xl space-y-6">
                <FlowRunner initialData={{}} flow={listenScenariosFlow} />
            </div>
        </div>
    );
}
