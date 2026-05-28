'use server'

import { generateGrammarRuleDraftDetails } from "@/lib/serverBackedApiCalls";
import { GenerateGrammarRuleDraftDetailsRequest } from "@/lib/types/requests/GenerateGrammarRuleDraftDetailsRequest";
import { GrammarRuleDraftDetailsResponse } from "@/lib/types/responses/GrammarRuleDraftDetailsResponse";

export default async function generateGrammarRuleDraftDetailsAction(
    draftId: string,
    requestBody: GenerateGrammarRuleDraftDetailsRequest
): Promise<GrammarRuleDraftDetailsResponse | null> {
    const response = await generateGrammarRuleDraftDetails(draftId, requestBody);

    if (response.status === 200 || response.status === 201) {
        return response.data.response;
    }

    return null;
}
