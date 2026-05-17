import { Rating } from "../Rating";

export type StudySessionItemResponse = {
    itemId: string;
    flashcardId: string;
    vocabularyId: string;
    sentenceId: string;
    clozeSentence: string;
    hint: string;
    expectedAnswer: string;
    answerTranslation: string;
};

export type StudySessionResponse = {
    sessionId: string;
    status: string;
    ratedCount: number;
    totalCount: number;
    currentItem: StudySessionItemResponse | null;
    createdAt: string;
    feedback: string | null;
    appliedRating: Rating | null;
};

