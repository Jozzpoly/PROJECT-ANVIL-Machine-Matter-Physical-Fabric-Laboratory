# ANVIL-06 / TORQUE-PATCH — preflight

Status: **DRAFT / NOT YET EXECUTED**

Strategic source: `docs/RESEARCH_COMPASS.md`.

## Primary question

Can the already-supported TORQUE behavior be authored as a **local persistent source-face property** with no authored `bearingId`, then deterministically discover the existing BEARING through source locality/topology and fail closed when painted on a non-bearing face?

This experiment attacks semantic/component drift. It is deliberately **not** a new actuator-physics experiment.

## Why this is next

ANVIL-05 proved a bounded active path:

```text
persistent TorqueMark(bearingId, effortNm)
        ↓
passive BEARING relation
        ↓
equal/opposite runtime body torque pair
        ↓
causal + / 0 / - relative motion
```

That result is accepted. However, `bearingId` means the authored function currently names another authored component directly.

This is not a runtime-ID leak, but if the pattern spreads upward it can recreate a conventional component graph in semantic form. The original Machine Matter direction instead requires us to test whether physical locality can bind properties where locality is meaningful.

Therefore ANVIL-06 changes **one primary assumption only**:

> target resolution moves from direct authored bearing reference to a local source-face patch.

Runtime torque physics, bearing physics, force magnitude and solver remain unchanged.

## Experiment-local authored concept

Candidate only for ANVIL-06:

```text
TorquePatch {
  id
  target: {
    cellId
    face
  }
  effortNm
}
```

Deliberately absent:

- `bearingId`;
- runtime body ID;
- runtime joint ID;
- generic FUNCTION/device kind;
- command state;
- power, signal or sensor concepts.

The patch target uses the same persistent source-cell/face address vocabulary already earned by BEARING.

## Resolution rule

For the current bounded single-bearing fixture:

1. compile the existing BEARING semantics normally;
2. validate that `TorquePatch.target` references an existing source cell/face;
3. match the target to **exactly one** endpoint of the authored/compiled bearing;
4. derive persistent bearing identity only in compiled output;
5. lower through the already-supported ANVIL-05 torque action;
6. if the target is not a bearing endpoint, reject the compilation instead of choosing the nearest/only bearing by convenience.

The location identifies *where the active property exists*. The signed `effortNm` continues to use the canonical compiled bearing axis/sign convention from ANVIL-05; the selected face does not create a second sign convention.

## C0 fixture

Reuse the accepted seven-cell BEARING fixture.

```text
source cells     7
runtime bodies   2
source bearing   1
bearing axis     z
initial motion   rest
gravity          zero
contacts         disabled
```

Default valid patch is placed on one of the persistent source faces that participates in the bearing seam.

Run the same signed causal variants as ANVIL-05 for 60 fixed 60 Hz steps:

```text
POSITIVE   +100 N*m
CONTROL       0 N*m
NEGATIVE   -100 N*m
```

This does not retest whether Box3D torque works. It proves that the **new local authored path reaches the already-supported active behavior**.

## Adversarial controls

### Misplaced-face control

Keep the same matter and bearing but move the `TorquePatch` to a valid source cell face that is **not** a bearing endpoint.

Expected result: compilation fails closed before runtime creation.

It must not silently target the only bearing in the fixture.

### Unknown-cell control

Use a patch target whose `cellId` is absent from persistent matter.

Expected result: explicit compile rejection.

### Ordering invariance

Reorder source cells and swap authored bearing endpoint declaration order while keeping the same physical patch target.

Expected result: same resolved source bearing identity and physically equivalent compiled torque action.

## Frozen gates

All gates below are declared before the first executable ANVIL-06 C0 result.

### A — authored/source boundary

- source patch object contains no `bearingId` field;
- source patch contains no runtime body/joint ID;
- patch ID is non-empty;
- `effortNm` is finite;
- target cell exists;
- target face is a valid source face;
- valid patch target matches a bearing endpoint;
- non-bearing target fails closed;
- unknown-cell target fails closed.

### B — deterministic semantic resolution

For valid placement:

- resolved persistent bearing ID equals the BEARING source identity already present in the fixture;
- compiled runtime body IDs are derived output only;
- net compiled torque pair magnitude <= `1e-12 N*m`;
- `+100 / 0 / -100 N*m` patch variants do not alter body/relation topology;
- source-cell reorder and bearing endpoint-order swap do not change resolved physical meaning.

### C — end-to-end real Box3D causal behavior

After 60 steps:

- positive relative bearing angle >= `+0.35 rad`;
- negative relative bearing angle <= `-0.35 rad`;
- zero-control absolute relative bearing angle <= `0.01 rad`;
- positive relative angular speed >= `+0.35 rad/s`;
- negative relative angular speed <= `-0.35 rad/s`;
- zero-control absolute relative angular speed <= `0.01 rad/s`;
- positive and negative bearing gap <= `0.0025 m`;
- total linear momentum magnitude <= `0.05 kg*m/s` for positive and negative variants;
- barycenter displacement <= `0.0005 m` for positive and negative variants;
- all observed runtime state finite.

These are intentionally the ANVIL-05 physical gates. A materially different result means the new semantic lowering changed physical meaning and must be investigated.

## Evidence classes

Required for the first decision:

- **A** structural/source-boundary checks;
- **B** deterministic semantic/compiler checks;
- **C** real pinned Box3D end-to-end behavior.

Class D production Chromium is optional unless the new local compiler path is actually wired into the product bundle or another browser-specific uncertainty appears. Class E owner validation is not expected: the new claim is structural/causal, not subjective or visually ambiguous.

## Failure interpretation

Do not weaken gates after a red result merely to obtain PASS.

- valid target cannot resolve -> local property binding hypothesis fails or the target vocabulary is insufficient;
- misplaced target resolves anyway -> compiler is guessing and the fixture does not support trustworthy local semantics;
- ordering changes meaning -> source locality/canonicalization is unstable;
- structural gates pass but physical sign/gap gates fail -> local resolution changed torque lowering or bearing semantics unexpectedly;
- only a test representation detail fails while physical/semantic gates pass -> classify separately before changing implementation;
- product/browser failure later -> do not relabel a Class C semantic result as false without identifying the browser-specific cause.

## Explicit non-claims

A PASS will not prove:

- generic FUNCTION/device ontology;
- multiple bearings or ambiguity resolution among several nearby interfaces;
- spatial-radius/nearest-neighbor inference;
- volumetric or continuous function fields;
- command/control separation;
- signals, ports, buses, sensors or power;
- actuation through CUT/REBIND;
- contact-loaded actuation;
- arbitrary actuator orientation beyond the existing bearing semantics;
- non-grid authored matter;
- compliant/breakable bindings.

## Stop rule

If A+B+C strongly pass, stop ANVIL-06. Do not add multiple bearings, ACTIVATE or REBIND merely to accumulate green tests.

Rerun the macro Research Compass. The leading next comparison should be:

1. **ELASTIC-SEAM** — open the missing compliant BINDINGS frontier; versus
2. **ACTIVATE** — separate persistent active capability from transient command.
