import { VocabularyEntryKind } from "../requests/AddVocabularyRequest";
import { ClozeSentenceResponse } from "./ClozeSentenceResponse";
import { ExampleSentenceResponse } from "./ExampleSentenceResponse";

export type VocabularyResponse = {
    id: string;
    userId: string;
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: ExampleSentenceResponse[];
    clozeSentence?: ClozeSentenceResponse;
};
