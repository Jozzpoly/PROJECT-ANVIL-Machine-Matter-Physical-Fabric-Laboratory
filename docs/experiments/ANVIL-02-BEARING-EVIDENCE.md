# ANVIL-02 / BEARING — Evidence Log

Status: **OWNER ACCEPTED — PROMOTION ELIGIBLE FOR THE DECLARED BOUNDED CLAIM**

PR: `#5 — ANVIL-02: bearing from a local authored interface`.

Canonical owner-gate record: `docs/experiments/ANVIL-02-BEARING-OWNER-GATE.md`.

## Accepted research statement

For the declared 7-cell fixture, one experiment-local authored bearing mark on two opposite adjacent source faces can causally split one rigid island into two disposable rigid bodies and compile one body-local rotational relation. Stock Box3D lowers that relation to a revolute joint which keeps the shared pivot coincident while allowing relative rotation. The same compiled body-local anchor/axis semantics also survived the declared arbitrary common rigid transform.

This is **not** a generic Relation/Joint/Constraint architecture.

## Authored signal under test

Experiment-local only:

```text
stable bearing ID
endpoint A = persistent cell ID + face
endpoint B = persistent cell ID + opposite face
free axis  = x | y | z
```

No Box3D body/joint IDs are authored. No generic relation graph, motor/limit/break policy, JURE frame ontology or VAW assembly-space system is promoted by this experiment.

## Fixture

Seven `0.5 m` equal-material source cells form asymmetric 3-cell and 4-cell lobes with exactly one rigid seam:

`a:2 x+ <-> b:0 x-`

Free axis: `z`.

Without the bearing mark the ordinary compiler produces one rigid island. With the mark, the same seven source cells produce two rigid bodies plus one compiled bearing relation.

Compilation fails closed for invalid/non-adjacent/non-opposite endpoints, an axis normal to the shared face, and an alternate rigid bypass around the marked seam.

## C0 — base real-solver evidence

First executable proposal:

```text
source head      825dba6e49f5057f3022cfcad29f21cdcf346b61
PR checkout      6701f1c41581b7ac3283fc30993206e758ea19b8
Actions run      32078765858
artifact ID      9304368827
artifact SHA256  bee3703eaa021ffc6702742ad68ae8d804a78e01a9f81f961fa4c5f76af0170d
```

Predeclared after 120 fixed 60 Hz steps:

- constrained shared-anchor gap <= `0.0025 m`;
- identical no-relation control gap >= `0.25 m`;
- absolute relative revolute angle >= `0.35 rad`.

Observed:

```text
constrained anchor gap   0.00001546371140869226 m
no-relation control gap  1.3662249602059333 m
revolute relative angle  2.010232448577881 rad
```

Node/Box3D result: **27/27 PASS**.

The fixture strongly discriminates a working pivot from no relation and a free revolute relation from a weld-like false pass. No physics threshold was relaxed.

## C5 — arbitrary common-transform covariance

A harder gate was declared before execution. The same compiled relation was instantiated after one common rigid transform:

- rotation `0.91 rad` about axis proportional to `(0.37, -0.81, 0.44)`;
- translation `(2.4, -1.3, 1.7) m`.

Box3D received only the already compiled `localAnchorA/B` and `localAxisA/B`. No separate authored/general frame system was added.

Exact execution:

```text
source head      5f4854e7b6eb6bafd27e34077e5a3c44357421c2
PR checkout      10929ffa6f3a1e3387056cac3f85fde472484ac4
Actions run      32078964676
artifact ID      9304530155
artifact SHA256  824a9c926e2b642148f0f02723e180a9d5aca72c1920be191b94f3f6c75c2232
```

Observed:

```text
initial transformed gap  1.7889085181965112e-7 m
constrained anchor gap   4.252712514504838e-6 m
no-relation control gap  1.2319540243918932 m
revolute relative angle  1.0926251411437988 rad
world axis               (-0.58009, -0.43362, 0.68954)
```

Node/real-Box3D suite: **28/28 PASS**.

Interpretation: **SUPPORTED FOR THIS COMMON-RIGID-TRANSFORM FIXTURE.** ANVIL-02 has not earned a need for a JURE-like explicit frame ontology. Adding one now would be speculative infrastructure.

## D0 — production browser A/B evidence

The production browser presents the same compiled source side by side:

```text
DERIVED BEARING          NO RELATION CONTROL
same 7 source cells      same 7 source cells
same 2 bodies            same 2 bodies
relation active          relation absent
```

Projection is fixed; there is no camera-follow or interpolation intended to hide discontinuity.

Final rendered `1440x900` QA:

```text
layout            1440 x 857 px
BEARING viewport  1042 x 825 px
owner panel        350 x 825 px
left canvas         519 x 695 px
right canvas        520 x 695 px
```

Browser metrics:

```text
bearing gap       0.00001546371140869226 m
control gap       1.3662249602059333 m
relative angle    2.010232448577881 rad
max mass error    0 kg
max local COM     1.3041700164251324e-8 m
```

## Final owner-tested candidate

```text
source head      3869cbb3ece204acd7f5c05cf7da43e53e219c0c
PR checkout      a107661d2f8854cf45a51047f93f06b2d5b8c0a4
Actions run      32080991801 attempt 1
artifact         anvil-browser-laboratory
artifact ID      9305115231
artifact SHA256  336987e773b643c1b25f472cf1f585c2724f98760412359015f7f464f381bdac
Forge schema     anvil-forge-owner-gate/v2
Forge revision   v0.2-second-consumer
entry            /?experiment=bearing
```

Final exact CI on the owner-tested source:

- Node `24.16.0` / npm `11.13.0`;
- strict TypeScript PASS;
- **28/28** Node / exact real-Box3D tests PASS;
- production build PASS;
- Forge V0.2 launcher self-test PASS;
- unsafe launcher entry-path candidates rejected;
- **12/12** real Chromium tests PASS;
- artifact upload PASS.

External post-handoff GitHub verification confirmed the report's source head, PR synthetic checkout, successful run, artifact ID and artifact digest.

## Owner evidence

Owner verdict: **ACCEPT** after **17 observed BEARING runs**.

Environment:

```text
Windows 10
Chrome 151
1920 x 911 @ DPR 1
```

Owner observation: left side remains connected at the green bearing marker while relative rotation is visible; the right no-relation control separates and flies apart, with the red line clearly showing the distance.

An approximately 18.73 s owner screen recording was also reviewed and visually supports the same A/B distinction.

See `ANVIL-02-BEARING-OWNER-GATE.md` for the exact provenance handshake and Forge field feedback.

## Forge V0.2 field result

Forge V0.2 functionally passed its second real consumer:

- Windows ZIP/launcher/browser handoff worked;
- correct gate was selected from the manifest;
- 17 RESET/RUN repetitions worked;
- verdict/report workflow worked;
- report identity was sufficient for external GitHub verification.

However the owner found the opening Forge explanation too technical and difficult to understand. The next Forge revision must make the primary owner path plain-language and visual, moving SHA/schema/run/artifact/provenance details behind collapsed technical details. This is a Forge UX requirement and does **not** invalidate BEARING.

## Preserved negative development evidence

Do not erase these failures:

1. first browser implementation failed strict TypeScript because body lookup narrowing did not survive a closure; strictness was not weakened;
2. browser initially rendered default `300x150` canvases because experiment CSS was not loaded; the CSS entry path was fixed instead of relaxing QA;
3. the first owner-panel composition stretched the scene to ~1397 px at a 900 px viewport; viewport/panel bounds were fixed and upper-bound layout gates added;
4. the first Forge V0.2 BEARING owner layer compiled as a global TypeScript script and failed strict checking; explicit module scope fixed it;
5. no physical threshold was loosened to turn a failure green.

## Explicit non-claims

ANVIL-02 does **not** prove:

- arbitrary authored non-grid orientation semantics;
- multiple interacting bearings or closed kinematic loops;
- motors, limits, compliance, friction torque or breakage;
- power/control networks;
- relation continuity across CUT/recompile transactions;
- a generic Relation/Joint/Constraint ontology;
- universal authored frame entities;
- generality of the current `BearingMark` dialect to other physical interfaces.

## Promotion rule

Owner ACCEPT unblocks promotion of this bounded result. The exact owner-tested source/artifact identity must remain immutable evidence even if later documentation or Forge UX commits are added before or after promotion.
