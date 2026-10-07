import { diagramSeries, geometry, palettes, type DesignTheme } from '../styles/design-tokens';
export function mermaidTheme(theme: DesignTheme) {
  const p = palettes[theme];
  const series = diagramSeries[theme];
  const categorical = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [
    [`cScale${i}`, series[i % series.length]], [`cScaleLabel${i}`, p.onSurface],
    [`pie${i + 1}`, series[i % series.length]],
    [`git${i}`, series[i % series.length]], [`gitBranchLabel${i}`, p.onSurface],
    [`fillType${i}`, series[i % series.length]],
  ]).flat());
  return {
    ...categorical,
    darkMode: theme === 'dark', fontFamily: geometry.font, fontSize: '14px',
    background: p.surface, textColor: p.onSurface,
    primaryColor: p.primaryContainer, primaryTextColor: p.onPrimaryContainer, primaryBorderColor: p.outline,
    secondaryColor: p.surfaceContainer, secondaryTextColor: p.onSurface, secondaryBorderColor: p.outline,
    tertiaryColor: p.surfaceContainerLow, tertiaryTextColor: p.onSurface, tertiaryBorderColor: p.outlineVariant,
    lineColor: p.onSurfaceVariant, defaultLinkColor: p.onSurfaceVariant,
    nodeBorder: p.outline, mainBkg: p.primaryContainer,
    clusterBkg: p.surfaceContainerLow, clusterBorder: p.outlineVariant,
    edgeLabelBackground: p.surface,
    actorBkg: p.primaryContainer, actorBorder: p.outline, actorTextColor: p.onPrimaryContainer,
    actorLineColor: p.outline, signalColor: p.onSurfaceVariant, signalTextColor: p.onSurface,
    labelBoxBkgColor: p.surfaceContainer, labelBoxBorderColor: p.outlineVariant, labelTextColor: p.onSurface,
    loopTextColor: p.onSurface,
    noteBkgColor: p.surfaceContainer, noteBorderColor: p.outlineVariant, noteTextColor: p.onSurface,
    activationBkgColor: p.primaryContainer, activationBorderColor: p.outline,
    classText: p.onSurface, nodeTextColor: p.onSurface,
    labelColor: p.onSurface, relationColor: p.onSurfaceVariant, relationLabelColor: p.onSurface,
    transitionColor: p.onSurfaceVariant, transitionLabelColor: p.onSurface,
    stateBkg: p.primaryContainer, stateBorder: p.outline,
    compositeBackground: p.surfaceContainerLow, compositeBorder: p.outlineVariant,
    stateLabelColor: p.onSurface, labelBackgroundColor: p.surface,
    compositeTitleBackground: p.surfaceContainer, altBackground: p.surfaceContainer,
    personBkg: p.primaryContainer, personBorder: p.outline,
    rowOdd: p.surface, rowEven: p.surfaceContainerLow,
    taskBkgColor: p.primaryContainer, taskBorderColor: p.outline,
    activeTaskBkgColor: p.primaryContainer, activeTaskBorderColor: p.primary,
    doneTaskBkgColor: p.surfaceContainer, doneTaskBorderColor: p.outline,
    critBkgColor: p.errorContainer, critBorderColor: p.error,
    sectionBkgColor: p.surfaceContainerLow, sectionBkgColor2: p.surfaceContainer,
    altSectionBkgColor: p.surface, gridColor: p.outlineVariant, todayLineColor: p.primary,
    taskTextColor: p.onSurface, taskTextOutsideColor: p.onSurface,
    taskTextLightColor: p.onSurface, taskTextDarkColor: p.onSurface,
    pieTitleTextColor: p.onSurface, pieLegendTextColor: p.onSurface, pieSectionTextColor: p.onSurface,
    pieStrokeColor: p.surface, pieStrokeWidth: '1px', pieOuterStrokeColor: p.outlineVariant, pieOuterStrokeWidth: '1px',
    quadrant1Fill: p.surfaceContainerLow, quadrant2Fill: p.primaryContainer,
    quadrant3Fill: p.surfaceContainer, quadrant4Fill: p.surface,
    quadrant1TextFill: p.onSurface, quadrant2TextFill: p.onPrimaryContainer,
    quadrant3TextFill: p.onSurface, quadrant4TextFill: p.onSurface,
    quadrantPointFill: p.primary, quadrantPointTextFill: p.onSurface,
    quadrantXAxisTextFill: p.onSurfaceVariant, quadrantYAxisTextFill: p.onSurfaceVariant,
    quadrantInternalBorderStrokeFill: p.outlineVariant, quadrantExternalBorderStrokeFill: p.outline,
    quadrantTitleFill: p.onSurface,
    xyChart: { backgroundColor: p.surface, titleColor: p.onSurface,
      xAxisLabelColor: p.onSurfaceVariant, xAxisTitleColor: p.onSurface, xAxisLineColor: p.outlineVariant,
      yAxisLabelColor: p.onSurfaceVariant, yAxisTitleColor: p.onSurface, yAxisLineColor: p.outlineVariant,
      plotColorPalette: series.join(',') },
    requirementBackground: p.primaryContainer, requirementBorderColor: p.outline,
    requirementBorderSize: '1px', requirementTextColor: p.onSurface,
    relationLabelBackground: p.surface,
    archEdgeColor: p.onSurfaceVariant, archEdgeArrowColor: p.onSurfaceVariant,
    archEdgeWidth: geometry.diagramLineWidth, archGroupBorderColor: p.outlineVariant, archGroupBorderWidth: geometry.borderWidth,
    errorBkgColor: p.errorContainer, errorTextColor: p.onErrorContainer,
  };
}

/** Embed visual treatment in the exported SVG as well as the inline preview. */
export function styleDiagramSvg(svg: string): string {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  if (root.localName !== 'svg' || doc.querySelector('parsererror')) throw new Error('Invalid Mermaid SVG');
  for (const rect of root.querySelectorAll('.node rect, .cluster rect, rect.actor, rect.labelBox, rect.note')) {
    // Preserve explicit rounded/stadium shapes and all non-rectangular diagram semantics.
    if (Number(rect.getAttribute('rx') ?? 0) < geometry.radiusSmall) {
      rect.setAttribute('rx', String(geometry.radiusSmall));
      rect.setAttribute('ry', String(geometry.radiusSmall));
    }
  }
  const id = root.id;
  // Mermaid's generated ID is internal and contains only letters, digits and hyphens.
  if (!/^gdm-\d+$/.test(id)) throw new Error('Unexpected SVG ID');
  const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
#${id} .node rect,#${id} .node circle,#${id} .node ellipse,#${id} .node polygon,#${id} .node path,
#${id} .cluster rect,#${id} rect.actor,#${id} rect.note,#${id} rect.labelBox,#${id} .activation0,#${id} .activation1,#${id} .activation2,#${id} .actor-line,#${id} .loopLine {
filter:none!important;stroke-width:${geometry.borderWidth}px;}
#${id} .edgePaths .path,#${id} .flowchart-link,#${id} .messageLine0,#${id} .messageLine1,#${id} .relation,#${id} .relationshipLine,#${id} .transition {
stroke-width:${geometry.diagramLineWidth}px;stroke-linecap:round;stroke-linejoin:round;}
#${id} .edge-thickness-thick{stroke-width:3px;}
#${id} .edge-thickness-invisible{stroke-width:0;}
`;
  root.append(style);
  return new XMLSerializer().serializeToString(root);
}
