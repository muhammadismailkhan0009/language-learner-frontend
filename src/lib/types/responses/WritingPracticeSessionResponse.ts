import { WritingSentencePairResponse } from "./WritingSentencePairResponse";
import { WritingVocabularyFlashCardView } from "./WritingVocabularyFlashCardView";

export type WritingPracticeSessionResponse = {
    sessionId: string;
    topic: string;
    englishParagraph: string;
    germanParagraph: string;
    submittedAnswer: string;
    submittedAt: string;
    sentencePairs: WritingSentencePairResponse[];
    vocabFlashcards: WritingVocabularyFlashCardView[];
    createdAt: string;
};
