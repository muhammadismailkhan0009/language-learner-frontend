import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchScenarioAction from "../_server_actions/fetchScenarioAction";
import editScenarioAction from "../_server_actions/editScenarioAction";
import EditScenarioView, { EditScenarioViewOutput } from "../_client_components/EditScenarioView";
import { ScenarioDraft, ScreenMode } from "../types";
import { createEmptySentence, createInitialDraft, isDraftValid, mapScenarioToDraft, normalizeDraft } from "./scenarioDraftOps";
import { EditScenarioRequest } from "@/lib/types/requests/EditScenarioRequest";

type EditScenarioDomainData = Record<string, never>;

interface EditScenarioInternalData {
    flowData: {
        selectedScenarioNature: string | null;
        draft: ScenarioDraft;
        ui: {
            isLoading: boolean;
            isSaving: boolean;
            fetchError: string | null;
            saveError: string | null;
        };
    };
}

function createEditScenarioInternalData(): EditScenarioInternalData {
    return {
        flowData: {
            selectedScenarioNature: null,
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

export const editScenarioFlow = defineFlow<EditScenarioDomainData, EditScenarioInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            selectedScenarioId: (events?.selectedScenarioId?.get() as string | null | undefined) ?? null,
            selectedScenarioNature: internal.flowData.selectedScenarioNature,
            draft: internal.flowData.draft,
            fetchError: internal.flowData.ui.fetchError,
            saveError: internal.flowData.ui.saveError,
            isLoading: internal.flowData.ui.isLoading,
            isSaving: internal.flowData.ui.isSaving,
            canSubmit: isDraftValid(internal.flowData.draft),
        }),
        view: EditScenarioView,
        onOutput: (_domain, internal, output: EditScenarioViewOutput, events) => {
            if (output.type === "cancel") {
                internal.flowData.ui.fetchError = null;
                internal.flowData.ui.saveError = null;
                events?.screenMode.emit("list");
                return "displayForm";
            }

            if (output.type === "setNature") {
                internal.flowData.draft.nature = output.value;
                return "displayForm";
            }

            if (output.type === "setTargetLanguage") {
                internal.flowData.draft.targetLanguage = output.value;
                return "displayForm";
            }

            if (output.type === "setSentence") {
                const sentence = internal.flowData.draft.sentences[output.index];
                if (sentence) {
                    sentence[output.field] = output.value;
                }
                return "displayForm";
            }

            if (output.type === "addSentence") {
                internal.flowData.draft.sentences.push(createEmptySentence());
                return "displayForm";
            }

            if (output.type === "removeSentence") {
                internal.flowData.draft.sentences = internal.flowData.draft.sentences.filter((_, index) => index !== output.index);
                if (internal.flowData.draft.sentences.length === 0) {
                    internal.flowData.draft.sentences = [createEmptySentence()];
                }
                return "displayForm";
            }

            if (output.type === "submit") {
                if (internal.flowData.ui.isSaving) {
                    return "displayForm";
                }

                if (!isDraftValid(internal.flowData.draft)) {
                    internal.flowData.ui.saveError = "Complete required fields before saving";
                    return "displayForm";
                }

                internal.flowData.ui.saveError = null;
                internal.flowData.ui.isSaving = true;
                return "saveScenario";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.fetchError = null;
                internal.flowData.ui.saveError = null;
                return "displayForm";
            }
        },
    },

    fetchScenario: {
        input: (_domain, _internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            selectedScenarioId: (events?.selectedScenarioId?.get() as string | null | undefined) ?? null,
        }),
        action: async ({ mode, selectedScenarioId }, _domain, internal) => {
            if (mode !== "edit" || !selectedScenarioId) {
                return { ok: true };
            }

            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.fetchError = null;
            internal.flowData.ui.saveError = null;

            try {
                const scenario = await fetchScenarioAction(selectedScenarioId);
                if (!scenario) {
                    throw new Error("Failed to load scenario");
                }

                internal.flowData.selectedScenarioNature = scenario.nature;
                internal.flowData.draft = mapScenarioToDraft(scenario);
            } catch (err) {
                internal.flowData.ui.fetchError = err instanceof Error ? err.message : "Failed to load scenario";
                internal.flowData.selectedScenarioNature = null;
                internal.flowData.draft = createInitialDraft();
            } finally {
                internal.flowData.ui.isLoading = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayForm",
    },

    saveScenario: {
        input: (_domain, internal, events) => ({
            selectedScenarioId: (events?.selectedScenarioId?.get() as string | null | undefined) ?? null,
            draft: normalizeDraft(internal.flowData.draft),
        }),
        action: async ({ selectedScenarioId, draft }, _domain, internal) => {
            if (!selectedScenarioId) {
                internal.flowData.ui.saveError = "Missing selected scenario";
                internal.flowData.ui.isSaving = false;
                return { ok: true };
            }

            try {
                const requestBody: EditScenarioRequest = {
                    nature: draft.nature,
                    targetLanguage: draft.targetLanguage,
                    sentences: draft.sentences.map((item) => ({
                        id: item.id,
                        sentence: item.sentence,
                        translation: item.translation,
                    })),
                };

                const updatedScenario = await editScenarioAction(selectedScenarioId, requestBody);
                if (!updatedScenario) {
                    throw new Error("Failed to update scenario");
                }
            } catch (err) {
                internal.flowData.ui.saveError = err instanceof Error ? err.message : "Failed to update scenario";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            if (!internal.flowData.ui.saveError) {
                events?.scenariosRefresh.emit((count: number) => count + 1);
                events?.screenMode.emit("list");
            }
            return "displayForm";
        },
    },
}, {
    start: "displayForm",
    channelTransitions: {
        selectedScenarioId: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchScenario";
            }
        },
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchScenario";
            }
            return "displayForm";
        },
        scenariosRefresh: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchScenario";
            }
        },
    },
    createInternalData: createEditScenarioInternalData,
});

