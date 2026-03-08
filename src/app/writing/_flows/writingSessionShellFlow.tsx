import { defineFlow } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import deleteWritingPracticeSessionAction from "../_server_actions/deleteWritingPracticeSessionAction";
import getWritingPracticeSessionAction from "../_server_actions/getWritingPracticeSessionAction";
import WritingSessionShellFlowView, { WritingSessionShellFlowViewOutput } from "../_client_components/WritingSessionShellFlowView";
import { WritingScreenMode } from "../types";

type WritingSessionShellDomainData = Record<string, never>;

type WritingSessionShellInternalData = {
    flowData: {
        session: WritingPracticeSessionResponse | null;
        ui: {
            isLoadingSessionDetail: boolean;
            isDeletingSession: boolean;
            error: string | null;
            infoMessage: string | null;
        };
    };
};

function createWritingSessionShellInternalData(): WritingSessionShellInternalData {
    return {
        flowData: {
            session: null,
            ui: {
                isLoadingSessionDetail: false,
                isDeletingSession: false,
                error: null,
                infoMessage: null,
            },
        },
    };
}

export const writingSessionShellFlow = defineFlow<WritingSessionShellDomainData, WritingSessionShellInternalData>({
    displayShell: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            session: internal.flowData.session,
            isLoadingSessionDetail: internal.flowData.ui.isLoadingSessionDetail,
            isDeletingSession: internal.flowData.ui.isDeletingSession,
            reviewedCardsCount: ((events?.writingReviewedCardIds?.get() as string[] | undefined) ?? []).length,
            error: internal.flowData.ui.error,
            infoMessage: internal.flowData.ui.infoMessage,
        }),
        view: WritingSessionShellFlowView,
        onOutput: (_domain, internal, output: WritingSessionShellFlowViewOutput, events) => {
            if (output.type === "back") {
                internal.flowData.ui.error = null;
                internal.flowData.ui.infoMessage = null;
                events?.currentWritingSession.emit(null);
                events?.selectedWritingSessionId.emit(null);
                events?.writingReviewedCardIds.emit([]);
                events?.screenMode.emit("list");
                return "displayShell";
            }

            if (output.type === "deleteSession") {
                return "deleteSession";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayShell";
            }

            if (output.type === "clearInfo") {
                internal.flowData.ui.infoMessage = null;
                return "displayShell";
            }
        },
    },

    loadSessionDetail: {
        input: (_domain, _internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            sessionId: (events?.selectedWritingSessionId?.get() as string | null | undefined) ?? null,
        }),
        action: async ({ mode, sessionId }, _domain, internal, events) => {
            if (mode !== "detail" || !sessionId) {
                internal.flowData.session = null;
                events?.currentWritingSession.emit(null);
                events?.writingReviewedCardIds.emit([]);
                return { ok: true };
            }

            internal.flowData.ui.isLoadingSessionDetail = true;
            internal.flowData.ui.error = null;

            try {
                internal.flowData.session = await getWritingPracticeSessionAction(sessionId);
                if (!internal.flowData.session) {
                    throw new Error("Writing session not found");
                }
                events?.currentWritingSession.emit(internal.flowData.session);
                events?.writingReviewedCardIds.emit([]);
            } catch (error) {
                internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to load writing session details";
                internal.flowData.session = null;
                events?.currentWritingSession.emit(null);
                events?.writingReviewedCardIds.emit([]);
            } finally {
                internal.flowData.ui.isLoadingSessionDetail = false;
            }

            return { ok: true };
        },
        render: {
            mode: "preserve-previous",
        },
        onOutput: () => "displayShell",
    },

    deleteSession: {
        input: (_domain, _internal, events) => ({
            sessionId: (events?.selectedWritingSessionId?.get() as string | null | undefined) ?? null,
        }),
        action: async ({ sessionId }, _domain, internal, events) => {
            if (!sessionId) {
                return { ok: false };
            }

            internal.flowData.ui.isDeletingSession = true;
            internal.flowData.ui.error = null;

            try {
                const deleted = await deleteWritingPracticeSessionAction(sessionId);
                if (!deleted) {
                    throw new Error("Writing session deletion was not accepted");
                }

                internal.flowData.session = null;
                events?.currentWritingSession.emit(null);
                events?.selectedWritingSessionId.emit(null);
                events?.writingReviewedCardIds.emit([]);
                events?.screenMode.emit("list");
                events?.writingSessionsRefresh.emit((count: number) => count + 1);
            } catch (error) {
                internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to delete writing session";
            } finally {
                internal.flowData.ui.isDeletingSession = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayShell",
    },
}, {
    start: "displayShell",
    channelTransitions: {
        selectedWritingSessionId: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "detail") {
                return "loadSessionDetail";
            }
            return "displayShell";
        },
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "detail") {
                return "loadSessionDetail";
            }
            return "displayShell";
        },
        writingSessionsRefresh: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            const sessionId = (events?.selectedWritingSessionId?.get() as string | null | undefined) ?? null;
            if (mode === "detail" && sessionId) {
                return "loadSessionDetail";
            }
        },
    },
    createInternalData: createWritingSessionShellInternalData,
});
