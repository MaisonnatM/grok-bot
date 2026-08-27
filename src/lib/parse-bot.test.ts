import { describe, expect, it } from "vitest";
import { parseAgentList, parseBot } from "./parse-bot";

const baseAgent = {
  id: "agent-1",
  name: "Piper",
  title: "Engineer",
  description: "Builds things",
  avatarDataUrl: "data:image/png;base64,abc",
  isGroup: false,
  isHiddenFromSidebar: false,
  lastMessagePreview: "Hello",
};

describe("parseBot", () => {
  it("parses a host agent summary into Bot", () => {
    const result = parseBot(baseAgent);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toEqual({
      id: "agent-1",
      name: "Piper",
      title: "Engineer",
      description: "Builds things",
      isGroup: false,
      isHidden: false,
      status: { kind: "idle" },
      lastPreview: "Hello",
      avatarDataUrl: "data:image/png;base64,abc",
    });
  });

  it("rejects empty id", () => {
    const result = parseBot({ ...baseAgent, id: "  " });
    expect(result.ok).toBe(false);
  });

  it("treats a non-empty awaitingUserResponse object as awaiting-you", () => {
    const result = parseBot({
      ...baseAgent,
      awaitingUserResponse: { prompt: "Approve this?" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: "awaiting-you" });
    }
  });

  it("applies status priority awaiting-you over running", () => {
    const result = parseBot({
      ...baseAgent,
      awaitingUserResponse: true,
      isRunning: true,
      isComposingMessage: true,
      hasUnread: true,
      unreadCount: 3,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: "awaiting-you" });
    }
  });

  it("prefers running over composing and unread", () => {
    const result = parseBot({
      ...baseAgent,
      isRunning: true,
      isComposingMessage: true,
      hasUnread: true,
      unreadCount: 2,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: "running" });
    }
  });

  it("prefers composing over unread", () => {
    const result = parseBot({
      ...baseAgent,
      isComposingMessage: true,
      hasUnread: true,
      unreadCount: 2,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: "composing" });
    }
  });

  it("maps unread count when hasUnread is true", () => {
    const result = parseBot({
      ...baseAgent,
      hasUnread: true,
      unreadCount: 4,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toEqual({ kind: "unread", count: 4 });
    }
  });

  it("maps hidden and group flags", () => {
    const result = parseBot({
      ...baseAgent,
      isHiddenFromSidebar: true,
      isGroup: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isHidden).toBe(true);
      expect(result.value.isGroup).toBe(true);
    }
  });
});

describe("parseAgentList", () => {
  it("accepts a bare array", () => {
    const result = parseAgentList([baseAgent]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.name).toBe("Piper");
    }
  });

  it("accepts an agents wrapper", () => {
    const result = parseAgentList({ agents: [baseAgent] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
    }
  });
});
