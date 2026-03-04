import { ReadingVocabularyFlashCardView } from "./ReadingVocabularyFlashCardView";

export type ReadingPracticeSessionResponse = {
    sessionId: string;
    topic: string;
    readingText: string;
    vocabFlashcards: ReadingVocabularyFlashCardView[];
    createdAt: string;
};
