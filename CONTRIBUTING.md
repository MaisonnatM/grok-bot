# Contributing

Install with npm, then run the checks before you open a pull request:

```bash
npm install
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Do not commit tokens or `.env` files. Do not paste a gateway token into an issue or PR.

Command titles follow Raycast's store rules: Title Case, verb then noun (`List Bots`, `Ask Bot`).
