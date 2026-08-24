export type ClozeExample = { sentence: string; translation: string };

export type ClozeVocabularyDetails = {
    id: string; surface: string; translation: string; entryKind: string;
    notes: string | null; exampleSentences: ClozeExample[];
};

export type ClozeGrammarDetails = {
    id: string; identifier: string; name: string; level: string;
    explanationParagraphs: string[]; explanationExamples: ClozeExample[];
};

export type ClozeBlank = {
    blankId: string; blankIndex: number; blankToken: string; exactAnswer: string;
    answerExplanation: string; practiceKind: "VOCABULARY_FORM" | "GRAMMAR" | "VOCABULARY_AND_GRAMMAR";
    vocabularyDetails: ClozeVocabularyDetails | null; grammarRuleDetails: ClozeGrammarDetails[];
};

export type ClozeParagraph = {
    paragraphId: string; paragraphIndex: number; scenarioLabel: string;
    clozeParagraph: string; blanks: ClozeBlank[];
};

export type ReadingParagraphClozeSession = {
    sessionId: string; learnerLevel: string; createdAt: string; paragraphs: ClozeParagraph[];
};

export type ClozeAnswers = Record<string, string>;
export type ClozeResults = Record<string, boolean>;
