# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-18. Accepted material truth is through **ANVIL-08 / COMPLIANCE-RESOLUTION**. No next experiment is active yet.

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

Keep all of the following experiment-local:

- `NormalCompliancePatch`;
- its current area-normalized coefficient names;
- ANVIL-08 relation/compilation schemas;
- ANVIL-07 compatibility adapter used by ANVIL-08 runtime;
- 4-authored-patches → 1-runtime-relation aggregation.

Do **not** promote a generic compliant surface/property field, Bond or Relation into `src/foundation` from ANVIL-08 alone.

ANVIL-08 does not prove arbitrary resolution invariance, shear/bending/torsion, rotationally free distributed compliance, heterogeneous patches, contact-loaded compliance, damage/plasticity, compliant REBIND, transient control, signals or power.

## Current strategic frontier

No experiment is active. The planned representation/scaling challenge is complete, so the Research Compass composition rule now applies.

Ranked horizon:

1. **ACTIVATE** — leading strategic candidate. Test transient control over already-earned persistent local function/mechanical semantics, preferably by driving existing TORQUE/TORQUE-PATCH through BEARING without mutating construction truth or leaking Box3D motor/control state into authored ontology.
2. compliant **REBIND / continuity** — later, unless new evidence raises it above composition.

Do not add another isolated compliance primitive/resolution merely because the previous experiment was green.

## Exact next action

Prepare, but do not yet implement, the ACTIVATE composition falsifier:

- distinguish persistent function/construction semantics from transient command/control state;
- define the smallest activation lifecycle (off/on, command sign/magnitude, reset/restart meaning) that can produce a discriminating result;
- reuse accepted TORQUE/TORQUE-PATCH causal mechanics where possible instead of inventing a new actuator;
- decide how transient state is supplied without becoming persistent matter identity;
- design negative controls proving zero command leaves persistent function inert and reversed command reverses causal response;
- explicitly prevent authored Box3D motor IDs/settings from entering truth;
- freeze quantitative gates and non-claims before implementation;
- only then create/activate the next experiment.

## Process boundaries

- `AGENTS.md` — truth hierarchy and implementation cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift method.
- `docs/CURRENT_HANDOFF.md` + `.anvil/project-state.json` — current takeover state.
- `docs/FOUNDATION.md` — only already-earned reusable boundaries.

Known non-blocking infrastructure debt remains unchanged: no server-side main protection, production build still writes historical Forge manifest, and Node test registration is manually enumerated.
