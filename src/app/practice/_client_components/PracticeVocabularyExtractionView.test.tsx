import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PracticeVocabularyExtractionView from "./PracticeVocabularyExtractionView";

function input(overrides: Partial<Parameters<typeof PracticeVocabularyExtractionView>[0]["input"]> = {}) {
    return {
        text: "",
        isRequesting: false,
        error: null,
        message: null,
        ...overrides,
    };
}

describe("PracticeVocabularyExtractionView", () => {
    it("requests extraction and explains the MCP step", () => {
        const emit = vi.fn();
        render(
            <PracticeVocabularyExtractionView
                input={input({
                    text: "Ein kurzer Text",
                    message: "Vocabulary extraction requested. Run your MCP tool.",
                })}
                output={{ emit }}
            />,
        );

        expect(screen.getByRole("status")).toHaveTextContent("Run your MCP tool");
        fireEvent.click(screen.getByRole("button", { name: "Request Vocabulary Extraction" }));
        expect(emit).toHaveBeenCalledWith({ type: "request" });
    });

    it("emits text edits", () => {
        const emit = vi.fn();
        render(<PracticeVocabularyExtractionView input={input()} output={{ emit }} />);

        fireEvent.change(screen.getByPlaceholderText("Paste song lyrics or any text here..."), {
            target: { value: "Neue Wörter" },
        });
        expect(emit).toHaveBeenCalledWith({ type: "setText", text: "Neue Wörter" });
    });
});
