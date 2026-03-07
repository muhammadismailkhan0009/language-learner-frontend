import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchScenarioAction from "../_server_actions/fetchScenarioAction";
import editScenarioAction from "../_server_actions/editScenarioAction";
import EditScenarioView, { EditScenarioViewOutput } from "../_client_components/EditScenarioView";
import { ScenarioDraft, ScreenMode } from "../types";
import { createInitialDraft, isDraftValid, mapScenarioToDraft, normalizeDraft } from "./scenarioDraftOps";
import { EditScenarioRequest } from "@/lib/types/requests/EditScenarioRequest";
import { deleteAudioCacheForCard } from "@/lib/ttsGoogle";

type EditScenarioDomainData = Record<string, never>;

interface EditScenarioInternalData {
    flowData: {
        selectedScenarioNature: string | null;
        originalTargetLanguage: string;
        originalSentences: Array<{ id: string; sentence: string }>;
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
            originalTargetLanguage: "en",
            originalSentences: [],
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

            if (output.type === "submit") {
                if (internal.flowData.ui.isSaving) {
                    return "displayForm";
                }

                const draftToSave: ScenarioDraft = {
                    ...output.draft,
                    targetLanguage: "de",
                };

                if (!isDraftValid(draftToSave)) {
                    internal.flowData.ui.saveError = "Complete required fields before saving";
                    return "displayForm";
                }

                internal.flowData.draft = draftToSave;
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
        action: async (
            { mode, selectedScenarioId }: { mode: ScreenMode; selectedScenarioId: string | null },
            _domain,
            internal
        ) => {
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
                internal.flowData.originalTargetLanguage = scenario.targetLanguage ?? "en";
                internal.flowData.originalSentences = (scenario.sentences ?? [])
                    .filter((item) => !!item.id)
                    .map((item) => ({
                        id: item.id,
                        sentence: item.sentence ?? "",
                    }));
                internal.flowData.draft = mapScenarioToDraft(scenario);
            } catch (err) {
                internal.flowData.ui.fetchError = err instanceof Error ? err.message : "Failed to load scenario";
                internal.flowData.selectedScenarioNature = null;
                internal.flowData.originalTargetLanguage = "en";
                internal.flowData.originalSentences = [];
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
        action: async (
            { selectedScenarioId, draft }: { selectedScenarioId: string | null; draft: ScenarioDraft },
            _domain,
            internal
        ) => {
            if (!selectedScenarioId) {
                internal.flowData.ui.saveError = "Missing selected scenario";
                internal.flowData.ui.isSaving = false;
                return { ok: true };
            }

            try {
                const requestBody: EditScenarioRequest = {
                    nature: draft.nature,
                    targetLanguage: "de",
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

                const oldLang = internal.flowData.originalTargetLanguage || "en";
                const newLang = "de";
                const nextSentencesById = new Map(
                    draft.sentences.filter((item) => !!item.id).map((item) => [item.id as string, item.sentence])
                );

                for (const previous of internal.flowData.originalSentences) {
                    const nextSentence = nextSentencesById.get(previous.id);
                    const wasRemoved = !nextSentence;
                    const wasEdited = !!nextSentence && nextSentence !== previous.sentence;
                    const languageChanged = oldLang !== newLang;

                    if (wasRemoved || wasEdited || languageChanged) {
                        await deleteAudioCacheForCard(previous.id, oldLang);
                    }
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
