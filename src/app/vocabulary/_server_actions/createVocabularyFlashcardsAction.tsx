"use server";

import { createVocabularyFlashcards } from "@/lib/serverBackedApiCalls";

export default async function createVocabularyFlashcardsAction(vocabularyId: string): Promise<boolean> {
    const response = await createVocabularyFlashcards(vocabularyId);
    return response.status === 200 || response.status === 201 || response.status === 202;
}
