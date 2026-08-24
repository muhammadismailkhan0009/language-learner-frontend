import { ClozeAnswers, ClozeResults, ReadingParagraphClozeSession } from "./contracts";

export function normalizeClozeAnswer(value: string): string {
    return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function evaluateClozeAnswers(session: ReadingParagraphClozeSession, answers: ClozeAnswers) {
    const results: ClozeResults = {};
    for (const paragraph of session.paragraphs) {
        for (const blank of paragraph.blanks) {
            const actual = normalizeClozeAnswer(answers[blank.blankId] ?? "");
            const expected = normalizeClozeAnswer(blank.exactAnswer);
            results[blank.blankId] = actual === expected || actual === germanKeyboardForm(expected);
        }
    }
    const values = Object.values(results);
    return { results, allCorrect: values.length > 0 && values.every(Boolean) };
}

function germanKeyboardForm(value: string): string {
    return value.replaceAll("Ä", "Ae").replaceAll("Ö", "Oe").replaceAll("Ü", "Ue")
        .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue")
        .replaceAll("ẞ", "SS").replaceAll("ß", "ss");
}

export function allBlanksAnswered(session: ReadingParagraphClozeSession, answers: ClozeAnswers): boolean {
    return session.paragraphs.flatMap((paragraph) => paragraph.blanks)
        .every((blank) => (answers[blank.blankId] ?? "").trim().length > 0);
}
