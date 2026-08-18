# PROJECT ANVIL — Current Handoff

Status: **COLD TAKEOVER / ANVIL-07 C0 SUPPORTED FOR FIXTURE**

This is a short takeover pointer, not a science archive. Exact experiment gates remain owned by the frozen preflight. Live Git and executable evidence override this file if they differ.

## Start here

1. Read `.anvil/project-state.json` as a **checkpoint claim**, not unquestioned truth.
2. Resolve live `main` and PR #12 from GitHub.
3. Verify PR #12 remains Draft and its live head is `1a31a69096f48d2eccb08ba88d683607f15d0ce3`, or reconcile any newer work before acting.
4. Verify Draft/core run `32166041812` belongs to that source and completed successfully.
5. Compare live `main` back to accepted material checkpoint `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`; classify later handoff/process commits separately from material physics.
6. Compare the active branch to live `main` / merge-base. Do not rebase merely to make the graph look tidy.
7. Read both frozen ANVIL-07 preflight files from the live experiment branch.
8. Preserve the distinction between capability evidence and the now-executed C0 physics evidence.

## Accepted vs active

**Accepted material truth:** through **ANVIL-06 / TORQUE-PATCH** at material checkpoint `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`.

**Active unaccepted work:** PR #12, `experiment/anvil-07-elastic-seam`, still Draft. Pre-C0 frozen checkpoint: `af93a116ab59bf4d32ac58956cd9a719b86175cc`. Current tested C0 source: `1a31a69096f48d2eccb08ba88d683607f15d0ce3`.

Active verdict: **SUPPORTED FOR FIXTURE**. This is bounded automated A/B/C evidence for the frozen one-dimensional seven-cell ELASTIC-SEAM C0. It is not project acceptance and it does not promote ELASTIC-SEAM into foundation.

## Capability evidence vs physics evidence

Capability-only checkpoint:

- source `58c4580702d4604f2effcdc501cde09d796becea`;
- Draft/core run `32151014026`;
- 40/40 PASS + production build PASS;
- proved only that pinned `box3d.js@0.0.2` / Box3D 0.1.0 exposes and can step the candidate weld-spring lowering path.

Pre-C0 hardening:

- source `af93a116ab59bf4d32ac58956cd9a719b86175cc`;
- run `32159805481`;
- 40/40 PASS + production build PASS;
- still no ELASTIC-SEAM physics evidence at that point.

Executed C0 physics:

- source `1a31a69096f48d2eccb08ba88d683607f15d0ce3`;
- Draft/core run `32166041812`;
- 42/42 PASS + production build PASS;
- candidate job skipped as intended while Draft.

Frozen 1000 N load / 180-step + 120-step unload discriminators:

- `RIGID`: loaded extension `0 m`, recovered `0 m`;
- `ELASTIC`: loaded extension `0.0999997854 m`, recovered `-0.0000023246 m`;
- `FREE`: loaded extension `26.96044415 m`, recovered `62.85781354 m`.

ELASTIC momentum and barycenter-drift guards also passed far inside the frozen limits.

## Canonical active experiment sources

On PR #12 branch:

- `docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT.md` — primary question, fixture, coefficients, frozen gates, controls, non-claims and stop rule;
- `docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT-AMENDMENT-01.md` — invariance, calibration and anti-hidden-help requirements;
- `tests/elastic-seam-binding-capability.mjs` — capability-only precheck;
- `src/experiments/anvil-07-elastic-seam.ts` — experiment-local C0 implementation;
- `tests/elastic-seam-runtime.test.mjs` — frozen source/compiler/real-solver C0.

## Exact next action

**Stop ANVIL-07 C0 enrichment.** Its frozen stop rule has been reached.

Perform the bounded Research Compass reassessment required by the preflight: state what ELASTIC-SEAM actually made more credible, attack component/solver-shadow drift, identify the strongest remaining uncertainty, and compare credible next falsifiers by information gain. Only then decide whether a Ready/candidate product gate is genuinely justified before promotion.

This is not permission to restart the project plan from scratch or to add adjacent features automatically.

## Do not do now

- do not treat ANVIL-07 as accepted truth yet;
- do not mark PR #12 Ready or merge merely because C0 is green;
- do not change the frozen C0 gates after seeing the result;
- do not add breakage, plasticity, TORQUE, ACTIVATE, contacts or generic Bond architecture to make ANVIL-07 richer;
- do not add browser/Forge/owner ceremony unless the reassessment identifies a real browser/human uncertainty;
- do not promote ELASTIC-SEAM into foundation without an explicit promotion decision;
- do not update `AI_PROJECT_MEMORY.md` as though ANVIL-07 were accepted before promotion.

## Stable project documents

- `AGENTS.md` — agent rules, truth hierarchy and takeover procedure.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — durable macro validation method, not a roadmap.
- `docs/FOUNDATION.md` — only already-earned reusable foundation boundaries.
- `AI_PROJECT_MEMORY.md` — concise accepted-state and architectural index.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.

A new conversation should use delta-audit. Reconstruct ANVIL-00…06 only if live Git exposes a contradiction that requires it.
