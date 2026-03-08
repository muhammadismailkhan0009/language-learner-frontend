"use server";

import { listWritingPracticeSessions } from "@/lib/serverBackedApiCalls";
import { WritingPracticeSessionSummaryResponse } from "@/lib/types/responses/WritingPracticeSessionSummaryResponse";

export default async function listWritingPracticeSessionsAction(): Promise<WritingPracticeSessionSummaryResponse[]> {
    const response = await listWritingPracticeSessions();

    if (response.status === 200) {
        return response.data.response ?? [];
    }

    return [];
}
