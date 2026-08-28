# WER-0 — Authoring Embodiment Discovery / World Legibility Gate

Status: **EMBODIMENT DOMINANT / GRAMMAR CONTRIBUTION UNRESOLVED / NEXT SPIKE SELECTED, NOT STARTED**.

This is a research/disposition stage after `RC1-CLOSE`. It does not implement a redesign, change R1/R2 semantics, modify physics/runtime, or authorize merge.

## Question

How should the authored ANVIL world communicate Matter, topology, actionable interfaces and existing Meaning so that:

- first-use spatial targets are easier to discover;
- larger authored worlds remain perceptually legible;
- existing Meaning remains truthful and world-reachable;
- normal work remains world-primary and fast;
- added clarity does not become tutorialization, permission workflow or panel dominance?

A second question is deliberately adversarial:

> Is the first-use friction actually an embodiment/signifier problem, or does the underlying `intent → spatial target` interaction grammar itself need to change?

## Evidence base

WER-0 reconciles:

1. `RC1-CLOSE-R2-DISPOSITION.md` accepted foundation and provisional embodiment split;
2. the ~186.6 s cold Owner first-touch recording and timestamped evidence ledger;
3. current R2 rendering / hit-testing / semantic-presentation code on the post-RC1 branch;
4. mature CAD/direct-manipulation patterns from SketchUp, Rhino, Onshape, Blender and Fusion;
5. HCI work on direct manipulation, instrumental interaction, focus+context and semantic zoom;
6. adversarial comparison of competing representation families against the accepted Owner-Authority foundation.

The external systems are analogies, not authorities for ANVIL. Most are 2D-sketch or conventional CAD systems; focus+context literature is often visualization rather than authoring. Their repeated patterns are used to generate falsifiable hypotheses, not to justify copying their UI.

## Baseline diagnosis

### 1. First Bearing friction is real, but it collapses quickly

RC1 shows roughly:

- first Bearing target acquisition: ~9 s;
- second Bearing: ~1 s;
- later Bearings: repeatedly authored every few seconds in a much denser world;
- final state: 58 Matter, 9/9 Bearings, 1/1 Torque.

The Owner already knows that Bearing mode is active and the product says to click a shared interface. The uncertainty is primarily **where the valid spatial target is**.

This pattern does not prove that `B → click` is a good final grammar. It does, however, weaken the hypothesis that the grammar is the dominant cause of the first-use failure: once the spatial target concept is learned, the same grammar becomes much faster.

### 2. Current presentation encodes potential interfaces persistently

Current R2 has two overlapping layers:

- `world.ts` computes every shared interface, stores a hit target and renders a marker for it;
- `semantic-presentation.ts` additionally draws a seam target for every shared interface that has no authored Bearing/Torque.

The semantic adapter can detect whether an intent is active, but currently uses that mainly to **emphasize** the seam target. The empty seam target is still drawn in neutral authoring.

Therefore visual load grows with the number of shared interfaces even when the Owner is not trying to create Meaning.

### 3. Current Matter rendering is intentionally x-ray-like

Authored Matter uses translucent front-facing faces plus persistent edge strokes. At small scale this exposes cell structure. In the 40–58 Matter RC1 region, overlapping translucent branches, edges, grid and semantic marks compete for attention.

The issue is not merely color choice. The information policy is effectively:

> show cell-surface structure + potential interfaces + existing Meaning at the same time.

That is unlikely to scale perceptually without some form of prioritization, focus or level-of-detail.

## External research patterns

### A. Command-local inferencing instead of permanent target fields

Across several mature modeling systems, candidate geometry is often made more salient **in context of an active action**:

- SketchUp inference cues appear around the cursor and identify points/relationships while drawing;
- Rhino SmartTrack uses temporary points and tracking lines for the duration of a command;
- Onshape can “wake up” inference points/relations by hover while sketching and highlights the relation under consideration;
- Blender exposes active-tool / active-object gizmos conditionally instead of requiring every possible manipulator to remain visible.

The transferable pattern is not their exact visuals. It is:

> **potential actionability may be transient; authored truth should remain persistent.**

### B. Focus+context for dense 3D structure

Research on dense 3D mesh inspection explicitly identifies rendering all faces/edges as a clutter and occlusion problem. Focus+context techniques respond by giving the region of current interest richer representation while reducing surrounding detail, sometimes with level-of-detail.

The transferable hypothesis is:

> do not force the same visual density everywhere merely because the underlying data exists everywhere.

### C. Semantic zoom / multiscale representation

Zooming-interface work establishes a broader principle: details can change representation with scale instead of shrinking forever. For ANVIL this is a later-scale hypothesis, not an immediate implementation commitment.

### D. Direct manipulation and instruments

Classic direct-manipulation principles favor visible objects of interest plus rapid, reversible, incremental action. Instrumental Interaction additionally permits contextual tools/instruments mediating domain objects without requiring the domain itself to become a permanent control panel.

This supports the RC1-CLOSE correction: **world-primary does not require a dogmatic ban on every temporary lens, gizmo, local palette or instrument.** What must be avoided is mandatory workflow gravity away from the world or permission/repair structure.

## Information classes

WER-0 finds it useful to distinguish four information classes rather than drawing everything as one layer.

### I. Persistent authored truth

Should normally remain perceivable/reachable:

- Matter as the authored physical substrate;
- existing Bearing/Torque Meaning when a truthful world referent survives;
- local unresolved/conflict state sufficient to preserve truthful reachability.

### II. Potential actionability

Need not be permanently visible:

- every shared interface that *could* receive a Bearing;
- every local endpoint that *could* receive Torque;
- snapping/inference guides;
- possible axes/manipulation handles not currently relevant.

These are prime candidates for intent-, hover- or focus-gated disclosure.

### III. Local explanation / parameter detail

Can be conditional on selection/focus:

- exact diagnostic cause;
- numerical Torque value;
- Bearing axis editor;
- Rebind/Retarget/Delete commands.

The world should still show *that* a local Meaning/problem exists; detailed explanation does not need to occupy the world constantly.

### IV. Scale-dependent structure

May need representation that changes with camera distance or scene density:

- cell-level edges;
- internal/topological detail;
- repeated semantic annotations;
- fine diagnostic glyphs.

This is not permission to hide authored truth. It is a hypothesis that the same truth may need different visual encodings at different scales.

## Competing model families

### Model 0 — Persistent Interface Field (current baseline)

**Policy:** every shared interface remains marked in neutral authoring; intent mainly amplifies it.

**Strengths**
- all potential targets are visible without entering a command;
- straightforward hit-testing and mental continuity;
- no hidden target state.

**Weaknesses**
- potential targets compete with actual Meaning;
- visual load grows with adjacency count;
- empty-interface markers are not self-explanatory enough to solve the first Bearing immediately despite being visible;
- weak fit to the RC1 dense-world evidence.

**Disposition:** retain as control, not current-best direction.

### Model 1 — Intent-Gated Global Target Field

**Policy:** neutral world shows Matter + existing Meaning; empty potential interfaces are suppressed or nearly absent. When a relevant intent starts (`Bearing`, `Torque`, Rebind/Retarget), all currently valid target classes become visible, with hover/nearest target amplified.

**Strengths**
- directly connects action intent to where action can occur;
- preserves a global overview of valid targets during the command;
- neutral world becomes quieter;
- can be implemented without changing source semantics or the basic `B/T → click` grammar;
- mirrors a broad command-local inference pattern found in mature CAD tools.

**Risks**
- a dense world can still explode into many markers while intent is active;
- all-target reveal can look like a debug mode;
- requires careful distinction between “valid candidate”, “existing Meaning”, and “invalid/unavailable” without implying permission semantics.

### Model 2 — Wake-Up / Local Inference Field

**Policy:** neutral world shows persistent truth only. During an intent, targets become strongly visible only near cursor/hover/current local region; recently awakened references may persist briefly. Global candidates may be absent or extremely quiet.

**Strengths**
- scales visually much better in dense scenes;
- keeps attention near the Owner’s actual work locus;
- strong analogy to Rhino/Onshape/SketchUp inference behavior;
- naturally compatible with world-primary direct manipulation.

**Risks**
- may reproduce the *first target* problem if the Owner does not know where to begin hovering;
- moving disclosure can feel unstable or “magnetic”;
- poor design could hide legitimate alternatives and become an implicit recommendation system.

### Model 3 — Local Focus Lens / Focus+Context

**Policy:** the world remains globally calm; a local cursor/selection region reveals richer topology, interfaces, occlusion treatment and Meaning detail while surrounding context is simplified.

**Strengths**
- directly addresses dense-scene clutter and occlusion;
- can unify target acquisition and local explanation;
- does not require permanent global overlays.

**Risks**
- adds a new interaction instrument and therefore additional complexity;
- can create a moving “keyhole” if the focus region is too narrow;
- stronger architectural/rendering change than needed to test the first Bearing finding.

### Model 4 — Semantic / Density LOD

**Policy:** representation changes with screen scale or scene density. Close view exposes cell-level structure and local targets; distant/dense view emphasizes silhouette, larger structure and persistent Meaning while suppressing fine cell/interface detail.

**Strengths**
- most plausible family for much larger future worlds;
- aligns representation cost with perceptual scale;
- can preserve overview without drawing infinitesimal detail.

**Risks**
- threshold transitions may surprise the Owner;
- direct editability can become unclear when detail collapses;
- requires careful preservation of Meaning identity/reachability;
- too broad for the first bounded experiment.

### Model 5 — Topology-as-Physical-Form

**Policy:** encode seams, rigid-island structure and Meaning more directly into physical-looking surface/geometric treatment (grooves, separation, joint forms, material continuity) instead of abstract screen-space markers.

**Strengths**
- potentially the most ANVIL-native long-term direction;
- may make topology perceptible through the world itself rather than overlays;
- strong fit to a future “physical workshop” embodiment.

**Risks**
- highest risk of lying: current authored/recovered semantics do not yet define a final physical surface language;
- unresolved/conflicting Meaning can make a physical-looking seam ambiguous;
- large renderer/product redesign would confound representation with visual fidelity;
- premature before narrower disclosure experiments.

## Falsification: embodiment vs grammar

### Evidence supporting embodiment as the dominant current problem

1. First Bearing is slow even though the action is already active and the instruction says to click a shared interface.
2. The same `B → click` operation becomes fast after one successful spatial association.
3. Later use reaches 9 Bearings in a 58-Matter world without obvious persistent command confusion.
4. Current empty-interface markers are visible in neutral state yet still fail to make the first target immediately obvious; therefore “more permanent markers” is not a convincing answer.
5. External tools repeatedly make potential relationships more salient in command/hover context rather than equally salient at all times.

### Evidence that grammar is not exonerated

1. `shared interface` is an abstract category the Owner must learn.
2. Keyboard intent is prior knowledge for the current Owner and is not a naive-user discovery proof.
3. Repeating `B → click` at 9 Bearings does not establish ergonomics at 90 or 900.
4. Torque receives little Owner evidence.
5. If better target disclosure fails to materially reduce first-use hesitation, the grammar itself becomes the next suspect.

### WER-0 verdict

**EMBODIMENT DOMINANT / GRAMMAR CONTRIBUTION UNRESOLVED.**

The evidence is strong enough to justify testing a better signifier/disclosure policy *before* redesigning the Meaning authoring grammar. It is not strong enough to seal `B/T` as final.

## Selected next bounded experiment — NOT STARTED

### WER-1 — Target Disclosure A/B/C Spike

**Question**

Can command-local disclosure make the first valid Meaning target substantially easier to acquire while reducing neutral/dense visual noise, without changing source semantics or the `intent → world click` grammar?

### Fixed substrate

Use the same R2 source/realization/runtime semantics and the same underlying authored states. No new physics, Meaning kinds, source schema, repair flow, hierarchy or panel workflow.

### Variants

**A — Baseline**
- current persistent empty-interface field.

**B — Intent-gated global**
- neutral: hide/suppress empty potential interfaces;
- existing Meaning remains persistent;
- Bearing/Torque/Rebind/Retarget intent: reveal all valid candidate targets, with hover amplified.

**C — Intent-gated local wake-up**
- neutral: persistent truth only;
- active intent: reveal strong candidates only in a bounded cursor/local neighborhood;
- optionally retain an extremely quiet global cue only if variant C otherwise fails initial acquisition.

The experiment must keep visual style intentionally plain. Do **not** combine it with new lighting/materials, semantic zoom, new camera behavior or Context redesign; those would destroy causal attribution.

### Test scenes

Use identical authored states across variants:

1. 5-cell bar, no Meaning — first Bearing acquisition;
2. ~10–12 Matter with 2 Bearings + 1 Torque — existing Meaning vs candidate targets;
3. dense ~50–60 Matter branched scene — clutter/stress condition;
4. local unresolved/invalid Meaning — truthful persistent reachability must survive disclosure changes.

### Tasks / evidence

Primary behavioral questions:

- How quickly does the Owner identify the first plausible Bearing target?
- Does neutral authored world become materially easier to parse?
- During active Bearing intent, can the Owner still see enough alternatives to feel in control?
- In dense scenes, does candidate disclosure remain usable rather than becoming a sea of markers?
- Does existing Meaning remain perceptually distinct from merely possible targets?
- Does any variant create hidden-action anxiety, misleading “validity” semantics, or magnetic cursor behavior?

Prefer cursor/path/time evidence over aesthetic preference. Use a short Owner A/B/C session after the variants are qualified. Do not treat automation as proof of human legibility.

### Falsifiers

WER-1 should reject the embodiment-first hypothesis if:

- B/C do not materially reduce first-target search relative to A;
- hiding neutral candidate markers makes Owner understanding worse without compensating benefit;
- local wake-up causes repeated hunting because actionability is invisible until the cursor is already near the answer;
- valid-target presentation feels like permission filtering rather than affordance;
- the Owner still understands the operation poorly despite clear target disclosure.

If these occur, route next to **Meaning Authoring Grammar Research** rather than continuing visual polish.

### Stop condition

WER-1 ends after comparative evidence and one disposition:

- `INTENT-GATED GLOBAL CURRENT-BEST`, or
- `LOCAL WAKE-UP CURRENT-BEST`, or
- `BASELINE RETAINED`, or
- `GRAMMAR RED — embodiment insufficient`.

Do not automatically proceed into Matter-density/semantic-zoom work.

## Deferred research tracks

These remain important but are intentionally not folded into WER-1:

1. **Matter Density / Focus+Context** — opaque-vs-translucent hierarchy, edge density, local focus, density-dependent representation;
2. **Runtime Observation** — framing, spatial reference and moving mechanism comprehension;
3. **Meaning Physicalization** — whether Bearings/Torques can become more physically embodied and less glyph-like;
4. **Context Instrument Design** — how exact diagnostics/parameters remain available without panel gravity;
5. **Meaning authoring scale** — whether one-shot intents remain efficient beyond the current small counts;
6. **semantic zoom / LOD** — only after there is evidence that cell-level density is the limiting variable rather than renderer fidelity alone.

## Natural stop

WER-0 is complete when this research record is written and repository state is verified.

Do not automatically:

- implement WER-1;
- modify semantic presentation;
- change `B/T` grammar;
- redesign Matter rendering;
- add semantic zoom/focus lens;
- change runtime camera;
- republish Owner Pages;
- merge R2.
