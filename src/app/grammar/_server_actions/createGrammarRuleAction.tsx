'use server'

import { createGrammarRule } from "@/lib/serverBackedApiCalls";
import { CreateGrammarRuleRequest } from "@/lib/types/requests/CreateGrammarRuleRequest";
import { GrammarRuleResponse } from "@/lib/types/responses/GrammarRuleResponse";

export default async function createGrammarRuleAction(requestBody: CreateGrammarRuleRequest): Promise<GrammarRuleResponse | null> {
    const response = await createGrammarRule(requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
