# O1-X / REPRESENTATION LENSES — PREFLIGHT

Status: **FROZEN BEFORE IMPLEMENTATION**

Work type: bounded product/representation Breakout after O1 Owner evidence.

Exact donor base: frozen O1 Studio candidate `1a2c99e073d40e29cfe46e20a7c61910f6ac0d3b`.

This experiment does not redesign Foundation or promote the current cell grid into ontology. It attacks an O1 contradiction: the product currently renders each authored cell as a visibly separated cube, and Bearing authoring depends on targeting the artificial gap between cubes even though cells are only the current authored dialect.

## 1. Primary question

> Can one unchanged authored `StudioSourceV0` be presented through distinct **Surface / Cells / Meaning** lenses so that Matter reads as one continuous object by default while discretization and local interfaces remain explicitly inspectable and semantically pickable without relying on physical gaps between rendered cells?

## 2. Frozen product observations

Owner O1 evidence established:

- separated cubes read as primitive VAW rather than one continuous matter object;
- internal shared interfaces are difficult to see and target through the current gaps;
- existing Bearing/Torque meaning is too difficult to rediscover and re-enter;
- a visual Bearing marker itself is not currently a semantic pick target;
- the cell representation may remain useful computationally, but should not dictate final visual continuity.

Research Compass already states that cells/voxels are a dialect, not ontology, and authored/collision/visual/solver representations need not share topology or resolution.

## 3. Lenses under test

These names are experiment/product language, not permanent architecture.

### Surface

Default authored Matter view.

- extract only exterior authored cell faces;
- no intentional inter-cell gaps;
- internal shared faces are absent from the visible exterior shell;
- exterior picking retains exact source provenance `cellId@face` even though the shell reads continuously;
- material colors remain source-derived.

This first falsifier does **not** require optimized greedy meshing. A correct exterior face extraction is sufficient. Optimization is explicitly not evidence.

### Cells

Diagnostic authored-structure lens.

- Surface remains spatially stable;
- authored cell boundaries are overlaid, not created by shrinking/separating Matter;
- turning Cells on/off must not change authored source, picking identity, or physical/runtime geometry.

### Meaning

Semantic interaction lens.

- all current shared cell interfaces are enumerated exactly once from source adjacency;
- candidate interfaces are visible even when physically internal to the opaque Surface, using an explicit overlay/X-ray presentation rather than geometry gaps;
- existing Bearing marks and TorquePatches remain more salient than unmarked candidate interfaces;
- existing Bearing manifestation itself becomes a semantic pick target that can re-enter the existing authored Bearing draft;
- existing TorquePatch manifestation itself becomes a semantic pick target that can re-enter its authored draft;
- selecting a candidate unmarked interface may start the existing Bearing draft path without requiring the user to hit a hidden underlying Matter face.

## 4. Pure representation/provenance gates

Before browser/product evaluation add pure tests for a small set of sources:

### Two adjacent cells

- exterior surface contains exactly 10 authored square faces, not 12;
- the shared internal face is absent from Surface;
- exactly one shared interface is enumerated by Meaning;
- exterior face provenance remains unambiguous.

### 2×2 block

- exterior surface contains exactly 16 square faces;
- exactly four unique internal shared interfaces are enumerated;
- source cell array order does not change extracted Surface/interface identity/order.

### Existing meaning

- a Bearing seam maps to exactly one enumerated shared interface;
- a TorquePatch remains bound to its authored endpoint and associated Bearing identity;
- no renderer/Three ID enters returned semantic provenance.

## 5. Browser gates

Use the unchanged Editable Starter and one simple user-built block.

Required:

- Studio opens with **Surface** active;
- adjacent Matter is rendered without deliberate cube gaps;
- Surface / Cells / Meaning can be switched without source generation changing;
- camera position does not reset across lens switching;
- Cells reveals discretization while preserving the same Matter placement;
- Meaning reveals internal candidate interfaces without requiring a gap;
- clicking the existing Bearing manifestation re-enters that same persistent Bearing rather than creating a second Bearing;
- clicking the existing TorquePatch manifestation re-enters that same persistent TorquePatch;
- direct semantic overlay picking has priority over underlying Matter picking;
- MMB / Shift+MMB camera channels remain unchanged;
- no permanent outliner/inspector/dashboard is introduced;
- runtime hot-loop ownership is unchanged and no new per-frame React state is introduced.

## 6. Owner gate after automated falsification

If browser gates pass, generate a Breakout artifact from this exact branch.

Owner task should require no hidden knowledge:

1. open Editable Starter;
2. identify the existing Bearing without instruction about cell gaps;
3. click it, change its axis, Commit;
4. click it again and confirm the edited value is recoverable;
5. identify/edit TorquePatch;
6. toggle Surface / Cells / Meaning and describe what each view communicates;
7. create a new small Matter construction and attempt one new Bearing using Meaning interfaces.

The desired evidence is not aesthetic approval. The question is whether visual Matter continuity and semantic interface discoverability can be decoupled from cell rendering.

## 7. Explicit non-scope

- no optimized greedy meshing requirement;
- no final surface representation;
- no adaptive cells/SDF/mesh ontology;
- no multi-Bearing runtime;
- no multi-Torque runtime;
- no gravity/ground;
- no changes to accepted scientific/compiler/runtime APIs;
- no TRACE/forces lens yet;
- no generic lens framework or renderer abstraction;
- no P06 visual redesign beyond the demonstrated O1 contradiction.

## 8. Verdict vocabulary

- **SUPPORTED FOR PRODUCT PROTOTYPE** — pure provenance gates + Chromium gates pass and Owner can rediscover/re-enter local meaning substantially more reliably without cell gaps.
- **TECHNICALLY SUPPORTED / OWNER REJECTED** — implementation works but does not improve the Owner mental model.
- **REJECTED** — continuous Surface and explicit semantic interfaces cannot preserve the required spatial/provenance interaction under this bounded approach.
- **INCONCLUSIVE** — implementation or instrumentation does not isolate representation from unrelated interaction problems.
