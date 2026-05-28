export type GrammarExplanationExampleResponse = {
    sentence: string;
    translation: string;
    note?: string | null;
};

export type GrammarRuleResponse = {
    id: string;
    identifier?: string;
    name: string;
    explanationParagraphs: string[];
    explanationExamples?: GrammarExplanationExampleResponse[];
};
