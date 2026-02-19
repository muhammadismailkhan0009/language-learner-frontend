import { GrammarScenarioRequest } from "./GrammarScenarioRequest";

export type CreateGrammarRuleRequest = {
    name: string;
    explanationParagraphs: string[];
    scenario: GrammarScenarioRequest;
    admin_key: string;
};
