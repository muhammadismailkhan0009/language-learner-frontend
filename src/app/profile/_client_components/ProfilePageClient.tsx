"use client";

import { FlowRunner } from "@myriadcodelabs/uiflow";
import { profileDifficultyFlow } from "../_flows/profileDifficultyFlow";
import { profileMcpFlow } from "@/flows/profile-mcp/profileMcpFlow";
import { browserClipboardAdapter } from "@/platform/profile-mcp/browserClipboardAdapter";
import { getProfileMcpUrl } from "@/platform/profile-mcp/profileMcpBackendAdapter";

const profileMcpInitialData = {
    backend: { getMcpUrl: getProfileMcpUrl },
    clipboard: browserClipboardAdapter,
};

export default function ProfilePageClient() {
    return (
        <div className="min-h-screen w-full px-4 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <FlowRunner initialData={{}} flow={profileDifficultyFlow} />
                <FlowRunner
                    initialData={profileMcpInitialData}
                    flow={profileMcpFlow}
                />
            </div>
        </div>
    );
}
