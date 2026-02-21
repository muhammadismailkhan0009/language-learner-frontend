import { VocabularyEntryKind } from "./AddVocabularyRequest";
import { ExampleSentenceUpdateRequest } from "./ExampleSentenceUpdateRequest";

export type UpdateVocabularyRequest = {
    surface: string;
    translation: string;
    entryKind: VocabularyEntryKind;
    notes: string;
    exampleSentences: ExampleSentenceUpdateRequest[];
};
