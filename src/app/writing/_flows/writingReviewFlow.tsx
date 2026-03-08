import { defineFlow } from "@myriadcodelabs/uiflow";
import { Rating } from "@/lib/types/Rating";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingVocabularyFlashCardView } from "@/lib/types/responses/WritingVocabularyFlashCardView";
import detachWritingFlashcardAction from "../_server_actions/detachWritingFlashcardAction";
import reviewWritingFlashcardAction from "../_server_actions/reviewWritingFlashcardAction";
import WritingReviewFlowView, { WritingReviewFlowViewOutput } from "../_client_components/WritingReviewFlowView";
import { WritingScreenMode } from "../types";

type WritingReviewDomainData = Record<string, never>;

type WritingReviewInternalData = {
    flowData: {
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
            isRatingFlashcard: boolean;
            error: string | null;
            infoMessage: string | null;
        };
    };
};

function createWritingReviewInternalData(): WritingReviewInternalData {
    return {
        flowData: {
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
                isRatingFlashcard: false,
                error: null,
                infoMessage: null,
            },
        },
    };
}

function resetReview(internal: WritingReviewInternalData) {
    internal.flowData.flashcardReview.currentIndex = 0;
    internal.flowData.flashcardReview.isCurrentCardFlipped = false;
    internal.flowData.flashcardReview.ratedCardIds = [];
    internal.flowData.flashcardReview.pendingReview.cardId = null;
    internal.flowData.flashcardReview.pendingReview.rating = null;
}

function getRemainingCards(session: WritingPracticeSessionResponse | null, ratedCardIds: string[]) {
    return session?.vocabFlashcards.filter((card) => !ratedCardIds.includes(card.id)) ?? [];
}

export const writingReviewFlow = defineFlow<WritingReviewDomainData, WritingReviewInternalData>({
    displayReview: {
        input: (_domain, internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
            flashcardReview: internal.flowData.flashcardReview,
            isRatingFlashcard: internal.flowData.ui.isRatingFlashcard,
            error: internal.flowData.ui.error,
            infoMessage: internal.flowData.ui.infoMessage,
        }),
        view: WritingReviewFlowView,
        onOutput: (_domain, internal, output: WritingReviewFlowViewOutput, events) => {
            const session = (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null;
            if (!session?.submittedAnswer?.trim()) {
                return "displayReview";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.error = null;
                return "displayReview";
            }

            if (output.type === "clearInfo") {
                internal.flowData.ui.infoMessage = null;
                return "displayReview";
            }

            if (output.type === "flipFlashcard") {
                internal.flowData.flashcardReview.isCurrentCardFlipped = true;
                return "displayReview";
            }

            if (output.type === "nextFlashcard") {
                const totalCards = getRemainingCards(session, internal.flowData.flashcardReview.ratedCardIds).length;
                if (totalCards <= 0) {
                    return "displayReview";
                }

                internal.flowData.flashcardReview.currentIndex =
                    internal.flowData.flashcardReview.currentIndex >= totalCards - 1
                        ? 0
                        : internal.flowData.flashcardReview.currentIndex + 1;
                internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                return "displayReview";
            }

            if (output.type === "previousFlashcard") {
                internal.flowData.flashcardReview.currentIndex = Math.max(
                    internal.flowData.flashcardReview.currentIndex - 1,
                    0
                );
                internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                return "displayReview";
            }

            if (output.type === "resetFlashcards") {
                internal.flowData.flashcardReview.currentIndex = 0;
                internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                internal.flowData.flashcardReview.pendingReview.cardId = null;
                internal.flowData.flashcardReview.pendingReview.rating = null;
                events?.writingReviewedCardIds.emit([]);
                return "displayReview";
            }

            if (output.type === "rateFlashcard") {
                const currentCard = getRemainingCards(session, internal.flowData.flashcardReview.ratedCardIds)[internal.flowData.flashcardReview.currentIndex];
                if (!currentCard) {
                    return "displayReview";
                }

                internal.flowData.flashcardReview.pendingReview.cardId = currentCard.id;
                internal.flowData.flashcardReview.pendingReview.rating = output.rating;
                return "rateFlashcard";
            }
        },
    },

    syncReview: {
        input: (_domain, _internal, events) => ({
            mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
            session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
        }),
        action: async ({ mode, session }, _domain, internal, events) => {
            if (mode !== "detail" || !session) {
                resetReview(internal);
                events?.writingReviewedCardIds.emit([]);
                return { ok: true };
            }

            const existingReviewedIds = (events?.writingReviewedCardIds?.get() as string[] | undefined) ?? [];
            internal.flowData.flashcardReview.ratedCardIds = existingReviewedIds.filter((cardId) =>
                session.vocabFlashcards.some((card: WritingVocabularyFlashCardView) => card.id === cardId)
            );
            internal.flowData.flashcardReview.currentIndex = 0;
            internal.flowData.flashcardReview.isCurrentCardFlipped = false;
            internal.flowData.flashcardReview.pendingReview.cardId = null;
            internal.flowData.flashcardReview.pendingReview.rating = null;
            return { ok: true };
        },
        onOutput: () => "displayReview",
    },

    rateFlashcard: {
        input: (_domain, internal, events) => ({
            session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
            cardId: internal.flowData.flashcardReview.pendingReview.cardId,
            rating: internal.flowData.flashcardReview.pendingReview.rating,
        }),
        render: {
            mode: "preserve-previous",
        },
        action: async ({ session, cardId, rating }, _domain, internal, events) => {
            if (!session?.sessionId || !cardId || !rating) {
                return { ok: false };
            }

            internal.flowData.ui.isRatingFlashcard = true;
            internal.flowData.ui.error = null;
            let reviewSaved = false;

            try {
                reviewSaved = await reviewWritingFlashcardAction(cardId, rating);
                if (!reviewSaved) {
                    throw new Error("Flashcard review was not accepted");
                }

                const nextRatedIds = internal.flowData.flashcardReview.ratedCardIds.includes(cardId)
                    ? internal.flowData.flashcardReview.ratedCardIds
                    : [...internal.flowData.flashcardReview.ratedCardIds, cardId];
                internal.flowData.flashcardReview.ratedCardIds = nextRatedIds;
                events?.writingReviewedCardIds.emit(nextRatedIds);

                if (rating === Rating.GOOD || rating === Rating.EASY) {
                    const detached = await detachWritingFlashcardAction(session.sessionId, cardId);
                    if (!detached) {
                        throw new Error("Flashcard was reviewed but could not be detached from the writing session");
                    }

                    const updatedSession = {
                        ...session,
                        vocabFlashcards: session.vocabFlashcards.filter((card: WritingVocabularyFlashCardView) => card.id !== cardId),
                    };
                    events?.currentWritingSession.emit(updatedSession);
                    internal.flowData.ui.infoMessage = "Card reviewed and removed from this writing session.";
                }
            } catch (error) {
                internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to rate flashcard";
            } finally {
                const remainingCardsCount = getRemainingCards(
                    ((events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? session),
                    internal.flowData.flashcardReview.ratedCardIds
                ).length;
                internal.flowData.flashcardReview.currentIndex = remainingCardsCount > 0
                    ? Math.min(internal.flowData.flashcardReview.currentIndex, remainingCardsCount - 1)
                    : 0;
                internal.flowData.flashcardReview.isCurrentCardFlipped = false;
                internal.flowData.flashcardReview.pendingReview.cardId = null;
                internal.flowData.flashcardReview.pendingReview.rating = null;
                internal.flowData.ui.isRatingFlashcard = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayReview",
    },
}, {
    start: "displayReview",
    channelTransitions: {
        currentWritingSession: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "detail") {
                return "syncReview";
            }
            return "displayReview";
        },
        screenMode: ({ events }) => {
            const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
            if (mode === "detail") {
                return "syncReview";
            }
            return "displayReview";
        },
    },
    createInternalData: createWritingReviewInternalData,
});
