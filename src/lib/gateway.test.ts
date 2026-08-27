import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getPreferences, isGatewayConfigured } = vi.hoisted(() => ({
  getPreferences: vi.fn(),
  isGatewayConfigured: vi.fn(),
}));

vi.mock("./preferences", () => ({
  getPreferences,
  isGatewayConfigured,
  normalizeGatewayUrl: (url: string) => url.replace(/\/+$/, ""),
}));

import { listAgents, sendPrompt } from "./gateway";
import { parseAgentId } from "./types";

function mockPrefs(url: string, token: string) {
  getPreferences.mockReturnValue({ gatewayUrl: url, gatewayToken: token });
  isGatewayConfigured.mockReturnValue(url.length > 0 && token.length > 0);
}

describe("gateway", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns not-configured when preferences are missing", async () => {
    mockPrefs("", "");
    const result = await listAgents();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({ kind: "not-configured" });
    }
  });

  it("maps 401 to unauthorized", async () => {
    mockPrefs("http://127.0.0.1:1340", "secret-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 401 })),
    );

    const result = await listAgents();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({ kind: "unauthorized" });
    }
  });

  it("maps network failures to unreachable", async () => {
    mockPrefs("http://127.0.0.1:1340", "secret-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connection refused");
      }),
    );

    const result = await listAgents();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("unreachable");
      if (result.error.kind === "unreachable") {
        expect(result.error.cause).toContain("connection refused");
      }
    }
  });

  it("lists agents from an array response", async () => {
    mockPrefs("http://127.0.0.1:1340/", "secret-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json([
          {
            id: "a1",
            name: "Piper",
            title: "",
            description: "",
          },
        ]),
      ),
    );

    const result = await listAgents();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.name).toBe("Piper");
    }

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:1340/api/listAgents",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer secret-token",
        }),
      }),
    );
  });

  it("sendPrompt returns accepted on success", async () => {
    mockPrefs("http://127.0.0.1:1340", "secret-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ accepted: true })),
    );

    const agentId = parseAgentId("a1");
    expect(agentId.ok).toBe(true);
    if (!agentId.ok) {
      return;
    }

    const result = await sendPrompt({ agentId: agentId.value, prompt: "Do the thing" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ accepted: true });
    }
  });

  it("never includes the token in error strings", async () => {
    mockPrefs("http://127.0.0.1:1340", "super-secret-token-value");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("bad gateway", { status: 502, statusText: "Bad Gateway" })),
    );

    const result = await listAgents();
    expect(result.ok).toBe(false);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("super-secret-token-value");
  });

  it("redacts the token when the gateway echoes it in a rejected body", async () => {
    mockPrefs("http://127.0.0.1:1340", "super-secret-token-value");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("token super-secret-token-value is invalid", { status: 500 })),
    );

    const result = await listAgents();
    expect(result.ok).toBe(false);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("super-secret-token-value");
    expect(serialized).toContain("[redacted]");
  });
});
