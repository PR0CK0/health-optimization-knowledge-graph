# Health Optimization KG — Web UI

Interactive knowledge graph explorer built with React, TypeScript, Vite, and [Cytoscape.js](https://cytoscape.js.org/).

## Development

```bash
npm install
npm run dev
```

Before running the frontend, rebuild the graph data from the YAML source:

```bash
# from the repo root
python scripts/build_graph.py
```

## Build

```bash
npm run build   # outputs to dist/
```

## Stack

- React 18 + TypeScript
- Vite
- Cytoscape.js (graph layout and rendering)
- ESLint + ruff (Python side)
