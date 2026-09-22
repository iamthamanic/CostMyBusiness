# Composition Gate — supabase-auth-rls
**Verdict:** SKIPPED
**HEAD:** WORKTREE
**Reason:** Auth session → repository swap is single UI hop; RLS enforced in DB policies (no app-side fan-out).
