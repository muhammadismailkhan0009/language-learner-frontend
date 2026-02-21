import { VocabularyEntryKind } from "@/lib/types/requests/AddVocabularyRequest";

export type ScreenMode = "list" | "create" | "edit";

export type VocabularyExampleSentenceDraft = {
    id?: string;
    sentence: string;
    translation: string;
};

export type VocabularyDraft = {
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: VocabularyExampleSentenceDraft[];
};

export type VocabularyListItem = {
    id: string;
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: VocabularyExampleSentenceDraft[];
};

export type PublicVocabularyListItem = {
    publicVocabularyId: string;
    sourceVocabularyId: string;
    publishedByUserId: string;
    publishedAt: string;
    surface: string;
    translation: string;
    notes: string;
    exampleSentences: VocabularyExampleSentenceDraft[];
};
