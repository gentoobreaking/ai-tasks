# Conflict Validation Algorithm

**Feature:** F54 — Graph validation (conflicts)  
**Module:** internal/featuregraph  
**Task:** T019  

## Objective

Detect when two or more conflicting features are simultaneously enabled.

## Algorithm

```text
func validateConflicts(features):
    for feature in features:
        for conflict in feature.conflicts:
            if conflict in features:
                return ERROR FEATURE_CONFLICT {
                    features: [feature, conflict],
                    reason: feature.conflict_reasons[conflict] or "incompatible feature selection"
                }
    return nil
```

## Example

Feature `stdio` conflicts with `streamable-http`. If both are enabled, the resolver must produce:

```text
ERROR FEATURE_CONFLICT

features:
  stdio
  streamable-http

reason:
  incompatible transport selection
```

## Acceptance Test Cases

| Case | Input | Expected |
|---|---|---|
| No conflict | enabled: [core, http], no conflicts | PASS |
| Simple conflict | A conflicts B, enable both | ERROR FEATURE_CONFLICT |
| Transitive conflict | A implies B, B conflicts C, enable A+C | ERROR FEATURE_CONFLICT |
| Same feature not self-conflicting | A (no self-conflict) | PASS |
