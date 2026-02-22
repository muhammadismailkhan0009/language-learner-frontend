import { defineFlow } from "@myriadcodelabs/uiflow";
import { DeckView } from "@/lib/types/responses/DeckView";
import fetchRevisionDecksAction from "../_server_actions/fetchRevisionDecksAction";
import ListenFlashcardsView, { ListenFlashcardsViewOutput } from "../_client_components/ListenFlashcardsView";
import { AudioSpeed } from "@/lib/ttsGoogle";

type ListenFlashcardsDomainData = Record<string, never>;

type ListenFlashcardsInternalData = {
    flowData: {
        decks: DeckView[];
        selectedDeckId: string | null;
        isListening: boolean;
        audioSpeed: AudioSpeed;
        ui: {
            isLoading: boolean;
            error: string | null;
            notice: string | null;
        };
    };
};

function createInternalData(): ListenFlashcardsInternalData {
    return {
        flowData: {
            decks: [],
            selectedDeckId: null,
            isListening: false,
            audioSpeed: "normal",
            ui: {
                isLoading: false,
                error: null,
                notice: null,
            },
        },
    };
}

export const listenFlashcardsFlow = defineFlow<ListenFlashcardsDomainData, ListenFlashcardsInternalData>(
    {
        loadDecks: {
            input: () => ({}),
            action: async (_input, _domain, internal) => {
                internal.flowData.ui.isLoading = true;
                internal.flowData.ui.error = null;

                try {
                    const decks = (await fetchRevisionDecksAction()) ?? [];
                    internal.flowData.decks = decks;
                    if (decks.length === 0) {
                        internal.flowData.selectedDeckId = null;
                    } else if (!internal.flowData.selectedDeckId) {
                        internal.flowData.selectedDeckId = decks[0].id;
                    } else if (!decks.some((deck) => deck.id === internal.flowData.selectedDeckId)) {
                        internal.flowData.selectedDeckId = decks[0].id;
                    }
                } catch (error) {
                    internal.flowData.ui.error = error instanceof Error ? error.message : "Failed to load decks";
                } finally {
                    internal.flowData.ui.isLoading = false;
                }

                return { ok: true };
            },
            onOutput: () => "showDecks",
        },

        showDecks: {
            input: (_domain, internal) => ({
                decks: internal.flowData.decks,
                selectedDeckId: internal.flowData.selectedDeckId,
                isListening: internal.flowData.isListening,
                audioSpeed: internal.flowData.audioSpeed,
                isLoading: internal.flowData.ui.isLoading,
                error: internal.flowData.ui.error,
                notice: internal.flowData.ui.notice,
            }),
            view: ListenFlashcardsView,
            onOutput: (_domain, internal, output: ListenFlashcardsViewOutput) => {
                if (output.type === "reload") {
                    return "loadDecks";
                }

                if (output.type === "selectDeck") {
                    internal.flowData.selectedDeckId = output.deckId;
                    internal.flowData.ui.notice = null;
                    return "showDecks";
                }

                if (output.type === "setAudioSpeed") {
                    internal.flowData.audioSpeed = output.speed;
                    return "showDecks";
                }

                if (output.type === "startListening") {
                    internal.flowData.selectedDeckId = output.deckId;
                    internal.flowData.isListening = true;
                    internal.flowData.ui.notice = null;
                    return "showDecks";
                }

                if (output.type === "stopListening") {
                    if (!output.deckId || output.deckId === internal.flowData.selectedDeckId) {
                        internal.flowData.isListening = false;
                    } else {
                        internal.flowData.selectedDeckId = output.deckId;
                        internal.flowData.isListening = true;
                    }
                    return "showDecks";
                }

                if (output.type === "noCards") {
                    internal.flowData.isListening = false;
                    internal.flowData.ui.notice = "No more cards to review for this deck.";
                    return "showDecks";
                }
            },
        },
    },
    {
        start: "loadDecks",
        createInternalData,
    }
);
