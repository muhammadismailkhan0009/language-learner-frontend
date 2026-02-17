import { ScenarioDraft, SentenceDraft } from "../types";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";

export function createEmptySentence(): SentenceDraft {
    return { sentence: "", translation: "" };
}

export function createInitialDraft(): ScenarioDraft {
    return {
        nature: "",
        targetLanguage: "",
        sentences: [createEmptySentence()],
    };
}

export function mapScenarioToDraft(scenario: ScenarioResponse): ScenarioDraft {
    return {
        nature: scenario.nature ?? "",
        targetLanguage: scenario.targetLanguage ?? "",
        sentences: (scenario.sentences ?? []).map((item) => ({
            id: item.id,
            sentence: item.sentence ?? "",
            translation: item.translation ?? "",
        })),
    };
}

export function normalizeDraft(draft: ScenarioDraft): ScenarioDraft {
    return {
        nature: draft.nature.trim(),
        targetLanguage: draft.targetLanguage.trim(),
        sentences: draft.sentences
            .map((item) => ({
                id: item.id,
                sentence: item.sentence.trim(),
                translation: item.translation.trim(),
            }))
            .filter((item) => item.sentence.length > 0 && item.translation.length > 0),
    };
}

export function isDraftValid(draft: ScenarioDraft): boolean {
    if (!draft.nature.trim() || !draft.targetLanguage.trim()) {
        return false;
    }

    return draft.sentences.some((item) => item.sentence.trim() && item.translation.trim());
}

