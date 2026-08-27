import { describe, expect, it } from "vitest";
import { filterBotsForList, matchBotForSend, resolveInitialBot } from "./match-bot";
import { Bot, parseAgentId } from "./types";

function bot(overrides: { id: string; name: string } & Partial<Omit<Bot, "id" | "name">>): Bot {
  const id = parseAgentId(overrides.id);
  if (!id.ok) {
    throw new Error("invalid test id");
  }
  return {
    id: id.value,
    name: overrides.name,
    title: overrides.title ?? "",
    description: overrides.description ?? "",
    isGroup: overrides.isGroup ?? false,
    isHidden: overrides.isHidden ?? false,
    status: overrides.status ?? { kind: "idle" },
    lastPreview: overrides.lastPreview ?? null,
    avatarDataUrl: overrides.avatarDataUrl ?? null,
  };
}

const piper = bot({ id: "a1", name: "Piper", title: "Engineer", description: "Builds things" });
const scout = bot({ id: "a2", name: "Scout", isHidden: true, description: "Finds talent" });
const crew = bot({ id: "g1", name: "Launch", isGroup: true });

describe("matchBotForSend", () => {
  it("matches exact id or exact name, not a substring", () => {
    const bots = [piper, scout];
    expect(matchBotForSend(bots, "Piper")?.name).toBe("Piper");
    expect(matchBotForSend(bots, "a1")?.name).toBe("Piper");
    expect(matchBotForSend(bots, "Pi")).toBeNull();
  });
});

describe("filterBotsForList", () => {
  it("hides hidden bots until there is a search query", () => {
    const empty = filterBotsForList([piper, scout, crew], "");
    expect(empty.individuals.map((entry) => entry.name)).toEqual(["Piper"]);
    expect(empty.groups.map((entry) => entry.name)).toEqual(["Launch"]);
    expect(empty.hidden).toEqual([]);

    const searched = filterBotsForList([piper, scout, crew], "talent");
    expect(searched.individuals).toEqual([]);
    expect(searched.hidden.map((entry) => entry.name)).toEqual(["Scout"]);
  });
});

describe("resolveInitialBot", () => {
  it("prefers an exact query, then last id, then first bot", () => {
    const last = parseAgentId("a2");
    if (!last.ok) {
      throw new Error("invalid last id");
    }
    const bots = [piper, scout];
    expect(resolveInitialBot({ bots, query: "Scout", lastId: last.value })?.name).toBe("Scout");
    expect(resolveInitialBot({ bots, lastId: last.value })?.name).toBe("Scout");
    expect(resolveInitialBot({ bots, lastId: null })?.name).toBe("Piper");
  });
});
