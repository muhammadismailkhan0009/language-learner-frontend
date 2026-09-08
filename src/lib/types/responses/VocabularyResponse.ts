import { VocabularyEntryKind } from "../requests/AddVocabularyRequest";
import { ClozeSentenceResponse } from "./ClozeSentenceResponse";
import { ExampleSentenceResponse } from "./ExampleSentenceResponse";

export type ReverseFlashcardState = "NEW" | "LEARNING" | "RE_LEARNING" | "REVIEW";

export type VocabularyResponse = {
    id: string;
    userId: string;
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: ExampleSentenceResponse[];
    clozeSentence?: ClozeSentenceResponse;
    reverseFlashcardState?: ReverseFlashcardState | null;
};
