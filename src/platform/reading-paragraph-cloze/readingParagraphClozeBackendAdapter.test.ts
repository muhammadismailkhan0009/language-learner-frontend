import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), remove: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "u1" }) }) }));
vi.mock("@/lib/apiClient", () => ({ api: { get: mocks.get, post: mocks.post, delete: mocks.remove } }));

import { createClozeSession, deleteClozeSession, getClozeSession, listClozeSessions } from "./readingParagraphClozeBackendAdapter";

const session = { sessionId: "s1", learnerLevel: "A2", createdAt: "2026-01-01T00:00:00Z", paragraphs: [] };

describe("reading paragraph cloze backend adapter", () => {
    beforeEach(() => vi.clearAllMocks());
    it("maps list and detail endpoints with user ownership", async () => {
        mocks.get.mockResolvedValueOnce({ data: { response: [session] } }).mockResolvedValueOnce({ data: { response: session } });
        expect(await listClozeSessions()).toEqual([session]);
        expect(mocks.get).toHaveBeenNthCalledWith(1, "/api/v1/reading-cloze-paragraph/sessions", { params: { userId: "u1" } });
        expect(await getClozeSession("s1")).toEqual(session);
        expect(mocks.get).toHaveBeenNthCalledWith(2, "/api/v1/reading-cloze-paragraph/sessions/s1", { params: { userId: "u1" } });
    });
    it("maps create and delete contracts", async () => {
        mocks.post.mockResolvedValue({ data: { response: session } }); mocks.remove.mockResolvedValue({});
        expect(await createClozeSession(30)).toEqual(session);
        expect(mocks.post).toHaveBeenCalledWith("/api/v1/reading-cloze-paragraph/sessions", { userId: "u1", limit: 30 });
        await deleteClozeSession("s1");
        expect(mocks.remove).toHaveBeenCalledWith("/api/v1/reading-cloze-paragraph/sessions/s1", { params: { userId: "u1" } });
    });
});
