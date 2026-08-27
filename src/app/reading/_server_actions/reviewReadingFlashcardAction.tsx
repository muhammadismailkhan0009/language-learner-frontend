"use server";

import { reviewReadingVocabularyFlashcard } from "@/lib/serverBackedApiCalls";
import { Rating } from "@/lib/types/Rating";

export default async function reviewReadingFlashcardAction(
    cardId: string,
    rating: Rating,
): Promise<boolean> {
    const response = await reviewReadingVocabularyFlashcard(cardId, rating);
    return response.status === 200;
}
