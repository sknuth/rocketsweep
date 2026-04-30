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
4. Push the validated `dev` commit to a remote review branch, not directly to
   `main`.
5. Open a pull request from the review branch to `main`.
6. Verify GitHub Actions and the Vercel preview deployment on the pull request.
7. Merge only after CI and preview validation are both green.
8. Verify the production Vercel deployment from `main`.
9. After production is validated, realign the local `main` worktree with
   `origin/main`.

Do not push directly to `main` during normal work. Do not advance `main`
locally ahead of production validation.

Recommended GitHub branch protection for `main`:

- require pull requests before merging
- require the Web CI status check before merging
- block force pushes
- keep Vercel connected to `main` for production deployments

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
