export type ScenarioSentenceResponse = {
    id: string;
    sentence: string;
    translation: string;
};

export type ScenarioResponse = {
    id: string;
    nature: string;
    targetLanguage: string;
    sentences: ScenarioSentenceResponse[];
};

