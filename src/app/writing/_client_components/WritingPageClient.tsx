"use client";

import { useMemo } from "react";
import { createFlowChannel, FlowRunner } from "@myriadcodelabs/uiflow";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { writingAnswerFlow } from "../_flows/writingAnswerFlow";
import { writingReviewFlow } from "../_flows/writingReviewFlow";
import { writingSessionShellFlow } from "../_flows/writingSessionShellFlow";
import { writingSessionsListFlow } from "../_flows/writingSessionsListFlow";
import { WritingScreenMode } from "../types";

export default function WritingPageClient() {
    const screenMode = useMemo(() => createFlowChannel<WritingScreenMode>("list"), []);
    const selectedWritingSessionId = useMemo(() => createFlowChannel<string | null>(null), []);
    const writingSessionsRefresh = useMemo(() => createFlowChannel<number>(0), []);
    const currentWritingSession = useMemo(() => createFlowChannel<WritingPracticeSessionResponse | null>(null), []);
    const writingReviewedCardIds = useMemo(() => createFlowChannel<string[]>([]), []);

    return (
        <>
            <FlowRunner
                initialData={{}}
                flow={writingSessionsListFlow}
                eventChannels={{ screenMode, selectedWritingSessionId, writingSessionsRefresh }}
            />
            <div className="min-h-screen w-full px-4 py-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    <FlowRunner
                        initialData={{}}
                        flow={writingSessionShellFlow}
                        eventChannels={{ screenMode, selectedWritingSessionId, writingSessionsRefresh, currentWritingSession, writingReviewedCardIds }}
                    />
                    <FlowRunner
                        initialData={{}}
                        flow={writingAnswerFlow}
                        eventChannels={{ screenMode, selectedWritingSessionId, writingSessionsRefresh, currentWritingSession }}
                    />
                    <FlowRunner
                        initialData={{}}
                        flow={writingReviewFlow}
                        eventChannels={{ screenMode, selectedWritingSessionId, writingSessionsRefresh, currentWritingSession, writingReviewedCardIds }}
                    />
                </div>
            </div>
        </>
    );
}
