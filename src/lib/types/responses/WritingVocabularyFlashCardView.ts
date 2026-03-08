import { Back, Front } from "./FlashCard";

export type WritingVocabularyFlashCardView = {
    id: string;
    front: Front;
    back: Back;
    isReversed?: boolean;
};
