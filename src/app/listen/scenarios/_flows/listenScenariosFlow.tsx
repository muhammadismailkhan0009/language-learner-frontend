import { defineFlow } from "@myriadcodelabs/uiflow";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";
import fetchScenariosAction from "../_server_actions/fetchScenariosAction";
import ListenScenariosView, { ListenScenariosViewOutput } from "../_client_components/ListenScenariosView";

type ListenScenariosDomainData = Record<string, never>;

type ListenScenariosInternalData = {
    flowData: {
        scenarios: ScenarioResponse[];
        ui: {
            isLoading: boolean;
            error: string | null;
        };
    };
};

function createInternalData(): ListenScenariosInternalData {
    return {
        flowData: {
            scenarios: [],
            ui: {
                isLoading: false,
                error: null,
            },
        },
    };
}

export const listenScenariosFlow = defineFlow<ListenScenariosDomainData, ListenScenariosInternalData>(
    {
        loadScenarios: {
            input: () => ({}),
            action: async (_input, _domain, internal) => {
                internal.flowData.ui.isLoading = true;
                internal.flowData.ui.error = null;

                try {
                    const scenarios = (await fetchScenariosAction()) ?? [];
                    internal.flowData.scenarios = scenarios;
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to load scenarios";
                } finally {
                    internal.flowData.ui.isLoading = false;
                }

                return { ok: true };
            },
            onOutput: () => "showScenarios",
        },

        showScenarios: {
            input: (_domain, internal) => ({
                scenarios: internal.flowData.scenarios,
                isLoading: internal.flowData.ui.isLoading,
                error: internal.flowData.ui.error,
            }),
            view: ListenScenariosView,
            onOutput: (_domain, internal, output: ListenScenariosViewOutput) => {
                if (output.type === "reload") {
                    return "loadScenarios";
                }

                if (output.type === "clearError") {
                    internal.flowData.ui.error = null;
                    return "showScenarios";
                }
            },
        },
    },
    {
        start: "loadScenarios",
        createInternalData,
    }
);
