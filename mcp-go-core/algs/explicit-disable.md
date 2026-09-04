# Explicit Disable Validation Algorithm

**Feature:** F56 — Explicit disable validation  
**Module:** internal/featuregraph  
**Task:** T020  

## Objective

Ensure that explicitly-disabled features do not break hard dependencies of enabled features.

## Rule

Given:
```
streamable-http → http → core
```

User sets:
```yaml
enable:
  - streamable-http
disable:
  - http
```

Result MUST be `ERROR FEATURE_REQUIRED`, not silent re-enable.

## Priority Rules

```text
REQUIRED         >  (highest: cannot be disabled)
EXPLICIT DISABLE >  (user wants this off)
EXPLICIT ENABLE  >
INFERRED         >
AUTO             (lowest)
```

> `DISABLED` does not override a true HARD dependency.

## Algorithm

```text
func validateExplicitDisable(features, disabled, descriptors):
    for feature in features:
        if feature in disabled:
            continue  // this feature is disabled, skip
        for dep in descriptors[feature].hard_dependencies:
            if dep in disabled and dep != "core":
                return ERROR FEATURE_REQUIRED {
                    feature: dep,
                    required_by: feature,
                }
    return nil
```

## Acceptance Test Cases

| Case | Enable | Disable | Expected |
|---|---|---|---|
| Hard dependency disabled | streamable-http | http | ERROR FEATURE_REQUIRED |
| Optional dependency disabled | A | B (optional dep of A) | Feature B removed, no error |
| Core always enabled | Any | core | ERROR (core cannot be disabled) |
| Non-conflicting disable | A, B | C | PASS (C simply not in enabled set) |
