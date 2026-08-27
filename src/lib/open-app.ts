import { open, showHUD } from "@raycast/api";

const APP_PATH = "/Applications/Grok Bot.app";
const APP_URL = "grokbot://";

export async function openGrokBot(): Promise<boolean> {
  try {
    await open(APP_PATH);
    await showHUD("Opened Grok Bot");
    return true;
  } catch {
    try {
      await open(APP_URL);
      await showHUD("Opened Grok Bot");
      return true;
    } catch {
      await showHUD("Could not open Grok Bot");
      return false;
    }
  }
}
