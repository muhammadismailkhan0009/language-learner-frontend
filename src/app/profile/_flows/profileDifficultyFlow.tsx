import { defineFlow } from "@myriadcodelabs/uiflow";
import { LanguageLevel } from "@/lib/types/LanguageLevel";
import fetchUserProfileAction from "../_server_actions/fetchUserProfileAction";
import updateUserDifficultyLevelAction from "../_server_actions/updateUserDifficultyLevelAction";
import DifficultyLevelSelectorView, { DifficultyLevelSelectorViewOutput } from "../_client_components/DifficultyLevelSelectorView";

type ProfileDifficultyDomainData = Record<string, never>;

interface ProfileDifficultyInternalData {
    flowData: {
        difficultyLevel: LanguageLevel;
        readingDifficultyLevel: LanguageLevel;
        writingDifficultyLevel: LanguageLevel;
        savedDifficultyLevel: LanguageLevel | null;
        savedReadingDifficultyLevel: LanguageLevel | null;
        savedWritingDifficultyLevel: LanguageLevel | null;
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
            readingDifficultyLevel: "A1",
            writingDifficultyLevel: "A1",
            savedDifficultyLevel: null,
            savedReadingDifficultyLevel: null,
            savedWritingDifficultyLevel: null,
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
                internal.flowData.readingDifficultyLevel = profile.readingDifficultyLevel;
                internal.flowData.writingDifficultyLevel = profile.writingDifficultyLevel;
                internal.flowData.savedDifficultyLevel = profile.difficultyLevel;
                internal.flowData.savedReadingDifficultyLevel = profile.readingDifficultyLevel;
                internal.flowData.savedWritingDifficultyLevel = profile.writingDifficultyLevel;
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
            readingDifficultyLevel: internal.flowData.readingDifficultyLevel,
            writingDifficultyLevel: internal.flowData.writingDifficultyLevel,
        }),
        action: async (levels, _domain, internal) => {
            internal.flowData.ui.isSaving = true;
            internal.flowData.ui.error = null;
            internal.flowData.ui.message = null;

            try {
                const profile = await updateUserDifficultyLevelAction(levels);
                if (!profile) {
                    throw new Error("Failed to save difficulty level");
                }
                internal.flowData.difficultyLevel = profile.difficultyLevel;
                internal.flowData.readingDifficultyLevel = profile.readingDifficultyLevel;
                internal.flowData.writingDifficultyLevel = profile.writingDifficultyLevel;
                internal.flowData.savedDifficultyLevel = profile.difficultyLevel;
                internal.flowData.savedReadingDifficultyLevel = profile.readingDifficultyLevel;
                internal.flowData.savedWritingDifficultyLevel = profile.writingDifficultyLevel;
                internal.flowData.ui.message = "Difficulty levels saved.";
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
            readingDifficultyLevel: internal.flowData.readingDifficultyLevel,
            writingDifficultyLevel: internal.flowData.writingDifficultyLevel,
            savedDifficultyLevel: internal.flowData.savedDifficultyLevel,
            savedReadingDifficultyLevel: internal.flowData.savedReadingDifficultyLevel,
            savedWritingDifficultyLevel: internal.flowData.savedWritingDifficultyLevel,
            isLoading: internal.flowData.ui.isLoading,
            isSaving: internal.flowData.ui.isSaving,
            error: internal.flowData.ui.error,
            message: internal.flowData.ui.message,
        }),
        view: DifficultyLevelSelectorView,
        onOutput: (_domain, internal, output: DifficultyLevelSelectorViewOutput) => {
            if (output.type === "setLevel") {
                if (output.levelKind === "general") internal.flowData.difficultyLevel = output.difficultyLevel;
                if (output.levelKind === "reading") internal.flowData.readingDifficultyLevel = output.difficultyLevel;
                if (output.levelKind === "writing") internal.flowData.writingDifficultyLevel = output.difficultyLevel;
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
