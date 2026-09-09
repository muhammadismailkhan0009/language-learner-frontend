import { describe, expect, it } from "vitest";
import { normalizeGermanTransliteration } from "./germanInputNormalize";

describe("normalizeGermanTransliteration", () => {
    it("converts German letter transliterations", () => {
        expect(normalizeGermanTransliteration("Fuesse, Baeren, Oel", "Füße, Bären, Öl"))
            .toBe("Füße, Bären, Öl");
    });

    it("preserves supported uppercase transliterations", () => {
        expect(normalizeGermanTransliteration("A_e O_e U_e SS", "Ä Ö Ü ẞ"))
            .toBe("Ä Ö Ü ẞ");
    });

    it("only converts letters required by the expected answer", () => {
        expect(normalizeGermanTransliteration("muessen", "müssen")).toBe("müssen");
        expect(normalizeGermanTransliteration("class", "class")).toBe("class");
        expect(normalizeGermanTransliteration("house", "house")).toBe("house");
    });
});
