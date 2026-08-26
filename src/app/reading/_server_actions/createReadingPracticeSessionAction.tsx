"use server";

import { createReadingPracticeSession } from "@/lib/serverBackedApiCalls";

export default async function createReadingPracticeSessionAction(): Promise<string> {
    const response = await createReadingPracticeSession();
    if (response.status !== 202 || !response.data.response?.message) {
        throw new Error("Failed to request reading exercise generation");
    }
    return response.data.response.message;
}
