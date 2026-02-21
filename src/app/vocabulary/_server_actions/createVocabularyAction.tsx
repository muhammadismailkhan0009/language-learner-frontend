'use server'

import { addVocabulary } from "@/lib/serverBackedApiCalls";
import { AddVocabularyRequest } from "@/lib/types/requests/AddVocabularyRequest";
import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";

export default async function createVocabularyAction(requestBody: AddVocabularyRequest): Promise<VocabularyResponse | null> {
    const response = await addVocabulary(requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
