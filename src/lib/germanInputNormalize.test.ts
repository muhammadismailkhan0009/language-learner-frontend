import { describe, expect, it } from "vitest";
import { normalizeGermanTransliteration } from "./germanInputNormalize";

describe("normalizeGermanTransliteration", () => {
    it("converts German letter transliterations", () => {
        expect(normalizeGermanTransliteration("Fuesse, Baeren, Oel"))
            .toBe("Füße, Bären, Öl");
    });

    it("preserves supported uppercase transliterations", () => {
        expect(normalizeGermanTransliteration("A_e O_e U_e SS"))
            .toBe("Ä Ö Ü ẞ");
    });
});
