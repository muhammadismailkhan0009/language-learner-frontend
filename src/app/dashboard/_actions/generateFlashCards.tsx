"use server"

import { sendGenerateFlashCardsRequest } from "@/lib/clientbackendApiCalls";
import { redirect } from "next/navigation";

export async function generateFlashCards(formData: FormData) {

    const scenario = formData.get("scanerio") as string;
    const response = await sendGenerateFlashCardsRequest(scenario);

    if (response.status === 201) {
        redirect("/decks");
    }
    else {
        // FIXME: show error here when it appears.
    }


}