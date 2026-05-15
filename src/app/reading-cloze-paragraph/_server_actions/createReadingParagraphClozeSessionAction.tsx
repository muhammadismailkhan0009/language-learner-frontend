"use server";

import { createReadingParagraphClozeSession } from "@/lib/serverBackedApiCalls";
import { ReadingParagraphClozeSessionResponse } from "@/lib/types/responses/ReadingParagraphClozeSessionResponse";

export default async function createReadingParagraphClozeSessionAction(limit: number): Promise<ReadingParagraphClozeSessionResponse | null> {
    const response = await createReadingParagraphClozeSession(limit);
    if (response.status === 201 || response.status === 200) {
        return response.data.response ?? null;
    }
    return null;
}
