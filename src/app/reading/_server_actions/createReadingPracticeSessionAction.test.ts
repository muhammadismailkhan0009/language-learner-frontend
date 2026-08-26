import { beforeEach, describe, expect, it, vi } from "vitest";

const createReadingPracticeSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/serverBackedApiCalls", () => ({ createReadingPracticeSession }));

import createReadingPracticeSessionAction from "./createReadingPracticeSessionAction";

describe("create reading practice session action", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns the MCP instruction from an accepted request", async () => {
        createReadingPracticeSession.mockResolvedValue({
            status: 202,
            data: { response: { message: "Reading exercise generation requested. Run your MCP tool." } },
        });

        await expect(createReadingPracticeSessionAction()).resolves.toBe(
            "Reading exercise generation requested. Run your MCP tool."
        );
    });

    it("rejects an unexpected response", async () => {
        createReadingPracticeSession.mockResolvedValue({ status: 200, data: {} });

        await expect(createReadingPracticeSessionAction()).rejects.toThrow(
            "Failed to request reading exercise generation"
        );
    });
});
