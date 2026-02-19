'use server'

import { fetchGrammarRule } from "@/lib/serverBackedApiCalls";
import { GrammarRuleResponse } from "@/lib/types/responses/GrammarRuleResponse";

export default async function fetchGrammarRuleAction(grammarRuleId: string): Promise<GrammarRuleResponse | null> {
    const response = await fetchGrammarRule(grammarRuleId);

    if (response.status === 200) {
        console.log(response.data.response);
        return response.data.response;
    }

    return null;
}
