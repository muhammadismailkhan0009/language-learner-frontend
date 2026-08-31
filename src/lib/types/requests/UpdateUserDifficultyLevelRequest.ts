import { LanguageLevel } from "../LanguageLevel";

export type UpdateUserDifficultyLevelRequest = {
    difficultyLevel: LanguageLevel;
    readingDifficultyLevel: LanguageLevel;
    writingDifficultyLevel: LanguageLevel;
};
