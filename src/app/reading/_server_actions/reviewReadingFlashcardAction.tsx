"use server";

import { reviewReadingVocabularyFlashcard } from "@/lib/serverBackedApiCalls";
import { Rating } from "@/lib/types/Rating";

export default async function reviewReadingFlashcardAction(
    scenarioId: string,
    cardId: string,
    rating: Rating,
): Promise<boolean> {
    const response = await reviewReadingVocabularyFlashcard(scenarioId, cardId, rating);
    return response.status === 200;
}
