# Megapool Read Support — Walkthrough

## Files Created (3)

| File | Purpose |
|------|---------|
| [useNodeMegapool.js](file:///home/g082249/rocketsweep/web/src/hooks/useNodeMegapool.js) | Detects megapool via `RocketMegapoolFactory` |
| [useMegapoolDetails.js](file:///home/g082249/rocketsweep/web/src/hooks/useMegapoolDetails.js) | Fetches megapool state (split: metadata + progressive validators) |
| [MegapoolSummaryCard.js](file:///home/g082249/rocketsweep/web/src/components/MegapoolSummaryCard.js) | Summary row + validator DataGrid |

## Files Modified (2)

| File | Change |
|------|--------|
| [contracts.js](file:///home/g082249/rocketsweep/web/src/contracts.js) | Added 4 megapool contracts |
| [NodePage.js](file:///home/g082249/rocketsweep/web/src/pages/NodePage.js) | Conditional megapool rendering below Continuous Rewards |

## Bugfixes Applied

| Bug | Fix |
|-----|-----|
| Bond shows 1000 ETH | `depositValue` is milliETH → `parseUnits(value, 15)` |
| Console errors | try/catch in metadata query, `enabled` guards on hooks |
| Slow loading (200+ validators) | Split into metadata `useQuery` + individual `useQueries` (progressive) |
| Pubkey not clickable | Linked to `beaconcha.in/validator/{pubkey}` |

## Key Diffs

render_diffs(file:///home/g082249/rocketsweep/web/src/hooks/useMegapoolDetails.js)

render_diffs(file:///home/g082249/rocketsweep/web/src/components/MegapoolSummaryCard.js)

## Validation

- ✅ Production build: `npx react-scripts build` — compiled successfully, zero errors
