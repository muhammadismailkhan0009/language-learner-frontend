'use server'

import { fetchGrammarRules } from "@/lib/serverBackedApiCalls";
import { GrammarRuleResponse } from "@/lib/types/responses/GrammarRuleResponse";

export default async function fetchGrammarRulesAction(): Promise<GrammarRuleResponse[] | null> {
    const response = await fetchGrammarRules();

    if (response.status === 200) {
        console.log(response.data.response);
        return response.data.response;
    }

    return null;
}
