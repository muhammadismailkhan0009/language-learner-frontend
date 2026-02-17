import { defineFlow } from "@myriadcodelabs/uiflow";
import createScenarioAction from "../_server_actions/createScenarioAction";
import AddScenarioView, { AddScenarioViewOutput } from "../_client_components/AddScenarioView";
import { ScenarioDraft, ScreenMode } from "../types";
import { createInitialDraft, isDraftValid, normalizeDraft } from "./scenarioDraftOps";
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

            if (output.type === "submit") {
                if (internal.flowData.ui.isSaving) {
                    return "displayForm";
                }

                const draftToSave: ScenarioDraft = {
                    ...output.draft,
                    targetLanguage: "de",
                };

                if (!isDraftValid(draftToSave)) {
                    internal.flowData.ui.error = "Nature and at least one complete sentence are required";
                    return "displayForm";
                }

                internal.flowData.draft = draftToSave;
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
        action: async ({ draft }: { draft: ScenarioDraft }, _domain, internal) => {
            try {
                const requestBody: CreateScenarioRequest = {
                    nature: draft.nature,
                    targetLanguage: "de",
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
