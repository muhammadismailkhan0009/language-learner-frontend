'use server'

import { draftGrammarRules } from "@/lib/serverBackedApiCalls";
import { DraftGrammarRulesRequest } from "@/lib/types/requests/DraftGrammarRulesRequest";
import { GrammarRuleDraftResponse } from "@/lib/types/responses/GrammarRuleDraftResponse";

export default async function draftGrammarRulesAction(requestBody: DraftGrammarRulesRequest): Promise<GrammarRuleDraftResponse[] | null> {
    const response = await draftGrammarRules(requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
