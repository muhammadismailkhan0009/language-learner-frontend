import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReadingParagraphClozeBackendPort } from "./ports/ReadingParagraphClozeBackendPort";
import { ReadingParagraphClozeSession } from "./contracts";
import { useReadingParagraphClozeFlow } from "./useReadingParagraphClozeFlow";

const session: ReadingParagraphClozeSession = { sessionId: "s1", learnerLevel: "A2", createdAt: "2026-01-01T00:00:00Z", paragraphs: [{
    paragraphId: "p1", paragraphIndex: 0, scenarioLabel: "Trip", clozeParagraph: "Sie {{b1}}.", blanks: [{
        blankId: "one", blankIndex: 0, blankToken: "{{b1}}", exactAnswer: "fährt", answerExplanation: "Verb form",
        practiceKind: "VOCABULARY_FORM", vocabularyDetails: null, grammarRuleDetails: [],
    }],
}] };

function port(): ReadingParagraphClozeBackendPort {
    return { list: vi.fn().mockResolvedValue([session]), get: vi.fn().mockResolvedValue(session),
        create: vi.fn().mockResolvedValue(session), delete: vi.fn().mockResolvedValue(undefined) };
}

describe("reading paragraph cloze flow", () => {
    it("loads the library and opens a selected session", async () => {
        const backend = port(); const { result } = renderHook(() => useReadingParagraphClozeFlow(backend));
        await waitFor(() => expect(result.current.sessions).toEqual([session]));
        await act(() => result.current.open("s1"));
        expect(backend.get).toHaveBeenCalledWith("s1");
        expect(result.current.selectedSession).toEqual(session);
    });

    it("keeps wrong work, then deletes and returns to list when corrected", async () => {
        const backend = port(); const { result } = renderHook(() => useReadingParagraphClozeFlow(backend));
        await waitFor(() => expect(result.current.busy).toBeNull());
        await act(() => result.current.open("s1"));
        act(() => result.current.setAnswer("one", "fahrt"));
        await act(() => result.current.submit());
        expect(result.current.results).toEqual({ one: false });
        expect(backend.delete).not.toHaveBeenCalled();
        act(() => result.current.setAnswer("one", "faehrt"));
        await act(() => result.current.submit());
        expect(backend.delete).toHaveBeenCalledWith("s1");
        expect(result.current.selectedSession).toBeNull();
    });

    it("keeps completed work visible when automatic deletion fails", async () => {
        const backend = port(); vi.mocked(backend.delete).mockRejectedValue(new Error("Delete unavailable"));
        const { result } = renderHook(() => useReadingParagraphClozeFlow(backend));
        await waitFor(() => expect(result.current.busy).toBeNull());
        await act(() => result.current.open("s1"));
        act(() => result.current.setAnswer("one", "fährt"));
        await act(() => result.current.submit());
        expect(result.current.selectedSession).toEqual(session);
        expect(result.current.results).toEqual({ one: true });
        expect(result.current.error).toBe("Delete unavailable");
    });

    it("creates another session without removing the existing library", async () => {
        const backend = port(); const { result } = renderHook(() => useReadingParagraphClozeFlow(backend));
        await waitFor(() => expect(result.current.sessions).toEqual([session]));
        await act(() => result.current.create());
        expect(backend.create).toHaveBeenCalledWith(50);
        expect(result.current.sessions).toEqual([session]);
    });
});
