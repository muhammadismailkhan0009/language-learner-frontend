import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClozePracticeDetail } from "./ClozePracticeDetail";
import { ReadingParagraphClozeSession } from "@/flows/reading-paragraph-cloze/contracts";

const session: ReadingParagraphClozeSession = { sessionId: "s1", learnerLevel: "A2", createdAt: "2026-01-01T00:00:00Z", paragraphs: [{
    paragraphId: "p1", paragraphIndex: 0, scenarioLabel: "Trip", clozeParagraph: "Sie {{b1}}.", blanks: [{
        blankId: "one", blankIndex: 0, blankToken: "{{b1}}", exactAnswer: "fährt", answerExplanation: "Third-person form.", practiceKind: "VOCABULARY_AND_GRAMMAR",
        vocabularyDetails: { id: "v1", surface: "fahren", translation: "to travel", entryKind: "VERB", notes: null, exampleSentences: [] },
        grammarRuleDetails: [{ id: "g1", identifier: "present", name: "Present tense", level: "A1", explanationParagraphs: ["Conjugate for the subject."], explanationExamples: [] }],
    }],
}] };

function renderDetail(results: Record<string, boolean> | null, answers: Record<string, string> = {}) {
    const submit = vi.fn(); render(<ClozePracticeDetail session={session} answers={answers} results={results} canSubmit={Boolean(answers.one)} busy={null}
        onAnswer={vi.fn()} onSubmit={submit} onBack={vi.fn()} onDelete={vi.fn()} />); return submit;
}

describe("cloze practice detail", () => {
    it("disables checking until every answer is present", () => {
        renderDetail(null); expect(screen.getByRole("button", { name: "Check all answers" })).toBeDisabled();
    });
    it("focuses the first wrong answer and exposes keyboard-operable source details", async () => {
        renderDetail({ one: false }, { one: "fahrt" });
        expect(screen.getByRole("textbox", { name: "Answer 1 for Trip" })).toHaveFocus();
        const vocabulary = screen.getByText("Vocabulary: fahren");
        await userEvent.click(vocabulary);
        expect(vocabulary.closest("details")).toHaveAttribute("open");
        expect(screen.getByText("Grammar: Present tense (A1)")).toBeInTheDocument();
    });
});
