"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingScreenMode } from "../types";

export type WritingAnswerFlowViewOutput =
    | { type: "updateDraftAnswer"; value: string }
    | { type: "submitAnswer" }
    | { type: "clearError" }
    | { type: "clearInfo" };

type WritingAnswerFlowViewProps = {
    input: {
        mode: WritingScreenMode;
        session: WritingPracticeSessionResponse | null;
        draftAnswer: string;
        isSubmittingAnswer: boolean;
        error: string | null;
        infoMessage: string | null;
    };
    output: OutputHandle<WritingAnswerFlowViewOutput>;
};

export default function WritingAnswerFlowView({ input, output }: WritingAnswerFlowViewProps) {
    if (input.mode !== "detail" || !input.session || input.session.submittedAnswer?.trim()) {
        return null;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Your answer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea
                        value={input.draftAnswer}
                        onChange={(event) => output.emit({ type: "updateDraftAnswer", value: event.target.value })}
                        placeholder="Write your answer in German."
                        className="min-h-48"
                        disabled={input.isSubmittingAnswer}
                    />
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => output.emit({ type: "submitAnswer" })} disabled={input.isSubmittingAnswer}>
                            {input.isSubmittingAnswer ? "Submitting..." : "Submit answer"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
        </>
    );
}
