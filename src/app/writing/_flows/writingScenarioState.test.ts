import { describe, expect, it } from "vitest";
import { activeWritingScenario, nextWritingScenarioIndex } from "./writingScenarioState";
import type { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";

const session: WritingPracticeSessionResponse = {
  sessionId: "session-1",
  createdAt: "2026-08-26T12:00:00Z",
  scenarios: [
    {
      scenarioId: "scenario-1",
      position: 0,
      topic: "First",
      englishParagraph: "First English",
      germanParagraph: "Erstes Deutsch",
      freeWritingInstructions: "Write freely 1",
      freeWritingText: null,
      submittedAnswer: null,
      submittedAt: null,
      feedbackText: null,
      structuredFeedback: null,
      feedbackGeneratedAt: null,
      sentencePairs: [],
      vocabFlashcards: [],
    },
    {
      scenarioId: "scenario-2",
      position: 1,
      topic: "Second",
      englishParagraph: "Second English",
      germanParagraph: "Zweites Deutsch",
      freeWritingInstructions: "Write freely 2",
      freeWritingText: "Free draft",
      submittedAnswer: "Antwort",
      submittedAt: "2026-08-26T12:05:00Z",
      feedbackText: null,
      structuredFeedback: null,
      feedbackGeneratedAt: null,
      sentencePairs: [],
      vocabFlashcards: [],
    },
  ],
};

describe("writing scenario state", () => {
  it("selects scenario-level content by active index", () => {
    expect(activeWritingScenario(session, 1)?.scenarioId).toBe("scenario-2");
    expect(activeWritingScenario(session, 1)?.submittedAnswer).toBe("Antwort");
  });

  it("falls back safely and clamps navigation", () => {
    expect(activeWritingScenario(session, 99)?.scenarioId).toBe("scenario-1");
    expect(nextWritingScenarioIndex(0, 2, -1)).toBe(0);
    expect(nextWritingScenarioIndex(1, 2, 1)).toBe(1);
  });
});
