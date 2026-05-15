"use server";

import { rateReadingParagraphClozeCard } from "@/lib/serverBackedApiCalls";
import { Rating } from "@/lib/types/Rating";
import { ReadingParagraphClozeSessionResponse } from "@/lib/types/responses/ReadingParagraphClozeSessionResponse";

export default async function rateReadingParagraphClozeCardAction(
    sessionId: string,
    flashcardId: string,
    rating: Rating
): Promise<ReadingParagraphClozeSessionResponse | null> {
    const response = await rateReadingParagraphClozeCard(sessionId, flashcardId, rating);
    if (response.status === 200) {
        return response.data.response ?? null;
    }
    return null;
}
