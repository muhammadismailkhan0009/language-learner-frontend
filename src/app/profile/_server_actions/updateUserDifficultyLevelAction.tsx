'use server'

import { updateUserDifficultyLevel } from "@/lib/serverBackedApiCalls";
import { UpdateUserDifficultyLevelRequest } from "@/lib/types/requests/UpdateUserDifficultyLevelRequest";
import { UserProfileResponse } from "@/lib/types/responses/UserProfileResponse";

export default async function updateUserDifficultyLevelAction(
    requestBody: UpdateUserDifficultyLevelRequest
): Promise<UserProfileResponse | null> {
    const response = await updateUserDifficultyLevel(requestBody);

    if (response.status === 200) {
        return response.data.response;
    }

    return null;
}
