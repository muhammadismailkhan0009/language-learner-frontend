import { defineFlow } from "@myriadcodelabs/uiflow";
import { ReadingPracticeSessionSummaryResponse } from "@/lib/types/responses/ReadingPracticeSessionSummaryResponse";
import { ReadingPracticeSessionResponse } from "@/lib/types/responses/ReadingPracticeSessionResponse";
import { Rating } from "@/lib/types/Rating";
import listReadingPracticeSessionsAction from "../_server_actions/listReadingPracticeSessionsAction";
import getReadingPracticeSessionAction from "../_server_actions/getReadingPracticeSessionAction";
import createReadingPracticeSessionAction from "../_server_actions/createReadingPracticeSessionAction";
import deleteReadingPracticeSessionAction from "../_server_actions/deleteReadingPracticeSessionAction";
import reviewReadingFlashcardAction from "../_server_actions/reviewReadingFlashcardAction";
import detachReadingFlashcardAction from "../_server_actions/detachReadingFlashcardAction";
import ReadingPracticeView, { ReadingPracticeViewOutput } from "../_client_components/ReadingPracticeView";

type ReadingPracticeDomainData = Record<string, never>;

type ReadingPracticeInternalData = {
    flowData: {
        sessions: ReadingPracticeSessionSummaryResponse[];
        selectedSession: ReadingPracticeSessionResponse | null;
        activeSessionId: string | null;
        flashcardReview: {
            currentIndex: number;
            isCurrentCardFlipped: boolean;
            ratedCardIds: string[];
            pendingReview: {
                cardId: string | null;
                rating: Rating | null;
            };
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

function createInternalData(): ReadingPracticeInternalData {
    return {
        flowData: {
            sessions: [],
            selectedSession: null,
            activeSessionId: null,
            flashcardReview: {
                currentIndex: 0,
                isCurrentCardFlipped: false,
                ratedCardIds: [],
                pendingReview: {
                    cardId: null,
                    rating: null,
                },
            },
            ui: {
                isLoadingSessions: false,
                isLoadingSessionDetail: false,
                isCreatingSession: false,
                isDeletingSession: false,
                isRatingFlashcard: false,
                error: null,
                infoMessage: null,
            },
        },
    };
}

export const readingPracticeFlow = defineFlow<ReadingPracticeDomainData, ReadingPracticeInternalData>(
    {
        loadSessions: {
            input: () => ({}),
            action: async (_input, _domain, internal) => {
                internal.flowData.ui.isLoadingSessions = true;
                internal.flowData.ui.error = null;

                try {
                    internal.flowData.sessions = await listReadingPracticeSessionsAction();
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to load reading sessions";
                } finally {
                    internal.flowData.ui.isLoadingSessions = false;
                }

                return { ok: true };
            },
            onOutput: () => "showSessions",
        },

        createSession: {
            input: () => ({}),
            render: {
                mode: "preserve-previous",
            },
            action: (_input, _domain, internal) => {
                internal.flowData.ui.error = null;
                internal.flowData.ui.infoMessage = "You'll see content in list when done.";
                internal.flowData.ui.isCreatingSession = false;

                try {
                    void createReadingPracticeSessionAction();
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to create reading session";
                }

                return { ok: true };
            },
            onOutput: () => "showSessions",
        },

        loadSessionDetail: {
            input: (_domain, internal) => ({
                sessionId: internal.flowData.activeSessionId,
            }),
            action: async ({ sessionId }, _domain, internal) => {
                if (!sessionId) {
                    return { ok: false };
                }

                internal.flowData.ui.isLoadingSessionDetail = true;
                internal.flowData.ui.error = null;

                try {
                    internal.flowData.selectedSession = await getReadingPracticeSessionAction(sessionId);
                    internal.flowData.flashcardReview.currentIndex = 0;
                    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                    internal.flowData.flashcardReview.ratedCardIds = [];
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to load reading session details";
                } finally {
                    internal.flowData.ui.isLoadingSessionDetail = false;
                }

                return { ok: true };
            },
            onOutput: () => "showSessions",
        },

        deleteSession: {
            input: (_domain, internal) => ({
                sessionId: internal.flowData.activeSessionId,
            }),
            action: async ({ sessionId }, _domain, internal) => {
                if (!sessionId) {
                    return { ok: false };
                }

                internal.flowData.ui.isDeletingSession = true;
                internal.flowData.ui.error = null;

                try {
                    await deleteReadingPracticeSessionAction(sessionId);

                    if (internal.flowData.selectedSession?.sessionId === sessionId) {
                        internal.flowData.selectedSession = null;
                        internal.flowData.flashcardReview.currentIndex = 0;
                        internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                        internal.flowData.flashcardReview.ratedCardIds = [];
                    }
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to delete reading session";
                } finally {
                    internal.flowData.ui.isDeletingSession = false;
                }

                return { ok: true };
            },
            onOutput: () => "loadSessions",
        },

        rateFlashcard: {
            input: (_domain, internal) => ({
                cardId: internal.flowData.flashcardReview.pendingReview.cardId,
                rating: internal.flowData.flashcardReview.pendingReview.rating,
            }),
            render: {
                mode: "preserve-previous",
            },
            action: async ({ cardId, rating }, _domain, internal) => {
                if (!cardId || !rating) {
                    return { ok: false };
                }

                internal.flowData.ui.isRatingFlashcard = true;
                internal.flowData.ui.error = null;

                try {
                    void reviewReadingFlashcardAction(cardId, rating);

                    if (rating === Rating.GOOD || rating === Rating.EASY) {
                        const sessionId = internal.flowData.selectedSession?.sessionId;
                        if (sessionId) {
                            void detachReadingFlashcardAction(sessionId, cardId);
                        }
                    }
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to rate flashcard";
                } finally {
                    if (!internal.flowData.flashcardReview.ratedCardIds.includes(cardId)) {
                        internal.flowData.flashcardReview.ratedCardIds.push(cardId);
                    }

                    const remainingCardsCount =
                        internal.flowData.selectedSession?.vocabFlashcards.filter(
                            (card) => !internal.flowData.flashcardReview.ratedCardIds.includes(card.id)
                        ).length ?? 0;

                    if (remainingCardsCount > 0) {
                        internal.flowData.flashcardReview.currentIndex = Math.min(
                            internal.flowData.flashcardReview.currentIndex,
                            remainingCardsCount - 1
                        );
                    } else {
                        internal.flowData.flashcardReview.currentIndex = 0;
                    }
                    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                    internal.flowData.ui.isRatingFlashcard = false;
                    internal.flowData.flashcardReview.pendingReview.cardId = null;
                    internal.flowData.flashcardReview.pendingReview.rating = null;
                }

                return { ok: true };
            },
            onOutput: () => "showSessions",
        },

        showSessions: {
            input: (_domain, internal) => ({
                sessions: internal.flowData.sessions,
                selectedSession: internal.flowData.selectedSession,
                activeSessionId: internal.flowData.activeSessionId,
                flashcardReview: internal.flowData.flashcardReview,
                isLoadingSessions: internal.flowData.ui.isLoadingSessions,
                isLoadingSessionDetail: internal.flowData.ui.isLoadingSessionDetail,
                isCreatingSession: internal.flowData.ui.isCreatingSession,
                isDeletingSession: internal.flowData.ui.isDeletingSession,
                isRatingFlashcard: internal.flowData.ui.isRatingFlashcard,
                error: internal.flowData.ui.error,
                infoMessage: internal.flowData.ui.infoMessage,
            }),
            view: ReadingPracticeView,
            onOutput: (_domain, internal, output: ReadingPracticeViewOutput) => {
                if (output.type === "reload") {
                    return "loadSessions";
                }

                if (output.type === "create") {
                    return "createSession";
                }

                if (output.type === "openSession") {
                    internal.flowData.activeSessionId = output.sessionId;
                    return "loadSessionDetail";
                }

                if (output.type === "deleteSession") {
                    internal.flowData.activeSessionId = output.sessionId;
                    return "deleteSession";
                }

                if (output.type === "clearSelection") {
                    internal.flowData.selectedSession = null;
                    internal.flowData.activeSessionId = null;
                    internal.flowData.flashcardReview.currentIndex = 0;
                    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                    internal.flowData.flashcardReview.ratedCardIds = [];
                    internal.flowData.flashcardReview.pendingReview.cardId = null;
                    internal.flowData.flashcardReview.pendingReview.rating = null;
                    return "showSessions";
                }

                if (output.type === "flipFlashcard") {
                    internal.flowData.flashcardReview.isCurrentCardFlipped = true;
                    return "showSessions";
                }

                if (output.type === "nextFlashcard") {
                    const totalCards =
                        internal.flowData.selectedSession?.vocabFlashcards.filter(
                            (card) => !internal.flowData.flashcardReview.ratedCardIds.includes(card.id)
                        ).length ?? 0;
                    if (totalCards <= 0) {
                        return "showSessions";
                    }

                    internal.flowData.flashcardReview.currentIndex =
                        internal.flowData.flashcardReview.currentIndex >= totalCards - 1
                            ? 0
                            : internal.flowData.flashcardReview.currentIndex + 1;
                    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                    return "showSessions";
                }

                if (output.type === "rateFlashcard") {
                    const cards =
                        internal.flowData.selectedSession?.vocabFlashcards.filter(
                            (card) => !internal.flowData.flashcardReview.ratedCardIds.includes(card.id)
                        ) ?? [];
                    const currentCard = cards[internal.flowData.flashcardReview.currentIndex];
                    if (!currentCard) {
                        return "showSessions";
                    }

                    internal.flowData.flashcardReview.pendingReview.cardId = currentCard.id;
                    internal.flowData.flashcardReview.pendingReview.rating = output.rating;
                    return "rateFlashcard";
                }

                if (output.type === "previousFlashcard") {
                    internal.flowData.flashcardReview.currentIndex = Math.max(
                        internal.flowData.flashcardReview.currentIndex - 1,
                        0
                    );
                    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                    return "showSessions";
                }

                if (output.type === "resetFlashcards") {
                    internal.flowData.flashcardReview.currentIndex = 0;
                    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                    internal.flowData.flashcardReview.pendingReview.cardId = null;
                    internal.flowData.flashcardReview.pendingReview.rating = null;
                    return "showSessions";
                }

                if (output.type === "clearError") {
                    internal.flowData.ui.error = null;
                    return "showSessions";
                }

                if (output.type === "clearInfo") {
                    internal.flowData.ui.infoMessage = null;
                    return "showSessions";
                }

            },
        },
    },
    {
        start: "loadSessions",
        createInternalData,
    }
);
