"use server";

import { submitStudyAnswer } from "@/lib/serverBackedApiCalls";
import { StudySessionResponse } from "@/lib/types/responses/StudySessionResponse";

export default async function submitStudyAnswerAction(
    sessionId: string,
    itemId: string,
    answer: string
): Promise<StudySessionResponse | null> {
    const response = await submitStudyAnswer(sessionId, itemId, answer);
    if (response.status === 200) {
        return response.data.response ?? null;
    }
    return null;
}

