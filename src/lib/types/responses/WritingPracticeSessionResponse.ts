import { WritingSentencePairResponse } from "./WritingSentencePairResponse";
import { WritingVocabularyFlashCardView } from "./WritingVocabularyFlashCardView";

export type WritingPracticeSessionResponse = {
    sessionId: string;
    topic: string;
    englishParagraph: string;
    germanParagraph: string;
    submittedAnswer: string | null;
    submittedAt: string | null;
    feedbackText: string | null;
    feedbackGeneratedAt: string | null;
    sentencePairs: WritingSentencePairResponse[];
    vocabFlashcards: WritingVocabularyFlashCardView[];
    createdAt: string;
};
