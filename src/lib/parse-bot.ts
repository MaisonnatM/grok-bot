import { Bot, AgentStatus, parseAgentId, err, ok, Result } from "./types";

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isAwaitingYou(value: unknown): boolean {
  if (value === true) {
    return true;
  }
  if (value === false || value == null) {
    return false;
  }
  return typeof value === "object";
}

function deriveStatus(raw: Record<string, unknown>): AgentStatus {
  const awaitingUserResponse = isAwaitingYou(raw.awaitingUserResponse);
  const isRunning = readBoolean(raw.isRunning);
  const isComposingMessage = readBoolean(raw.isComposingMessage);
  const hasUnread = readBoolean(raw.hasUnread);
  const unreadCount = readNumber(raw.unreadCount);

  if (awaitingUserResponse) {
    return { kind: "awaiting-you" };
  }
  if (isRunning) {
    return { kind: "running" };
  }
  if (isComposingMessage) {
    return { kind: "composing" };
  }
  if (hasUnread && unreadCount > 0) {
    return { kind: "unread", count: unreadCount };
  }
  return { kind: "idle" };
}

export function parseBot(raw: unknown): Result<Bot, string> {
  if (typeof raw !== "object" || raw === null) {
    return err("agent must be an object");
  }

  const record = raw as Record<string, unknown>;
  const idResult = parseAgentId(record.id);
  if (!idResult.ok) {
    return err(idResult.error);
  }

  return ok({
    id: idResult.value,
    name: readString(record.name),
    title: readString(record.title),
    description: readString(record.description),
    isGroup: readBoolean(record.isGroup),
    isHidden: readBoolean(record.isHiddenFromSidebar),
    status: deriveStatus(record),
    lastPreview: readNullableString(record.lastMessagePreview),
    avatarDataUrl: readNullableString(record.avatarDataUrl),
  });
}

export function parseAgentList(raw: unknown): Result<Bot[], string> {
  let items: unknown[];

  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === "object" && raw !== null && Array.isArray((raw as Record<string, unknown>).agents)) {
    items = (raw as Record<string, unknown>).agents as unknown[];
  } else {
    return err("expected array or { agents: [...] }");
  }

  const bots: Bot[] = [];
  for (const item of items) {
    const parsed = parseBot(item);
    if (!parsed.ok) {
      return err(parsed.error);
    }
    bots.push(parsed.value);
  }

  return ok(bots);
}
