"use server";

import { createWritingPracticeSession } from "@/lib/serverBackedApiCalls";

export default async function createWritingPracticeSessionAction(): Promise<boolean> {
    const response = await createWritingPracticeSession();
    return response.status === 200;
}
