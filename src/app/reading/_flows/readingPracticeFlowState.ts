import { Rating } from "@/lib/types/Rating";
import { ReadingPracticeScenarioResponse } from "@/lib/types/responses/ReadingPracticeScenarioResponse";
import { ReadingPracticeSessionResponse } from "@/lib/types/responses/ReadingPracticeSessionResponse";
import { ReadingPracticeSessionSummaryResponse } from "@/lib/types/responses/ReadingPracticeSessionSummaryResponse";

export type ReadingPracticeDomainData = Record<string, never>;

export type ReadingPracticeInternalData = {
    flowData: {
        sessions: ReadingPracticeSessionSummaryResponse[];
        selectedSession: ReadingPracticeSessionResponse | null;
        activeSessionId: string | null;
        activeScenarioIndex: number;
        flashcardReview: {
            currentIndex: number;
            isCurrentCardFlipped: boolean;
            ratedCardIds: string[];
            pendingReview: { cardId: string | null; rating: Rating | null };
        };
        ui: {
            isLoadingSessions: boolean;
            isLoadingSessionDetail: boolean;
            isCreatingSession: boolean;
            isDeletingSession: boolean;
            isRatingFlashcard: boolean;
            error: string | null;
            infoMessage: string | null;
        };
    };
};

export function createReadingPracticeInternalData(): ReadingPracticeInternalData {
    return { flowData: {
        sessions: [], selectedSession: null, activeSessionId: null, activeScenarioIndex: 0,
        flashcardReview: {
            currentIndex: 0, isCurrentCardFlipped: false, ratedCardIds: [],
            pendingReview: { cardId: null, rating: null },
        },
        ui: {
            isLoadingSessions: false, isLoadingSessionDetail: false, isCreatingSession: false,
            isDeletingSession: false, isRatingFlashcard: false, error: null, infoMessage: null,
        },
    }};
}

export function readingScenarios(session: ReadingPracticeSessionResponse | null): ReadingPracticeScenarioResponse[] {
    if (!session) return [];
    if (session.scenarios?.length) return session.scenarios;
    return [{
        scenarioId: `${session.sessionId}-legacy`, topic: session.topic, readingText: session.readingText,
        readingParagraphs: session.readingParagraphs ?? [], vocabFlashcards: session.vocabFlashcards ?? [],
    }];
}

export function activeReadingScenario(internal: ReadingPracticeInternalData): ReadingPracticeScenarioResponse | null {
    return readingScenarios(internal.flowData.selectedSession)[internal.flowData.activeScenarioIndex] ?? null;
}

export function resetScenarioReview(internal: ReadingPracticeInternalData): void {
    internal.flowData.flashcardReview.currentIndex = 0;
    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
    internal.flowData.flashcardReview.pendingReview.cardId = null;
    internal.flowData.flashcardReview.pendingReview.rating = null;
}

export function resetSessionReview(internal: ReadingPracticeInternalData): void {
    resetScenarioReview(internal);
    internal.flowData.flashcardReview.ratedCardIds = [];
}

export function moveActiveScenario(internal: ReadingPracticeInternalData, offset: number): void {
    const lastIndex = readingScenarios(internal.flowData.selectedSession).length - 1;
    internal.flowData.activeScenarioIndex = Math.max(
        0,
        Math.min(internal.flowData.activeScenarioIndex + offset, lastIndex)
    );
}
