'use server'

import { fetchVocabularies } from "@/lib/serverBackedApiCalls";
import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";

export default async function fetchVocabulariesAction(): Promise<VocabularyResponse[] | null> {
    const response = await fetchVocabularies();

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
