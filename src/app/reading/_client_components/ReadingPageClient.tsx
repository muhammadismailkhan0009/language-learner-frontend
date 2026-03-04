"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { readingPracticeFlow } from "../flows/readingPracticeFlow";

export default function ReadingPageClient() {
    return <FlowRunner initialData={{}} flow={readingPracticeFlow} />;
}
