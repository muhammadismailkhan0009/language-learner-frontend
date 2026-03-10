type SearchableExampleSentence = {
    sentence: string;
    translation: string;
};

type SearchableVocabularyRow = {
    surface: string;
    translation: string;
    notes: string;
    exampleSentences: SearchableExampleSentence[];
};

function normalizeSearchText(value: string): string {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function filterVocabularyRows<T extends SearchableVocabularyRow>(rows: T[], query: string): T[] {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
        return rows;
    }

    return rows.filter((row) => {
        const haystack = normalizeSearchText([
            row.surface,
            row.translation,
            row.notes,
            ...row.exampleSentences.flatMap((exampleSentence) => [exampleSentence.sentence, exampleSentence.translation]),
        ].join(" "));

        return haystack.includes(normalizedQuery);
    });
}
