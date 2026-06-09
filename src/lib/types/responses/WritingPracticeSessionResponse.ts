import { WritingSentencePairResponse } from "./WritingSentencePairResponse";
import { WritingVocabularyFlashCardView } from "./WritingVocabularyFlashCardView";

export type WritingStructuredFeedback = {
    overall: string;
    correctedParagraph: string;
    topFixes: WritingTopFix[];
    vocabulary: {
        good: string[];
        needsPractice: string[];
    };
    sentenceCorrections: WritingSentenceCorrection[];
    microPractice: WritingMicroPracticeItem[];
    nextFocus: string;
};

export type WritingTopFix = {
    title: string;
    learnerText: string | null;
    correctedText: string | null;
    explanation: string;
};

export type WritingSentenceCorrection = {
    learnerSentence: string;
    correctedSentence: string;
    explanation: string;
};

export type WritingMicroPracticeItem = {
    prompt: string;
    expectedAnswer: string | null;
};

export type WritingPracticeSessionResponse = {
    sessionId: string;
    topic: string;
    englishParagraph: string;
    germanParagraph: string;
    submittedAnswer: string | null;
    submittedAt: string | null;
    feedbackText: string | null;
    structuredFeedback: WritingStructuredFeedback | null;
    feedbackGeneratedAt: string | null;
    sentencePairs: WritingSentencePairResponse[];
    vocabFlashcards: WritingVocabularyFlashCardView[];
    createdAt: string;
};
