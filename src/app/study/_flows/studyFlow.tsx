import { defineFlow } from "@myriadcodelabs/uiflow";
import { StudySessionResponse } from "@/lib/types/responses/StudySessionResponse";
import createStudySessionAction from "../_server_actions/createStudySessionAction";
import submitStudyAnswerAction from "../_server_actions/submitStudyAnswerAction";
import StudyView, { StudyViewOutput } from "../_client_components/StudyView";
import { normalizeGermanTransliteration } from "@/lib/germanInputNormalize";

type Domain = Record<string, never>;

type Internal = {
    session: StudySessionResponse | null;
    answer: string;
    isCreating: boolean;
    isSubmitting: boolean;
    error: string | null;
    lastReviewedCloze: string | null;
    lastReviewedExpected: string | null;
};

function createInternalData(): Internal {
    return {
        session: null,
        answer: "",
        isCreating: false,
        isSubmitting: false,
        error: null,
        lastReviewedCloze: null,
        lastReviewedExpected: null,
    };
}

export const studyFlow = defineFlow<Domain, Internal>({
    createSession: {
        input: () => ({ limit: 1 }),
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
            answer: normalizeGermanTransliteration(internal.answer.trim()),
        }),
        render: { mode: "preserve-previous" },
        action: async ({ sessionId, itemId, answer }, _domain, internal) => {
            if (!sessionId || !itemId || !answer) {
                return { ok: false };
            }
            internal.isSubmitting = true;
            internal.error = null;
            internal.lastReviewedCloze = internal.session?.currentItem?.clozeSentence ?? null;
            internal.lastReviewedExpected = internal.session?.currentItem?.expectedAnswer ?? null;
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
            answer: internal.answer,
            isCreating: internal.isCreating,
            isSubmitting: internal.isSubmitting,
            error: internal.error,
            lastReviewedCloze: internal.lastReviewedCloze,
            lastReviewedExpected: internal.lastReviewedExpected,
        }),
        view: StudyView,
        onOutput: (_domain, internal, output: StudyViewOutput) => {
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
    start: "show",
    createInternalData,
});
