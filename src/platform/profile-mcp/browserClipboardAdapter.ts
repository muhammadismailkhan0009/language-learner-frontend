"use client";

import { ClipboardPort } from "@/flows/profile-mcp/ports/ClipboardPort";

export const browserClipboardAdapter: ClipboardPort = {
    async writeText(value: string) {
        if (!navigator.clipboard) {
            throw new Error("Clipboard is unavailable");
        }
        await navigator.clipboard.writeText(value);
    },
};
