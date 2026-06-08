# Firebelly Client

React/Vite client for Firebelly Fitness, a personal training platform for workout logging, trainer/client collaboration, scheduling, goals, groups, billing, invoices, and progress tracking.

## Stack

- React 19
- Vite 8
- React Router 7
- Redux 5 with thunk actions
- Material UI 9
- Socket.IO client
- Recharts
- Yarn

## Quick Start

```bash
yarn install
yarn dev
```

The dev server runs on `http://localhost:3000` and proxies API/socket traffic to the backend through `VITE_PROXY_TARGET` or `http://localhost:6969`.

## Environment

Local environment files:

- `.env.development`
- `.env.live`

Common variables:

```bash
VITE_PROXY_TARGET=http://localhost:6969
VITE_API_URL=https://firebellyfitness.herokuapp.com
```

In development, the API defaults to `/api`. In production, the API defaults to `https://firebellyfitness.herokuapp.com` unless `VITE_API_URL` is set.

## Commands

```bash
yarn dev        # start local Vite dev server
yarn dev:live   # run Vite with live mode env
yarn lint       # eslint, zero warnings allowed
yarn build      # production build
yarn preview    # preview production build
```

## Project Structure

```text
src/
  api/             Central API client and feature API modules
  features/        Newer feature-oriented modules
    schedule/
    workout/
  Components/      Legacy/shared components
  Pages/           Route pages
  Redux/           Store, reducer, action modules
  utils/           Shared utilities
```

Prefer `src/features/<feature>` for new feature work. Keep legacy `Components`, `Pages`, and `Redux` modules working while gradually decomposing large files.

## API and Auth Rules

- Use `src/api/client.js` for request behavior, credentials, refresh/retry, and token handling.
- Use feature API modules such as `src/api/workoutApi.js`, `src/api/scheduleApi.js`, and `src/api/groupApi.js`.
- Do not add direct authenticated `fetch()` calls in components.
- Do not persist access tokens in `localStorage`.
- Refresh auth is cookie-based and uses `credentials: "include"`.

## Verification

Before committing client changes:

```bash
yarn lint
yarn build
```

There is currently no client test suite. For high-risk UI changes, manually verify the affected route and record what was checked in the PR or session handoff.

## Related Docs

- `../AGENTS.md`
- `../docs/PROJECT_CONTEXT.md`
- `../docs/ARCHITECTURE.md`
- `../docs/TODO.md`
