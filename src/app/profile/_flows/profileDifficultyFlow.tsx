import { defineFlow } from "@myriadcodelabs/uiflow";
import { LanguageLevel } from "@/lib/types/LanguageLevel";
import fetchUserProfileAction from "../_server_actions/fetchUserProfileAction";
import updateUserDifficultyLevelAction from "../_server_actions/updateUserDifficultyLevelAction";
import DifficultyLevelSelectorView, { DifficultyLevelSelectorViewOutput } from "../_client_components/DifficultyLevelSelectorView";

type ProfileDifficultyDomainData = Record<string, never>;

interface ProfileDifficultyInternalData {
    flowData: {
        difficultyLevel: LanguageLevel;
        savedDifficultyLevel: LanguageLevel | null;
        ui: {
            isLoading: boolean;
            isSaving: boolean;
            error: string | null;
            message: string | null;
        };
    };
}

function createProfileDifficultyInternalData(): ProfileDifficultyInternalData {
    return {
        flowData: {
            difficultyLevel: "A1",
            savedDifficultyLevel: null,
            ui: {
                isLoading: false,
                isSaving: false,
                error: null,
                message: null,
            },
        },
    };
}

export const profileDifficultyFlow = defineFlow<ProfileDifficultyDomainData, ProfileDifficultyInternalData>({
    fetchProfile: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.flowData.ui.isLoading = true;
            internal.flowData.ui.error = null;

            try {
                const profile = await fetchUserProfileAction();
                if (!profile) {
                    throw new Error("Failed to load profile");
                }
                internal.flowData.difficultyLevel = profile.difficultyLevel;
                internal.flowData.savedDifficultyLevel = profile.difficultyLevel;
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to load profile";
            } finally {
                internal.flowData.ui.isLoading = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayProfile",
    },

    saveProfile: {
        input: (_domain, internal) => ({
            difficultyLevel: internal.flowData.difficultyLevel,
        }),
        action: async ({ difficultyLevel }: { difficultyLevel: LanguageLevel }, _domain, internal) => {
            internal.flowData.ui.isSaving = true;
            internal.flowData.ui.error = null;
            internal.flowData.ui.message = null;

            try {
                const profile = await updateUserDifficultyLevelAction({ difficultyLevel });
                if (!profile) {
                    throw new Error("Failed to save difficulty level");
                }
                internal.flowData.difficultyLevel = profile.difficultyLevel;
                internal.flowData.savedDifficultyLevel = profile.difficultyLevel;
                internal.flowData.ui.message = "Difficulty level saved.";
            } catch (err) {
                internal.flowData.ui.error = err instanceof Error ? err.message : "Failed to save difficulty level";
            } finally {
                internal.flowData.ui.isSaving = false;
            }

            return { ok: true };
        },
        render: { mode: "preserve-previous" },
        onOutput: () => "displayProfile",
    },

    displayProfile: {
        input: (_domain, internal) => ({
            difficultyLevel: internal.flowData.difficultyLevel,
            savedDifficultyLevel: internal.flowData.savedDifficultyLevel,
            isLoading: internal.flowData.ui.isLoading,
            isSaving: internal.flowData.ui.isSaving,
            error: internal.flowData.ui.error,
            message: internal.flowData.ui.message,
        }),
        view: DifficultyLevelSelectorView,
        onOutput: (_domain, internal, output: DifficultyLevelSelectorViewOutput) => {
            if (output.type === "setLevel") {
                internal.flowData.difficultyLevel = output.difficultyLevel;
                internal.flowData.ui.message = null;
                return "displayProfile";
            }

            if (output.type === "save") {
                return "saveProfile";
            }

            if (output.type === "reload") {
                return "fetchProfile";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                internal.flowData.ui.message = null;
                return "displayProfile";
            }
        },
    },
}, {
    start: "fetchProfile",
    createInternalData: createProfileDifficultyInternalData,
});
