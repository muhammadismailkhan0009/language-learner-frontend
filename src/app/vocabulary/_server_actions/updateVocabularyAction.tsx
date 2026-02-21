'use server'

import { updateVocabulary } from "@/lib/serverBackedApiCalls";
import { UpdateVocabularyRequest } from "@/lib/types/requests/UpdateVocabularyRequest";
import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";

export default async function updateVocabularyAction(
    vocabularyId: string,
    requestBody: UpdateVocabularyRequest
): Promise<VocabularyResponse | null> {
    const response = await updateVocabulary(vocabularyId, requestBody);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
