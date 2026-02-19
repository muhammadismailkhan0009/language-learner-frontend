import { GrammarScenarioUpdateRequest } from "./GrammarScenarioUpdateRequest";

export type EditGrammarRuleRequest = {
    name: string;
    explanationParagraphs: string[];
    scenario: GrammarScenarioUpdateRequest;
    admin_key: string;
};
