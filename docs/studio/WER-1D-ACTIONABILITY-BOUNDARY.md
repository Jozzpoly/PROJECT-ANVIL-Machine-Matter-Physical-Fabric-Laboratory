# WER-1D — Actionability Boundary / Disclosure–Interaction Feasibility Gate

Status: **ACTIONABILITY COUPLING REQUIRED / BOUNDED DISCLOSURE EXPERIMENT VIABLE / WER-1 IMPLEMENTATION NOT STARTED**.

Branch: `recovery/r2-direct-world-grammar`.

Upstream records:

- `RC1-CLOSE-R2-DISPOSITION.md`
- `WER-0-AUTHORING-EMBODIMENT-DISCOVERY.md`
- `WER-1C-TARGET-DISCLOSURE-EXPERIMENT-CONTRACT.md`

This record supersedes only the **execution-readiness claim** of WER-1C. It does not erase WER-1C as methodological history. The later critical validation found that its presentation-only firewall was too strong for the live interaction substrate.

WER-1D does not implement disclosure variants, alter source/runtime semantics, publish an Owner candidate, redesign Meaning grammar, or authorize merge.

## Question

> Can potential actionability be conditionally disclosed in a perceptually and interactively truthful way while preserving Owner Authority, or are presentation and interaction so coupled that the proposed WER-1 disclosure experiment is incorrectly posed?

A secondary question is deliberately adversarial:

> If coupling is required, is that already evidence that `B → compatible shared interface` is the wrong Meaning grammar, or can a bounded affordance/hit coupling test the disclosure hypothesis without redesigning the grammar?

## Why this gate exists

WER-1C correctly fixed several methodological problems:

- it stopped claiming that embodiment had already been established as the dominant cause of first-Bearing friction;
- it separated neutral information load from active target acquisition;
- it rejected runtime-approved `valid target` semantics;
- it bounded Owner evidence to post-learning workflow rather than naive first-use;
- it introduced matched-but-nonidentical scenes and balanced order.

Its later validation nevertheless found two live-substrate gaps:

1. hiding a potential interface while retaining the current global interface hit record can create an **invisible interaction surface** because interfaces win hit priority over Matter;
2. `R2InterfaceHit` is not a pure potential-candidate type: the same type also represents some preserved/orphan authored Meaning referents.

Therefore WER-1C's rule `presentation changes; hit geometry / click priority stay fixed` cannot be treated as an unquestioned causal-isolation invariant.

---

# 1. Live interaction decomposition

The current executable head before WER-1D is the RC1 product plus docs-only records. WER-1D verifies the interaction path against that live code rather than inferring it from the research narrative.

## 1.1 World hit classes

Current `world.ts` exposes three public hit shapes:

- `R2MatterHit`
- `R2InterfaceHit`
- `R2MeaningHit`

But these shapes are **presentation/interaction implementation classes**, not a final domain ontology.

### `R2InterfaceHit` currently covers at least two semantically different cases

1. an actual interface between two currently adjacent Matter cells;
2. a preserved/orphan Bearing referent where only one authored Bearing endpoint still has surviving Matter.

The second case is intentionally world-reachable authored Meaning evidence, not merely a place where a new Bearing may be authored.

### `R2MeaningHit` currently covers standalone/single-anchor Torque locality

A TorquePatch whose own authored `cellId@face` survives while no shared-interface/Bearing representation carries it is represented as `R2MeaningHit`.

The current type boundary therefore does not equal:

> interface hit = potential actionability

and must not be used that way in WER-1.

## 1.2 Hit priority

Current `R2WorldCanvas.hit()` checks:

1. `#interfaceHits`;
2. `#meaningHits`;
3. `#matterHits`.

Interface records also receive a screen-space tolerance beyond their rendered centre/radius.

Consequence:

> a hidden interface record that remains in `#interfaceHits` can still capture pointer input before the visible Matter surface beneath it.

Therefore a policy that only hides the glyph while leaving the global candidate hit substrate unchanged is not perceptually truthful.

## 1.3 Generic app dispatch

Current `app.ts` routes any `R2InterfaceHit` through `applyInterfaceIntent()` before normal Matter authoring.

Under Bearing intent, that function calls:

`workspace.addBearing(hit.endpointA, hit.endpointB, defaultAxis(...))`

without first asking realization whether the Bearing will be mechanically usable.

This direction of authority is intentional for normal compatible shared interfaces: author first, then realization may report `RIGID_BYPASS`, duplicate conflict or other evidence.

But because orphan Bearing referents also use `R2InterfaceHit`, generic dispatch has a wider implementation behavior than the governing R2 grammar. An active Bearing intent on such an orphan hit can write another Bearing carrying an endpoint that no longer has Matter. `FreedomWorkspace.addBearing()` accepts the authored endpoints; later realization classifies the missing-Matter locality as `INVALID_LOCALITY`.

This is evidence that:

> **`what current generic dispatch happens to accept` is not an adequate definition of a WER-1 candidate.**

The governing R2 grammar is narrower: `B` authors on the next **compatible shared interface**. Preserved unresolved Meaning remains reachable because it is authored truth, not because it should automatically become a candidate for another Bearing.

## 1.4 P1 semantic-envelope adapter

`blind-test-readiness.ts` adds a bounded semantic-pixel recovery probe only for already-authored Meaning. It explicitly accepts an interface only when it carries Bearing/Torque IDs or a `meaning` hit carrying Torque IDs.

This adapter therefore does not justify keeping empty hidden candidate interfaces globally clickable. Its purpose is to reconnect the visible authored Bearing/Torque envelope to the already-authored semantic hit, not to create latent potential-action targets.

---

# 2. Minimal experiment ontology

WER-1 does not need a final Machine Matter ontology. It does need a local experimental distinction strong enough to avoid confusing authored truth with potential actionability.

Use the following three classes inside the experiment only.

## A. Authored Meaning referent (`M`)

A truthful world representation of Meaning that already exists in authored source.

Examples:

- Bearing on a current shared seam;
- duplicate/conflicting Bearings on a seam;
- preserved orphan Bearing at its surviving endpoint;
- standalone/single-anchor Torque at its surviving `cellId@face`.

Requirements:

- persistent enough to remain truthful/reachable according to the accepted RC1/D6 foundation;
- not suppressed merely because realization is invalid/partial;
- not reclassified as only a potential target.

## B. Potential Bearing opportunity (`P`)

For the bounded WER-1 Bearing experiment:

> a topological shared interface between two **currently adjacent authored Matter cells** across opposite faces, irrespective of whether a Bearing already exists there and irrespective of expected runtime realization quality.

Important consequences:

- a seam already carrying a Bearing is still a `P`; another Bearing must remain authorable so `DUPLICATE_SEAM` remains possible;
- a seam that would later yield `RIGID_BYPASS` is still a `P`;
- an orphan Bearing referent with a missing Matter endpoint is `M` but **not `P`**;
- runtime viability is never used to filter `P`.

This definition is derived from authored topology, not from `R2InterfaceHit` identity and not from realization success.

## C. Matter action surface (`S`)

A visible authored Matter face used by the normal Matter build/extrusion grammar.

`S` must not be silently shadowed by an invisible `P`.

---

# 3. State/action matrix

The matrix below records the current live behavior and the boundary WER-1 must respect.

| World location | Current representation | Current neutral behavior | Current Bearing-intent behavior | Experimental classification |
| --- | --- | --- | --- | --- |
| Adjacent Matter seam, no Meaning | `R2InterfaceHit` + seam marker | interface wins hit; opens empty Local Interface context | authors Bearing | `P` |
| Adjacent seam with Bearing/Torque | `R2InterfaceHit` carrying Meaning IDs + semantic glyphs | selects local authored Meaning/interface | can author another Bearing and preserve resulting conflict | `M + P` |
| Orphan Bearing, one Matter endpoint survives | `R2InterfaceHit` carrying Bearing ID | selects preserved authored Meaning | generic current dispatch can author another invalid-locality Bearing | `M`, **not P** |
| Standalone single-anchor Torque | `R2MeaningHit` | selects persistent Torque locality | not a Bearing candidate | `M` |
| Exposed Matter face | `R2MatterHit` | starts build/extrusion | current one-shot intent prevents ordinary Matter authoring | `S` |
| Runtime Matter | runtime Matter hit | n/a | n/a | physical Hand/runtime path; outside WER-1 |

The orphan-Bearing row is especially important: it demonstrates why implementation hit classes cannot be promoted into experiment semantics by inertia.

---

# 4. Competing hidden-actionability models

## Model A — hidden but globally active

Policy:

- potential seam glyph can disappear;
- the corresponding candidate hit remains globally present with current priority/tolerance.

### Advantages

- smallest visual-only code change;
- preserves current click routing exactly.

### Falsification

This model is **RED** on the current substrate.

Reason:

- the user can see Matter but click an invisible higher-priority interface;
- neutral Matter authoring may therefore be intercepted by something no longer perceptually disclosed;
- a clean-looking N1 world could appear to improve visual legibility while worsening interaction truthfulness.

That is not acceptable as an experimental control and is not rescued by saying that authored actionability still technically exists.

## Model B — disclosure-coupled activation

Policy:

- potential `P` may exist as computed topology when not visually disclosed;
- undisclosed `P` does **not** capture normal world input;
- when the current action policy discloses `P`, that same affordance becomes interactive with the pre-registered spatial tolerance;
- authored `M` remains persistent/reachable independently of potential-candidate disclosure.

### Consequence

This is no longer a pure presentation-only experiment.

It changes a bounded presentation–interaction coupling:

> **perceptually active potential affordance ↔ interactive potential affordance.**

It does **not** need to change:

- source schema;
- Bearing/Torque identity;
- realization/runtime;
- Owner Authority;
- exact delete;
- `B → compatible shared interface` one-shot grammar.

### Verdict

**VIABLE and current-best experiment boundary.**

## Model C — richer action-coupled Meaning instrument

Policy family:

- entering Meaning intent creates a more direct temporary instrument: geometric seam manipulation, explicit joint handle, gesture, local physical opening/separation, or another affordance whose signifier and operation are inseparable.

### Strength

This may ultimately be more ANVIL-native than screen-space target markers.

### Why it is not selected yet

- it changes more than necessary to falsify the cheaper disclosure hypothesis;
- it would mix representation, manipulation grammar and potentially axis authoring;
- RC1 already demonstrates fast repeated Bearing authoring after initial acquisition, so a larger grammar/instrument redesign is not yet earned.

Model C remains the strongest alternative if Model B fails.

---

# 5. WER-1D disposition

## Pure presentation-only disclosure

### **NOT VIABLE on the current interaction substrate**

The WER-1C invariant `hide/show presentation while preserving all potential hit geometry and click priority at all times` is superseded.

That invariant produces invisible interaction in quiet states and relies on an implementation hit type that conflates potential seams with preserved authored Meaning.

## Minimal affordance coupling

### **REQUIRED**

Potential actionability must be perceptually and interactively coupled strongly enough that an undisclosed potential target does not secretly intercept normal Matter work.

This is a bounded coupling result, not evidence that final Meaning grammar must change.

## Meaning grammar redesign

### **NOT ESTABLISHED**

The evidence does not yet require abandoning `B → compatible shared interface`.

The stronger H2 claim — that perception and action require a fundamentally different Meaning instrument — remains a live alternative, not the current verdict.

## R2 substrate suitability

### **ADEQUATE FOR A BOUNDED EXPERIMENT; NOT A FINAL ARCHITECTURE**

A WER-1 harness can compute `P` from authored adjacent Matter topology separately from persistent `M` and route input according to an experiment policy.

No evidence currently requires a broad `world.ts` refactor or final generic hit ontology merely to run the experiment.

Any implementation should remain experiment-local and must not generalize `R2InterfaceHit` as a permanent domain abstraction.

---

# 6. Corrected experiment invariants

WER-1C's fixed-substrate firewall is retained where it protects real causality, but its hit rule is replaced.

Keep fixed across variants:

- authored source semantics;
- realization/runtime behavior;
- diagnostics;
- identity/exact-delete semantics;
- current Bearing source endpoint semantics;
- `B` one-shot intent itself;
- Matter renderer and camera unless an independent blocker is demonstrated;
- existing authored Meaning glyph language;
- no runtime-success filtering;
- no automatic repair;
- Pages promotion policy.

Replace:

> same global hit geometry / click priority whether a candidate is shown or hidden

with:

> **same candidate topology and same pre-registered interaction tolerance whenever that potential affordance is perceptually active; undisclosed potential candidates must not capture input.**

Additional invariant:

> persistent authored Meaning referents are not removed by potential-candidate policy.

The experiment compares **actionability disclosure policy**, not pixels detached from interaction.

---

# 7. Corrected Bearing candidate routing

For the bounded first experiment, scope active acquisition to **Bearing only**.

Reason:

- RC1's strongest friction evidence concerns first Bearing acquisition;
- Torque has much weaker Owner evidence and different authored target semantics;
- mixing Bearing and Torque candidate rules would reopen the candidate-boundary problem immediately and reduce causal clarity.

Torque remains persistent authored truth where present, but Torque target-disclosure optimization is deferred.

## Neutral state

Potential `P` can be handled differently by experimental policy:

- baseline control may preserve current persistent seam affordance and current interface interception;
- quiet-neutral variant suppresses potential `P` both perceptually **and as a potential-action hit**.

Persistent authored `M` remains directly reachable.

Matter `S` therefore receives normal neutral input where no persistent authored Meaning referent legitimately takes precedence.

Important claim correction:

> Quiet neutral is not a pure visual-information manipulation. It is a **neutral actionability policy** whose visual and potential-hit states are coupled.

WER-1 must not claim otherwise.

## Bearing intent — global disclosure

- compute all `P` from current adjacent Matter topology;
- disclose all `P`;
- disclosed `P` becomes interactive using one frozen spatial tolerance;
- do not filter seams carrying existing Bearing/Torque;
- do not filter by `RIGID_BYPASS` or predicted realization quality.

When `M` and `P` coincide on an already-authored seam, the active Bearing intent must still be able to author the duplicate/conflict. That preserves the current Owner-Authority behavior being tested.

## Bearing intent — local wake-up

- use the same complete topological set `P`;
- compute candidate proximity without treating undisclosed `P` as normal hit targets;
- disclose/activate only candidates meeting the pre-registered local wake criterion;
- a candidate becomes interactive together with its visible affordance;
- no runtime-success recommendation/filtering may influence wake-up.

This model is testable without claiming that candidates outside the current wake region ceased to exist as authoring opportunities. Moving the work locus can disclose them; the global authored opportunity set remains unchanged.

---

# 8. What happens to the original WER-1C subtests

## Subtest N

Original name/question:

> Neutral Information Load — does persistent candidate presentation make authored truth harder to read?

Corrected interpretation:

### **Neutral Actionability Load**

Because candidate visibility and candidate hit activation must remain coupled, N0 vs N1 can no longer claim to isolate pixels alone.

It may legitimately ask:

> does a quiet neutral world, in which non-authored potential Bearing opportunities are neither visually foregrounded nor input-dominant, improve Owner reading/workflow relative to the current persistent-interface control?

Any conclusion must use that bounded wording.

## Subtest A

The global-vs-local active acquisition comparison remains viable with one crucial correction:

- candidate topology is the same;
- candidate interaction tolerance is the same **when disclosed**;
- undisclosed candidates do not remain secretly clickable;
- authored Meaning remains persistent.

This still compares disclosure strategy while preserving Owner authority over the full topological candidate set.

---

# 9. Executable guards required before any Owner WER-1 trial

A future WER-1 implementation is not Owner-testable until automation demonstrates at minimum:

1. **quiet neutral has no invisible candidate capture** — clicking the visible Matter surface at a dormant empty seam follows normal Matter behavior rather than opening/authors through an unseen candidate;
2. **disclosed Bearing candidate is interactive** with the frozen tolerance;
3. **candidate topology parity** — global and local policies derive the same full adjacent-Matter `P` set before policy masking;
4. **duplicate remains authorable** — a seam already containing a Bearing is still `P` and active `B` can author another Bearing/conflict;
5. **runtime-success filtering absent** — a topological `P` that later yields `RIGID_BYPASS` remains available;
6. **orphan Bearing remains authored Meaning** — its surviving referent remains reachable as `M` and is not counted as a normal adjacent-Matter `P` merely because current code represents it as `R2InterfaceHit`;
7. **single-anchor Torque remains authored Meaning** and is not lost when potential Bearing candidates are suppressed;
8. **PARTIAL RUN remains allowed** and source/runtime authority is unchanged;
9. **P1 authored-Meaning semantic envelope remains truthful** and is not repurposed as potential-candidate magnetism;
10. **policy metadata is inspectable for evidence** without priming the Owner during the trial.

A failure in these guards is a protocol RED, not evidence that a visual policy won or lost.

---

# 10. Is a WER-1D micro-spike necessary?

## **NO**

The live code is sufficient to resolve the feasibility boundary:

- hit priority proves hidden-but-active candidates can intercept Matter;
- the interface-construction paths prove `R2InterfaceHit` conflates current shared interfaces and preserved orphan Meaning;
- generic app dispatch plus permissive source writes prove current hit acceptance is wider than the governing `compatible shared interface` grammar;
- candidate topology can be defined directly from the same current adjacent-Matter relation already computed by the world/presentation layers.

A code spike inside WER-1D would therefore measure implementation convenience rather than answer an unresolved feasibility question.

Implementation belongs to a separately selected WER-1 qualification spike.

---

# 11. Epistemic correction to WER-1C

WER-1C remains useful for:

- trained-Owner claim limits;
- order/carry-over controls;
- matched-scene discipline;
- permission-safe/no-runtime-filtering principle;
- evidence and routing budget.

The following WER-1C claims are superseded by WER-1D:

1. `EXPERIMENT READY` as an unconditional execution authorization;
2. `addressable candidate = same R2InterfaceHit class`;
3. `same hit geometry/click priority` even while a potential candidate is undisclosed;
4. A-L rule that candidates outside the visible wake region remain secretly clickable.

Current combined status becomes:

> **WER-1 experiment concept is viable only as an actionability-coupled Bearing disclosure experiment under WER-1D. The original presentation-only contract is not execution-authoritative.**

---

# 12. Alternative hypothesis retained

The strongest alternative remains:

## H2 — Action-coupled Meaning Instrument

A future better system may make Meaning perception and manipulation one richer direct instrument rather than expose transient target glyphs around the existing B/T grammar.

WER-1D does not reject H2.

It finds only that a smaller experiment still exists:

> couple potential-target visibility with potential-target activation while leaving source/runtime and the one-shot Bearing grammar unchanged.

If that bounded experiment fails to materially improve acquisition/legibility, continuing to polish target disclosure is no longer justified. At that point H2 / Meaning Interaction Instrument Research becomes the stronger route.

---

# WER-1D verdict

## **ACTIONABILITY COUPLING REQUIRED / BOUNDED DISCLOSURE EXPERIMENT VIABLE**

The current evidence rejects a hidden-but-interactive potential target field.

It does **not** reject the disclosure hypothesis as a whole and does **not** yet require Meaning grammar redesign.

The smallest truthful next experimental model is:

> **persistent authored Meaning + dormant potential Bearing opportunities in neutral quiet state + perceptually/interactively coupled candidate activation under Bearing intent.**

Candidate membership is derived from authored adjacent-Matter topology, never from realization success and never from the current generic `R2InterfaceHit` type alone.

The existing R2 substrate is adequate for a bounded experiment-local harness; a broad architecture refactor is not earned.

## Next candidate — selected conceptually, not started

A separately selected stage may implement and qualify:

### **WER-1 — Bearing Actionability Disclosure Spike**

using the corrected WER-1C methodology plus the WER-1D actionability boundary.

That stage must first satisfy the executable guards above before any Owner comparative trial.

## Natural stop

WER-1D ends after:

- live interaction decomposition;
- candidate-vs-Meaning boundary definition;
- adversarial comparison of hidden-actionability models;
- feasibility disposition;
- repo-native record and read-only state verification.

Do not automatically:

- implement WER-1;
- add policy switches/fixtures/telemetry;
- change `world.ts` hit architecture;
- redesign B/T grammar;
- alter Matter rendering;
- publish a new Owner page;
- merge R2.
