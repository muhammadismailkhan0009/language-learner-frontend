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

type AddGrammarRuleDomainData = Record<string, never>;

interface AddGrammarRuleInternalData {
    flowData: {
        request: GrammarDraftRequest;
        generatedDrafts: GeneratedGrammarRuleDraft[];
        ui: {
            isGenerating: boolean;
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
            }
            return "displayForm";
        },
    },
    createInternalData: createAddGrammarRuleInternalData,
});
