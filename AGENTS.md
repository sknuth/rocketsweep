# Rocketsweep Agent Notes

## Worktree roles

- `~/Projects/Rocketsweep/dev` is the default worktree for normal changes,
  validation, commits, and pushes.
- `~/Projects/Rocketsweep/main` is a local reference for the current production
  state. Do not implement changes there. Use it to inspect or locally reproduce
  the deployed `main` state.
- `~/Projects/Rocketsweep/hotfix` is reserved for urgent production fixes that
  must stay isolated from in-progress development.

## Deployment workflow

1. Make changes in `dev`.
2. Validate locally from `dev`, including production-style web checks.
3. Commit from `dev` using the project commit semantics.
4. Push the validated `dev` commit to the remote deployment branch.
5. Verify GitHub CI and Vercel production.
6. After production is validated, realign the local `main` worktree with
   `origin/main`.

Do not advance `main` locally ahead of production validation.

## Web validation

Use Node 24 for production-style validation because Vercel requires Node 24.
From `~/Projects/Rocketsweep/dev/web`:

```sh
npx vercel env pull .env.local
npm run build:ci
npm run test:ci
npx serve -s build -l 4173
```

`web/.env.local` and `web/.vercel/` are local-only and must not be committed.

## Commit types

Use the smallest truthful type:

- `archi`
- `fix`
- `feature`
- `chore`
- `test`
- `doc`
- `hotfix`
- `refactor`

Format:

```text
type: short imperative summary
```
