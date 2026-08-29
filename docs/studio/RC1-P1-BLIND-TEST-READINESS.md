# RC1-P1 — Blind-Test Readiness / Confound Gate

Status: **RC1 READY / BOUNDED PASS.**

Published P0 baseline: `b784444c9f29003b5def2d7203ffa2f2e85b9b30`.
Executable P1 correction head: `c9ae004f2dc6cc7fb7e87a7717996469ad58adcf`.

## Question

Is the current R2 candidate a fair enough instrument for a cold Owner first-touch, or are there bounded prototype/test confounds that could make the Owner mainly measure the instrument defect rather than the product grammar?

This is not a polish pass and not an Owner Value gate.

## Preregistered falsifiers

### P1-A — visible semantic interaction geometry

A visible Bearing/Torque semantic mark must not materially promise an interaction surface that the world hit-test rejects. In particular, clicking a clearly rendered semantic pixel near the outer axis/arrow envelope must select the intended local meaning/interface rather than silently falling through to Matter authoring or another seam.

### P1-B — dense-scene instrument viability

A representative 7+ cell scene with several Bearings/Torques, partial/conflict evidence, Context and RUN must remain mechanically operable and visually inspectable at normal desktop sizes. Rendered evidence is reviewed directly; screenshot existence or pixel difference alone is not a human-legibility proof.

### P1-C — first-touch contamination

The first-touch surface must not tell the Owner the research conclusion. Embedded operational affordances such as control cues are product UI and may remain. Research/developer claims such as `Owner Authority core active` or assurances such as `no hidden meaning` are contamination candidates because they can prime interpretation rather than expose capability.

## Falsification history

### Initial P1 candidate — BOUNDED RED

Run **#506 / `33213475645`** on head `d0e0dd6d549f8d61bbb90aeaab043cc09df24557` passed core/build/provenance/launcher but failed the real-Chromium gate with **30/32 PASS**. Publication was skipped, so the already-qualified public P0 page was not changed.

Two preregistered confounds were demonstrated:

1. **P1-C contamination RED**
   - first-touch receipt exposed `R2 · Owner Authority core active`;
   - ordinary Starter feedback exposed `no hidden meaning`.
   These are research assertions/assurances, not necessary operational affordances.

2. **P1-A interaction-geometry RED**
   - the test sampled an actually rendered cyan Bearing-axis pixel outside the central interface hit envelope;
   - clicking that visible semantic pixel did not open the Bearing context;
   - it fell through to Matter authoring and changed the world from **7 → 8 Matter cells**.
   This was a real instrument confound: rendered Meaning promised an interaction surface that input interpreted as Matter.

Visual evidence artifact from the RED run: `9702524394`, digest `sha256:17bfb8b476f976b8a7a6d4135c40bc65c39ae510480339cca24103cda6ab136f`.

### Bounded correction

The correction is isolated in `src/studio-r2/blind-test-readiness.ts` plus bootstrap installation. It does not change source schema, R1 Owner Authority semantics, realization, Box3D physics/runtime, RUN policy, Loose semantics, or authored Meaning identity.

Interaction correction:
- normal base hit-testing remains authoritative when it already reaches an interface/Meaning;
- the fallback is disabled while runtime is starting/running, so physical Hand behavior is not intercepted;
- only when authoring would otherwise hit Matter/null **and the actually clicked canvas pixel belongs to the existing semantic palette** does a local recovery probe run;
- the recovery search is bounded to at most 8 CSS pixels and accepts only an already-authored nearby interface/Meaning;
- it does not create a broad magnetic selection region around Meaning.

Contamination correction:
- the research assertion `R2 · Owner Authority core active` is removed from the visible receipt;
- `starter has Matter only · no hidden meaning` becomes neutral `starter` feedback;
- operational world cues such as `LMB build`, `B bearing`, `T torque`, camera controls and Hand controls remain because they are part of the product surface rather than claims about the research result.

A separate outer-Torque falsifier was added so closing the Bearing case could not silently leave the same mismatch on the visible Torque arrow.

## Closure evidence

Candidate **#509 / `33213938302`** on exact executable correction head `c9ae004f2dc6cc7fb7e87a7717996469ad58adcf` passed:
- core/typecheck + Foundation/semantic/Box3D: **PASS**;
- production build and exact staged provenance: **PASS**;
- packaged Windows launcher self-test: **PASS**;
- full real-Chromium regression including P1-A/P1-B/P1-C and the outer-Torque negative case: **33/33 PASS**.

Artifacts from #509:
- staged exact build `9702640379`, digest `sha256:fcac37cf96326fb5280b1f10da36f98034183c0babdef19fd3e7fb782a59dec3`;
- rendered evidence `9702677194`, digest `sha256:e88b494e3d52ab8a75c2bd7adcc3ad69f17d2da55792c239c6aa4b6e8e18b111`;
- immutable Owner artifact `9702677471`, digest `sha256:1ee856f8a77687fd9b2e000a70ed9b376b90a0075a585900e7fad98993d868ad`.

### Dense rendered review

The new rendered evidence was inspected directly rather than inferred from test success:
- complete 7-cell / 3-Bearing / 3-Torque state remained visually inspectable without an obvious rendering or control occlusion failure;
- partial/conflict state kept local purple conflict evidence distinct from amber unresolved Torque evidence and left Context controls reachable;
- RUN remained mechanically inspectable at both `1440×900` and `1024×640`; runtime controls remained reachable;
- no obvious dense-scene instrument blocker was demonstrated.

This does **not** prove that a human will find the scene intuitive, attractive or valuable. Those are RC1 Owner questions.

## Remaining bounded debt / unknowns

- `blind-test-readiness.ts` is experiment-local readiness debt, not architecture to promote by inertia;
- semantic-presentation camera mirroring remains explicit E1 technical debt;
- Torque arrow can still be interpreted by a human as linear force rather than torque-vector sign;
- Context dependence, marker clutter, starter usefulness, product feel and genuine discoverability remain unproven;
- the operational cue is intentionally retained and therefore RC1 evaluates the actual product with lightweight embedded control guidance, not a cue-free memorization test;
- no naive-user evidence exists yet.

## Verdict

**RC1 READY / BOUNDED PASS.**

The demonstrated P1 instrument confounds were closed without redesigning the R2 product hypothesis, and no remaining demonstrated blocker justifies protecting the candidate from a cold Owner evaluation.

This means only:
> the instrument is fair enough to test with the Owner.

It does not mean:
> the Owner will understand, enjoy or value the grammar.

This document is record-only. The document-inclusive final head must still pass the exact candidate gate and be explicitly promoted through the already-qualified P0 Pages pipeline before Owner exposure.

After successful exact-head publication and public smoke: **STOP. Do not begin the Owner test automatically.**