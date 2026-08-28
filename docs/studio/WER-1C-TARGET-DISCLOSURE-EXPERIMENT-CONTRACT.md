# WER-1C — Target Disclosure Experimental Contract / Causal Isolation Gate

Status: **EXPERIMENT READY / CLAIM BOUNDED / WER-1 IMPLEMENTATION NOT STARTED**.

This is a methodological gate after `WER-0-AUTHORING-EMBODIMENT-DISCOVERY.md` and its critical validation. It does not implement target disclosure variants, change product semantics, alter rendering, publish an Owner candidate, or authorize merge.

## Purpose

WER-0 established a useful routing hypothesis: before redesigning Meaning authoring grammar, test whether the world can communicate spatial actionability more effectively.

The subsequent validation narrowed that result. The evidence does **not** yet establish that embodiment is the dominant causal source of first-Bearing friction. The cold Owner recording shows that the first Bearing takes materially longer than later Bearings, but without think-aloud it cannot distinguish learning **where the target is** from learning **what a shared interface / Bearing operation means**.

WER-1C therefore replaces the coarse claim:

> embodiment is the dominant cause

with the narrower justified claim:

> **an embodiment-first falsifier is justified before a grammar redesign.**

The purpose of this contract is to make that falsifier causally useful rather than merely visually persuasive.

## Central question

Can target-disclosure policy improve world legibility and post-learning spatial target acquisition **without**:

- changing Meaning/source semantics;
- filtering what the Owner is allowed to author;
- changing hit geometry;
- changing the `intent → world click` grammar;
- relying on repeated exposure to the exact same target location;
- confusing a one-Owner operational test with naive-user discoverability evidence?

If this cannot be tested cleanly enough, WER-1 must not be implemented merely because the variants sound plausible.

---

## 1. Epistemic boundary

### What the existing Owner can still test well

The Owner can provide high-value evidence about:

- legibility of a neutral authored world;
- interference between potential targets and already-authored Meaning;
- post-learning acquisition of a structurally specified target in a **new** scene;
- relative search effort, cursor hunting and wrong actions under different disclosure policies;
- whether a disclosure field feels informative, noisy, magnetic or permission-like;
- whether a policy damages the fast world-primary workflow already demonstrated in RC1.

### What the existing Owner can no longer test

The Owner cannot produce a second genuine first-ever Bearing discovery event. Prior ANVIL context and the RC1 session permanently contaminate claims about:

- naive first-use discoverability;
- whether a new user independently infers what `Bearing` means;
- whether a new user discovers the B shortcut;
- whether the phrase `shared interface` is self-explanatory.

Novel layouts can remove exact-pixel memory. They **cannot erase conceptual learning**.

Therefore WER-1 Owner evidence may support:

> `policy X improves post-learning target acquisition / legibility for the Owner`

but may not support:

> `policy X makes Bearing intuitive for a naive user`.

A genuine naive-user question requires a separate participant/stage if it later becomes decision-critical.

---

## 2. Permission-safe candidate semantics

The phrase **valid target** is prohibited in the WER-1 experimental contract because it can silently imply runtime approval.

Use **addressable candidate** instead.

### Definition

An **addressable candidate** is a truthful current world referent that the existing R2 authoring interaction can write the active intent to.

For the current Bearing/Torque interaction substrate this means the same `R2InterfaceHit` class already produced from an interface between adjacent authored Matter cells.

The candidate set is derived from the authored/world interaction substrate — **not from successful realization**.

### Non-negotiable consequence

Disclosure must not hide or downgrade an addressable candidate merely because authoring there may later produce:

- `RIGID_BYPASS`;
- `DUPLICATE_SEAM`;
- another conflict;
- unresolved runtime realization;
- `PARTIAL` evidence.

Current R2 writes a Bearing/Torque to the selected interface first and only then realizes/reports consequences. WER-1 must preserve that direction of authority.

The target field communicates:

> **you can address authored intent here**

not:

> **ANVIL approves this as a good or realizable choice**.

### Existing Meaning

Existing authored Meaning remains persistent and world-reachable whenever its truthful referent survives. Candidate disclosure is an additional transient actionability layer, not a replacement for persistent authored truth.

An interface already containing a Bearing remains addressable if the current authoring grammar would accept another Bearing there. The experiment may distinguish existing Meaning visually from candidate actionability, but may not remove the candidate because it predicts a duplicate/conflict.

---

## 3. Fixed substrate / confound firewall

Across WER-1 variants, keep fixed:

- R1/R2 authored/source semantics;
- `FreedomWorkspace` operations;
- realization/runtime behavior;
- diagnostic generation;
- Bearing/Torque identity and endpoint semantics;
- exact-delete behavior;
- `B/T → click` intent grammar;
- current Bearing/Torque authored glyph language;
- current Matter renderer;
- current camera and Focus behavior;
- Context behavior;
- hit geometry and click priority;
- runtime Hand;
- source generation/Undo/Redo;
- public Pages publication policy.

The spike may add **experiment-only instrumentation and presentation policy switches**.

Do not combine WER-1 with:

- new materials/lighting;
- opacity redesign;
- new edge rendering;
- semantic zoom;
- new camera framing;
- new Context layout;
- new Meaning kinds;
- physics changes;
- tutorial/onboarding additions;
- filtering candidates by realization quality.

If any of these becomes necessary merely to make a disclosure variant usable, record that as evidence that the original causal question was not isolated.

---

## 4. Why the original A/B/C protocol is insufficient

The WER-0 draft combined two effects in the same variant:

1. suppressing potential interfaces in neutral authoring;
2. changing how those interfaces are revealed once Bearing/Torque intent becomes active.

A positive result would therefore be causally ambiguous.

It also proposed identical authored states across variants. Reusing the exact same layout gives later trials an unfair advantage because the Owner can remember the target position.

WER-1C replaces this with two separate subtests plus matched-but-nonidentical scenes.

---

# SUBTEST N — Neutral Information Load

## Question

Does permanently drawing empty potential interfaces make a neutral authored world harder to read or make existing authored Meaning harder to distinguish?

This subtest does **not** activate Bearing/Torque intent.

## Policies

### N0 — Persistent candidates / current control

Current R2 behavior:

- empty shared interfaces remain visibly marked in neutral authoring;
- existing Bearing/Torque Meaning remains persistent.

### N1 — Quiet neutral

Change exactly one policy:

- suppress the presentation of empty potential-interface markers while intent is neutral;
- keep their underlying hit geometry and world interaction substrate unchanged;
- keep existing authored Meaning, unresolved truthful referents and local problem evidence persistent.

No other rendering difference is permitted.

## Human task family

Use matched authored scenes containing existing Meaning plus many empty interfaces.

Tasks should require reading **authored truth**, not hunting potential targets. Examples:

- select the existing Bearing on a structurally named branch;
- identify/select the only unresolved Meaning in a local region;
- distinguish an authored Bearing from nearby empty interfaces.

Do not identify the target with screen coordinates, a temporary highlight, a unique color added only for the test, or a tutorial arrow.

## Scene pairs

Use four matched scene pairs spanning increasing density:

1. small: approximately 5–7 Matter;
2. medium: approximately 10–15 Matter;
3. branched: approximately 20–30 Matter;
4. dense: approximately 50–60 Matter.

Each pair must be structurally comparable but not the same scene rotated in place. Pair members should have comparable:

- Matter count;
- number of addressable interfaces;
- number/type of authored Meaning;
- target depth/occlusion burden;
- viewport scale.

The exact layout must differ enough that the target pixel cannot be memorized from the paired trial.

## Order control

Use balanced pair order:

- pair 1: N0 → N1;
- pair 2: N1 → N0;
- pair 3: N1 → N0;
- pair 4: N0 → N1.

Do not reveal policy labels to the Owner during trials.

## Primary evidence

For each trial record:

- time from scene/task reveal to correct existing-Meaning selection;
- first-click correctness;
- number of wrong world/context selections before correct selection;
- cursor path length or equivalent search-distance proxy;
- task completion/failure;
- scene/policy/order identity.

Secondary Owner report after the block may describe clutter, confidence or perceived hierarchy, but preference is not a substitute for behavior.

## Interpretation

N1 is supported only if its benefit repeats across scene families and does not create a new inability to perceive persistent authored Meaning or understand the world.

A single visually impressive dense screenshot is insufficient.

---

# SUBTEST A — Active Spatial Acquisition

## Question

Once the Owner already understands the Bearing operation, is it better to expose all addressable candidates globally during intent, or wake them locally around the current work locus?

This is **post-learning spatial acquisition**, not first-use discoverability.

## Shared pre-intent state

All active-acquisition trials use **N1 quiet neutral** before the intent begins, regardless of the outcome of Subtest N.

Reason: the active-disclosure comparison must not inherit different amounts of pre-exposure to candidate locations.

The trial timer for acquisition begins only when Bearing intent becomes active.

## Policies

### A-G — Intent-gated global

When Bearing intent becomes active:

- reveal **all addressable Bearing candidates**;
- use the same underlying interface set and same glyph family for every candidate;
- hover/nearest target may receive the existing bounded emphasis;
- do not classify candidates by expected realization quality.

When intent ends, empty candidate markers disappear again.

### A-L — Local wake-up

When Bearing intent becomes active:

- use the **same candidate glyph family and same candidate set**;
- only candidates inside a fixed, pre-registered cursor/local neighborhood receive visible disclosure;
- candidates outside the neighborhood are not silently removed from authoring and remain clickable if reached through existing hit geometry;
- the local radius/criterion must be fixed before Owner trials and must not adapt to observed Owner behavior.

A-L intentionally tests the risk that local disclosure can become a moving keyhole and reproduce target hunting.

Do not add a faint global fallback after seeing Owner behavior. If pure local wake-up fails, that failure is evidence.

## Active-task family

Each trial asks for one structurally defined Bearing operation with a unique intended seam, for example:

> free the named end branch from the main body with one Bearing

The task may name structural parts of the scene but must not reveal the answer using:

- screen coordinates;
- a highlight placed on the target seam;
- a target-specific color;
- cursor teleportation;
- a label attached to the correct interface.

The Owner is allowed to make a wrong authored Bearing. The program must not prevent the action. Record it and allow the Owner to continue/recover naturally until the intended task is completed or abandoned.

## Scene pairs

Use four matched-but-nonidentical scene pairs spanning the same approximate density levels as Subtest N.

For each pair, the intended structural task must be equivalent in difficulty while the actual target position/layout differs.

Prequalification should verify at minimum:

- equal or near-equal candidate counts inside each pair;
- intended target is genuinely addressable in both scenes;
- intended target is not fully occluded at the starting camera;
- no scene contains an accidental unique visual cue that trivially reveals the target;
- target screen size/interaction geometry remains within a comparable range.

## Order control

Use balanced order:

- pair 1: A-G → A-L;
- pair 2: A-L → A-G;
- pair 3: A-L → A-G;
- pair 4: A-G → A-L.

This does not remove conceptual learning; that claim has already been surrendered. It balances ordinary practice/fatigue and removes exact-layout carry-over.

## Primary evidence

Record per trial:

- time from Bearing-intent activation to first click;
- time from Bearing-intent activation to correct task completion;
- first-click correctness;
- number of wrongly authored Bearings/actions before correct completion;
- cursor path/search-distance proxy;
- candidate hover/wake-up transitions where instrumentable;
- cancel/retry/re-entry events;
- task completion/failure;
- policy/scene/order identity.

Also preserve a raw screen recording of the block.

## Qualitative RED signals

Independently of timing, record whether the Owner reports or behavior shows:

- global disclosure becoming a sea of markers;
- local disclosure producing repeated blind hunting;
- cursor-local marks feeling magnetic or unstable;
- disclosure being interpreted as `these are the only places ANVIL permits`;
- existing authored Meaning becoming hard to distinguish from potential actionability.

---

## 5. Owner-Authority guard tests before human evaluation

The implementation is not Owner-testable until executable checks establish all of the following for every policy:

1. **same authored candidate set** — disclosure policy cannot change what `R2InterfaceHit`s exist;
2. **same hit geometry / click priority** — presentation cannot win by secretly enlarging or moving interaction regions;
3. **no realization filtering** — an interface whose authored Bearing later yields `RIGID_BYPASS` remains disclosed/addressable;
4. **conflict remains authorable** — an interface already carrying a Bearing is not hidden merely because another Bearing may produce `DUPLICATE_SEAM`;
5. **persistent Meaning remains persistent** — existing Bearing/Torque glyphs survive neutral suppression and active disclosure;
6. **truthful unresolved reachability survives** — unresolved/conflicting Meaning with a surviving referent remains world-reachable;
7. **RUN/Owner Authority unchanged** — no READY gate, repair queue or automatic source mutation appears;
8. **source/runtime semantics unchanged** — only experiment-local presentation/instrumentation differs;
9. **policy identity is inspectable in test metadata** but not priming the Owner during trials.

Any failure here is a protocol RED, not a UX result.

---

## 6. Scene prequalification

The experiment must not hand-author one scene that happens to favor a policy.

Before Owner testing, freeze a small deterministic scene set and record for every member:

- source fixture identity;
- Matter count;
- addressable interface count;
- authored Bearing/Torque counts;
- diagnostic state;
- starting camera;
- intended task/target identity where applicable;
- projected target visibility/size sanity check.

All policies run on the exact same frozen fixture definitions. Matched pair assignment and order are preregistered before the Owner sees the variants.

Do not tune scene geometry after observing which policy wins.

---

## 7. Decision rule / claim budget

This is an `n=1`, already-trained Owner comparison. Do not manufacture statistical certainty from small repeated trials.

A policy may become **current-best for the tested Owner workflow** only if:

- its behavioral advantage or non-inferiority repeats across multiple scene families rather than one lucky trial;
- it does not increase wrong-action/recovery burden enough to cancel the timing benefit;
- no Owner-Authority or reachability guard is violated;
- no major qualitative RED appears;
- raw video is consistent with the telemetry rather than contradicting it.

Do not use a universal numeric threshold as if the sample justified population statistics. Preserve per-scene results and direction of effect.

### Allowed conclusions

Examples of legitimate outcomes:

- `QUIET NEUTRAL SUPPORTED FOR OWNER WORKFLOW`;
- `PERSISTENT NEUTRAL RETAINED`;
- `GLOBAL ACTIVE DISCLOSURE CURRENT-BEST`;
- `LOCAL WAKE-UP CURRENT-BEST`;
- `NO MATERIAL ACTIVE-DISCLOSURE DIFFERENCE`;
- `DISCLOSURE RED — GRAMMAR/CONCEPTUAL FRICTION STILL SUSPECT`.

### Prohibited conclusions

WER-1 may not by itself claim:

- naive-user discoverability solved;
- Bearing grammar intuitive to new users;
- dense-Matter scalability solved;
- final Matter/Meaning visual language selected;
- final generic inference system selected;
- R2 merge readiness.

---

## 8. Routing after WER-1 evidence

### Route D — Disclosure supported

If quiet neutral and/or one active disclosure policy improves the tested Owner workflow without structural RED:

- record it as a bounded current-best disclosure policy;
- do **not** promote the experiment adapter as final architecture;
- select the next stage separately.

Dense Matter representation, runtime observation and Meaning physicalization remain distinct problems.

### Route G — Grammar/conceptual friction still suspect

If clear disclosure does not materially help acquisition, or the Owner still struggles to understand *what operation is being performed* despite clear spatial candidates:

- stop visual refinement;
- route to **Meaning Authoring Grammar Research**.

### Route N — Naive-user question becomes decision-critical

If Owner evidence is positive but the project needs a claim about first-use discoverability:

- stop extrapolating;
- design a separate naive-participant gate.

Do not use increasingly novel scenes with the Owner as a substitute for a new participant.

### Route P — Permission semantics contamination

If candidate disclosure can only become clear by filtering/recommending interfaces according to realization success:

- treat that as a foundation conflict;
- stop and redesign the experiment before product work continues.

---

## 9. WER-1 implementation boundary

If separately started, WER-1 should be an **experiment-local comparative harness**, not a broad R2 polish pass.

Preferred implementation shape:

- fixed fixture library;
- presentation-policy switch(es);
- trial/order metadata;
- lightweight timestamp/cursor/action telemetry;
- raw video capture by Owner;
- automated guard tests;
- no product-semantic changes.

The public RC1 Owner page should not be overwritten merely to develop the harness. Publication/promotion is a separate decision after candidate qualification.

---

# WER-1C verdict

## **EXPERIMENT READY / CLAIM BOUNDED**

The target-disclosure hypothesis is testable without first redesigning Meaning grammar, provided the experiment obeys this contract.

The key methodological corrections are:

1. **do not claim embodiment causality before the disclosure experiment runs;**
2. **separate neutral-information load from active spatial acquisition;**
3. **use addressable candidates, never runtime-approved `valid targets`;**
4. **hold hit geometry/source/runtime/grammar fixed;**
5. **use matched-but-nonidentical scenes and balanced order;**
6. **treat Owner evidence as post-learning workflow evidence, not naive-user evidence.**

The next candidate stage is therefore a bounded **WER-1 Target Disclosure implementation + qualification spike under this contract**.

It is selected as a candidate only and is **not started by WER-1C**.

## Natural stop

WER-1C ends after this contract is recorded and the docs-only repository state is verified.

Do not automatically:

- implement WER-1;
- alter `semantic-presentation.ts`;
- change Matter rendering;
- change B/T grammar;
- add onboarding;
- publish a new Owner candidate;
- merge R2;
- begin a naive-user study.
