# Rocketsweep Maintenance Workflow

## Worktrees

- `main/`: stable reference checkout on branch `main`
- `dev/`: day-to-day implementation and validation branch
- `hotfix/`: isolated branch for urgent production fixes
- `.repo/`: bare admin repository that owns the worktrees

Current layout:

```bash
~/Projects/Rocketsweep/
  .repo/
  main/
  dev/
  hotfix/
```

## Daily usage

- Do routine work in `~/Projects/Rocketsweep/dev`
- Keep `~/Projects/Rocketsweep/main` clean and close to `origin/main`
- Use `~/Projects/Rocketsweep/hotfix` only for urgent fixes that should stay isolated from in-flight dev work
- Create topic branches from `dev` or `hotfix` when the change deserves its own review branch

Examples:

```bash
cd ~/Projects/Rocketsweep/dev
git switch -c fix/discord-user-bug

cd ~/Projects/Rocketsweep/hotfix
git switch -c hotfix/safe-runtime-regression
```

## Syncing

Refresh refs in any worktree:

```bash
git fetch origin --prune
```

Reset the stable reference worktree to remote main:

```bash
cd ~/Projects/Rocketsweep/main
git switch main
git pull --ff-only origin main
```

Rebase the long-lived local worktrees when needed:

```bash
cd ~/Projects/Rocketsweep/dev
git fetch origin --prune
git rebase origin/main

cd ~/Projects/Rocketsweep/hotfix
git fetch origin --prune
git rebase origin/main
```

## Build validation

Frontend app lives in `web/`.

Install dependencies:

```bash
cd ~/Projects/Rocketsweep/main/web
npm ci
```

Recommended validation commands:

```bash
npm run build:ci
npm run test:ci
```

Notes:

- `build:ci` enforces a stricter production-style build with `CI=true`
- `GENERATE_SOURCEMAP=false` avoids noisy dependency source map output in CI builds
- `test:ci` passes cleanly even when no Jest tests exist yet

## Vercel deployment

Vercel is the deployment source of truth.

Expected project settings in the Vercel dashboard:

- Git repository: `sknuth/rocketsweep`
- Production branch: `main`
- Root directory: `web`
- Install command: `npm ci`
- Build command: `npm run build:ci`
- Output directory: `build`
- Production domain: `rocketsweep.vercel.app`

Required Vercel environment variables:

- `REACT_APP_ALCHEMY_KEY`
- `REACT_APP_WALLET_CONNECT_PROJECT_ID`
- `REACT_APP_ROCKET_SWEEP_URL=https://rocketsweep.vercel.app`
- `REACT_APP_ROUTER=browser`
- `GENERATE_SOURCEMAP=false`

As of April 29, 2026, the Vercel project has all five variables configured for all
environments. Local builds do not inherit these values: create a local
`web/.env.local` or export the variables before running `npm run build`.
When using the Vercel CLI, run `npx vercel env pull .env.local` from `web/` to
sync the project environment locally.

First-time local Vercel setup:

```sh
cd web
npx vercel link
npx vercel env pull .env.local
```

Validated local production smoke test:

```sh
cd web
npx vercel env pull .env.local
npm run build:ci
npx serve -s build -l 4173
```

`web/.env.local` and `web/.vercel/` must stay local-only and are ignored by
`web/.gitignore`.

`REACT_APP_*` values are embedded in the browser bundle and must be treated as
public client configuration. Protect the Alchemy and WalletConnect projects by
restricting allowed domains in their provider dashboards instead of relying on
the frontend bundle to keep keys secret.

Deployment flow:

- Pull requests get Vercel preview deployments from the connected GitHub project
- Merges to `main` trigger the production Vercel deployment
- GitHub Actions run validation only and do not deploy
- Firebase deployment workflows have been removed from this repo
- `rocketsweep.app` remains outside this fork's deployment path unless the upstream domain owner redirects it

## Commit conventions

Use the smallest truthful type:

- `archi`
- `feature`
- `fix`
- `chore`
- `hotfix`
- `test`
- `refactor`
- `doc`

Format:

```text
type: short imperative summary
```

Examples:

- `fix: harden safe sweep contract resolution`
- `hotfix: restore legacy minipool sweep on mainnet`
- `doc: document worktree maintenance workflow`
