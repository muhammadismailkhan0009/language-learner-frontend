import { defineFlow } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import submitWritingPracticeAnswerAction from "../_server_actions/submitWritingPracticeAnswerAction";
import WritingAnswerFlowView, { WritingAnswerFlowViewOutput } from "../_client_components/WritingAnswerFlowView";
import { WritingScreenMode } from "../types";

type DomainData = {};

type InternalData = {
  draftAnswer: string;
  ui: {
    submitting: boolean;
    error: string | null;
    info: string | null;
  };
};

function createInternalData(): InternalData {
  return {
    draftAnswer: "",
    ui: {
      submitting: false,
      error: null,
      info: null,
    },
  };
}

export const writingAnswerFlow = defineFlow<DomainData, InternalData>(
  {
    form: {
      input: (_domain, internal, events) => ({
        mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
        session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
        draftAnswer: internal.draftAnswer,
        isSubmittingAnswer: internal.ui.submitting,
        error: internal.ui.error,
        infoMessage: internal.ui.info,
      }),
      view: WritingAnswerFlowView,
      onOutput: (_domain, internal, output: WritingAnswerFlowViewOutput) => {
        if (output.type === "updateDraftAnswer") {
          internal.draftAnswer = output.value;
          return "form";
        }

        if (output.type === "submitAnswer") {
          return "submit";
        }

        if (output.type === "clearError") {
          internal.ui.error = null;
          return "form";
        }

        if (output.type === "clearInfo") {
          internal.ui.info = null;
          return "form";
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
          internal.draftAnswer = "";
          return { ok: true };
        }

        internal.draftAnswer = session.submittedAnswer ?? "";
        return { ok: true };
      },
      onOutput: () => "form",
    },

    submit: {
      input: (_domain, internal, events) => ({
        session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
        answer: internal.draftAnswer.trim(),
      }),
      render: { mode: "preserve-previous" },
      action: async ({ session, answer }, _domain, internal, events) => {
        if (!session?.sessionId) {
          internal.ui.error = "No writing session selected.";
          return { ok: false };
        }

        if (!answer) {
          internal.ui.error = "Write an answer before submitting.";
          return { ok: false };
        }

        internal.ui.submitting = true;
        internal.ui.error = null;
        internal.ui.info = null;

        try {
          const accepted = await submitWritingPracticeAnswerAction(session.sessionId, answer);
          if (!accepted) {
            throw new Error("Writing answer submission was not accepted");
          }

          internal.ui.info = "Answer submitted.";
          events?.writingSessionsRefresh.emit((n: number) => n + 1);
        } catch (error) {
          internal.ui.error = error instanceof Error ? error.message : "Failed to submit writing answer";
        } finally {
          internal.ui.submitting = false;
        }

        return { ok: true };
      },
      onOutput: () => "form",
    },
  },
  {
    start: "form",
    channelTransitions: {
      currentWritingSession: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "detail") {
          return "syncDraft";
        }
        return "form";
      },
      screenMode: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "detail") {
          return "syncDraft";
        }
        return "form";
      },
    },
    createInternalData,
  }
);
