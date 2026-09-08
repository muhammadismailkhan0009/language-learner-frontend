import { ReverseFlashcardState } from "@/lib/types/responses/VocabularyResponse";
import { VocabularyListItem } from "../types";

export type FlashcardStateFilter = "ALL" | "NO_ATTACHED" | ReverseFlashcardState;

export const DEFAULT_FLASHCARD_STATE_FILTER: FlashcardStateFilter = "ALL";

export function filterVocabularyByFlashcardState(
    vocabularies: VocabularyListItem[],
    filter: FlashcardStateFilter
): VocabularyListItem[] {
    if (filter === "ALL") {
        return vocabularies;
    }

    if (filter === "NO_ATTACHED") {
        return vocabularies.filter((item) => item.reverseFlashcardState == null);
    }

    return vocabularies.filter((item) => item.reverseFlashcardState === filter);
}
