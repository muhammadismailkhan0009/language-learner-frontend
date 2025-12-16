import { defineFlow } from "@/lib/custom_lib_ui/flow";
import fetchFlashCardAction from "../_server_actions/fetchFlashCardAction";
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
    card: FlashCard | null;
    flipped: boolean;
    rating: Rating | null;
}
export const studyFlashCard = defineFlow<StudyFlashCardData>({


    fetchCardData: {
        input: (data) => ({ deckId: data.deckId }),
        action: async ({ deckId }, data) => {
            const card = await fetchFlashCardAction(deckId);
            console.log(card);
            data.flowData.card = card;
            data.flowData.flipped = false;
            return { ok: true }
        },
        onOutput: () => "decideCardState"
    },

    decideCardState: {
        input: (data) => ({ card: data.flowData.card }),
        action: ({ card }) => !!card,
        onOutput: (_, exists) => {
            return exists ? "studyCard" : "noCard"
        }
    },

    noCard: {
        input: (data) => ({ card: data.flowData.card }),
        view: NoCardUI,
        onOutput: () => { }
    },

    studyCard: {
        input: (data) => ({
            card: data.flowData.card!,
            flipped: data.flowData.flipped
        }),
        view: FlashCardView,
        onOutput: (data, output: ShowCardOutput) => {
            if (output.action === "flip") {
                data.flowData.flipped = true;
                return "studyCard";
            }

            if (output.action === "rate") {
                data.flowData.rating = output.rating;
                return "reviewCard";
            }
            if (output.action === "next") {
                return "fetchCardData";
            }
        }
    },

    reviewCard: {
        input: (data) => ({ deckId: data.deckId, cardId: data.flowData.card?.id, rating: data.flowData.rating }),
        action: async ({ deckId, cardId, rating }, data) => {
            await reviewStudiedCard(deckId, cardId, rating);
            return { ok: true }
        },
        onOutput: (data, _, events) => {
            events!.studiedCounter.emit((c:number) => c + 1);
            return "fetchCardData";
        }
    },



}, { start: "fetchCardData" });