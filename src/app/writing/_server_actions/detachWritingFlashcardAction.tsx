"use server";

import { detachWritingPracticeFlashcard } from "@/lib/serverBackedApiCalls";

export default async function detachWritingFlashcardAction(
    sessionId: string,
    scenarioId: string,
    flashcardId: string
): Promise<boolean> {
    const response = await detachWritingPracticeFlashcard(sessionId, scenarioId, flashcardId);
    return response.status === 204 || response.status === 200;
}
