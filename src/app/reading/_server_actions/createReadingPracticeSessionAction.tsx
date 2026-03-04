"use server";

import { createReadingPracticeSession } from "@/lib/serverBackedApiCalls";

export default async function createReadingPracticeSessionAction(): Promise<boolean> {
    const response = await createReadingPracticeSession();
    return response.status === 200;
}
