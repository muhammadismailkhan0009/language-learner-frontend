"use server";

import { reEvaluateWritingFeedback } from "@/lib/serverBackedApiCalls";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";

export default async function reEvaluateWritingFeedbackAction(
    sessionId: string
): Promise<WritingPracticeSessionResponse | null> {
    const response = await reEvaluateWritingFeedback(sessionId);

    if (response.status === 200) {
        return response.data.response ?? null;
    }

    return null;
}
