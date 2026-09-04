# Cycle Detection Algorithm

**Feature:** F54 — Graph validation (cycles, conflicts, duplicates)  
**Module:** internal/featuregraph  
**Task:** T019  

## Objective

Detect cycles in the feature dependency graph using DFS/Kahn's algorithm.

## Graph Representation

Features as nodes; HARD dependencies as directed edges (feature → dependency).

## Algorithm (DFS variant)

```text
func detectCycle(graph):
    visiting = set{}
    visited = set{}

    func dfs(node, chain):
        if node in visiting:
            return chain  // cycle found, return the cycle path
        if node in visited:
            return nil

        visiting.add(node)
        chain = append(chain, node)

        for dep in graph[node].dependencies:
            if cycle = dfs(dep, chain):
                return cycle

        visiting.remove(node)
        visited.add(node)
        return nil

    for node in graph:
        if cycle = dfs(node, []):
            return cycle

    return nil
```

## Cycle Error Format

```text
FEATURE_DEPENDENCY_CYCLE

A → B → C → A
```

Build must fail when a cycle is detected.

## Acceptance Test Cases

| Case | Input | Expected |
|---|---|---|
| No cycle | A→B, B→C | No error |
| Simple cycle | A→B, B→A | ERROR FEATURE_DEPENDENCY_CYCLE, path A→B→A |
| Three-node cycle | A→B, B→C, C→A | ERROR FEATURE_DEPENDENCY_CYCLE, path A→B→C→A |
| Self-dependency | A→A | ERROR FEATURE_DEPENDENCY_CYCLE |
