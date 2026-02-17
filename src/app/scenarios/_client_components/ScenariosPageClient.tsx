"use client";

import { useMemo } from "react";
import { createFlowChannel, FlowRunner } from "@myriadcodelabs/uiflow";
import { scenariosListFlow } from "../flows/scenariosListFlow";
import { addScenarioFlow } from "../flows/addScenarioFlow";
import { editScenarioFlow } from "../flows/editScenarioFlow";
import { ScreenMode } from "../types";

export default function ScenariosPageClient() {
    const screenMode = useMemo(() => createFlowChannel<ScreenMode>("list"), []);
    const selectedScenarioId = useMemo(() => createFlowChannel<string | null>(null), []);
    const scenariosRefresh = useMemo(() => createFlowChannel<number>(0), []);

    return (
        <>
            <FlowRunner initialData={{}} flow={scenariosListFlow} eventChannels={{ screenMode, selectedScenarioId, scenariosRefresh }} />
            <FlowRunner initialData={{}} flow={addScenarioFlow} eventChannels={{ screenMode, selectedScenarioId, scenariosRefresh }} />
            <FlowRunner initialData={{}} flow={editScenarioFlow} eventChannels={{ screenMode, selectedScenarioId, scenariosRefresh }} />
        </>
    );
}
