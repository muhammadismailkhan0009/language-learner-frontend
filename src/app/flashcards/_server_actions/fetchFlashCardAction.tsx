'use server'

import { fetchNextFlashCardToStudy } from "@/lib/serverBackedApiCalls";
import { FlashCard } from "@/lib/types/responses/FlashCard";


export default async function fetchFlashCardsAction(deckId: string): Promise<FlashCard | null> {

    const response = await fetchNextFlashCardToStudy(deckId);

    if (response.status === 200) {
        return response.data.response;
    }
    return null;
}