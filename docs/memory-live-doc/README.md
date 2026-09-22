# GitHub Pages / local viewer — memory-live-doc

Canonical path: **`/memory-live-doc/`** (files: `docs/memory-live-doc/`).

## Default: local

From the **repo root**:

```bash
bash ~/.claude/skills/memory-live-doc/scripts/export-viewer-snapshot.sh
bash ~/.claude/skills/memory-live-doc/scripts/serve-viewer.sh
# open http://127.0.0.1:8765/memory-live-doc/
```

`file://` often blocks `fetch` of JSON — use the local static server (it serves `docs/` so the URL path is `/memory-live-doc/`).

GitHub Pages / Sites stays **off** until you explicitly opt in.

## Opt-in: GitHub Pages

```bash
bash ~/.claude/skills/memory-live-doc/scripts/github-pages-memory.sh status --write-config

# Only after the user asked to publish:
bash ~/.claude/skills/memory-live-doc/scripts/github-pages-memory.sh enable --confirm --write-config
# Private repo (Pages is often a public website):
bash ~/.claude/skills/memory-live-doc/scripts/github-pages-memory.sh enable --confirm --confirm-public --write-config
```

Policy: skill `references/github-pages-policy.md`.  
Theme: skill `references/theme-resolution.md`.  
Viewer tabs: Status, Features, Changes, Decisions, **Architecture** (Mermaid).

### Status meanings (short)

| status | Meaning |
|--------|---------|
| `not_enabled` | Pages off → default; enable only with `--confirm` |
| `memory_viewer_active` | `/docs` Pages + viewer present → push updates only |
| `pages_compatible_docs` | Pages already `/docs` → add viewer files; do not change settings |
| `pages_other` | Pages serves something else → **refused** (exit 2) |

## Manual enable (same end state)

1. Push `docs/memory-live-doc/` (with `data/*.json` snapshot) to your default branch.
2. Repo → **Settings** → **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or your default) → folder **`/docs`**
3. Open: `https://<user>.github.io/<repo>/memory-live-doc/`

Do **not** change Pages to `/docs` if the repo already publishes `/` or an Actions site.

Legacy `…/memory-live-doc/viewer/` redirects to `…/memory-live-doc/`.

## Data snapshot

`export-viewer-snapshot.sh` writes project, features, changes, current-state, decisions, **architecture**, **theme** under `docs/memory-live-doc/data/`. Keep the viewer self-contained.
