"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { practiceVocabularyExtractionFlow } from "../_flows/practiceVocabularyExtractionFlow";

export default function PracticePageClient() {
    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="mx-auto max-w-4xl">
                <FlowRunner initialData={{}} flow={practiceVocabularyExtractionFlow} />
            </div>
        </div>
    );
}
