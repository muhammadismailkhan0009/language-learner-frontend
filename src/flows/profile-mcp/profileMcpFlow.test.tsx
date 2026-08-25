import { FlowRunner } from "@myriadcodelabs/uiflow";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { profileMcpFlow } from "./profileMcpFlow";

describe("profile MCP flow", () => {
    it("copies MCP URL without rendering it", async () => {
        const getMcpUrl = vi.fn().mockResolvedValue("https://example.test/mcp?key=secret");
        const writeText = vi.fn().mockResolvedValue(undefined);
        render(<FlowRunner flow={profileMcpFlow} initialData={{
            backend: { getMcpUrl },
            clipboard: { writeText },
        }} />);

        await userEvent.click(screen.getByRole("button", { name: "Copy MCP URL" }));

        await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://example.test/mcp?key=secret"));
        expect(screen.queryByText("https://example.test/mcp?key=secret")).not.toBeInTheDocument();
        expect(await screen.findByRole("status")).toHaveTextContent("MCP URL copied.");
    });

    it("shows copy failures", async () => {
        const getMcpUrl = vi.fn().mockRejectedValue(new Error("MCP URL unavailable"));
        render(<FlowRunner flow={profileMcpFlow} initialData={{
            backend: { getMcpUrl },
            clipboard: { writeText: vi.fn() },
        }} />);

        await userEvent.click(screen.getByRole("button", { name: "Copy MCP URL" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("MCP URL unavailable");
    });
});
