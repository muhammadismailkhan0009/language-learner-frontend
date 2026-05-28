import { defineFlow } from "@myriadcodelabs/uiflow";
import { Rating } from "@/lib/types/Rating";
import { WritingPracticeSessionResponse } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { WritingVocabularyFlashCardView } from "@/lib/types/responses/WritingVocabularyFlashCardView";
import detachWritingFlashcardAction from "../_server_actions/detachWritingFlashcardAction";
import reviewWritingFlashcardAction from "../_server_actions/reviewWritingFlashcardAction";
import WritingReviewFlowView, { WritingReviewFlowViewOutput } from "../_client_components/WritingReviewFlowView";
import { WritingScreenMode } from "../types";

type DomainData = {};

type InternalData = {
  currentIndex: number;
  flipped: boolean;
  ratedCardIds: string[];
  pending: {
    cardId: string | null;
    rating: Rating | null;
  };
  ui: {
    rating: boolean;
    error: string | null;
    info: string | null;
  };
};

function createInternalData(): InternalData {
  return {
    currentIndex: 0,
    flipped: false,
    ratedCardIds: [],
    pending: {
      cardId: null,
      rating: null,
    },
    ui: {
      rating: false,
      error: null,
      info: null,
    },
  };
}

function getRemainingCards(session: WritingPracticeSessionResponse | null, ratedIds: string[]) {
  return session?.vocabFlashcards.filter((card) => !ratedIds.includes(card.id)) ?? [];
}

function resetReviewState(internal: InternalData) {
  internal.currentIndex = 0;
  internal.flipped = false;
  internal.ratedCardIds = [];
  internal.pending.cardId = null;
  internal.pending.rating = null;
}

export const writingReviewFlow = defineFlow<DomainData, InternalData>(
  {
    review: {
      input: (_domain, internal, events) => ({
        mode: (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list",
        session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
        flashcardReview: {
          currentIndex: internal.currentIndex,
          isCurrentCardFlipped: internal.flipped,
          ratedCardIds: internal.ratedCardIds,
        },
        isRatingFlashcard: internal.ui.rating,
        error: internal.ui.error,
        infoMessage: internal.ui.info,
      }),
      view: WritingReviewFlowView,
      onOutput: (_domain, internal, output: WritingReviewFlowViewOutput, events) => {
        const session = (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null;
        if (!session?.submittedAnswer?.trim()) {
          return "review";
        }

        if (output.type === "clearError") {
          internal.ui.error = null;
          return "review";
        }

        if (output.type === "clearInfo") {
          internal.ui.info = null;
          return "review";
        }

        if (output.type === "flipFlashcard") {
          internal.flipped = true;
          return "review";
        }

        if (output.type === "nextFlashcard") {
          const count = getRemainingCards(session, internal.ratedCardIds).length;
          if (count <= 0) {
            return "review";
          }

          internal.currentIndex = internal.currentIndex >= count - 1 ? 0 : internal.currentIndex + 1;
          internal.flipped = false;
          return "review";
        }

        if (output.type === "previousFlashcard") {
          internal.currentIndex = Math.max(0, internal.currentIndex - 1);
          internal.flipped = false;
          return "review";
        }

        if (output.type === "resetFlashcards") {
          internal.currentIndex = 0;
          internal.flipped = false;
          internal.pending.cardId = null;
          internal.pending.rating = null;
          events?.writingReviewedCardIds.emit([]);
          return "review";
        }

        if (output.type === "rateFlashcard") {
          const card = getRemainingCards(session, internal.ratedCardIds)[internal.currentIndex];
          if (!card) {
            return "review";
          }

          internal.flipped = false;
          internal.pending.cardId = card.id;
          internal.pending.rating = output.rating;
          return "rate";
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
          resetReviewState(internal);
          events?.writingReviewedCardIds.emit([]);
          return { ok: true };
        }

        const reviewed = (events?.writingReviewedCardIds?.get() as string[] | undefined) ?? [];
        internal.ratedCardIds = reviewed.filter((id) => session.vocabFlashcards.some((card: WritingVocabularyFlashCardView) => card.id === id));
        internal.currentIndex = 0;
        internal.flipped = false;
        internal.pending.cardId = null;
        internal.pending.rating = null;
        return { ok: true };
      },
      onOutput: () => "review",
    },

    rate: {
      input: (_domain, internal, events) => ({
        session: (events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? null,
        cardId: internal.pending.cardId,
        rating: internal.pending.rating,
      }),
      render: { mode: "preserve-previous" },
      action: async ({ session, cardId, rating }, _domain, internal, events) => {
        if (!session?.sessionId || !cardId || !rating) {
          return { ok: false };
        }

        internal.ui.rating = true;
        internal.ui.error = null;

        try {
          const reviewed = await reviewWritingFlashcardAction(cardId, rating);
          if (!reviewed) {
            throw new Error("Flashcard review was not accepted");
          }

          const nextRatedIds = internal.ratedCardIds.includes(cardId) ? internal.ratedCardIds : [...internal.ratedCardIds, cardId];
          internal.ratedCardIds = nextRatedIds;
          events?.writingReviewedCardIds.emit(nextRatedIds);

          if (rating === Rating.GOOD || rating === Rating.EASY) {
            const detached = await detachWritingFlashcardAction(session.sessionId, cardId);
            if (!detached) {
              throw new Error("Flashcard was reviewed but could not be detached from the writing session");
            }

            events?.currentWritingSession.emit({
              ...session,
              vocabFlashcards: session.vocabFlashcards.filter((card: WritingVocabularyFlashCardView) => card.id !== cardId),
            });

            internal.ui.info = "Card reviewed and removed from this writing session.";
          }
        } catch (error) {
          internal.ui.error = error instanceof Error ? error.message : "Failed to rate flashcard";
        } finally {
          const currentSession = ((events?.currentWritingSession?.get() as WritingPracticeSessionResponse | null | undefined) ?? session);
          const remainingCount = getRemainingCards(currentSession, internal.ratedCardIds).length;

          internal.currentIndex = remainingCount > 0 ? Math.min(internal.currentIndex, remainingCount - 1) : 0;
          internal.flipped = false;
          internal.pending.cardId = null;
          internal.pending.rating = null;
          internal.ui.rating = false;
        }

        return { ok: true };
      },
      onOutput: () => "review",
    },
  },
  {
    start: "review",
    channelTransitions: {
      currentWritingSession: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "detail") {
          return "syncReview";
        }
        return "review";
      },
      screenMode: ({ events }) => {
        const mode = (events?.screenMode?.get() as WritingScreenMode | undefined) ?? "list";
        if (mode === "detail") {
          return "syncReview";
        }
        return "review";
      },
    },
    createInternalData,
  }
);
