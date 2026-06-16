export type ScreenMode = "list" | "create" | "edit";

export type GrammarSentenceDraft = {
    sentence: string;
    translation: string;
};

export type GrammarScenarioDraft = {
    title: string;
    description: string;
    targetLanguage: string;
    sentences: GrammarSentenceDraft[];
};

export type GrammarRuleDraft = {
    name: string;
    adminKey: string;
    explanationParagraphs: string[];
    scenario: GrammarScenarioDraft;
};

export type GrammarDraftRequest = {
    level: string;
    adminKey: string;
};

export type GeneratedGrammarRuleDraft = {
    id: string;
    identifier: string;
    name: string;
    level: string;
    targetLanguage: string;
};

export type GrammarRuleListItem = {
    id: string;
    name: string;
    explanationParagraphs: string[];
    scenarioTitle: string;
    scenarioDescription: string;
    targetLanguage: string;
    sentenceCount: number;
    isFixed: boolean;
    sentences: GrammarSentenceDraft[];
};

export type GrammarLevelReassignmentChangedRule = {
    id: string;
    name: string;
    previousLevel: string;
    proposedLevel: string;
    reason: string | null;
};

export type GrammarLevelReassignmentSummary = {
    reviewedCount: number;
    changedCount: number;
    unchangedCount: number;
    changedRules: GrammarLevelReassignmentChangedRule[];
};
