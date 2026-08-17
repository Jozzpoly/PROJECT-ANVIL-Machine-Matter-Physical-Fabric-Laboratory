# PROJECT ANVIL — Experiment Protocol

ANVIL progresses by **bounded executable falsifiers**, not by expanding a speculative master architecture.

This protocol exists so future agents can start quickly without confusing implementation, green CI, visual plausibility and owner acceptance.

## 0. Identity lock

Before material work:

- resolve the live repository and intended branch;
- read `AI_PROJECT_MEMORY.md` and `AGENTS.md`;
- confirm whether the task changes an accepted checkpoint, an active experiment or a new branch;
- inspect the actual source files that own the behavior under test;
- inspect donor repositories only when they can materially reduce uncertainty.

Do not reconstruct project truth from conversation history when live Git can answer it.

## 1. One primary research question

Write one question that could fail.

Good:

> Can a moving rigid island be recompiled into two bodies at a step boundary while preserving source identity and bounded kinematic discontinuity?

Bad:

> Build the universal Machine Matter system with fracture, joints, surfaces and adaptive physics.

If failure would be impossible to interpret because too many assumptions change at once, narrow the experiment.

## 2. Fixture

Use the smallest fixture that can expose the failure mode.

A fixture must state:

- authored inputs;
- materials/parameters;
- initial runtime state when relevant;
- the single primary intervention;
- expected observables.

Prefer asymmetric fixtures when symmetry could hide an incorrect COM, orientation, mapping or force calculation.

## 3. Gates before implementation

Define pass/fail criteria first when practical.

Each gate should have:

- stable ID;
- observable metric or explicit condition;
- tolerance and units when numeric;
- reason for the tolerance;
- evidence class.

Do not relax a threshold merely because the first implementation misses it. Change the threshold only if the original criterion is demonstrated to be physically or experimentally wrong.

## 4. Evidence classes

ANVIL distinguishes at least these classes:

### A. Static / structural

Examples: strict typecheck, schema validation, forbidden dependency boundary, deterministic serialization.

Useful, but not runtime physics evidence.

### B. Pure synthetic

Examples: provenance lineage, vector identities, known mass-property fixtures, deterministic compiler tests.

Useful for mathematical and semantic invariants, but not evidence that Box3D or a browser path works.

### C. Real solver

The actual physics backend creates the generated representation and steps it. Cross-check independent solver quantities when possible instead of writing compiler answers back into the solver.

### D. Real product runtime

The production browser/native build is executed, not merely bundled. Runtime errors and interaction paths are observed automatically where feasible.

### E. Owner manual validation

The owner inspects the artifact for behavior, communication, feel or visual failure modes that automated gates cannot establish.

A lower evidence class must never be described as a higher one.

## 5. Branch / PR lifecycle

Recommended naming:

- `experiment/anvil-NN-short-name` for bounded falsifiers;
- `foundation/short-name` only for promoting already justified reusable boundaries;
- recovery/checkpoint branches only when preserving evidence requires them.

`main` is the latest accepted checkpoint.

A PR should state:

1. hypothesis;
2. what changed;
3. evidence actually executed;
4. explicit evidence boundary;
5. known failures/limitations;
6. owner gate if required;
7. next falsifier only after the current verdict is understood.

## 6. Verdict vocabulary

Use explicit verdicts:

- **SUPPORTED FOR FIXTURE** — gates pass for the declared fixture/scope;
- **REJECTED** — evidence falsifies the tested claim;
- **INCONCLUSIVE** — the experiment cannot distinguish the hypotheses;
- **BLOCKED** — required evidence could not be executed;
- **REGRESSION** — a previously accepted invariant no longer holds.

Never use `DONE` as a substitute for a scientific verdict.

## 7. Promotion rule

After an accepted experiment, ask which parts actually deserve reuse.

Promote only boundaries that are:

- demonstrated by the completed experiment; or
- neutral measurement/infrastructure required by the next falsifier.

Do not promote incidental fixture details. In ANVIL-00, persistent/runtime identity separation was promoted; sparse cubic cells and face-adjacency-as-rigidity were not.

## 8. Donor harvest rule

When another Jozzpoly project has a relevant mechanism:

1. inspect its current live source and evidence;
2. identify the exact transferable idea or code;
3. separate project-specific assumptions from reusable logic;
4. port minimally into ANVIL rather than merging product architectures;
5. preserve third-party licensing/provenance.

A donor implementation is evidence that an approach exists, not evidence that ANVIL needs it.

## 9. Negative evidence

Keep failed experiments and record why they failed.

A useful failure should reduce the search space. Do not hide discontinuities, instability or wrong topology behind resets, damping, visual interpolation or loose gates unless the experiment explicitly tests those mechanisms.

## 10. Checkpoint before the next experiment

Before moving on, update:

- experiment document and verdict;
- `AI_PROJECT_MEMORY.md`;
- automated tests that preserve accepted invariants;
- owner-validation status;
- foundation only if something has genuinely been promoted.

The next experiment should start from that checkpoint, not from remembered intent.
