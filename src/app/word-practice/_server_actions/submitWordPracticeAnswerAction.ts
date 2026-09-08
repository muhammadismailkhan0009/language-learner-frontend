"use server";

import { submitWordPracticeAnswer } from "@/lib/serverBackedApiCalls";

export default async function submitWordPracticeAnswerAction(practiceId: string, answer: string): Promise<boolean> {
    const response = await submitWordPracticeAnswer(practiceId, answer);
    return response.data.response;
}
