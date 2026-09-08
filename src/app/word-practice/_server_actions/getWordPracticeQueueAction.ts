"use server";

import { getWordPracticeQueue } from "@/lib/serverBackedApiCalls";
import { WordPracticeQueueResponse } from "@/lib/types/responses/WordPracticeQueueResponse";

export default async function getWordPracticeQueueAction(): Promise<WordPracticeQueueResponse> {
    const response = await getWordPracticeQueue();
    return response.data.response;
}
