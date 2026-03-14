# Phase 1.5 — Queue Status & Deposit Pool

## What was built

Queue and deposit pool visibility on the NodePage. Since `RocketMinipoolQueue` only tracks legacy minipools (not megapool validators), queue data is **estimated** from deposit pool balances.

The card only renders when a node has validators with `inQueue` or `inPrestake` status.

## Files

| Action | File | Summary |
|--------|------|---------|
| CREATE | [useDepositPoolStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useDepositPoolStatus.js) | Fetches pool balance, node balance, user balance |
| CREATE | [QueueStatusCard.js](file:///home/g082249/rocketsweep/web/src/components/QueueStatusCard.js) | Card with deposit pool stats, estimated queue count, queued validators table |
| MODIFY | [NodePage.js](file:///home/g082249/rocketsweep/web/src/pages/NodePage.js) | Conditional render below MegapoolSummaryCard |

**Cleaned up** (removed RocketMinipoolQueue artifacts from initial implementation):
- Deleted `RocketMinipoolQueue.json`, [useQueueStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useQueueStatus.js)
- Removed from [contracts.js](file:///home/g082249/rocketsweep/web/src/contracts.js)

## Key design decisions

- **Estimated queue count** = `nodeBalance / 4 ETH` with `~` prefix and tooltip disclaimer
- **"Queued Since" column** using `moment.unix(lastAssignmentTime).fromNow()` — tells operators how long they've been waiting
- **Summary line** above the table: "~N validators in queue network-wide · Your node: X queued · Deposit pool: Y ETH available"
- **Negative `userBalance`** renders in red with tooltip explanation

## Verification

✅ Build compiled successfully (exit code 0)
