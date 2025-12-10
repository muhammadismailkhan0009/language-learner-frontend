"use server";

import { registerUser } from "@/lib/serverBackedApiCalls";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerUserAction(email: string, password: string) {
    

    console.log(email);
    const response = await registerUser(email, password);
    if (response.status === 200) {
        const cookieStore = await cookies()

        console.log("id:"+response.data.response.id)
        cookieStore.set({
            name: 'userId',
            value: response.data.response.id,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 5,
        })
        console.log('redirect');
        redirect("/decks")
    }


}
