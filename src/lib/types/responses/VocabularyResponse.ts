import { VocabularyEntryKind } from "../requests/AddVocabularyRequest";
import { ExampleSentenceResponse } from "./ExampleSentenceResponse";

export type VocabularyResponse = {
    id: string;
    userId: string;
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: ExampleSentenceResponse[];
};
