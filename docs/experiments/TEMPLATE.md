# ANVIL-NN / NAME

Status: **PLANNED**

## Research question

One falsifiable question.

## Why now

Which accepted result or unresolved risk makes this the next useful experiment?

## Hypothesis

State the claim narrowly enough that a failed result is interpretable.

## Fixture

Describe authored inputs, parameters, initial runtime state and the single primary intervention.

## Gates

| ID | Evidence class | Metric / condition | Pass criterion | Reason |
|---|---|---|---|---|
| example.identity | synthetic | surviving source IDs preserved | exact | persistent identity invariant |

## Implementation boundary

What code/path is allowed to change? What is deliberately frozen?

## Results

Record actual measurements and failed attempts. Do not write expected results as if executed.

## Verdict

Use one:

- **SUPPORTED FOR FIXTURE**
- **REJECTED**
- **INCONCLUSIVE**
- **BLOCKED**
- **REGRESSION**

Explain why.

## Evidence boundary

List what the result does not prove.

## Owner gate

Required / not required. Record manual evidence separately from CI.

## Promotion candidates

Which demonstrated boundaries, if any, deserve reuse outside this experiment? Default: none.

## Next falsifier

Only after the current verdict is established.
