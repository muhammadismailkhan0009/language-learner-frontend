"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { wordPracticeFlow } from "../_flows/wordPracticeFlow";

export default function WordPracticePageClient() {
    return <FlowRunner initialData={{}} flow={wordPracticeFlow} />;
}
