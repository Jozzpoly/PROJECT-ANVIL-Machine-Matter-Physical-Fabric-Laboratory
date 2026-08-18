# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-19. Accepted material truth is through **ANVIL-08 / COMPLIANCE-RESOLUTION**. **ANVIL-09 / ACTIVATE** now has a frozen preflight on Draft PR #14 but no executable result yet.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and executable evidence;
2. direct owner validation when required;
3. `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` as checkpoint claims verified against live Git;
4. this memory and canonical project documentation;
5. historical conversation/donor documents only as leads.

ANVIL tests **Machine Matter / Physical Fabric**: persistent authored matter and local physical intent compile into disposable runtime representations. Runtime bodies, colliders and joints are interpretations, not construction identity. The current cubic-cell dialect is a laboratory dialect, not final ontology.

## Accepted capability stack

- **ANVIL-00 / COLLAPSE** — persistent matter can compile into reduced rigid runtime representation.
- **ANVIL-01 / CUT** — bounded mass-preserving runtime topology replacement with source identity and rigid-field motion transfer.
- **ANVIL-02 / BEARING** — one local authored rotational interface can derive two rigid islands plus a passive revolute relation.
- **ANVIL-03 / REBIND** — persistent bearing semantics can be reconstructed onto changed disposable runtime bodies after a nearby moving CUT.
- **ANVIL-04 / LOAD-REBIND** — bounded loaded reconstruction without migrating Box3D joint cache and without gross first-step shock.
- **ANVIL-05 / TORQUE** — signed persistent active intent can create causal mechanical work through BEARING without authored Box3D motor semantics.
- **ANVIL-06 / TORQUE-PATCH** — local source-face placement can resolve the existing BEARING without an authored bearing reference.
- **ANVIL-07 / ELASTIC-SEAM** — one frozen local compliant seam can deform and restore while remaining distinct from rigid/free controls.
- **ANVIL-08 / COMPLIANCE-RESOLUTION** — in the frozen one-dimensional fixture, area-normalized local normal compliance preserves the same macroscopic response under an exact 2x authored source refinement without per-patch retuning, while four authored patches may compile to one disposable runtime relation.

Exact experiment metrics and artifact identities live in corresponding evidence files under `docs/experiments/`.

## Latest accepted promotion identity

ANVIL-08:

```text
preflight head          a1e1000cfd6b40c9e84e2d86a4f735f37205af9f
A/B source/run          60efa6a7b526223eb5de58d294dee03563dc64ff / 32190374538
C0 source/run           e0cdb9e4e1397042f012ae532dddc7e0e5816d05 / 32190721229
hardening source/run    5f0c0db3cdf7eed79c9c1fc00e3c7e1ef1817201 / 32190959941
Ready run               32191041240
Ready synthetic merge   92d4eb6677a9029bafea0a19b2185c4de479a95d
qualified tree          00230b73e283bdb39eedc3df00299b6d14c5aba9
material merge          78bcee7665b7a1642ca5f70014a3d0fb25c0aa1a
evidence grounding      04b6429a7d714b0595d5b7b550bc9ca587dbd904
```

Ready core: 44/44 PASS + production build PASS. Candidate: exact staging artifact consumed, launcher self-test PASS, 19/19 Chromium PASS. The actual merge tree is identical to the Ready synthetic tree.

## Strongest architectural lessons

- Authored identity must remain separate from runtime body/joint identity.
- Runtime representation may have different topology and resolution from authored matter.
- Locality should resolve physical relationships when geometry genuinely supplies the missing meaning.
- Box3D is a lowering target, not ontology.
- Passing experiment-local semantics does not automatically earn generic Bond, Relation, Surface, FUNCTION, Control or property-field architecture.
- Composition, not a catalog of isolated primitives, is the long-term test.
- ANVIL-07's discrete whole-seam `N/m` / `N*s/m` values were not honest resolution-independent authored material meaning by themselves.
- ANVIL-08 supports one bounded area-normalized alternative: derive patch contribution from physical face area so exact 2x source refinement preserves aggregate normal compliance.
- The fine ANVIL-08 source having four authored patches while the solver uses one relation is direct bounded evidence that authored resolution need not shadow solver resolution one-to-one.
- This 4→1 reduction is only justified by the frozen 1D kinematics. It must not be generalized to rotationally free/shear/distributed cases without new evidence.

## ANVIL-08 bounded result

Frozen candidate:

```text
COARSE: 7 cells @ 0.5 m, 1 authored patch
FINE:   56 cells @ 0.25 m, 4 authored patches
K_n:    40000 N/m^3
C_n:    7200 N*s/m^3
aggregate candidate k/c at both resolutions: 10000 N/m / 1800 N*s/m
```

Loaded extension under frozen 1000 N / 180-step schedule:

```text
COARSE_AREA                  0.09999978542327881 m
FINE_AREA                    0.09999978542327881 m
FINE_FIXED_PATCH_CONTROL     0.024999499320983887 m
```

Recovered candidate extension after 120 unloaded steps:

```text
COARSE_AREA  -0.0000023245811462402344 m
FINE_AREA    -0.0000023245811462402344 m
```

The intentionally wrong fixed-per-patch control demonstrates that simply copying the old whole-seam spring to every fine face changes macroscopic behavior strongly enough for the fixture to detect the error.

Do not reinterpret exact candidate equality as continuum convergence. The accepted scope is this one exact 2x refinement and isolated 1D mode.

## Promotion / abstraction stance

Keep all ANVIL-07/08 compliant source/relation schemas experiment-local. Do **not** promote a generic compliant surface/property field, Bond or Relation into `src/foundation` from ANVIL-08 alone.

ANVIL-08 does not prove arbitrary resolution invariance, shear/bending/torsion, rotationally free distributed compliance, heterogeneous patches, contact-loaded compliance, damage/plasticity, compliant REBIND, transient control, signals or power.

## Active frontier — ANVIL-09 / ACTIVATE

Draft PR: **#14**  
Branch: `experiment/anvil-09-activate`  
Frozen preflight source: `d5d3241ad40081d1fa5e80cef1dcf2e451ed7b70`  
Status: **FROZEN BEFORE IMPLEMENTATION / NO EXECUTABLE RESULT YET**.

The primary falsifier is deliberately narrow: one unchanged persistent local TORQUE-PATCH with signed `+100 N*m` effort is compiled once, while runtime-only binary activation switches `OFF -> ON -> OFF`. OFF means no active torque, not braking or target-zero-speed. A fresh runtime from the same persistent compilation must default OFF.

Important correction from preflight design: **no transient reverse command**. Signed `effortNm` remains persistent authored meaning; ANVIL-09 does not reinterpret it as a bidirectional capacity/rating.

Activation must remain experiment-local runtime state. It must not enter authored Matter/TorquePatch, persistent compiled schemas, foundation or Box3D motor ontology.

## Exact next action

Execute **Micro A/B only** on Draft PR #14:

- implement the smallest experiment-local OFF/ON activation boundary around the accepted TORQUE-PATCH compilation;
- preserve source and compilation immutability and reuse one compiled object;
- default runtime to OFF and fail closed outside OFF/ON;
- do not use Box3D revolute motor state, velocity setters or runtime IDs as control semantics;
- do not modify `src/foundation` or reinterpret accepted TORQUE/TORQUE-PATCH;
- run Draft/core validation;
- stop for checkpoint before real-solver C0-C3.

Later, only if A/B remains clean: execute frozen C0-C3 OFF/ON/OFF versus continued-ON real-solver control, then C4 reconstructed-default-OFF lifecycle probe, then meso audit and stop if the bounded question is resolved.

## Process boundaries

- `AGENTS.md` — truth hierarchy and implementation cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift method.
- `docs/CURRENT_HANDOFF.md` + `.anvil/project-state.json` — current takeover state.
- `docs/FOUNDATION.md` — only already-earned reusable boundaries.

Known non-blocking infrastructure debt remains unchanged: no server-side main protection, production build still writes historical Forge manifest, and Node test registration is manually enumerated.
