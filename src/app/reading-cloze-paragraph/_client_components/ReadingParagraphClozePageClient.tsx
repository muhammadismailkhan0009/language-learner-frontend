"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { readingParagraphClozeFlow } from "../_flows/readingParagraphClozeFlow";

export default function ReadingParagraphClozePageClient() {
    return <FlowRunner initialData={{}} flow={readingParagraphClozeFlow} />;
}
