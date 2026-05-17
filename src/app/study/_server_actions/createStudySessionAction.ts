"use server";

import { createStudySession } from "@/lib/serverBackedApiCalls";
import { StudySessionResponse } from "@/lib/types/responses/StudySessionResponse";

export default async function createStudySessionAction(limit: number): Promise<StudySessionResponse | null> {
    const response = await createStudySession(limit);
    if (response.status === 201 || response.status === 200) {
        return response.data.response ?? null;
    }
    return null;
}

