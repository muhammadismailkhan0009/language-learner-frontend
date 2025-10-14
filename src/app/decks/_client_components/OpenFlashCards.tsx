"use client"

import { Button } from "@/components/ui/button"
import { redirect, useRouter } from "next/navigation"

export default function OpenFlashCardsButton({ deckId }: Readonly<{ deckId: string }>) {
    const router = useRouter();

    return (
        // FIXME: for now, keep param-based approach. later convert it to path variable approach when become master of code
        <Button onClick={() => router.push(`/flashcards?deckId=${deckId}`)}>
            Study
        </Button>
    )
}