// Types mirroring the LinkML schema — run `make typescript` to regenerate
// from schema/health_optimization_kg.yaml after schema changes.

export type NodeType =
  | 'Supplement' | 'Drug' | 'ResearchPeptide' | 'Dermatological'
  | 'FiveARInhibitor' | 'Vasodilator' | 'Antifungal'
  | 'AndrogenAntagonist' | 'SteroidHormone' | 'PeptideHormone'
  | 'DHTDerivative' | 'TestosteroneDerivative' | 'NandroloneDerivative'
  | 'HealthParadigm'
  | 'DermalProcedure' | 'PhotobiomodulationProtocol'
  | 'PhysicalIntervention' | 'DietaryProtocol' | 'AdministrationProcedure'
  | 'Biomarker' | 'HormonalBiomarker' | 'InflammatoryBiomarker' | 'MetabolicBiomarker'
  | 'HairOutcome' | 'SkinOutcome'
  | 'Symptom' | 'HealthCondition' | 'PerformanceMetric'
  // schema taxonomy nodes
  | 'abstract-bfo' | 'abstract-domain' | 'abstract-evidence'
  | 'enum';

export type EvidenceRelationType =
  | 'increases' | 'decreases' | 'no_significant_effect'
  | 'modulates' | 'mechanistically_supports' | 'lightly_supports'
  | 'validated_by' | 'refuted_by' | 'synergistic_with'
  | 'antagonistic_with' | 'causal_mechanism_for' | 'associated_with'
  | 'administered_via';

export type GRADECertainty = 'high' | 'moderate' | 'low' | 'very_low';
export type ClaimStatus = 'active' | 'disputed' | 'preliminary' | 'superseded' | 'retracted' | 'refuted';

export interface KGNode {
  id: string;
  label: string;
  type: NodeType;
  paradigms?: string[];
  description?: string;
  aliases?: string[];
  xrefs?: string[];
  // type-specific extras stored flat for display
  extra?: Record<string, unknown>;
}

export interface KGEdge {
  id: string;
  source: string;
  target: string;
  relation: EvidenceRelationType;
  grade?: GRADECertainty;
  nSupporting: number;
  nRefuting: number;
  status: ClaimStatus;
  doseDescription?: string;
  population?: string;
  mechanismSummary?: string;
  studies?: StudySummary[];
}

export interface StudySummary {
  pmid?: string;
  doi?: string;
  title: string;
  year?: number;
  design: string;
  direction: string;
  effectSize?: number;
  effectSizeMetric?: string;
  pValue?: number;
  percentChange?: number;
  notes?: string;
}

export interface KGGraph {
  nodes: KGNode[];
  edges: KGEdge[];
}

// Schema taxonomy types (for the Schema view)
export type SchemaNodeType = 'bfo-root' | 'bfo-base' | 'domain-abstract' | 'domain-concrete' | 'enum';

export interface SchemaNode {
  id: string;
  label: string;
  type: SchemaNodeType;
  classUri?: string;
  description?: string;
  abstract?: boolean;
}

export interface SchemaEdge {
  source: string;
  target: string;
  edgeType: 'is_a' | 'has_slot';
}

export interface SchemaGraph {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}
