import { ScenarioSentenceRequest } from "./ScenarioSentenceRequest";

export type CreateScenarioRequest = {
    nature: string;
    targetLanguage: string;
    sentences: ScenarioSentenceRequest[];
};

