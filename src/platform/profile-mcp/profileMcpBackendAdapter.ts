"use server";

import { fetchMcpUrl } from "@/lib/serverBackedApiCalls";

export async function getProfileMcpUrl(): Promise<string> {
    const response = await fetchMcpUrl();
    if (response.status !== 200 || !response.data.response.mcpUrl) {
        throw new Error("Failed to create MCP URL");
    }
    return response.data.response.mcpUrl;
}
