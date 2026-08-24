"use client";

import { ReadingParagraphClozeView } from "@/features/reading-paragraph-cloze/ReadingParagraphClozeView";
import { useReadingParagraphClozeFlow } from "@/flows/reading-paragraph-cloze/useReadingParagraphClozeFlow";
import { ReadingParagraphClozeBackendPort } from "@/flows/reading-paragraph-cloze/ports/ReadingParagraphClozeBackendPort";
import { createClozeSession, deleteClozeSession, getClozeSession, listClozeSessions } from "@/platform/reading-paragraph-cloze/readingParagraphClozeBackendAdapter";

const backend: ReadingParagraphClozeBackendPort = {
    list: listClozeSessions, get: getClozeSession, create: createClozeSession, delete: deleteClozeSession,
};

export default function ReadingParagraphClozeFeature() {
    const flow = useReadingParagraphClozeFlow(backend);
    return <ReadingParagraphClozeView {...flow} />;
}
