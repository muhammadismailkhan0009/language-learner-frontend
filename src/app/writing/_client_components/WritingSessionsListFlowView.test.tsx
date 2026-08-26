import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WritingSessionsListFlowView from "./WritingSessionsListFlowView";

describe("WritingSessionsListFlowView", () => {
  it("announces MCP generation instruction", () => {
    render(
      <WritingSessionsListFlowView
        input={{
          mode: "list",
          sessions: [],
          activeSessionId: null,
          isLoadingSessions: false,
          isLoadingSessionDetail: false,
          isCreatingSession: false,
          isDeletingSession: false,
          error: null,
          infoMessage: "Writing exercise generation requested. Run your MCP tool.",
        }}
        output={{ emit: vi.fn() }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Run your MCP tool");
  });
});
