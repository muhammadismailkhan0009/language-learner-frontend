import { Back, FlashCard, Front } from "../types/responses/FlashCard";

type FlashCardLike = {
    front?: Front;
    back?: Back;
    note?: string;
};

export function getFlashCardFrontText(card: FlashCardLike): string {
    return card.front?.wordOrChunk ?? card.front?.clozeText ?? "";
}

export function getFlashCardFrontHint(card: FlashCardLike): string {
    return card.front?.hint ?? "";
}

export function getFlashCardBackText(card: FlashCardLike): string {
    return card.back?.wordOrChunk ?? card.back?.answerText ?? "";
}

export function getFlashCardBackTranslation(card: FlashCardLike): string {
    return card.back?.answerTranslation ?? "";
}

export function getFlashCardBackAnswerWords(card: FlashCardLike): string[] {
    return card.back?.answerWords ?? [];
}

export function getFlashCardBackNotes(card: FlashCardLike): string {
    return card.back?.notes ?? card.note ?? "";
}
