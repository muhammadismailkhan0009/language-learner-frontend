export type GrammarScenarioSentenceResponse = {
    sentence: string;
    translation: string;
};

export type GrammarScenarioResponse = {
    id: string;
    title: string;
    description: string;
    targetLanguage: string;
    isFixed: boolean;
    sentences: GrammarScenarioSentenceResponse[];
};

export type GrammarRuleResponse = {
    id: string;
    name: string;
    explanationParagraphs: string[];
    scenario: GrammarScenarioResponse;
};
