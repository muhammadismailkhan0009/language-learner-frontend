import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@myriadcodelabs/uiflow", () => ({
    createFlowChannel: () => ({ emit: vi.fn(), get: () => null, subscribe: vi.fn() }),
    defineFlow: (steps: unknown) => steps,
    FlowRunner: () => null,
}));

import ReadingPracticeView from "./ReadingPracticeView";
import {
    createReadingPracticeInternalData,
    moveActiveScenario,
    readingScenarios,
    resetScenarioReview,
} from "../_flows/readingPracticeFlowState";

const session = {
    sessionId: "session-1",
    topic: "First scenario",
    readingText: "First text",
    readingParagraphs: [{ paragraphText: "First text", sentences: ["First text"] }],
    vocabFlashcards: [],
    createdAt: "2026-01-01T00:00:00Z",
    scenarios: [
        {
            scenarioId: "scenario-1",
            topic: "First scenario",
            readingText: "First text",
            readingParagraphs: [{ paragraphText: "First text", sentences: ["First text"] }],
            vocabFlashcards: [],
        },
        {
            scenarioId: "scenario-2",
            topic: "Second scenario",
            readingText: "Second text",
            readingParagraphs: [{ paragraphText: "Second text", sentences: ["Second text"] }],
            vocabFlashcards: [],
        },
    ],
};

function input(activeScenarioIndex: number) {
    return {
        sessions: [],
        selectedSession: session,
        activeSessionId: session.sessionId,
        activeScenarioIndex,
        flashcardReview: { currentIndex: 0, isCurrentCardFlipped: false, ratedCardIds: [] },
        isLoadingSessions: false,
        isLoadingSessionDetail: false,
        isCreatingSession: false,
        isDeletingSession: false,
        isRatingFlashcard: false,
        error: null,
        infoMessage: null,
    };
}

describe("reading scenario navigation", () => {
    it("shows active scenario and emits next intent", () => {
        const emit = vi.fn();
        const { rerender } = render(<ReadingPracticeView input={input(0)} output={{ emit }} />);

        expect(screen.getByText("Scenario 1 of 2")).toBeInTheDocument();
        expect(screen.getByText("First scenario")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Previous scenario" })).toBeDisabled();

        fireEvent.click(screen.getByRole("button", { name: "Next scenario" }));
        expect(emit).toHaveBeenCalledWith({ type: "nextScenario" });

        rerender(<ReadingPracticeView input={input(1)} output={{ emit }} />);
        expect(screen.getByText("Scenario 2 of 2")).toBeInTheDocument();
        expect(screen.getByText("Second scenario")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Next scenario" })).toBeDisabled();
    });

    it("uses top-level fields as one legacy scenario", () => {
        const legacy = { ...session, scenarios: undefined };

        expect(readingScenarios(legacy)).toEqual([expect.objectContaining({
            topic: "First scenario",
            readingText: "First text",
        })]);
    });

    it("moves scenario selection and resets scenario-local review state", () => {
        const internal = createReadingPracticeInternalData();
        internal.flowData.selectedSession = session;
        internal.flowData.flashcardReview.currentIndex = 3;
        internal.flowData.flashcardReview.isCurrentCardFlipped = true;

        moveActiveScenario(internal, 1);
        resetScenarioReview(internal);

        expect(internal.flowData.activeScenarioIndex).toBe(1);
        expect(internal.flowData.flashcardReview.currentIndex).toBe(0);
        expect(internal.flowData.flashcardReview.isCurrentCardFlipped).toBe(false);
    });
});
