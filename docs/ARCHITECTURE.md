# Architecture

React + TypeScript + Vite serves a static client application. `src/data` contains a provider-shaped bundled capture; `src/analytics` is UI-independent deterministic calculation; `src/config` contains scoring weights; `src/domain` contains the data contract; `src/App.tsx` only presents results.

ADR-001: Use an in-app bundled price capture for V0 because IDX blocked automated retrieval from this environment and Yahoo is unofficial. The provider boundary keeps a server-side licensed provider replaceable.

ADR-002: No database, backend, AI, queues or chart dependency in V0. An SVG price path is sufficient for the first vertical slice.
