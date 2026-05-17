"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { studyFlow } from "../_flows/studyFlow";

export default function StudyPageClient() {
    return <FlowRunner initialData={{}} flow={studyFlow} />;
}

