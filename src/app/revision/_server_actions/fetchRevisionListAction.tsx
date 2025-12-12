'use server'

import { fetchRevisionList } from "@/lib/serverBackedApiCalls";
import { FlashCardMode } from "@/lib/types/requests/FlashCardMode";
import { DeckView } from "@/lib/types/responses/DeckView";


export default async function fetchRevisionListAction(mode: FlashCardMode): Promise<DeckView[] | null> {

    const response = await fetchRevisionList(mode);

    if (response.status === 200) {
        return response.data.response;
    }
    return null;
}