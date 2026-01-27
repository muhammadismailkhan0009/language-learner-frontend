'use client'
import { defineFlow } from "@myriadcodelabs/uiflow";
import { FlashCardMode } from "@/lib/types/requests/FlashCardMode";
import DeckListView from "../_client_component/DeckListView";
import fetchRevisionListAction from "../_server_actions/fetchRevisionListAction";
import { DeckView } from "@/lib/types/responses/DeckView";

// Global data type for this flow
interface DeckListData {
    mode: FlashCardMode;
    decks: DeckView[] | null; // refine later
    selectedDeckId?: string;
}
export const deckListFlow = defineFlow<DeckListData>({
    // --------------------------------------------------
    // STEP 1 — Load decks from server
    // --------------------------------------------------

    loadDecks: {
        input: (data) => ({ mode: data.mode }),
        action: async ({ mode }, data) => {
            const response = await fetchRevisionListAction(mode);
            data.decks = response;
            return { ok: true };
        },
        onOutput: () => "showDecks"
    },


    // --------------------------------------------------
    // STEP 2 — Show UI list of decks
    // --------------------------------------------------
    showDecks: {
        input: (data) => ({
            mode: data.mode,
            decks: data.decks
        }),
        view: DeckListView,
        onOutput: (data, { deckId }) => {
            data.selectedDeckId = deckId;
            return "navigateToStudy";
        }
    },




}, {
    start: "loadDecks"
});