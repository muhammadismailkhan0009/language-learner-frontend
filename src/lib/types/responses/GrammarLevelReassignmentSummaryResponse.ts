import { LanguageLevel } from "../LanguageLevel";

export type GrammarLevelReassignmentChangedRuleResponse = {
    id: string;
    name: string;
    previousLevel: LanguageLevel;
    proposedLevel: LanguageLevel;
    reason: string | null;
};

export type GrammarLevelReassignmentSummaryResponse = {
    reviewedCount: number;
    changedCount: number;
    unchangedCount: number;
    changedRules: GrammarLevelReassignmentChangedRuleResponse[];
};
