import { GrammarScenarioSentenceUpdateRequest } from "./GrammarScenarioSentenceUpdateRequest";

export type GrammarScenarioUpdateRequest = {
    title: string;
    description: string;
    targetLanguage: string;
    sentences: GrammarScenarioSentenceUpdateRequest[];
};
