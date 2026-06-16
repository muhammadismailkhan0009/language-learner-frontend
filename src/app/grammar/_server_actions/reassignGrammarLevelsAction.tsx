'use server'

import { reassignGrammarLevels } from "@/lib/serverBackedApiCalls";
import { GrammarLevelReassignmentSummaryResponse } from "@/lib/types/responses/GrammarLevelReassignmentSummaryResponse";

export default async function reassignGrammarLevelsAction(): Promise<GrammarLevelReassignmentSummaryResponse | null> {
    const response = await reassignGrammarLevels();

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
