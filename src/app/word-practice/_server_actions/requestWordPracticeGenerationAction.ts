"use server";

import { requestWordPracticeGeneration } from "@/lib/serverBackedApiCalls";

export default async function requestWordPracticeGenerationAction(): Promise<string> {
    const response = await requestWordPracticeGeneration();
    return response.data.response;
}
