'use server'

import { reassignGrammarLevels } from "@/lib/serverBackedApiCalls";
import { GrammarGenerationRequestResponse } from "@/lib/types/responses/GrammarGenerationRequestResponse";

export default async function reassignGrammarLevelsAction(): Promise<GrammarGenerationRequestResponse | null> {
    const response = await reassignGrammarLevels();

    if (response.status === 202) {
        return response.data.response;
    }

    return null;
}
