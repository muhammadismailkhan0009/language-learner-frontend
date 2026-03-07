"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { readingPracticeFlow } from "../_flows/readingPracticeFlow";

export default function ReadingPageClient() {
    return <FlowRunner initialData={{}} flow={readingPracticeFlow} />;
}
