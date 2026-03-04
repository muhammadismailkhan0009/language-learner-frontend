"use server";

import { getReadingPracticeSession } from "@/lib/serverBackedApiCalls";
import { ReadingPracticeSessionResponse } from "@/lib/types/responses/ReadingPracticeSessionResponse";

export default async function getReadingPracticeSessionAction(
    sessionId: string
): Promise<ReadingPracticeSessionResponse | null> {
    const response = await getReadingPracticeSession(sessionId);

    if (response.status === 200) {
        return response.data.response ?? null;
    }

    return null;
}
