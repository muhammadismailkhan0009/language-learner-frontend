export default async function FlashCards({ searchParams }: { searchParams: { deckId?: string } }) {

    const deckId = searchParams.deckId;

    return (
        <h1>seems to be working fine</h1>
    )
}