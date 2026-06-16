"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { profileDifficultyFlow } from "../_flows/profileDifficultyFlow";

export default function ProfilePageClient() {
    return <FlowRunner initialData={{}} flow={profileDifficultyFlow} />;
}
