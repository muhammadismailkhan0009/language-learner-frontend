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

export type WritingPracticeScenarioResponse = {
    scenarioId: string;
    position: number;
    topic: string;
    englishParagraph: string;
    germanParagraph: string;
    freeWritingInstructions: string | null;
    freeWritingText: string | null;
    submittedAnswer: string | null;
    submittedAt: string | null;
    feedbackText: string | null;
    structuredFeedback: WritingStructuredFeedback | null;
    feedbackGeneratedAt: string | null;
    sentencePairs: WritingSentencePairResponse[];
    vocabFlashcards: WritingVocabularyFlashCardView[];
};

export type WritingPracticeSessionResponse = {
    sessionId: string;
    scenarios: WritingPracticeScenarioResponse[];
    createdAt: string;
};
