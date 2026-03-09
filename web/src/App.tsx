import { useState, useMemo, useCallback, useRef } from 'react';
import CytoscapeGraph from './components/CytoscapeGraph';
import NodeDetailPanel from './components/NodeDetailPanel';
import { kgData } from './data/kgData';
import { schemaGraph } from './data/schemaGraph';
import './App.css';

// ─── Color maps ───────────────────────────────────────────────────────────────

const NODE_COLOR: Record<string, string> = {
  // Interventions
  Supplement: '#22c55e',
  Drug: '#3b82f6',
  FiveARInhibitor: '#1d4ed8',
  Vasodilator: '#0284c7',
  Antifungal: '#0369a1',
  AndrogenAntagonist: '#7c3aed',
  SteroidHormone: '#9333ea',
  DHTDerivative: '#b45309',
  TestosteroneDerivative: '#be185d',
  NandroloneDerivative: '#9f1239',
  PeptideHormone: '#c026d3',
  HealthParadigm: '#6366f1',
  ResearchPeptide: '#a855f7',
  Dermatological: '#f97316',
  DermalProcedure: '#f59e0b',
  PhotobiomodulationProtocol: '#e11d48',
  PhysicalIntervention: '#06b6d4',
  DietaryProtocol: '#84cc16',
  AdministrationProcedure: '#0d9488',
  // Outcomes
  Biomarker: '#0ea5e9',
  HormonalBiomarker: '#38bdf8',
  InflammatoryBiomarker: '#fb7185',
  MetabolicBiomarker: '#34d399',
  HairOutcome: '#ec4899',
  SkinOutcome: '#f43f5e',
  Symptom: '#eab308',
  HealthCondition: '#dc2626',
  PerformanceMetric: '#8b5cf6',
  // Schema taxonomy
  'bfo-root': '#94a3b8',
  'bfo-base': '#64748b',
  'domain-abstract': '#0f766e',
  'domain-concrete': '#0e7490',
};

const EDGE_COLOR: Record<string, string> = {
  increases: '#22c55e',
  decreases: '#ef4444',
  no_significant_effect: '#94a3b8',
  modulates: '#f59e0b',
  mechanistically_supports: '#a855f7',
  lightly_supports: '#86efac',
  validated_by: '#14b8a6',
  refuted_by: '#dc2626',
  synergistic_with: '#06b6d4',
  antagonistic_with: '#f97316',
  causal_mechanism_for: '#8b5cf6',
  associated_with: '#64748b',
  administered_via: '#0d9488',
  is_a: '#475569',
};

const GRADE_WIDTH: Record<string, number> = {
  high: 2,
  moderate: 1.5,
  low: 1,
  very_low: 0.75,
};

// ─── Graph validation ─────────────────────────────────────────────────────────

interface DataIssue {
  severity: 'error' | 'warning';
  message: string;
  edgeId: string;
}

function validateKGData(): DataIssue[] {
  const nodeIds = new Set(kgData.nodes.map((n) => n.id));
  const issues: DataIssue[] = [];

  for (const edge of kgData.edges) {
    if (!nodeIds.has(edge.source)) {
      issues.push({
        severity: 'error',
        message: `Unknown source "${edge.source}"`,
        edgeId: edge.id,
      });
    }
    if (!nodeIds.has(edge.target)) {
      issues.push({
        severity: 'error',
        message: `Unknown target "${edge.target}"`,
        edgeId: edge.id,
      });
    }
  }

  // Warn about edges whose relation has no colour mapping
  const knownRelations = new Set([
    'increases','decreases','no_significant_effect','modulates',
    'mechanistically_supports','lightly_supports','validated_by',
    'refuted_by','synergistic_with','antagonistic_with',
    'causal_mechanism_for','associated_with','administered_via','is_a',
  ]);
  for (const edge of kgData.edges) {
    if (!knownRelations.has(edge.relation)) {
      issues.push({
        severity: 'warning',
        message: `Unmapped relation type "${edge.relation}"`,
        edgeId: edge.id,
      });
    }
  }

  return issues;
}

const KG_ISSUES = validateKGData();

// ─── Element builders ─────────────────────────────────────────────────────────

function buildKGElements() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes = kgData.nodes.map((n): any => ({
    data: {
      id: n.id,
      label: n.label,
      type: n.type,
      bgColor: NODE_COLOR[n.type] ?? '#475569',
      description: n.description ?? '',
      aliases: n.aliases ?? [],
      xrefs: n.xrefs ?? [],
      paradigms: n.paradigms ?? [],
      extra: n.extra ?? {},
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edges = kgData.edges.map((e): any => ({
    data: {
      id: e.id,
      source: e.source,
      target: e.target,
      relation: e.relation,
      grade: e.grade,
      color: EDGE_COLOR[e.relation] ?? '#64748b',
      width: (e.grade ? GRADE_WIDTH[e.grade] : undefined) ?? 0.75,
      nSupporting: e.nSupporting,
      nRefuting: e.nRefuting,
      status: e.status,
      doseDescription: e.doseDescription ?? '',
      population: e.population ?? '',
      mechanismSummary: e.mechanismSummary ?? '',
      studies: e.studies ?? [],
    },
  }));

  return [...nodes, ...edges];
}

function buildSchemaElements() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes = schemaGraph.nodes.map((n): any => ({
    data: {
      id: n.id,
      label: n.label,
      type: n.type,
      bgColor: NODE_COLOR[n.type] ?? '#334155',
      classUri: n.classUri ?? '',
      description: n.description ?? '',
      abstract: n.abstract ?? false,
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edges = schemaGraph.edges.map((e, i): any => ({
    data: {
      id: `schema-edge-${i}`,
      source: e.source,
      target: e.target,
      relation: e.edgeType,
      color: EDGE_COLOR[e.edgeType] ?? '#475569',
      width: 2,
    },
  }));

  return [...nodes, ...edges];
}

// ─── Cytoscape stylesheets ────────────────────────────────────────────────────

const KG_STYLESHEET = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(bgColor)',
      label: 'data(label)',
      color: '#f8fafc',
      'font-size': 10,
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '88px',
      width: 96,
      height: 38,
      shape: 'round-rectangle',
      'border-width': 2,
      'border-color': 'transparent',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#f8fafc',
      'overlay-color': '#f8fafc',
      'overlay-opacity': 0.06,
    },
  },
  {
    selector: 'node.search-hit',
    style: {
      'border-width': 3,
      'border-color': '#fbbf24',
      opacity: 1,
    },
  },
  {
    selector: 'node.search-dim',
    style: { opacity: 0.15 },
  },
  {
    selector: 'edge',
    style: {
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.9,
      width: 'data(width)',
      'curve-style': 'bezier',
      label: 'data(relation)',
      'font-size': 9,
      color: '#94a3b8',
      'text-background-color': '#0f172a',
      'text-background-opacity': 0.75,
      'text-background-padding': '2px',
      'text-rotation': 'autorotate',
    },
  },
  {
    selector: 'edge.search-dim',
    style: { opacity: 0.05 },
  },
  {
    selector: 'edge:selected',
    style: {
      width: 3,
      'line-color': '#f8fafc',
      'target-arrow-color': '#f8fafc',
    },
  },
];

const SCHEMA_STYLESHEET = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(bgColor)',
      label: 'data(label)',
      color: '#f8fafc',
      'font-size': 10,
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '90px',
      width: 110,
      height: 36,
      shape: 'round-rectangle',
      'border-width': 0,
    },
  },
  {
    // Abstract classes: dashed border
    selector: 'node[?abstract]',
    style: {
      'border-width': 2,
      'border-color': '#f8fafc',
      'border-style': 'dashed',
      'border-opacity': 0.35,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#f8fafc',
      'border-opacity': 1,
      'overlay-color': '#f8fafc',
      'overlay-opacity': 0.08,
    },
  },
  {
    selector: 'edge',
    style: {
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      width: 1.5,
      'curve-style': 'bezier',
      label: 'data(relation)',
      'font-size': 9,
      color: '#64748b',
      'text-background-color': '#0f172a',
      'text-background-opacity': 0.75,
      'text-background-padding': '2px',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      width: 3,
      'line-color': '#f8fafc',
      'target-arrow-color': '#f8fafc',
    },
  },
];

// ─── Legend items ─────────────────────────────────────────────────────────────

interface LegendItem { label: string; color: string; nodeType: string; indent?: boolean; indent2?: boolean; defaultHidden?: boolean }
interface LegendGroup { group: string; items: LegendItem[] }

const KG_LEGEND: LegendGroup[] = [
  {
    group: 'Agents',
    items: [
      { label: 'Drug',                 color: '#3b82f6', nodeType: 'Drug' },
      { label: '↳ 5-AR Inhibitor',     color: '#1d4ed8', nodeType: 'FiveARInhibitor',    indent: true },
      { label: '↳ Vasodilator',        color: '#0284c7', nodeType: 'Vasodilator',         indent: true },
      { label: '↳ Antifungal',         color: '#0369a1', nodeType: 'Antifungal',           indent: true },
      { label: '↳ Androgen Antagonist',color: '#7c3aed', nodeType: 'AndrogenAntagonist',  indent: true },
      { label: '↳ Steroid Hormone',        color: '#9333ea', nodeType: 'SteroidHormone',          indent: true },
      { label: '↳ DHT-Derived',           color: '#b45309', nodeType: 'DHTDerivative',           indent2: true },
      { label: '↳ Testosterone-Derived',  color: '#be185d', nodeType: 'TestosteroneDerivative',  indent2: true },
      { label: '↳ Nandrolone-Derived',    color: '#9f1239', nodeType: 'NandroloneDerivative',    indent2: true },
      { label: '↳ Peptide Hormone',       color: '#c026d3', nodeType: 'PeptideHormone',          indent: true },
      { label: 'Supplement',           color: '#22c55e', nodeType: 'Supplement' },
      { label: 'Research Peptide',     color: '#a855f7', nodeType: 'ResearchPeptide' },
      { label: 'Dermatological',       color: '#f97316', nodeType: 'Dermatological' },
    ],
  },
  {
    group: 'Outcomes',
    items: [
      { label: 'Hair',            color: '#ec4899', nodeType: 'HairOutcome' },
      { label: 'Skin',            color: '#f43f5e', nodeType: 'SkinOutcome' },
      { label: 'Biomarker',       color: '#0ea5e9', nodeType: 'Biomarker' },
      { label: '↳ Hormonal',      color: '#38bdf8', nodeType: 'HormonalBiomarker', indent: true },
      { label: '↳ Metabolic',     color: '#34d399', nodeType: 'MetabolicBiomarker', indent: true },
      { label: '↳ Inflammatory',  color: '#fb7185', nodeType: 'InflammatoryBiomarker', indent: true },
      { label: 'Health Condition',color: '#dc2626', nodeType: 'HealthCondition' },
      { label: 'Performance',     color: '#8b5cf6', nodeType: 'PerformanceMetric' },
    ],
  },
  {
    group: 'Therapeutic Procedures',
    items: [
      { label: 'Dermal',            color: '#f59e0b', nodeType: 'DermalProcedure' },
      { label: 'Photobiomodulation',color: '#e11d48', nodeType: 'PhotobiomodulationProtocol' },
      { label: 'Physical',          color: '#06b6d4', nodeType: 'PhysicalIntervention' },
      { label: 'Dietary',           color: '#84cc16', nodeType: 'DietaryProtocol' },
    ],
  },
  {
    group: 'Concepts',
    items: [
      { label: 'Health Paradigm', color: '#6366f1', nodeType: 'HealthParadigm', defaultHidden: true },
    ],
  },
  {
    group: 'Administration Routes',
    items: [
      { label: 'Oral',              color: '#0d9488', nodeType: 'healthkg:procedure/oral-administration' },
      { label: 'Topical Application', color: '#0d9488', nodeType: 'healthkg:procedure/topical-application' },
      { label: 'Subcutaneous', color: '#0d9488', nodeType: 'healthkg:procedure/subcutaneous-injection' },
      { label: 'Intranasal',   color: '#0d9488', nodeType: 'healthkg:procedure/intranasal-administration' },
      { label: 'Intravenous',  color: '#0d9488', nodeType: 'healthkg:procedure/intravenous-infusion' },
    ],
  },
];

const ALL_NODE_TYPES = KG_LEGEND.flatMap((g) => g.items.map((i) => i.nodeType));

const SCHEMA_LEGEND: LegendGroup[] = [
  {
    group: 'Schema classes',
    items: [
      { label: 'BFO root',        color: '#94a3b8' },
      { label: 'BFO base',        color: '#64748b' },
      { label: 'Domain abstract', color: '#0f766e' },
      { label: 'Domain concrete', color: '#0e7490' },
    ],
  },
];

// ─── Paradigm metadata ────────────────────────────────────────────────────────

const PARADIGM_LABELS: Record<string, string> = {
  hair_health:         'Hair Health',
  skin_health:         'Skin Health',
  hormonal_health:     'Hormonal',
  longevity:           'Longevity',
  metabolic_health:    'Metabolic',
  mitochondrial_health:'Mitochondrial',
  musculoskeletal:     'Musculoskeletal',
  gut_microbiome:      'Gut / Microbiome',
  wound_healing:       'Wound Healing',
  immune_function:     'Immune',
  bone_health:         'Bone Health',
  cardiovascular:      'Cardiovascular',
  recovery:            'Recovery',
  tissue_repair:       'Tissue Repair',
};

const PARADIGM_COLORS: Record<string, string> = {
  hair_health:         '#ec4899',
  skin_health:         '#f43f5e',
  hormonal_health:     '#38bdf8',
  longevity:           '#a78bfa',
  metabolic_health:    '#34d399',
  mitochondrial_health:'#6ee7b7',
  musculoskeletal:     '#fb923c',
  gut_microbiome:      '#a3e635',
  wound_healing:       '#fbbf24',
  immune_function:     '#60a5fa',
  bone_health:         '#94a3b8',
  cardiovascular:      '#f87171',
  recovery:            '#4ade80',
  tissue_repair:       '#c084fc',
};

// ─── App ──────────────────────────────────────────────────────────────────────

type ViewMode = 'kg' | 'schema';

export default function App() {
  const [view, setView] = useState<ViewMode>('kg');
  const [selectedNode, setSelectedNode] = useState<Record<string, unknown> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Record<string, unknown> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeParadigms, setActiveParadigms] = useState<Set<string>>(new Set());
  const [issuesBannerOpen, setIssuesBannerOpen] = useState(KG_ISSUES.length > 0);
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(
    () => new Set(KG_LEGEND.flatMap((g) => g.items.filter((i) => i.defaultHidden).map((i) => i.nodeType)))
  );
  const searchRef = useRef<HTMLInputElement>(null);

  // Stable element / stylesheet references (only computed once)
  const kgElements = useMemo(buildKGElements, []);
  const schemaElements = useMemo(buildSchemaElements, []);

  // Unique paradigms available across all nodes (excluding internal drug_delivery tag)
  const availableParadigms = useMemo(() => {
    const seen = new Set<string>();
    for (const n of kgData.nodes) {
      for (const p of n.paradigms ?? []) {
        if (p !== 'drug_delivery') seen.add(p);
      }
    }
    return Array.from(seen).sort();
  }, []);

  // Paradigm + legend-type filtered KG elements
  const filteredKGElements = useMemo(() => {
    // Determine which node IDs are visible after both filter passes
    const isNodeHidden = (el: { data: Record<string, unknown> }) => {
      const type = el.data.type as string;
      const id   = el.data.id   as string;
      return hiddenTypes.has(type) || hiddenTypes.has(id);
    };

    let visibleIds: Set<string> | null = null;

    if (activeParadigms.size > 0) {
      visibleIds = new Set<string>();
      for (const el of kgElements) {
        if (el.data.source) continue;
        if (isNodeHidden(el)) continue;
        const paradigms: string[] = el.data.paradigms ?? [];
        if (paradigms.some((p: string) => activeParadigms.has(p))) {
          visibleIds.add(el.data.id as string);
        }
      }
      // Always pull in admin route nodes reachable from visible agents
      for (const el of kgElements) {
        if (!el.data.source) continue;
        if (el.data.relation === 'administered_via' && visibleIds.has(el.data.source as string)) {
          const targetId = el.data.target as string;
          // Only add if not explicitly hidden
          const targetEl = kgElements.find((e) => !e.data.source && e.data.id === targetId);
          if (targetEl && !isNodeHidden(targetEl)) visibleIds.add(targetId);
        }
      }
    }

    return kgElements.filter((el) => {
      if (el.data.source) {
        // Edge: both endpoints must be visible
        const src = el.data.source as string;
        const tgt = el.data.target as string;
        if (visibleIds) return visibleIds.has(src) && visibleIds.has(tgt);
        // No paradigm filter — just check neither endpoint is hidden by type
        const srcEl = kgElements.find((e) => !e.data.source && e.data.id === src);
        const tgtEl = kgElements.find((e) => !e.data.source && e.data.id === tgt);
        return (!srcEl || !isNodeHidden(srcEl)) && (!tgtEl || !isNodeHidden(tgtEl));
      } else {
        // Node
        if (isNodeHidden(el)) return false;
        if (visibleIds) return visibleIds.has(el.data.id as string);
        return true;
      }
    });
  }, [kgElements, activeParadigms, hiddenTypes]);

  const elements = view === 'kg' ? filteredKGElements : schemaElements;
  const stylesheet = view === 'kg' ? KG_STYLESHEET : SCHEMA_STYLESHEET;
  const layout = view === 'schema' ? 'dagre' : 'fcose';
  const legend = view === 'kg' ? KG_LEGEND : SCHEMA_LEGEND;

  const visibleNodeCount = view === 'kg'
    ? filteredKGElements.filter((el) => !el.data.source).length
    : schemaGraph.nodes.length;
  const visibleEdgeCount = view === 'kg'
    ? filteredKGElements.filter((el) => !!el.data.source).length
    : schemaGraph.edges.length;

  // IDs of nodes matching the search query (only active in KG view)
  const highlightIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (view !== 'kg' || q.length < 2) return [];
    return kgData.nodes
      .filter((n) =>
        n.label.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        (n.paradigms ?? []).some((p) => p.toLowerCase().includes(q)) ||
        (n.aliases ?? []).some((a) => a.toLowerCase().includes(q))
      )
      .map((n) => n.id);
  }, [searchQuery, view]);

  const toggleParadigm = useCallback((p: string) => {
    setActiveParadigms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }, []);

  const [legendCompact, setLegendCompact] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroupCollapse = useCallback((group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  }, []);

  const toggleHiddenType = useCallback((nodeType: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeType)) next.delete(nodeType); else next.add(nodeType);
      return next;
    });
  }, []);

  const toggleGroupTypes = useCallback((items: LegendItem[]) => {
    const types = items.map((i) => i.nodeType).filter(Boolean);
    const allHidden = types.every((t) => hiddenTypes.has(t));
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (allHidden) {
        types.forEach((t) => next.delete(t));
      } else {
        types.forEach((t) => next.add(t));
      }
      return next;
    });
  }, [hiddenTypes]);

  const groupStatus = useCallback((items: LegendItem[]): '●' | '◐' | '○' => {
    const types = items.map((i) => i.nodeType).filter(Boolean);
    const n = types.filter((t) => hiddenTypes.has(t)).length;
    if (n === 0) return '●';
    if (n === types.length) return '○';
    return '◐';
  }, [hiddenTypes]);

  const handleNodeClick = useCallback((data: Record<string, unknown>) => {
    setSelectedNode(data);
    setSelectedEdge(null);
  }, []);

  const handleEdgeClick = useCallback((data: Record<string, unknown>) => {
    setSelectedEdge(data);
    setSelectedNode(null);
  }, []);

  const handleBgClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const handleViewSwitch = (v: ViewMode) => {
    setView(v);
    setSearchQuery('');
    setActiveParadigms(new Set());
    handleBgClick();
  };

  const handleNavigateToNode = useCallback((nodeId: string) => {
    const node = kgData.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const nodeData: Record<string, unknown> = {
      id: node.id,
      label: node.label,
      type: node.type,
      bgColor: NODE_COLOR[node.type] ?? '#475569',
      description: node.description ?? '',
      aliases: node.aliases ?? [],
      xrefs: node.xrefs ?? [],
      paradigms: node.paradigms ?? [],
      extra: node.extra ?? {},
    };
    setView('kg');
    setSearchQuery('');
    setActiveParadigms(new Set());
    setSelectedEdge(null);
    setSelectedNode(nodeData);
    setFocusNodeId(nodeId);
  }, []);

  const isPanelOpen = selectedNode !== null || selectedEdge !== null;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-title">
          <span className="title-hex">⬡</span>
          Health Optimization KG
        </div>

        <nav className="view-tabs">
          <button
            className={`tab-btn ${view === 'kg' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('kg')}
          >
            Data Graph
          </button>
          <button
            className={`tab-btn ${view === 'schema' ? 'active' : ''}`}
            onClick={() => handleViewSwitch('schema')}
          >
            Schema Taxonomy
          </button>
        </nav>

        {view === 'kg' && (
          <div className="search-wrap">
            <input
              ref={searchRef}
              className="search-input"
              type="text"
              placeholder="Search nodes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
            />
            {searchQuery && (
              <span className="search-count">
                {highlightIds.length} match{highlightIds.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        )}

        <div className="header-meta">
          {view === 'kg'
            ? `${visibleNodeCount} nodes · ${visibleEdgeCount} edges${activeParadigms.size > 0 ? ` (filtered)` : ''}`
            : `${schemaGraph.nodes.length} classes · ${schemaGraph.edges.length} edges`}
        </div>
      </header>

      {/* ── Data issues banner ── */}
      {issuesBannerOpen && KG_ISSUES.length > 0 && (
        <div className={`issues-banner issues-banner--${KG_ISSUES.some(i => i.severity === 'error') ? 'error' : 'warning'}`}>
          <div className="issues-banner-summary">
            <span className="issues-banner-icon">
              {KG_ISSUES.some(i => i.severity === 'error') ? '✗' : '⚠'}
            </span>
            <span className="issues-banner-title">
              {KG_ISSUES.filter(i => i.severity === 'error').length} broken reference
              {KG_ISSUES.filter(i => i.severity === 'error').length !== 1 ? 's' : ''}
              {KG_ISSUES.filter(i => i.severity === 'warning').length > 0 &&
                `, ${KG_ISSUES.filter(i => i.severity === 'warning').length} warning${KG_ISSUES.filter(i => i.severity === 'warning').length !== 1 ? 's' : ''}`}
              {' '}in kgData — graph may not render correctly.
            </span>
            <button
              className="issues-banner-toggle"
              onClick={() => setIssuesExpanded((x) => !x)}
            >
              {issuesExpanded ? 'hide ▲' : 'details ▼'}
            </button>
            <button className="issues-banner-close" onClick={() => setIssuesBannerOpen(false)}>
              ×
            </button>
          </div>

          {issuesExpanded && (
            <ul className="issues-list">
              {KG_ISSUES.map((issue, i) => (
                <li key={i} className={`issues-list-item issues-list-item--${issue.severity}`}>
                  <span className="issues-item-severity">{issue.severity.toUpperCase()}</span>
                  <span className="issues-item-edge mono">{issue.edgeId}</span>
                  <span className="issues-item-msg">{issue.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Paradigm filter toolbar ── */}
      {view === 'kg' && (
        <div className="paradigm-toolbar">
          <span className="paradigm-toolbar-label">Filter by health paradigm:</span>
          {availableParadigms.map((p) => {
            const active = activeParadigms.has(p);
            const color = PARADIGM_COLORS[p] ?? '#64748b';
            return (
              <button
                key={p}
                className={`paradigm-chip ${active ? 'active' : ''}`}
                style={active ? { background: color, borderColor: color, color: '#0f172a' } : { borderColor: color, color }}
                onClick={() => toggleParadigm(p)}
              >
                {PARADIGM_LABELS[p] ?? p.replace(/_/g, ' ')}
              </button>
            );
          })}
          {activeParadigms.size > 0 && (
            <button className="paradigm-chip paradigm-clear" onClick={() => setActiveParadigms(new Set())}>
              clear ×
            </button>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div className="app-body">
        {/* Graph canvas */}
        <div className="graph-wrap">
          <CytoscapeGraph
            elements={elements}
            layout={layout}
            stylesheet={stylesheet}
            highlightIds={highlightIds}
            focusNodeId={focusNodeId}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onBgClick={handleBgClick}
          />

          {/* Legend overlay */}
          <div className={`legend${view === 'kg' ? ' legend--interactive' : ''}`}>
            {view === 'kg' && (
              <div className="legend-controls">
                <button
                  className="legend-mode-btn"
                  onClick={() => setLegendCompact((c) => !c)}
                  title={legendCompact ? 'Show individual items' : 'Show group headers only'}
                >
                  {legendCompact ? 'detail' : 'compact'}
                </button>
                {hiddenTypes.size > 0 && (
                  <button className="legend-reset" onClick={() => setHiddenTypes(new Set())}>
                    show all ↺
                  </button>
                )}
                {hiddenTypes.size < ALL_NODE_TYPES.length && (
                  <button className="legend-reset" onClick={() => setHiddenTypes(new Set(ALL_NODE_TYPES))}>
                    hide all
                  </button>
                )}
              </div>
            )}
            {legend.map(({ group, items }) => {
              const isKG = view === 'kg';
              const status = isKG ? groupStatus(items) : null;
              const collapsed = isKG && collapsedGroups.has(group);
              const showItems = !legendCompact && !collapsed;
              return (
              <div key={group} className="legend-group">
                <div className="legend-group-title">
                  {isKG && (
                    <span
                      className="legend-group-chevron"
                      onClick={() => toggleGroupCollapse(group)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleGroupCollapse(group)}
                      aria-label={collapsed ? 'Expand' : 'Collapse'}
                    >
                      {collapsed ? '▶' : '▼'}
                    </span>
                  )}
                  <span
                    className={isKG ? 'legend-group-name legend-group-name--btn' : 'legend-group-name'}
                    onClick={isKG ? () => toggleGroupTypes(items) : undefined}
                    role={isKG ? 'button' : undefined}
                    tabIndex={isKG ? 0 : undefined}
                    onKeyDown={isKG ? (e) => (e.key === ' ' || e.key === 'Enter') && toggleGroupTypes(items) : undefined}
                  >
                    {group}
                  </span>
                  {isKG && <span className="legend-group-check">{status}</span>}
                </div>
                {showItems && items.map(({ label, color, nodeType, indent, indent2 }) => {
                  const hidden = isKG && hiddenTypes.has(nodeType);
                  return (
                    <div
                      key={label}
                      className={`legend-item${indent ? ' legend-item--indent' : ''}${indent2 ? ' legend-item--indent2' : ''}${isKG ? ' legend-item--btn' : ''}${hidden ? ' legend-item--hidden' : ''}`}
                      onClick={isKG ? () => toggleHiddenType(nodeType) : undefined}
                      role={isKG ? 'checkbox' : undefined}
                      aria-checked={isKG ? !hidden : undefined}
                      tabIndex={isKG ? 0 : undefined}
                      onKeyDown={isKG ? (e) => (e.key === ' ' || e.key === 'Enter') && toggleHiddenType(nodeType) : undefined}
                    >
                      <span
                        className="legend-dot"
                        style={{ background: hidden ? 'transparent' : color, borderColor: color }}
                      />
                      <span className="legend-label">{label}</span>
                      {isKG && (
                        <span className="legend-check">{hidden ? '○' : '●'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              );
            })}
          </div>

          {/* Hint */}
          {!isPanelOpen && (
            <div className="graph-hint">Click any node or edge for details</div>
          )}
        </div>

        {/* Detail panel */}
        {isPanelOpen && (
          <NodeDetailPanel
            nodeData={selectedNode}
            edgeData={selectedEdge}
            viewMode={view}
            onClose={handleBgClick}
            onNavigateToNode={handleNavigateToNode}
          />
        )}
      </div>
    </div>
  );
}
