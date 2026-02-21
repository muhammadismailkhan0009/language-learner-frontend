'use server'

import { publishVocabulary } from "@/lib/serverBackedApiCalls";
import { PublishPublicVocabularyRequest } from "@/lib/types/requests/PublishPublicVocabularyRequest";
import { PublicVocabularyResponse } from "@/lib/types/responses/PublicVocabularyResponse";

export default async function publishVocabularyAction(
    vocabularyId: string,
    requestBody: PublishPublicVocabularyRequest
): Promise<PublicVocabularyResponse | null> {
    const response = await publishVocabulary(vocabularyId, requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
