# Phase 1.5 — Queue Status & Deposit Pool

Add queue and deposit pool visibility to the NodePage. Shows network-level deposit pool state and node-specific validator queue positions. Only renders when the node has queued/prestaked validators.

## Proposed Changes

### Contract Setup

#### [NEW] [RocketMinipoolQueue.json](file:///home/g082249/rocketsweep/web/src/generated/contracts/RocketMinipoolQueue.json)
Copy ABI from [.agent/skills/node-operations/assets/abis/rocketMinipoolQueue.json](file:///home/g082249/rocketsweep/.agent/skills/node-operations/assets/abis/rocketMinipoolQueue.json) and wrap it in `{"abi": [...]}` to match project convention.

#### [MODIFY] [contracts.js](file:///home/g082249/rocketsweep/web/src/contracts.js)
Add `RocketMinipoolQueue` import and entry with address `0x9e966733e3E9BFA56aF95f762921859417cF6FaA`.

---

### Hooks

#### [NEW] [useDepositPoolStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useDepositPoolStatus.js)
Simple hook using `useK.RocketDepositPool.Read.*` for `getBalance`, `getNodeBalance`, `getUserBalance`. Returns `{ balance, nodeBalance, userBalance, isLoading }`.

#### [NEW] [useQueueStatus.js](file:///home/g082249/rocketsweep/web/src/hooks/useQueueStatus.js)
Hook using `useK.RocketMinipoolQueue.Read.*` for `getTotalLength`, `getEffectiveCapacity`, and conditional `getMinipoolPosition(megapoolAddress)`. Returns `{ totalLength, effectiveCapacity, position, isLoading }`.

---

### Component

#### [NEW] [QueueStatusCard.js](file:///home/g082249/rocketsweep/web/src/components/QueueStatusCard.js)

MUI Card with `HourglassEmpty` icon and "Queue & Deposit Pool" title, matching [MegapoolSummaryCard](file:///home/g082249/rocketsweep/web/src/components/MegapoolSummaryCard.js#109-210) style:

**Section A — Deposit Pool** (compact summary row):
- Pool Balance, Available for Matching (red if negative with tooltip), Queue Capacity, Validators in Queue

**Section B — Your Validators in Queue** (mini DataGrid):
- Columns: ID, Pubkey (truncated + beaconcha.in link), Status ("In Queue"/"Prestaked"), Queue Type (Express/Standard chip)
- If megapool position is available and >= 0, show position text above table

Does NOT render if no queued/prestaked validators (enforced at NodePage level).

---

### Integration

#### [MODIFY] [NodePage.js](file:///home/g082249/rocketsweep/web/src/pages/NodePage.js)
- Import new hooks + component
- Call `useDepositPoolStatus()` and `useQueueStatus(megapoolAddress)`
- Filter validators for `inQueue || inPrestake`
- Conditional render `QueueStatusCard` below [MegapoolSummaryCard](file:///home/g082249/rocketsweep/web/src/components/MegapoolSummaryCard.js#109-210) only when `hasMegapool && hasQueuedValidators`

---

## Verification Plan

### Automated Tests
No existing test suite exists in this project. Verification will be build + browser based.

### Build Verification
```bash
cd /home/g082249/rocketsweep/web && npx react-scripts build 2>&1 | tail -5
```

### Browser Verification
1. Run `npm start` and open the app
2. Navigate to a node **without** a megapool → confirm no Queue card appears
3. Navigate to a node **with** a megapool (all staked) → confirm no Queue card appears (since no validators are in queue/prestake)
4. Visually confirm the deposit pool data displays correctly and matches MegapoolSummaryCard styling

> [!NOTE]
> Testing with an actual node that has queued validators requires a recently-created megapool. If no such node is available at this time, the card simply won't render (correct empty-state behavior). The user can verify on their own node.
