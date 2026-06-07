"use server";

import { submitWritingPracticeAnswer } from "@/lib/serverBackedApiCalls";

export default async function submitWritingPracticeAnswerAction(
    sessionId: string,
    submittedAnswer: string,
    draft = false
): Promise<boolean> {
    const response = await submitWritingPracticeAnswer(sessionId, submittedAnswer, draft);
    return response.status === 200;
}
