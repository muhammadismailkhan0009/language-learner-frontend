import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchGrammarRuleAction from "../_server_actions/fetchGrammarRuleAction";
import editGrammarRuleAction from "../_server_actions/editGrammarRuleAction";
import EditGrammarRuleView, { EditGrammarRuleViewOutput } from "../_client_components/EditGrammarRuleView";
import { GrammarRuleDraft, ScreenMode } from "../types";
import { createInitialDraft, isDraftValid, mapGrammarRuleToDraft, normalizeDraft } from "./grammarRuleDraftOps";
import { EditGrammarRuleRequest } from "@/lib/types/requests/EditGrammarRuleRequest";

type EditGrammarRuleDomainData = Record<string, never>;

interface EditGrammarRuleInternalData {
    flowData: {
        selectedGrammarRuleName: string | null;
        draft: GrammarRuleDraft;
        ui: {
            isLoading: boolean;
            isSaving: boolean;
            fetchError: string | null;
            saveError: string | null;
        };
    };
}

function createEditGrammarRuleInternalData(): EditGrammarRuleInternalData {
    return {
        flowData: {
            selectedGrammarRuleName: null,
            draft: createInitialDraft(),
            ui: {
                isLoading: false,
                isSaving: false,
                fetchError: null,
                saveError: null,
            },
        },
    };
}

export const editGrammarRuleFlow = defineFlow<EditGrammarRuleDomainData, EditGrammarRuleInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            selectedGrammarRuleId: (events?.selectedGrammarRuleId?.get() as string | null | undefined) ?? null,
            selectedGrammarRuleName: internal.flowData.selectedGrammarRuleName,
            draft: internal.flowData.draft,
            fetchError: internal.flowData.ui.fetchError,
            saveError: internal.flowData.ui.saveError,
            isLoading: internal.flowData.ui.isLoading,
            isSaving: internal.flowData.ui.isSaving,
            canSubmit: isDraftValid(internal.flowData.draft),
        }),
        view: EditGrammarRuleView,
        onOutput: (_domain, internal, output: EditGrammarRuleViewOutput, events) => {
            if (output.type === "cancel") {
                internal.flowData.ui.fetchError = null;
                internal.flowData.ui.saveError = null;
                events?.screenMode.emit("list");
                return "displayForm";
            }

            if (output.type === "submit") {
                if (internal.flowData.ui.isSaving) {
                    return "displayForm";
                }

                if (!isDraftValid(output.draft)) {
                    internal.flowData.ui.saveError = "Complete all required fields before saving";
                    return "displayForm";
                }

                internal.flowData.draft = output.draft;
                internal.flowData.ui.saveError = null;
                internal.flowData.ui.isSaving = true;
                return "saveRule";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.fetchError = null;
                internal.flowData.ui.saveError = null;
                return "displayForm";
            }
        },
    },

    fetchRule: {
        input: (_domain, _internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            selectedGrammarRuleId: (events?.selectedGrammarRuleId?.get() as string | null | undefined) ?? null,
        }),
        action: async ({ mode, selectedGrammarRuleId }: { mode: ScreenMode; selectedGrammarRuleId: string | null }, _domain, internal) => {
            if (mode !== "edit" || !selectedGrammarRuleId) {
                return { ok: true };
            }

            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.fetchError = null;
            internal.flowData.ui.saveError = null;

            try {
                const rule = await fetchGrammarRuleAction(selectedGrammarRuleId);
                if (!rule) {
                    throw new Error("Failed to load grammar rule");
                }

                internal.flowData.selectedGrammarRuleName = rule.name;
                internal.flowData.draft = mapGrammarRuleToDraft(rule);
            } catch (err) {
                internal.flowData.ui.fetchError = err instanceof Error ? err.message : "Failed to load grammar rule";
                internal.flowData.selectedGrammarRuleName = null;
                internal.flowData.draft = createInitialDraft();
            } finally {
                internal.flowData.ui.isLoading = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayForm",
    },

    saveRule: {
        input: (_domain, internal, events) => ({
            selectedGrammarRuleId: (events?.selectedGrammarRuleId?.get() as string | null | undefined) ?? null,
            draft: normalizeDraft(internal.flowData.draft),
        }),
        action: async (
            { selectedGrammarRuleId, draft }: { selectedGrammarRuleId: string | null; draft: GrammarRuleDraft },
            _domain,
            internal
        ) => {
            if (!selectedGrammarRuleId) {
                internal.flowData.ui.saveError = "Missing selected grammar rule";
                internal.flowData.ui.isSaving = false;
                return { ok: true };
            }

            try {
                const requestBody: EditGrammarRuleRequest = {
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

                const updatedRule = await editGrammarRuleAction(selectedGrammarRuleId, requestBody);
                if (!updatedRule) {
                    throw new Error("Failed to save grammar rule");
                }
            } catch (err) {
                internal.flowData.ui.saveError = err instanceof Error ? err.message : "Failed to save grammar rule";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            if (!internal.flowData.ui.saveError) {
                events?.rulesRefresh.emit((count: number) => count + 1);
                events?.screenMode.emit("list");
            }
            return "displayForm";
        },
    },
}, {
    start: "displayForm",
    channelTransitions: {
        selectedGrammarRuleId: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchRule";
            }
        },
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchRule";
            }
            return "displayForm";
        },
        rulesRefresh: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchRule";
            }
        },
    },
    createInternalData: createEditGrammarRuleInternalData,
});
