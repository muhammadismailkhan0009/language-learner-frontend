'use server'

import { reviewAudioCard } from "@/lib/serverBackedApiCalls";
import { Rating } from "@/lib/types/Rating";

export default async function reviewAudioCardAction(cardId: string, rating: Rating): Promise<void> {
    try {
        const response = await reviewAudioCard(cardId, rating);
        if (response.status !== 200) {
            console.error(`reviewAudioCardAction: Unexpected status code ${response.status}`);
            throw new Error(`Failed to review audio card: ${response.status}`);
        }
    } catch (error: any) {
        console.error('reviewAudioCardAction error:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            url: error?.config?.url,
            baseURL: error?.config?.baseURL,
            fullUrl: error?.config?.baseURL + error?.config?.url,
            params: error?.config?.params,
            cardId,
            rating
        });
        throw error; // Re-throw to let the flow handle it
    }
}

