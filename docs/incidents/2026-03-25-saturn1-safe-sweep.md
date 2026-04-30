# 2026-03-25 Saturn 1 Safe Sweep Incident

## Summary

Rocket Pool Saturn 1 changed contract addresses and the
`RocketMerkleDistributorMainnet.claimAndStake` call shape. Rocketsweep needed
two fixes before Safe sweep worked again:

- update the Rocket Pool contract addresses used by the app;
- update the Saturn 1 ABIs and encode `claimAndStake` with the new struct-based
  format.

After the ABI refactor, kpk confirmed in Discord that the Safe sweep worked on
`https://rocketsweep.vercel.app`.

This incident is separate from the later Tarik investigation in April 2026,
where the leading hypothesis became a stale Safe launch URL or wrong app domain
rather than a remaining Saturn 1 ABI problem.

## Timeline

- 2026-03-04: early Vercel production deployments existed, but the Safe launch
  app URL was not yet reliable. The bundle exposed Vercel project URLs but
  `REACT_APP_ROCKET_SWEEP_URL` was not embedded as a proper public app URL.
- 2026-03-13 to 2026-03-14: Vercel production bundles embedded
  `https://rocketsweep.app` as the Safe app URL.
- 2026-03-25 08:29 CET: commit `5234a28` updated `RocketNodeManager` for
  Saturn 1.
- 2026-03-25 18:10 CET: commit `4e25b3d` updated additional Saturn 1 contract
  addresses, including the legacy minipool sweep path.
- 2026-03-25 20:31 CET: kpk reported a new Safe simulation failure after the
  address fix. Tenderly showed a Safe `GS013` revert through
  `MultiSendCallOnly`; the useful root cause was the reverted inner call, not
  the Safe wrapper error itself.
- 2026-03-26 00:53 CET: commit `8ab642c` updated the ABIs and
  `claimAndStake` encoding for Saturn 1.
- 2026-03-26: kpk retried and confirmed: "it worked. thank you very much!!"
- 2026-04-29: commit `d3b3a35` changed the configured Safe launch URL from
  `https://rocketsweep.app` to `https://rocketsweep.vercel.app`.
- 2026-04-30: Vercel bundle inspection confirmed that current production embeds
  `https://rocketsweep.vercel.app`, while March Saturn 1 deployments embedded
  `https://rocketsweep.app`.

## Evidence

Discord support reconstruction:

- kpk first reported the Safe simulation failure around the Saturn 1 rollout.
- sknuth replied that the sweep was calling an old
  `RocketMerkleDistributorMainnet` address and that other contract addresses
  were incorrect.
- kpk then reported: "looks like a different error now. Thanks."
- sknuth replied that the ABIs also needed to be updated for Saturn 1 because
  the `claimAndStake` function signature changed to a struct-based format.
- kpk later confirmed that the retry worked.

Vercel bundle reconstruction:

- `rocketsweep-dkie06ddg-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.app`.
- `rocketsweep-f2is79f63-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.app`.
- `rocketsweep-5urgoocit-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.app`.
- `rocketsweep-foarkhuvq-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.app`.
- `rocketsweep-5v7556vun-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.app`.
- `rocketsweep-rdc64qucy-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.app`.
- `rocketsweep-4swrmx4lw-sknuths-projects.vercel.app` embedded
  `https://rocketsweep.vercel.app`.

Relevant commits:

- `5234a28` - `fix: update RocketNodeManager to Saturn 1`
- `4e25b3d` - `fix: update contract addresses for Saturn 1 - fixes legacy minipool sweep`
- `8ab642c` - `fix: update ABIs and claimAndStake encoding for Saturn 1`
- `d3b3a35` - `archi: move web deployment to Vercel`

## Root Causes

The kpk incident had two Saturn 1 root causes:

- some Rocket Pool contract addresses still pointed at pre-Saturn contracts;
- the app still encoded `claimAndStake` using the pre-Saturn ABI.

The later Tarik investigation pointed at a different access-path risk:

- `safeAppUrl` uses `REACT_APP_ROCKET_SWEEP_URL`;
- `REACT_APP_*` values are baked into the production browser bundle;
- March Vercel deployments still launched Safe with
  `appUrl=https://rocketsweep.app`, even when the Vercel-hosted app itself had
  newer Saturn 1 fixes.

## Maintenance Lessons

- Treat Rocket Pool upgrades as an address-and-ABI migration. Updating only one
  side can leave Safe transactions failing with generic wrapper errors.
- For Safe failures, `GS013` means the Safe transaction failed, but the
  actionable root cause is usually in the inner call trace.
- Always inspect the deployed browser bundle when debugging app URL behavior.
  Local `.env` files and `.env.example` do not prove what production embeds.
- Smoke-test both entry paths after deployment:
  - direct `https://rocketsweep.vercel.app` inside Safe;
  - any app button or link that calls `safeAppUrl`.
- Keep incident notes short, dated, and evidence-backed so future maintainers
  can distinguish a fixed protocol migration from a later routing or deployment
  problem.
