'use server'

import { fetchScenarios } from "@/lib/serverBackedApiCalls";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";

export default async function fetchScenariosAction(): Promise<ScenarioResponse[] | null> {
    const response = await fetchScenarios();

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}

