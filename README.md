Kiwi App
========

A small SolidJS + Vite demo game.

Quick start
-----------

1. Install (use Corepack + pnpm recommended):

```
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

2. Start dev server (host and port optional):

```
pnpm dev --host 0.0.0.0 --port 4173
```

Note: Vite may fall back to a different port if the requested port is in use.

Build & Preview
-----------------

```
pnpm build
pnpm preview
```

Testing
-------

Run the test suite (Vitest):

```
pnpm test
```

Repository notes
----------------
- Main source: [src](src)
- App entry: [src/App.jsx](src/App.jsx)
- Tests: [src/App.test.jsx](src/App.test.jsx)

If you want additional setup (CI, E2E, or more unit tests), open an issue or send a PR.
# kiwi-app