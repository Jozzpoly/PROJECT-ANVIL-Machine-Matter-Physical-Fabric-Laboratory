# RC1-CLOSE — Evidence Reconciliation / R2 Disposition

Status: **FOUNDATION ACCEPTED / R2 EMBODIMENT PROVISIONAL / DO NOT MERGE**.

This is a record-only closure after the first cold Owner contact with the exact public candidate published from `ac08bbac7371002261dc542891a542dfd02c423b` (promotion run #512 / `33215812711`). It does not add product capability, polish the UI, change physics/runtime, or authorize merge.

## Question

After the full R2 evidence chain and a real Owner first-touch, what is now justified as durable foundation, what remains only a current implementation hypothesis, what is experiment-local debt, and what is still unknown?

The purpose of this gate is to avoid two opposite errors:

1. under-reading RC1 as "the prototype merely ran" and reopening principles that survived falsification; or
2. over-reading RC1 as "the current R2 UI/representation is correct" and ossifying an intentionally rough prototype.

## Evidence chain reconciled

The disposition below reconciles, in order:

1. R1 Owner Authority semantics and source/runtime separation;
2. R2 direct-world grammar candidate;
3. D6 reachability and truthful-referent recovery work;
4. E0 rendered-reality audit (bounded RED);
5. E1 semantic-legibility closure (evaluation-ready, bounded);
6. RC1-P0 exact candidate publication / GitHub Pages transport qualification;
7. RC1-P1 blind-test readiness / confound closure;
8. one cold Owner first-touch recording (~186.6 s) on the exact public candidate;
9. post-session Owner self-report;
10. an independent critical re-validation of the video-derived claims.

The Owner recording is a **cold Owner session, not a naive-user study**. The Owner had prior ANVIL context, and the product retained lightweight operational cues. Claims below are narrowed accordingly.

## RC1 Owner evidence spine

The recording directly supports the following observations:

- approximately 7 clear RUN cycles occur in ~3:07, with roughly one third of the session spent in runtime;
- Matter authoring begins within seconds and later escalates from roughly 10 to 58 Matter in about 24 seconds;
- the first Bearing target takes roughly 9 seconds to acquire, while the next Bearing takes roughly 1 second and later Bearings are added repeatedly in a larger topology;
- Torque authoring is reachable, but only one Torque is meaningfully exercised;
- normal Matter editing creates a `PARTIAL` state with one unresolved relation while other authored intent remains;
- the Owner invokes RUN while still `PARTIAL`; runtime starts with a diagnostic instead of blocking;
- after returning to authoring, an exact Matter delete restores a COMPLETE state and the Owner immediately re-runs;
- a later invalid Bearing remains authored and locally diagnosed as `RIGID_BYPASS`; the Owner chooses local Delete and continues;
- final authored state reaches 58 Matter, 9/9 Bearings and 1/1 Torque and is run successfully;
- STOP returns from transient runtime motion to the authored source state throughout the session.

The strongest RC1 result is therefore not "the interface is intuitive". It is **continuity through invalidity**: the Owner can continue authoring, attempt runtime, receive evidence, decide what to do, and resume experimentation without a permission/repair gate taking control.

## A. Accepted foundation

These are current-best invariants/directions that survived the combined executable and Owner evidence. Future redesign should preserve them unless contradictory evidence appears.

### A1. Authored source remains authoritative

- authored source, compiled/realized state, runtime state and rendering are distinct;
- transient runtime pose/forces/Hand state do not silently write back into authored source;
- STOP/restart returns to or re-realizes the authored source rather than treating runtime accident as new authoring.

### A2. Runtime is an attempt, not permission

- RUN does not require a READY/ELIGIBLE/repaired state;
- COMPLETE/PARTIAL/MATTER_ONLY are receipts, not permissions;
- useful realizable subsets may run while local authored intent remains unresolved or invalid.

The cold Owner recording exercises this directly with a PARTIAL world and is strong human evidence, not only an automated contract.

### A3. Evidence informs; the Owner decides

- a local semantic problem should remain local where possible;
- diagnostics may explain omission/failure but must not silently repair, delete or select a winner for the Owner;
- invalid/unresolved authored intent may remain authored;
- destructive default operations remain exact rather than cascading unless an explicit cascade command is requested.

The recorded `RIGID_BYPASS` episode strongly supports the interaction principle: the invalid Bearing remains present and diagnosed; the Owner chooses whether to delete it.

### A4. Truthful reachability is required, but its UI embodiment is not fixed

If authored Meaning still has a truthful spatial referent, it must remain reachable there even when unrealized. If no truthful spatial referent survives, the system must preserve direct access without inventing a fake world position.

This requirement is accepted from the D6/R1 evidence chain. The current `Loose` tray is only one provisional embodiment of the zero-referent case.

### A5. World-primary authoring is an accepted product direction

The world should carry the normal authoring loop. Local contextual UI may support a selected spatial Meaning, but normal work must not collapse into a mandatory dashboard, repair queue or permission workflow.

RC1 supports this direction at the tested scale: most building, Meaning placement, inspection and RUN/STOP activity remains world-driven. It does **not** prove that every future tool/lens/mode is harmful. The invariant is world-primary agency and non-dominating support UI, not a dogmatic ban on every future hierarchy.

### A6. BUILD → RUN → OBSERVE/INTERACT → STOP → BUILD is worth preserving

The repeated loop occurs naturally in the Owner session and survives local invalid states. It is now more than a synthetic test target: it is a demonstrated useful interaction rhythm in the minimal laboratory.

## B. Provisional product grammar / current-best embodiment

These worked well enough to carry RC1 but are **not sealed as final product decisions**:

- cubic Matter cells and the current `cellId@face` laboratory representation;
- LMB click/drag extrusion as the exact future Matter authoring gesture;
- the three-cell starter;
- `B` and `T` as keyboard one-shot intents;
- repeated B→click / T→click as long-term large-scale Meaning authoring;
- the current Bearing ring+axis visual;
- the current Torque patch/arrow/sign visual language;
- the current Local Interface / Context island shape and information density;
- the current `Loose` tray UI;
- current camera gestures, Focus behavior and runtime framing behavior;
- the exact Runtime Hand gesture/mapping;
- current COMPLETE/PARTIAL receipt presentation and laboratory diagnostic wording;
- the exact absence/presence of future optional modes, lenses or hierarchical tools, provided they do not become mandatory permission/repair structure.

RC1 gives no basis for promoting these from "working current-best" to "foundation".

## C. Experiment-local debt and support infrastructure

### C1. Explicit experiment-local product debt

Do not promote by inertia:

- `src/studio-r2/semantic-presentation.ts` as a long-term semantic rendering architecture;
- mirrored Canvas camera math inside semantic presentation;
- `src/studio-r2/blind-test-readiness.ts` as permanent interaction architecture;
- semantic-pixel fallback / bounded recovery probing as a final hit-testing design;
- test-oriented contamination-removal/adapters introduced only to make RC1 fair;
- current laboratory diagnostics/presentation conventions where they exist to expose evidence rather than express final product language.

These adapters were justified to make the experiment truthful. Their success is not evidence that their internal form should survive the next design generation.

### C2. Qualified support infrastructure, not product foundation

The P0 exact-dist publication pipeline is useful and should not be mislabeled as disposable merely because it was created for RC1:

- one exact staged browser build;
- candidate qualification on that exact dist;
- explicit promotion;
- publication without rebuild;
- deployed provenance verification and public smoke;
- Draft state preventing accidental Owner-page overwrite.

This is current-best **test/delivery infrastructure**. It remains outside the product grammar and can evolve independently.

## D. Open product questions exposed by RC1

The first Owner contact gives a better next problem set than another broad feature roadmap:

1. **Spatial target legibility** — first Bearing acquisition is materially slower than later attempts. How should valid local targets present themselves without tutorial/paternalistic guidance?
2. **Dense world readability** — translucent Matter, overlapping edges, semantic marks and grid become visually noisy as topology grows.
3. **Runtime observation** — camera/spatial reference/framing costs become visible during the larger RUN.
4. **World vs Context balance** — how much exact cause/parameter editing can remain local without Context gradually becoming the real primary interface?
5. **Torque semantics** — authoring is reachable, but sign/direction/tuning/multiple-Torque comprehension is not established.
6. **Repeated Meaning authoring** — one-shot B/T works through 9 Bearings in this session, but no scale ceiling has been established.
7. **Diagnostic language** — current behavior is promising; wording/presentation is still laboratory-facing.
8. **Starter and first-touch shaping** — current starter is workable for this Owner but not established as the right default for broader use.
9. **General visual/interaction embodiment** — how to make Matter, topology, Meaning and motion legible without giving up the permissive world-first character.

## E. Explicitly not established

RC1 does not establish:

- naive-user usability or discoverability;
- general-audience onboarding;
- long-term fun, retention or repeated-session value;
- production-scale numerical/perceptual scalability;
- final rendering architecture or visual style;
- final generic Meaning ontology/visualization system;
- final Matter representation;
- persistence / Save/Open workflow;
- mobile or accessibility readiness;
- Undo/Redo, Loose, rebind/retarget and broader conflict UX quality from Owner evidence;
- comprehensive Torque UX;
- R2-wide architectural cleanliness;
- merge readiness.

## R2 disposition verdict

### **FOUNDATION ACCEPTED / EMBODIMENT PROVISIONAL**

The central direction survived contact with the Owner:

> The Owner can act directly in the world, create mechanisms, enter locally invalid states, attempt useful runtime anyway, receive evidence instead of permission gates, choose whether/how to repair, and continue experimenting without the system taking control of the process.

This is strong enough to stop treating the core Owner-Authority / direct-world loop as merely speculative.

It is **not** strong enough to seal the present R2 implementation, UI, representation or visual language. The branch remains a research/product prototype and **must stay Draft / DO NOT MERGE** until a separately selected stage justifies a different disposition.

The useful shorthand remains:

> **Owner decides. ANVIL interprets. Runtime attempts. Evidence reports.**

The additional RC1 design lesson is:

> **Preserve continuity through invalidity.**

## Next candidate — selected, not started

### World Embodiment Research

Current highest-information next question:

> **How should ANVIL make Matter, local Meaning, topology and runtime motion materially easier to perceive and manipulate as the world grows, while preserving the accepted world-primary / Owner-Authority foundation and avoiding a retreat into tutorials, repair queues or panel-dominated workflows?**

This should begin as comparative research and bounded interaction/presentation hypotheses, not as a broad polish implementation pass.

Priority evidence from RC1 to carry into that research:

- first Bearing target-acquisition cost;
- dense 58-Matter visual noise;
- runtime framing/spatial-reference cost;
- promising but laboratory-like local diagnostic behavior;
- rapid post-learning authoring and permissive continuity that must not be damaged by "helpful" redesign.

Alternative subproblems (Torque semantics, repeated Meaning authoring scale, second-user testing) remain valid but are not selected ahead of the more general world-embodiment problem yet.

## Natural stop

RC1-CLOSE ends after this reconciliation record and a read-only verification of repository state.

Do not automatically:

- polish or redesign the UI;
- refactor experiment-local adapters;
- change B/T or camera behavior;
- add new physics/Meaning;
- merge R2;
- start the selected World Embodiment Research stage.
