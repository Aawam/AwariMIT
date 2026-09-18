# Architecture

React + TypeScript + Vite serves a static client application. `src/data` contains provider-shaped bundled captures; `src/analytics` is UI-independent deterministic calculation; `src/config` contains scoring weights and confidence thresholds; `src/domain` contains the data contract; and `src/App.tsx` presents results.

ADR-001: Use an in-app bundled price capture for V0 because IDX blocked automated retrieval from this environment and Yahoo is unofficial. The provider boundary keeps a server-side licensed provider replaceable.

ADR-002: No database, backend, AI, queues or chart dependency in V0. An SVG price path is sufficient for the first vertical slice.

ADR-003: Keep Composite Score, Evidence Coverage and Confidence separate. Score can normalize missing factors, but coverage preserves how much configured evidence is actually represented. Status gating prevents a sparse high score from becoming Strong Candidate.

ADR-004: Use a `NewsProvider` boundary and a labelled fixture until a legal, stable, traceable live provider is authorized.
