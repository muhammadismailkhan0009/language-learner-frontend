import { defineFlow } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionSummaryResponse } from "@/lib/types/responses/WritingPracticeSessionSummaryResponse";
import createWritingPracticeSessionAction from "../_server_actions/createWritingPracticeSessionAction";
import listWritingPracticeSessionsAction from "../_server_actions/listWritingPracticeSessionsAction";
import WritingSessionsListFlowView, { WritingSessionsListFlowViewOutput } from "../_client_components/WritingSessionsListFlowView";
import { WritingScreenMode } from "../types";

type DomainData = {};

type InternalData = {
  sessions: WritingPracticeSessionSummaryResponse[];
  activeSessionId: string | null;
  ui: {
    loading: boolean;
    creating: boolean;
    error: string | null;
    info: string | null;
  };
};

function createInternalData(): InternalData {
  return {
    sessions: [],
    activeSessionId: null,
    ui: {
      loading: false,
      creating: false,
      error: null,
      info: null,
    },
  };
}

export const writingSessionsListFlow = defineFlow<DomainData, InternalData>(
  {
    load: {
      input: () => ({}),
      action: async (_input, _domain, internal) => {
        internal.ui.loading = true;
        internal.ui.error = null;

        try {
          internal.sessions = await listWritingPracticeSessionsAction();
        } catch (error) {
          internal.ui.error = error instanceof Error ? error.message : "Failed to load writing sessions";
        } finally {
          internal.ui.loading = false;
        }

        return { ok: true };
      },
      onOutput: () => "list",
    },

    create: {
      input: () => ({}),
      render: { mode: "preserve-previous" },
      action: async (_input, _domain, internal) => {
        internal.ui.creating = true;
        internal.ui.error = null;
        internal.ui.info = null;

        try {
          const accepted = await createWritingPracticeSessionAction();
          if (!accepted) {
            throw new Error("Writing session request was not accepted");
          }
          internal.ui.info = "Writing session requested. Refresh if it does not appear immediately.";
        } catch (error) {
          internal.ui.error = error instanceof Error ? error.message : "Failed to create writing session";
        } finally {
          internal.ui.creating = false;
        }

        return { ok: true };
      },
      onOutput: () => "load",
    },

    list: {
      input: (_domain, internal, events) => ({
        mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
        sessions: internal.sessions,
        activeSessionId: internal.activeSessionId,
        isLoadingSessions: internal.ui.loading,
        isLoadingSessionDetail: false,
        isCreatingSession: internal.ui.creating,
        isDeletingSession: false,
        error: internal.ui.error,
        infoMessage: internal.ui.info,
      }),
      view: WritingSessionsListFlowView,
      onOutput: (_domain, internal, output: WritingSessionsListFlowViewOutput, events) => {
        if (output.type === "reload") {
          return "load";
        }

        if (output.type === "create") {
          return "create";
        }

        if (output.type === "openSession") {
          internal.activeSessionId = output.sessionId;
          events?.selectedWritingSessionId.emit(output.sessionId);
          events?.screenMode.emit("detail");
          return "list";
        }

        if (output.type === "clearError") {
          internal.ui.error = null;
          return "list";
        }

        if (output.type === "clearInfo") {
          internal.ui.info = null;
          return "list";
        }
      },
    },
  },
  {
    start: "load",
    channelTransitions: {
      writingSessionsRefresh: () => "load",
      screenMode: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "list") {
          return "list";
        }
      },
    },
    createInternalData,
  }
);
