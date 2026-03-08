"use server";

import { reviewVocabularyFlashcard } from "@/lib/serverBackedApiCalls";
import { Rating } from "@/lib/types/Rating";

export default async function reviewWritingFlashcardAction(cardId: string, rating: Rating): Promise<boolean> {
    const response = await reviewVocabularyFlashcard(cardId, rating);
    return response.status === 200;
}
