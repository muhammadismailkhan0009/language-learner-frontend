export type ReadingParagraphClozeSessionCardResponse = {
    cardId: string;
    flashcardId: string;
    vocabularyId: string;
    surface: string;
    translation: string;
    blankToken: string;
    answerWords: string[];
};

export type ReadingParagraphClozeSessionResponse = {
    sessionId: string;
    topic: string;
    clozeParagraph: string;
    status: "ACTIVE" | "COMPLETED";
    ratedCount: number;
    totalCount: number;
    cards: ReadingParagraphClozeSessionCardResponse[];
    createdAt: string;
};
