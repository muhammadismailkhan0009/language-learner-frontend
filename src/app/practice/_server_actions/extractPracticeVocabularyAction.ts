"use server";

import { extractPracticeVocabulary } from "@/lib/serverBackedApiCalls";
import { ExtractPracticeVocabularyResponse } from "@/lib/types/responses/ExtractPracticeVocabularyResponse";

export default async function extractPracticeVocabularyAction(
    text: string
): Promise<ExtractPracticeVocabularyResponse | null> {
    const response = await extractPracticeVocabulary(text);
    if (response.status === 200) {
        return response.data.response;
    }
    return null;
}
