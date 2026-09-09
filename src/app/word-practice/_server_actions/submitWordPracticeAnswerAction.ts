"use server";

import { submitWordPracticeAnswer } from "@/lib/serverBackedApiCalls";
import { SubmitWordPracticeAnswerResponse } from "@/lib/types/responses/SubmitWordPracticeAnswerResponse";

export default async function submitWordPracticeAnswerAction(practiceId: string, answer: string): Promise<SubmitWordPracticeAnswerResponse> {
    const response = await submitWordPracticeAnswer(practiceId, answer);
    return response.data.response;
}
