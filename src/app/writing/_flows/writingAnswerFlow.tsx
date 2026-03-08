import { defineFlow } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import submitWritingPracticeAnswerAction from "../_server_actions/submitWritingPracticeAnswerAction";
import WritingAnswerFlowView, { WritingAnswerFlowViewOutput } from "../_client_components/WritingAnswerFlowView";
import { WritingScreenMode } from "../types";

type WritingAnswerDomainData = Record<string, never>;

type WritingAnswerInternalData = {
    flowData: {
        draftAnswer: string;
        ui: {
            isSubmittingAnswer: boolean;
            error: string | null;
            infoMessage: string | null;
        };
    };
};

function createWritingAnswerInternalData(): WritingAnswerInternalData {
    return {
        flowData: {
            draftAnswer: "",
            ui: {
                isSubmittingAnswer: false,
                error: null,
                infoMessage: null,
            },
        },
    };
}

export const writingAnswerFlow = defineFlow<WritingAnswerDomainData, WritingAnswerInternalData>({
    displayAnswer: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
            draftAnswer: internal.flowData.draftAnswer,
            isSubmittingAnswer: internal.flowData.ui.isSubmittingAnswer,
            error: internal.flowData.ui.error,
            infoMessage: internal.flowData.ui.infoMessage,
        }),
        view: WritingAnswerFlowView,
        onOutput: (_domain, internal, output: WritingAnswerFlowViewOutput) => {
            if (output.type === "updateDraftAnswer") {
                internal.flowData.draftAnswer = output.value;
                return "displayAnswer";
            }

            if (output.type === "submitAnswer") {
                return "submitAnswer";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayAnswer";
            }

            if (output.type === "clearInfo") {
                internal.flowData.ui.infoMessage = null;
                return "displayAnswer";
            }
        },
    },

    syncDraft: {
        input: (_domain, _internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
        }),
        action: async ({ mode, session }, _domain, internal) => {
            if (mode !== "detail" || !session) {
                internal.flowData.draftAnswer = "";
                return { ok: true };
            }

            internal.flowData.draftAnswer = session.submittedAnswer ?? "";
            return { ok: true };
        },
        onOutput: () => "displayAnswer",
    },

    submitAnswer: {
        input: (_domain, internal, events) => ({
            session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
            answer: internal.flowData.draftAnswer.trim(),
        }),
        render: {
            mode: "preserve-previous",
        },
        action: async ({ session, answer }, _domain, internal, events) => {
            if (!session?.sessionId) {
                internal.flowData.ui.error = "No writing session selected.";
                return { ok: false };
            }

            if (!answer) {
                internal.flowData.ui.error = "Write an answer before submitting.";
                return { ok: false };
            }

            internal.flowData.ui.isSubmittingAnswer = true;
            internal.flowData.ui.error = null;
            internal.flowData.ui.infoMessage = null;

            try {
                const submitted = await submitWritingPracticeAnswerAction(session.sessionId, answer);
                if (!submitted) {
                    throw new Error("Writing answer submission was not accepted");
                }
                internal.flowData.ui.infoMessage = "Answer submitted.";
                events?.writingSessionsRefresh.emit((count: number) => count + 1);
            } catch (error) {
                internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to submit writing answer";
            } finally {
                internal.flowData.ui.isSubmittingAnswer = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayAnswer",
    },
}, {
    start: "displayAnswer",
    channelTransitions: {
        currentWritingSession: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "detail") {
                return "syncDraft";
            }
            return "displayAnswer";
        },
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "detail") {
                return "syncDraft";
            }
            return "displayAnswer";
        },
    },
    createInternalData: createWritingAnswerInternalData,
});
