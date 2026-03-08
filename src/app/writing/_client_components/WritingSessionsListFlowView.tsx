"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { WritingPracticeSessionSummaryResponse } from "@/lib/types/responses/WritingPracticeSessionSummaryResponse";
import { WritingScreenMode } from "../types";
import WritingSessionsList from "./WritingSessionsList";

export type WritingSessionsListFlowViewOutput =
    | { type: "reload" }
    | { type: "create" }
    | { type: "openSession"; sessionId: string }
    | { type: "clearError" }
    | { type: "clearInfo" };

type WritingSessionsListFlowViewProps = {
    input: {
        mode: WritingScreenMode;
        sessions: WritingPracticeSessionSummaryResponse[];
        activeSessionId: string | null;
        isLoadingSessions: boolean;
        isLoadingSessionDetail: boolean;
        isCreatingSession: boolean;
        isDeletingSession: boolean;
        error: string | null;
        infoMessage: string | null;
    };
    output: OutputHandle<WritingSessionsListFlowViewOutput>;
};

export default function WritingSessionsListFlowView({ input, output }: WritingSessionsListFlowViewProps) {
    if (input.mode !== "list") {
        return null;
    }

    return (
        <div className="min-h-screen w-full px-4 py-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <WritingSessionsList
                    sessions={input.sessions}
                    activeSessionId={input.activeSessionId}
                    isLoadingSessions={input.isLoadingSessions}
                    isLoadingSessionDetail={input.isLoadingSessionDetail}
                    isCreatingSession={input.isCreatingSession}
                    isDeletingSession={input.isDeletingSession}
                    onReload={() => output.emit({ type: "reload" })}
                    onCreate={() => output.emit({ type: "create" })}
                    onOpen={(sessionId) => output.emit({ type: "openSession", sessionId })}
                />

                {input.infoMessage ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {input.infoMessage}
                    </div>
                ) : null}

                {input.error ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <span>{input.error}</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => output.emit({ type: "clearError" })}>
                            Dismiss
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
