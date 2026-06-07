"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rating } from "@/lib/types/Rating";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingScreenMode } from "../types";
import WritingFlashcardReview from "./WritingFlashcardReview";

export type WritingReviewFlowViewOutput =
  | { type: "flipFlashcard" }
  | { type: "rateFlashcard"; rating: Rating }
  | { type: "nextFlashcard" }
  | { type: "previousFlashcard" }
  | { type: "resetFlashcards" }
  | { type: "clearError" }
  | { type: "clearInfo" };

type Props = {
  input: {
    mode: WritingScreenMode;
    session: WritingPracticeSessionResponse | null;
    flashcardReview: {
      currentIndex: number;
      isCurrentCardFlipped: boolean;
      ratedCardIds: string[];
    };
    isRatingFlashcard: boolean;
    error: string | null;
    infoMessage: string | null;
  };
  output: OutputHandle<WritingReviewFlowViewOutput>;
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

export default function WritingReviewFlowView({ input, output }: Props) {
  if (input.mode !== "detail" || !input.session || !input.session.submittedAt) {
    return null;
  }

  const remainingCards = input.session.vocabFlashcards.filter((card) => !input.flashcardReview.ratedCardIds.includes(card.id));
  const currentCard = remainingCards[input.flashcardReview.currentIndex] ?? null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Translation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
            {input.session.submittedAnswer?.trim() || "No submitted answer recorded."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reference German Paragraph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
            {input.session.germanParagraph?.trim() || "No German reference available yet."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LLM Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {input.session.feedbackGeneratedAt ? (
            <div className="mb-2 text-xs text-muted-foreground">Generated {formatDate(input.session.feedbackGeneratedAt)}</div>
          ) : null}
          <div className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
            {input.session.feedbackText?.trim() || "No feedback available yet."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Review</CardTitle>
        </CardHeader>
        <CardContent>
          <WritingFlashcardReview
            card={currentCard}
            currentIndex={input.flashcardReview.currentIndex}
            totalCards={remainingCards.length}
            flipped={input.flashcardReview.isCurrentCardFlipped}
            isRating={input.isRatingFlashcard}
            onFlip={() => output.emit({ type: "flipFlashcard" })}
            onRate={(rating) => output.emit({ type: "rateFlashcard", rating })}
            onNext={() => output.emit({ type: "nextFlashcard" })}
            onPrevious={() => output.emit({ type: "previousFlashcard" })}
            onReset={() => output.emit({ type: "resetFlashcards" })}
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
