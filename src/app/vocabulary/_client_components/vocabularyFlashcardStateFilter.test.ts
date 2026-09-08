import { describe, expect, it } from "vitest";
import {
    DEFAULT_FLASHCARD_STATE_FILTER,
    filterVocabularyByFlashcardState,
} from "./vocabularyFlashcardStateFilter";
import { VocabularyListItem } from "../types";

function vocabulary(id: string, reverseFlashcardState: VocabularyListItem["reverseFlashcardState"]): VocabularyListItem {
    return {
        id,
        surface: id,
        translation: id,
        entryKind: "WORD",
        notes: "",
        exampleSentences: [],
        reverseFlashcardState,
    };
}

const vocabularies = [
    vocabulary("new", "NEW"),
    vocabulary("learning", "LEARNING"),
    vocabulary("re-learning", "RE_LEARNING"),
    vocabulary("review", "REVIEW"),
    vocabulary("not-attached", null),
];

describe("vocabulary reverse flashcard state filter", () => {
    it("shows all vocabulary by default", () => {
        expect(DEFAULT_FLASHCARD_STATE_FILTER).toBe("ALL");
        expect(filterVocabularyByFlashcardState(vocabularies, DEFAULT_FLASHCARD_STATE_FILTER)).toEqual(vocabularies);
    });

    it("shows only vocabulary without an attached reverse flashcard", () => {
        expect(filterVocabularyByFlashcardState(vocabularies, "NO_ATTACHED").map((item) => item.id)).toEqual([
            "not-attached",
        ]);
    });

    it.each(["NEW", "LEARNING", "RE_LEARNING", "REVIEW"] as const)(
        "shows only vocabulary whose reverse flashcard state is %s",
        (state) => {
            expect(filterVocabularyByFlashcardState(vocabularies, state).map((item) => item.reverseFlashcardState)).toEqual([
                state,
            ]);
        }
    );
});
