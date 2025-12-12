'use client'
import { FlowRunner } from "@/lib/custom_lib_ui/flow";
import { FlashCardMode } from "@/lib/types/requests/FlashCardMode";
import { deckListFlow } from "./flows/deckListFlow";

export default function DecksPage() {
    return (
        <FlowRunner
            flow={deckListFlow}
            initialData={{
                mode: FlashCardMode.REVISION,
                decks: []
            }}
        />
    );
}
