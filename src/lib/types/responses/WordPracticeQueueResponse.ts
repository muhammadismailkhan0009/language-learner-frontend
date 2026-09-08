export type WordPracticeDirection = "GERMAN_TO_ENGLISH" | "ENGLISH_TO_GERMAN";

export type WordPracticeResponse = {
    id: string;
    vocabularyId: string;
    direction: WordPracticeDirection;
    sourceSentence: string;
    clozeSentence: string;
    completeSentence: string;
    exactAnswer: string;
    acceptedAnswers: string[];
    createdAt: string;
};

export type WordPracticeQueueResponse = {
    activeVocabularyCount: number;
    maximumVocabularyCount: number;
    generationVocabularyCount: number;
    practices: WordPracticeResponse[];
};
