import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchGrammarRulesAction from "../_server_actions/fetchGrammarRulesAction";
import fetchDraftGrammarRulesAction from "../_server_actions/fetchDraftGrammarRulesAction";
import generateGrammarRuleDraftDetailsAction from "../_server_actions/generateGrammarRuleDraftDetailsAction";
import deleteGrammarRuleExplanationAction from "../_server_actions/deleteGrammarRuleExplanationAction";
import reassignGrammarLevelsAction from "../_server_actions/reassignGrammarLevelsAction";
import GrammarRulesListView, { GrammarRulesListViewOutput } from "../_client_components/GrammarRulesListView";
import { GeneratedGrammarRuleDraft, GrammarLevelReassignmentSummary, GrammarRuleListItem, ScreenMode } from "../types";

type GrammarRulesListDomainData = Record<string, never>;

interface GrammarRulesListInternalData {
    flowData: {
        rules: GrammarRuleListItem[];
        drafts: GeneratedGrammarRuleDraft[];
        selectedGrammarRuleId: string | null;
        ui: {
            isLoading: boolean;
            isLoadingDrafts: boolean;
            isGeneratingDetails: boolean;
            isReassigningLevels: boolean;
            showDrafts: boolean;
            draftAdminKey: string;
            error: string | null;
            message: string | null;
            reassignmentSummary: GrammarLevelReassignmentSummary | null;
        };
    };
}

function createGrammarRulesListInternalData(): GrammarRulesListInternalData {
    return {
        flowData: {
            rules: [],
            drafts: [],
            selectedGrammarRuleId: null,
            ui: {
                isLoading: false,
                isLoadingDrafts: false,
                isGeneratingDetails: false,
                isReassigningLevels: false,
                showDrafts: false,
                draftAdminKey: "",
                error: null,
                message: null,
                reassignmentSummary: null,
            },
        },
    };
}

export const grammarRulesListFlow = defineFlow<GrammarRulesListDomainData, GrammarRulesListInternalData>({
    fetchRules: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.error = null;

            try {
                const rules = (await fetchGrammarRulesAction()) ?? [];
                internal.flowData.rules = rules.map((rule) => ({
                    id: rule.id,
                    name: rule.name,
                    explanationParagraphs: (rule.explanationParagraphs ?? [])
                        .map((paragraph) => paragraph.trim())
                        .filter((paragraph) => paragraph.length > 0),
                    scenarioTitle: "Explanation examples",
                    scenarioDescription: "",
                    targetLanguage: "de",
                    sentenceCount: rule.explanationExamples?.length ?? 0,
                    isFixed: true,
                    sentences: (rule.explanationExamples ?? []).map((item) => ({
                        sentence: item.sentence,
                        translation: item.translation,
                    })),
                }));

                if (internal.flowData.rules.length === 0) {
                    internal.flowData.selectedGrammarRuleId = null;
                } else {
                    const currentId = internal.flowData.selectedGrammarRuleId;
                    const hasCurrent = !!currentId && internal.flowData.rules.some((rule) => rule.id === currentId);
                    internal.flowData.selectedGrammarRuleId = hasCurrent ? currentId : internal.flowData.rules[0].id;
                }
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to load grammar rules";
            } finally {
                internal.flowData.ui.isLoading = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayList",
    },

    fetchDrafts: {
        input: (_domain, internal) => ({
            adminKey: internal.flowData.ui.draftAdminKey,
        }),
        action: async ({ adminKey }: { adminKey: string }, _domain, internal) => {
            if (!internal.flowData.ui.showDrafts) {
                return { ok: true };
            }
            if (!adminKey.trim()) {
                internal.flowData.drafts = [];
                return { ok: true };
            }
            internal.flowData.ui.isLoadingDrafts = true;
            internal.flowData.ui.message = null;
            try {
                const drafts = (await fetchDraftGrammarRulesAction(adminKey.trim())) ?? [];
                internal.flowData.drafts = drafts.map((draft) => ({
                    id: draft.id,
                    identifier: draft.identifier,
                    name: draft.name,
                    level: draft.level,
                    targetLanguage: draft.targetLanguage,
                }));
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to load grammar drafts";
            } finally {
                internal.flowData.ui.isLoadingDrafts = false;
            }
            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayList",
    },

    generateDraftDetails: {
        input: (_domain, internal) => ({
            adminKey: internal.flowData.ui.draftAdminKey,
            draftId: (internal as GrammarRulesListInternalData & { selectedDraftId?: string }).selectedDraftId,
        }),
        action: async ({ adminKey, draftId }: { adminKey: string; draftId?: string }, _domain, internal) => {
            if (!draftId) {
                return { ok: true };
            }
            internal.flowData.ui.isGeneratingDetails = true;
            internal.flowData.ui.message = "Details generation in progress...";
            try {
                await generateGrammarRuleDraftDetailsAction(draftId, { admin_key: adminKey.trim() });
                internal.flowData.drafts = internal.flowData.drafts.filter((draft) => draft.id !== draftId);
                internal.flowData.ui.message = "Details generated successfully.";
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to generate draft details";
                internal.flowData.ui.message = null;
            } finally {
                internal.flowData.ui.isGeneratingDetails = false;
                (internal as GrammarRulesListInternalData & { selectedDraftId?: string }).selectedDraftId = undefined;
            }
            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayList",
    },

    deleteExplanation: {
        input: (_domain, internal) => ({
            adminKey: internal.flowData.ui.draftAdminKey,
            grammarRuleId: (internal as GrammarRulesListInternalData & { selectedDeleteRuleId?: string }).selectedDeleteRuleId,
        }),
        action: async ({ adminKey, grammarRuleId }: { adminKey: string; grammarRuleId?: string }, _domain, internal) => {
            if (!grammarRuleId) {
                return { ok: true };
            }
            try {
                internal.flowData.ui.message = "Deleting grammar rule...";
                const deleted = await deleteGrammarRuleExplanationAction(grammarRuleId, { admin_key: adminKey.trim() });
                if (!deleted) {
                    throw new Error("Failed to delete grammar rule");
                }
                internal.flowData.ui.message = "Grammar rule deleted.";
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to delete grammar rule";
                internal.flowData.ui.message = null;
            } finally {
                (internal as GrammarRulesListInternalData & { selectedDeleteRuleId?: string }).selectedDeleteRuleId = undefined;
            }
            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "fetchRules",
    },

    reassignLevels: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.flowData.ui.isReassigningLevels = true;
            internal.flowData.ui.error = null;
            internal.flowData.ui.message = "Reassigning grammar levels...";
            internal.flowData.ui.reassignmentSummary = null;

            try {
                const summary = await reassignGrammarLevelsAction();
                if (!summary) {
                    throw new Error("Failed to reassign grammar levels");
                }
                internal.flowData.ui.reassignmentSummary = summary;
                internal.flowData.ui.message = "Grammar levels reassigned.";
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to reassign grammar levels";
                internal.flowData.ui.message = null;
            } finally {
                internal.flowData.ui.isReassigningLevels = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal) => {
            if (internal.flowData.ui.reassignmentSummary) {
                return "fetchRules";
            }
            return "displayList";
        },
    },

    displayList: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            rules: internal.flowData.rules,
            drafts: internal.flowData.drafts,
            selectedGrammarRuleId: internal.flowData.selectedGrammarRuleId,
            error: internal.flowData.ui.error,
            message: internal.flowData.ui.message,
            isLoading: internal.flowData.ui.isLoading,
            isLoadingDrafts: internal.flowData.ui.isLoadingDrafts,
            isGeneratingDetails: internal.flowData.ui.isGeneratingDetails,
            isReassigningLevels: internal.flowData.ui.isReassigningLevels,
            showDrafts: internal.flowData.ui.showDrafts,
            draftAdminKey: internal.flowData.ui.draftAdminKey,
            reassignmentSummary: internal.flowData.ui.reassignmentSummary,
        }),
        view: GrammarRulesListView,
        onOutput: (_domain, internal, output: GrammarRulesListViewOutput, events) => {
            if (output.type === "reload") {
                return "fetchRules";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                internal.flowData.ui.message = null;
                return "displayList";
            }

            if (output.type === "reassignLevels") {
                if (internal.flowData.ui.isReassigningLevels) {
                    return "displayList";
                }
                return "reassignLevels";
            }

            if (output.type === "openCreate") {
                events?.screenMode.emit("create");
                return "displayList";
            }

            if (output.type === "setSelectedRule") {
                internal.flowData.selectedGrammarRuleId = output.grammarRuleId;
                return "displayList";
            }

            if (output.type === "openEdit") {
                events?.selectedGrammarRuleId.emit(output.grammarRuleId);
                events?.screenMode.emit("edit");
                return "displayList";
            }

            if (output.type === "toggleDrafts") {
                internal.flowData.ui.showDrafts = !internal.flowData.ui.showDrafts;
                internal.flowData.ui.message = null;
                if (internal.flowData.ui.showDrafts) {
                    return "displayList";
                }
                return "displayList";
            }

            if (output.type === "setDraftAdminKey") {
                internal.flowData.ui.draftAdminKey = output.adminKey;
                return "displayList";
            }

            if (output.type === "reloadDrafts") {
                internal.flowData.ui.draftAdminKey = output.adminKey;
                return "fetchDrafts";
            }

            if (output.type === "generateDraftDetails") {
                if (!internal.flowData.ui.draftAdminKey.trim()) {
                    internal.flowData.ui.error = "Admin key is required to generate draft details";
                    return "displayList";
                }
                (internal as GrammarRulesListInternalData & { selectedDraftId?: string }).selectedDraftId = output.draftId;
                return "generateDraftDetails";
            }

            if (output.type === "deleteExplanation") {
                if (!internal.flowData.ui.draftAdminKey.trim()) {
                    internal.flowData.ui.error = "Admin key is required to delete grammar rule";
                    return "displayList";
                }
                (internal as GrammarRulesListInternalData & { selectedDeleteRuleId?: string }).selectedDeleteRuleId = output.grammarRuleId;
                return "deleteExplanation";
            }
        },
    },
}, {
    start: "fetchRules",
    channelTransitions: {
        rulesRefresh: () => "fetchRules",
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "list") {
                return "fetchRules";
            }
            return "displayList";
        },
    },
    createInternalData: createGrammarRulesListInternalData,
});
