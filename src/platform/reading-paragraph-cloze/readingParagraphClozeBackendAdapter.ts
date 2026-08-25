"use server";

import { cookies } from "next/headers";
import { api } from "@/lib/apiClient";
import { ReadingParagraphClozeSession } from "@/flows/reading-paragraph-cloze/contracts";

type Envelope<T> = { response: T };
type GenerationRequestResponse = { message: string };

async function userId(): Promise<string> {
    const value = (await cookies()).get("userId")?.value;
    if (!value) throw new Error("Missing userId cookie");
    return value;
}

export async function listClozeSessions(): Promise<ReadingParagraphClozeSession[]> {
    const response = await api.get<Envelope<ReadingParagraphClozeSession[]>>(
        "/api/v1/reading-cloze-paragraph/sessions", { params: { userId: await userId() } });
    return response.data.response ?? [];
}

export async function getClozeSession(sessionId: string): Promise<ReadingParagraphClozeSession> {
    const response = await api.get<Envelope<ReadingParagraphClozeSession>>(
        `/api/v1/reading-cloze-paragraph/sessions/${sessionId}`, { params: { userId: await userId() } });
    if (!response.data.response) throw new Error("Cloze session was not found");
    return response.data.response;
}

export async function createClozeSession(limit: number): Promise<string> {
    const id = await userId();
    const response = await api.post<Envelope<GenerationRequestResponse>>(
        "/api/v1/reading-cloze-paragraph/sessions", { userId: id, limit });
    return response.data.response?.message ?? "Reading paragraph cloze generation requested. Run your MCP tool.";
}

export async function deleteClozeSession(sessionId: string): Promise<void> {
    await api.delete(`/api/v1/reading-cloze-paragraph/sessions/${sessionId}`, { params: { userId: await userId() } });
}
