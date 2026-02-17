export type ScreenMode = "list" | "create" | "edit";

export type ScenarioListItem = {
    id: string;
    nature: string;
    targetLanguage: string;
    sentences: SentenceDraft[];
};

export type SentenceDraft = {
    id?: string;
    sentence: string;
    translation: string;
};

export type ScenarioDraft = {
    nature: string;
    targetLanguage: string;
    sentences: SentenceDraft[];
};
