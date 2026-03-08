"use server";

import { deleteWritingPracticeSession } from "@/lib/serverBackedApiCalls";

export default async function deleteWritingPracticeSessionAction(sessionId: string): Promise<boolean> {
    const response = await deleteWritingPracticeSession(sessionId);
    return response.status === 200 || response.status ===204;
}
