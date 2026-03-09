#!/usr/bin/env python3
"""
build_graph.py — Auto-generates web/src/data/kgData.ts from YAML data files.

Usage (run from repository root):
    python scripts/build_graph.py

Requires PyYAML:
    pip install pyyaml
"""

import json
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / "data"
EVIDENCE_DIR = DATA_DIR / "evidence-claims"
OUTPUT_FILE = REPO_ROOT / "web" / "src" / "data" / "kgData.ts"

# Maps directory (relative to REPO_ROOT, forward-slash) → LinkML class name.
# More specific paths must come before their parents — resolved by longest-match.
DIR_TO_CLASS = {
    "data/agents/drugs/anabolic-androgens/dht-derived": "DHTDerivative",
    "data/agents/drugs/anabolic-androgens/testosterone-derived": "TestosteroneDerivative",
    "data/agents/drugs/anabolic-androgens/nandrolone-derived": "NandroloneDerivative",
    "data/agents/drugs/5ar-inhibitors": "FiveARInhibitor",
    "data/agents/drugs/vasodilators": "Vasodilator",
    "data/agents/drugs/antifungals": "Antifungal",
    "data/agents/drugs/ar-antagonists": "AndrogenAntagonist",
    "data/agents/drugs/steroid-hormones": "SteroidHormone",
    "data/agents/drugs/peptide-hormones": "PeptideHormone",
    "data/agents/drugs": "Drug",
    "data/agents/supplements": "Supplement",
    "data/agents/peptides": "ResearchPeptide",
    "data/agents/topicals": "Dermatological",
    "data/procedures/dermal": "DermalProcedure",
    "data/procedures/photobiomodulation": "PhotobiomodulationProtocol",
    "data/procedures/physical": "PhysicalIntervention",
    "data/procedures/dietary": "DietaryProtocol",
    "data/procedures/administration": "AdministrationProcedure",
    "data/outcomes/hair": "HairOutcome",
    "data/outcomes/skin": "SkinOutcome",
    "data/outcomes/biomarkers/hormonal": "HormonalBiomarker",
    "data/outcomes/biomarkers/metabolic": "MetabolicBiomarker",
    "data/outcomes/biomarkers/inflammatory": "InflammatoryBiomarker",
    "data/outcomes/biomarkers": "Biomarker",
    "data/outcomes/symptoms": "Symptom",
    "data/outcomes/conditions": "HealthCondition",
    "data/outcomes/performance": "PerformanceMetric",
    "data/concepts/paradigms": "HealthParadigm",
}

# Fields that become direct KGNode properties (not stuffed into `extra`)
NODE_BASE_FIELDS = {"id", "name", "description", "aliases", "xrefs", "paradigms"}


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_class_for_file(yaml_path):
    """Return the LinkML class name for a YAML file based on its parent directory."""
    rel_dir = yaml_path.relative_to(REPO_ROOT).parent.as_posix()
    best_cls = None
    best_len = 0
    for prefix, cls in DIR_TO_CLASS.items():
        if rel_dir == prefix or rel_dir.startswith(prefix + "/"):
            if len(prefix) > best_len:
                best_cls = cls
                best_len = len(prefix)
    return best_cls


def load_yaml(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def ts_value(v):
    """Recursively convert a Python value to TypeScript source literal."""
    if v is None:
        return "undefined"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        return json.dumps(v)
    if isinstance(v, list):
        items = ", ".join(ts_value(x) for x in v)
        return f"[{items}]"
    if isinstance(v, dict):
        pairs = ", ".join(
            f"{json.dumps(k)}: {ts_value(val)}"
            for k, val in v.items()
            if val is not None
        )
        return f"{{ {pairs} }}"
    return json.dumps(str(v))


# ── Node building ──────────────────────────────────────────────────────────────

def build_nodes():
    nodes = []
    for yaml_path in sorted(DATA_DIR.rglob("*.yaml")):
        # Skip the evidence directory
        try:
            yaml_path.relative_to(EVIDENCE_DIR)
            continue
        except ValueError:
            pass

        cls = get_class_for_file(yaml_path)
        if cls is None:
            continue

        data = load_yaml(yaml_path)
        if not data or "id" not in data:
            print(f"  SKIP (no id): {yaml_path.relative_to(REPO_ROOT)}", file=sys.stderr)
            continue

        node = {
            "id": data["id"],
            "label": data.get("name", data["id"]),
            "type": cls,
        }
        if "paradigms" in data:
            node["paradigms"] = data["paradigms"]
        if "description" in data:
            # Collapse multi-line YAML strings to single line
            node["description"] = " ".join(str(data["description"]).split())
        if "aliases" in data:
            node["aliases"] = data["aliases"]
        if "xrefs" in data:
            node["xrefs"] = data["xrefs"]

        # Collect scalar extras and flat string-list extras that aren't base fields
        extra = {}
        for k, v in data.items():
            if k in NODE_BASE_FIELDS:
                continue
            if v is None:
                continue
            if isinstance(v, (str, int, float, bool)):
                extra[k] = v
            elif isinstance(v, list) and v and all(isinstance(x, str) for x in v):
                extra[k] = v
        if extra:
            node["extra"] = extra

        nodes.append(node)
    return nodes


# ── Edge building ──────────────────────────────────────────────────────────────

def build_edges():
    edges = []
    for yaml_path in sorted(EVIDENCE_DIR.glob("*.yaml")):
        data = load_yaml(yaml_path)
        if not data:
            continue

        assertion = data.get("assertion", {})
        # Source: subject_procedure > subject_agent > subject_outcome
        source = (assertion.get("subject_procedure")
                  or assertion.get("subject_agent")
                  or assertion.get("subject_outcome"))
        # Target: object_outcome > object_agent
        target = assertion.get("object_outcome") or assertion.get("object_agent")

        if not source or not target:
            print(
                f"  WARNING: skipping {yaml_path.name} — missing source ({source!r}) or target ({target!r})",
                file=sys.stderr,
            )
            continue

        edge = {
            "id": data.get("id", yaml_path.stem),
            "source": source,
            "target": target,
            "relation": assertion.get("predicate", "associated_with"),
            "grade": data.get("overall_grade", "very_low"),
            "nSupporting": data.get("n_supporting_studies", 0),
            "nRefuting": data.get("n_refuting_studies", 0),
            "status": data.get("claim_status", "preliminary"),
        }

        if assertion.get("dose_description"):
            edge["doseDescription"] = assertion["dose_description"]
        if assertion.get("population"):
            edge["population"] = " ".join(str(assertion["population"]).split())
        if assertion.get("mechanism_summary"):
            edge["mechanismSummary"] = " ".join(str(assertion["mechanism_summary"]).split())

        # Build studies array from evidence_lines
        studies = []
        for ev_line in data.get("evidence_lines", []):
            study = ev_line.get("study", {})
            title = study.get("title")
            if not title:
                continue
            s = {
                "title": " ".join(str(title).split()),
                "design": study.get("design", "unknown"),
                "direction": ev_line.get("direction", "supports"),
            }
            pmid = study.get("pmid")
            if pmid and str(pmid).strip() not in ("", "null", "None"):
                s["pmid"] = str(pmid)
            doi = study.get("doi")
            if doi:
                s["doi"] = doi
            year = study.get("year")
            if year:
                try:
                    s["year"] = int(year)
                except (ValueError, TypeError):
                    pass
            if ev_line.get("effect_size") is not None:
                s["effectSize"] = ev_line["effect_size"]
            if ev_line.get("effect_size_metric"):
                s["effectSizeMetric"] = ev_line["effect_size_metric"]
            if ev_line.get("percent_change") is not None:
                s["percentChange"] = ev_line["percent_change"]
            if ev_line.get("p_value") is not None:
                s["pValue"] = ev_line["p_value"]
            if ev_line.get("notes"):
                s["notes"] = " ".join(str(ev_line["notes"]).split())
            studies.append(s)

        if studies:
            edge["studies"] = studies

        edges.append(edge)
    return edges


# ── Route edges (administered_via) ────────────────────────────────────────────

def build_route_edges():
    """Generate administered_via edges from agent/procedure YAML administered_via arrays."""
    edges = []
    for yaml_path in sorted(DATA_DIR.rglob("*.yaml")):
        try:
            yaml_path.relative_to(EVIDENCE_DIR)
            continue
        except ValueError:
            pass

        data = load_yaml(yaml_path)
        if not data or "id" not in data or "administered_via" not in data:
            continue

        routes = data["administered_via"]
        if not isinstance(routes, list):
            continue

        source_id = data["id"]
        for route_id in routes:
            if not isinstance(route_id, str):
                continue
            edge_id = f"healthkg:route/{source_id.split(':')[-1].split('/')[-1]}-via-{route_id.split('/')[-1]}"
            edges.append({
                "id": edge_id,
                "source": source_id,
                "target": route_id,
                "relation": "administered_via",
                "nSupporting": 0,
                "nRefuting": 0,
                "status": "active",
            })
    return edges


# ── Rendering ──────────────────────────────────────────────────────────────────

def render_node(node, indent=4):
    p = " " * indent
    lines = [f"{p}{{"]
    for key in ["id", "label", "type", "paradigms", "description", "aliases", "xrefs", "extra"]:
        if key in node:
            lines.append(f"{p}  {key}: {ts_value(node[key])},")
    lines.append(f"{p}}},")
    return "\n".join(lines)


def render_study(s, indent=10):
    p = " " * indent
    lines = [f"{p}{{"]
    for key in ["pmid", "doi", "title", "year", "design", "direction",
                "effectSize", "effectSizeMetric", "percentChange", "pValue", "notes"]:
        if key in s:
            lines.append(f"{p}  {key}: {ts_value(s[key])},")
    lines.append(f"{p}}},")
    return "\n".join(lines)


def render_edge(edge, indent=4):
    p = " " * indent
    lines = [f"{p}{{"]
    for key in ["id", "source", "target", "relation", "grade", "nSupporting",
                "nRefuting", "status", "doseDescription", "population", "mechanismSummary"]:
        if key in edge:
            lines.append(f"{p}  {key}: {ts_value(edge[key])},")
    if "studies" in edge:
        lines.append(f"{p}  studies: [")
        for s in edge["studies"]:
            lines.append(render_study(s, indent + 6))
        lines.append(f"{p}  ],")
    lines.append(f"{p}}},")
    return "\n".join(lines)


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("=== build_graph.py ===")
    print(f"Repo root : {REPO_ROOT}")
    print(f"Output    : {OUTPUT_FILE.relative_to(REPO_ROOT)}")
    print()

    print("Building nodes...")
    nodes = build_nodes()
    print(f"  -> {len(nodes)} nodes")

    print("Building evidence-claim edges...")
    edges = build_edges()
    print(f"  -> {len(edges)} evidence edges")

    print("Building route edges (administered_via)...")
    route_edges = build_route_edges()
    edges = edges + route_edges
    print(f"  -> {len(route_edges)} route edges  ({len(edges)} total)")
    print()

    node_block = "\n".join(render_node(n) for n in nodes)
    edge_block = "\n".join(render_edge(e) for e in edges)

    ts_output = f"""\
// AUTO-GENERATED — do not edit manually.
// Regenerate with: python scripts/build_graph.py
//
// Source data:
//   Nodes : data/agents/**/*.yaml
//           data/procedures/**/*.yaml
//           data/outcomes/**/*.yaml
//   Edges : data/evidence-claims/*.yaml
import type {{ KGGraph }} from '../types';

export const kgData: KGGraph = {{
  nodes: [
{node_block}
  ],

  edges: [
{edge_block}
  ],
}};
"""

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(ts_output, encoding="utf-8")
    print(f"Written -> {OUTPUT_FILE.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
