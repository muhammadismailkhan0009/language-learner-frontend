'use server'

import { fetchNextAudioCardToStudy } from "@/lib/serverBackedApiCalls";
import { FlashCard } from "@/lib/types/responses/FlashCard";


export default async function fetchNextAudioCardAction(): Promise<FlashCard | null> {

    const response = await fetchNextAudioCardToStudy();

    if (response.status === 200) {
        return response.data.response;
    }
    return null;
}