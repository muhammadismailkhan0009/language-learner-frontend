'use client'
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FlashCardMode } from "@/lib/types/requests/FlashCardMode";
import { DeckView } from "@/lib/types/responses/DeckView";


type DeckInfoData = {
    input: {
        mode: FlashCardMode,
        decks: DeckView[]
    }
}
export default function DeckListView(props: DeckInfoData) {


    return (
        <div className="">
            <main className="">
                <h1 className="">Decks ({props.input.mode})</h1>
                <Table>
                    <TableBody>
                        {props.input.decks.map((deck) => (
                            <TableRow key={deck.id}>
                                <TableCell>{deck.name}</TableCell>
                                <TableCell>
                                    <Button asChild>
                                        <a href={`/flashcards?deckId=${deck.id}`}>
                                            Study
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </main>
        </div>
    );
}