import { ReadingPracticeParagraphResponse } from "./ReadingPracticeParagraphResponse";
import { ReadingVocabularyFlashCardView } from "./ReadingVocabularyFlashCardView";

export type ReadingPracticeSessionResponse = {
    sessionId: string;
    topic: string;
    readingText: string;
    readingParagraphs: ReadingPracticeParagraphResponse[];
    vocabFlashcards: ReadingVocabularyFlashCardView[];
    createdAt: string;
};
