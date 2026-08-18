# PROJECT ANVIL — Current Handoff

Status: **COLD TAKEOVER / ANVIL-07 PRE-C0**

This is a short takeover pointer, not a science archive. Exact experiment gates belong to the active preflight; executed results belong to evidence logs.

## Start here

1. Read `.anvil/project-state.json` as a **checkpoint claim**, not unquestioned truth.
2. Resolve live `main` and PR #12 from GitHub.
3. Verify the active head is still `af93a116ab59bf4d32ac58956cd9a719b86175cc` or reconcile any newer live work before writing code.
4. Compare live `main` back to the accepted material checkpoint `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`; classify later commits instead of assuming they are material.
5. Read both ANVIL-07 preflight files from the live experiment branch.
6. Only then continue the declared C0.

Live Git and executable evidence override this file if they differ.

## Accepted vs active

**Accepted material truth:** through **ANVIL-06 / TORQUE-PATCH** at material checkpoint `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`.

**Active unaccepted work:** PR #12, `experiment/anvil-07-elastic-seam`, Draft/pre-C0. Frozen checkpoint head at handoff: `af93a116ab59bf4d32ac58956cd9a719b86175cc`.

Critical boundary: ANVIL-07 has **no implemented or executed ELASTIC-SEAM physics C0** at this checkpoint. The successful weld-spring capability precheck proves only that the pinned JS/Box3D path exposes and can step the candidate lowering primitives. Do not call this `ELASTIC-SEAM SUPPORTED`.

## Canonical active experiment sources

On PR #12 branch:

- `docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT.md` — owns the primary question, fixture, physical coefficients, frozen gates and non-claims.
- `docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT-AMENDMENT-01.md` — owns the additional pre-C0 invariance, calibration and anti-hidden-help requirements.
- `tests/elastic-seam-binding-capability.mjs` — capability-only binding evidence.

Capability checkpoint: source `58c4580702d4604f2effcdc501cde09d796becea`, Draft/core run `32151014026`, 40/40 PASS + production build PASS. Amendment/hardening run `32159805481` also succeeded.

## Exact next action

Keep PR #12 Draft and implement **only** the smallest experiment-local compiler/runtime/test path needed to execute the frozen three-way C0:

`RIGID` vs `ELASTIC` vs `FREE`, including the declared load and unload/recovery phases and required raw diagnostics.

Classify any red result before changing implementation or thresholds.

## Do not do before C0 resolves

- do not mark PR #12 Ready;
- do not merge it;
- do not loosen frozen gates merely to get PASS;
- do not add browser/Forge/owner ceremony unless a new browser/human uncertainty appears;
- do not add breakage, plasticity, TORQUE, ACTIVATE, contacts or generic Bond architecture;
- do not promote ELASTIC-SEAM into foundation.

## Stable project documents

- `AGENTS.md` — agent rules, truth hierarchy and takeover procedure.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — durable macro validation method, not the current roadmap.
- `docs/FOUNDATION.md` — only already-earned reusable foundation boundaries.
- `AI_PROJECT_MEMORY.md` — concise accepted-state and architectural index.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.

The new conversation should not reconstruct ANVIL-00…06 from chat history unless a live inconsistency requires a deeper audit. If the fingerprint above is intact, continue from ANVIL-07 C0.
