export function normalizeGermanTransliteration(input: string, expectedAnswer: string): string {
    if (!input) {
        return input;
    }

    const expected = expectedAnswer.toLocaleLowerCase("de-DE");
    let normalized = input;

    if (expected.includes("ä")) normalized = normalized.replaceAll("A_e", "Ä").replaceAll("a_e", "ä").replaceAll("Ae", "Ä").replaceAll("ae", "ä");
    if (expected.includes("ö")) normalized = normalized.replaceAll("O_e", "Ö").replaceAll("o_e", "ö").replaceAll("Oe", "Ö").replaceAll("oe", "ö");
    if (expected.includes("ü")) normalized = normalized.replaceAll("U_e", "Ü").replaceAll("u_e", "ü").replaceAll("Ue", "Ü").replaceAll("ue", "ü");
    if (expected.includes("ß")) normalized = normalized.replaceAll("SS", "ẞ").replaceAll("ss", "ß");

    return normalized;
}
