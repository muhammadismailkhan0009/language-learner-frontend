import { defineFlow } from "@myriadcodelabs/uiflow";
import { fetchSentences } from "@/lib/clientbackendApiCalls";
import { SentenceGroup } from "@/lib/types/responses/Sentence";
import SentencesView, { SentencesViewOutput } from "../_client_components/SentencesView";
import ErrorUI from "../_client_components/ErrorUI";

interface SentencesData {
    flowData: FlowDataHolder;
}

interface FlowDataHolder {
    sentences: SentenceGroup[];
    error: string | null;
    selectedScenario: string;
    selectedFunction: string;
}

const SentenceFilterOps = {
    getScenarios: (sentences: SentenceGroup[]) => {
        const unique = Array.from(new Set(sentences.map((g) => g.scenario)));
        return unique.sort();
    },

    getFunctions: (sentences: SentenceGroup[], selectedScenario: string) => {
        const functionsSet = new Set<string>();

        if (selectedScenario === "all") {
            sentences.forEach((group) => {
                group.functions.forEach((func) => {
                    functionsSet.add(func.function);
                });
            });
        } else {
            const selectedGroup = sentences.find((g) => g.scenario === selectedScenario);
            if (selectedGroup) {
                selectedGroup.functions.forEach((func) => {
                    functionsSet.add(func.function);
                });
            }
        }

        return Array.from(functionsSet).sort();
    },

    isFunctionAvailable: (
        sentences: SentenceGroup[],
        selectedScenario: string,
        selectedFunction: string
    ) => {
        if (selectedFunction === "all") return true;
        const availableFunctions = SentenceFilterOps.getFunctions(sentences, selectedScenario);
        return availableFunctions.includes(selectedFunction);
    },

    getFilteredSentences: (
        sentences: SentenceGroup[],
        selectedScenario: string,
        selectedFunction: string
    ) => {
        return sentences
            .filter((group) => {
                if (selectedScenario !== "all" && group.scenario !== selectedScenario) {
                    return false;
                }
                if (selectedFunction !== "all") {
                    return group.functions.some((func) => func.function === selectedFunction);
                }
                return true;
            })
            .map((group) => {
                if (selectedFunction !== "all") {
                    return {
                        ...group,
                        functions: group.functions.filter(
                            (func) => func.function === selectedFunction
                        ),
                    };
                }
                return group;
            });
    },
};

export const sentencesFlow = defineFlow<SentencesData>({
    fetchSentences: {
        input: (data) => ({}),
        action: async (_, data) => {
            try {
                data.flowData.error = null;
                const response = await fetchSentences();
                if (response.status === 200) {
                    data.flowData.sentences = response.data.response;
                    data.flowData.selectedScenario = "all";
                    data.flowData.selectedFunction = "all";
                    return { ok: true };
                } else {
                    data.flowData.error = "Failed to fetch sentences";
                    return { ok: false };
                }
            } catch (err) {
                data.flowData.error = err instanceof Error ? err.message : "An error occurred";
                return { ok: false };
            }
        },
        onOutput: (data, output) => {
            if (!output.ok) {
                return "error";
            }
            return "displaySentences";
        }
    },

    error: {
        input: (data) => ({
            error: data.flowData.error || "An error occurred"
        }),
        view: ErrorUI,
        onOutput: () => { }
    },

    displaySentences: {
        input: (data) => {
            const scenarios = SentenceFilterOps.getScenarios(data.flowData.sentences);
            const functions = SentenceFilterOps.getFunctions(
                data.flowData.sentences,
                data.flowData.selectedScenario
            );
            const filteredSentences = SentenceFilterOps.getFilteredSentences(
                data.flowData.sentences,
                data.flowData.selectedScenario,
                data.flowData.selectedFunction
            );

            return {
                scenarios,
                functions,
                selectedScenario: data.flowData.selectedScenario,
                selectedFunction: data.flowData.selectedFunction,
                filteredSentences,
            };
        },
        view: SentencesView,
        onOutput: (data, output: SentencesViewOutput) => {
            if (output.type === "setScenario") {
                data.flowData.selectedScenario = output.scenario;

                if (
                    output.scenario === "all" ||
                    !SentenceFilterOps.isFunctionAvailable(
                        data.flowData.sentences,
                        output.scenario,
                        data.flowData.selectedFunction
                    )
                ) {
                    data.flowData.selectedFunction = "all";
                }

                return "displaySentences";
            }

            if (output.type === "setFunction") {
                data.flowData.selectedFunction = output.func;
                return "displaySentences";
            }
        },
    },

}, { start: "fetchSentences" });
