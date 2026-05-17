export function normalizeGermanTransliteration(input: string): string {
    if (!input) {
        return input;
    }

    return input
        .replaceAll("A_e", "Ä")
        .replaceAll("O_e", "Ö")
        .replaceAll("U_e", "Ü")
        .replaceAll("a_e", "ä")
        .replaceAll("o_e", "ö")
        .replaceAll("u_e", "ü")
        .replaceAll("Ae", "Ä")
        .replaceAll("Oe", "Ö")
        .replaceAll("Ue", "Ü")
        .replaceAll("ae", "ä")
        .replaceAll("oe", "ö")
        .replaceAll("ue", "ü")
        .replaceAll("SS", "ẞ")
        .replaceAll("ss", "ß");
}
