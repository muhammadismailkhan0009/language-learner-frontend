"use server";

import { fetchNextFlashCardToRevise } from "@/lib/serverBackedApiCalls";
import { FlashCard } from "@/lib/types/responses/FlashCard";

export default async function fetchNextRevisionCardAction(deckId: string): Promise<FlashCard | null> {
    const response = await fetchNextFlashCardToRevise(deckId);
    if (response.status === 200) {
        return response.data.response ?? null;
    }
    return null;
}
