import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchScenariosAction from "../_server_actions/fetchScenariosAction";
import ScenariosListView, { ScenariosListViewOutput } from "../_client_components/ScenariosListView";
import { ScenarioListItem, ScreenMode } from "../types";

type ScenariosListDomainData = Record<string, never>;

interface ScenariosListInternalData {
    flowData: {
        scenarios: ScenarioListItem[];
        selectedScenarioId: string | null;
        ui: {
            isLoading: boolean;
            error: string | null;
        };
    };
}

function createScenariosListInternalData(): ScenariosListInternalData {
    return {
        flowData: {
            scenarios: [],
            selectedScenarioId: null,
            ui: {
                isLoading: false,
                error: null,
            },
        },
    };
}

export const scenariosListFlow = defineFlow<ScenariosListDomainData, ScenariosListInternalData>({
    fetchScenarios: {
        input: () => ({}),
        action: async (_, _domain, internal) => {
            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.error = null;

            try {
                const scenarios = (await fetchScenariosAction()) ?? [];
                internal.flowData.scenarios = scenarios.map((item) => ({
                    id: item.id,
                    nature: item.nature,
                    targetLanguage: item.targetLanguage,
                    sentences: (item.sentences ?? []).map((sentence) => ({
                        id: sentence.id,
                        sentence: sentence.sentence,
                        translation: sentence.translation,
                    })),
                }));

                if (internal.flowData.scenarios.length === 0) {
                    internal.flowData.selectedScenarioId = null;
                } else {
                    const currentId = internal.flowData.selectedScenarioId;
                    const hasCurrent = !!currentId && internal.flowData.scenarios.some((scenario) => scenario.id === currentId);
                    internal.flowData.selectedScenarioId = hasCurrent ? currentId : internal.flowData.scenarios[0].id;
                }
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to load scenarios";
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
            scenarios: internal.flowData.scenarios,
            selectedScenarioId: internal.flowData.selectedScenarioId,
            error: internal.flowData.ui.error,
            isLoading: internal.flowData.ui.isLoading,
        }),
        view: ScenariosListView,
        onOutput: (_domain, internal, output: ScenariosListViewOutput, events) => {
            if (output.type === "reload") {
                return "fetchScenarios";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayList";
            }

            if (output.type === "openCreate") {
                events?.screenMode.emit("create");
                return "displayList";
            }

            if (output.type === "setSelectedScenario") {
                internal.flowData.selectedScenarioId = output.scenarioId;
                return "displayList";
            }

            if (output.type === "openEdit") {
                events?.selectedScenarioId.emit(output.scenarioId);
                events?.screenMode.emit("edit");
                return "displayList";
            }
        },
    },
}, {
    start: "fetchScenarios",
    channelTransitions: {
        scenariosRefresh: () => "fetchScenarios",
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "list") {
                return "fetchScenarios";
            }
            return "displayList";
        },
    },
    createInternalData: createScenariosListInternalData,
});
