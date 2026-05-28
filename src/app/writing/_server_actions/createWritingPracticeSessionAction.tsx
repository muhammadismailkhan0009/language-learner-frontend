"use server";

import { createWritingPracticeSession } from "@/lib/serverBackedApiCalls";

export default async function createWritingPracticeSessionAction(): Promise<string> {
    const response = await createWritingPracticeSession();
    return response.data.response;
}
