"use client";

import { useMemo } from "react";
import { createFlowChannel, FlowRunner } from "@myriadcodelabs/uiflow";
import { ScreenMode } from "../types";
import { vocabularyListFlow } from "../flows/vocabularyListFlow";
import { addVocabularyFlow } from "../flows/addVocabularyFlow";
import { editVocabularyFlow } from "../flows/editVocabularyFlow";

export default function VocabularyPageClient() {
    const screenMode = useMemo(() => createFlowChannel<ScreenMode>("list"), []);
    const selectedVocabularyId = useMemo(() => createFlowChannel<string | null>(null), []);
    const vocabularyRefresh = useMemo(() => createFlowChannel<number>(0), []);

    return (
        <>
            <FlowRunner
                initialData={{}}
                flow={vocabularyListFlow}
                eventChannels={{ screenMode, selectedVocabularyId, vocabularyRefresh }}
            />
            <FlowRunner
                initialData={{}}
                flow={addVocabularyFlow}
                eventChannels={{ screenMode, selectedVocabularyId, vocabularyRefresh }}
            />
            <FlowRunner
                initialData={{}}
                flow={editVocabularyFlow}
                eventChannels={{ screenMode, selectedVocabularyId, vocabularyRefresh }}
            />
        </>
    );
}
