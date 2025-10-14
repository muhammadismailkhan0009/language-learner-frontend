import { Header } from "@/components/common/app-header";
import {fetchDecksList, fetchFlashCardsData} from "@/lib/backendApiCalls";
import { FlashCardMode } from "@/lib/types/requests/FlashCardMode"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import OpenFlashCardsButton from "./_client_components/OpenFlashCards";

export default async function DecksPage() {
    const mode = FlashCardMode.FRESH;
    const decks = await fetchDecksList(mode);

    return (
        <div className="">
            <Header></Header>
            <main className="">
                <h1 className="">Decks ({mode})</h1>
                <Table>
                    <TableBody>
                        {decks.data.response.map((deck) => (
                            <TableRow key={deck.id}>
                                <TableCell>{deck.name}</TableCell>
                                <TableCell>{deck.totalCards} cards</TableCell>
                                <TableCell>
                                    <OpenFlashCardsButton deckId ={deck.id}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </main>
        </div>
    );
}