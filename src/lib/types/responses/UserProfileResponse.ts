import { LanguageLevel } from "../LanguageLevel";

export type UserProfileResponse = {
    userId: string;
    difficultyLevel: LanguageLevel;
    createdAt: string;
    updatedAt: string;
};
