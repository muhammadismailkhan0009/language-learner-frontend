import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClozeParagraphInputs } from "./ClozeParagraphInputs";

const paragraph = { paragraphId: "p1", paragraphIndex: 0, scenarioLabel: "At the station",
    clozeParagraph: "Anna {{blank-1}} den Zug. (sehen)", blanks: [{ blankId: "b1", blankIndex: 0,
        blankToken: "{{blank-1}}", exactAnswer: "sieht", answerExplanation: "Third-person singular.",
        practiceKind: "VOCABULARY_FORM" as const, vocabularyDetails: null, grammarRuleDetails: [] }] };

describe("cloze paragraph inputs", () => {
    it("replaces declared tokens with labelled inputs while preserving visible cues", () => {
        render(<ClozeParagraphInputs paragraph={paragraph} answers={{}} results={null} onAnswer={vi.fn()} />);
        expect(screen.getByRole("textbox", { name: "Answer 1 for At the station" })).toBeInTheDocument();
        expect(screen.getByText(/den Zug\. \(sehen\)/)).toBeInTheDocument();
        expect(screen.queryByText("sieht")).not.toBeInTheDocument();
    });
    it("shows answer explanation after submission", () => {
        render(<ClozeParagraphInputs paragraph={paragraph} answers={{ b1: "seht" }} results={{ b1: false }} onAnswer={vi.fn()} />);
        expect(screen.getByText("Try this one again")).toBeInTheDocument();
        expect(screen.getByText("sieht")).toBeInTheDocument();
        expect(screen.getByText("Third-person singular.")).toBeInTheDocument();
    });
});
