# Megapool Read Support (Phase 1 — Saturn 1)

Add read-only megapool detection and display to Rocketsweep. Purely additive — no changes to existing minipool code or UI.

## Proposed Changes

### Contracts Registry

#### [MODIFY] [contracts.js](file:///home/g082249/rocketsweep/web/src/contracts.js)

Add 4 imports + entries for `RocketMegapoolFactory`, `RocketMegapoolManager`, `RocketMegapoolDelegate`, and `RocketMegapoolPenalties`. The Delegate entry has no global address (dynamic per-node). The Factory/Manager/Penalties have fixed addresses.

---

### Data Hooks

#### [NEW] [useNodeMegapool.js](file:///home/g082249/rocketsweep/web/src/hooks/useNodeMegapool.js)

Uses **two** `useK.RocketMegapoolFactory.Read` calls:
- `getMegapoolDeployed(nodeAddress)` → `bool`
- `getExpectedAddress(nodeAddress)` → `address`

Returns `{ hasMegapool, megapoolAddress, isLoading }`. This approach is more reliable than checking for `address(0)` from a manager since the Factory has both an existence check and an address lookup.

#### [NEW] [useMegapoolDetails.js](file:///home/g082249/rocketsweep/web/src/hooks/useMegapoolDetails.js)

Follows the exact `useMinipoolDetails.js` pattern:
- `ethers.Contract` with `RocketMegapoolDelegate.abi` at the dynamic megapool address
- `useWebSocketProvider()` for provider
- `useQuery` for caching (query key: `["MegapoolDetails", megapoolAddress]`)
- Sequential calls (no `Promise.all`) for rate-limit friendliness
- Rate-limit windowing: first 50 validators load immediately, rest spread over 25s

Calls all view functions specified in the brief (validator counts, bond, debt, rewards, balances, etc.) and iterates `getValidatorInfoAndPubkey(i)` for each validator (0-indexed based on ABI analysis — `uint32 validatorId` starts at 0).

> [!NOTE]
> Validator indexing (0-based vs 1-based) will be verified during testing. If `getValidatorInfoAndPubkey(0)` fails on a real megapool, the loop will be adjusted to start from 1.

---

### UI Components

#### [NEW] [MegapoolSummaryCard.js](file:///home/g082249/rocketsweep/web/src/components/MegapoolSummaryCard.js)

Extracted card component with:
- **Header**: "Megapool" with `AllInclusive` icon (matching Continuous Rewards style)
- **Summary row**: Active/total validator counts, Bond (`<CurrencyValue>`), Pending Rewards, Debt (conditional)
- **Validators DataGrid**: Columns for ID, truncated Pubkey, Status (derived via helper), Bond (ETH), Express (Chip)
- Uses `DataToolbar` for the toolbar, matching `NodeContinuousRewardsTable.js` DataGrid patterns
- Loading state: `CircularProgress` spinner

All colors use MUI theme tokens — no hardcoded colors. Both dark/light modes supported.

#### [MODIFY] [NodePage.js](file:///home/g082249/rocketsweep/web/src/pages/NodePage.js)

Adds 2 hook imports and calls. Conditionally renders `<MegapoolSummaryCard>` below the Continuous Rewards table when `hasMegapool === true`.

**No existing code is modified** — only additions at the end of the grid.

---

## Verification Plan

### Automated Tests
- **Build verification**: `cd web && npm start` — app must compile with zero errors.

### Manual Verification
1. Open the app in a browser and navigate to a known node page (e.g. an existing minipool node). Verify:
   - Existing minipool UI is unchanged
   - No megapool section is rendered (since the node has no megapool)
   - No console errors from the new hooks

2. *(If a megapool test node address is available)*: Navigate to a megapool node and verify the megapool card renders with validator data.

> [!IMPORTANT]
> Since Saturn 1 may not yet be on mainnet, could you provide a test node address that has a megapool? If none available on mainnet, we can verify the conditional rendering (hidden for non-megapool nodes) and the build, and revisit live data verification when megapools are available.
