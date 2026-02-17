import { defineFlow } from "@myriadcodelabs/uiflow";
import fetchFlashCardsListAction from "../_server_actions/fetchFlashCardsListAction";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import FlashCardView from "../_client_components/FlashCardView";
import { ShowCardOutput } from "../_client_components/FlashCardActions";
import { Rating } from "@/lib/types/Rating";
import { reviewStudiedCard } from "@/lib/clientbackendApiCalls";
import NoCardUI from "../_client_components/NoCardUI";


interface StudyFlashCardData {
    deckId: string
    flowData: FlowDataHolder
}

// Co-located: card and its state together
interface CardWithState {
    card: FlashCard;
    flipped: boolean;
    rating: Rating | null;
}

interface FlowDataHolder {
    // Co-located state: cards with their metadata together
    cards: CardWithState[];
    // Track which card is currently being acted upon
    activeCardId: string | null;
}

// Helper operations for card state management
const CardOps = {
    // Get card state by ID
    getCard: (data: FlowDataHolder, cardId: string): CardWithState | undefined => {
        return data.cards.find(c => c.card.id === cardId);
    },

    // Get active card
    getActiveCard: (data: FlowDataHolder): CardWithState | undefined => {
        if (!data.activeCardId) return undefined;
        return CardOps.getCard(data, data.activeCardId);
    },

    // Set card flipped state
    setFlipped: (data: FlowDataHolder, cardId: string, flipped: boolean): void => {
        const cardWithState = CardOps.getCard(data, cardId);
        if (cardWithState) {
            cardWithState.flipped = flipped;
        }
    },

    // Set card rating
    setRating: (data: FlowDataHolder, cardId: string, rating: Rating): void => {
        const cardWithState = CardOps.getCard(data, cardId);
        if (cardWithState) {
            cardWithState.rating = rating;
        }
    },

    // Initialize cards from FlashCard array
    initializeCards: (cards: FlashCard[]): CardWithState[] => {
        return cards.map(card => ({
            card,
            flipped: false,
            rating: null
        }));
    },

    // Get cards ready for display (with disabled state)
    getCardsForDisplay: (data: FlowDataHolder) => {
        return data.cards.map(cardWithState => ({
            card: cardWithState.card,
            flipped: cardWithState.flipped,
            disabled: data.activeCardId !== null && data.activeCardId !== cardWithState.card.id
        }));
    }
};
export const studyFlashCard = defineFlow<StudyFlashCardData>({


    fetchCardsData: {
        input: (data, _internal) => ({ deckId: data.deckId }),
        action: async ({ deckId }, data) => {
            const cards = await fetchFlashCardsListAction(deckId);
            console.log(cards);
            // Initialize completely with defaults
            data.flowData.cards = cards && cards.length > 0
                ? CardOps.initializeCards(cards)
                : [];
            data.flowData.activeCardId = null;
            return { ok: true }
        },
        onOutput: () => "decideCardState"
    },

    decideCardState: {
        input: (data, _internal) => ({
            hasCards: data.flowData.cards.length > 0
        }),
        action: ({ hasCards }) => hasCards,
        onOutput: (_domain, _internal, exists) => {
            return exists ? "studyCard" : "noCard"
        }
    },

    noCard: {
        input: (_data, _internal) => ({ card: null }),
        view: NoCardUI,
        onOutput: () => { }
    },

    studyCard: {
        input: (data, _internal) => {
            // Use helper to get cards ready for display
            return {
                cards: CardOps.getCardsForDisplay(data.flowData)
            };
        },
        view: FlashCardView,
        onOutput: (data, _internal, output: ShowCardOutput, events) => {
            const cardId = output.cardId;

            if (output.action === "flip") {
                // Set active card to disable other "Show Answer" buttons
                data.flowData.activeCardId = cardId;
                CardOps.setFlipped(data.flowData, cardId, true);
                return "studyCard";
            }

            if (output.action === "rate") {
                // Set active card and rating
                data.flowData.activeCardId = cardId;
                CardOps.setRating(data.flowData, cardId, output.rating);
                return "reviewCard";
            }

            if (output.action === "next") {
                // For revision cards, just mark as studied and fetch next batch
                events!.studiedCounter.emit((c: number) => c + 1);
                data.flowData.activeCardId = null;
                return "fetchCardsData";
            }
        }
    },

    reviewCard: {
        input: (data, _internal) => {
            const activeCard = CardOps.getActiveCard(data.flowData);
            return {
                deckId: data.deckId,
                cardId: data.flowData.activeCardId!,
                rating: activeCard!.rating!
            };
        },
        action: async ({ deckId, cardId, rating }, data) => {
            reviewStudiedCard(deckId, cardId, rating);
            return { ok: true }
        },
        onOutput: (data, _internal, _, events) => {
            events!.studiedCounter.emit((c: number) => c + 1);
            data.flowData.activeCardId = null;
            return "fetchCardsData";
        }
    },



}, { start: "fetchCardsData" });
