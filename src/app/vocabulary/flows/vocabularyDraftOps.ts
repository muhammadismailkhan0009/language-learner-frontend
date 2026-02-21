import { VocabularyResponse } from "@/lib/types/responses/VocabularyResponse";
import { VocabularyDraft } from "../types";

export function createInitialVocabularyDraft(): VocabularyDraft {
    return {
        surface: "",
        translation: "",
        entryKind: "WORD",
        notes: "",
        exampleSentences: [{ sentence: "", translation: "" }],
    };
}

export function normalizeVocabularyDraft(draft: VocabularyDraft): VocabularyDraft {
    const normalizedSentences = draft.exampleSentences
        .map((item) => ({
            id: item.id,
            sentence: item.sentence.trim(),
            translation: item.translation.trim(),
        }))
        .filter((item) => item.sentence.length > 0 || item.translation.length > 0);

    return {
        surface: draft.surface.trim(),
        translation: draft.translation.trim(),
        entryKind: draft.entryKind,
        notes: draft.notes.trim(),
        exampleSentences: normalizedSentences,
    };
}

export function isVocabularyDraftValid(draft: VocabularyDraft): boolean {
    const normalized = normalizeVocabularyDraft(draft);
    return normalized.surface.length > 0 && normalized.translation.length > 0;
}

export function mapVocabularyResponseToDraft(vocabulary: VocabularyResponse): VocabularyDraft {
    const exampleSentences = (vocabulary.exampleSentences ?? []).map((item) => ({
        id: item.id,
        sentence: item.sentence ?? "",
        translation: item.translation ?? "",
    }));

    return {
        surface: vocabulary.surface ?? "",
        translation: vocabulary.translation ?? "",
        entryKind: vocabulary.entryKind ?? "WORD",
        notes: vocabulary.notes ?? "",
        exampleSentences: exampleSentences.length > 0 ? exampleSentences : [{ sentence: "", translation: "" }],
    };
}
