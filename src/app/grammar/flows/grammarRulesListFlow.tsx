import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchGrammarRulesAction from "../_server_actions/fetchGrammarRulesAction";
import GrammarRulesListView, { GrammarRulesListViewOutput } from "../_client_components/GrammarRulesListView";
import { GrammarRuleListItem, ScreenMode } from "../types";

type GrammarRulesListDomainData = Record<string, never>;

interface GrammarRulesListInternalData {
    flowData: {
        rules: GrammarRuleListItem[];
        selectedGrammarRuleId: string | null;
        ui: {
            isLoading: boolean;
            error: string | null;
        };
    };
}

function createGrammarRulesListInternalData(): GrammarRulesListInternalData {
    return {
        flowData: {
            rules: [],
            selectedGrammarRuleId: null,
            ui: {
                isLoading: false,
                error: null,
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
                    scenarioTitle: rule.scenario?.title ?? "",
                    scenarioDescription: rule.scenario?.description ?? "",
                    targetLanguage: rule.scenario?.targetLanguage ?? "",
                    sentenceCount: rule.scenario?.sentences?.length ?? 0,
                    isFixed: !!rule.scenario?.isFixed,
                    sentences: (rule.scenario?.sentences ?? []).map((item) => ({
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

    displayList: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            rules: internal.flowData.rules,
            selectedGrammarRuleId: internal.flowData.selectedGrammarRuleId,
            error: internal.flowData.ui.error,
            isLoading: internal.flowData.ui.isLoading,
        }),
        view: GrammarRulesListView,
        onOutput: (_domain, internal, output: GrammarRulesListViewOutput, events) => {
            if (output.type === "reload") {
                return "fetchRules";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayList";
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
