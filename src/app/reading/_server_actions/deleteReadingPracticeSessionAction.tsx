"use server";

import { deleteReadingPracticeSession } from "@/lib/serverBackedApiCalls";

export default async function deleteReadingPracticeSessionAction(sessionId: string): Promise<boolean> {
    const response = await deleteReadingPracticeSession(sessionId);
    return response.status === 200;
}
