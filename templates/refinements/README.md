# Refinement Pattern Configuration Guide

This document details the configuration options and operational constraints for refinement pattern simulation in SolidBench using [sparql-query-parameter-instantiator](https://github.com/SolidBench/sparql-query-parameter-instantiator.js). 
The processor uses JSON configuration files to simulate user query refinements (additions, removals, and substitutions) of existing SolidBench query templates.
These refinements are randomly applied when valid, and thus can produce many different combinations of related queries.

## Base Configuration Object

The configuration file contains an array of refinement pattern objects. Each object defines a specific mutation to apply to a query during sequence generation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Number | Unique identifier for the refinement pattern. |
| `type` | String | The operator type to modify: `BGP`, `OPTIONAL`, `UNION`, `FILTER`, or `SUB`. |
| `operation` | String | The action to perform: `addition` or `removal`. |
| `description` | String | Human-readable explanation of the pattern. |
| `location` | Number | The zero-based index of the target block (e.g., the specific BGP or UNION block) within the query's WHERE clause. |
| `target` | Array/Object | The payload defining the triples, expressions, or variables to add or remove. Structure varies by `type`. |

---

## Pattern Types and Targets

The `target` field structure depends strictly on the `type` of the operator.

### BGP and OPTIONAL
Targets for `BGP` (Basic Graph Pattern) and `OPTIONAL` operate on arrays of triples.

* **Target Structure:** An array of triple objects defining `subject`, `predicate`, and `object`.
* **Term Types:** Valid `termType` values include `variable`, `namedNode`, and `literal` (for objects only).

```json
"target": [
  {
    "subject": { "value": "forum", "termType": "variable" },
    "predicate": { "value": "[http://example.org/hasMember](http://example.org/hasMember)", "termType": "namedNode" },
    "object": { "value": "member", "termType": "variable" }
  }
]
```

### UNION

Targets for UNION define both the left and right branches of the union operator.

* **Target Structure:** An array containing exactly two arrays of triple objects. Index 0 represents the left branch, and index 1 represents the right branch. To selectively modify only one branch, pass an empty array to the other side (e.g., [ [], [{...}] ]).

```json
"target": [
  [
    { "subject": { "value": "forum", "termType": "variable" }, "predicate": { "value": "[http://example.org/tag](http://example.org/tag)", "termType": "namedNode" }, "object": { "value": "tag", "termType": "variable" } }
  ],
  [
    { "subject": { "value": "forum", "termType": "variable" }, "predicate": { "value": "[http://example.org/location](http://example.org/location)", "termType": "namedNode" }, "object": { "value": "location", "termType": "variable" } }
  ]
]
```

### FILTER

Targets for FILTER define SPARQL.js Expression objects.

* **Target Structure:** An array of operation objects detailing the operator and arguments.

```json
"target": [
  {
    "type": "operation",
    "operator": "=",
    "args": [
      { "termType": "variable", "value": "location" },
      { "termType": "variable", "value": "location1" }
    ]
  }
]
```
In the preceding example, you can use variable instantiation (explain below) to filter equality with a `NamedNode` or `Literal`.

### SUB (Substitution)

Substitutes a template variable with an alternative value to simulate user interactions, such as navigating to a different profile, entity, or message.

* **Target Structure:** A single variable object specifying the target to replace.
* **Note on Values:** The configuration does not contain the substitution values. The processor generates the replacement values dynamically at runtime via variable mappings or probabilistic sampling. The config only acts as the trigger and locator.

```json
"target": { "value": "person", "termType": "variable" }
```

### Instantiate Refinement Variables

Refinement pattern variables are instantiated similarly to query templates by defining a `substitutionProvider`. This allows dynamic value injection within mutated query blocks. Examples of this implementation are available in the default `fragmenter-config-pod-sequences.json` and `query-sequence-config.json` configurations.