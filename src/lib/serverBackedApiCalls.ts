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
import { PublicVocabularyResponse } from "./types/responses/PublicVocabularyResponse";
import { PublishPublicVocabularyRequest } from "./types/requests/PublishPublicVocabularyRequest";
import { isRevisionDeckId, isVocabularyDeckId } from "./flashcards/flashcardApiUtils";
import { CreateReadingPracticeSessionRequest } from "./types/requests/CreateReadingPracticeSessionRequest";
import { CreateWritingPracticeSessionRequest } from "./types/requests/CreateWritingPracticeSessionRequest";
import { SubmitWritingPracticeAnswerRequest } from "./types/requests/SubmitWritingPracticeAnswerRequest";
import { ReadingPracticeSessionSummaryResponse } from "./types/responses/ReadingPracticeSessionSummaryResponse";
import { ReadingPracticeSessionResponse } from "./types/responses/ReadingPracticeSessionResponse";
import { WritingPracticeSessionSummaryResponse } from "./types/responses/WritingPracticeSessionSummaryResponse";
import { WritingPracticeSessionResponse } from "./types/responses/WritingPracticeSessionResponse";
import { GenerateVocabularyClozeSentencesResponse } from "./types/responses/GenerateVocabularyClozeSentencesResponse";
import { VocabularyFlashCardView } from "./types/responses/VocabularyFlashCardView";

const VOCABULARY_REVISION_BATCH_SIZE = 1;

function mapVocabularyFlashCardViewToFlashCard(card: VocabularyFlashCardView): FlashCard {
    return {
        id: card.id,
        front: {
            clozeText: card.front.clozeText,
            hint: card.front.hint,
            wordOrChunk: card.front.clozeText,
        },
        back: {
            answerWords: card.back.answerWords,
            answerText: card.back.answerText,
            answerTranslation: card.back.answerTranslation,
            notes: card.back.notes,
            wordOrChunk: card.back.answerText,
        },
        isReversed: card.isReversed,
        isRevision: card.isRevision,
        note: card.back.notes,
    };
}

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

export async function fetchNextFlashCardToStudy(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard | null>>> {

    const userId = (await cookies()).get("userId")?.value;
    const response = isVocabularyDeckId(deckId)
        ? await api.get<ApiResponse<VocabularyFlashCardView[]>>(`/api/v1/vocabulary-flashcards/cards/next/v1`, {
            params: { userId },
        })
        : await api.get<ApiResponse<FlashCard>>(`/api/decks/${deckId}/cards/next/v1`, {
            params: { userId },
        });

    if (isVocabularyDeckId(deckId)) {
        const data = (response.data.response as VocabularyFlashCardView[]).map(mapVocabularyFlashCardViewToFlashCard);
        return {
            ...(response as AxiosResponse<ApiResponse<VocabularyFlashCardView[]>>),
            data: {
                ...response.data,
                response: data[0] ?? null,
            },
        } as AxiosResponse<ApiResponse<FlashCard | null>>;
    }

    return response as AxiosResponse<ApiResponse<FlashCard | null>>;

}

export async function fetchNextAudioCardToStudy(): Promise<AxiosResponse<ApiResponse<FlashCard | null>>> {

    const response = await api.get<ApiResponse<FlashCard>>(`/api/exercise/audio-only/next/v1`,
        {
            params: {
                userId: (await cookies()).get("userId")?.value
            }
        }
    );

    return response as AxiosResponse<ApiResponse<FlashCard | null>>;

}

export async function fetchNextFlashCardToRevise(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard | null>>> {

    const userId = (await cookies()).get("userId")?.value;
    if (isVocabularyDeckId(deckId)) {
        const response = await api.get<ApiResponse<VocabularyFlashCardView | null>>(
            `/api/v1/vocabulary-flashcards/cards/revision/next/v1`,
            {
                params: { userId },
            }
        );

        return {
            ...(response as AxiosResponse<ApiResponse<VocabularyFlashCardView | null>>),
            data: {
                ...response.data,
                response: response.data.response ? mapVocabularyFlashCardViewToFlashCard(response.data.response) : null,
            },
        } as AxiosResponse<ApiResponse<FlashCard | null>>;
    }

    const response = await api.get<ApiResponse<FlashCard>>(`/api/decks/${deckId}/cards/revision/next/v1`, {
            params: { userId },
    });

    return response as AxiosResponse<ApiResponse<FlashCard | null>>;

}

export async function fetchFlashCardsList(deckId: string): Promise<AxiosResponse<ApiResponse<FlashCard[]>>> {

    const userId = (await cookies()).get("userId")?.value;
    const isRevision = isRevisionDeckId(deckId);

    if (isVocabularyDeckId(deckId)) {
        const response = isRevision
            ? await api.get<ApiResponse<VocabularyFlashCardView[]>>(`/api/v1/vocabulary-flashcards/cards/revision/v1`, {
                params: { userId, count: VOCABULARY_REVISION_BATCH_SIZE },
            })
            : await api.get<ApiResponse<VocabularyFlashCardView[]>>(`/api/v1/vocabulary-flashcards/cards/next/v1`, {
                params: { userId },
            });

        return {
            ...(response as AxiosResponse<ApiResponse<VocabularyFlashCardView[]>>),
            data: {
                ...response.data,
                response: (response.data.response as VocabularyFlashCardView[]).map(mapVocabularyFlashCardViewToFlashCard),
            },
        } as AxiosResponse<ApiResponse<FlashCard[]>>;
    }

    if (isRevision) {
        const response = await api.get<ApiResponse<FlashCard>>(`/api/decks/${deckId}/cards/revision/next/v1`, {
            params: { userId },
        });

        return {
            ...(response as AxiosResponse<ApiResponse<FlashCard>>),
            data: {
                ...response.data,
                response: response.data.response ? [response.data.response] : [],
            },
        } as AxiosResponse<ApiResponse<FlashCard[]>>;
    }

    const response = await api.get<ApiResponse<FlashCard[]>>(`/api/decks/${deckId}/cards/next/v1`, {
        params: { userId },
    });

    return response as AxiosResponse<ApiResponse<FlashCard[]>>;

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

export async function reviewVocabularyFlashcard(cardId: string, rating: Rating): Promise<AxiosResponse<ApiResponse<void>>> {
    const cardRating: CardRating = { rating };
    const request: ApiRequest<CardRating> = { payload: cardRating };

    const response = await api.post<ApiResponse<void>>(`/api/v1/vocabulary-flashcards/cards/${cardId}/review/v1`, request);
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

export async function createVocabularyFlashcards(
    vocabularyId: string
): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.post<void>(`/api/v1/vocabularies/${vocabularyId}/flashcards/v1`, undefined, {
        params: { userId },
    });

    return response;
}

export async function generateVocabularyClozeSentences(
): Promise<AxiosResponse<ApiResponse<GenerateVocabularyClozeSentencesResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.post<ApiResponse<GenerateVocabularyClozeSentencesResponse>>(
        "/api/v1/vocabularies/cloze-sentences/v1",
        undefined,
        {
            params: { userId },
        }
    );

    return response;
}

export async function fetchPublicVocabularies(): Promise<AxiosResponse<ApiResponse<PublicVocabularyResponse[]>>> {
    const response = await api.get<ApiResponse<PublicVocabularyResponse[]>>("/api/v1/public-vocabularies/v1");
    return response;
}

export async function publishVocabulary(
    vocabularyId: string,
    requestBody: PublishPublicVocabularyRequest
): Promise<AxiosResponse<ApiResponse<PublicVocabularyResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.post<ApiResponse<PublicVocabularyResponse>>(`/api/v1/public-vocabularies/${vocabularyId}/v1`, requestBody, {
        params: { userId },
    });

    return response;
}

export async function addPublicVocabularyToPrivate(
    publicVocabularyId: string
): Promise<AxiosResponse<ApiResponse<VocabularyResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.post<ApiResponse<VocabularyResponse>>(
        `/api/v1/public-vocabularies/${publicVocabularyId}/private/v1`,
        undefined,
        { params: { userId } }
    );

    return response;
}

export async function listReadingPracticeSessions(): Promise<AxiosResponse<ApiResponse<ReadingPracticeSessionSummaryResponse[]>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<ReadingPracticeSessionSummaryResponse[]>>("/api/v1/reading-practice/sessions", {
        params: { userId },
    });

    return response;
}

export async function createReadingPracticeSession(): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const requestBody: CreateReadingPracticeSessionRequest = { userId };

    const response = await api.post<void>("/api/v1/reading-practice/sessions", requestBody);
    return response;
}

export async function getReadingPracticeSession(
    sessionId: string
): Promise<AxiosResponse<ApiResponse<ReadingPracticeSessionResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<ReadingPracticeSessionResponse>>(`/api/v1/reading-practice/sessions/${sessionId}`, {
        params: { userId },
    });
    return response;
}

export async function deleteReadingPracticeSession(sessionId: string): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.delete<void>(`/api/v1/reading-practice/sessions/${sessionId}`, {
        params: { userId },
    });
    return response;
}

export async function detachReadingPracticeFlashcard(
    sessionId: string,
    flashcardId: string
): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.delete<void>(`/api/v1/reading-practice/sessions/${sessionId}/flashcards/${flashcardId}`, {
        params: { userId },
    });
    return response;
}

export async function listWritingPracticeSessions(): Promise<AxiosResponse<ApiResponse<WritingPracticeSessionSummaryResponse[]>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<WritingPracticeSessionSummaryResponse[]>>("/api/v1/writing-practice/sessions", {
        params: { userId },
    });

    return response;
}

export async function createWritingPracticeSession(): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const requestBody: CreateWritingPracticeSessionRequest = { userId };

    const response = await api.post<void>("/api/v1/writing-practice/sessions", requestBody);
    return response;
}

export async function getWritingPracticeSession(
    sessionId: string
): Promise<AxiosResponse<ApiResponse<WritingPracticeSessionResponse>>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.get<ApiResponse<WritingPracticeSessionResponse>>(`/api/v1/writing-practice/sessions/${sessionId}`, {
        params: { userId },
    });
    return response;
}

export async function submitWritingPracticeAnswer(
    sessionId: string,
    submittedAnswer: string
): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const requestBody: SubmitWritingPracticeAnswerRequest = {
        userId,
        submittedAnswer,
    };

    const response = await api.post<void>(`/api/v1/writing-practice/sessions/${sessionId}/submission`, requestBody);
    return response;
}

export async function deleteWritingPracticeSession(sessionId: string): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.delete<void>(`/api/v1/writing-practice/sessions/${sessionId}`, {
        params: { userId },
    });
    return response;
}

export async function detachWritingPracticeFlashcard(
    sessionId: string,
    flashcardId: string
): Promise<AxiosResponse<void>> {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) {
        throw new Error("Missing userId cookie");
    }

    const response = await api.delete<void>(`/api/v1/writing-practice/sessions/${sessionId}/flashcards/${flashcardId}`, {
        params: { userId },
    });
    return response;
}
