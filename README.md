# Grok Bot for Raycast

Send a task to a Grok Bot teammate without leaving Raycast.

This talks to the Sand HTTP gateway on your Grok Bot cloud computer. It is not the Grok chat API at `api.x.ai`, and it is not an official xAI or Cursor product. The gateway is undocumented. It can change or disappear.

## Install

1. Clone this repo.
2. In Raycast, run Import Extension and pick the folder.
3. `npm install` then `npm run dev`.

## Connect the gateway

The desktop app already reaches your Bot computer. Raycast does not. You need a URL that hits port 1340 on that computer, plus the gateway token.

Typical path:

1. Reach the computer over Tailscale, or forward the port with `ssh -L 1340:127.0.0.1:1340`.
2. On the Bot computer, read `/home/box/sand-data/gateway.json`.
3. In Raycast, open this extension's preferences. Set Gateway URL (`http://127.0.0.1:1340` if you tunneled) and Gateway token.

Treat the token like a password. Do not put port 1340 on the public internet. Without those two values, List Bots and Ask Bot still offer Open Grok Bot.

## Commands

- **List Bots.** Search teammates and send a task.
- **Ask Bot.** Send a task to one bot. Uses selected text if you do not pass a question.
- **Open Grok Bot.** Opens the desktop app.

Raycast AI can call **Send to Bot** after you name a teammate.

## Development

```bash
npm test
npm run lint
npm run build
```

`npm run publish` opens a Store pull request against `raycast/extensions`. The Raycast `author` field must match your Raycast account username before that will work.

## License

MIT. Grok Bot is a trademark of xAI. This repo is not affiliated with xAI or Cursor.
