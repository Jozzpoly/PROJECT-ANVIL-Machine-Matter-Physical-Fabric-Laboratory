# WER-1 — Trained-Owner Bearing Disclosure Comparative Gate

Status: **PRE-REGISTERED / STUDY HARNESS NOT YET QUALIFIED / OWNER RUN NOT STARTED**.

Upstream executable authority: `74494178d169f988f6aa01f9c2d440a476c8e5ce` (WER-1Q qualified build).

Upstream record authority: `d842dc65035f1cb6fc9d099dd9a93e2a0c3caada`.

This stage is a bounded trained-Owner comparison. It is not a naive-user study, not a final UI choice, not a Meaning-grammar redesign, and not an R2 merge gate.

## 1. Central question

> Do the qualified actionability-disclosure policies materially improve post-learning Owner workflow, or does the disclosure line provide too little benefit to justify further investment before a deeper Meaning Interaction Instrument investigation?

The Owner already understands the current Bearing concept. WER-1 therefore measures post-learning interaction, not first-use conceptual discoverability.

## 2. Frozen hypotheses

### H1 — Disclosure remains useful

The current `B → compatible shared interface` grammar is serviceable enough that truthful actionability disclosure materially improves neutral-world work and/or active Bearing acquisition.

### H2 — Disclosure is not the main bottleneck

Even with truthful M/P/S coupling, the current interaction remains conceptually or operationally awkward enough that further target-disclosure polish has low information/value gain. A richer Action-Coupled Meaning Instrument becomes the stronger next research route.

Neither hypothesis is privileged before evidence.

## 3. Experiment split

### Subtest N — Neutral Actionability Load

Question:

> Is persistent display/input presence of potential Bearing opportunities useful during ordinary neutral work, or does a quiet neutral world improve reading and selection of already-authored Meaning?

Policies:

- `baseline`: persistent shared-interface affordance control on the corrected WER-1D M/P/S boundary;
- `quiet`: WER-1Q `global` policy while intent remains neutral; dormant P is neither foregrounded nor an invisible input interceptor.

Task for every N trial:

> Find and select the single existing Bearing.

No B intent is required. Each scene contains exactly one authored Bearing and no task-specific target highlight.

Primary evidence:

- reveal → correct Bearing selection time;
- first selection correctness;
- wrong context/interface selections;
- cursor path length/search proxy;
- completion/failure.

### Subtest A — Active Bearing Acquisition

Question:

> Once the Owner intends to create a Bearing, is global disclosure or local wake-up the more effective truthful actionability instrument?

Policies:

- `global`: all topology-derived P disclosed/active after B;
- `local`: the same full P set exists, but only the frozen local 96 px subset is disclosed/active around the pointer.

All A trials start from quiet neutral.

Task format:

> Add one Bearing at a structurally described unique leaf connection.

No pixel coordinate, target highlight, color cue, teleport, or policy label is shown.

Primary evidence:

- task reveal → B activation time;
- B activation → first authored Bearing time;
- B activation → correct target completion time;
- first authored action correctness;
- wrong authored Bearings;
- B re-entry / cancel / retry count;
- cursor path length;
- completion/failure.

## 4. Fixed trial count and order

There are 16 trials: four matched density pairs for N and four matched density pairs for A.

Density families are approximately:

1. small: 6–7 Matter;
2. medium: 12–15 Matter;
3. branched: 20–30 Matter;
4. dense: 50–60 Matter.

Matched pair members are nonidentical fixtures with comparable Matter/interface load. Exact target pixel reuse is prohibited.

Order is fixed before the Owner run:

### N

- N1: baseline → quiet
- N2: quiet → baseline
- N3: quiet → baseline
- N4: baseline → quiet

### A

- A1: global → local
- A2: local → global
- A3: local → global
- A4: global → local

No order adaptation after seeing behavior.

## 5. Study-harness boundary

The qualified WER-1Q app does not itself include deterministic human-study fixture loading. Manually constructing fixtures in front of the Owner would contaminate spatial memory and invalidate the intended comparison.

Therefore WER-1 may add a **disposable experiment-only study harness** with these strict limits:

- URL/trial-driven deterministic source fixture injection;
- opaque trial IDs mapping to preregistered policy and fixture;
- controller overlay shown only before/after timed interaction, not as an in-world target cue;
- telemetry collection for pointer path, input channels, timing and target correctness;
- local-only result persistence/export;
- optional browser-tab recording initiated explicitly by the Owner;
- no change to source semantics, realization/runtime, hit tolerance, M/P/S policy behavior, Bearing grammar, semantic glyphs, Matter renderer, camera behavior or runtime permission model.

The harness must be qualified before use. If fixture injection requires broader product refactoring, WER-1 stops with **STUDY-HARNESS RED** rather than modifying the product by momentum.

## 6. Raw evidence

Required evidence package:

- structured JSON result for all trials;
- ordered event/timing records;
- pointer-path summary;
- pair-level preference/notes as secondary evidence;
- raw screen/tab recording when browser permission is available;
- exact study-build provenance.

If raw recording cannot be captured, that is recorded explicitly as evidence debt; it must not be silently treated as present.

Think-aloud is not required during timed trials. Qualitative feedback is collected after matched pairs to reduce interference with primary behavior.

## 7. Frozen local parameter

`WER1_LOCAL_WAKE_RADIUS_PX = 96` remains frozen for this comparison.

WER-1 does not tune the radius after inspecting Owner behavior. If Local performs poorly and the recording/telemetry indicates radius-specific failure, the result may be classified as an implementation-instance limitation rather than a universal rejection of local wake-up, but no mid-run correction is allowed.

## 8. Claim budget

WER-1 may support only bounded trained-Owner conclusions such as:

- `PERSISTENT NEUTRAL CURRENT-BEST`;
- `QUIET NEUTRAL CURRENT-BEST`;
- `GLOBAL ACTIVE DISCLOSURE CURRENT-BEST`;
- `LOCAL WAKE-UP CURRENT-BEST`;
- `NO MATERIAL ACTIVE-DISCLOSURE DIFFERENCE`;
- `DISCLOSURE LINE WEAK — ROUTE TOWARD MEANING INSTRUMENT RESEARCH`;
- `EVIDENCE INCONCLUSIVE`.

WER-1 may not establish:

- naive-user discoverability;
- final Bearing grammar;
- final target glyphs/radius/animation;
- dense-world scalability in general;
- Torque disclosure quality;
- final Meaning ontology/hit architecture;
- long-term ergonomics/fun;
- R2 merge readiness.

No population statistics are inferred from n=1.

## 9. Decision discipline

A policy is not declared current-best from one fast trial. Direction must repeat across multiple density families and must not be offset by increased wrong-action cost or obvious qualitative failure.

If N and/or A are mixed, the result remains mixed. Neutral and active policies need not share one winner.

If both global and local fail to produce material improvement, or the Owner repeatedly reports conceptual rather than spatial friction consistent with behavior, further seam-disclosure polish loses priority and H2 becomes the stronger next candidate.

If the harness itself contaminates the tasks, changes the tested interaction, or cannot prove target/fixture identity, the result is **PROTOCOL RED** and no UX conclusion is drawn.

## 10. Qualification history before Owner evidence

No Owner trial has started yet. Pre-Owner qualification is allowed to correct the disposable harness, but every correction must remain explicit and must not tune policy behavior after seeing Owner evidence.

### Qualification attempt 1 — `0e2003b90b69e19dad9adeec34b3109f39c9af7a`

Result: **STUDY-HARNESS RED**.

- core/typecheck/build/provenance/Windows launcher remained green;
- all 38 pre-WER-1 browser tests remained green;
- only the two new study-harness tests failed;
- hidden fixture setup used some faces that were not reachable through the frozen/default camera interaction path.

Bounded correction before any Owner exposure:

- fixture geometry changed to use camera-reachable construction faces while preserving the frozen trial count/order, 7/15/27/53 Matter pair loads, task semantics, target role, policy assignment, metrics and 96 px local radius;
- no source/runtime/policy/Meaning/renderer or hit semantics changed.

### Qualification attempt 2 — `b5a79dffaab90c80b36bac1bbd53046165cae68e`

Result: **STUDY-HARNESS RED / DIAGNOSTICALLY INSUFFICIENT**.

- core/typecheck/build/provenance/Windows launcher remained green;
- all 38 pre-WER-1 browser tests again remained green;
- only the two study-harness tests failed;
- the current test reported only that `Gotowe` was not reached within its assertion window and did not surface the controller's own `STUDY-HARNESS RED` message.

Bounded correction before any Owner exposure:

- qualification spec only is strengthened to wait for either `Gotowe` or explicit `STUDY-HARNESS RED` and fail with the controller's exact reason;
- study controller, fixture data, trial order, policy behavior and Owner task content remain unchanged.

### Qualification attempt 3 — `2c3019bb8a885b65210d247c675a21c1de97d716`

Result: **STUDY-HARNESS RED / IFRAME LIFECYCLE**.

- core/typecheck/build/exact staging/provenance/Windows launcher remained green;
- all 38 pre-WER-1 browser tests again remained green;
- only the two study-harness tests failed;
- strengthened diagnostics exposed the controller's exact reason: `R2 iframe incomplete`;
- no fixture, disclosure-policy or R2 product failure was observed.

Bounded correction before any Owner exposure:

- study controller now installs the iframe load/probe path before navigation and waits for the exact expected `?wer1=<policy>` URL plus `.r2-studio` and `canvas[data-r2-world]` before fixture setup begins;
- fixture data, trial order, policy assignment, 96 px radius, Owner tasks, root R2 app, source/runtime and hit semantics remain unchanged.

### Qualification attempt 4 — `46e395e7efea1969f427a68911b19f0546518dfd`

Result: **STUDY-HARNESS RED / SYNTHETIC UI-REPLAY METHOD INSUFFICIENT**.

- core/typecheck/build/exact staging/provenance/Windows launcher remained green;
- 39/40 real-Chromium tests passed: all pre-WER-1 coverage plus the direct target-completion study probe; only the exhaustive 16-fixture preparation test failed;
- exact diagnostic was `timeout cells=27; got 21` during the first branched-density family;
- small and medium fixture loads had already passed;
- because the replay checked cell count but could not independently prove the full authored topology after every synthetic drag, continued camera/coordinate tuning would risk qualifying the wrong scene rather than the preregistered fixture.

Bounded correction before any Owner exposure:

- abandon synthetic mouse-drag fixture construction as the preparation mechanism;
- use the preregistered URL-driven deterministic source-fixture path instead;
- `src/studio-r2/wer1-study-fixture.ts` materializes the exact 7/15/27/53 authored Matter scenes and the one pre-authored N Bearing directly as `FreedomSourceV0`;
- normal R2 startup remains unchanged unless the explicit `wer1study=1&wer1fixture=<id>&wer1sub=<N|A>` study query is present;
- study trial interaction after reveal still uses the ordinary R2 world, hit path, B intent and Meaning interaction;
- all 16 preregistered targets are now required to complete successfully in real Chromium before qualification;
- Owner JSON records both the upstream WER-1Q executable authority and the exact study-build SHA from `anvil-artifact.json`.

This correction changes fixture preparation only. It does not tune baseline/global/local policy behavior, 96 px, task wording, trial order, source semantics, realization/runtime, Meaning semantics or the measured Owner interaction.

No UX or product inference may be drawn from any qualification RED above.

## 11. Natural stop

WER-1 ends after an evidence disposition is recorded.

Do not automatically:

- polish the winning policy;
- tune 96 px;
- redesign Meaning interaction;
- redesign Torque;
- begin naive-user testing;
- merge R2;
- publish a general Owner candidate.
