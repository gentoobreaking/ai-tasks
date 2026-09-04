# Feature Resolution Algorithm

**Feature:** F55 — Dependency resolution (transitive, implies)  
**Module:** internal/featuregraph  
**Task:** T018  

## Objective

Resolve a set of explicitly-enabled features plus inferred features into a deterministic closure that satisfies all hard dependencies while respecting explicit disables.

## Inputs

1. `Config` — explicit enable/disable lists from `mcp.yaml`
2. `Profile` — built-in or custom profile (development, minimal, production, secure, observable, full)
3. `ModuleDescriptors` — each module's feature list and dependencies
4. `FeatureDescriptors` — each feature's dependencies, conflicts, implies, default, optional flags
5. `AnalyzerOutput` — inferred features from application analysis

## Algorithm

```text
resolve():
    features = profile.features           // from profile
    features += config.enabled            // explicit enables
    features += analyzer.inferred         // inference

    repeat:
        features += implies(features)     // expand "implies" edges
        features += dependencies(features) // expand HARD dependency edges
    until no_change                        // convergence fixed-point

    validate_conflicts(features)          // check Conflict sets
    features -= config.disabled           // apply explicit disables AFTER expansion

    validate_required_dependencies(features)  // re-check hard deps still satisfied
    return sort_deterministically(features)
```

## Sorting

Final feature list must be sorted by: `category` → `name`, OR by fixed topological ordering. Same input must always produce identical ordering.

## Priority

```text
REQUIRED  >  EXPLICIT DISABLE  >  EXPLICIT ENABLE  >  INFERRED  >  AUTO
```

## Edge Cases

- If a DISABLED feature is a hard dependency of an ENABLED feature, the resolver MUST error with `FEATURE_REQUIRED`, not silently re-enable.
- If two features conflict, the resolver MUST error with `FEATURE_CONFLICT`.
- The resolution result must be byte-identical across runs.

## Acceptance Test Cases

| Case | Input | Expected Output |
|---|---|---|
| Basic dependency | Enable A, A → B | A, B |
| Transitive dependency | Enable A, A→B, B→C | A, B, C |
| Explicit disable of required | Enable A, A→B, disable B | ERROR FEATURE_REQUIRED |
| Conflict | A conflicts B, enable A+B | ERROR FEATURE_CONFLICT |
| Implies | A implies B, enable A | A, B |
| Cycle | A→B, B→A | ERROR FEATURE_CYCLE |
| Determinism | Same input ×3 | Byte-identical output |
