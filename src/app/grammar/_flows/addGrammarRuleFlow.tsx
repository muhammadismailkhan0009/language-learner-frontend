import { defineFlow } from "@myriadcodelabs/uiflow";
import AddGrammarRuleView, { AddGrammarRuleViewOutput } from "../_client_components/AddGrammarRuleView";
import { GeneratedGrammarRuleDraft, GrammarDraftRequest, ScreenMode } from "../types";
import {
    createInitialGrammarDraftRequest,
    isGrammarDraftRequestValid,
    normalizeGrammarDraftRequest,
} from "./grammarRuleDraftOps";
import draftGrammarRulesAction from "../_server_actions/draftGrammarRulesAction";
import { DraftGrammarRulesRequest } from "@/lib/types/requests/DraftGrammarRulesRequest";
import fetchDraftGrammarRulesAction from "../_server_actions/fetchDraftGrammarRulesAction";
import generateGrammarRuleDraftDetailsAction from "../_server_actions/generateGrammarRuleDraftDetailsAction";

type AddGrammarRuleDomainData = Record<string, never>;

interface AddGrammarRuleInternalData {
    flowData: {
        request: GrammarDraftRequest;
        generatedDrafts: GeneratedGrammarRuleDraft[];
        ui: {
            isGenerating: boolean;
            isGeneratingDetails: boolean;
            error: string | null;
        };
    };
}

function createAddGrammarRuleInternalData(): AddGrammarRuleInternalData {
    return {
        flowData: {
            request: createInitialGrammarDraftRequest(),
            generatedDrafts: [],
            ui: {
                isGenerating: false,
                isGeneratingDetails: false,
                error: null,
            },
        },
    };
}

export const addGrammarRuleFlow = defineFlow<AddGrammarRuleDomainData, AddGrammarRuleInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            request: internal.flowData.request,
            generatedDrafts: internal.flowData.generatedDrafts,
            error: internal.flowData.ui.error,
            isGenerating: internal.flowData.ui.isGenerating,
            isGeneratingDetails: internal.flowData.ui.isGeneratingDetails,
            canSubmit: isGrammarDraftRequestValid(internal.flowData.request),
        }),
        view: AddGrammarRuleView,
        onOutput: (_domain, internal, output: AddGrammarRuleViewOutput, events) => {
            if (output.type === "cancel") {
                internal.flowData.ui.error = null;
                events?.screenMode.emit("list");
                return "displayForm";
            }

            if (output.type === "setRequest") {
                internal.flowData.request = output.request;
                return "displayForm";
            }

            if (output.type === "submit") {
                if (internal.flowData.ui.isGenerating) {
                    return "displayForm";
                }

                if (!isGrammarDraftRequestValid(output.request)) {
                    internal.flowData.ui.error = "Provide CEFR level and admin key";
                    return "displayForm";
                }

                internal.flowData.request = output.request;
                internal.flowData.ui.error = null;
                internal.flowData.ui.isGenerating = true;
                return "generateDrafts";
            }

            if (output.type === "generateDetails") {
                if (internal.flowData.ui.isGeneratingDetails) {
                    return "displayForm";
                }
                internal.flowData.ui.error = null;
                internal.flowData.ui.isGeneratingDetails = true;
                internal.flowData.request.adminKey = output.adminKey;
                internal.flowData.request.level = output.level;
                internal.flowData.generatedDrafts = internal.flowData.generatedDrafts.map((draft) => draft);
                (internal as AddGrammarRuleInternalData & { draftIdForDetails?: string }).draftIdForDetails = output.draftId;
                return "generateDetails";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayForm";
            }
        },
    },

    generateDrafts: {
        input: (_domain, internal) => ({
            request: normalizeGrammarDraftRequest(internal.flowData.request),
        }),
        action: async ({ request }: { request: GrammarDraftRequest }, _domain, internal) => {
            try {
                const requestBody: DraftGrammarRulesRequest = {
                    level: request.level,
                    admin_key: request.adminKey,
                };

                const drafts = await draftGrammarRulesAction(requestBody);
                if (!drafts) {
                    throw new Error("Failed to generate grammar drafts");
                }

                internal.flowData.generatedDrafts = drafts.map((draft) => ({
                    id: draft.id,
                    identifier: draft.identifier,
                    name: draft.name,
                    level: draft.level,
                    targetLanguage: draft.targetLanguage,
                }));
            } catch (err) {
                internal.flowData.generatedDrafts = [];
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to generate grammar drafts";
            } finally {
                internal.flowData.ui.isGenerating = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal) => {
            if (!internal.flowData.ui.error) {
                return "loadDrafts";
            }
            return "displayForm";
        },
    },

    loadDrafts: {
        input: (_domain, internal) => ({
            adminKey: internal.flowData.request.adminKey,
        }),
        action: async ({ adminKey }: { adminKey: string }, _domain, internal) => {
            if (!adminKey.trim()) {
                return { ok: true };
            }
            try {
                const drafts = await fetchDraftGrammarRulesAction(adminKey.trim());
                internal.flowData.generatedDrafts = (drafts ?? []).map((draft) => ({
                    id: draft.id,
                    identifier: draft.identifier,
                    name: draft.name,
                    level: draft.level,
                    targetLanguage: draft.targetLanguage,
                }));
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to load draft grammar rules";
            }
            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayForm",
    },

    generateDetails: {
        input: (_domain, internal) => ({
            adminKey: internal.flowData.request.adminKey,
            draftId: (internal as AddGrammarRuleInternalData & { draftIdForDetails?: string }).draftIdForDetails,
        }),
        action: async ({ adminKey, draftId }: { adminKey: string; draftId?: string }, _domain, internal) => {
            try {
                if (!draftId) {
                    throw new Error("Missing draft id");
                }
                const details = await generateGrammarRuleDraftDetailsAction(draftId, { admin_key: adminKey.trim() });
                if (!details) {
                    throw new Error("Failed to generate draft details");
                }
                internal.flowData.generatedDrafts = internal.flowData.generatedDrafts.filter((draft) => draft.id !== draftId);
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to generate draft details";
            } finally {
                internal.flowData.ui.isGeneratingDetails = false;
                (internal as AddGrammarRuleInternalData & { draftIdForDetails?: string }).draftIdForDetails = undefined;
            }
            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayForm",
    },
}, {
    start: "displayForm",
    channelTransitions: {
        screenMode: ({ internal, events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "create") {
                internal.flowData.request = createInitialGrammarDraftRequest();
                internal.flowData.generatedDrafts = [];
                internal.flowData.ui.error = null;
                internal.flowData.ui.isGenerating = false;
                internal.flowData.ui.isGeneratingDetails = false;
            }
            return "displayForm";
        },
    },
    createInternalData: createAddGrammarRuleInternalData,
});
