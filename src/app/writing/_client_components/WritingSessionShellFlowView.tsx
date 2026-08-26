"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFlashCardBackText, getFlashCardFrontText } from "@/lib/flashcards/flashCardText";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingScreenMode } from "../types";
import { activeWritingScenario } from "../_flows/writingScenarioState";
import WritingScenarioNavigation from "./WritingScenarioNavigation";

export type WritingSessionShellFlowViewOutput =
  | { type: "back" }
  | { type: "deleteSession" }
  | { type: "previousScenario" }
  | { type: "nextScenario" }
  | { type: "clearError" }
  | { type: "clearInfo" };

type Props = {
  input: {
    mode: WritingScreenMode;
    session: WritingPracticeSessionResponse | null;
    activeScenarioIndex: number;
    isLoadingSessionDetail: boolean;
    isDeletingSession: boolean;
    reviewedCardsCount: number;
    error: string | null;
    infoMessage: string | null;
  };
  output: OutputHandle<WritingSessionShellFlowViewOutput>;
};

function formatDate(dateValue: string): string {
  if (!dateValue) {
    return "-";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleString();
}

export default function WritingSessionShellFlowView({ input, output }: Props) {
  if (input.mode !== "detail") {
    return null;
  }

  const scenario = activeWritingScenario(input.session, input.activeScenarioIndex);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{scenario?.topic ?? "Writing Session"}</CardTitle>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "back" })}>
              Back To Sessions
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={input.isDeletingSession || !input.session}
              onClick={() => output.emit({ type: "deleteSession" })}
            >
              {input.isDeletingSession ? "Deleting..." : "Delete Session"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {input.isLoadingSessionDetail && !input.session ? (
            <div className="text-sm text-muted-foreground">Loading session...</div>
          ) : null}

          {input.session ? (
            <>
              <div className="text-xs text-muted-foreground">
                Created {formatDate(input.session.createdAt)}
                {scenario?.submittedAt ? ` • Submitted ${formatDate(scenario.submittedAt)}` : ""}
              </div>

              <WritingScenarioNavigation
                activeIndex={input.activeScenarioIndex}
                scenarioCount={input.session.scenarios.length}
                onPrevious={() => output.emit({ type: "previousScenario" })}
                onNext={() => output.emit({ type: "nextScenario" })}
              />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">English Prompt</h3>
                <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
                  {scenario?.englishParagraph?.trim() || "No English prompt available yet."}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Target Practice Vocabulary</h3>
                {scenario && scenario.vocabFlashcards.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {scenario.vocabFlashcards.map((card) => (
                      <span key={card.id} className="rounded-full border px-3 py-1 text-xs">
                        {getFlashCardFrontText(card)?.trim() || getFlashCardBackText(card)?.trim() || "Vocabulary"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No vocabulary cards attached to this session yet.</div>
                )}
              </div>

              <div className="rounded-md border bg-muted/30 p-4">
                <div className="text-sm font-medium">Cards To Review</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {Math.max((scenario?.vocabFlashcards.length ?? 0) - input.reviewedCardsCount, 0)} of {scenario?.vocabFlashcards.length ?? 0} remaining
                </div>
                {!scenario?.submittedAt ? (
                  <div className="mt-2 text-sm text-muted-foreground">Review cards unlock after you submit your answer.</div>
                ) : null}
              </div>
            </>
          ) : null}
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
