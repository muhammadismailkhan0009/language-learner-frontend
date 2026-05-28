import { GrammarRuleResponse } from "@/lib/types/responses/GrammarRuleResponse";
import { GrammarDraftRequest, GrammarRuleDraft, GrammarSentenceDraft } from "../types";

export function createEmptySentence(): GrammarSentenceDraft {
    return { sentence: "", translation: "" };
}

export function createInitialDraft(): GrammarRuleDraft {
    return {
        name: "",
        adminKey: "",
        explanationParagraphs: [""],
        scenario: {
            title: "",
            description: "",
            targetLanguage: "de",
            sentences: [createEmptySentence()],
        },
    };
}

export function mapGrammarRuleToDraft(rule: GrammarRuleResponse): GrammarRuleDraft {
    return {
        name: rule.name ?? "",
        adminKey: "",
        explanationParagraphs: (rule.explanationParagraphs ?? []).length > 0 ? rule.explanationParagraphs : [""],
        scenario: {
            title: "Explanation examples",
            description: "Auto-mapped from rule examples",
            targetLanguage: "de",
            sentences: (rule.explanationExamples ?? []).map((item) => ({
                sentence: item.sentence ?? "",
                translation: item.translation ?? "",
            })),
        },
    };
}

export function normalizeDraft(draft: GrammarRuleDraft): GrammarRuleDraft {
    return {
        name: draft.name.trim(),
        adminKey: draft.adminKey.trim(),
        explanationParagraphs: draft.explanationParagraphs
            .map((paragraph) => paragraph.trim())
            .filter((paragraph) => paragraph.length > 0),
        scenario: {
            title: draft.scenario.title.trim(),
            description: draft.scenario.description.trim(),
            targetLanguage: draft.scenario.targetLanguage.trim(),
            sentences: draft.scenario.sentences
                .map((item) => ({
                    sentence: item.sentence.trim(),
                    translation: item.translation.trim(),
                }))
                .filter((item) => item.sentence.length > 0 && item.translation.length > 0),
        },
    };
}

export function isDraftValid(draft: GrammarRuleDraft): boolean {
    if (!draft.name.trim() || !draft.adminKey.trim()) {
        return false;
    }

    if (!draft.scenario.title.trim() || !draft.scenario.description.trim() || !draft.scenario.targetLanguage.trim()) {
        return false;
    }

    const hasExplanation = draft.explanationParagraphs.some((paragraph) => paragraph.trim().length > 0);
    if (!hasExplanation) {
        return false;
    }

    return draft.scenario.sentences.some((item) => item.sentence.trim() && item.translation.trim());
}

export function createInitialGrammarDraftRequest(): GrammarDraftRequest {
    return {
        level: "A1",
        adminKey: "",
    };
}

export function normalizeGrammarDraftRequest(request: GrammarDraftRequest): GrammarDraftRequest {
    return {
        level: request.level.trim().toUpperCase(),
        adminKey: request.adminKey.trim(),
    };
}

export function isGrammarDraftRequestValid(request: GrammarDraftRequest): boolean {
    return request.level.trim().length > 0 && request.adminKey.trim().length > 0;
}
