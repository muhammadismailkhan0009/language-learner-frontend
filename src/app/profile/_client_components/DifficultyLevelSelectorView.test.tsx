import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DifficultyLevelSelectorView from "./DifficultyLevelSelectorView";

const baseInput = {
    difficultyLevel: "A2" as const,
    readingDifficultyLevel: "B1" as const,
    writingDifficultyLevel: "B2" as const,
    savedDifficultyLevel: "A2" as const,
    savedReadingDifficultyLevel: "B1" as const,
    savedWritingDifficultyLevel: "B2" as const,
    isLoading: false,
    isSaving: false,
    error: null,
    message: null,
};

describe("profile difficulty levels", () => {
    it("shows unified, reading, and writing levels independently", () => {
        render(<DifficultyLevelSelectorView input={baseInput} output={{ emit: vi.fn() }} />);

        expect(screen.getByRole("combobox", { name: "General difficulty level" })).toHaveValue("A2");
        expect(screen.getByRole("combobox", { name: "Reading difficulty level" })).toHaveValue("B1");
        expect(screen.getByRole("combobox", { name: "Writing difficulty level" })).toHaveValue("B2");
    });

    it("identifies which level changed", async () => {
        const emit = vi.fn();
        render(<DifficultyLevelSelectorView input={baseInput} output={{ emit }} />);

        await userEvent.selectOptions(screen.getByRole("combobox", { name: "Reading difficulty level" }), "C1");

        expect(emit).toHaveBeenCalledWith({ type: "setLevel", levelKind: "reading", difficultyLevel: "C1" });
    });

    it("allows saving when only one level changed", () => {
        render(
            <DifficultyLevelSelectorView
                input={{ ...baseInput, writingDifficultyLevel: "C1" }}
                output={{ emit: vi.fn() }}
            />
        );

        expect(screen.getByRole("button", { name: "Save levels" })).toBeEnabled();
    });
});
