import { AgentId, Bot } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function matchBotForSend(bots: Bot[], query: string): Bot | null {
  const needle = normalize(query);
  if (needle.length === 0) {
    return null;
  }

  const byId = bots.find((bot) => normalize(bot.id) === needle);
  if (byId) {
    return byId;
  }

  return bots.find((bot) => normalize(bot.name) === needle) ?? null;
}

export function matchesListQuery(bot: Bot, query: string): boolean {
  const needle = normalize(query);
  if (needle.length === 0) {
    return true;
  }

  return (
    normalize(bot.name).includes(needle) ||
    normalize(bot.title).includes(needle) ||
    normalize(bot.description).includes(needle)
  );
}

export function filterBotsForList(bots: Bot[], query: string): { individuals: Bot[]; groups: Bot[]; hidden: Bot[] } {
  const trimmed = query.trim();
  const matching = trimmed.length === 0 ? bots : bots.filter((bot) => matchesListQuery(bot, trimmed));
  const visible = matching.filter((bot) => !bot.isHidden);

  return {
    individuals: visible.filter((bot) => !bot.isGroup),
    groups: visible.filter((bot) => bot.isGroup),
    hidden: trimmed.length > 0 ? matching.filter((bot) => bot.isHidden) : [],
  };
}

export function resolveInitialBot(input: { bots: Bot[]; query?: string; lastId: AgentId | null }): Bot | null {
  if (input.query) {
    const named = matchBotForSend(input.bots, input.query);
    if (named) {
      return named;
    }
  }

  if (input.lastId) {
    const last = input.bots.find((bot) => bot.id === input.lastId);
    if (last) {
      return last;
    }
  }

  return input.bots[0] ?? null;
}
