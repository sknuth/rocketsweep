# Phase 1.5 — Queue Status & Deposit Pool

## What was built

Added queue and deposit pool visibility to the NodePage, showing node operators:
- How much ETH is in the deposit pool (the matching bottleneck)
- Where their queued validators sit in the Rocket Pool queue
- Whether they used express or standard queue

The card **only renders** when a node has validators with `inQueue` or `inPrestake` status — otherwise it's completely hidden.

## Files changed

| Action | File |
|--------|------|
| NEW | [RocketMinipoolQueue.json](file:///home/g082249/rocketsweep/web/src/generated/contracts/RocketMinipoolQueue.json) — ABI copied from skills, wrapped in `{"abi": [...]}` |
| MODIFY | [contracts.js](file:///home/g082249/rocketsweep/web/src/contracts.js) — Added import + entry at `0x9e966733e3E9BFA56aF95f762921859417cF6FaA` |
| NEW | [useDepositPoolStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useDepositPoolStatus.js) — Fetches pool balance, node balance, user balance |
| NEW | [useQueueStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useQueueStatus.js) — Fetches queue length, capacity, megapool position |
| NEW | [QueueStatusCard.js](file:///home/g082249/rocketsweep/web/src/components/QueueStatusCard.js) — Card with deposit pool summary + validators DataGrid |
| MODIFY | [NodePage.js](file:///home/g082249/rocketsweep/web/src/pages/NodePage.js) — Conditional render below MegapoolSummaryCard |

## Key design decisions

- **Same visual patterns** as [MegapoolSummaryCard](file:///home/g082249/rocketsweep/web/src/components/MegapoolSummaryCard.js#109-210) — `DataGrid` with `DataToolbar`, same `Chip` + `OpenInNew` pubkey links, same [CurrencyValue](file:///home/g082249/rocketsweep/web/src/components/CurrencyValue.js#27-113) for ETH amounts
- **Negative user balance** renders in `theme.palette.error.main` with a tooltip explaining the condition
- **Position info** only shown when megapool is actually in queue (position ≥ 0)
- **All `useK` calls** include `onError: () => {}` to suppress console noise

## Verification

✅ Build compiled successfully (exit code 0)

> [!NOTE]
> To test with actual queued validators, navigate to a node that recently created megapool validators not yet matched. Nodes with all staked validators will correctly show no Queue card.
