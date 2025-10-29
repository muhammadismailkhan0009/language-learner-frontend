import {Header} from "@/components/common/app-header";
import { FlashcardStudyView } from "./_client_components/FlashCardStudyView";

export default async function FlashCards({searchParams}: { searchParams: { deckId: string } }) {

    const params = await searchParams;
    const deckId = params.deckId;

    return (
        <div>

            <FlashcardStudyView deckId={deckId}></FlashcardStudyView>
        </div>
    )
}