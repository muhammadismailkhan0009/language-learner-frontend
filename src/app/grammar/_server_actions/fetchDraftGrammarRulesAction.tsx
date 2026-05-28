'use server'

import { fetchDraftGrammarRules } from "@/lib/serverBackedApiCalls";
import { GrammarRuleDraftResponse } from "@/lib/types/responses/GrammarRuleDraftResponse";

export default async function fetchDraftGrammarRulesAction(adminKey: string): Promise<GrammarRuleDraftResponse[] | null> {
    const response = await fetchDraftGrammarRules(adminKey);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
