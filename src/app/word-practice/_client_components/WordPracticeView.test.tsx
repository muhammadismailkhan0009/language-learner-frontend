import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WordPracticeView, { WordPracticeViewInput, canGenerateWordPractices } from "./WordPracticeView";

const practice = {
    id: "practice-1",
    vocabularyId: "vocabulary-1",
    direction: "GERMAN_TO_ENGLISH" as const,
    sourceSentence: "Das Haus ist groß.",
    clozeSentence: "The ___ is large.",
    completeSentence: "The house is large.",
    exactAnswer: "house",
    acceptedAnswers: ["home"],
    createdAt: "2026-09-08T00:00:00Z",
};

describe("WordPracticeView", () => {
    it("allows generation whenever at least one vocabulary slot remains", () => {
        expect(canGenerateWordPractices({ activeVocabularyCount: 14, maximumVocabularyCount: 15, generationVocabularyCount: 10, practices: [] })).toBe(true);
        expect(canGenerateWordPractices({ activeVocabularyCount: 15, maximumVocabularyCount: 15, generationVocabularyCount: 10, practices: [] })).toBe(false);
    });

    it("shows the submitted and expected answers after an incorrect answer", () => {
        renderView({ feedback: { correct: false, submittedAnswer: "building", vocabularySurface: "das Gebäude" } });

        expect(screen.getByText("Not quite — this stays in your queue")).toBeInTheDocument();
        expect(screen.getByText("building")).toBeInTheDocument();
        expect(screen.getByText("das Gebäude")).toBeInTheDocument();
        expect(screen.getByText("house")).toBeInTheDocument();
        expect(screen.getByText("The house is large.")).toBeInTheDocument();
    });

    it("emits the typed answer and check intent", () => {
        const emit = vi.fn();
        renderView({}, emit);

        fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "house" } });
        expect(emit).toHaveBeenCalledWith({ type: "updateAnswer", answer: "house" });
    });
});

function renderView(overrides: Partial<WordPracticeViewInput> = {}, emit = vi.fn()) {
    const input: WordPracticeViewInput = {
        queue: { activeVocabularyCount: 1, maximumVocabularyCount: 15, generationVocabularyCount: 10, practices: [practice] },
        practice,
        answer: "",
        feedback: null,
        isLoading: false,
        isGenerating: false,
        isSubmitting: false,
        error: null,
        info: null,
        ...overrides,
    };
    render(<WordPracticeView input={input} output={{ emit }} />);
}
