import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClozeSessionList } from "./ClozeSessionList";
import { ReadingParagraphClozeSession } from "@/flows/reading-paragraph-cloze/contracts";

const session: ReadingParagraphClozeSession = { sessionId: "s1", learnerLevel: "A2", createdAt: "2026-01-01T00:00:00Z", paragraphs: [{
    paragraphId: "p1", paragraphIndex: 0, scenarioLabel: "Train journey", clozeParagraph: "Sie {{b1}}.", blanks: [{
        blankId: "one", blankIndex: 0, blankToken: "{{b1}}", exactAnswer: "fährt", answerExplanation: "Verb form",
        practiceKind: "VOCABULARY_FORM", vocabularyDetails: null, grammarRuleDetails: [],
    }],
}] };

describe("cloze session library", () => {
    it("shows session metadata without leaking exact answers", () => {
        render(<ClozeSessionList sessions={[session]} limit={50} busy={null} generationStatus={null} onLimit={vi.fn()} onRefresh={vi.fn()} onCreate={vi.fn()} onOpen={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getAllByText("Train journey")).toHaveLength(2);
        expect(screen.getAllByText(/A2/).length).toBeGreaterThan(0);
        expect(screen.queryByText("fährt")).not.toBeInTheDocument();
    });
    it("opens the chosen session", async () => {
        const open = vi.fn(); render(<ClozeSessionList sessions={[session]} limit={50} busy={null} generationStatus={null} onLimit={vi.fn()} onRefresh={vi.fn()} onCreate={vi.fn()} onOpen={open} onDelete={vi.fn()} />);
        await userEvent.click(screen.getByRole("button", { name: "Open session" }));
        expect(open).toHaveBeenCalledWith("s1");
    });
});
