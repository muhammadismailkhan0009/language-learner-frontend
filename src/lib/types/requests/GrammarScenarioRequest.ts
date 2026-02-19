import { GrammarScenarioSentenceRequest } from "./GrammarScenarioSentenceRequest";

export type GrammarScenarioRequest = {
    title: string;
    description: string;
    targetLanguage: string;
    sentences: GrammarScenarioSentenceRequest[];
};
