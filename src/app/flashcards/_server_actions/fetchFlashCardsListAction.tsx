'use server'

import { fetchFlashCardsList } from "@/lib/serverBackedApiCalls";
import { FlashCard } from "@/lib/types/responses/FlashCard";


export default async function fetchFlashCardsListAction(deckId: string): Promise<FlashCard[] | null> {

    const response = await fetchFlashCardsList(deckId);

    if (response.status === 200) {
        return response.data.response;
    }
    return null;
}



