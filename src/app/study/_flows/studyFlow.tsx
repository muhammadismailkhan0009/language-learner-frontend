import { defineFlow } from "@myriadcodelabs/uiflow";
import { StudySessionResponse } from "@/lib/types/responses/StudySessionResponse";
import createStudySessionAction from "../_server_actions/createStudySessionAction";
import getActiveStudySessionAction from "../_server_actions/getActiveStudySessionAction";
import submitStudyAnswerAction from "../_server_actions/submitStudyAnswerAction";
import StudyView, { StudyViewOutput } from "../_client_components/StudyView";

type Domain = Record<string, never>;

type Internal = {
    session: StudySessionResponse | null;
    limit: number;
    answer: string;
    isLoading: boolean;
    isCreating: boolean;
    isSubmitting: boolean;
    error: string | null;
};

function createInternalData(): Internal {
    return {
        session: null,
        limit: 10,
        answer: "",
        isLoading: false,
        isCreating: false,
        isSubmitting: false,
        error: null,
    };
}

export const studyFlow = defineFlow<Domain, Internal>({
    loadActive: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.isLoading = true;
            internal.error = null;
            try {
                internal.session = await getActiveStudySessionAction();
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to load active session";
            } finally {
                internal.isLoading = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },

    createSession: {
        input: (_domain, internal) => ({ limit: internal.limit }),
        render: { mode: "preserve-previous" },
        action: async ({ limit }, _domain, internal) => {
            internal.isCreating = true;
            internal.error = null;
            try {
                internal.session = await createStudySessionAction(limit);
                internal.answer = "";
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to create session";
            } finally {
                internal.isCreating = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },

    submitAnswer: {
        input: (_domain, internal) => ({
            sessionId: internal.session?.sessionId ?? null,
            itemId: internal.session?.currentItem?.itemId ?? null,
            answer: internal.answer.trim(),
        }),
        render: { mode: "preserve-previous" },
        action: async ({ sessionId, itemId, answer }, _domain, internal) => {
            if (!sessionId || !itemId || !answer) {
                return { ok: false };
            }
            internal.isSubmitting = true;
            internal.error = null;
            try {
                const updated = await submitStudyAnswerAction(sessionId, itemId, answer);
                if (updated) {
                    internal.session = updated;
                    internal.answer = "";
                }
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to submit answer";
            } finally {
                internal.isSubmitting = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },

    show: {
        input: (_domain, internal) => ({
            session: internal.session,
            limit: internal.limit,
            answer: internal.answer,
            isLoading: internal.isLoading,
            isCreating: internal.isCreating,
            isSubmitting: internal.isSubmitting,
            error: internal.error,
        }),
        view: StudyView,
        onOutput: (_domain, internal, output: StudyViewOutput) => {
            if (output.type === "refresh") {
                return "loadActive";
            }
            if (output.type === "updateLimit") {
                internal.limit = Math.max(1, Math.min(50, output.limit));
                return "show";
            }
            if (output.type === "createSession") {
                return "createSession";
            }
            if (output.type === "updateAnswer") {
                internal.answer = output.answer;
                return "show";
            }
            if (output.type === "submitAnswer") {
                return "submitAnswer";
            }
            if (output.type === "clearError") {
                internal.error = null;
                return "show";
            }
        },
    },
}, {
    start: "loadActive",
    createInternalData,
});

