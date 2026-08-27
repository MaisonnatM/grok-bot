import { AgentId, Bot, GatewayError, Result, err, ok } from "./types";
import { parseAgentList } from "./parse-bot";
import { getPreferences, isGatewayConfigured, normalizeGatewayUrl } from "./preferences";

const REQUEST_TIMEOUT_MS = 30_000;

type GatewayConfig = {
  baseUrl: string;
  token: string;
};

function getConfig(): Result<GatewayConfig, GatewayError> {
  const prefs = getPreferences();
  if (!isGatewayConfigured(prefs)) {
    return err({ kind: "not-configured" });
  }
  return ok({
    baseUrl: normalizeGatewayUrl(prefs.gatewayUrl),
    token: prefs.gatewayToken,
  });
}

function networkCause(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown network error";
}

async function readResponseBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function redactSecret(text: string, token: string): string {
  if (token.length === 0) {
    return text;
  }
  return text.split(token).join("[redacted]");
}

async function fetchJson(
  config: GatewayConfig,
  path: string,
  init: RequestInit,
): Promise<Result<unknown, GatewayError>> {
  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 401 || response.status === 403) {
      return err({ kind: "unauthorized" });
    }

    if (!response.ok) {
      const body = redactSecret(await readResponseBody(response), config.token);
      return err({ kind: "rejected", status: response.status, body });
    }

    try {
      return ok(await response.json());
    } catch {
      return err({ kind: "invalid-response", detail: "response is not valid JSON" });
    }
  } catch (error) {
    return err({ kind: "unreachable", cause: redactSecret(networkCause(error), config.token) });
  }
}

function parseSendPromptPayload(raw: unknown): Result<{ accepted: true }, GatewayError> {
  if (typeof raw !== "object" || raw === null) {
    return err({ kind: "invalid-response", detail: "sendPrompt payload must be an object" });
  }
  const record = raw as Record<string, unknown>;
  if (record.accepted !== true) {
    return err({ kind: "invalid-response", detail: "sendPrompt did not accept the prompt" });
  }
  return ok({ accepted: true });
}

async function postGateway(path: string, body: string): Promise<Result<unknown, GatewayError>> {
  const configResult = getConfig();
  if (!configResult.ok) {
    return configResult;
  }

  return fetchJson(configResult.value, path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configResult.value.token}`,
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function listAgents(): Promise<Result<Bot[], GatewayError>> {
  const response = await postGateway("/api/listAgents", "{}");
  if (!response.ok) {
    return response;
  }

  const parsed = parseAgentList(response.value);
  if (!parsed.ok) {
    return err({ kind: "invalid-response", detail: parsed.error });
  }

  return ok(parsed.value);
}

export async function sendPrompt(input: {
  agentId: AgentId;
  prompt: string;
}): Promise<Result<{ accepted: true }, GatewayError>> {
  const response = await postGateway(
    "/api/sendPrompt",
    JSON.stringify({ agentId: input.agentId, prompt: input.prompt }),
  );
  if (!response.ok) {
    return response;
  }

  return parseSendPromptPayload(response.value);
}
