import { defineFlow } from "@myriadcodelabs/uiflow";
import ProfileMcpView, { ProfileMcpViewOutput } from "@/features/profile-mcp/ProfileMcpView";
import { ClipboardPort } from "./ports/ClipboardPort";
import { ProfileMcpBackendPort } from "./ports/ProfileMcpBackendPort";

export type ProfileMcpDomainData = {
    backend: ProfileMcpBackendPort;
    clipboard: ClipboardPort;
};

type ProfileMcpInternalData = {
    isCopying: boolean;
    message: string | null;
    error: string | null;
};

export const profileMcpFlow = defineFlow<ProfileMcpDomainData, ProfileMcpInternalData>({
    display: {
        input: (_domain, internal) => ({
            isCopying: internal.isCopying,
            message: internal.message,
            error: internal.error,
        }),
        view: ProfileMcpView,
        onOutput: (_domain, internal, output: ProfileMcpViewOutput) => {
            if (output.type === "copy") {
                internal.isCopying = true;
                internal.message = null;
                internal.error = null;
                return "copy";
            }
        },
    },
    copy: {
        input: () => ({}),
        action: async (_input, domain, internal) => {
            try {
                const mcpUrl = await domain.backend.getMcpUrl();
                await domain.clipboard.writeText(mcpUrl);
                internal.message = "MCP URL copied.";
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to copy MCP URL";
            } finally {
                internal.isCopying = false;
            }
            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "display",
    },
}, {
    start: "display",
    createInternalData: () => ({ isCopying: false, message: null, error: null }),
});
