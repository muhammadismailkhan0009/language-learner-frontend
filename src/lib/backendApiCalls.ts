import { AxiosResponse } from "axios";
import { api } from "./apiClient";
import { ApiRequest } from "./types/requests/ApiRequest";
import { LanguageScenario } from "./types/requests/LanguageScenario";
import { FlashCardMode } from "./types/requests/FlashCardMode";
import { DeckView } from "./types/responses/DeckView";

export async function sendGenerateFlashCardsRequest(scenario: string) : Promise<AxiosResponse<ApiResponse<void>>>{


    const requestBody: LanguageScenario={scenario};
    const request: ApiRequest<LanguageScenario>={payload: requestBody};

    // Axios call (typed)
  const response = await api.post<ApiResponse<void>>("/api/language/flashcards", request);

  console.log("Generated flashcards:", response.data);

  return response;

}


export async function fetchDecksList(mode: FlashCardMode) : Promise<AxiosResponse<ApiResponse<DeckView[]>>>{


  // Axios call (typed)
  const response = await api.get<ApiResponse<DeckView[]>>("/api/decks/v1",{
    params:{
      mode: mode
    }
  });

  return response;

}
export async function fetchFlashCardsData(mode: FlashCardMode) : Promise<AxiosResponse<ApiResponse<DeckView[]>>>{


    // Axios call (typed)
  const response = await api.get<ApiResponse<DeckView[]>>("/api/flashcards",{
    params:{
      mode: mode
    }
  });

  return response;

}