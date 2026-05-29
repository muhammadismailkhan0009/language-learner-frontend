'use server'

import { deleteGrammarRuleExplanation } from "@/lib/serverBackedApiCalls";
import { DeleteGrammarRuleExplanationRequest } from "@/lib/types/requests/DeleteGrammarRuleExplanationRequest";
import { GrammarRuleResponse } from "@/lib/types/responses/GrammarRuleResponse";

export default async function deleteGrammarRuleExplanationAction(
    grammarRuleId: string,
    requestBody: DeleteGrammarRuleExplanationRequest
): Promise<GrammarRuleResponse | null> {
    const response = await deleteGrammarRuleExplanation(grammarRuleId, requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
