# Feature: 13 Marketing funnels stages costs and acquisition metrics

## Intent

Marketing-Funnels mit Stages, Media-Spend und Operating Costs liefern CPC/CPA/CAC inkl. Media-only vs Fully-loaded (FR-009–011, FR-014, SCN-008, SCN-009).

## Happy path

- [ ] Marketing funnel CRUD with ordered stages + conversion rates (German UI on product)
- [ ] Media-only CPA/CAC distinguishable from fully loaded marketing CAC
- [ ] Vitest fixture for Google-Ads-like funnel metrics
- [ ] Touched files: zero type escape hatches (typed-strict / Boy Scout)

## Edge cases

- [ ] Missing clicks → CPC unresolved (not silent zero)
- [ ] Zero conversions → CPA/CAC unresolved
- [ ] Zero media spend with clicks → CPC unresolved with German warning (not fake efficiency)

## Regression

- [ ] Product workbench still opens
- [ ] Local businesses/products unchanged behavior
- [ ] `npm run checks` green

## Security Coverage

- F-02: Zod validate funnel payloads; numeric bounds; labels as text
- Out of scope: sales funnel (#14), ad-network sync, auth

## Assumptions

- Funnels persist in local `cmb.v1` snapshot scoped by productId
- Funnel filter of full product P&L is #14

## Implementation Notes

<!-- filled after coding -->

## Implementation Notes
- `src/features/funnels/**`: domain, calculateMarketingMetrics (media-only vs fully-loaded), CRUD UI
- Local snapshot `funnels[]` + FunnelRepository on LocalRepositories
- Product detail hosts MarketingFunnelsPanel
- Vitest Google Ads fixture + edge cases for missing clicks / zero spend
