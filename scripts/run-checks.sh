#!/usr/bin/env bash
# CostMyBusiness quality gate — lint, typecheck, unit tests, build, dependency audit
set -euo pipefail

echo "==> lint"
npm run lint

echo "==> typecheck"
npm run typecheck

echo "==> test"
npm test

echo "==> build"
npm run build

echo "==> audit (high+)"
npm audit --audit-level=high

echo "checks: OK"
