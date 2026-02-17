import { defineFlow } from "@myriadcodelabs/uiflow";
import createScenarioAction from "../_server_actions/createScenarioAction";
import AddScenarioView, { AddScenarioViewOutput } from "../_client_components/AddScenarioView";
import { ScenarioDraft, ScreenMode } from "../types";
import { createEmptySentence, createInitialDraft, isDraftValid, normalizeDraft } from "./scenarioDraftOps";
import { CreateScenarioRequest } from "@/lib/types/requests/CreateScenarioRequest";

type AddScenarioDomainData = Record<string, never>;

interface AddScenarioInternalData {
    flowData: {
        draft: ScenarioDraft;
        ui: {
            isSaving: boolean;
            error: string | null;
        };
    };
}

function createAddScenarioInternalData(): AddScenarioInternalData {
    return {
        flowData: {
            draft: createInitialDraft(),
            ui: {
                isSaving: false,
                error: null,
            },
        },
    };
}

export const addScenarioFlow = defineFlow<AddScenarioDomainData, AddScenarioInternalData>({
    displayForm: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as ScreenMode | undefined) ?? "list",
            draft: internal.flowData.draft,
            error: internal.flowData.ui.error,
            isSaving: internal.flowData.ui.isSaving,
            canSubmit: isDraftValid(internal.flowData.draft),
        }),
        view: AddScenarioView,
        onOutput: (_domain, internal, output: AddScenarioViewOutput, events) => {
            if (output.type === "cancel") {
                internal.flowData.ui.error = null;
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
                    internal.flowData.ui.error = "Nature, target language, and at least one complete sentence are required";
                    return "displayForm";
                }

                internal.flowData.ui.error = null;
                internal.flowData.ui.isSaving = true;
                return "saveScenario";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayForm";
            }
        },
    },

    saveScenario: {
        input: (_domain, internal) => ({
            draft: normalizeDraft(internal.flowData.draft),
        }),
        action: async ({ draft }, _domain, internal) => {
            try {
                const requestBody: CreateScenarioRequest = {
                    nature: draft.nature,
                    targetLanguage: draft.targetLanguage,
                    sentences: draft.sentences.map((item) => ({
                        sentence: item.sentence,
                        translation: item.translation,
                    })),
                };

                const createdScenario = await createScenarioAction(requestBody);
                if (!createdScenario) {
                    throw new Error("Failed to create scenario");
                }
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to create scenario";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: (_domain, internal, _output, events) => {
            if (!internal.flowData.ui.error) {
                internal.flowData.draft = createInitialDraft();
                events?.scenariosRefresh.emit((count: number) => count + 1);
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
    createInternalData: createAddScenarioInternalData,
});

