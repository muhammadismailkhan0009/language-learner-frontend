'use client'
import { defineFlow } from "@myriadcodelabs/uiflow";
import { ExerciseMode } from "@/lib/types/requests/ExerciseMode";
import { FlashCard } from "@/lib/types/responses/FlashCard";
import AudioComprehensionCardView from "../_client_components/AudioComprehensionCardView";
import { AudioComprehensionOutput } from "../_client_components/AudioComprehensionActions";
import { Rating } from "@/lib/types/Rating";
import fetchNextAudioCardAction from "@/app/exercise/audio-comprehension/_server_actions/fetchNextAudioCardAction";
import reviewAudioCardAction from "@/app/exercise/audio-comprehension/_server_actions/reviewAudioCardAction";
import NoCardUI from "@/app/flashcards/_client_components/NoCardUI";

interface AudioComprehensionExercise {
    mode: ExerciseMode,
    flowData?: FlowData | null,
}

interface FlowData {
    exercise: FlashCard | null;
    flipped: boolean;
    showFrontText: boolean;
    rating: Rating | null;
}

export const exerciseAudioComprehension = defineFlow<AudioComprehensionExercise>({

    fetchCard: {
        input: (data, _internal) => ({ mode: data.mode }),
        action: async ({ mode }, data) => {
            // Fetch next audio card from server
            const card = await fetchNextAudioCardAction();
            
            data.flowData = {
                exercise: card,
                flipped: false,
                showFrontText: false,
                rating: null
            };
            
            return { ok: true };
        },
        onOutput: () => "decideCardState"
    },

    decideCardState: {
        input: (data, _internal) => ({
            hasCard: data.flowData?.exercise !== null && data.flowData?.exercise !== undefined
        }),
        action: ({ hasCard }) => hasCard,
        onOutput: (_domain, _internal, exists) => {
            return exists ? "displayExercise" : "noCard"
        }
    },

    noCard: {
        input: (_data, _internal) => ({ card: null }),
        view: NoCardUI,
        onOutput: () => { }
    },

    displayExercise: {
        input: (data, _internal) => {
            if (!data.flowData?.exercise) {
                // Fallback - should not happen if decideCardState works correctly
                return {
                    card: null as unknown as FlashCard,
                    flipped: false,
                    disabled: false,
                    showFrontText: false
                };
            }
            return {
                card: data.flowData.exercise,
                flipped: data.flowData.flipped,
                disabled: false,
                showFrontText: data.flowData.showFrontText
            };
        },
        view: AudioComprehensionCardView,
        onOutput: (data, _internal, output: AudioComprehensionOutput) => {
            if (!data.flowData) return;

            if (output.action === "flip") {
                // Show the answer
                data.flowData.flipped = true;
                return "displayExercise";
            }

            if (output.action === "showFront") {
                // Show the front text
                data.flowData.showFrontText = true;
                return "displayExercise";
            }

            if (output.action === "rate") {
                // Store rating and move to review step
                if (!data.flowData.exercise) return;
                data.flowData.rating = output.rating;
                return "reviewCard";
            }

            if (output.action === "next") {
                // Reset and get next card (for revision cards)
                data.flowData.flipped = false;
                data.flowData.showFrontText = false;
                return "fetchCard";
            }
        }
    },

    reviewCard: {
        input: (data, _internal) => {
            if (!data.flowData?.exercise || !data.flowData?.rating) {
                return {
                    cardId: "",
                    rating: Rating.AGAIN
                };
            }
            return {
                cardId: data.flowData.exercise.id,
                rating: data.flowData.rating
            };
        },
        action: async ({ cardId, rating }, data) => {
            // Submit rating to server
            await reviewAudioCardAction(cardId, rating);
            return { ok: true };
        },
        onOutput: (data, _internal) => {
            // Reset state and fetch next card
            data.flowData!.flipped = false;
            data.flowData!.showFrontText = false;
            data.flowData!.rating = null;
            return "fetchCard";
        }
    }

}, {
    start: "fetchCard"
});
