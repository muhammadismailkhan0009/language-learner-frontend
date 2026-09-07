import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WritingAnswerFlowView from "./WritingAnswerFlowView";

describe("WritingAnswerFlowView", () => {
  it("shows free-writing instructions and restores both draft fields", () => {
    renderView();

    expect(screen.getByText("Write two sentences about your day.")).toBeInTheDocument();
    expect(screen.getByLabelText("German translation")).toHaveValue("Ubersetzung draft");
    expect(screen.getByLabelText("Free-style writing")).toHaveValue("Free draft");
  });

  it("emits free-writing changes independently", () => {
    const emit = vi.fn();
    renderView(emit);

    fireEvent.change(screen.getByLabelText("Free-style writing"), { target: { value: "Neuer Text" } });

    expect(emit).toHaveBeenCalledWith({ type: "updateFreeWritingDraft", value: "Neuer Text" });
  });
});

function renderView(emit = vi.fn()) {
  render(
    <WritingAnswerFlowView
      input={{
        mode: "detail",
        session: {
          sessionId: "session-1",
          createdAt: "2026-09-07T00:00:00Z",
          scenarios: [{
            scenarioId: "scenario-1",
            position: 0,
            topic: "Daily life",
            englishParagraph: "English",
            germanParagraph: "Deutsch",
            freeWritingInstructions: "Write two sentences about your day.",
            freeWritingText: "Free draft",
            submittedAnswer: "Ubersetzung draft",
            submittedAt: null,
            feedbackText: null,
            structuredFeedback: null,
            feedbackGeneratedAt: null,
            sentencePairs: [],
            vocabFlashcards: [],
          }],
        },
        activeScenarioIndex: 0,
        draftAnswer: "Ubersetzung draft",
        freeWritingDraft: "Free draft",
        isSubmittingAnswer: false,
        error: null,
        infoMessage: null,
      }}
      output={{ emit }}
    />,
  );
}
