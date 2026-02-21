'use server'

import { fetchPublicVocabularies } from "@/lib/serverBackedApiCalls";
import { PublicVocabularyResponse } from "@/lib/types/responses/PublicVocabularyResponse";

export default async function fetchPublicVocabulariesAction(): Promise<PublicVocabularyResponse[] | null> {
    const response = await fetchPublicVocabularies();

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
