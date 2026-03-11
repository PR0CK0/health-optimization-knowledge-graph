# Health Optimization Knowledge Graph

> **Work in progress.** The data and schema are functional but incomplete. See [TODO.md](TODO.md) for known gaps.

A BFO-aligned, evidence-graded knowledge graph mapping health optimization interventions (supplements, drugs, peptides, procedures) to outcomes, backed by primary literature with explicit evidence grading.

**Live app:** [pr0ck0.github.io/health-optimization-knowledge-graph](https://pr0ck0.github.io/health-optimization-knowledge-graph/)

## What is this?

Every claim is an `EvidenceClaim` — a self-contained unit asserting that *[agent/procedure]* *[increases | decreases | modulates | ...]* *[outcome]*, with:

- One or more `EvidenceLine` entries linking to specific studies
- **GRADE certainty** (high / moderate / low / very low)
- **ECO evidence type** per study (RCT, systematic review, animal, in vitro, ...)
- **Effect sizes** with confidence intervals and p-values where available
- **Claim status** (active, disputed, preliminary, refuted)

## Current coverage

The graph's primary focus is **hair health** — agents, procedures, and evidence claims are most complete there. The schema and paradigm ontology cover a broader set of domains listed below, but data density varies.

### Hair health (primary focus)

| Domain | Agents / Procedures |
|---|---|
| AGA pharmacology | Finasteride, Dutasteride, RU58841, Estradiol |
| Topicals & adjuncts | Minoxidil, Ketoconazole, Caffeine shampoo, Saw Palmetto, Pygeum |
| Peptides | BPC-157, TB-500, GHK-Cu |
| Procedures | PRP scalp injection, Scalp microneedling, Red/NIR light therapy |

### Other paradigms (schema defined, data sparse)

| Paradigm | Notes |
|---|---|
| Skin health | GHK-Cu collagen synthesis, beef tallow barrier |
| Hormonal health | HGH, testosterone, DHT axis, anabolic androgens |
| Longevity | NMN / NAD+ axis |
| Metabolic health | Planned |
| Musculoskeletal | Planned |
| Mitochondrial health | Planned |
| Recovery | Planned |
| Tissue repair | Planned |
| Wound healing | Planned |
| Cardiovascular | Planned |
| Gut microbiome | Planned |
| Immune function | Planned |
| Bone health | Planned |

## Ontologies & vocabularies

### Formally declared schema namespaces

| Ontology | Full name | Role |
|---|---|---|
| **BFO** | Basic Formal Ontology (ISO/IEC 21838-2) | Root class hierarchy |
| **RO** | Relation Ontology | Formal inter-class relationships |
| **IAO** | Information Artifact Ontology | Information content entities |
| **OBI** | Ontology for Biomedical Investigations | Study design types (RCT, meta-analysis) |
| **ECO** | Evidence & Conclusions Ontology | Per-study evidence type |
| **STATO** | Statistics Ontology | Effect size metrics (Cohen's d, OR, HR) |
| **ChEBI** | Chemical Entities of Biological Interest | Primary chemical/drug identifier |
| **GO** | Gene Ontology | Mechanism-of-action biological processes |
| **HP** | Human Phenotype Ontology | Phenotype and outcome terms |
| **UBERON** | Uberon Multi-Species Anatomy Ontology | Anatomical sites (scalp, hair follicle) |
| **MONDO** | Mondo Disease Ontology | Disease/condition classification |
| **MAXO** | Medical Action Ontology | Procedural interventions |
| **NCIT** | NCI Thesaurus | Routes of administration, biomedical concepts |
| **LOINC** | Logical Observation Identifiers Names and Codes | Lab/biomarker observation codes |
| **PROV** | W3C Provenance Ontology | Data provenance |

### External identifier schemes used in data

| Scheme | Example | Purpose |
|---|---|---|
| **ChEBI** | `CHEBI:5062` | Chemical entity identity |
| **DrugBank** | `DB01216` | Drug database cross-reference |
| **PubChem CID** | `57363` | Compound database cross-reference |
| **RxNorm** | `692450` | Normalized drug naming (NLM) |
| **CAS Number** | `98319-26-7` | Chemical registry |
| **ATC** | `G04CB01` | WHO drug classification |
| **UniProt** | `UniProtKB:P31213` | Molecular target (protein/enzyme) |
| **PMID** | `9738759` | PubMed literature citation |
| **DOI** | `10.1016/...` | Publication cross-reference |

## Stack

| Layer | Technology |
|---|---|
| Schema | [LinkML](https://linkml.io/) (YAML → JSON Schema / OWL / Python / TypeScript) |
| Data | Hand-curated YAML files in `data/` |
| Build pipeline | Python (`scripts/build_graph.py`) |
| Web UI | React + TypeScript + Vite, [Cytoscape.js](https://cytoscape.js.org/) |
| Docs | MkDocs + Material theme |

## Project layout

```
schema/          # LinkML schema files
data/
  agents/        # drugs/, supplements/, peptides/, topicals/
  concepts/      # biomarkers, hair, skin, ...
  evidence-claims/
  outcomes/
  procedures/
scripts/
  build_graph.py # builds the Cytoscape-ready JSON from YAML data
web/             # React frontend (graph explorer)
docs/            # MkDocs source
Makefile         # validate, generate, docs-serve, docs-deploy
pyproject.toml
```

## Getting started

```bash
# Install Python dependencies
pip install -e ".[dev]"

# Validate the LinkML schema
make validate

# Generate all artifacts (JSON Schema, OWL, Python types, TypeScript types)
make all

# Serve documentation locally
make docs-serve
```

### Run the web UI

```bash
cd web
npm install
npm run dev
```

To rebuild the graph data before starting the frontend:

```bash
python scripts/build_graph.py
```

## Schema overview

```mermaid
graph TD
    EC[EvidenceClaim] --> HA[HealthAssertion]
    EC --> EL[EvidenceLine]
    HA --> CA[ChemicalAgent]
    HA --> PR[Procedure]
    HA --> HO[HealthOutcome]
    EL --> ST[Study]
    CA --> SU[Supplement]
    CA --> RP[ResearchPeptide]
    CA --> DR[Drug]
    CA --> TO[Topical]
    PR --> DP[DermalProcedure]
    PR --> PH[PhysicalIntervention]
    PR --> DT[DietaryProtocol]
    HO --> BM[Biomarker]
    HO --> SY[Symptom]
    HO --> HC[HealthCondition]
    HO --> HR[HairOutcome]
    HO --> SK[SkinOutcome]
```

## License

MIT
