import { defineFlow } from "@myriadcodelabs/uiflow";
import { UpdateVocabularyRequest } from "@/lib/types/requests/UpdateVocabularyRequest";
import fetchVocabularyAction from "../_server_actions/fetchVocabularyAction";
import updateVocabularyAction from "../_server_actions/updateVocabularyAction";
import EditVocabularyView, { EditVocabularyViewOutput } from "../_client_components/EditVocabularyView";
import { ScreenMode, VocabularyDraft } from "../types";
import {
    createInitialVocabularyDraft,
    isVocabularyDraftValid,
    mapVocabularyResponseToDraft,
    normalizeVocabularyDraft,
} from "./vocabularyDraftOps";

type EditVocabularyDomainData = Record<string, never>;

interface EditVocabularyInternalData {
    flowData: {
        selectedVocabularyLabel: string | null;
        draft: VocabularyDraft;
        ui: {
            isLoading: boolean;
            isSaving: boolean;
            fetchError: string | null;
            saveError: string | null;
        };
    };
}

function createEditVocabularyInternalData(): EditVocabularyInternalData {
    return {
        flowData: {
            selectedVocabularyLabel: null,
            draft: createInitialVocabularyDraft(),
            ui: {
                isLoading: false,
                isSaving: false,
                fetchError: null,
                saveError: null,
            },
        },
    };
}

export const editVocabularyFlow = defineFlow<EditVocabularyDomainData, EditVocabularyInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            selectedVocabularyId: (events?.selectedVocabularyId?.get() as string | null | undefined) ?? null,
            selectedVocabularyLabel: internal.flowData.selectedVocabularyLabel,
            draft: internal.flowData.draft,
            fetchError: internal.flowData.ui.fetchError,
            saveError: internal.flowData.ui.saveError,
            isLoading: internal.flowData.ui.isLoading,
            isSaving: internal.flowData.ui.isSaving,
            canSubmit: isVocabularyDraftValid(internal.flowData.draft),
        }),
        view: EditVocabularyView,
        onOutput: (_domain, internal, output: EditVocabularyViewOutput, events) => {
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

                if (!isVocabularyDraftValid(output.draft)) {
                    internal.flowData.ui.saveError = "Surface and translation are required";
                    return "displayForm";
                }

                internal.flowData.draft = output.draft;
                internal.flowData.ui.saveError = null;
                internal.flowData.ui.isSaving = true;
                return "saveVocabulary";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.fetchError = null;
                internal.flowData.ui.saveError = null;
                return "displayForm";
            }
        },
    },

    fetchVocabulary: {
        input: (_domain, _internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            selectedVocabularyId: (events?.selectedVocabularyId?.get() as string | null | undefined) ?? null,
        }),
        action: async ({ mode, selectedVocabularyId }: { mode: ScreenMode; selectedVocabularyId: string | null }, _domain, internal) => {
            if (mode !== "edit" || !selectedVocabularyId) {
                return { ok: true };
            }

            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.fetchError = null;
            internal.flowData.ui.saveError = null;

            try {
                const vocabulary = await fetchVocabularyAction(selectedVocabularyId);
                if (!vocabulary) {
                    throw new Error("Failed to load vocabulary entry");
                }

                internal.flowData.selectedVocabularyLabel = vocabulary.surface;
                internal.flowData.draft = mapVocabularyResponseToDraft(vocabulary);
            } catch (err) {
                internal.flowData.ui.fetchError = err instanceof Error ? err.message : "Failed to load vocabulary entry";
                internal.flowData.selectedVocabularyLabel = null;
                internal.flowData.draft = createInitialVocabularyDraft();
            } finally {
                internal.flowData.ui.isLoading = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayForm",
    },

    saveVocabulary: {
        input: (_domain, internal, events) => ({
            selectedVocabularyId: (events?.selectedVocabularyId?.get() as string | null | undefined) ?? null,
            draft: normalizeVocabularyDraft(internal.flowData.draft),
        }),
        action: async (
            { selectedVocabularyId, draft }: { selectedVocabularyId: string | null; draft: VocabularyDraft },
            _domain,
            internal
        ) => {
            if (!selectedVocabularyId) {
                internal.flowData.ui.saveError = "Missing selected vocabulary entry";
                internal.flowData.ui.isSaving = false;
                return { ok: true };
            }

            try {
                const requestBody: UpdateVocabularyRequest = {
                    surface: draft.surface,
                    translation: draft.translation,
                    entryKind: draft.entryKind,
                    notes: draft.notes,
                    exampleSentences: draft.exampleSentences.map((item) => ({
                        id: item.id,
                        sentence: item.sentence,
                        translation: item.translation,
                    })),
                };

                const updatedVocabulary = await updateVocabularyAction(selectedVocabularyId, requestBody);
                if (!updatedVocabulary) {
                    throw new Error("Failed to save vocabulary entry");
                }
            } catch (err) {
                internal.flowData.ui.saveError = err instanceof Error ? err.message : "Failed to save vocabulary entry";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            if (!internal.flowData.ui.saveError) {
                events?.vocabularyRefresh.emit((count: number) => count + 1);
                events?.screenMode.emit("list");
            }
            return "displayForm";
        },
    },
}, {
    start: "displayForm",
    channelTransitions: {
        selectedVocabularyId: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchVocabulary";
            }
        },
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchVocabulary";
            }
            return "displayForm";
        },
        vocabularyRefresh: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "edit") {
                return "fetchVocabulary";
            }
        },
    },
    createInternalData: createEditVocabularyInternalData,
});
