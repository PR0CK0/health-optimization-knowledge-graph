import type { ReactNode } from 'react';
import { kgData } from '../data/kgData';

// ─── KG node ID helpers ───────────────────────────────────────────────────────

const kgNodeIds = new Set(kgData.nodes.map((n) => n.id));

function getNodeLabel(id: string): string {
  return kgData.nodes.find((n) => n.id === id)?.label ?? id;
}

// ─── Xref URL resolver ────────────────────────────────────────────────────────

const XREF_PATTERNS: [string, (local: string) => string][] = [
  ['CHEBI:',    (id) => `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${id}`],
  ['PubChem:',  (id) => `https://pubchem.ncbi.nlm.nih.gov/compound/${id}`],
  ['DrugBank:', (id) => `https://go.drugbank.com/drugs/${id}`],
  ['RxNorm:',   (id) => `https://rxnav.nlm.nih.gov/REST/rxcui/${id}`],
  ['LOINC:',    (id) => `https://loinc.org/${id}/`],
  ['PMID:',     (id) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`],
  ['ATC:',      (id) => `https://www.whocc.no/atc_ddd_index/?code=${id}`],
  ['CAS:',      (id) => `https://commonchemistry.cas.org/detail?cas_rn=${id}`],
];

function xrefToUrl(xref: string): string | null {
  for (const [prefix, buildUrl] of XREF_PATTERNS) {
    if (xref.startsWith(prefix)) return buildUrl(xref.slice(prefix.length));
  }
  return null;
}

function XrefTag({ xref }: { xref: string }) {
  const url = xrefToUrl(xref);
  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="tag mono small xref-link"
    >
      {xref} ↗
    </a>
  ) : (
    <span className="tag mono small">{xref}</span>
  );
}

type SelectionData = Record<string, unknown>;

const GRADE_COLORS: Record<string, string> = {
  high: '#22c55e',
  moderate: '#84cc16',
  low: '#f59e0b',
  very_low: '#ef4444',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  disputed: '#f59e0b',
  preliminary: '#06b6d4',
  superseded: '#94a3b8',
  retracted: '#dc2626',
  refuted: '#ef4444',
};

const RELATION_LABELS: Record<string, string> = {
  increases: '↑ increases',
  decreases: '↓ decreases',
  no_significant_effect: '= no significant effect',
  modulates: '~ modulates',
  mechanistically_supports: '⚙ mechanistically supports',
  lightly_supports: '↑ lightly supports',
  validated_by: '✓ validated by',
  refuted_by: '✗ refuted by',
  synergistic_with: '⊕ synergistic with',
  antagonistic_with: '⊖ antagonistic with',
  causal_mechanism_for: '→ causal mechanism',
  associated_with: '↔ associated with',
  administered_via: '→ administered via',
  is_a: 'is_a (subclass of)',
};

interface Props {
  nodeData: SelectionData | null;
  edgeData: SelectionData | null;
  viewMode: 'kg' | 'schema';
  onClose: () => void;
  onNavigateToNode?: (nodeId: string) => void;
}

export default function NodeDetailPanel({
  nodeData,
  edgeData,
  viewMode,
  onClose,
  onNavigateToNode,
}: Props) {
  return (
    <aside className="detail-panel">
      <button className="close-btn" onClick={onClose} aria-label="Close panel">
        ✕
      </button>
      {nodeData != null && (
        <NodeDetail data={nodeData} viewMode={viewMode} onNavigateToNode={onNavigateToNode} />
      )}
      {edgeData != null && <EdgeDetail data={edgeData} viewMode={viewMode} />}
    </aside>
  );
}

// ─── Node detail ──────────────────────────────────────────────────────────────

function NodeDetail({
  data,
  viewMode,
  onNavigateToNode,
}: {
  data: SelectionData;
  viewMode: 'kg' | 'schema';
  onNavigateToNode?: (nodeId: string) => void;
}) {
  const label = data.label as string;
  const type = data.type as string;
  const description = data.description as string | undefined;
  const bgColor = (data.bgColor as string | undefined) ?? '#475569';
  const id = data.id as string | undefined;

  return (
    <div className="detail-content">
      <span className="detail-badge" style={{ background: bgColor }}>
        {type}
      </span>
      <h2 className="detail-title">{label}</h2>
      {id != null && (
        <div className="detail-row">
          <span className="detail-key">ID</span>
          {xrefToUrl(id) ? (
            <a
              href={xrefToUrl(id)!}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-value mono small xref-link"
            >
              {id} ↗
            </a>
          ) : (
            <span className="detail-value mono small">{id}</span>
          )}
        </div>
      )}
      {description != null && <p className="detail-desc">{description}</p>}
      {viewMode === 'schema' ? (
        <SchemaNodeBody data={data} onNavigateToNode={onNavigateToNode} />
      ) : (
        <KGNodeBody data={data} onNavigateToNode={onNavigateToNode} />
      )}
    </div>
  );
}

function KGNodeBody({
  data,
  onNavigateToNode,
}: {
  data: SelectionData;
  onNavigateToNode?: (nodeId: string) => void;
}) {
  const aliases = data.aliases as string[] | undefined;
  const xrefs = data.xrefs as string[] | undefined;
  const paradigms = data.paradigms as string[] | undefined;
  const extra = data.extra as Record<string, unknown> | undefined;

  return (
    <>
      {aliases != null && aliases.length > 0 && (
        <Section title="Also known as">
          <div className="tag-list">
            {aliases.map((a) => (
              <span key={a} className="tag">{a}</span>
            ))}
          </div>
        </Section>
      )}
      {paradigms != null && paradigms.length > 0 && (
        <Section title="Health paradigms">
          <div className="tag-list">
            {paradigms.map((p) => (
              <span key={p} className="tag paradigm">
                {p.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </Section>
      )}
      {xrefs != null && xrefs.length > 0 && (
        <Section title="Cross-references">
          <div className="tag-list">
            {xrefs.map((x) => <XrefTag key={x} xref={x} />)}
          </div>
        </Section>
      )}
      {extra != null && Object.keys(extra).length > 0 && (
        <Section title="Details">
          {Object.entries(extra).map(([k, v]) => {
            if (v == null) return null;
            const label = k.replace(/_/g, ' ');
            if (Array.isArray(v)) {
              return (
                <div key={k} className="detail-row">
                  <span className="detail-key">{label}</span>
                  <div className="tag-list" style={{ flex: 1 }}>
                    {(v as string[]).map((item) =>
                      kgNodeIds.has(item) ? (
                        <button
                          key={item}
                          className="tag small tag--node-link"
                          onClick={() => onNavigateToNode?.(item)}
                          title={item}
                        >
                          {getNodeLabel(item)} ↗
                        </button>
                      ) : (
                        <span key={item} className="tag small">{item}</span>
                      )
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div key={k} className="detail-row">
                <span className="detail-key">{label}</span>
                <span className="detail-value">{String(v)}</span>
              </div>
            );
          })}
        </Section>
      )}
    </>
  );
}

function SchemaNodeBody({
  data,
  onNavigateToNode,
}: {
  data: SelectionData;
  onNavigateToNode?: (nodeId: string) => void;
}) {
  const classUri = data.classUri as string | undefined;
  const isAbstract = data.abstract as boolean | undefined;
  const classId = data.id as string | undefined;

  // Find all KG individuals whose type matches this schema class id
  const individuals = classId
    ? kgData.nodes.filter((n) => n.type === classId)
    : [];

  // Evidence-model classes live as edges, not top-level nodes
  const isEvidenceClaim   = classId === 'EvidenceClaim';
  const isHealthAssertion = classId === 'HealthAssertion';
  const studyCount = classId === 'Study'
    ? kgData.edges.reduce((sum, e) => sum + (e.studies?.length ?? 0), 0)
    : null;

  return (
    <>
      {classUri != null && classUri !== '' && (
        <div className="detail-row">
          <span className="detail-key">Class URI</span>
          <span className="detail-value mono small">{classUri}</span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-key">Abstract</span>
        <span className="detail-value">
          {isAbstract ? 'Yes (cannot be instantiated)' : 'No (concrete class)'}
        </span>
      </div>

      {/* Node individuals (agents, outcomes, procedures) */}
      {individuals.length > 0 && (
        <Section title={`Individuals (${individuals.length})`}>
          {individuals.map((ind) => (
            <button
              key={ind.id}
              className="individual-row individual-row--clickable"
              onClick={() => onNavigateToNode?.(ind.id)}
              title="Open in Data Graph"
            >
              <div className="individual-label">
                {ind.label}
                <span className="individual-nav-arrow">↗</span>
              </div>
              <div className="individual-meta">
                <span className="tag mono small">{ind.id}</span>
                {(ind.paradigms ?? []).map((p) => (
                  <span key={p} className="tag paradigm">
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </Section>
      )}

      {/* EvidenceClaim individuals — full nanopub wrapper (assertion + evidence + grade) */}
      {isEvidenceClaim && (
        <Section title={`Individuals (${kgData.edges.length})`}>
          {kgData.edges.map((e) => (
            <div key={e.id} className="individual-row">
              <div className="individual-label mono small" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {e.id}
              </div>
              <div className="individual-meta" style={{ marginTop: '0.15rem' }}>
                <span className="tag small">{e.source}</span>
                <span style={{ color: '#475569', fontSize: '0.7rem' }}>→</span>
                <span className="tag small">{e.relation.replace(/_/g, ' ')}</span>
                <span style={{ color: '#475569', fontSize: '0.7rem' }}>→</span>
                <span className="tag small">{e.target}</span>
                {e.grade && (
                  <span className="tag small" style={{ color: '#fbbf24' }}>{e.grade}</span>
                )}
                {e.studies && e.studies.length > 0 && (
                  <span className="tag small" style={{ color: '#64748b' }}>
                    {e.studies.length} stud{e.studies.length !== 1 ? 'ies' : 'y'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* HealthAssertion — the bare subject/predicate/object triple embedded in each EvidenceClaim */}
      {isHealthAssertion && (
        <Section title={`Individuals (${kgData.edges.length})`}>
          <p className="detail-desc" style={{ marginBottom: '0.5rem' }}>
            Each HealthAssertion is embedded inside an EvidenceClaim — not instantiated
            separately. The bare triples are:
          </p>
          {kgData.edges.map((e) => (
            <div key={e.id} className="individual-row">
              <div className="individual-meta">
                <span className="tag small">{e.source}</span>
                <span style={{ color: '#475569', fontSize: '0.7rem' }}>—{e.relation.replace(/_/g, ' ')}→</span>
                <span className="tag small">{e.target}</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Study count (studies are embedded in edges, not top-level nodes) */}
      {studyCount != null && (
        <Section title="Individuals">
          <p className="detail-desc">
            {studyCount} study record{studyCount !== 1 ? 's' : ''} embedded across{' '}
            {kgData.edges.filter((e) => (e.studies?.length ?? 0) > 0).length} evidence claims.
            Studies are currently embedded within EvidenceClaim individuals rather than
            instantiated as top-level nodes.
          </p>
        </Section>
      )}

      {individuals.length === 0 && !isEvidenceClaim && !isHealthAssertion && studyCount == null && !isAbstract && (
        <Section title="Individuals">
          <p className="detail-desc" style={{ fontStyle: 'italic' }}>
            No instances in the current dataset.
          </p>
        </Section>
      )}
    </>
  );
}

// ─── Edge detail ──────────────────────────────────────────────────────────────

function EdgeDetail({
  data,
  viewMode,
}: {
  data: SelectionData;
  viewMode: 'kg' | 'schema';
}) {
  const relation = data.relation as string;
  const color = (data.color as string | undefined) ?? '#64748b';
  const grade = data.grade as string | undefined;
  const status = data.status as string | undefined;
  const nSupporting = data.nSupporting as number | undefined;
  const nRefuting = data.nRefuting as number | undefined;
  const studies = data.studies as Record<string, unknown>[] | undefined;
  const doseDescription = data.doseDescription as string | undefined;
  const population = data.population as string | undefined;
  const mechanismSummary = data.mechanismSummary as string | undefined;

  return (
    <div className="detail-content">
      <span className="detail-badge" style={{ background: color }}>
        {RELATION_LABELS[relation] ?? relation}
      </span>

      {viewMode === 'kg' && (
        <>
          {grade != null && (
            <div className="detail-row" style={{ marginTop: '0.75rem' }}>
              <span className="detail-key">GRADE</span>
              <span
                className="grade-badge"
                style={{ background: GRADE_COLORS[grade] ?? '#94a3b8' }}
              >
                {grade.replace('_', ' ')}
              </span>
            </div>
          )}
          {status != null && (
            <div className="detail-row">
              <span className="detail-key">Status</span>
              <span
                style={{
                  color: STATUS_COLORS[status] ?? '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                }}
              >
                {status}
              </span>
            </div>
          )}
          {(nSupporting !== undefined || nRefuting !== undefined) && (
            <div className="detail-row">
              <span className="detail-key">Evidence</span>
              <span className="detail-value">
                <span style={{ color: '#22c55e' }}>{nSupporting ?? 0} supporting</span>
                {' · '}
                <span style={{ color: '#ef4444' }}>{nRefuting ?? 0} refuting</span>
              </span>
            </div>
          )}

          {doseDescription != null && doseDescription !== '' && (
            <Section title="Dose / Administration">
              <p className="detail-desc">{doseDescription}</p>
            </Section>
          )}
          {population != null && population !== '' && (
            <Section title="Population">
              <p className="detail-desc">{population}</p>
            </Section>
          )}
          {mechanismSummary != null && mechanismSummary !== '' && (
            <Section title="Mechanism">
              <p className="detail-desc">{mechanismSummary}</p>
            </Section>
          )}
          {studies != null && studies.length > 0 && (
            <Section title={`Studies (${studies.length})`}>
              {studies.map((s, i) => (
                <StudyCard key={i} study={s} />
              ))}
            </Section>
          )}
        </>
      )}

      {viewMode === 'schema' && (
        <p className="detail-desc" style={{ marginTop: '0.75rem' }}>
          Inheritance edge in the class hierarchy.
        </p>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="detail-section">
      <div className="detail-section-title">{title}</div>
      {children}
    </div>
  );
}

function StudyCard({ study }: { study: Record<string, unknown> }) {
  const year = study.year as number | undefined;
  const design = study.design as string | undefined;
  const dir = study.direction as string | undefined;
  const pValue = study.pValue as number | undefined;
  const notes = study.notes as string | undefined;
  const pmid = study.pmid as string | undefined;

  const effectLabel =
    study.effectSize != null
      ? `${study.effectSizeMetric ?? 'ES'} = ${study.effectSize}`
      : study.percentChange != null
      ? `${(study.percentChange as number) > 0 ? '+' : ''}${study.percentChange}%`
      : null;

  return (
    <div className="study-card">
      <div className="study-title">{study.title as string}</div>
      <div className="study-meta">
        {year != null && <span>{year}</span>}
        {design != null && (
          <span className="tag small">{design.replace(/_/g, ' ')}</span>
        )}
        {dir != null && (
          <span className={`dir-badge dir-${dir}`}>{dir}</span>
        )}
        {effectLabel != null && (
          <span className="effect-size">{effectLabel}</span>
        )}
        {pValue != null && (
          <span className="p-value">p={pValue}</span>
        )}
      </div>
      {notes != null && (
        <div className="study-notes">{notes}</div>
      )}
      {pmid != null && (
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="pubmed-link"
        >
          PubMed {pmid} ↗
        </a>
      )}
    </div>
  );
}
