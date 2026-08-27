/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Gateway URL - Tailscale Serve URL for the Sand gateway, for example https://box.ts.net */
  "gatewayUrl"?: string,
  /** Gateway Token - Bearer token from gateway.json on the Bot computer. Treat it like a password. */
  "gatewayToken"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `bots` command */
  export type Bots = ExtensionPreferences & {}
  /** Preferences accessible in the `ask` command */
  export type Ask = ExtensionPreferences & {}
  /** Preferences accessible in the `open-grok-bot` command */
  export type OpenGrokBot = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `bots` command */
  export type Bots = {}
  /** Arguments passed to the `ask` command */
  export type Ask = {
  /** Task for the bot */
  "question": string,
  /** Bot name */
  "bot": string
}
  /** Arguments passed to the `open-grok-bot` command */
  export type OpenGrokBot = {}
}

