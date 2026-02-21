import { VocabularyEntryKind } from "../requests/AddVocabularyRequest";
import { ExampleSentenceResponse } from "./ExampleSentenceResponse";

export type PublicVocabularyResponse = {
    publicVocabularyId: string;
    sourceVocabularyId: string;
    publishedByUserId: string;
    publishedAt: string;
    entryKind: VocabularyEntryKind;
    surface: string;
    translation: string;
    notes: string;
    exampleSentences: ExampleSentenceResponse[];
};
