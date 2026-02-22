'use client'
import { AxiosResponse } from "axios";
import { api } from "./apiClient";
import { ApiRequest } from "./types/requests/ApiRequest";
import { LanguageScenario } from "./types/requests/LanguageScenario";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import { Rating } from "@/lib/types/Rating";
import { CardRating } from "@/lib/types/requests/CardRating";
import { SentenceGroup } from "@/lib/types/responses/Sentence";
import { WordToListenToResponse } from "@/lib/types/responses/WordToListenToResponse";
import { WordToListenToRequest } from "@/lib/types/requests/WordToListenToRequest";
import { isVocabularyDeckId } from "./flashcards/flashcardApiUtils";

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

    const endpoint = isVocabularyDeckId(deckId)
        ? `/api/v1/vocabulary-flashcards/cards/${cardId}/review/v1`
        : `/api/decks/${deckId}/cards/${cardId}/review/v1`;

    const response = await api.post<ApiResponse<void>>(endpoint, request);

    return response;

}


export async function reviewAudioCard(cardId: string, rating: Rating): Promise<AxiosResponse<ApiResponse<void>>> {

    const cardRating: CardRating = { rating: rating };
    const request: ApiRequest<CardRating> = { payload: cardRating };

    // Axios call (typed)
    const response = await api.post<ApiResponse<void>>
        (`/api/exercise/audio-only/${cardId}/review/v1`, request);

    return response;

}


export async function fetchSentences(): Promise<AxiosResponse<ApiResponse<SentenceGroup[]>>> {

    // Axios call (typed)
    const response = await api.get<ApiResponse<SentenceGroup[]>>("/api/v1/sentences/v1");

    return response;

}

export async function fetchWordsToListenTo(): Promise<AxiosResponse<ApiResponse<WordToListenToResponse[]>>> {
    const response = await api.get<ApiResponse<WordToListenToResponse[]>>("/api/v1/listening/v1");
    return response;
}

export async function saveWordToListenTo(word: string): Promise<AxiosResponse<void>> {
    const requestBody: WordToListenToRequest = { word };
    const response = await api.post<void>("/api/v1/listening/v1", requestBody);
    return response;
}
