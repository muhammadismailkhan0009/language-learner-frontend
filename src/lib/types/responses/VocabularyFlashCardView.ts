import { Back, Front } from "./FlashCard";

export type VocabularyFlashCardView = {
    id: string;
    front: Front;
    back: Back;
    isReversed: boolean;
    isRevision: boolean;
};
