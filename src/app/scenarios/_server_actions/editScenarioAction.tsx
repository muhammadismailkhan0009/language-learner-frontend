'use server'

import { editScenario } from "@/lib/serverBackedApiCalls";
import { EditScenarioRequest } from "@/lib/types/requests/EditScenarioRequest";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";

export default async function editScenarioAction(
    scenarioId: string,
    requestBody: EditScenarioRequest
): Promise<ScenarioResponse | null> {
    const response = await editScenario(scenarioId, requestBody);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}

