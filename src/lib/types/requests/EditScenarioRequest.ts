import { ScenarioSentenceUpdateRequest } from "./ScenarioSentenceUpdateRequest";

export type EditScenarioRequest = {
    nature: string;
    targetLanguage: string;
    sentences: ScenarioSentenceUpdateRequest[];
};

