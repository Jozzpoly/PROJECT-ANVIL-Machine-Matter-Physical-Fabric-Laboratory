# O1-X / BREAK LAB V0 — PRE-FLIGHT

Status: FROZEN BEFORE IMPLEMENTATION
Base: representation candidate `0586b4bcc669e7b60dddddd7ddcd022cd8134196`

## Owner signal

Owner gameplay on the representation candidate confirms that semantic re-entry for Bearing and TorquePatch is usable in real interaction and that the next limiting boundary is the inability to realize more than one authored Bearing. Owner explicitly wants to add more Bearings and test a more mechanism-like composition.

## Frozen question

Can Studio expose a deliberately experimental **BREAK RUN** path for authored sources with multiple locally valid Bearings and exactly one locally valid TorquePatch, using simultaneous multi-bearing lowering, while preserving the normal one-Bearing READY/RUN contract unchanged?

## Required separation

- Normal `RUN` remains the accepted one-Bearing + one-TorquePatch envelope.
- `UNSUPPORTED` remains `UNSUPPORTED`; Break Lab must not relabel it `SUPPORTED` or `READY`.
- BREAK RUN is an explicit experimental realization attempt, not promotion of generic multi-bearing support.
- Accepted ANVIL-02, ANVIL-06, ANVIL-09, ANVIL-10 and Foundation remain unchanged.
- Representation prototype remains presentation-only; no renderer/runtime identity becomes authored truth.

## V0 bounded envelope

BREAK RUN may be offered only when:

1. Matter source is valid.
2. There are at least two authored Bearings.
3. Every Bearing is locally geometrically valid as a shared face relation, including Bearings that would individually report `ALTERNATE_RIGID_BYPASS`.
4. All authored Bearings can be lowered simultaneously into one PhysicalPlan and every marked seam resolves to two distinct bodies in that composed topology.
5. There is exactly one authored TorquePatch.
6. That patch targets exactly one authored Bearing endpoint.
7. The patch effort is finite.

The single TorquePatch is applied as equal/opposite body torques to the two bodies of its resolved composed Bearing relation. No motor or velocity setter is introduced.

## Deliberate non-goals

- multiple TorquePatches;
- generic mobility/constraint graph solver;
- proving arbitrary closed mechanisms stable;
- claiming every multi-bearing composition has the intended DOF;
- gravity/ground/contact expansion;
- elastic/compliance composition;
- rebind/edit-while-runtime support;
- automatic recovery from overconstraint;
- new Foundation abstraction or ANVIL-11.

## Product interaction

- Standard RUN remains visually/semantically distinct from BREAK RUN.
- BREAK RUN must start a fresh disposable runtime and STOP must restore authored source exactly as normal Studio runtime does.
- Existing representation lenses and direct semantic re-entry remain intact.
- `Enter` commits an active Bearing or TorquePatch draft when the commit action is currently valid; it must not commit unrelated UI state.
- BREAK RUN failure must fail closed with a visible experimental fault and must not mutate authored source.

## Falsifiers

### B0 — classification honesty
A multi-Bearing source remains standard `UNSUPPORTED / INCOMPLETE` while separately reporting Break Lab eligibility.

### B1 — simultaneous topology
The known CHAIN fixture lowers 2 Bearings into 3 bodies / 2 relations in the Studio Break Lab path.

### B2 — one active torque across multiple Bearings
A 2-Bearing CHAIN with exactly one TorquePatch can create a fresh Box3D runtime; activation OFF/ON changes the targeted relation causally while both Bearing anchors remain constrained.

### B3 — emergent closure remains visible
The known LOOP composition may eliminate apparent relative revolute freedom; Break Lab must realize this outcome rather than pretending local DOFs add independently.

### B4 — lifetime
STOP disposes Break Lab runtime; Restart creates a fresh session; authored source/generation does not change from runtime motion.

### B5 — browser owner path
In real Chromium: create/re-enter a second Bearing with Meaning lens, observe standard `UNSUPPORTED`, invoke BREAK RUN, observe real runtime frames, STOP, and recover authored Bearings by semantic picking. `Enter` must commit active Bearing/Torque drafts.

## PASS

All falsifiers pass and existing standard Studio + historical tests remain green. Candidate becomes a disposable Owner Break Lab artifact, not a merge-ready product claim.

## RED / STOP

Stop and preserve evidence if simultaneous lowering becomes ambiguous, the single Torque action cannot be tied to persistent authored meaning without runtime IDs, source/runtime lifetime leaks, or the UI has to mislabel UNSUPPORTED as READY to make the experiment work.
