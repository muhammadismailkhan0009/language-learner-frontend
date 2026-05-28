import { defineFlow } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import deleteWritingPracticeSessionAction from "../_server_actions/deleteWritingPracticeSessionAction";
import getWritingPracticeSessionAction from "../_server_actions/getWritingPracticeSessionAction";
import WritingSessionShellFlowView, { WritingSessionShellFlowViewOutput } from "../_client_components/WritingSessionShellFlowView";
import { WritingScreenMode } from "../types";

type DomainData = {};

type InternalData = {
  session: WritingPracticeSessionResponse | null;
  ui: {
    loading: boolean;
    deleting: boolean;
    error: string | null;
    info: string | null;
  };
};

function createInternalData(): InternalData {
  return {
    session: null,
    ui: {
      loading: false,
      deleting: false,
      error: null,
      info: null,
    },
  };
}

export const writingSessionShellFlow = defineFlow<DomainData, InternalData>(
  {
    shell: {
      input: (_domain, internal, events) => ({
        mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
        session: internal.session,
        isLoadingSessionDetail: internal.ui.loading,
        isDeletingSession: internal.ui.deleting,
        reviewedCardsCount: ((events?.writingReviewedCardIds?.get() as string[] | undefined) ?? []).length,
        error: internal.ui.error,
        infoMessage: internal.ui.info,
      }),
      view: WritingSessionShellFlowView,
      onOutput: (_domain, internal, output: WritingSessionShellFlowViewOutput, events) => {
        if (output.type === "back") {
          internal.ui.error = null;
          internal.ui.info = null;
          events?.currentWritingSession.emit(null);
          events?.selectedWritingSessionId.emit(null);
          events?.writingReviewedCardIds.emit([]);
          events?.screenMode.emit("list");
          return "shell";
        }

        if (output.type === "deleteSession") {
          return "delete";
        }

        if (output.type === "clearError") {
          internal.ui.error = null;
          return "shell";
        }

        if (output.type === "clearInfo") {
          internal.ui.info = null;
          return "shell";
        }
      },
    },

    loadDetail: {
      input: (_domain, _internal, events) => ({
        mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
        sessionId: (events?.selectedWritingSessionId?.get() as string | null | undefined) ?? null,
      }),
      render: { mode: "preserve-previous" },
      action: async ({ mode, sessionId }, _domain, internal, events) => {
        if (mode !== "detail" || !sessionId) {
          internal.session = null;
          events?.currentWritingSession.emit(null);
          events?.writingReviewedCardIds.emit([]);
          return { ok: true };
        }

        internal.ui.loading = true;
        internal.ui.error = null;

        try {
          const session = await getWritingPracticeSessionAction(sessionId);
          if (!session) {
            throw new Error("Writing session not found");
          }

          internal.session = session;
          events?.currentWritingSession.emit(session);
          events?.writingReviewedCardIds.emit([]);
        } catch (error) {
          internal.ui.error = error instanceof Error ? error.message : "Failed to load writing session details";
          internal.session = null;
          events?.currentWritingSession.emit(null);
          events?.writingReviewedCardIds.emit([]);
        } finally {
          internal.ui.loading = false;
        }

        return { ok: true };
      },
      onOutput: () => "shell",
    },

    delete: {
      input: (_domain, _internal, events) => ({
        sessionId: (events?.selectedWritingSessionId?.get() as string | null | undefined) ?? null,
      }),
      action: async ({ sessionId }, _domain, internal, events) => {
        if (!sessionId) {
          return { ok: false };
        }

        internal.ui.deleting = true;
        internal.ui.error = null;

        try {
          const deleted = await deleteWritingPracticeSessionAction(sessionId);
          if (!deleted) {
            throw new Error("Writing session deletion was not accepted");
          }

          internal.session = null;
          events?.currentWritingSession.emit(null);
          events?.selectedWritingSessionId.emit(null);
          events?.writingReviewedCardIds.emit([]);
          events?.screenMode.emit("list");
          events?.writingSessionsRefresh.emit((n: number) => n + 1);
        } catch (error) {
          internal.ui.error = error instanceof Error ? error.message : "Failed to delete writing session";
        } finally {
          internal.ui.deleting = false;
        }

        return { ok: true };
      },
      onOutput: () => "shell",
    },
  },
  {
    start: "shell",
    channelTransitions: {
      selectedWritingSessionId: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "detail") {
          return "loadDetail";
        }
        return "shell";
      },
      screenMode: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "detail") {
          return "loadDetail";
        }
        return "shell";
      },
      writingSessionsRefresh: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        const sessionId = (events?.selectedWritingSessionId?.get() as string | null | undefined) ?? null;
        if (mode === "detail" && sessionId) {
          return "loadDetail";
        }
      },
    },
    createInternalData,
  }
);
