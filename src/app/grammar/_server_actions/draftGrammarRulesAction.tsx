'use server'

import { draftGrammarRules } from "@/lib/serverBackedApiCalls";
import { DraftGrammarRulesRequest } from "@/lib/types/requests/DraftGrammarRulesRequest";
import { GrammarGenerationRequestResponse } from "@/lib/types/responses/GrammarGenerationRequestResponse";

export default async function draftGrammarRulesAction(requestBody: DraftGrammarRulesRequest): Promise<GrammarGenerationRequestResponse | null> {
    const response = await draftGrammarRules(requestBody);

    if (response.status === 202) {
        return response.data.response;
    }

    return null;
}
