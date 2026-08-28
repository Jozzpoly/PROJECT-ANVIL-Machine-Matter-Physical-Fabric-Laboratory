# RC1-P1 — Blind-Test Readiness / Confound Gate

Status: **ACTIVE / PREREGISTERED / DO NOT START OWNER TEST.**

Published P0 baseline: `b784444c9f29003b5def2d7203ffa2f2e85b9b30`.

## Question

Is the current R2 candidate a fair enough instrument for a cold Owner first-touch, or are there bounded prototype/test confounds that could make the Owner mainly measure the instrument defect rather than the product grammar?

This is not a polish pass and not an Owner Value gate.

## Falsifiers

### P1-A — visible semantic interaction geometry

A visible Bearing/Torque semantic mark must not materially promise an interaction surface that the world hit-test rejects. In particular, clicking a clearly rendered semantic pixel near the outer axis/arrow envelope must select the intended local meaning/interface rather than silently falling through to Matter authoring or another seam.

RED if a representative visible semantic pixel outside the tiny central marker causes a different authored action or cannot reach the represented local meaning.

### P1-B — dense-scene instrument viability

A representative 7+ cell scene with several Bearings/Torques, partial/conflict evidence, Context and RUN must remain mechanically operable and visually inspectable at normal desktop sizes. Rendered evidence is reviewed directly; screenshot existence or pixel difference alone is not a human-legibility proof.

RED only for an obvious instrument failure (severe overlap/occlusion, unreachable control, misleading hit behavior, broken render/runtime), not for taste, unfinished fidelity, or product awkwardness that RC1 is supposed to expose.

### P1-C — first-touch contamination

The first-touch surface must not tell the Owner the research conclusion. Embedded operational affordances such as control cues are product UI and may remain. Research/developer claims such as `Owner Authority core active` or assurances such as `no hidden meaning` are contamination candidates because they can prime interpretation rather than expose capability.

RED if first-touch or ordinary reset/starter feedback contains such research assertions.

## Allowed correction

Only bounded corrections required to make the instrument fair:
- interaction hit geometry matching already-visible semantics;
- removal/neutralization of research/developer priming text;
- obvious rendering/input defects discovered by the dense-scene pass.

Not allowed in P1:
- visual polish for taste;
- new onboarding/tutorials;
- new capabilities, physics, Meaning kinds, Save/Open, gravity/ground;
- redesign of R2 grammar;
- R2-wide seal/merge work;
- changes made merely because the Owner might dislike the current product.

## Evidence meaning

Automated assertions prove only the exact mechanical conditions they check. Dense rendered evidence is reviewed as an adversarial instrument audit, not as proof of human discoverability or value.

## Exit

- **RC1 READY** — no remaining demonstrated instrument blocker; exact candidate may be promoted/frozen for Owner first-touch.
- **BOUNDED RED** — demonstrated confound; apply minimum correction and repeat P1.
- **STRUCTURAL RED** — readiness requires changing the product hypothesis rather than fixing the instrument; stop and select a new stage.

After an RC1 READY verdict, stop. Do not begin the Owner test automatically.