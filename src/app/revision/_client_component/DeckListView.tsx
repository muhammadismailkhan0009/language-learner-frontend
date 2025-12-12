'use client'
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function DeckListView({ input , output }) {

    const { mode, decks } = input;

    return (
        <div className="">
            <main className="">
                <h1 className="">Decks ({mode})</h1>
                <Table>
                    <TableBody>
                        {decks.map((deck) => (
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