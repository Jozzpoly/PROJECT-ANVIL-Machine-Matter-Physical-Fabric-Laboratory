# ANVIL Studio — Pre-Implementation Handoff Audit

Status: **FINAL SEAL CANDIDATE — full repository/workflow candidate gate still required on the exact seal head before merge**

Work type: maintenance / takeover hardening.

Audit base: `main@a9b5381d5535e55fc0f91b37599d05c5be4f6d28`.

This is a one-time historical audit record. It is **not** a new roadmap, scientific claim, product redesign or implementation stage. Live Git and the current handoff/state remain authoritative after this seal.

---

## 1. Audit question

Before handing ANVIL Studio implementation to a fresh orchestrator, independently answer:

> **Is the repository, evidence chain, workflow, documentation and implementation handoff coherent enough that a new agent can start I1 without reconstructing project history, inheriting stale work, silently changing accepted science/product intent, or forcing the Owner back into tooling/process work?**

The audit deliberately treats prior handoff prose and prior orchestrator confidence as claims to verify rather than truth by declaration.

---

## 2. Live repository fingerprint at audit start

Verified against GitHub:

- repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`;
- visibility: public;
- default branch: `main`;
- live base: `a9b5381d5535e55fc0f91b37599d05c5be4f6d28`;
- base message: `Ground C6 Studio implementation readiness`;
- no open pull requests;
- server-side `main` branch protection is absent;
- historical experiment/foundation/workbench/design/spike branches remain present.

Branch-residue interpretation:

- branch existence or naming is **not** active-work evidence;
- historic branches are retained evidence/donor refs unless an open PR or current state/handoff explicitly activates one;
- repository hygiene previously classified the old branch set, and the connected GitHub interface did not provide a supported branch-ref deletion path during that closure;
- agent-side exact-head, merge-base and changed-path audits remain mandatory because server-side branch protection is absent.

At the handoff seal there must be **no active implementation PR/branch**. `I1 / FIRST PHYSICAL LOOP` is selected but not active until the next orchestrator creates it from the exact live sealed `main`.

---

## 3. Accepted scientific chain audit — ANVIL-00…10

The accepted scientific epoch is present in live Git history rather than only conversation memory.

| Stage | Project disposition | PR / live evidence status | Boundary retained |
| --- | --- | --- | --- |
| ANVIL-00 / COLLAPSE | accepted | PR #1 merged | persistent authored matter → reduced disposable rigid runtime; no runtime IDs in source |
| Foundation kernel | accepted neutral foundation | PR #2 merged | solver-neutral spatial/runtime/provenance/measurement boundaries only |
| ANVIL-01 / CUT | accepted bounded fixture | PR #4 merged; exact owner artifact accepted | topology replacement + bounded rigid-field transfer; not generic fracture |
| ANVIL-02 / BEARING | accepted bounded fixture | PR #5 merged; exact owner artifact accepted | local authored interface → passive revolute relation; not generic Relation ontology |
| Human owner-copy hardening | accepted maintenance | PR #6 merged | plain-language owner surface; technical provenance remains under the hood |
| ANVIL-03 / REBIND | accepted bounded fixture | PR #7 merged; exact owner artifact accepted | persistent local relation reconstructed across bounded runtime topology rebuild |
| Lean evidence workflow | accepted process | PR #8 merged | Draft/core vs Ready/candidate; Owner gate conditional |
| ANVIL-04 / LOAD-REBIND | accepted bounded fixture | PR #9 merged | loaded cold relation reconstruction; no generic joint-cache migration claim |
| ANVIL-05 / TORQUE | accepted bounded fixture | PR #10 merged | signed persistent active intent causes work through BEARING |
| ANVIL-06 / TORQUE-PATCH | accepted bounded fixture | PR #11 merged | local source-face active intent resolves BEARING without authored bearingId |
| ANVIL-07 / ELASTIC-SEAM | accepted bounded fixture | PR #12 merged | one bounded local compliant seam deforms/restores |
| ANVIL-08 / COMPLIANCE-RESOLUTION | accepted bounded fixture | PR #13 merged | exact 2× 1D authored refinement preserves area-normalized compliance |
| ANVIL-09 / ACTIVATE | accepted bounded fixture | PR #14 merged | runtime-only OFF/ON/OFF; fresh runtime defaults OFF |
| ANVIL-10 / TORQUE-PATCH-REBIND | accepted bounded fixture | PR #15 merged | unchanged local patch re-lowered onto rebound/current BEARING; stale action rejected |

The canonical experiment directory contains the corresponding preflight/evidence/owner records where each experiment requires them. ANVIL-00 uses its original experiment record; later experiments use explicit preflight/evidence records. Exact numeric telemetry belongs in those canonical files and PR/run provenance, not in this audit.

### Scientific verdict

**PASS.** Accepted science remains **through ANVIL-10 only**. No ANVIL-11 is active, inherited or implied by Studio implementation.

The audit found no evidence that P04/P05/P06/C6 promoted a new scientific capability, Foundation ontology or runtime semantics.

---

## 4. Epoch I closure / repository governance audit

The post-ANVIL-10 closure chain is explicit and merged:

- PR #16 — truth/governance reset;
- PR #17 — infrastructure hygiene;
- PR #18 — repository/branch hygiene audit;
- PR #19 — Epoch I final freeze and cold handoff.

Durable rules remain coherent:

- `AGENTS.md` owns truth hierarchy, work classification, PR lifecycle and anti-momentum review;
- `docs/EXPERIMENT_PROTOCOL.md` owns bounded experiment/evidence lifecycle;
- `docs/RESEARCH_COMPASS.md` owns long-horizon invariants and macro anti-drift method;
- `docs/FOUNDATION.md` owns only already-earned reusable boundaries;
- current live work belongs in `.anvil/project-state.json` + `docs/CURRENT_HANDOFF.md`, not historical experiment documents.

### Governance verdict

**PASS with one documentation completeness correction:** Foundation correctly refuses generic relation/function/surface/entity ontology, but its explicit experiment-local list had stopped at ANVIL-06. This seal updates the list through ANVIL-10 without promoting those concepts.

---

## 5. Workbench / negative product evidence audit

Post-Epoch-I integration deliberately attempted product reality rather than assuming technical capability creates value:

- PR #20 / W0 Design Gate — merged design contract;
- PR #21 / H0 handoff seal — merged;
- PR #22 / W1 integration — technically qualified, then **CLOSED UNMERGED** after Owner verdict:
  - **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**.

The exact failure is retained as negative evidence:

- the physical/integration path worked;
- presentation was too raw, unreadable and workflow-heavy;
- AUTHORED/RUNTIME/BOTH evidence-gate UI is not the product direction;
- technical qualification alone does not constitute Owner value.

### Workbench verdict

**PASS as negative evidence.** W1 is not silently treated as accepted product architecture, and its executable code is not in `main`.

---

## 6. Studio engineering-proof audit

### P04 — boundary proof

PR #23 closed unmerged after PASS. It established, for the first active-bearing Studio envelope:

- accepted Matter + Bearing + TorquePatch + Activate can be orchestrated through thin app-level adapters;
- renderer-neutral presentation can avoid Box3D handle leakage;
- compiled identity requires authored-generation scope;
- runtime identity requires runtime-session scope;
- multiple individually valid Bearings can remain authored while joint composition is `UNSUPPORTED`;
- simulation-profile compatibility can remain separate from source validity;
- no GenericRuntime/GenericEntity/Foundation refactor was required.

### P05 — technology proof

PR #24 closed unmerged after PASS. It established:

- Three.js and Babylon could both satisfy the renderer proof;
- Three.js selected for v0 boundary fit and integration/visual-control friction;
- React can own sparse editor chrome while imperative Three owns hot renderer/runtime state;
- exact cell + face picking works;
- runtime snapshots can drive visible transforms;
- draft/presentation manipulation can remain source-immutable;
- React render count need not follow renderer frames.

The selected first-envelope stack is:

- existing Vite + TypeScript substrate;
- existing Box3D/ANVIL APIs;
- Three.js/WebGL2 presentation;
- React sparse editor shell;
- imperative Three controller outside React hot state.

P05 donor implementation and test inspector remain unmerged. Default OrbitControls/TransformControls semantics are not product authority.

### Engineering-proof verdict

**PASS.** P04/P05 reduce implementation risk without polluting accepted runtime/product source.

---

## 7. Product Design audit — P06 recovery through acceptance

P06 attempt #1 / PR #26 was explicitly classified:

- **INVALID / INTERRUPTED**;
- closed unmerged;
- generated dashboard-heavy concept rejected;
- its written brief donor-only, not canonical Product Design.

Recovered P06 then grounded each accepted layer separately:

- PR #27 — C5A Product Behavior;
- PR #28 — C5B Product Interaction;
- PR #29 — P06.7A Product Surface Architecture;
- PR #30 — P06.7B Visual Language;
- PR #31 — P06.8 Complete Product Contract.

Live `docs/studio/` contains only the accepted C5A/C5B/7A/7B/P06.8/C6 authorities. The rejected P06 attempt file is not present on `main`.

Accepted product direction remains:

- one long-lived world-first 3D laboratory;
- `BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE/TRACE → STOP → MODIFY → RUN AGAIN`;
- authored / compiled / runtime / render identities remain distinct;
- runtime disposable;
- world/matter is primary, UI peripheral;
- `WORLD CANVAS + PERIPHERAL ISLANDS`;
- `QUIET PHYSICAL WORKSHOP`;
- direct authoring near matter rather than ID/forms-first workflow;
- direct input: LMB interaction, MMB orbit, Shift+MMB pan, wheel zoom;
- continuous manipulation is relative/no-jump;
- `INVALID != UNSUPPORTED`, and ordinary incomplete construction is not an error;
- diagnostics/provenance appear on request rather than as a permanent dashboard;
- Owner value must be earned by the running product.

### Product Design verdict

**PASS.** No competing live Product Design authority was found.

---

## 8. C6 implementation-readiness audit

PR #32 merged docs/meta-only and records **C6 PASS — IMPLEMENTATION READY**.

The live C6 implementation contract correctly freezes:

- product entry initially at `/?studio=1` while historical root/routes remain intact;
- route-scoped historical CSS before Studio;
- production React/ReactDOM/Three dependency transaction only when I1 starts;
- one app-owned `src/studio/` integration vertical;
- `StudioSource` = Matter + Bearing marks + TorquePatch marks, provisional/app-local;
- monotonic in-memory `sourceGeneration` on every authored commit;
- compiled refs generation-scoped;
- runtime refs session-scoped;
- render refs presentation-only;
- internal classifier axes: authored validity / composition support / run readiness;
- first executable runtime deliberately limited to exactly one valid Bearing + one valid TorquePatch through accepted ActivatePhysics;
- no GenericRuntime;
- one Draft I1 through the first physical loop before product-direction merge;
- early O1 Owner Reality Gate before I2 depth.

### C6 verdict

**PASS.** No unowned fundamental product decision was found that must be solved before code starts.

---

## 9. Executable ancestry proof

The strongest repository-level check compares the last fully qualified executable merge with the C6 audit base.

Base executable checkpoint:

`5aaa5eca256bf64f83fa7949f05d29db25b894e8`

Audit base:

`a9b5381d5535e55fc0f91b37599d05c5be4f6d28`

GitHub compare result:

- current branch is 57 commits ahead / 0 behind;
- changed paths across the entire interval are only:
  - `.anvil/project-state.json`;
  - `AGENTS.md`;
  - `AI_PROJECT_MEMORY.md`;
  - `README.md`;
  - closure/current handoff documentation;
  - Workbench design documents;
  - Studio Product Design / C6 documents;
- **no `src/**`, `tests/**`, `package*.json`, TypeScript config, workflow, launcher/artifact config or other executable path changed.**

Therefore the executable code under the current C6 `main` is the same qualified executable baseline, plus documentation/governance history only.

### Independent full baseline qualification

Workflow run `32372701068` was re-opened during this audit rather than trusted from handoff prose.

Core job independently confirms:

- canonical Node `24.16.0` / npm `11.13.0`;
- `npm ci` PASS;
- strict TypeScript PASS;
- automatic discovery of 29 Node test files;
- **53 tests / 53 PASS / 0 fail / 0 skipped**;
- production Vite build PASS;
- exact staging artifact produced.

Candidate job independently confirms:

- exact staged artifact digest revalidated after download;
- packaged PowerShell launcher self-test PASS;
- real Chromium regression **19/19 PASS**;
- final artifact produced with ID `9407794380` and digest `sha256:4280b53915286832c68eb2b6fa329c2b8a8d153a972595abc8893e2c117f786d`.

These are whole-baseline regression facts. They do not create new ANVIL-00…10 physics claims.

### Executable baseline verdict

**PASS.** No silent executable drift was found after qualification.

---

## 10. Current toolchain / workflow audit

Current production repository still intentionally contains:

- `box3d.js@0.0.2`;
- Box3D runtime expectation `0.1.0` in accepted adapters;
- Vite `8.1.5`;
- TypeScript `7.0.2`;
- Playwright `1.61.1`;
- Node `24.16.0`;
- npm `11.13.0` package manager contract.

React and Three are **not** yet production dependencies; C6 deliberately assigns that transaction to I1.0 after the P05 technology proof.

Current CI correctly separates two speeds:

### Draft/core

- exact proposal checkout;
- canonical Node;
- locked install;
- strict TypeScript + complete Node/real-Box3D suite;
- production build.

### Ready/candidate

- downloads exact core-staged build;
- launcher self-test;
- real Chromium regression;
- owner artifact.

Documentation-only pushes to main are ignored, but pull requests still execute CI. The final seal intentionally uses a non-draft exact PR candidate as a one-time workflow/transport smoke test.

### Workflow verdict

**PASS.** No new CI system is required before I1. The final seal still requires one fresh exact-head full candidate run to prove the current workflow/transport remains operational immediately before takeover.

---

## 11. Documentation drift found and corrected by this seal

The audit found three genuine but non-executable drifts:

### D1 — README stale post-Epoch-I pointer

`README.md` still described Physical Fabric Workbench/W0 as the selected next stage even though W1 had since failed product value and Studio P06/C6 had completed.

Correction: README becomes a stable current entry point to Studio/C6/I1 while retaining W1 as historical negative evidence and continuing to defer exact live state to state/handoff.

### D2 — machine state still looked like C6 grounding was active

After PR #32 merged, `.anvil/project-state.json` still described C6 as `activeWork / pass-grounding`.

Correction: final sealed state records **no active material work / no active PR**, C6 completed, I1 selected-not-active.

### D3 — Foundation experiment-local list incomplete

`docs/FOUNDATION.md` correctly refused promotion of generic semantics, but its explicit list stopped at ANVIL-06.

Correction: list ANVIL-07 ELASTIC-SEAM, ANVIL-08 COMPLIANCE-RESOLUTION, ANVIL-09 ACTIVATE and ANVIL-10 TORQUE-PATCH-REBIND as **earned bounded experiment semantics that remain experiment-local**.

No code, physics, thresholds, evidence records or Foundation implementation changes are required.

---

## 12. Owner-intent alignment audit

The final product/implementation plan was checked against the repeated project requirement that implementation should serve the Owner's actual experience rather than force the Owner to participate in engineering ceremony.

The sealed plan preserves:

### Direct agency

The Owner's primary task is to work with matter in the world:

`build → give local meaning → run → observe → change → run again`

not to operate an evidence dashboard, type source IDs, inspect logs or run developer commands.

### Visual/spatial causality

Physical differences must be shown primarily in the 3D world. UI supports the world rather than replacing it with telemetry.

### Stable manipulation feel

The P06.8A no-jump rule makes continuous manipulation relative to the grabbed state. Library defaults do not have authority to change that.

### Technical depth without technical burden

Compiler/runtime/provenance truth remains available through Inspect/Trace/Details, while normal product work remains concise and spatial.

### Early reality feedback

I1 intentionally reaches an exact Owner artifact at the first complete physical loop before investing in deeper investigation/fidelity systems.

A green CI result cannot substitute for the O1 Owner judgement: targeting feel, causal clarity, quietness and creative pull remain human evidence.

### No forced programming/tooling role for Owner

The candidate delivery path must let the Owner open the packaged browser laboratory directly. If Owner judgement requires terminal/build/debug intervention, the implementation has failed its delivery contract.

### Vision protection

Studio remains a laboratory for persistent authored matter/local physical meaning compiling into disposable representations. It is not frozen into the current cubic-cell dialect, Box3D solver objects, conventional part catalog, generic CAD hierarchy or game-editor entity/component model.

### Alignment verdict

**PASS.** The current P06/C6 direction remains aligned with the project's intended experience and the Owner's collaboration role. No product redesign is required before I1.

---

## 13. Residual non-blocking debt

These are known and intentionally do not block handoff:

- server-side branch protection is absent; exact-head/path guards compensate operationally;
- historical branches remain visible; branch existence is not active-work authority;
- current root still opens the historical browser laboratory; Studio `/?studio=1` does not exist until I1.0;
- React/Three are not yet production dependencies; I1.0 owns that exact transaction;
- current artifact entry remains `/`; I1.3 candidate changes it to `/?studio=1` only after Studio exists;
- actual 1024×640 usability, difficult-angle target legibility, Torque drag sensitivity, visual fidelity and creative pull remain empirical implementation/Owner gates;
- multi-bearing runtime, multi-action composition, generic CUT/free editing, arbitrary continuity and final locality ontology remain research boundaries rather than implementation TODOs.

These are not hidden blockers and must not be "pre-solved" during takeover.

---

## 14. Final seal gate

This audit becomes **SEALED / HANDOFF READY** only after the exact final maintenance proposal satisfies all of the following without additional source changes:

1. changed-path audit shows docs/meta only;
2. no open competing PR appears;
3. Draft/core or direct Ready core passes on the exact head;
4. Ready candidate consumes the exact staged build;
5. launcher self-test passes;
6. complete current Chromium regression passes;
7. owner artifact is produced;
8. exact PR head is merged with expected-head protection;
9. live `main` is re-resolved after merge;
10. final current state says no active work and selects I1 without creating it.

This candidate run is a **repository/workflow/handoff smoke test**, not new physics evidence and not an Owner product gate.

---

## 15. Intended post-seal takeover

A fresh implementation orchestrator should need only:

1. live `main` + open PR resolution;
2. `.anvil/project-state.json`;
3. `docs/CURRENT_HANDOFF.md`;
4. `docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md`;
5. `docs/studio/C6-IMPLEMENTATION-READY.md`;
6. this audit only when validating why the seal is trusted.

If those sources reconcile, it must **not** restart ANVIL-00…10, W0/W1, P04/P05 or P06 planning.

Exact next action:

> create `integration/studio-v0-i1-first-loop` from the sealed live `main`, open Draft, and execute I1.0 / Studio substrate under the C6 stop rules.

---

## 16. Pre-gate verdict

# **AUDIT PASS — FINAL SEAL CANDIDATE**

No scientific, architectural or product-design blocker was found before implementation.

The only detected defects were documentation/current-state drift, all correctable without executable changes.

Final handoff verdict remains conditional only on the fresh exact-head repository/workflow candidate gate defined above.
