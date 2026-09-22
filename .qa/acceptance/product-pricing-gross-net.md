# Feature: 36 Product Pricing Root + Gross/Tax/Net Revenue

## Intent

Product pricing becomes an explicit source of truth (selling price, gross|net, VAT rate, pricing basis, currency) so the Cost Graph can show gross → tax normalization → net revenue without treating VAT as a cost (FR-008a, SCN-026).

## Happy path

- [ ] Gross 89 / VAT 19% → net 74.79 EUR with tests
- [ ] VAT not modeled as a cost node
- [ ] Legacy `price` products load without data loss
- [ ] Touched files: zero type escape hatches

## Edge Cases

- [ ] Legacy products with only `price` → treat as gross, taxRate 0 until set
- [ ] Missing/invalid tax rate → unresolved German message, never silent NaN

## Security Coverage

- F-02 Zod validation on pricing fields
- Out of scope: tax filing, FX, remote pricing columns beyond `price` mirror

## Implementation Notes

<!-- filled after coding -->
