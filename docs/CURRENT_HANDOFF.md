# PROJECT ANVIL — Current Handoff

Status: **ANVIL-07 C0 SUPPORTED / EVIDENCE HARDENING BEFORE READY**

This is a short takeover pointer, not a science archive. Exact experiment gates remain owned by the frozen preflight. Live Git and executable evidence override this file if they differ.

## Start here

1. Read `.anvil/project-state.json` as a **checkpoint claim**, not unquestioned truth.
2. Resolve live `main` and PR #12 from GitHub.
3. Verify PR #12 remains Draft and reconcile its live head against the last audited C0 source `1a31a69096f48d2eccb08ba88d683607f15d0ce3` before writing.
4. Verify Draft/core run `32166041812` belongs to that C0 source and completed successfully unless a newer post-C0 hardening run has superseded it.
5. Compare live `main` back to accepted material checkpoint `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`; classify later handoff/process commits separately from material physics.
6. Compare the active branch to live `main` / merge-base. Do not rebase merely to make the graph tidy.
7. Read both frozen ANVIL-07 preflight files from the live experiment branch.
8. Preserve the distinction between capability evidence, C0 physics evidence and post-C0 evidence hardening.

## Accepted vs active

**Accepted material truth:** through **ANVIL-06 / TORQUE-PATCH** at material checkpoint `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`.

**Active unaccepted work:** PR #12, `experiment/anvil-07-elastic-seam`, Draft. Pre-C0 frozen checkpoint: `af93a116ab59bf4d32ac58956cd9a719b86175cc`. Last audited C0 source: `1a31a69096f48d2eccb08ba88d683607f15d0ce3`.

Active verdict remains **SUPPORTED FOR FIXTURE**. The frozen one-dimensional seven-cell C0 has real solver evidence, but ANVIL-07 is not accepted project truth and ELASTIC-SEAM is not foundation.

## Evidence boundary

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

The frozen causal result strongly discriminates RIGID / ELASTIC / FREE and shows load deformation plus unload restoration. Exact metrics remain in the PR/run output and frozen preflight context; do not duplicate them into new documents without need.

## Post-C0 independent audit

The Research Compass reassessment is complete. No physical falsification was identified, but the PR is **not Ready yet** because several preflight-defined evidence details are weaker than they should be:

1. source-cell reordering and endpoint swapping are currently tested together; they must be isolated so two order-sensitive defects cannot cancel;
2. blank seam ID and invalid stiffness/damping domains are validated in implementation but lack direct adversarial test assertions;
3. motion locks/body damping/joint tuning are partly represented by harness receipts; where the pinned binding exposes direct getters, observe actual solver state instead of trusting self-report;
4. the amendment requires raw body-count reporting, while current C0 output only asserts body counts; reported left/right masses should come from compiled data rather than literals.

These are classified as **test/evidence hardening**, not a red physics result. Frozen physical thresholds and the C0 model must not be changed to address them.

## Exact next action

Keep PR #12 **Draft** and make one bounded post-C0 hardening pass only:

- split source-order invariance and endpoint-swap invariance into independent checks;
- add adversarial checks for blank ID, non-finite/non-positive stiffness and invalid damping;
- use direct Box3D runtime getters for motion locks, linear/angular damping and weld tuning if the exact JS binding exposes them; otherwise use the smallest adversarial locked-axis probe needed to verify the laboratory isolation;
- report compiled body counts and compiled/derived masses in the raw C0 diagnostics;
- do not alter the load schedule, physical coefficients, frozen gates or physical lowering merely to make the hardening green.

Then run Draft/core. Classify any red result before changing anything else.

If that hardening is green, only then consider marking PR #12 Ready. The current Ready workflow will rerun core plus launcher/Chromium regression and package an artifact. Treat that as **promotion/integration regression**, not new ELASTIC-SEAM physics evidence. No owner/manual gate is currently justified by the quantitative C0 claim unless a new human/browser uncertainty appears.

## Strategic direction after ANVIL-07 promotion

Do **not** start the next experiment until the ANVIL-07 promotion decision is closed.

Current post-C0 ranking:

1. **COMPLIANCE-RESOLUTION** — challenge whether local compliance retains honest physical meaning across different source resolutions/interface patch counts instead of becoming a spring-per-voxel ontology;
2. **ACTIVATE** — introduce transient control over already-earned persistent function semantics and force a composition checkpoint;
3. compliant **REBIND** — test continuity of compliant semantics through runtime repartition only after the simpler representation/scaling risk is understood.

COMPLIANCE-RESOLUTION currently leads because ANVIL explicitly treats cells as a dialect and allows authored/runtime representations to have different resolutions. The present `normalStiffnessNPerM` / `normalDampingNsPerM` are only supported as coefficients of the fixed C0 seam; resolution/scaling independence is an explicit non-claim.

After one such fundamental scaling/representation challenge, the next strategic step should force composition rather than add another isolated primitive unless new evidence changes the frontier.

## Do not do now

- do not treat ANVIL-07 as accepted truth yet;
- do not mark PR #12 Ready before the evidence-hardening pass resolves;
- do not merge merely because the original C0 is green;
- do not change frozen C0 gates or coefficients after seeing the result;
- do not add breakage, plasticity, TORQUE, ACTIVATE, contacts or generic Bond architecture to ANVIL-07;
- do not promote ELASTIC-SEAM into `src/foundation` / `docs/FOUNDATION.md`;
- do not start ANVIL-08 while PR #12 lifecycle is still open;
- do not call Ready Chromium regression direct evidence of elasticity.

## Stable project documents

- `AGENTS.md` — agent rules, truth hierarchy and takeover procedure.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — durable macro validation method, not a roadmap.
- `docs/FOUNDATION.md` — only already-earned reusable foundation boundaries.
- `AI_PROJECT_MEMORY.md` — concise accepted-state and strategic pointer.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.

A new conversation should use delta-audit. Reconstruct ANVIL-00…06 only if live Git exposes a contradiction that requires it.
