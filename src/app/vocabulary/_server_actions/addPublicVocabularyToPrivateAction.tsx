'use server'

import { addPublicVocabularyToPrivate } from "@/lib/serverBackedApiCalls";
import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";

export default async function addPublicVocabularyToPrivateAction(
    publicVocabularyId: string
): Promise<VocabularyResponse | null> {
    const response = await addPublicVocabularyToPrivate(publicVocabularyId);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
