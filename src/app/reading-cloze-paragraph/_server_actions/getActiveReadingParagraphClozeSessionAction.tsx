"use server";

import { getActiveReadingParagraphClozeSession } from "@/lib/serverBackedApiCalls";
import { ReadingParagraphClozeSessionResponse } from "@/lib/types/responses/ReadingParagraphClozeSessionResponse";

export default async function getActiveReadingParagraphClozeSessionAction(): Promise<ReadingParagraphClozeSessionResponse | null> {
    try {
        const response = await getActiveReadingParagraphClozeSession();
        if (response.status === 200) {
            return response.data.response ?? null;
        }
        return null;
    } catch {
        return null;
    }
}
