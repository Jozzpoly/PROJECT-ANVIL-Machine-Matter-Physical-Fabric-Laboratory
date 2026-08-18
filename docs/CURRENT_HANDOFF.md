# PROJECT ANVIL — Current Handoff

Status: **ANVIL-08 ACCEPTED / ANVIL-09 ACTIVATE DRAFT SCIENCE SUPPORTED — AWAITING READY CANDIDATE**

Live Git and executable evidence override this pointer if they differ.

## Start here

1. Resolve live `main` before writing.
2. Accepted material truth is still through **ANVIL-08 / COMPLIANCE-RESOLUTION**.
3. Active unaccepted experiment is **ANVIL-09 / ACTIVATE**, PR **#14**, branch `experiment/anvil-09-activate`.
4. Expected active source after the C4 checkpoint: `d0b8b95e345781d21c5296751dcccbba1d30522e`.
5. Original frozen preflight: `docs/experiments/ANVIL-09-ACTIVATE-PREFLIGHT.md`, source `d5d3241ad40081d1fa5e80cef1dcf2e451ed7b70`.
6. Evidence-driven correction: `docs/experiments/ANVIL-09-ACTIVATE-PREFLIGHT-AMENDMENT-01.md`.
7. Do not call ANVIL-09 accepted yet. Draft science is supported; Ready candidate qualification and promotion remain outstanding.

## Draft evidence checkpoint

```text
A/B source/run             60144f1a86de68128970da1c51a66ca4c296b53e / 32194089479
first C0-C3 RED            ae460c79949b38b85f1d60874a5abb3898edab55 / 32194408369
diagnostic RED             86d4def359fe9c7ee2044c39ec9dd81c096ee6e1 / 32194525529
gate correction source/run 64498d2b1eeb84baaa158f979f27970fef4f5f20 / 32194696873
C4 source/run               d0b8b95e345781d21c5296751dcccbba1d30522e / 32194805534
latest Draft integration    867b80a1ea45849e695a5a86590581c80e9395b3
```

Latest Draft/core result: **50/50 Node PASS + production build PASS**.

Key supported observations:

- default OFF remained inert;
- the same persistent compiled +100 N*m torque action became active without recompilation;
- after ON -> OFF the mechanism kept moving in the existing direction rather than braking/locking;
- the pre-frozen continued-ON control finished `0.5506405234336853 rad/s` faster than the OFF branch, exceeding the frozen `>= 0.25 rad/s` causal discriminator;
- a fresh runtime created from the exact same compilation after an activated runtime was disposed defaulted OFF and remained inert for 60 steps;
- source and compilation remained unchanged;
- runtime uses direct body torque, not Box3D motor or angular-velocity setters;
- no foundation or accepted TORQUE/TORQUE-PATCH semantics were changed.

## Negative evidence / gate correction

The first C0-C3 run and a diagnostic repeat were RED only because the frozen C2 sub-gate assumed:

```text
absolute relative-speed change after OFF <= 0.15 rad/s
```

Observed passive change was `-0.35872262716293335 rad/s` while the OFF mechanism remained strongly positive and the identical continued-ON branch separated causally by `0.5506405234336853 rad/s`.

The assumption that passive **relative joint speed** must remain nearly constant is not a valid invariant for the asymmetric revolute multibody fixture. The correction revokes only that sub-gate and introduces no new post-hoc numeric threshold; the already-frozen C3 comparative control remains the discriminator. Preserve both red runs as meaningful negative evidence.

## Meso verdict

The bounded scientific question is sufficiently resolved. **Research stop rule is active.**

Do not add reverse, analog throttle, routing, UI, power, REBIND, compliance or another solver variant to ANVIL-09.

## Exact next action

1. Re-lock live `main` and PR #14 head.
2. Verify PR changed paths remain bounded to ANVIL-09 docs/source/tests + test registration.
3. Mark PR #14 Ready.
4. Run the existing Ready candidate gate on the exact integration context.
5. Treat launcher/Chromium as whole-product regression evidence only, not direct ACTIVATE physics evidence.
6. If candidate succeeds, verify exact source/base/integration provenance and promote the tested material head with expected-head protection.
7. Ground the executed evidence after promotion; do not append acceptance evidence to the candidate branch before the merge.

## Do not do now

- no further ANVIL-09 research variants;
- no change to the corrected gate set merely to improve margins;
- no generic Control/FUNCTION abstraction or `src/foundation` promotion;
- no reverse command or reinterpretation of signed `effortNm` as capacity;
- no CUT/REBIND or compliance composition inside ANVIL-09;
- no owner/manual gate for this quantitative claim unless a genuinely human-only uncertainty appears;
- no claim that Chromium directly proves ACTIVATE physics.

## Stable project documents

- `AGENTS.md` — truth hierarchy and implementation cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift / frontier validation.
- `docs/FOUNDATION.md` — accepted reusable boundaries only.
- `AI_PROJECT_MEMORY.md` — concise accepted capability/architecture index + strategic pointer.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.
