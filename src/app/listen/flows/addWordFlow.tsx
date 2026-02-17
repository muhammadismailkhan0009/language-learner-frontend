import { defineFlow } from "@myriadcodelabs/uiflow";
import { saveWordToListenTo } from "@/lib/clientbackendApiCalls";
import AddWordView, { AddWordViewOutput } from "../_client_components/AddWordView";

type AddWordDomainData = Record<string, never>;

interface AddWordInternalData {
    flowData: {
        draft: string;
        ui: {
            displayForm: {
                error: string | null;
                successMessage: string | null;
                isSaving: boolean;
            };
        };
    };
}

function createAddWordInternalData(): AddWordInternalData {
    return {
        flowData: {
            draft: "",
            ui: {
                displayForm: {
                    error: null,
                    successMessage: null,
                    isSaving: false,
                },
            },
        },
    };
}

export const addWordFlow = defineFlow<AddWordDomainData, AddWordInternalData>({
    displayForm: {
        input: (_domain, internal) => ({
            draft: internal.flowData.draft,
            error: internal.flowData.ui.displayForm.error,
            successMessage: internal.flowData.ui.displayForm.successMessage,
            isSaving: internal.flowData.ui.displayForm.isSaving,
        }),
        view: AddWordView,
        onOutput: (_domain, internal, output: AddWordViewOutput) => {
            const ui = internal.flowData.ui.displayForm;

            if (output.type === "setDraft") {
                internal.flowData.draft = output.value;
                ui.successMessage = null;
                return "displayForm";
            }

            if (output.type === "clearError") {
                ui.error = null;
                return "displayForm";
            }

            if (output.type === "submit") {
                if (!internal.flowData.draft.trim() || ui.isSaving) {
                    return "displayForm";
                }
                ui.isSaving = true;
                ui.error = null;
                ui.successMessage = null;
                return "saveWord";
            }
        },
    },

    saveWord: {
        input: (_domain, internal) => ({
            word: internal.flowData.draft.trim(),
        }),
        action: async ({ word }, _domain, internal) => {
            const ui = internal.flowData.ui.displayForm;

            try {
                const response = await saveWordToListenTo(word);
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error("Failed to add word");
                }
                internal.flowData.draft = "";
                ui.successMessage = "Word added";
            } catch (err) {
                ui.error = err instanceof Error ? err.message : "Failed to add word";
            } finally {
                ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            const ui = internal.flowData.ui.displayForm;
            if (!ui.error) {
                events?.wordsRefresh.emit((count: number) => count + 1);
            }
            return "displayForm";
        },
    },
}, {
    start: "displayForm",
    createInternalData: createAddWordInternalData,
});
