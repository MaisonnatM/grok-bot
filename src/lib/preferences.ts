import { getPreferenceValues } from "@raycast/api";

export type Preferences = {
  gatewayUrl: string;
  gatewayToken: string;
};

export function getPreferences(): Preferences {
  const prefs = getPreferenceValues<Preferences>();
  return {
    gatewayUrl: prefs.gatewayUrl?.trim() ?? "",
    gatewayToken: prefs.gatewayToken?.trim() ?? "",
  };
}

export function normalizeGatewayUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function isGatewayConfigured(prefs: Preferences): boolean {
  return prefs.gatewayUrl.length > 0 && prefs.gatewayToken.length > 0;
}
