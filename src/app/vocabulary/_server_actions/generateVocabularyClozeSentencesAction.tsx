'use server'

import { generateVocabularyClozeSentences } from "@/lib/serverBackedApiCalls";
import { GenerateVocabularyClozeSentencesResponse } from "@/lib/types/responses/GenerateVocabularyClozeSentencesResponse";

export default async function generateVocabularyClozeSentencesAction(): Promise<GenerateVocabularyClozeSentencesResponse | null> {
    const response = await generateVocabularyClozeSentences();

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
