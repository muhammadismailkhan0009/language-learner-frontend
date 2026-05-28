import { WritingSentencePairResponse } from "./WritingSentencePairResponse";
import { WritingVocabularyFlashCardView } from "./WritingVocabularyFlashCardView";

export type WritingPracticeSessionResponse = {
    sessionId: string;
    topic: string;
    englishParagraph: string;
    germanParagraph: string;
    submittedAnswer: string;
    submittedAt: string;
    feedbackText: string;
    feedbackGeneratedAt: string;
    sentencePairs: WritingSentencePairResponse[];
    vocabFlashcards: WritingVocabularyFlashCardView[];
    createdAt: string;
};
