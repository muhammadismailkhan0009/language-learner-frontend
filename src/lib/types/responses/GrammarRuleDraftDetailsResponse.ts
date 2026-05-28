import { GrammarExplanationExampleResponse } from "./GrammarRuleResponse";

export type GrammarRuleDraftDetailsResponse = {
    identifier: string;
    name: string;
    level: string;
    targetLanguage: string;
    explanationParagraphs: string[];
    explanationExamples: GrammarExplanationExampleResponse[];
};
