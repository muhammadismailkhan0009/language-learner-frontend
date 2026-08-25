import { ReadingPracticeParagraphResponse } from "./ReadingPracticeParagraphResponse";
import { ReadingVocabularyFlashCardView } from "./ReadingVocabularyFlashCardView";

export type ReadingPracticeScenarioResponse = {
    scenarioId: string;
    topic: string;
    readingText: string;
    readingParagraphs: ReadingPracticeParagraphResponse[];
    vocabFlashcards: ReadingVocabularyFlashCardView[];
};
