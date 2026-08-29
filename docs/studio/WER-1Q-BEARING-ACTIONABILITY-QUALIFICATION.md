# WER-1Q — Bearing Actionability Disclosure Implementation & Qualification Spike

Status: **OWNER-EVALUATION READY / BOUNDED QUALIFICATION PASS / OWNER COMPARISON NOT STARTED**.

Qualified executable head: `74494178d169f988f6aa01f9c2d440a476c8e5ce`.

Branch: `recovery/r2-direct-world-grammar`.

Upstream authority:

- `RC1-CLOSE-R2-DISPOSITION.md`
- `WER-0-AUTHORING-EMBODIMENT-DISCOVERY.md`
- `WER-1C-TARGET-DISCLOSURE-EXPERIMENT-CONTRACT.md`
- `WER-1D-ACTIONABILITY-BOUNDARY.md`

This is an executable qualification result, not an Owner preference/value comparison and not a seal of the current R2 embodiment.

## Question

> Can the WER-1D actionability-coupled Bearing disclosure model be implemented as a bounded experiment on the current R2 substrate without changing source/runtime authority, hiding authored Meaning, filtering Owner choices, or creating invisible candidate interaction?

### Verdict

**Yes, within the bounded WER-1Q experiment.**

The exact executable candidate passes source/topology guards, full existing regression, new WER-1Q real-Chromium guards, exact staged provenance, the packaged Windows launcher check, and direct visual-evidence inspection. No qualification evidence currently requires a broader R2 hit-architecture refactor or a Meaning-grammar redesign before an Owner comparative test.

This verdict means only:

> the three WER-1Q policies are fair enough instruments for a later trained-Owner comparison.

It does **not** mean that `global` or `local` is better than baseline, that Bearing is intuitive for a naive user, that the current 96 px local wake radius is optimal, or that the current screen-space target language is final.

---

# 1. Frozen experiment scope

Three policies exist only for this bounded experiment:

1. `baseline` — persistent shared-interface affordance/control behavior;
2. `global` — quiet neutral potential Bearing opportunities; under `B`, all current adjacent-Matter opportunities are disclosed and activated;
3. `local` — the same quiet neutral state; under `B`, only opportunities inside the frozen local wake radius are disclosed and activated.

Torque disclosure is not optimized in WER-1Q. Existing authored Torque remains Meaning and its current authoring/reachability paths remain intact.

### Baseline qualification note

The WER-1Q baseline is the visual/persistent-interface control, but all three policies share the corrected WER-1D `M/P/S` boundary under Bearing intent. In particular, an orphan Bearing represented internally as `R2InterfaceHit` is no longer treated as a new Bearing opportunity merely because generic pre-WER-1 dispatch happened to accept that implementation hit type.

That is a protocol correction applied equally to the experiment, not a claimed UX advantage for either new disclosure policy.

---

# 2. Local experiment ontology

- `M` — authored Meaning referent. Persistent/reachable when a truthful spatial referent survives.
- `P` — potential Bearing opportunity: a shared interface between two currently adjacent authored Matter cells across opposite faces, regardless of existing Bearing or predicted runtime quality.
- `S` — ordinary Matter action surface.

`P` is derived from authored topology, not from generic `R2InterfaceHit` identity and not from realization success.

Qualified consequences:

- a seam already containing a Bearing remains `P`, so duplicate/conflict authoring remains possible;
- a seam that later produces `RIGID_BYPASS` remains `P`;
- an orphan Bearing with one missing Matter endpoint remains `M` but is not `P`;
- dormant undisclosed `P` does not intercept normal neutral world input;
- when `P` is disclosed, visibility and candidate interaction are coupled by the same policy;
- runtime viability never filters candidate membership.

---

# 3. Implementation boundary

WER-1Q changes only bounded presentation–interaction substrate:

- experiment-local policy/topology module `src/studio-r2/actionability-disclosure.ts`;
- bounded candidate metadata/routing in `src/studio-r2/world.ts`;
- empty-seam semantic presentation follows the same disclosure policy;
- Node topology guards and real-Chromium qualification tests.

It does not intentionally change:

- authored source schema;
- Bearing/Torque identity;
- realization/runtime/physics;
- diagnostics semantics;
- exact-delete / Undo / Redo authority;
- PARTIAL/MATTER_ONLY RUN permission;
- current Bearing one-shot `B → compatible shared interface` grammar;
- camera or Matter renderer;
- authored Bearing/Torque glyph semantics;
- Pages promotion contract.

The experiment-local substrate remains technical/research scaffolding, not architecture to promote by inertia.

### Known experiment-local debt

- the helper name `localWakeNeedsRefresh()` now covers both experimental active-B policies; this is naming debt, not product semantics;
- the shell `data-wer1-candidates` value is a projected/current-view evidence count, while the Node topology guard is the stronger source-level definition of `P`;
- the 96 px local wake radius is frozen for the forthcoming comparison and is not established as current-best;
- the existing Canvas semantic-presentation adapter remains experiment-local technical debt inherited from E1.

None of these findings blocks the bounded Owner comparison, but none should be generalized as final design.

---

# 4. Falsification and correction history inside WER-1Q

WER-1Q was not green by construction.

## 4.1 Semantic adapter typo — implementation RED caught before qualification

During the bounded semantic-presentation edit, the zoom wrapper briefly called the original method with the wrong variable. This was detected immediately by review before qualification and corrected. The final semantic diff changes empty-seam disclosure only; authored Bearing/Torque and runtime semantic presentation remain otherwise unchanged.

This was an implementation error, not a product finding.

## 4.2 Node guard harness RED

Run #523 failed after all prior Node tests had passed because the new `tests/wer1-actionability.test.mjs` could not import the WER-1 experiment module from `.test-build`.

Cause:

- `tsconfig.test.json` intentionally compiled recovery/experiment code but not `studio-r2`.

Bounded correction:

- include only `src/studio-r2/actionability-disclosure.ts` in the test build rather than broadening compilation to all of `studio-r2`.

Run #524 then passed the full core gate.

This was a harness/instrumentation RED, not evidence against the WER-1D model.

## 4.3 Active-intent redraw finding

Implementation review found that `setIntent(B)` does not itself redraw Canvas. A local-only refresh would therefore have made the `global` policy visually/interactionally stale on the first target probe.

Bounded correction:

- refresh the experimental candidate field during active Bearing hit/probe resolution for both `global` and `local`.

No source/runtime semantics were changed.

## 4.4 Qualification transport

The normal P0 candidate gate is intentionally conditional on a non-Draft PR. The connector's `markPullRequestReadyForReview` mutation remained broken with the known GitHub GraphQL `fullDatabaseId` error.

Rather than change CI or publish the Owner Page, WER-1Q used temporary qualification PR #43:

- head branch `qualification/wer1q-74494178` points exactly to qualified executable head `74494178d169f988f6aa01f9c2d440a476c8e5ce`;
- base is the same R1 branch as R2;
- PR #43 was opened non-Draft only to invoke the existing `core → staging → candidate` path;
- event action was `opened`, not `ready_for_review`, therefore `publish-owner-page` and `owner-page-smoke` were skipped;
- no public Owner Page promotion was authorized or performed.

This preserved the P0 one-build qualification discipline without modifying CI merely to work around a connector defect.

---

# 5. Mechanical qualification evidence

## 5.1 Draft/core evidence

Before Chromium qualification:

- source typecheck/build remained green;
- existing Foundation/semantic/Box3D tests remained green;
- production browser build remained green;
- the bounded WER-1 topology guard demonstrated:
  - existing Bearing does not remove `P`;
  - an orphan authored Bearing does not manufacture `P`;
  - a topological seam later diagnosed `RIGID_BYPASS` remains `P`.

The initial harness failure and its correction are recorded above rather than omitted from the evidence history.

## 5.2 Authoritative exact candidate

Qualification run:

- workflow: **ANVIL CI #529**
- run id: `33248874129`
- qualified source/head: `74494178d169f988f6aa01f9c2d440a476c8e5ce`
- transport: temporary PR #43, opened non-Draft, DO NOT MERGE
- result: **SUCCESS**

Core:

- strict/typecheck + Foundation/semantic/Box3D + WER-1 Node guard: **PASS**;
- production browser build: **PASS**;
- exact build staged: **PASS**.

Candidate:

- exact staged provenance against PR head: **PASS**;
- packaged Windows owner launcher self-test: **PASS**;
- real Chromium regression: **38/38 PASS** in 39.4 s;
- visual evidence upload: **PASS**;
- owner-candidate artifact upload: **PASS**.

Publication:

- `publish-owner-page`: **SKIPPED**;
- `owner-page-smoke`: **SKIPPED**;
- public RC1 Owner candidate therefore remains untouched by WER-1Q.

## 5.3 Exact artifacts

Staging artifact:

- name: `anvil-browser-staging`
- id: `9713713614`
- digest: `sha256:f17231e0dba1a2881e761605b3d837da29e83c8f8e9c9e83f637fc9363f786a4`
- source provenance validated against `74494178d169f988f6aa01f9c2d440a476c8e5ce`.

Visual evidence:

- name: `r2-e1-visual-evidence`
- id: `9713729037`
- digest: `sha256:27219737d00c1422a9b31f3ad594e1343d07473e695e01e5bf2c63689c6eb7ba`
- includes six WER-1Q screenshots under `wer1q/` in addition to the established E1/P1 evidence.

Qualified browser artifact:

- name: `anvil-browser-laboratory`
- id: `9713729313`
- digest: `sha256:fa6695c0e1878eaf339133162facfae3f7ea0b8b96fe9c15f21e22cbb274903c`
- expires 2026-09-12.

---

# 6. Executable guard disposition

## Guard 1 — quiet neutral has no invisible empty-candidate capture

**PASS.**

The old projected seam location in `global` quiet neutral does not open empty Interface Context or author a Bearing. Dormant empty `P` is not a hidden higher-priority interaction surface.

## Guard 2 — disclosed Bearing candidate is interactive

**PASS.**

Under active `B`, disclosed `global` and `local` candidates author Bearing through the existing one-shot grammar.

## Guard 3 — global/local candidate membership is topology-derived

**PASS, bounded.**

Both policies share the same adjacent-Matter candidate-construction path; policy is applied only to the disclosed/active subset. The source-level topology guard independently freezes the `P` definition. Current shell count is view/projectability evidence, not a replacement for source topology truth.

## Guard 4 — duplicate remains authorable

**PASS.**

A seam already carrying Bearing remains `P`; a second Bearing can be authored, producing the existing `DUPLICATE_SEAM` evidence rather than policy filtering.

## Guard 5 — runtime-success filtering absent

**PASS.**

The Node guard constructs a topology where an authored Bearing later receives `RIGID_BYPASS`; the seam remains `P` before/independent of realization result.

## Guard 6 — orphan Bearing remains `M`, not `P`

**PASS.**

After exact-deleting one Matter endpoint:

- Bearing remains authored and world-reachable in neutral state;
- projected candidate count becomes zero for the one-cell state;
- active `B` does not reinterpret that orphan `R2InterfaceHit` as a new Bearing opportunity;
- no second invalid-locality Bearing is silently authored through the preserved Meaning referent.

## Guard 7 — standalone Torque remains authored Meaning

**PASS.**

After Bearing deletion and Matter deletion remove the shared opportunity, standalone Torque at its surviving `cellId@face` remains directly selectable as local authored Meaning while `P = 0`.

## Guard 8 — runtime remains attempt, not permission

**PASS.**

The browser qualification deliberately authors a duplicate Bearing conflict and verifies RUN remains operable. The runtime/evidence contract is unchanged.

## Guard 9 — P1 semantic envelope remains authored-Meaning-only

**PASS by unchanged adapter + full regression.**

`blind-test-readiness.ts` was not repurposed to recover dormant empty `P`; its bounded semantic-pixel probe remains restricted to already-authored Bearing/Torque Meaning. All prior P1 browser regressions remain green.

## Guard 10 — baseline/full regression and provenance

**PASS.**

The exact staged build passed provenance, launcher and all 38 browser tests including the pre-WER-1 suite.

## Guard 11 — direct rendered-evidence inspection

**PASS for evaluation-readiness.**

Direct inspection of the six WER-1Q screenshots found:

- `global-quiet-neutral.png`: potential seam is visually absent in neutral world; Matter remains visually coherent;
- `global-bearing-disclosure.png`: active Bearing intent exposes the shared seam at the expected spatial location;
- `local-bearing-wake.png`: only a local subset of the six current opportunities is exposed; the frozen 96 px radius can expose several nearby seams and remains a parameter to evaluate rather than a qualified optimum;
- `global-authored-conflict.png`: duplicate authored Bearings remain clearly represented as conflict Meaning rather than disappearing behind candidate policy;
- `global-orphan-bearing-meaning.png`: preserved orphan Bearing remains visible/selectable with local INVALID_LOCALITY evidence despite no adjacent-Matter `P`;
- `global-standalone-torque-meaning.png`: standalone unresolved Torque remains visible/selectable as local Meaning with no shared Bearing opportunity.

No screenshot reveals an obvious contradiction severe enough to make the later Owner comparison measure a broken instrument rather than the disclosure hypothesis.

---

# 7. What WER-1Q establishes

WER-1Q establishes only that:

> **the actionability-coupled Bearing disclosure hypothesis can be compared fairly enough in the current R2 laboratory using baseline, quiet/global and quiet/local policies without known violation of the accepted Owner-Authority foundation.**

The experiment is now qualified to ask a trained Owner whether the policies materially affect:

- neutral-world reading/workflow;
- spatial Bearing target acquisition;
- search effort/cursor hunting;
- perceived clutter versus useful actionability;
- whether global feels permission-like/noisy;
- whether local feels too hidden/magnetic;
- whether the fast post-learning world-primary loop survives.

---

# 8. What WER-1Q does not establish

WER-1Q does **not** establish:

- a winner among baseline/global/local;
- naive-user first-use discoverability;
- that first-Bearing RC1 friction was caused primarily by presentation;
- final Bearing authoring grammar;
- final target glyphs, colors, animation or interaction radius;
- final Matter representation or dense-world scalability;
- final generic Meaning ontology/hit architecture;
- Torque disclosure quality;
- long-term ergonomics or fun;
- R2 merge readiness.

The stronger alternative remains live:

## H2 — Action-Coupled Meaning Instrument

If a fair Owner comparison shows that the bounded global/local affordance policies do not materially improve the relevant workflow, continued polishing of target disclosure is no longer justified. A richer direct Meaning instrument then becomes the stronger research route.

WER-1Q does not prejudge that decision.

---

# WER-1Q verdict

## **OWNER-EVALUATION READY / BOUNDED QUALIFICATION PASS**

The WER-1D model survived bounded implementation and executable qualification.

The smallest truthful candidate model remains:

> **persistent authored Meaning + dormant potential Bearing opportunities in quiet neutral + perceptually/interactively coupled candidate activation under Bearing intent.**

This is qualified as an experimental instrument, not accepted as product embodiment.

## Next candidate — selected conceptually, not started

A separately selected stage may perform the trained-Owner comparative evaluation using the WER-1C claim/order discipline plus the exact qualified WER-1Q build or an exact equivalent rebuild whose provenance is requalified.

## Natural stop

WER-1Q ends after:

- bounded implementation;
- falsification/correction of implementation and harness errors;
- topology/source guards;
- exact staged provenance;
- packaged launcher verification;
- full real Chromium regression;
- direct visual-evidence inspection;
- repo-native qualification record;
- no publication and no merge.

Do not automatically begin:

- Owner A/B comparison;
- naive-user testing;
- Meaning Interaction Instrument redesign;
- Torque disclosure redesign;
- Matter density/LOD work;
- broader UI polish;
- merge of R2.
