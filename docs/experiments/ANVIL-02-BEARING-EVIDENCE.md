# ANVIL-02 / BEARING — Evidence Log

Status: **AUTOMATED EVIDENCE SUPPORTED THROUGH PRODUCTION BROWSER + FORGE V0.2; OWNER VERDICT PENDING**

PR: `#5 — ANVIL-02: bearing from a local authored interface` (draft; do not merge before owner gate).

## Research result so far

The current evidence supports this bounded statement:

> For the declared 7-cell fixture, one experiment-local authored bearing mark on two opposite adjacent source faces can causally split one rigid island into two disposable rigid bodies and compile one body-local rotational relation which stock Box3D lowers to a revolute joint. The relation preserves a shared pivot while allowing relative rotation, including after an arbitrary common rigid transform.

This is **not yet owner accepted** and is not a generic Relation/Joint/Constraint architecture.

## C0 — first executable bearing slice

Exact first proposal:

- source head: `825dba6e49f5057f3022cfcad29f21cdcf346b61`;
- PR synthetic checkout: `6701f1c41581b7ac3283fc30993206e758ea19b8`;
- Actions run: `32078765858`;
- artifact ID: `9304368827`;
- artifact SHA-256: `bee3703eaa021ffc6702742ad68ae8d804a78e01a9f81f961fa4c5f76af0170d`.

Predeclared C2/C3 thresholds after 120 fixed 60 Hz steps:

- constrained shared-anchor gap <= `0.0025 m`;
- identical no-relation control gap >= `0.25 m`;
- absolute relative revolute angle >= `0.35 rad`.

Observed:

```text
constrained anchor gap   0.00001546371140869226 m
no-relation control gap  1.3662249602059333 m
revolute relative angle  2.010232448577881 rad
```

Total Node result: **27/27 PASS**.

Interpretation: strongly discriminating identity-oriented fixture. The constrained gap is roughly 162x below its maximum; control separation and relative angle are both more than 5x above their minima.

## C5 — arbitrary common-transform covariance

Gate was declared before execution. The same compiled relation was instantiated after a common rigid transform:

- rotation `0.91 rad` about axis proportional to `(0.37, -0.81, 0.44)`;
- translation `(2.4, -1.3, 1.7) m`.

Box3D received only the already compiled `localAnchorA/B` and `localAxisA/B`. No authored/general frame system was added.

Exact execution:

- source head: `5f4854e7b6eb6bafd27e34077e5a3c44357421c2`;
- PR synthetic checkout: `10929ffa6f3a1e3387056cac3f85fde472484ac4`;
- Actions run: `32078964676`;
- artifact ID: `9304530155`;
- artifact SHA-256: `824a9c926e2b642148f0f02723e180a9d5aca72c1920be191b94f3f6c75c2232`.

Predeclared gates:

- initial transformed anchor mismatch <= `0.00001 m`;
- constrained gap <= `0.0025 m`;
- no-relation control >= `0.25 m`;
- absolute relative angle >= `0.35 rad`.

Observed:

```text
initial transformed gap  1.7889085181965112e-7 m
constrained anchor gap   4.252712514504838e-6 m
no-relation control gap  1.2319540243918932 m
revolute relative angle  1.0926251411437988 rad
transformed world axis   (-0.58009, -0.43362, 0.68954)
```

Run evidence: strict TypeScript PASS, **28/28** Node/Box3D PASS, build PASS, prior Forge launcher regression PASS, **7/7** existing Chromium regressions PASS.

Interpretation: **SUPPORTED FOR THIS COMMON-RIGID-TRANSFORM FIXTURE.** ANVIL-02 has not earned a need for a JURE-like explicit frame ontology. Adding one now would be speculative.

## D0 — production browser A/B gate

Build Web Apps was used as a workflow/design discipline after solver evidence survived. Browser plugin was unavailable, so real Playwright/Chromium was the documented rendered-QA fallback.

Owner-visible contrast:

```text
DERIVED BEARING          NO RELATION CONTROL
same 7 source cells      same 7 source cells
same 2 compiled bodies   same 2 compiled bodies
relation enabled         relation deliberately disabled
```

Projection is fixed; no camera-follow/interpolation is used to hide discontinuity.

### Negative browser-development evidence preserved

1. First browser implementation `3d0fa56b...` failed strict TypeScript because body lookup narrowing did not survive a closure. Strictness was not weakened; a `requiredCompiledBody()` boundary fixed it.
2. Next browser run exposed canvases at browser default `300x150`. Diagnostics showed the card itself was large, proving experiment CSS had not loaded. The successful route moved experiment CSS to the guaranteed entry chunk and added a computed-style gate rather than relaxing layout expectations.
3. After Forge owner UI was added, rendered QA exposed an over-stretched ~1397 px scene at a 900 px viewport because CSS grid stretched the viewport card to the taller panel. The final layout constrains viewport/panel independently rather than accepting the oversized result.

These are presentation/integration failures, not physics falsifications.

### Final bounded browser layout/evidence before grounding

Latest hardening source before this documentation commit:

- source head: `88ee3c75fe3931c20e738d520bf00be39e1a83f9`;
- PR synthetic checkout: `957ebc070ff1d44cc6ff65a5231a5fdfedabdc6a`;
- Actions run: `32080634137`;
- artifact ID: `9305011381`;
- artifact SHA-256: `ca2cdf80c1858780bb879e65e8e06ae7ac6869f981f805f1c393b48254cc2246`.

Rendered `1440x900` QA:

```text
layout              1440 x 857 px
BEARING viewport    1042 x 825 px
owner panel          350 x 825 px
left canvas           519 x 695 px
right canvas          520 x 695 px
```

Browser physics metrics:

```text
bearing anchor gap       0.00001546371140869226 m
no-relation control gap  1.3662249602059333 m
relative angle           2.010232448577881 rad
max runtime mass error   0 kg
max local COM error      1.3041700164251324e-8 m
```

Final run at this checkpoint:

- strict TypeScript PASS;
- Node semantic / exact Box3D suite **28/28 PASS**;
- production build PASS;
- Forge V0.2 launcher self-test PASS;
- real Chromium suite **12/12 PASS**;
- artifact upload PASS.

## Forge V0.2 — second-consumer evidence

BEARING exposed a real V0.1 limitation: manifest and launcher were hardcoded to `ANVIL-01 / CUT`. This justified one minimal generalization, not a plugin framework.

V0.2 changes only the earned cross-gate transport boundary:

- repository `forge-owner-gate.config.json` selects active `gate`, `entryPath`, Forge revision and artifact name;
- generated manifest schema `anvil-forge-owner-gate/v2` includes the exact `entryPath`;
- generic `START_ANVIL.cmd` launches the active artifact gate;
- old `START_ANVIL_CUT.cmd` remains an explicit legacy wrapper and no longer decides the gate;
- PowerShell server validates project/schema and safe same-origin entry path before opening localhost;
- self-test deliberately rejects `//host`, external URL, backslash path and CR/LF injection examples;
- BEARING has its own thin fail-closed owner report; no shared generic relation/owner-gate framework was introduced.

Forge V0.2 browser negative tests prove:

- wrong active artifact gate/entry blocks BEARING ACCEPT;
- local/unverified build blocks canonical ACCEPT;
- mutation of required BEARING evidence after ACCEPT revokes ACCEPT and clears/copy-disables the report;
- canonical manifest + complete evidence produces a provenance-complete report.

The manifest from run `32080634137` correctly recorded:

```text
gate      ANVIL-02 / BEARING
entry     /?experiment=bearing
source    88ee3c75fe3931c20e738d520bf00be39e1a83f9
checkout  957ebc070ff1d44cc6ff65a5231a5fdfedabdc6a
run       32080634137
```

Forge V0.2 status: **AUTOMATED-VALIDATED SECOND-CONSUMER OWNER-GATE CANDIDATE**. It is not yet owner validated. The next evidence class is the owner's real Windows/Chrome run of the final grounded artifact.

## Owner gate required before promotion

Do not merge PR #5 to `main` before owner validation.

The owner workflow should be:

1. receive the exact final artifact directly if tools permit;
2. extract it;
3. double-click `START_ANVIL.cmd`;
4. run BEARING/repeat as needed;
5. judge the left derived bearing against the right no-relation control;
6. choose `ACCEPT`, `REJECT`, or `INCONCLUSIVE`;
7. click `KOPIUJ RAPORT DO GPT` and paste it into the project conversation.

After handoff, the agent must externally cross-check the report's source/run/artifact against live GitHub and obtain the artifact digest. The owner should not manually inspect Actions/SHA.

## Explicit non-claims

Current evidence does **not** prove:

- arbitrary authored non-grid orientations;
- multiple interacting bearings or closed kinematic loops;
- limits, motors, compliance, friction torque or breakage;
- power/control networks;
- joint/relation continuity across a CUT/recompile transaction;
- a generic Relation/Joint/Constraint ontology;
- universal authored frame entities;
- that every local physical interface can be represented by the current `BearingMark` dialect.
