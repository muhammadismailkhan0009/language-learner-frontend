import { Back, Front } from "./FlashCard";

export type ReadingVocabularyFlashCardView = {
    id: string;
    front: Front;
    back: Back;
    isReversed?: boolean;
};
