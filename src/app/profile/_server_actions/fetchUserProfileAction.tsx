'use server'

import { fetchUserProfile } from "@/lib/serverBackedApiCalls";
import { UserProfileResponse } from "@/lib/types/responses/UserProfileResponse";

export default async function fetchUserProfileAction(): Promise<UserProfileResponse | null> {
    const response = await fetchUserProfile();

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
