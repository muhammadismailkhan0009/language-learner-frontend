"use client";

import { FlowRunner } from "@/lib/custom_lib_ui/flow";
import { studyFlashCard } from "../flows/studyFlashCard";

type FlashCardStudyViewProps = {
    deckId: string;
}

export function FlashcardStudyView({ deckId }: FlashCardStudyViewProps) {
    


    // if (nextCard === null || !nextCard) {
    //     console.log("Next card not found");
    //     return (
    //         <div className="flex flex-col items-center gap-4">
    //             <p>All cards completed!</p>
    //             <Button onClick={() => redirect("decks")}>Back to Decks</Button>
    //         </div>
    //     );
    // }

    return (

        <div className="flex flex-col items-center gap-4">

            <FlowRunner
                flow={studyFlashCard}
                initialData={{
                    deckId: deckId,
                    flowData: {
                        card: null,
                        flipped: false,
                        rating: null
                    }
                }}
            />

            {/* <FlashCardView card={nextCard} flipped={flipped} />
            <FlashCardActions
                flipped={flipped}
                onFlipAction={() => setFlipped((f) => !f)}
                onNextAction={() => setFetchNext(true)}
                onReviewAction={handleReviewAction} /> */}
        </div>
    );
}

