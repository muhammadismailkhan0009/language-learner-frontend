"use server";

import { detachReadingPracticeFlashcard } from "@/lib/serverBackedApiCalls";

export default async function detachReadingFlashcardAction(
    sessionId: string,
    flashcardId: string
): Promise<boolean> {
    const response = await detachReadingPracticeFlashcard(sessionId, flashcardId);
    return response.status === 204 || response.status === 200;
}
