import { defineFlow } from "@myriadcodelabs/uiflow";
import createGrammarRuleAction from "../_server_actions/createGrammarRuleAction";
import AddGrammarRuleView, { AddGrammarRuleViewOutput } from "../_client_components/AddGrammarRuleView";
import { GrammarRuleDraft, ScreenMode } from "../types";
import { createInitialDraft, isDraftValid, normalizeDraft } from "./grammarRuleDraftOps";
import { CreateGrammarRuleRequest } from "@/lib/types/requests/CreateGrammarRuleRequest";

type AddGrammarRuleDomainData = Record<string, never>;

interface AddGrammarRuleInternalData {
    flowData: {
        draft: GrammarRuleDraft;
        ui: {
            isSaving: boolean;
            error: string | null;
        };
    };
}

function createAddGrammarRuleInternalData(): AddGrammarRuleInternalData {
    return {
        flowData: {
            draft: createInitialDraft(),
            ui: {
                isSaving: false,
                error: null,
            },
        },
    };
}

export const addGrammarRuleFlow = defineFlow<AddGrammarRuleDomainData, AddGrammarRuleInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            draft: internal.flowData.draft,
            error: internal.flowData.ui.error,
            isSaving: internal.flowData.ui.isSaving,
            canSubmit: isDraftValid(internal.flowData.draft),
        }),
        view: AddGrammarRuleView,
        onOutput: (_domain, internal, output: AddGrammarRuleViewOutput, events) => {
            if (output.type === "cancel") {
                internal.flowData.ui.error = null;
                events?.screenMode.emit("list");
                return "displayForm";
            }

            if (output.type === "submit") {
                if (internal.flowData.ui.isSaving) {
                    return "displayForm";
                }

                if (!isDraftValid(output.draft)) {
                    internal.flowData.ui.error = "Complete rule name, admin key, explanation, scenario fields, and one sentence";
                    return "displayForm";
                }

                internal.flowData.draft = output.draft;
                internal.flowData.ui.error = null;
                internal.flowData.ui.isSaving = true;
                return "saveRule";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayForm";
            }
        },
    },

    saveRule: {
        input: (_domain, internal) => ({
            draft: normalizeDraft(internal.flowData.draft),
        }),
        action: async ({ draft }: { draft: GrammarRuleDraft }, _domain, internal) => {
            try {
                const requestBody: CreateGrammarRuleRequest = {
                    name: draft.name,
                    explanationParagraphs: draft.explanationParagraphs,
                    scenario: {
                        title: draft.scenario.title,
                        description: draft.scenario.description,
                        targetLanguage: draft.scenario.targetLanguage,
                        sentences: draft.scenario.sentences.map((item) => ({
                            sentence: item.sentence,
                            translation: item.translation,
                        })),
                    },
                    admin_key: draft.adminKey,
                };

                const createdRule = await createGrammarRuleAction(requestBody);
                if (!createdRule) {
                    throw new Error("Failed to create grammar rule");
                }
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to create grammar rule";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            if (!internal.flowData.ui.error) {
                internal.flowData.draft = createInitialDraft();
                events?.rulesRefresh.emit((count: number) => count + 1);
                events?.screenMode.emit("list");
            }
            return "displayForm";
        },
    },
}, {
    start: "displayForm",
    channelTransitions: {
        screenMode: () => "displayForm",
    },
    createInternalData: createAddGrammarRuleInternalData,
});
