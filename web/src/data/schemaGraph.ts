// Schema taxonomy graph — derived from schema/health_optimization_kg.yaml
// Regenerate via: scripts/build_schema_graph.py (or update manually after schema changes)
import type { SchemaGraph } from '../types';

export const schemaGraph: SchemaGraph = {
  nodes: [
    // ── BFO Tier 0: root ──────────────────────────────────────────────────────
    {
      id: 'BFOEntity',
      label: 'BFOEntity',
      type: 'bfo-root',
      classUri: 'BFO:0000001',
      abstract: true,
      description: 'BFO:0000001 entity — root of the BFO 2020 hierarchy. Every named entity is ultimately a BFO entity.',
    },

    // ── BFO Tier 1: Continuant / Occurrent ───────────────────────────────────
    {
      id: 'BFOContinuant',
      label: 'BFOContinuant',
      type: 'bfo-base',
      classUri: 'BFO:0000002',
      abstract: true,
      description: 'BFO:0000002 continuant. Persists through time while maintaining identity. Subdivides into independent, specifically dependent, and generically dependent continuants.',
    },
    {
      id: 'BFOOccurrent',
      label: 'BFOOccurrent',
      type: 'bfo-base',
      classUri: 'BFO:0000003',
      abstract: true,
      description: 'BFO:0000003 occurrent. Unfolds or develops through time. Includes processes, process boundaries, and temporal regions.',
    },

    // ── BFO Tier 2: Continuant subtypes ──────────────────────────────────────
    {
      id: 'BFOIndependentContinuant',
      label: 'BFOIndependentContinuant',
      type: 'bfo-base',
      classUri: 'BFO:0000004',
      abstract: true,
      description: 'BFO:0000004 independent continuant. Bearer of qualities and realizable entities. Exists independently of other particulars.',
    },
    {
      id: 'BFOSpecificallyDependentContinuant',
      label: 'BFOSpecificallyDependentContinuant',
      type: 'bfo-base',
      classUri: 'BFO:0000020',
      abstract: true,
      description: 'BFO:0000020 specifically dependent continuant. Depends on specific independent continuant(s) for existence. Includes qualities and realizable entities.',
    },
    {
      id: 'BFOGenericallyDependentContinuant',
      label: 'BFOGenericallyDependentContinuant',
      type: 'bfo-base',
      classUri: 'BFO:0000031',
      abstract: true,
      description: 'BFO:0000031 generically dependent continuant. Can migrate from bearer to bearer. Information content entities (publications, claims) belong here via IAO.',
    },

    // ── BFO Tier 2: Occurrent subtype ────────────────────────────────────────
    {
      id: 'BFOProcess',
      label: 'BFOProcess',
      type: 'bfo-base',
      classUri: 'BFO:0000015',
      abstract: true,
      description: 'BFO:0000015 process. An occurrent that has temporal parts and depends on some material entity. All interventions are modelled as processes.',
    },

    // ── BFO Tier 3: Independent Continuant subtypes ───────────────────────────
    {
      id: 'BFOMaterialEntity',
      label: 'BFOMaterialEntity',
      type: 'bfo-base',
      classUri: 'BFO:0000040',
      abstract: true,
      description: 'BFO:0000040 material entity. An independent continuant with a portion of matter. Chemical agents (drugs, supplements, peptides) are material entities.',
    },

    // ── BFO Tier 3: Specifically Dependent Continuant subtypes ───────────────
    {
      id: 'BFOQuality',
      label: 'BFOQuality',
      type: 'bfo-base',
      classUri: 'BFO:0000019',
      abstract: true,
      description: 'BFO:0000019 quality. A specifically dependent continuant exhibited at all times by its bearer. Used for health outcomes, biomarker values, and phenotypic traits.',
    },
    {
      id: 'BFORealizableEntity',
      label: 'BFORealizableEntity',
      type: 'bfo-base',
      classUri: 'BFO:0000017',
      abstract: true,
      description: 'BFO:0000017 realizable entity. Specifically dependent continuant realizable in a process. Subdivides into dispositions, functions, and roles.',
    },
    {
      id: 'BFODisposition',
      label: 'BFODisposition',
      type: 'bfo-base',
      classUri: 'BFO:0000016',
      abstract: true,
      description: 'BFO:0000016 disposition. A realizable entity whose realization is a process of a specific type. Genetic predispositions, disease susceptibilities.',
    },

    // ── BFO Tier 3: Generically Dependent Continuant subtypes ─────────────────
    {
      id: 'BFOInformationContentEntity',
      label: 'BFOInfoContentEntity',
      type: 'bfo-base',
      classUri: 'IAO:0000030',
      abstract: true,
      description: 'IAO:0000030 information content entity (extends BFO:0000031). An entity about something — publications, evidence claims, health assertions, protocols.',
    },

    // ── Domain abstract ───────────────────────────────────────────────────────
    { id: 'ChemicalAgent',  label: 'ChemicalAgent',  type: 'domain-abstract', classUri: 'CHEBI:24431', abstract: true, description: 'Any chemical with a defined identity introduced into the body.' },
    { id: 'Procedure',      label: 'Procedure',      type: 'domain-abstract', classUri: 'MAXO:0000001', abstract: true, description: 'Non-chemical intervention — mechanical, physical, dietary, or photonic.' },
    { id: 'HealthOutcome',  label: 'HealthOutcome',  type: 'domain-abstract', abstract: true, description: 'Any observable or measurable health-related quality that a claim can target.' },

    // ── Domain concrete: chemical agents ──────────────────────────────────────
    { id: 'Supplement',                  label: 'Supplement',                  type: 'domain-concrete', classUri: 'CHEBI:33292',  description: 'Dietary supplement: vitamins, minerals, herbals, longevity compounds.' },
    { id: 'ResearchPeptide',             label: 'ResearchPeptide',             type: 'domain-concrete',                           description: 'Short peptide used in health optimization (BPC-157, GHK-Cu, etc.).' },
    { id: 'Drug',                        label: 'Drug',                        type: 'domain-concrete', classUri: 'CHEBI:23888',  description: 'Approved or off-label pharmacological agent (minoxidil, finasteride…).' },
    { id: 'FiveARInhibitor',             label: 'FiveARInhibitor',             type: 'domain-concrete', classUri: 'CHEBI:50895',  description: '5-alpha-reductase inhibitor — blocks conversion of testosterone to DHT (finasteride, dutasteride).' },
    { id: 'Vasodilator',                 label: 'Vasodilator',                 type: 'domain-concrete', classUri: 'CHEBI:35620',  description: 'Vasodilatory agent — widens blood vessels to increase tissue perfusion (minoxidil).' },
    { id: 'Antifungal',                  label: 'Antifungal',                  type: 'domain-concrete', classUri: 'CHEBI:35718',  description: 'Antifungal agent with anti-androgenic / anti-inflammatory secondary effects (ketoconazole).' },
    { id: 'AndrogenAntagonist',          label: 'AndrogenAntagonist',          type: 'domain-concrete', classUri: 'CHEBI:50857',  description: 'Non-steroidal androgen receptor antagonist — blocks DHT binding at the follicle (RU58841, bicalutamide).' },
    { id: 'SteroidHormone',              label: 'SteroidHormone',              type: 'domain-concrete', classUri: 'CHEBI:26764',  description: 'Endogenous or exogenous steroidal hormone (estradiol, testosterone, DHEA).' },
    { id: 'AnabolicAndrogen',            label: 'AnabolicAndrogen',            type: 'domain-abstract', classUri: 'CHEBI:50786',  abstract: true, description: 'CHEBI:50786 anabolic androgenic steroid. Synthetic AAS derived from testosterone; classified by structural lineage into DHT-derived, testosterone-derived, and 19-nortestosterone-derived branches.' },
    { id: 'DHTDerivative',               label: 'DHTDerivative',               type: 'domain-concrete',                           description: 'AAS derived from dihydrotestosterone. Cannot aromatize; terminal 5-alpha reduction. High direct AR affinity. Examples: Anavar, Winstrol, Anadrol, Primobolan, Masteron, Superdrol, DHB.' },
    { id: 'TestosteroneDerivative',      label: 'TestosteroneDerivative',      type: 'domain-concrete',                           description: 'AAS derived from testosterone. Variable aromatization; moderate androgenic profile. Examples: Dianabol, Equipoise, Halotestin, Turinabol.' },
    { id: 'NandroloneDerivative',        label: 'NandroloneDerivative',        type: 'domain-concrete',                           description: 'AAS derived from 19-nortestosterone (nandrolone). Missing C19 methyl group; high anabolic:androgenic ratio; progestogenic activity. Examples: Nandrolone (Deca), Trenbolone, MENT.' },
    { id: 'PeptideHormone',              label: 'PeptideHormone',              type: 'domain-concrete', classUri: 'CHEBI:25905',  description: 'Peptide-based hormone or growth factor (HGH, IGF-1).' },
    { id: 'Dermatological',              label: 'Dermatological',              type: 'domain-concrete', classUri: 'MAXO:0001081', description: 'Topically applied formulation — serums, shampoos, creams, tallow, leave-on products.' },

    // ── Domain concrete: procedures ───────────────────────────────────────────
    { id: 'DermalProcedure',             label: 'DermalProcedure',             type: 'domain-concrete', description: 'Skin/scalp procedure (microneedling, laser, PRP, chemical peel).' },
    { id: 'PhotobiomodulationProtocol',  label: 'Photobiomodulation',          type: 'domain-concrete', description: 'Red/NIR light therapy protocol (RLT, PBM, LLLT).' },
    { id: 'PhysicalIntervention',        label: 'PhysicalIntervention',        type: 'domain-concrete', description: 'Sauna, cold plunge, exercise protocol.' },
    { id: 'DietaryProtocol',             label: 'DietaryProtocol',             type: 'domain-concrete', classUri: 'ECTO:0003520', description: 'Fasting, ketogenic, carnivore, caloric restriction, etc.' },
    { id: 'AdministrationProcedure',     label: 'AdministrationProcedure',     type: 'domain-concrete', description: 'Route of delivery for an agent: oral, topical, subcutaneous, intranasal, IV.' },

    // ── Domain concrete: outcomes ─────────────────────────────────────────────
    { id: 'Biomarker',           label: 'Biomarker',           type: 'domain-concrete', classUri: 'NCIT:C16342',  description: 'Quantifiable biological measurement (with LOINC code where available).' },
    { id: 'HormonalBiomarker',   label: 'HormonalBiomarker',   type: 'domain-concrete',                           description: 'Hormone or hormone metabolite measurement (DHT, testosterone, cortisol).' },
    { id: 'InflammatoryBiomarker',label: 'InflammatoryBiomarker',type: 'domain-concrete',                          description: 'Inflammatory marker (CRP, IL-6, TNF-α, homocysteine, etc.).' },
    { id: 'MetabolicBiomarker',  label: 'MetabolicBiomarker',  type: 'domain-concrete',                           description: 'Metabolic measurement (glucose, lipids, NAD+, liver enzymes).' },
    { id: 'HairOutcome',         label: 'HairOutcome',         type: 'domain-concrete', classUri: 'NCIT:C17625',  description: 'Hair density, count, shaft diameter, anagen ratio, shedding rate.' },
    { id: 'SkinOutcome',         label: 'SkinOutcome',         type: 'domain-concrete',                           description: 'Collagen density, elasticity, hydration, wrinkle depth, TEWL.' },
    { id: 'Symptom',             label: 'Symptom',             type: 'domain-concrete', classUri: 'HP:0000118',   description: 'Subjective patient-reported experience (fatigue, brain fog, etc.).' },
    { id: 'HealthCondition',     label: 'HealthCondition',     type: 'domain-concrete', classUri: 'MONDO:0000001',description: 'Diagnosable disease or disorder (AGA, metabolic syndrome, etc.).' },
    { id: 'PerformanceMetric',   label: 'PerformanceMetric',   type: 'domain-concrete',                           description: 'VO2max, 1RM, cognitive test scores, HRV, sleep efficiency.' },

    // ── Evidence model ────────────────────────────────────────────────────────
    { id: 'Study',           label: 'Study',           type: 'domain-concrete', classUri: 'IAO:0000311', description: 'Research publication: RCT, cohort, systematic review, case study, etc.' },
    { id: 'EvidenceLine',    label: 'EvidenceLine',    type: 'domain-concrete',                          description: 'One study\'s contribution to a claim (ECO type, effect size, direction).' },
    { id: 'HealthAssertion', label: 'HealthAssertion', type: 'domain-concrete',                          description: 'Subject [predicate] Object — the atomic health claim.' },
    { id: 'EvidenceClaim',   label: 'EvidenceClaim',   type: 'domain-concrete',                          description: 'Nanopub-inspired: Assertion + EvidenceLines + GRADE + metadata.' },

    // ── Health paradigm ───────────────────────────────────────────────────────
    { id: 'HealthParadigm',  label: 'HealthParadigm',  type: 'domain-concrete', classUri: 'IAO:0000030', description: 'A health paradigm — a named area of clinical/scientific inquiry (hair health, longevity, hormonal health, etc.). Subclass of InformationContentEntity under BFO:0000031 GenericallyDependentContinuant. Paradigms are not material entities; they are conceptual frameworks that can be instantiated across multiple investigative contexts. Individuals correspond to the paradigm tags used across the knowledge graph.' },
  ],

  edges: [
    // ── BFO backbone ──────────────────────────────────────────────────────────
    // Tier 1 → root
    { source: 'BFOContinuant',  target: 'BFOEntity', edgeType: 'is_a' },
    { source: 'BFOOccurrent',   target: 'BFOEntity', edgeType: 'is_a' },

    // Tier 2 → Continuant
    { source: 'BFOIndependentContinuant',         target: 'BFOContinuant', edgeType: 'is_a' },
    { source: 'BFOSpecificallyDependentContinuant', target: 'BFOContinuant', edgeType: 'is_a' },
    { source: 'BFOGenericallyDependentContinuant',  target: 'BFOContinuant', edgeType: 'is_a' },

    // Tier 2 → Occurrent
    { source: 'BFOProcess', target: 'BFOOccurrent', edgeType: 'is_a' },

    // Tier 3 → IndependentContinuant
    { source: 'BFOMaterialEntity', target: 'BFOIndependentContinuant', edgeType: 'is_a' },

    // Tier 3 → SpecificallyDependentContinuant
    { source: 'BFOQuality',           target: 'BFOSpecificallyDependentContinuant', edgeType: 'is_a' },
    { source: 'BFORealizableEntity',  target: 'BFOSpecificallyDependentContinuant', edgeType: 'is_a' },

    // Tier 4 → RealizableEntity
    { source: 'BFODisposition', target: 'BFORealizableEntity', edgeType: 'is_a' },

    // Tier 3 → GenericallyDependentContinuant
    { source: 'BFOInformationContentEntity', target: 'BFOGenericallyDependentContinuant', edgeType: 'is_a' },

    // ── Domain abstract → BFO ─────────────────────────────────────────────────
    { source: 'ChemicalAgent',  target: 'BFOMaterialEntity', edgeType: 'is_a' },
    { source: 'Procedure',      target: 'BFOProcess',        edgeType: 'is_a' },
    { source: 'HealthOutcome',  target: 'BFOQuality',        edgeType: 'is_a' },

    // ── Domain concrete → abstract ────────────────────────────────────────────
    // Chemical agents
    { source: 'Supplement',        target: 'ChemicalAgent', edgeType: 'is_a' },
    { source: 'ResearchPeptide',   target: 'ChemicalAgent', edgeType: 'is_a' },
    { source: 'Drug',              target: 'ChemicalAgent', edgeType: 'is_a' },
    { source: 'FiveARInhibitor',   target: 'Drug',          edgeType: 'is_a' },
    { source: 'Vasodilator',       target: 'Drug',          edgeType: 'is_a' },
    { source: 'Antifungal',        target: 'Drug',          edgeType: 'is_a' },
    { source: 'AndrogenAntagonist',target: 'Drug',          edgeType: 'is_a' },
    { source: 'SteroidHormone',      target: 'Drug',            edgeType: 'is_a' },
    { source: 'AnabolicAndrogen',    target: 'SteroidHormone',  edgeType: 'is_a' },
    { source: 'DHTDerivative',       target: 'AnabolicAndrogen', edgeType: 'is_a' },
    { source: 'TestosteroneDerivative', target: 'AnabolicAndrogen', edgeType: 'is_a' },
    { source: 'NandroloneDerivative',   target: 'AnabolicAndrogen', edgeType: 'is_a' },
    { source: 'PeptideHormone',    target: 'Drug',          edgeType: 'is_a' },
    { source: 'Dermatological',    target: 'ChemicalAgent', edgeType: 'is_a' },

    // Procedures
    { source: 'DermalProcedure',            target: 'Procedure', edgeType: 'is_a' },
    { source: 'PhotobiomodulationProtocol', target: 'Procedure', edgeType: 'is_a' },
    { source: 'PhysicalIntervention',       target: 'Procedure', edgeType: 'is_a' },
    { source: 'DietaryProtocol',            target: 'Procedure', edgeType: 'is_a' },
    { source: 'AdministrationProcedure',    target: 'Procedure', edgeType: 'is_a' },

    // Outcomes (Biomarker subtypes)
    { source: 'Biomarker',            target: 'HealthOutcome', edgeType: 'is_a' },
    { source: 'HormonalBiomarker',    target: 'Biomarker',     edgeType: 'is_a' },
    { source: 'InflammatoryBiomarker',target: 'Biomarker',     edgeType: 'is_a' },
    { source: 'MetabolicBiomarker',   target: 'Biomarker',     edgeType: 'is_a' },
    { source: 'HairOutcome',          target: 'HealthOutcome', edgeType: 'is_a' },
    { source: 'SkinOutcome',          target: 'HealthOutcome', edgeType: 'is_a' },
    { source: 'Symptom',              target: 'HealthOutcome', edgeType: 'is_a' },
    { source: 'HealthCondition',      target: 'HealthOutcome', edgeType: 'is_a' },
    { source: 'PerformanceMetric',    target: 'HealthOutcome', edgeType: 'is_a' },

    // Health paradigm
    { source: 'HealthParadigm', target: 'BFOInformationContentEntity', edgeType: 'is_a' },

    // Evidence model
    { source: 'Study',           target: 'BFOInformationContentEntity', edgeType: 'is_a' },
    { source: 'EvidenceLine',    target: 'BFOInformationContentEntity', edgeType: 'is_a' },
    { source: 'HealthAssertion', target: 'BFOInformationContentEntity', edgeType: 'is_a' },
    { source: 'EvidenceClaim',   target: 'BFOInformationContentEntity', edgeType: 'is_a' },
  ],
};
