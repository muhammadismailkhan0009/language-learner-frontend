"use server";

import { getActiveStudySession } from "@/lib/serverBackedApiCalls";
import { StudySessionResponse } from "@/lib/types/responses/StudySessionResponse";

export default async function getActiveStudySessionAction(): Promise<StudySessionResponse | null> {
    try {
        const response = await getActiveStudySession();
        if (response.status === 200) {
            return response.data.response ?? null;
        }
        return null;
    } catch {
        return null;
    }
}

