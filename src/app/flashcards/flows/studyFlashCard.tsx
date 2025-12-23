import { defineFlow } from "@/lib/custom_lib_ui/flow";
import fetchFlashCardsListAction from "../_server_actions/fetchFlashCardsListAction";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import FlashCardView from "../_client_components/FlashCardView";
import FlashCardActions, { ShowCardOutput } from "../_client_components/FlashCardActions";
import { Rating } from "@/lib/types/Rating";
import { reviewStudiedCard } from "@/lib/clientbackendApiCalls";
import NoCardUI from "../_client_components/NoCardUI";


interface StudyFlashCardData {
    deckId: string
    flowData: FlowDataHolder
}

interface FlowDataHolder {
    cards: FlashCard[];
    cardData: Map<string, CardData>;
    activeCardId: string | null; // Track which card is currently being acted upon
}

interface CardData {
    flipped: boolean;
    rating: Rating | null;
}
export const studyFlashCard = defineFlow<StudyFlashCardData>({


    fetchCardsData: {
        input: (data) => ({ deckId: data.deckId }),
        action: async ({ deckId }, data) => {
            const cards = await fetchFlashCardsListAction(deckId);
            console.log(cards);
            if (cards && cards.length > 0) {
                data.flowData.cards = cards;
                data.flowData.cardData = new Map();
                data.flowData.activeCardId = null;
                // Initialize card data for all cards
                cards.forEach(card => {
                    data.flowData.cardData.set(card.id, {
                        flipped: false,
                        rating: null
                    });
                });
            } else {
                data.flowData.cards = [];
                data.flowData.cardData = new Map();
                data.flowData.activeCardId = null;
            }
            return { ok: true }
        },
        onOutput: () => "decideCardState"
    },

    decideCardState: {
        input: (data) => ({ 
            hasCards: data.flowData.cards.length > 0
        }),
        action: ({ hasCards }) => hasCards,
        onOutput: (_, exists) => {
            return exists ? "studyCard" : "noCard"
        }
    },

    noCard: {
        input: (data) => ({ card: null }),
        view: NoCardUI,
        onOutput: () => { }
    },

    studyCard: {
        input: (data) => {
            // Prepare cards with their states for display
            const cardsWithState = data.flowData.cards.map(card => {
                const cardData = data.flowData.cardData.get(card.id) || { flipped: false, rating: null };
                // Disable "Show Answer" buttons for other cards when:
                // 1. A card is flipped (activeCardId is set and it's not this card)
                // 2. Any card has an activeCardId set (being rated)
                const isShowAnswerDisabled = data.flowData.activeCardId !== null && data.flowData.activeCardId !== card.id;
                return {
                    card,
                    flipped: cardData.flipped,
                    disabled: isShowAnswerDisabled
                };
            });
            return {
                cards: cardsWithState
            };
        },
        view: FlashCardView,
        onOutput: (data, output: ShowCardOutput, events) => {
            const cardId = output.cardId;
            const cardData = data.flowData.cardData.get(cardId) || { flipped: false, rating: null };

            if (output.action === "flip") {
                // Set active card to disable other "Show Answer" buttons
                // Keep activeCardId set until the card is rated and we fetch next batch
                data.flowData.activeCardId = cardId;
                cardData.flipped = true;
                data.flowData.cardData.set(cardId, cardData);
                return "studyCard";
            }

            if (output.action === "rate") {
                // Keep activeCardId set (it should already be set from flip, but ensure it's set)
                data.flowData.activeCardId = cardId;
                cardData.rating = output.rating;
                data.flowData.cardData.set(cardId, cardData);
                return "reviewCard";
            }
            if (output.action === "next") {
                // For revision cards, just mark as studied and fetch next batch
                events!.studiedCounter.emit((c: number) => c + 1);
                // Clear activeCardId before fetching next batch
                data.flowData.activeCardId = null;
                return "fetchCardsData";
            }
        }
    },

    reviewCard: {
        input: (data) => {
            const cardId = data.flowData.activeCardId!;
            const cardData = data.flowData.cardData.get(cardId) || { flipped: false, rating: null };
            return { 
                deckId: data.deckId, 
                cardId: cardId, 
                rating: cardData.rating 
            };
        },
        action: async ({ deckId, cardId, rating }, data) => {
            await reviewStudiedCard(deckId, cardId, rating);
            return { ok: true }
        },
        onOutput: (data, _, events) => {
            events!.studiedCounter.emit((c: number) => c + 1);
            // Clear active card and fetch next batch
            data.flowData.activeCardId = null;
            return "fetchCardsData";
        }
    },



}, { start: "fetchCardsData" });