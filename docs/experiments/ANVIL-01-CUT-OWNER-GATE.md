# ANVIL-01 / CUT — Owner Validation Gate

Status: **OWNER ACCEPTED FOR THE BOUNDED CUT CLAIM**

This file records Evidence Class **E — Owner Manual Validation**. Owner acceptance is tied to the exact artifact that was actually inspected; later Forge/tooling changes do not retroactively redefine that evidence.

## Exact owner-tested artifact — canonical acceptance evidence

The owner tested this exact package:

- branch: `experiment/anvil-01-cut`;
- source/package head: `9c4b3372ad60e20ade2d7d9a31dd373a356263d0`;
- GitHub Actions run: `32073741628`;
- artifact: `anvil-browser-laboratory`;
- artifact ID: `9302675515`;
- artifact SHA-256: `34c0365c403a229e5c4e53a304d23d331e0872601850a0d190f318a98340de40`;
- artifact expiry: `2026-08-31T21:58:49Z`.

CI for that exact head passed locked dependency installation, strict TypeScript and solver/compiler/foundation tests, production build, packaged Windows launcher self-test, real Chromium evidence, and artifact upload.

### Real owner environment and verdict

Owner report received 2026-08-17:

- verdict: **ACCEPT**;
- observed CUT runs: **10**;
- automated evidence shown by the tested build: **PASS**;
- source cells: `51 → 51`;
- runtime bodies: `1 → 2`;
- source add/remove: `0 / 0`;
- viewport: `1920×911 @ DPR 1`;
- browser: Chrome `151` on Windows 10;
- screenshot and screen recording were supplied as additional visual evidence in the owner conversation.

Owner observation, paraphrased: the visualization visibly begins with one runtime COM marker and after the split has two; the event was repeated multiple times. Review of the supplied recording did not reveal an obvious whole-scene reset, large teleport, full stop, explosive velocity jump, disappearing matter, or immediate post-split numerical runaway. A 30 FPS recording is not evidence that sub-frame or microscopic numerical errors are absent; the numeric gates cover that class of evidence.

**Acceptance conclusion:** the manual gate is satisfied for the experiment's declared bounded claim. Repeating the same owner test is not required merely to accumulate more repetitions.

## What was accepted

The tested production-browser path demonstrates, for the bounded deterministic fixture:

1. one moving + rotating Box3D runtime body is warmed up in the real solver;
2. the same 51 persistent authored cells survive a topology change;
3. the disposable runtime changes `1 body → 2 bodies` at a solver-step boundary;
4. replacement body state is initialized from the tested rigid velocity field;
5. eight browser falsification gates pass:
   - persistent source identity;
   - mass-preserving 1→2 split;
   - nontrivial rotating fixture;
   - runtime mass continuity;
   - child pose continuity;
   - rigid velocity field;
   - total linear momentum;
   - post-transaction solver step;
6. the two replacement bodies remain live and visibly simulated after the transaction.

Owner ACCEPT means the manual behavior was acceptable **within this scope**. It is not a blanket approval of future CUT variants or Forge versions.

## Evidence boundary

The accepted result still does **not** demonstrate:

- in-place body replacement inside one persistent populated Box3D world;
- migration of Box3D contact-manifold internals;
- external joint/constraint state transfer;
- arbitrary cut surfaces/topologies or fracture geometry;
- damage propagation, toughness, debris, plasticity;
- deformable/compliant matter;
- full angular-momentum or rotational-energy conservation for arbitrary rotated matter;
- a generic Bond/Joint/Constraint ontology.

CUT remains a continuity experiment, not a destruction roadmap.

## Forge V0.1 hardening after owner acceptance

The first real owner test also exposed validation-workflow weaknesses in Forge V0:

- reports did not identify the exact source/build/run;
- missing DOM evidence could fall back to expected successful text;
- ACCEPT was not structurally guarded against incomplete provenance/evidence;
- only the happy report path had a browser test;
- the launcher did not validate a package manifest;
- the fixture was unnecessarily small in the fixed viewport.

These are tooling/evidence defects, not failures of the already accepted CUT transaction.

They are addressed separately on:

- branch: `foundation/forge-cut-field-trial`;
- draft PR: `#3`;
- validated proposal head before this documentation grounding: `fbe08910f9ac5423b89210b80541b38a7f4ce432`;
- PR CI run: `32076544898`;
- artifact ID: `9303653778`;
- artifact SHA-256: `2773c2aa324613bb682dd2296bf4e1356c4be06a8567b9e376206ce82a75b8e9`.

That run passed:

- strict TypeScript;
- **20/20** solver/compiler/foundation tests;
- production Vite build;
- CI-generated `forge-gate.json` provenance (`source SHA`, actual checkout SHA, ref, event, run, artifact name);
- packaged PowerShell/.NET launcher manifest self-test;
- **5/5** real Chromium tests, including deliberate negative cases where required evidence disappears or provenance is local/unverified;
- artifact upload.

Forge V0.1 therefore has **automated support as a field-trial candidate**. It is not yet owner-accepted as a mature validation system and is not a universal cross-project framework.

### Forge V0.1 policy

For owner acceptance from a canonical package:

- required evidence must exist; missing evidence is `UNAVAILABLE/INVALID`, never a successful fallback;
- canonical `ACCEPT` is disabled unless automated CUT status is PASS, all required gates are present, and build provenance is a GitHub Actions artifact;
- `REJECT` and `INCONCLUSIVE` remain possible when evidence/provenance is broken;
- the owner report includes exact source SHA, actual CI checkout SHA, source ref, CI event/run, artifact name, Forge revision, session ID, browser, viewport and timestamp;
- local development builds are useful for engineering but cannot masquerade as canonical owner acceptance packages.

The next useful validation of Forge itself should come naturally from the next real ANVIL owner gate rather than by repeatedly re-testing accepted CUT only to validate tooling polish.
