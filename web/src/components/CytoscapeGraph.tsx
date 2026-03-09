import { useRef, useEffect, useState } from 'react';
import Cytoscape from 'cytoscape';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – fcose bundles its own types, no separate @types package
import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';

// Register Cytoscape extensions once (guard avoids React StrictMode double-call)
let _extRegistered = false;
function ensureExtensions() {
  if (!_extRegistered) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cytoscape.use(fcose as any);
    Cytoscape.use(dagre);
    _extRegistered = true;
  }
}

export interface CyGraphProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: any[];
  layout: 'dagre' | 'fcose';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stylesheet: any[];
  highlightIds?: string[];
  focusNodeId?: string | null;
  onNodeClick?: (data: Record<string, unknown>) => void;
  onEdgeClick?: (data: Record<string, unknown>) => void;
  onBgClick?: () => void;
}

export default function CytoscapeGraph({
  elements,
  layout,
  stylesheet,
  highlightIds,
  focusNodeId,
  onNodeClick,
  onEdgeClick,
  onBgClick,
}: CyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Cytoscape.Core | null>(null);
  const [cyError, setCyError] = useState<string | null>(null);

  // Keep latest callbacks in refs so event listeners don't become stale
  const cbNode = useRef(onNodeClick);
  const cbEdge = useRef(onEdgeClick);
  const cbBg = useRef(onBgClick);
  useEffect(() => { cbNode.current = onNodeClick; }, [onNodeClick]);
  useEffect(() => { cbEdge.current = onEdgeClick; }, [onEdgeClick]);
  useEffect(() => { cbBg.current = onBgClick; }, [onBgClick]);

  useEffect(() => {
    setCyError(null);
    ensureExtensions();
    const container = containerRef.current;
    if (!container) return;

    const layoutOpts =
      layout === 'dagre'
        ? {
            name: 'dagre',
            rankDir: 'TB',
            nodeSep: 55,
            rankSep: 75,
            padding: 40,
            animate: false,
          }
        : {
            name: 'fcose',
            quality: 'proof',
            randomize: false,
            animate: true,
            animationDuration: 700,
            fit: true,
            padding: 50,
            nodeSeparation: 90,
            idealEdgeLength: 160,
            nodeRepulsion: () => 8000,
          };

    let cy: Cytoscape.Core;
    try {
      cy = Cytoscape({
        container,
        elements,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: stylesheet as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layout: layoutOpts as any,
        wheelSensitivity: 0.3,
        minZoom: 0.1,
        maxZoom: 4,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[CytoscapeGraph] init error:', err);
      setCyError(msg);
      return;
    }

    cyRef.current = cy;

    cy.on('tap', 'node', (e) =>
      cbNode.current?.(e.target.data() as Record<string, unknown>)
    );
    cy.on('tap', 'edge', (e) =>
      cbEdge.current?.(e.target.data() as Record<string, unknown>)
    );
    cy.on('tap', (e) => {
      if (e.target === cy) cbBg.current?.();
    });

    // Catch layout errors (fcose can throw on malformed data)
    cy.one('layoutstop', () => setCyError(null));
    cy.one('layouterror', (e) => {
      const msg = (e as unknown as { message?: string }).message ?? 'Layout failed';
      console.error('[CytoscapeGraph] layout error:', e);
      setCyError(msg);
    });

    return () => {
      cyRef.current = null;
      cy.destroy();
    };
    // Re-initialize only when elements or layout type changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, layout, stylesheet]);

  // Select and centre a node by ID (navigated from schema taxonomy)
  useEffect(() => {
    if (!focusNodeId) return;
    const cy = cyRef.current;
    if (!cy) return;

    const target = cy.getElementById(focusNodeId);
    if (target.length === 0) return;

    cy.elements().unselect();
    target.select();
    cy.animate({
      center: { eles: target },
      zoom: Math.max(cy.zoom(), 1.2),
      duration: 400,
      easing: 'ease-in-out-cubic',
    });
  }, [focusNodeId]);

  // Apply search highlight classes without remounting the graph
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('search-hit search-dim');
    cy.edges().removeClass('search-dim');

    if (highlightIds && highlightIds.length > 0) {
      const hitSet = new Set(highlightIds);
      cy.nodes().forEach((n) => {
        if (hitSet.has(n.id())) {
          n.addClass('search-hit');
        } else {
          n.addClass('search-dim');
        }
      });
      cy.edges().addClass('search-dim');
    }
  }, [highlightIds]);

  if (cyError) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
        background: '#0f172a', color: '#f87171', padding: '2rem', textAlign: 'center',
      }}>
        <span style={{ fontSize: '2rem' }}>✗</span>
        <strong style={{ fontSize: '0.95rem' }}>Graph render failed</strong>
        <code style={{
          fontSize: '0.78rem', background: '#1e293b', padding: '0.5rem 1rem',
          borderRadius: '6px', color: '#fca5a5', maxWidth: '600px', wordBreak: 'break-word',
        }}>
          {cyError}
        </code>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Check the data issues banner above or open the browser console for details.
        </span>
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
