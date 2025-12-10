'use client'
import { AxiosResponse } from "axios";
import { api } from "./apiClient";
import { ApiRequest } from "./types/requests/ApiRequest";
import { LanguageScenario } from "./types/requests/LanguageScenario";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Rating } from "@/lib/types/Rating";
import { CardRating } from "@/lib/types/requests/CardRating";

export async function sendGenerateFlashCardsRequest(scenario: string): Promise<AxiosResponse<ApiResponse<void>>> {


    const requestBody: LanguageScenario = { scenario };
    const request: ApiRequest<LanguageScenario> = { payload: requestBody };

    // Axios call (typed)
    const response = await api.post<ApiResponse<void>>("/api/language/flashcards", request);

    console.log("Generated flashcards:", response.data);

    return response;

}




export async function fetchFlashCardsData(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard[]>>> {

    // Axios call (typed)
    const response = await api.get<ApiResponse<FlashCard[]>>(`/api/decks/${deckId}/flashcards/v1`);

    return response;

}



export async function reviewStudiedCard(deckId: string, cardId: string, rating: Rating): Promise<AxiosResponse<ApiResponse<void>>> {

    const cardRating: CardRating = { rating: rating };
    const request: ApiRequest<CardRating> = { payload: cardRating };

    // Axios call (typed)
    const response = await api.post<ApiResponse<void>>
        (`/api/decks/${deckId}/cards/${cardId}/review/v1`, request);

    return response;

}



