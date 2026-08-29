# WER-1 — Trained-Owner Bearing Disclosure Comparative Gate

Status: **PRE-REGISTERED / STUDY HARNESS QUALIFICATION IN PROGRESS / OWNER RUN NOT STARTED**.

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

- URL/trial-driven deterministic fixture preparation outside the visible Owner trial;
- opaque trial IDs mapping to preregistered policy and fixture;
- controller overlay shown only before/after timed interaction, not as an in-world target cue;
- telemetry collection for pointer path, input channels, timing and target correctness;
- local-only result persistence/export;
- optional browser-tab recording initiated explicitly by the Owner;
- no change to source semantics, realization/runtime, hit tolerance, M/P/S policy behavior, Bearing grammar, semantic glyphs, Matter renderer, camera behavior or runtime permission model.

The harness must be qualified before use. If fixture preparation requires broader product refactoring, WER-1 stops with **STUDY-HARNESS RED** rather than modifying the product by momentum.

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

## 10. Pre-Owner harness qualification history

### First qualification attempt — STUDY-HARNESS RED

Exact harness proposal `0e2003b90b69e19dad9adeec34b3109f39c9af7a` passed Draft core/build and exact candidate provenance/launcher, while the existing pre-WER-1 browser suite remained **38/38 PASS**. The two new study-harness browser tests failed before any Owner run.

Root cause was fixture preparation, not WER-1Q behavior: several originally preregistered fixture construction commands attempted hidden extrusion through faces (`x+`, `y-`, `z-`) that are not exposed to the default/focused camera. The real app therefore correctly provided no Matter hit and the controller timed out waiting for a cell that was never authored.

No human UX evidence was observed. The policy order, density counts, task semantics, target role, 96 px radius and metrics therefore remain frozen.

Bounded correction before Owner evidence:

- fixture geometry only was changed so hidden setup uses faces exposed by the frozen default/focused camera (`x-`, `y+`, `z+`);
- pair counts remain exact at 7/7, 15/15, 27/27 and 53/53 Matter;
- fixtures remain trees, so candidate/interface counts remain matched at 6/6, 14/14, 26/26 and 52/52;
- each A target remains the terminal seam of the unique longest side branch;
- no R2 product/source/runtime/policy code was changed.

This correction must itself pass a new exact real-Chromium qualification before the Owner run.

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
