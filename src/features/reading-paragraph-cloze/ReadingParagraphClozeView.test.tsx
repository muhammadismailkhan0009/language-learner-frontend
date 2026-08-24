import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReadingParagraphClozeView, ReadingParagraphClozeViewProps } from "./ReadingParagraphClozeView";

function props(overrides: Partial<ReadingParagraphClozeViewProps> = {}): ReadingParagraphClozeViewProps {
    return { sessions: [], selectedSession: null, answers: {}, results: null, limit: 50, busy: null, error: null,
        canSubmit: false, setLimit: vi.fn(), setAnswer: vi.fn(), load: vi.fn(), open: vi.fn(), create: vi.fn(),
        remove: vi.fn(), submit: vi.fn(), back: vi.fn(), clearError: vi.fn(), ...overrides };
}

describe("reading paragraph cloze view states", () => {
    it("shows loading and empty library guidance", () => {
        const { rerender } = render(<ReadingParagraphClozeView {...props({ busy: "list" })} />);
        expect(screen.getByText("Loading practice sessions…")).toBeInTheDocument();
        rerender(<ReadingParagraphClozeView {...props()} />);
        expect(screen.getByText(/No unfinished cloze sessions/)).toBeInTheDocument();
    });
    it("announces recoverable errors", () => {
        render(<ReadingParagraphClozeView {...props({ error: "Could not load sessions" })} />);
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load sessions");
    });
});
