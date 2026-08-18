# PROJECT ANVIL — Current Handoff

Status: **ANVIL-08 ACCEPTED / ANVIL-09 ACTIVATE FROZEN PREFLIGHT ACTIVE — NO EXECUTABLE RESULT YET**

This is a short takeover pointer, not a science archive. Live Git and executable evidence override this file if they differ.

## Start here

1. Resolve live `main` from GitHub before writing.
2. Accepted material truth is still through **ANVIL-08 / COMPLIANCE-RESOLUTION**.
3. Active unaccepted experiment is **ANVIL-09 / ACTIVATE** on Draft PR **#14**, branch `experiment/anvil-09-activate`.
4. Frozen preflight source is `d5d3241ad40081d1fa5e80cef1dcf2e451ed7b70`; read `docs/experiments/ANVIL-09-ACTIVATE-PREFLIGHT.md` from the active branch before implementation.
5. Do not reinterpret the existence of a frozen preflight as executable evidence. ANVIL-09 currently has no A/B, real-solver or product result.
6. Verify the active PR head contains the frozen preflight commit before writing material code.

## Accepted boundary

ANVIL-08 material checkpoint remains:

```text
material merge       78bcee7665b7a1642ca5f70014a3d0fb25c0aa1a
evidence grounding   04b6429a7d714b0595d5b7b550bc9ca587dbd904
qualified tree       00230b73e283bdb39eedc3df00299b6d14c5aba9
```

Its accepted result remains bounded to the frozen one-dimensional exact-2x compliance-resolution fixture. It is not continuum convergence or generic deformable matter.

## Active ANVIL-09 boundary

Frozen question:

> Can one unchanged persistent local TORQUE-PATCH with signed `+100 N*m` effort be compiled once and transiently switched `OFF -> ON -> OFF` at runtime such that OFF supplies no active torque rather than braking, ON reproduces the accepted torque action, and a fresh runtime from the same persistent compilation defaults OFF — without mutating authored/compiled truth or using Box3D motor semantics?

Key correction already frozen before implementation:

- transient state is **OFF | ON only**;
- signed `effortNm` remains persistent authored meaning;
- no reverse command, analog throttle, routing, signals, power, servo or braking semantics;
- activation is runtime-only and must not enter `TorquePatch`, accepted compilation schemas, Matter serialization or `src/foundation`.

Frozen schedules and thresholds live only in the preflight. Do not copy or retune them elsewhere before execution.

## Exact next action

Execute **Micro A/B only** on Draft PR #14:

1. re-lock live `main`, PR base/head and confirm frozen preflight ancestry;
2. implement the smallest experiment-local ACTIVATE runtime boundary consuming the already-supported TORQUE-PATCH compilation;
3. prove default OFF, OFF/ON fail-closed state domain, source/compilation immutability and single-compilation reuse;
4. prove no Box3D motor/velocity-setter control path and no runtime identity leakage into activation state;
5. do not alter accepted TORQUE/TORQUE-PATCH semantics or `src/foundation`;
6. run Draft/core validation;
7. stop for a checkpoint before implementing real-solver C0-C3 unless A/B is clean and scope remains frozen.

If a clean minimal adapter requires rewriting accepted TORQUE/TORQUE-PATCH semantics or foundation, stop and re-audit rather than refactoring through the boundary.

## Later only if A/B remains clean

- C0-C3: same authored source + same compiled object, OFF/ON/OFF versus continued-ON causal control in real pinned Box3D;
- C4: dispose activated runtime, reconstruct from the same compilation, verify default OFF;
- meso audit immediately after bounded C evidence;
- if A/B + C0-C4 resolve cleanly, stop ANVIL-09 instead of adding reverse/throttle/routing/UI/power/REBIND/compliance.

## Do not do now

- do not reopen ANVIL-08;
- do not modify frozen ANVIL-09 gates merely to obtain PASS;
- do not add reverse command or reinterpret signed `effortNm` as motor capacity;
- do not add analog throttle, signal routing, ports, buses, sensors, power or energy semantics;
- do not modify `src/foundation` for ANVIL-09;
- do not combine ACTIVATE with CUT/REBIND or compliance in this experiment;
- do not call ANVIL-09 supported before executable evidence exists;
- do not mark PR #14 Ready before the bounded scientific question is sufficiently resolved.

## Stable project documents

- `AGENTS.md` — truth hierarchy and implementation cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift / frontier validation.
- `docs/FOUNDATION.md` — only already-earned reusable boundaries.
- `AI_PROJECT_MEMORY.md` — concise accepted capability/architecture index + strategic pointer.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.
