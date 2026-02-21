import { ExampleSentenceRequest } from "./ExampleSentenceRequest";

export type VocabularyEntryKind = "WORD" | "CHUNK";

export type AddVocabularyRequest = {
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: ExampleSentenceRequest[];
};
