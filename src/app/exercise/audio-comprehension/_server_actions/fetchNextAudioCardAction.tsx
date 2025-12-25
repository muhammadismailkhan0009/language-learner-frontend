'use server'

import { fetchNextAudioCardToStudy } from "@/lib/serverBackedApiCalls";
import { FlashCard } from "@/lib/types/responses/FlashCard";


export default async function fetchNextAudioCardAction(): Promise<FlashCard | null> {
    try {
        const response = await fetchNextAudioCardToStudy();

        if (response.status === 200) {
            return response.data.response;
        }
        
        console.error(`fetchNextAudioCardAction: Unexpected status code ${response.status}`);
        return null;
    } catch (error: any) {
        console.error('fetchNextAudioCardAction error:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            url: error?.config?.url,
            baseURL: error?.config?.baseURL,
            fullUrl: error?.config?.baseURL + error?.config?.url,
            params: error?.config?.params
        });
        return null;
    }
}