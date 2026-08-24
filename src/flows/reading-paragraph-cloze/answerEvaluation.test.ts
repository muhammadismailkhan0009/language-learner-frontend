import { describe, expect, it } from "vitest";
import { evaluateClozeAnswers, normalizeClozeAnswer } from "./answerEvaluation";
import { ReadingParagraphClozeSession } from "./contracts";

const session: ReadingParagraphClozeSession = { sessionId: "s1", learnerLevel: "A2", createdAt: "2026-01-01T00:00:00Z", paragraphs: [{
    paragraphId: "p1", paragraphIndex: 0, scenarioLabel: "Trip", clozeParagraph: "Sie {{b1}} mit {{b2}}.", blanks: [
        { blankId: "one", blankIndex: 0, blankToken: "{{b1}}", exactAnswer: "fährt", answerExplanation: "Verb form", practiceKind: "VOCABULARY_FORM", vocabularyDetails: null, grammarRuleDetails: [] },
        { blankId: "two", blankIndex: 1, blankToken: "{{b2}}", exactAnswer: "den Kindern", answerExplanation: "Case", practiceKind: "GRAMMAR", vocabularyDetails: null, grammarRuleDetails: [] },
    ],
}] };

describe("cloze answer evaluation", () => {
    it("normalizes Unicode, spacing, and German keyboard transliteration", () => {
        expect(normalizeClozeAnswer("  fährt   los ")).toBe("fährt los");
        expect(evaluateClozeAnswers(session, { one: "faehrt", two: "den Kindern" }).allCorrect).toBe(true);
    });
    it("checks every blank and requires all answers", () => {
        expect(evaluateClozeAnswers(session, { one: "fährt", two: "den Kindern" })).toEqual({ results: { one: true, two: true }, allCorrect: true });
        expect(evaluateClozeAnswers(session, { one: "Fährt", two: "den Kindern!" })).toEqual({ results: { one: false, two: false }, allCorrect: false });
    });
});
