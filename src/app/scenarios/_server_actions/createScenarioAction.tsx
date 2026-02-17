'use server'

import { createScenario } from "@/lib/serverBackedApiCalls";
import { CreateScenarioRequest } from "@/lib/types/requests/CreateScenarioRequest";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";

export default async function createScenarioAction(requestBody: CreateScenarioRequest): Promise<ScenarioResponse | null> {
    const response = await createScenario(requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
