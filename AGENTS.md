# PROJECT ANVIL — Agent Rules

ANVIL is a falsification-driven R&D laboratory. Prefer a small executable experiment over a large speculative architecture.

## Truth hierarchy

1. live repository state and executable evidence;
2. direct owner validation/feedback;
3. current `AI_PROJECT_MEMORY.md`;
4. promoted boundaries in `docs/FOUNDATION.md`;
5. current experiment documentation;
6. historical conversation and donor-project documents.

Do not turn a passing build, synthetic test, or code presence into a product-quality claim.

Before significant research work, also read `docs/EXPERIMENT_PROTOCOL.md`. Use `docs/DONOR_MAP.md` before substantial donor harvesting.

## Git discipline

- Resolve repository, branch and live HEAD before significant work.
- `main` is for verified checkpoints. Develop bounded experiments on explicit branches/PRs.
- `foundation/**` branches are only for promoting already demonstrated boundaries or neutral measurement infrastructure. Do not use them to hide a new physics hypothesis from the experiment protocol.
- Do not rewrite history or force-push without a specific recovery reason.
- GitHub Actions may be used freely for this public laboratory.
- Update `AI_PROJECT_MEMORY.md` when evidence changes the current research truth.

## Experimental discipline

Every material experiment should have:

- a concrete hypothesis;
- a bounded fixture;
- observable success/failure criteria;
- at least one plausible falsifier;
- a recorded result and limitations.

Keep negative results. Do not tune thresholds merely to make a gate green. Change one primary variable at a time where practical.

Use the verdict vocabulary in `docs/EXPERIMENT_PROTOCOL.md`; distinguish static, synthetic, real-solver, product-runtime and owner-manual evidence.

## Promotion discipline

Do not promote incidental fixture details into the global architecture.

A reusable concept belongs in `src/foundation` / `docs/FOUNDATION.md` only when:

1. accepted experiment evidence already supports it; or
2. it is a solver/domain-neutral measurement boundary directly required to falsify the next experiment.

If an abstraction prescribes the answer to an untested physics question, it belongs inside that experiment instead.

## Architectural boundaries

- Authored truth must not persist Box3D/runtime IDs.
- Runtime physics is disposable and reconstructible from authored/compiled truth.
- Persistent authored identity and runtime body/collider identity are separate domains.
- Foundation spatial/runtime state must not expose Box3D handles or Box3D-specific math types.
- Structure, mechanics, surfaces, future power/control and visual representation should not be collapsed into one mega-object without evidence.
- Do not add `CarCompiler`, `WheelPart`, or other domain-specific foundations merely because a demo needs them. Specialization is allowed only when its physical or usability need is demonstrated and explicit.
- Do not assume the current sparse cubic cell dialect is the final Machine Matter representation.

## Box3D policy

Stock Box3D is not sacred. Native JV already demonstrates evidence-backed core modification. However, ANVIL starts each hypothesis at the shallowest sufficient intervention level:

1. stock Box3D primitives;
2. external physical model / compiler lowering;
3. instrumentation or thin fork;
4. custom constraint;
5. custom contact law;
6. deeper solver change or another solver.

Move deeper only when a reproduced limitation justifies it.

## Donor repositories

Other Jozzpoly repositories are evidence and donor sources. Read current source-of-truth branches/files before harvesting ideas or code. Do not modify donor repositories as a side effect of ANVIL work unless the owner explicitly asks for that repository to be changed.

When reusing code or third-party material, preserve actual licensing/provenance requirements. Project-owned assets do not need artificial secrecy, but ownership does not erase third-party licenses.
