import { Tool } from "@raycast/api";
import { listAgents, sendPrompt } from "../lib/gateway";
import { matchBotForSend } from "../lib/match-bot";
import { gatewayErrorMessage } from "../lib/types";

type Input = {
  /** Bot name or id */
  bot: string;
  /** Task to send */
  prompt: string;
};

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  return {
    message: `Send this task to ${input.bot}?`,
    info: [
      { name: "Bot", value: input.bot },
      { name: "Task", value: input.prompt },
    ],
  };
};

export default async function tool(input: Input) {
  const botsResult = await listAgents();
  if (!botsResult.ok) {
    throw new Error(gatewayErrorMessage(botsResult.error));
  }

  const target = matchBotForSend(botsResult.value, input.bot);
  if (!target) {
    throw new Error(`No bot matched "${input.bot}".`);
  }

  const sendResult = await sendPrompt({ agentId: target.id, prompt: input.prompt.trim() });
  if (!sendResult.ok) {
    throw new Error(gatewayErrorMessage(sendResult.error));
  }

  return `Sent task to ${target.name}.`;
}
