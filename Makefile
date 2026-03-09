# Health Optimization KG — Makefile
# Requires: pip install linkml mkdocs mkdocs-material mkdocs-mermaid2-plugin

SCHEMA_DIR   := schema
SCHEMA_MAIN  := $(SCHEMA_DIR)/health_optimization_kg.yaml
GEN_DIR      := generated
DOCS_DIR     := docs/schema

# ── Install ───────────────────────────────────────────────────────────────────
install:
	pip install -e ".[dev]"

install-llm:
	pip install -e ".[llm]"

# ── Validation ────────────────────────────────────────────────────────────────
# Validate schema files are syntactically correct LinkML
validate:
	gen-linkml --validate $(SCHEMA_MAIN)

# Validate a data YAML file against the schema
# Usage: make validate-data FILE=data/agents/supplements/minoxidil.yaml CLASS=Drug
validate-data:
	linkml-validate -s $(SCHEMA_MAIN) -C $(CLASS) $(FILE)

# ── Code generation ───────────────────────────────────────────────────────────
$(GEN_DIR):
	mkdir -p $(GEN_DIR)/jsonschema $(GEN_DIR)/owl $(GEN_DIR)/typescript $(GEN_DIR)/python

# JSON Schema — used by the browser for client-side validation
jsonschema: $(GEN_DIR)
	gen-json-schema $(SCHEMA_MAIN) > $(GEN_DIR)/jsonschema/health_optimization_kg.schema.json
	@echo "✓ JSON Schema → $(GEN_DIR)/jsonschema/"

# OWL — for BFO/OBO Foundry interoperability and Protégé import
owl: $(GEN_DIR)
	gen-owl $(SCHEMA_MAIN) > $(GEN_DIR)/owl/health_optimization_kg.owl.ttl
	@echo "✓ OWL (Turtle) → $(GEN_DIR)/owl/"

# Python dataclasses — for data pipeline scripts
python: $(GEN_DIR)
	gen-python $(SCHEMA_MAIN) > $(GEN_DIR)/python/health_optimization_kg.py
	@echo "✓ Python dataclasses → $(GEN_DIR)/python/"

# TypeScript types — for the browser frontend
typescript: $(GEN_DIR)
	gen-typescript $(SCHEMA_MAIN) > $(GEN_DIR)/typescript/health_optimization_kg.ts
	@echo "✓ TypeScript → $(GEN_DIR)/typescript/"

# SHACL shapes — for RDF validation
shacl: $(GEN_DIR)
	gen-shacl $(SCHEMA_MAIN) > $(GEN_DIR)/shacl/health_optimization_kg.shacl.ttl
	@echo "✓ SHACL → $(GEN_DIR)/shacl/"

# ER diagram — class relationship diagram (Mermaid)
erdiagram: $(GEN_DIR)
	gen-erdiagram $(SCHEMA_MAIN) > $(GEN_DIR)/erdiagram.mermaid
	@echo "✓ ER diagram → $(GEN_DIR)/erdiagram.mermaid"

# Generate everything
all: jsonschema owl python typescript shacl erdiagram
	@echo "✓ All artifacts generated."

# ── Documentation ─────────────────────────────────────────────────────────────
# Generate mkdocs markdown from schema (into docs/schema/)
docs-gen:
	mkdir -p $(DOCS_DIR)
	gen-doc -d $(DOCS_DIR) $(SCHEMA_MAIN)
	@echo "✓ Schema docs generated in $(DOCS_DIR)/"

# Serve docs locally (hot-reload)
docs-serve: docs-gen
	mkdocs serve

# Build static docs site
docs-build: docs-gen
	mkdocs build

# Deploy to GitHub Pages
docs-deploy: docs-gen
	mkdocs gh-deploy --force

# ── Data utilities ────────────────────────────────────────────────────────────
# Validate all data files in the data/ directory
validate-all-data:
	@echo "Validating all supplement data..."
	@for f in data/agents/supplements/*.yaml; do \
		linkml-validate -s $(SCHEMA_MAIN) -C Supplement $$f && echo "✓ $$f"; \
	done
	@echo "Validating all peptide data..."
	@for f in data/agents/peptides/*.yaml; do \
		linkml-validate -s $(SCHEMA_MAIN) -C ResearchPeptide $$f && echo "✓ $$f"; \
	done
	@echo "Validating all drug data..."
	@for f in data/agents/drugs/*.yaml; do \
		linkml-validate -s $(SCHEMA_MAIN) -C Drug $$f && echo "✓ $$f"; \
	done
	@echo "Validating all evidence claims..."
	@for f in data/evidence/*.yaml; do \
		linkml-validate -s $(SCHEMA_MAIN) -C EvidenceClaim $$f && echo "✓ $$f"; \
	done

# ── Clean ─────────────────────────────────────────────────────────────────────
clean:
	rm -rf $(GEN_DIR)
	rm -rf site/
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

.PHONY: install install-llm validate validate-data jsonschema owl python typescript \
        shacl erdiagram all docs-gen docs-serve docs-build docs-deploy \
        validate-all-data clean
