# TODO

## Data

### [ ] Add contraindications and side effects to all agent YAMLs

Every agent YAML should gain two new top-level fields:

```yaml
contraindications:
  - Pregnancy and breastfeeding
  - Hepatic impairment (specify grade if relevant)
  - Co-administration with <drug> (interaction)

side_effects:
  common:        # ≥1% incidence
    - Sexual dysfunction (libido, ejaculation, erectile)
  uncommon:      # 0.1–1%
    - Breast tenderness / gynaecomastia
  rare:          # <0.1%
    - Post-finasteride syndrome (contested — see notes)
  black_box: false   # set true if FDA black box warning applies
```

Agents to fill in (all currently missing these fields):

| Agent | Key contraindications | Key side effects |
|---|---|---|
| Finasteride (`drugs/finasteride.yaml`) | Pregnancy (teratogenic — Cat X), women of childbearing age, allergy | Sexual SE ~1–2%, possible PFS, elevated breast cancer risk with long-term use |
| Dutasteride (`drugs/dutasteride.yaml`) | Pregnancy/women (Cat X — absorbed transdermally), blood donation (6-month hold) | Sexual SE ~5–9%, gynaecomastia, elevated HCC risk (unresolved) |
| Minoxidil (`drugs/minoxidil.yaml`) | Pheochromocytoma, severe renal impairment | Initial shedding, scalp irritation, hypertrichosis; systemic: fluid retention, tachycardia |
| Ketoconazole (`agents/drugs/ketoconazole.yaml`) | Active liver disease, QT-prolonging drugs | Topical: contact dermatitis; oral (not for hair): severe hepatotoxicity |
| Estradiol (`drugs/estradiol.yaml`) | History of oestrogen-receptor+ cancer, thromboembolic history, liver disease | DVT/PE, breast tenderness, fluid retention, mood changes |
| HGH (`drugs/hgh.yaml`) | Active malignancy, proliferative retinopathy, Prader-Willi with obesity | Fluid retention, carpal tunnel, insulin resistance, acromegaly with chronic supraphysiological use |
| NMN (`supplements/nmn.yaml`) | None established | Nausea at high doses; theoretical: NAD+ → ADPR → possible pro-inflammatory signalling (unresolved) |
| Vitamin D3 (`supplements/vitamin-d3.yaml`) | Hypercalcaemia, sarcoidosis, Williams syndrome | Hypercalcaemia at doses >10,000 IU/day; interacts with thiazides |
| BPC-157 (`peptides/bpc-157.yaml`) | No human safety data; theoretical cancer promotion concern | Unknown long-term; not approved for human use |
| TB-500 (`peptides/tb-500.yaml`) | No human safety data; potential angiogenesis-driven tumour promotion | Unknown; not approved for human use |
| GHK-Cu (`peptides/ghk-cu.yaml`) | None established for topical | Potential skin irritation at high concentrations |
| Saw Palmetto (`supplements/saw-palmetto.yaml`) | None established | Rare GI upset; theoretical anticoagulant interaction |
| Caffeine topical (`topicals/caffeine-topical.yaml`) | Contact allergy (rare) | None clinically significant at 0.2% formulation |
| Beef Tallow (`topicals/beef-tallow.yaml`) | Allergy to bovine-derived products | Comedogenicity risk for acne-prone skin |

### [ ] Add contraindications to procedure YAMLs

| Procedure | Key contraindications |
|---|---|
| PRP Scalp Injection (`dermal/prp-scalp.yaml`) | Active scalp infection, platelet dysfunction disorders, anticoagulant therapy, blood cancers |
| Scalp Microneedling | Active scalp infection, keloid history, isotretinoin use within 6 months |
| Red/NIR Light Therapy | Active cancer at treatment site, photosensitising medications, pregnancy (device-dependent) |

---

### [x] Resolve "Topical" naming collision — DONE

Two different things are currently called "Topical":

1. **Agent type `Topical`** (schema class) — a cosmetic/skincare product that is inherently a topical formulation (beef tallow, caffeine shampoo, GHK-Cu serum). Lives under `ChemicalAgent`.
2. **Administration route `healthkg:procedure/topical-application`** — the *act* of applying something to the skin surface. Lives under `AdministrationProcedure`.

Both appear in the legend panel with the label "Topical", which is confusing.

**Proposed fix:** Rename the agent class from `Topical` → `TopicalAgent` or `SkinCareFormulation` in:
- `scripts/build_graph.py` (DIR_TO_CLASS mapping)
- `web/src/data/schemaGraph.ts`
- `web/src/App.tsx` (NODE_COLOR, KG_LEGEND)
- All agent YAML files in `data/agents/topicals/` (no field change needed — `type` is derived from directory)
- `web/src/types.ts` (NodeType union)

Also update the legend label for the route from "Topical" → "Topical Application" for clarity.

---

## Schema / Ontology

### [ ] Add `contraindications` and `side_effects` to LinkML schema

When the schema (`schema/health_kg.yaml`) is updated, add:

```yaml
slots:
  contraindications:
    range: string
    multivalued: true
    description: Conditions or co-medications that preclude safe use.

  side_effects:
    range: SideEffectProfile   # new class
    description: Structured adverse effect profile.
```

### [ ] Surface contraindications/side effects in the UI

- In `NodeDetailPanel.tsx`, render a "Contraindications" section (red-tinted) and a "Side Effects" section when these fields are present in `node.extra`.
- Consider a dedicated warning icon on nodes that have a `black_box: true` flag.

---

## UI / Features

### [ ] Interaction checker
Show a warning when two selected/visible nodes share a contraindication — e.g., finasteride + dutasteride simultaneously.

### [ ] Evidence grading explainer tooltip
On hover over a GRADE chip (high/moderate/low/very_low), show what the grade means in plain language.

### [ ] Add more paradigms
- `cognitive_health`
- `cardiovascular_health`
- `gut_health`
- `sleep`

### [ ] Expand to non-hair domains
Currently all agents are hair-focused. Planned expansions:
- Skin (collagen synthesis, barrier, photoageing)
- Longevity / NAD+ axis (NMN, NR, resveratrol, rapamycin)
- Musculoskeletal (BPC-157, TB-500, creatine, collagen peptides)
- Hormonal health (TRT, DHEA, pregnenolone)

---

## Data Architecture / Hard-coded Content

> **Core architectural debt:** Almost all agent definitions, outcome labels, mechanism descriptions, and
> ontology terms are currently **hard-coded YAML**. The long-term goal is to replace or supplement
> this with data sourced from authoritative medical APIs and terminology services so the graph stays
> current, consistent with established standards, and maintainable at scale.

### [ ] Replace hard-coded drug/supplement definitions with RxNorm / PubChem API data

Currently every agent YAML manually specifies names, CAS numbers, synonyms, and descriptions.
These should be derived from:

- **RxNorm** (NIH) — normalized drug names, ingredients, and drug class membership
- **PubChem** (NCBI) — chemical structure, synonyms, molecular formula/weight, CAS RN
- **DrugBank** (if licensed) — mechanism of action, pharmacokinetics, interactions

Proposed approach: a `scripts/fetch_agents.py` sync script that pulls canonical fields from these
APIs and writes them into the YAML files, leaving hand-authored fields (e.g. `evidence_claims`)
untouched.

### [ ] Replace hard-coded outcome / symptom terms with SNOMED CT / MeSH

Outcome nodes (`data/outcomes/`) and concept nodes (`data/concepts/`) use free-text labels that
are not aligned to any standard terminology. They should be grounded in:

- **SNOMED CT** — clinical findings, disorders, body structures
- **MeSH** (NLM) — medical subject headings for conditions and anatomy
- **HPO** (Human Phenotype Ontology) — phenotypic abnormalities

Each outcome YAML should carry a `snomed_id`, `mesh_id`, or `hpo_id` alongside the human label.

### [ ] Replace hand-curated evidence grading with semi-automated pipeline

Evidence claims are manually graded (GRADE: high / moderate / low / very_low). This should move
toward a pipeline that:

1. Resolves PMIDs against **PubMed E-utilities** to pull titles, abstracts, and study metadata
2. Extracts study design (RCT, cohort, meta-analysis) automatically using NLP or the PubMed
   `publication type` field
3. Pre-fills ECO evidence type and suggested GRADE, leaving final override to a human reviewer

### [ ] Replace hard-coded mechanism descriptions with MeSH / GO terms

Mechanism-of-action text is currently free-form prose in agent YAMLs. These should be linked to:

- **Gene Ontology (GO)** — biological process / molecular function terms
- **MeSH pharmacological actions** — standardized mechanism vocabulary

---

## Build / Infrastructure

### [ ] Unit-test build_graph.py output
Assert that all `administered_via` targets in agent YAMLs resolve to known node IDs.

### [ ] OWL/RDF export
`scripts/build_ontology.py` — serialise the graph as OWL/RDF using LinkML `gen-owl` or direct rdflib output for SPARQL querying.

### [ ] Validate PMIDs
Script to hit PubMed E-utilities API and verify that each PMID in evidence-claims actually resolves, flagging any marked `pmid_confidence: approximate`.
