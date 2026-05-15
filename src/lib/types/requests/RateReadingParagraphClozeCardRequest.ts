import { Rating } from "../Rating";

export type RateReadingParagraphClozeCardRequest = {
    userId: string;
    flashcardId: string;
    rating: Rating;
};
