"use server"
import { AxiosResponse } from "axios";
import { api } from "./apiClient";
import { ApiRequest } from "./types/requests/ApiRequest";
import { UserInfoRequest } from "./types/requests/UserInfoRequest";
import { UserInfoResponse } from "./types/responses/UserInfoResponse";
import { cookies } from "next/headers";
import { FlashCard } from "./types/responses/FlashCard";
import { FlashCardMode } from "./types/requests/FlashCardMode";
import { DeckView } from "./types/responses/DeckView";
import { Rating } from "./types/Rating";
import { CardRating } from "./types/requests/CardRating";
import { ScenarioResponse } from "./types/responses/ScenarioResponse";
import { CreateScenarioRequest } from "./types/requests/CreateScenarioRequest";
import { EditScenarioRequest } from "./types/requests/EditScenarioRequest";
import { GrammarRuleResponse } from "./types/responses/GrammarRuleResponse";
import { CreateGrammarRuleRequest } from "./types/requests/CreateGrammarRuleRequest";
import { EditGrammarRuleRequest } from "./types/requests/EditGrammarRuleRequest";
import { VocabularyResponse } from "./types/responses/VocabularyResponse";
import { AddVocabularyRequest } from "./types/requests/AddVocabularyRequest";
import { UpdateVocabularyRequest } from "./types/requests/UpdateVocabularyRequest";

export async function callRegisterUserApi(email: string, password: string): Promise<AxiosResponse<ApiResponse<UserInfoResponse>>> {

    const userInfo: UserInfoRequest = { username: email, password: password };
    const request: ApiRequest<UserInfoRequest> = { payload: userInfo };

    // Axios call (typed)
    const response = await api.post<ApiResponse<UserInfoResponse>>
        (`/api/v1/auth/user/register`, request);

    console.log(response);
    return response;

}

export async function registerUser(email: string, password: string) {

    console.log(email);
    const response = await callRegisterUserApi(email, password);
    return response;


}

export async function fetchNextFlashCardToStudy(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard>>> {

    // Axios call (typed)
    const response = await api.get<ApiResponse<FlashCard>>(`/api/decks/${deckId}/cards/next/v1`,
        {
            params: {
                userId: (await cookies()).get("userId")?.value
            }
        }
    );


    return response;

}

export async function fetchNextAudioCardToStudy(): Promise<AxiosResponse<ApiResponse<FlashCard>>> {

    // Axios call (typed)
    const response = await api.get<ApiResponse<FlashCard>>(`/api/exercise/audio-only/next/v1`,
        {
            params: {
                userId: (await cookies()).get("userId")?.value
            }
        }
    );


    return response;

}

export async function fetchNextFlashCardToRevise(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard>>> {

    // Axios call (typed)
    const response = await api.get<ApiResponse<FlashCard>>(`/api/decks/${deckId}/cards/revision/next/v1`,
        {
            params: {
                userId: (await cookies()).get("userId")?.value
            }
        }
    );


    return response;

}

export async function fetchFlashCardsList(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard[]>>> {

    // Axios call (typed)
    const response = await api.get<ApiResponse<FlashCard[]>>(`/api/decks/${deckId}/cards/next/v1`,
        {
            params: {
                userId: (await cookies()).get("userId")?.value
            }
        }
    );

    return response;

}

export async function fetchDecksList(mode: FlashCardMode): Promise<AxiosResponse<ApiResponse<DeckView[]>>> {


    // Axios call (typed)
    const response = await api.get<ApiResponse<DeckView[]>>("/api/decks/v1", {
        params: {
            mode: mode,
            userId: (await cookies()).get("userId")?.value
        }
    });

    return response;

}

export async function fetchRevisionList(mode: FlashCardMode): Promise<AxiosResponse<ApiResponse<DeckView[]>>> {


    // Axios call (typed)
    const response = await api.get<ApiResponse<DeckView[]>>("/api/decks/revision/v1", {
        params: {
            mode: mode,
            userId: (await cookies()).get("userId")?.value
        }
    });

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

export async function fetchScenarios(): Promise<AxiosResponse<ApiResponse<ScenarioResponse[]>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<ScenarioResponse[]>>("/api/v1/scenarios/v1", {
        params: { userId },
    });

    return response;
}

export async function fetchScenario(scenarioId: string): Promise<AxiosResponse<ApiResponse<ScenarioResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<ScenarioResponse>>(`/api/v1/scenarios/${scenarioId}/v1`, {
        params: { userId },
    });

    return response;
}

export async function createScenario(requestBody: CreateScenarioRequest): Promise<AxiosResponse<ApiResponse<ScenarioResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.post<ApiResponse<ScenarioResponse>>("/api/v1/scenarios/v1", requestBody, {
        params: { userId },
    });

    return response;
}

export async function editScenario(
    scenarioId: string,
    requestBody: EditScenarioRequest
): Promise<AxiosResponse<ApiResponse<ScenarioResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.put<ApiResponse<ScenarioResponse>>(`/api/v1/scenarios/${scenarioId}/v1`, requestBody, {
        params: { userId },
    });

    return response;
}

export async function fetchGrammarRules(): Promise<AxiosResponse<ApiResponse<GrammarRuleResponse[]>>> {
    const response = await api.get<ApiResponse<GrammarRuleResponse[]>>("/api/v1/grammar-rules/v1");
    return response;
}

export async function fetchGrammarRule(grammarRuleId: string): Promise<AxiosResponse<ApiResponse<GrammarRuleResponse>>> {
    const response = await api.get<ApiResponse<GrammarRuleResponse>>(`/api/v1/grammar-rules/${grammarRuleId}/v1`);
    return response;
}

export async function createGrammarRule(
    requestBody: CreateGrammarRuleRequest
): Promise<AxiosResponse<ApiResponse<GrammarRuleResponse>>> {
    const response = await api.post<ApiResponse<GrammarRuleResponse>>("/api/v1/grammar-rules/v1", requestBody);
    return response;
}

export async function editGrammarRule(
    grammarRuleId: string,
    requestBody: EditGrammarRuleRequest
): Promise<AxiosResponse<ApiResponse<GrammarRuleResponse>>> {
    const response = await api.put<ApiResponse<GrammarRuleResponse>>(`/api/v1/grammar-rules/${grammarRuleId}/v1`, requestBody);
    return response;
}

export async function fetchVocabularies(): Promise<AxiosResponse<ApiResponse<VocabularyResponse[]>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<VocabularyResponse[]>>("/api/v1/vocabularies/v1", {
        params: { userId },
    });

    return response;
}

export async function fetchVocabulary(vocabularyId: string): Promise<AxiosResponse<ApiResponse<VocabularyResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<VocabularyResponse>>(`/api/v1/vocabularies/${vocabularyId}/v1`, {
        params: { userId },
    });

    return response;
}

export async function addVocabulary(
    requestBody: AddVocabularyRequest
): Promise<AxiosResponse<ApiResponse<VocabularyResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.post<ApiResponse<VocabularyResponse>>("/api/v1/vocabularies/v1", requestBody, {
        params: { userId },
    });

    return response;
}

export async function updateVocabulary(
    vocabularyId: string,
    requestBody: UpdateVocabularyRequest
): Promise<AxiosResponse<ApiResponse<VocabularyResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.put<ApiResponse<VocabularyResponse>>(`/api/v1/vocabularies/${vocabularyId}/v1`, requestBody, {
        params: { userId },
    });

    return response;
}
