# ANVIL-06 / TORQUE-PATCH — Evidence Log

Status: **A + B + C SUPPORTED / PROMOTED**

Canonical preflight: `docs/experiments/ANVIL-06-TORQUE-PATCH-PREFLIGHT.md`.

## Research question

Can accepted TORQUE behavior be authored as a **local persistent source-face property** with no authored `bearingId`, then deterministically resolve the existing BEARING through source locality/topology and fail closed when painted on a non-bearing face?

ANVIL-06 intentionally changes semantic target resolution only. It does not introduce new actuator physics.

## Authored contract under test

Experiment-local source:

```text
TorquePatch {
  id
  target: { cellId, face }
  effortNm
}
```

Deliberately absent from authored source:

- `bearingId`;
- runtime body ID;
- runtime joint ID;
- generic FUNCTION/device kind;
- command, signal or power state.

For the bounded single-bearing fixture, the compiler validates the persistent source-cell/face target, matches it to exactly one bearing endpoint, derives the persistent bearing identity in compiled output, and then reuses the already-supported ANVIL-05 torque lowering.

A target that is not a bearing endpoint is rejected rather than implicitly selecting the only bearing in the fixture.

## Frozen preflight identity

Preflight was committed before first executable result:

```text
preflight head  5be6811de1c20558c03e397c250b1c045c25b85b
```

The A/B/C thresholds and adversarial controls were therefore fixed before C0 execution.

## A/B — source boundary and deterministic resolution

Exact supported source:

```text
source head       f776c1a385da73044cdbe235e470d3dc196f2844
Draft/core run    32149358539
synthetic checkout 3c5f131bc64dc549b0a7c2ead78e364d9e4ad602
Node suite        39/39 PASS
production build  PASS
```

Supported checks:

- source patch has no `bearingId`, body ID or joint ID;
- valid target `a:2@x+` resolves to persistent `bearing:seam-0`;
- equal/opposite compiled torque action remains net-zero within `1e-12 N*m`;
- `+100 / 0 / -100 N*m` variants preserve the same body/relation topology;
- reversing authored source-cell order preserves resolved physical meaning;
- swapping authored bearing endpoint declaration order preserves meaning;
- valid non-bearing target `a:2@x-` fails closed;
- unknown source cell fails closed;
- invalid face, blank patch ID and non-finite effort fail closed.

The compiled action meaning for the valid patch is equal to the already-supported ANVIL-05 direct-reference action for the same fixture and effort. The direct reference exists only as an internal comparison/adapter after local resolution; it is not present in ANVIL-06 authored source.

## C — real Box3D causal behavior

C0 reused the accepted seven-cell BEARING fixture, passive revolute relation, zero gravity/contacts and 60 fixed 60 Hz steps.

Observed ANVIL-06/TORQUE-PATCH-C0:

```text
target               a:2@x+
resolved bearing     bearing:seam-0

POSITIVE +100 N*m
  angle                         +1.3419954776763916 rad
  relative angular speed        +2.0670482516288757 rad/s
  bearing gap                    0.000049233987869452365 m
  linear momentum magnitude      0.000019761076191093114 kg*m/s
  barycenter drift               8.981152564359765e-8 m

CONTROL 0 N*m
  angle                         -2.385185826625502e-9 rad
  relative angular speed         8.944889168011234e-14 rad/s
  bearing gap                    2.2210371941378227e-8 m
  linear momentum magnitude      2.771116999807286e-12 kg*m/s
  barycenter drift               0 m

NEGATIVE -100 N*m
  angle                         -1.435699701309204 rad
  relative angular speed        -2.223932206630707 rad/s
  bearing gap                    0.000056575156412026675 m
  linear momentum magnitude      0.00019186597667621014 kg*m/s
  barycenter drift               5.1969100827768783e-8 m
```

These values reproduce ANVIL-05 C0 exactly. This is strong evidence that the semantic target path changed while the already-supported physical meaning did not.

## Ready regression candidate

ANVIL-06 did **not** claim a new dedicated browser evidence class. The local compiler path was not wired into a new browser UI solely to repeat the same deterministic numbers.

Ready/candidate instead served as exact-build whole-product regression validation:

```text
Ready run          32149627579
source head        f776c1a385da73044cdbe235e470d3dc196f2844
base main          de1b25174ec651f7457eb425a642d813c80448fb
synthetic merge    3c5f131bc64dc549b0a7c2ead78e364d9e4ad602
synthetic tree     0bcae0e8188b74ffc21861bd8968fba2c3cde071
Node               39/39 PASS
existing Chromium  19/19 PASS
launcher self-test PASS
```

Exact-build handoff:

```text
staging artifact   9329190928
staging SHA256     9aa8b610604746f9a19a212caf172f7a5912cf46b22bed555f4d6c4a768234b1
final artifact     9329240948
final SHA256       f8cf4062cd1e118baa1f215c877bc5bb077cacebf173f8d8a5ccfaec0af88a15
```

The 19 Chromium tests demonstrate **no regression of already-supported browser paths**. They are not mislabeled as direct Class D evidence for TORQUE-PATCH.

## Promotion identity

PR #11 was merged with expected-head protection after verifying source head and base remained unchanged.

```text
promoted source head  f776c1a385da73044cdbe235e470d3dc196f2844
actual merge          68f68104734084e0e284c77776a42e954e783d4d
actual merge tree     0bcae0e8188b74ffc21861bd8968fba2c3cde071
```

The actual merge tree is identical to the synthetic merge tree tested by the Ready candidate.

## Supported interpretation

For the bounded single-bearing fixture, active torque intent can be authored as a local persistent source-face property rather than an authored cross-component `bearingId` reference. Source locality deterministically resolves the existing bearing, invalid placement fails closed, and the resolved action preserves the accepted TORQUE physical behavior.

This reduces — but does not eliminate — the risk that Machine Matter devolves into a conventional component graph connected by semantic IDs.

## Explicit non-claims

ANVIL-06 does not prove:

- generic FUNCTION/device ontology;
- multiple-bearing ambiguity resolution;
- nearest-neighbor/radius inference;
- volumetric or continuous function fields;
- transient command/control semantics;
- signals, ports, sensors or power;
- actuation through CUT/REBIND;
- contact-loaded actuation;
- non-grid authored matter;
- compliant, weak or breakable bindings.

## Strategic consequence

The immediate TORQUE locality debt is now boundedly addressed. The macro frontier audit should therefore move away from another TORQUE refinement unless a new composition question requires it.

The largest remaining imbalance is **BINDINGS**: ANVIL still effectively knows rigid adjacency or separation, but not a local binding that can be compliant/elastic while remaining persistent authored matter semantics.
