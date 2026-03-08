import { defineFlow } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionSummaryResponse } from "@/lib/types/responses/WritingPracticeSessionSummaryResponse";
import createWritingPracticeSessionAction from "../_server_actions/createWritingPracticeSessionAction";
import listWritingPracticeSessionsAction from "../_server_actions/listWritingPracticeSessionsAction";
import WritingSessionsListFlowView, { WritingSessionsListFlowViewOutput } from "../_client_components/WritingSessionsListFlowView";
import { WritingScreenMode } from "../types";

type WritingSessionsListDomainData = Record<string, never>;

type WritingSessionsListInternalData = {
    flowData: {
        sessions: WritingPracticeSessionSummaryResponse[];
        activeSessionId: string | null;
        ui: {
            isLoadingSessions: boolean;
            isCreatingSession: boolean;
            error: string | null;
            infoMessage: string | null;
        };
    };
};

function createWritingSessionsListInternalData(): WritingSessionsListInternalData {
    return {
        flowData: {
            sessions: [],
            activeSessionId: null,
            ui: {
                isLoadingSessions: false,
                isCreatingSession: false,
                error: null,
                infoMessage: null,
            },
        },
    };
}

export const writingSessionsListFlow = defineFlow<WritingSessionsListDomainData, WritingSessionsListInternalData>({
    loadSessions: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.flowData.ui.isLoadingSessions = true;
            internal.flowData.ui.error = null;

            try {
                internal.flowData.sessions = await listWritingPracticeSessionsAction();
            } catch (error) {
                internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to load writing sessions";
            } finally {
                internal.flowData.ui.isLoadingSessions = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayList",
    },

    createSession: {
        input: () => ({}),
        render: {
            mode: "preserve-previous",
        },
        action: async (_input, _domain, internal) => {
            internal.flowData.ui.isCreatingSession = true;
            internal.flowData.ui.error = null;
            internal.flowData.ui.infoMessage = null;

            try {
                const created = await createWritingPracticeSessionAction();
                if (!created) {
                    throw new Error("Writing session request was not accepted");
                }
                internal.flowData.ui.infoMessage = "Writing session requested. Refresh if it does not appear immediately.";
            } catch (error) {
                internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to create writing session";
            } finally {
                internal.flowData.ui.isCreatingSession = false;
            }

            return { ok: true };
        },
        onOutput: () => "loadSessions",
    },

    displayList: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            sessions: internal.flowData.sessions,
            activeSessionId: internal.flowData.activeSessionId,
            isLoadingSessions: internal.flowData.ui.isLoadingSessions,
            isLoadingSessionDetail: false,
            isCreatingSession: internal.flowData.ui.isCreatingSession,
            isDeletingSession: false,
            error: internal.flowData.ui.error,
            infoMessage: internal.flowData.ui.infoMessage,
        }),
        view: WritingSessionsListFlowView,
        onOutput: (_domain, internal, output: WritingSessionsListFlowViewOutput, events) => {
            if (output.type === "reload") {
                return "loadSessions";
            }

            if (output.type === "create") {
                return "createSession";
            }

            if (output.type === "openSession") {
                internal.flowData.activeSessionId = output.sessionId;
                events?.selectedWritingSessionId.emit(output.sessionId);
                events?.screenMode.emit("detail");
                return "displayList";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayList";
            }

            if (output.type === "clearInfo") {
                internal.flowData.ui.infoMessage = null;
                return "displayList";
            }
        },
    },
}, {
    start: "loadSessions",
    channelTransitions: {
        writingSessionsRefresh: () => "loadSessions",
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "list") {
                return "displayList";
            }
        },
    },
    createInternalData: createWritingSessionsListInternalData,
});
