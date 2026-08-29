import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReadingFlashcardReview from "./ReadingFlashcardReview";

describe("ReadingFlashcardReview", () => {
    it("offers reading ratings without Easy", () => {
        render(
            <ReadingFlashcardReview
                card={{ id: "card-1", front: { wordOrChunk: "Bahnhof" }, back: { wordOrChunk: "station" } }}
                currentIndex={0}
                totalCards={1}
                flipped
                isRating={false}
                onFlip={vi.fn()}
                onRate={vi.fn()}
                onNext={vi.fn()}
                onPrevious={vi.fn()}
                onReset={vi.fn()}
            />
        );

        expect(screen.queryByRole("button", { name: "Easy" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Good" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Hard" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Again" })).toBeInTheDocument();
    });
});
