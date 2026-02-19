'use server'

import { editGrammarRule } from "@/lib/serverBackedApiCalls";
import { EditGrammarRuleRequest } from "@/lib/types/requests/EditGrammarRuleRequest";
import { GrammarRuleResponse } from "@/lib/types/responses/GrammarRuleResponse";

export default async function editGrammarRuleAction(
    grammarRuleId: string,
    requestBody: EditGrammarRuleRequest
): Promise<GrammarRuleResponse | null> {
    const response = await editGrammarRule(grammarRuleId, requestBody);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
