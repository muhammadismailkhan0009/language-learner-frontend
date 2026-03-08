"use server";

import { getWritingPracticeSession } from "@/lib/serverBackedApiCalls";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";

export default async function getWritingPracticeSessionAction(
    sessionId: string
): Promise<WritingPracticeSessionResponse | null> {
    const response = await getWritingPracticeSession(sessionId);

    if (response.status === 200) {
        return response.data.response ?? null;
    }

    return null;
}
