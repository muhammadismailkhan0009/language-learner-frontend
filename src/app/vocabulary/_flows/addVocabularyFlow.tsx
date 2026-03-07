import { defineFlow } from "@myriadcodelabs/uiflow";
import { AddVocabularyRequest } from "@/lib/types/requests/AddVocabularyRequest";
import createVocabularyAction from "../_server_actions/createVocabularyAction";
import AddVocabularyView, { AddVocabularyViewOutput } from "../_client_components/AddVocabularyView";
import { ScreenMode, VocabularyDraft } from "../types";
import { createInitialVocabularyDraft, isVocabularyDraftValid, normalizeVocabularyDraft } from "./vocabularyDraftOps";

type AddVocabularyDomainData = Record<string, never>;

interface AddVocabularyInternalData {
    flowData: {
        draft: VocabularyDraft;
        ui: {
            isSaving: boolean;
            error: string | null;
        };
    };
}

function createAddVocabularyInternalData(): AddVocabularyInternalData {
    return {
        flowData: {
            draft: createInitialVocabularyDraft(),
            ui: {
                isSaving: false,
                error: null,
            },
        },
    };
}

export const addVocabularyFlow = defineFlow<AddVocabularyDomainData, AddVocabularyInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            draft: internal.flowData.draft,
            error: internal.flowData.ui.error,
            isSaving: internal.flowData.ui.isSaving,
            canSubmit: isVocabularyDraftValid(internal.flowData.draft),
        }),
        view: AddVocabularyView,
        onOutput: (_domain, internal, output: AddVocabularyViewOutput, events) => {
            if (output.type === "cancel") {
                internal.flowData.ui.error = null;
                events?.screenMode.emit("list");
                return "displayForm";
            }

            if (output.type === "submit") {
                if (internal.flowData.ui.isSaving) {
                    return "displayForm";
                }

                if (!isVocabularyDraftValid(output.draft)) {
                    internal.flowData.ui.error = "Surface and translation are required";
                    return "displayForm";
                }

                internal.flowData.draft = output.draft;
                internal.flowData.ui.error = null;
                internal.flowData.ui.isSaving = true;
                return "saveVocabulary";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayForm";
            }
        },
    },

    saveVocabulary: {
        input: (_domain, internal) => ({
            draft: normalizeVocabularyDraft(internal.flowData.draft),
        }),
        action: async ({ draft }: { draft: VocabularyDraft }, _domain, internal) => {
            try {
                const requestBody: AddVocabularyRequest = {
                    surface: draft.surface,
                    translation: draft.translation,
                    entryKind: draft.entryKind,
                    notes: draft.notes,
                    exampleSentences: draft.exampleSentences.map((item) => ({
                        sentence: item.sentence,
                        translation: item.translation,
                    })),
                };

                const createdVocabulary = await createVocabularyAction(requestBody);
                if (!createdVocabulary) {
                    throw new Error("Failed to create vocabulary entry");
                }
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to create vocabulary entry";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            if (!internal.flowData.ui.error) {
                internal.flowData.draft = createInitialVocabularyDraft();
                events?.vocabularyRefresh.emit((count: number) => count + 1);
                events?.screenMode.emit("list");
            }
            return "displayForm";
        },
    },
}, {
    start: "displayForm",
    channelTransitions: {
        screenMode: () => "displayForm",
    },
    createInternalData: createAddVocabularyInternalData,
});
