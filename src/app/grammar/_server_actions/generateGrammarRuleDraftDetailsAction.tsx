'use server'

import { generateGrammarRuleDraftDetails } from "@/lib/serverBackedApiCalls";
import { GenerateGrammarRuleDraftDetailsRequest } from "@/lib/types/requests/GenerateGrammarRuleDraftDetailsRequest";
import { GrammarGenerationRequestResponse } from "@/lib/types/responses/GrammarGenerationRequestResponse";

export default async function generateGrammarRuleDraftDetailsAction(
    draftId: string,
    requestBody: GenerateGrammarRuleDraftDetailsRequest
): Promise<GrammarGenerationRequestResponse | null> {
    const response = await generateGrammarRuleDraftDetails(draftId, requestBody);

    if (response.status === 202) {
        return response.data.response;
    }

    return null;
}
