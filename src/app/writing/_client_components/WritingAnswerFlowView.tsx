"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingScreenMode } from "../types";
import { activeWritingScenario } from "../_flows/writingScenarioState";

export type WritingAnswerFlowViewOutput =
  | { type: "updateDraftAnswer"; value: string }
  | { type: "updateFreeWritingDraft"; value: string }
  | { type: "saveDraft" }
  | { type: "submitAnswer" }
  | { type: "clearError" }
  | { type: "clearInfo" };

type Props = {
  input: {
    mode: WritingScreenMode;
    session: WritingPracticeSessionResponse | null;
    activeScenarioIndex: number;
    draftAnswer: string;
    freeWritingDraft: string;
    isSubmittingAnswer: boolean;
    error: string | null;
    infoMessage: string | null;
  };
  output: OutputHandle<WritingAnswerFlowViewOutput>;
};

export default function WritingAnswerFlowView({ input, output }: Props) {
  const scenario = activeWritingScenario(input.session, input.activeScenarioIndex);
  if (input.mode !== "detail" || !input.session || !scenario || scenario.submittedAt) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your German Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label htmlFor="writing-translation" className="sr-only">German translation</label>
          <Textarea
            id="writing-translation"
            value={input.draftAnswer}
            onChange={(event) => output.emit({ type: "updateDraftAnswer", value: event.target.value })}
            placeholder="Write your answer in German."
            className="min-h-48"
            disabled={input.isSubmittingAnswer}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => output.emit({ type: "saveDraft" })} disabled={input.isSubmittingAnswer}>
              {input.isSubmittingAnswer ? "Saving..." : "Save Draft"}
            </Button>
            <Button type="button" onClick={() => output.emit({ type: "submitAnswer" })} disabled={input.isSubmittingAnswer}>
              {input.isSubmittingAnswer ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Free-Style Writing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scenario.freeWritingInstructions ? (
            <p className="text-sm leading-6 text-muted-foreground">{scenario.freeWritingInstructions}</p>
          ) : null}
          <label htmlFor="free-style-writing" className="sr-only">Free-style writing</label>
          <Textarea
            id="free-style-writing"
            value={input.freeWritingDraft}
            onChange={(event) => output.emit({ type: "updateFreeWritingDraft", value: event.target.value })}
            placeholder="Write freely in German using the prompt above."
            className="min-h-48"
            disabled={input.isSubmittingAnswer}
          />
        </CardContent>
      </Card>

      {input.infoMessage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {input.infoMessage}
          <Button type="button" size="sm" variant="ghost" onClick={() => output.emit({ type: "clearInfo" })}>
            Dismiss
          </Button>
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
