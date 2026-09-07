"use server";

import { submitWritingPracticeAnswer } from "@/lib/serverBackedApiCalls";

export default async function submitWritingPracticeAnswerAction(
    sessionId: string,
    scenarioId: string,
    submittedAnswer: string,
    freeWritingText: string,
    draft = false
): Promise<boolean> {
    const response = await submitWritingPracticeAnswer(
        sessionId, scenarioId, submittedAnswer, freeWritingText, draft);
    return response.status === 200;
}
