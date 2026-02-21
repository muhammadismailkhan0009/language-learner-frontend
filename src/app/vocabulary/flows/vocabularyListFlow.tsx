import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchVocabulariesAction from "../_server_actions/fetchVocabulariesAction";
import VocabularyListView, { VocabularyListViewOutput } from "../_client_components/VocabularyListView";
import { ScreenMode, VocabularyListItem } from "../types";

type VocabularyListDomainData = Record<string, never>;

interface VocabularyListInternalData {
    flowData: {
        vocabularies: VocabularyListItem[];
        selectedVocabularyId: string | null;
        ui: {
            isLoading: boolean;
            error: string | null;
        };
    };
}

function createVocabularyListInternalData(): VocabularyListInternalData {
    return {
        flowData: {
            vocabularies: [],
            selectedVocabularyId: null,
            ui: {
                isLoading: false,
                error: null,
            },
        },
    };
}

export const vocabularyListFlow = defineFlow<VocabularyListDomainData, VocabularyListInternalData>({
    fetchVocabularies: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.error = null;

            try {
                const vocabularies = (await fetchVocabulariesAction()) ?? [];
                internal.flowData.vocabularies = vocabularies.map((item) => ({
                    id: item.id,
                    surface: item.surface ?? "",
                    translation: item.translation ?? "",
                    entryKind: item.entryKind ?? "WORD",
                    notes: item.notes ?? "",
                    exampleSentences: (item.exampleSentences ?? []).map((sentence) => ({
                        id: sentence.id,
                        sentence: sentence.sentence ?? "",
                        translation: sentence.translation ?? "",
                    })),
                }));

                if (internal.flowData.vocabularies.length === 0) {
                    internal.flowData.selectedVocabularyId = null;
                } else {
                    const currentId = internal.flowData.selectedVocabularyId;
                    const hasCurrent = !!currentId && internal.flowData.vocabularies.some((item) => item.id === currentId);
                    internal.flowData.selectedVocabularyId = hasCurrent ? currentId : internal.flowData.vocabularies[0].id;
                }
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to load vocabulary entries";
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
            vocabularies: internal.flowData.vocabularies,
            selectedVocabularyId: internal.flowData.selectedVocabularyId,
            error: internal.flowData.ui.error,
            isLoading: internal.flowData.ui.isLoading,
        }),
        view: VocabularyListView,
        onOutput: (_domain, internal, output: VocabularyListViewOutput, events) => {
            if (output.type === "reload") {
                return "fetchVocabularies";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayList";
            }

            if (output.type === "openCreate") {
                events?.screenMode.emit("create");
                return "displayList";
            }

            if (output.type === "setSelectedVocabulary") {
                internal.flowData.selectedVocabularyId = output.vocabularyId;
                return "displayList";
            }

            if (output.type === "openEdit") {
                events?.selectedVocabularyId.emit(output.vocabularyId);
                events?.screenMode.emit("edit");
                return "displayList";
            }
        },
    },
}, {
    start: "fetchVocabularies",
    channelTransitions: {
        vocabularyRefresh: () => "fetchVocabularies",
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as ScreenMode | undefined) ?? "list";
            if (mode === "list") {
                return "fetchVocabularies";
            }
            return "displayList";
        },
    },
    createInternalData: createVocabularyListInternalData,
});
