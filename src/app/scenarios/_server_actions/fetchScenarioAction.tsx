'use server'

import { fetchScenario } from "@/lib/serverBackedApiCalls";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";

export default async function fetchScenarioAction(scenarioId: string): Promise<ScenarioResponse | null> {
    const response = await fetchScenario(scenarioId);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}

