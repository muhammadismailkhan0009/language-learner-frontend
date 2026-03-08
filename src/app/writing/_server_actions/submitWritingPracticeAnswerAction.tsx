"use server";

import { submitWritingPracticeAnswer } from "@/lib/serverBackedApiCalls";

export default async function submitWritingPracticeAnswerAction(
    sessionId: string,
    submittedAnswer: string
): Promise<boolean> {
    const response = await submitWritingPracticeAnswer(sessionId, submittedAnswer);
    return response.status === 200;
}
