import { defineFlow } from "@myriadcodelabs/uiflow";
import ReadingParagraphClozeView, { ReadingParagraphClozeViewOutput } from "../_client_components/ReadingParagraphClozeView";
import { ReadingParagraphClozeSessionResponse } from "@/lib/types/responses/ReadingParagraphClozeSessionResponse";
import createReadingParagraphClozeSessionAction from "../_server_actions/createReadingParagraphClozeSessionAction";
import getActiveReadingParagraphClozeSessionAction from "../_server_actions/getActiveReadingParagraphClozeSessionAction";
import rateReadingParagraphClozeCardAction from "../_server_actions/rateReadingParagraphClozeCardAction";
import { Rating } from "@/lib/types/Rating";

type Domain = Record<string, never>;

type Internal = {
    session: ReadingParagraphClozeSessionResponse | null;
    limit: number;
    currentCardIndex: number;
    isCardFlipped: boolean;
    isLoading: boolean;
    isCreating: boolean;
    isRating: boolean;
    error: string | null;
    pendingRating: { flashcardId: string | null; rating: Rating | null };
};

function createInternalData(): Internal {
    return {
        session: null,
        limit: 50,
        currentCardIndex: 0,
        isCardFlipped: false,
        isLoading: false,
        isCreating: false,
        isRating: false,
        error: null,
        pendingRating: { flashcardId: null, rating: null },
    };
}

export const readingParagraphClozeFlow = defineFlow<Domain, Internal>({
    loadActive: {
        input: () => ({}),
        action: async (_input, _domain, internal) => {
            internal.isLoading = true;
            internal.error = null;
            try {
                internal.session = await getActiveReadingParagraphClozeSessionAction();
                internal.currentCardIndex = 0;
                internal.isCardFlipped = false;
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to load active session";
            } finally {
                internal.isLoading = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },

    createSession: {
        input: (_domain, internal) => ({ limit: internal.limit }),
        render: { mode: "preserve-previous" },
        action: async ({ limit }, _domain, internal) => {
            internal.isCreating = true;
            internal.error = null;
            try {
                internal.session = await createReadingParagraphClozeSessionAction(limit);
                internal.currentCardIndex = 0;
                internal.isCardFlipped = false;
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to create session";
            } finally {
                internal.isCreating = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },

    rateCard: {
        input: (_domain, internal) => ({
            sessionId: internal.session?.sessionId ?? null,
            flashcardId: internal.pendingRating.flashcardId,
            rating: internal.pendingRating.rating,
        }),
        render: { mode: "preserve-previous" },
        action: async ({ sessionId, flashcardId, rating }, _domain, internal) => {
            if (!sessionId || !flashcardId || !rating) {
                return { ok: false };
            }

            internal.isRating = true;
            internal.error = null;
            try {
                const updated = await rateReadingParagraphClozeCardAction(sessionId, flashcardId, rating);
                if (updated) {
                    internal.session = updated;
                }
                internal.isCardFlipped = false;
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to rate card";
            } finally {
                internal.pendingRating.flashcardId = null;
                internal.pendingRating.rating = null;
                internal.isRating = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },

    show: {
        input: (_domain, internal) => {
            const cards = internal.session?.cards ?? [];
            const normalizedIndex = cards.length === 0 ? 0 : Math.min(internal.currentCardIndex, cards.length - 1);
            const currentCard = cards[normalizedIndex] ?? null;
            return {
                session: internal.session,
                limit: internal.limit,
                currentCard,
                currentCardIndex: normalizedIndex,
                isCardFlipped: internal.isCardFlipped,
                isLoading: internal.isLoading,
                isCreating: internal.isCreating,
                isRating: internal.isRating,
                error: internal.error,
            };
        },
        view: ReadingParagraphClozeView,
        onOutput: (_domain, internal, output: ReadingParagraphClozeViewOutput) => {
            if (output.type === "refresh") {
                return "loadActive";
            }

            if (output.type === "updateLimit") {
                internal.limit = Math.max(1, Math.min(300, output.limit));
                return "show";
            }

            if (output.type === "createSession") {
                return "createSession";
            }

            if (output.type === "flipCard") {
                internal.isCardFlipped = true;
                return "show";
            }

            if (output.type === "nextCard") {
                const total = internal.session?.cards.length ?? 0;
                if (total > 0) {
                    internal.currentCardIndex = internal.currentCardIndex >= total - 1 ? 0 : internal.currentCardIndex + 1;
                    internal.isCardFlipped = false;
                }
                return "show";
            }

            if (output.type === "previousCard") {
                const total = internal.session?.cards.length ?? 0;
                if (total > 0) {
                    internal.currentCardIndex = internal.currentCardIndex <= 0 ? total - 1 : internal.currentCardIndex - 1;
                    internal.isCardFlipped = false;
                }
                return "show";
            }

            if (output.type === "rateCard") {
                internal.pendingRating.flashcardId = output.flashcardId;
                internal.pendingRating.rating = output.rating;
                return "rateCard";
            }

            if (output.type === "clearError") {
                internal.error = null;
                return "show";
            }
        },
    },
}, {
    start: "loadActive",
    createInternalData,
});
