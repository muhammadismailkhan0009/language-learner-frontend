import { LanguageLevel } from "../LanguageLevel";

export type UserProfileResponse = {
    userId: string;
    difficultyLevel: LanguageLevel;
    readingDifficultyLevel: LanguageLevel;
    writingDifficultyLevel: LanguageLevel;
    createdAt: string;
    updatedAt: string;
};
