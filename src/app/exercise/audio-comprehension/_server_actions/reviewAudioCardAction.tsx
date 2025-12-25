'use server'

import { reviewAudioCard } from "@/lib/serverBackedApiCalls";
import { Rating } from "@/lib/types/Rating";

export default async function reviewAudioCardAction(cardId: string, rating: Rating): Promise<void> {
    const response = await reviewAudioCard(cardId, rating);
    if (response.status !== 200) {
        throw new Error(`Failed to review audio card: ${response.status}`);
    }
}

