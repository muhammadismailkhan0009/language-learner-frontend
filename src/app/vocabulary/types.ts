import { VocabularyEntryKind } from "@/lib/types/requests/AddVocabularyRequest";
import { ClozeSentenceResponse } from "@/lib/types/responses/ClozeSentenceResponse";
import { ReverseFlashcardState } from "@/lib/types/responses/VocabularyResponse";

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
    clozeSentence?: ClozeSentenceResponse;
    reverseFlashcardState?: ReverseFlashcardState | null;
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
