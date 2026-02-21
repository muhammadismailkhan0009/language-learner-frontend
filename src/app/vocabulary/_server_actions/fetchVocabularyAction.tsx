'use server'

import { fetchVocabulary } from "@/lib/serverBackedApiCalls";
import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";

export default async function fetchVocabularyAction(vocabularyId: string): Promise<VocabularyResponse | null> {
    const response = await fetchVocabulary(vocabularyId);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
