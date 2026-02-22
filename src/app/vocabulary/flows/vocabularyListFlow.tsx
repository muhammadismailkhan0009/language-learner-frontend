import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchVocabulariesAction from "../_server_actions/fetchVocabulariesAction";
import fetchPublicVocabulariesAction from "../_server_actions/fetchPublicVocabulariesAction";
import publishVocabularyAction from "../_server_actions/publishVocabularyAction";
import createVocabularyFlashcardsAction from "../_server_actions/createVocabularyFlashcardsAction";
import addPublicVocabularyToPrivateAction from "../_server_actions/addPublicVocabularyToPrivateAction";
import VocabularyListView, { VocabularyListViewOutput } from "../_client_components/VocabularyListView";
import { PublicVocabularyListItem, ScreenMode, VocabularyListItem } from "../types";

type VocabularyListDomainData = Record<string, never>;

interface VocabularyListInternalData {
    flowData: {
        vocabularies: VocabularyListItem[];
        publicVocabularies: PublicVocabularyListItem[];
        selectedVocabularyId: string | null;
        publishRequest: {
            vocabularyId: string | null;
            adminKey: string;
        };
        publicToPrivateRequest: {
            publicVocabularyId: string | null;
        };
        flashcardRequest: {
            vocabularyId: string | null;
        };
        ui: {
            isLoading: boolean;
            isPublishing: boolean;
            isAddingToFlashcards: boolean;
            isAddingPublicToPrivate: boolean;
            error: string | null;
            publishError: string | null;
            publishSuccess: string | null;
            addToFlashcardsError: string | null;
            addToFlashcardsSuccess: string | null;
        };
    };
}

function createVocabularyListInternalData(): VocabularyListInternalData {
    return {
        flowData: {
            vocabularies: [],
            publicVocabularies: [],
            selectedVocabularyId: null,
            publishRequest: {
                vocabularyId: null,
                adminKey: "",
            },
            publicToPrivateRequest: {
                publicVocabularyId: null,
            },
            flashcardRequest: {
                vocabularyId: null,
            },
            ui: {
                isLoading: false,
                isPublishing: false,
                isAddingToFlashcards: false,
                isAddingPublicToPrivate: false,
                error: null,
                publishError: null,
                publishSuccess: null,
                addToFlashcardsError: null,
                addToFlashcardsSuccess: null,
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
                const [vocabularies, publicVocabularies] = await Promise.all([
                    fetchVocabulariesAction(),
                    fetchPublicVocabulariesAction(),
                ]);
                const privateVocabularyList = vocabularies ?? [];

                internal.flowData.vocabularies = privateVocabularyList.map((item) => ({
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

                internal.flowData.publicVocabularies = (publicVocabularies ?? []).map((item) => ({
                    publicVocabularyId: item.publicVocabularyId,
                    sourceVocabularyId: item.sourceVocabularyId,
                    publishedByUserId: item.publishedByUserId,
                    publishedAt: item.publishedAt,
                    surface: item.surface ?? "",
                    translation: item.translation ?? "",
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
            publicVocabularies: internal.flowData.publicVocabularies,
            isPublishing: internal.flowData.ui.isPublishing,
            publishError: internal.flowData.ui.publishError,
            publishSuccess: internal.flowData.ui.publishSuccess,
            isAddingToFlashcards: internal.flowData.ui.isAddingToFlashcards,
            isAddingPublicToPrivate: internal.flowData.ui.isAddingPublicToPrivate,
            addToFlashcardsError: internal.flowData.ui.addToFlashcardsError,
            addToFlashcardsSuccess: internal.flowData.ui.addToFlashcardsSuccess,
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

            if (output.type === "clearPublishStatus") {
                internal.flowData.ui.publishError = null;
                internal.flowData.ui.publishSuccess = null;
                internal.flowData.ui.addToFlashcardsError = null;
                internal.flowData.ui.addToFlashcardsSuccess = null;
                return "displayList";
            }

            if (output.type === "setSelectedVocabulary") {
                internal.flowData.selectedVocabularyId = output.vocabularyId;
                internal.flowData.ui.publishError = null;
                internal.flowData.ui.publishSuccess = null;
                internal.flowData.ui.addToFlashcardsError = null;
                internal.flowData.ui.addToFlashcardsSuccess = null;
                return "displayList";
            }

            if (output.type === "addToFlashcards") {
                if (internal.flowData.ui.isAddingToFlashcards) {
                    return "displayList";
                }

                internal.flowData.flashcardRequest = {
                    vocabularyId: output.vocabularyId,
                };
                internal.flowData.ui.isAddingToFlashcards = true;
                internal.flowData.ui.addToFlashcardsError = null;
                internal.flowData.ui.addToFlashcardsSuccess = null;
                return "addToFlashcards";
            }

            if (output.type === "addPublicToPrivate") {
                if (internal.flowData.ui.isAddingPublicToPrivate) {
                    return "displayList";
                }

                internal.flowData.publicToPrivateRequest = {
                    publicVocabularyId: output.publicVocabularyId,
                };
                internal.flowData.ui.isAddingPublicToPrivate = true;
                internal.flowData.ui.error = null;
                return "addPublicToPrivate";
            }

            if (output.type === "publishVocabulary") {
                if (internal.flowData.ui.isPublishing) {
                    return "displayList";
                }

                if (!output.adminKey.trim()) {
                    internal.flowData.ui.publishError = "Admin key is required to publish vocabulary";
                    internal.flowData.ui.publishSuccess = null;
                    return "displayList";
                }

                internal.flowData.publishRequest = {
                    vocabularyId: output.vocabularyId,
                    adminKey: output.adminKey.trim(),
                };
                internal.flowData.ui.isPublishing = true;
                internal.flowData.ui.publishError = null;
                internal.flowData.ui.publishSuccess = null;
                return "publishVocabulary";
            }

            if (output.type === "openEdit") {
                events?.selectedVocabularyId.emit(output.vocabularyId);
                events?.screenMode.emit("edit");
                return "displayList";
            }
        },
    },

    publishVocabulary: {
        input: (_domain, internal) => ({
            publishRequest: internal.flowData.publishRequest,
        }),
        action: async (
            { publishRequest }: { publishRequest: { vocabularyId: string | null; adminKey: string } },
            _domain,
            internal
        ) => {
            if (!publishRequest.vocabularyId) {
                internal.flowData.ui.publishError = "Missing selected vocabulary";
                internal.flowData.ui.isPublishing = false;
                return { ok: true };
            }

            try {
                const response = await publishVocabularyAction(publishRequest.vocabularyId, { adminKey: publishRequest.adminKey });
                if (!response) {
                    throw new Error("Failed to publish vocabulary");
                }

                internal.flowData.ui.publishSuccess = `Published "${response.surface}" to public vocabulary`;
            } catch (err) {
                internal.flowData.ui.publishError = err instanceof Error ? err.message : "Failed to publish vocabulary";
            } finally {
                internal.flowData.ui.isPublishing = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "fetchVocabularies",
    },
    addToFlashcards: {
        input: (_domain, internal) => ({
            vocabularyId: internal.flowData.flashcardRequest.vocabularyId,
        }),
        action: async ({ vocabularyId }: { vocabularyId: string | null }, _domain, internal) => {
            if (!vocabularyId) {
                internal.flowData.ui.addToFlashcardsError = "Missing selected vocabulary";
                internal.flowData.ui.isAddingToFlashcards = false;
                return { ok: true };
            }

            const vocabulary = internal.flowData.vocabularies.find((item) => item.id === vocabularyId);
            const label = vocabulary?.surface ?? "Vocabulary entry";

            try {
                const ok = await createVocabularyFlashcardsAction(vocabularyId);
                if (!ok) {
                    throw new Error("Failed to add vocabulary to flashcards");
                }

                internal.flowData.ui.addToFlashcardsSuccess = `Added "${label}" to flashcards`;
            } catch (err) {
                internal.flowData.ui.addToFlashcardsError =
                    err instanceof Error ? err.message : "Failed to add vocabulary to flashcards";
            } finally {
                internal.flowData.ui.isAddingToFlashcards = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayList",
    },
    addPublicToPrivate: {
        input: (_domain, internal) => ({
            publicVocabularyId: internal.flowData.publicToPrivateRequest.publicVocabularyId,
        }),
        action: async ({ publicVocabularyId }: { publicVocabularyId: string | null }, _domain, internal) => {
            if (!publicVocabularyId) {
                internal.flowData.ui.error = "Missing public vocabulary selection";
                internal.flowData.ui.isAddingPublicToPrivate = false;
                return { ok: true };
            }

            try {
                const response = await addPublicVocabularyToPrivateAction(publicVocabularyId);
                if (!response) {
                    throw new Error("Failed to add public vocabulary to private list");
                }

                const exists = internal.flowData.vocabularies.some((item) => item.id === response.id);
                if (!exists) {
                    internal.flowData.vocabularies = [
                        {
                            id: response.id,
                            surface: response.surface ?? "",
                            translation: response.translation ?? "",
                            entryKind: response.entryKind ?? "WORD",
                            notes: response.notes ?? "",
                            exampleSentences: (response.exampleSentences ?? []).map((sentence) => ({
                                id: sentence.id,
                                sentence: sentence.sentence ?? "",
                                translation: sentence.translation ?? "",
                            })),
                        },
                        ...internal.flowData.vocabularies,
                    ];

                    if (!internal.flowData.selectedVocabularyId) {
                        internal.flowData.selectedVocabularyId = response.id;
                    }
                }
            } catch (err) {
                internal.flowData.ui.error =
                    err instanceof Error ? err.message : "Failed to add public vocabulary to private list";
            } finally {
                internal.flowData.ui.isAddingPublicToPrivate = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayList",
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
