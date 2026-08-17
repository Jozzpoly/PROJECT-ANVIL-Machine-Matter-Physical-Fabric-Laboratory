# ANVIL-01 / CUT — Owner Validation Gate

Status: **OWNER ACCEPTED FOR THE BOUNDED CUT CLAIM**

This file records Evidence Class **E — Owner Manual Validation**. Owner acceptance is tied to the exact artifact actually inspected. Later Forge/tooling work cannot retroactively redefine that evidence.

## Exact owner-tested artifact — canonical acceptance evidence

- branch: `experiment/anvil-01-cut`;
- source/package head: `9c4b3372ad60e20ade2d7d9a31dd373a356263d0`;
- GitHub Actions run: `32073741628`;
- artifact: `anvil-browser-laboratory`;
- artifact ID: `9302675515`;
- artifact SHA-256: `34c0365c403a229e5c4e53a304d23d331e0872601850a0d190f318a98340de40`;
- artifact expiry: `2026-08-31T21:58:49Z`.

That exact head passed locked dependency installation, strict TypeScript and solver/compiler/foundation tests, production build, packaged Windows launcher self-test, real Chromium evidence and artifact upload.

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
- screenshot and screen recording supplied in the owner conversation.

Review of the recording did not reveal an obvious whole-scene reset, large teleport, full stop, explosive velocity jump, disappearing source matter or immediate post-split runaway. A 30 FPS recording is not evidence that microscopic/sub-frame numerical error is absent; numeric gates cover that class of evidence.

**Owner gate conclusion:** satisfied for the declared bounded claim. Repeating the same CUT simply to accumulate repetitions is unnecessary.

## What was accepted

For the deterministic browser fixture:

1. one moving + rotating Box3D runtime body is warmed up in the real solver;
2. the same 51 persistent authored cells survive the topology change;
3. disposable runtime changes `1 body → 2 bodies` at a solver-step boundary;
4. replacement state uses the tested rigid velocity-field transfer;
5. eight browser falsification gates pass: identity, topology, rotation sensitivity, mass, pose, rigid velocity field, total linear momentum and post-transaction solver step;
6. both replacement bodies remain live after the transaction.

Owner ACCEPT is scoped to this fixture/artifact. It is not blanket approval of future CUT variants or Forge versions.

## Evidence boundary

The accepted result still does **not** demonstrate:

- in-place body replacement inside one persistent populated Box3D world;
- migration of Box3D contact-manifold internals;
- external joint/constraint state transfer;
- arbitrary cut surfaces/topologies or fracture geometry;
- damage propagation, toughness, debris or plasticity;
- deformable/compliant matter;
- full angular-momentum or rotational-energy conservation for arbitrary rotated matter;
- a generic Bond/Joint/Constraint ontology.

CUT remains a continuity experiment, not a destruction roadmap.

## Forge V0.1 — hardening learned from the real owner gate

The first Forge V0 field trial succeeded end-to-end on the owner's Windows machine but exposed real evidence-workflow defects:

- report lacked exact source/build/run identity;
- missing DOM evidence could fall back to expected successful strings;
- ACCEPT was not structurally guarded against incomplete provenance/evidence;
- coverage was predominantly happy-path;
- launcher did not validate a package identity manifest;
- CUT framing was visually small.

Forge V0.1 fixes these without changing CUT transfer physics, thresholds, compiler semantics or Box3D transaction logic.

### Integrated Forge V0.1 checkpoint

Hardening was developed on `foundation/forge-cut-field-trial` and merged by PR `#3` into `experiment/anvil-01-cut`.

Latest exact pre-merge validation:

```text
proposal head     0f8533a7641608960dc504642644664cf5f9f8ec
PR checkout       04a59b56f9bbc42e8c8b87f819ed342662e1d3bf
validated tree    2486a339388f69b26bd3c32d7edb9167c29f86ac
Actions run       32076959012
artifact ID       9303786754
artifact SHA256   27150515907128f6f5e60eb21c52fc04fd2d62211797defe4a9c10d965f41b51
```

The actual integration merge is:

```text
experiment head   95dabaf2d28439d82550566d83cfb1c221c09130
integrated tree   2486a339388f69b26bd3c32d7edb9167c29f86ac
```

The PR checkout and actual merge therefore have the **same Git tree SHA**. The exact content integrated into the CUT branch is the content that passed the final PR CI; only commit identity/parents differ.

Final PR #3 validation passed:

- strict TypeScript;
- **20/20** solver/compiler/foundation tests;
- production Vite build;
- CI-generated `forge-gate.json` recording proposal source SHA and actual checkout SHA separately;
- packaged PowerShell/.NET launcher manifest self-test;
- **7/7** real Chromium tests;
- artifact upload.

Negative browser gates explicitly prove:

- missing required metric → ACCEPT disabled and evidence becomes unavailable/failing;
- wrong required metric value → ACCEPT disabled;
- if evidence becomes inconsistent after ACCEPT, the selected ACCEPT is revoked and copy disabled;
- duplicate/corrupted required gate set → ACCEPT disabled;
- local/unverified embedded provenance → ACCEPT disabled.

The first hardening implementation at `4270162b...` correctly failed strict TypeScript (`acceptButton` possibly null). Strictness was not weakened; implementation was fixed and revalidated. Preserve that negative evidence.

### Provenance model — deliberately two-sided

`forge-gate.json` is an **embedded identity claim**, not a cryptographic trust root. Therefore Forge says `BUILD IDENTIFIED`, not `BUILD VERIFIED`.

Owner-side flow:

1. Forge loads the embedded source SHA/ref, CI event/run, checkout SHA, artifact name and Forge revision;
2. local integrity gates must be complete and consistent before ACCEPT can be selected;
3. the report explicitly says `external provenance check: REQUIRED AFTER HANDOFF`;
4. owner pastes the report into the project conversation;
5. agent cross-checks the reported run/SHA/artifact live on GitHub and obtains GitHub's artifact digest.

This gives exact provenance without asking the owner to read Actions, SHA or artifact metadata manually.

Forge V0.1 status is **AUTOMATED-VALIDATED FIELD-TRIAL BASELINE**. It has not yet earned the claim of a mature universal validation system. Its next useful real test should happen naturally on the next ANVIL owner gate, not by repeatedly rerunning accepted CUT just to test Forge itself.
