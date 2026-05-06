type SearchableVocabularyRow = {
    surface: string;
    translation: string;
};

function normalizeSearchText(value: string): string {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeGermanEquivalents(value: string): string {
    return value
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss");
}

export function filterVocabularyRows<T extends SearchableVocabularyRow>(rows: T[], query: string): T[] {
    const normalizedQuery = normalizeGermanEquivalents(normalizeSearchText(query));
    if (!normalizedQuery) {
        return rows;
    }

    return rows.filter((row) => {
        const normalizedSurface = normalizeGermanEquivalents(normalizeSearchText(row.surface));
        const normalizedTranslation = normalizeGermanEquivalents(normalizeSearchText(row.translation));

        return normalizedSurface.includes(normalizedQuery) || normalizedTranslation.includes(normalizedQuery);
    });
}
