# Rocketsweep — Phase 1.5 + Phase 2

## Phase 1.5: Queue Status & Deposit Pool

Added queue and deposit pool visibility to NodePage. Since `RocketMinipoolQueue` only tracks legacy minipools, queue count is estimated from deposit pool balances (`nodeBalance / 4 ETH`).

| Action | File |
|--------|------|
| CREATE | [useDepositPoolStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useDepositPoolStatus.js) |
| CREATE | [QueueStatusCard.js](file:///home/g082249/rocketsweep/web/src/components/QueueStatusCard.js) |
| MODIFY | [useMegapoolDetails.js](file:///home/g082249/rocketsweep/web/src/hooks/useMegapoolDetails.js) — `MegapoolValidatorEnqueued` events for "Queued Since" |

---

## Phase 2: Megapool Sweep (Distribute + Claim)

Added Safe-batched `distribute()` + `claim()` write operations for megapool operators.

| Action | File | Summary |
|--------|------|---------|
| MODIFY | [utils.js](file:///home/g082249/rocketsweep/web/src/utils.js) | `claimEncoded` + gas estimators |
| CREATE | [useMegapoolSweeper.js](file:///home/g082249/rocketsweep/web/src/hooks/useMegapoolSweeper.js) | Orchestrates distribute + claim via SafeAppsSDK |
| CREATE | [MegapoolSweepCard.js](file:///home/g082249/rocketsweep/web/src/components/MegapoolSweepCard.js) | Sweep UI with checkboxes, reward breakdown, debt warning |
| MODIFY | [NodePage.js](file:///home/g082249/rocketsweep/web/src/pages/NodePage.js) | All integrations |

**Key patterns followed:**
- Same Safe-only execution model as [SafeSweepCard](file:///home/g082249/rocketsweep/web/src/components/SafeSweepCard.js#1021-1310)
- `distribute()` must come before `claim()` in the batch
- Exiting validators block distribute (shows warning)
- Debt is repaid from rewards before transfer (shows info alert)
- Reuses `distributeEncoded` (same function signature as fee distributor)

## Verification

✅ Build compiled successfully (exit code 0)
