"use server";

import { listReadingPracticeSessions } from "@/lib/serverBackedApiCalls";
import { ReadingPracticeSessionSummaryResponse } from "@/lib/types/responses/ReadingPracticeSessionSummaryResponse";

export default async function listReadingPracticeSessionsAction(): Promise<ReadingPracticeSessionSummaryResponse[]> {
    const response = await listReadingPracticeSessions();

    if (response.status === 200) {
        console.log(response.data.response);
        return response.data.response ?? [];
    }

    return [];
}
