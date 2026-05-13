'use server'

import { fetchSongVocabularies } from "@/lib/serverBackedApiCalls";
import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";

export default async function fetchSongVocabulariesAction(limit?: number): Promise<VocabularyResponse[] | null> {
    const response = await fetchSongVocabularies(limit);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
