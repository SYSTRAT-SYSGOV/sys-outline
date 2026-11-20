import { start } from './fc.mjs';

// ---- Tokens (DESIGN_SYSTEM.md / index.css do projeto) ----
export const C = {
  bg: '#f8fafc', fg: '#0f172a', muted: '#f1f5f9', mutedFg: '#64748b', slate: '#475569',
  border: '#e2e8f0', inputBorder: '#64748b', card: '#ffffff',
  primary: '#1d4ed8', primaryHover: '#1e40af', primaryActive: '#172554', primaryLight: '#eff6ff', primaryBorder: '#bfdbfe',
  gold: '#f59e0b',
  success: '#16a34a', successStrong: '#15803d', successSurface: '#f0fdf4', successBorder: '#bbf7d0',
  warning: '#f59e0b', warningStrong: '#b45309', warningSurface: '#fffbeb', warningBorder: '#fde68a',
  critical: '#ef4444', criticalStrong: '#b91c1c', criticalSurface: '#fef2f2', criticalBorder: '#fecaca',
  info: '#0284c7', infoStrong: '#0369a1', infoSurface: '#f0f9ff', infoBorder: '#bae6fd',
  white: '#ffffff', dark: '#090d16', dark2: '#0f172a',
};
const WEIGHT = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold' };

export const F = (name, props = {}, children = [], size = {}) => ({ type: 'frame', name, props, children, ...size });
export const R = (name, w, h, fill, radius = 0, props = {}) => ({ type: 'rectangle', name, w, h, props: { fill, cornerRadius: radius, ...props } });
export const T = (text, o = {}) => ({
  type: 'text', text, name: o.name ?? String(text).slice(0, 28), w: o.w,
  props: {
    fontFamily: 'Inter', fontStyle: WEIGHT[o.weight ?? 400], fontSize: o.size ?? 14, fill: o.color ?? C.fg,
    lineHeight: o.lh ?? Math.round((o.size ?? 14) * 1.5), textAlign: o.align ?? 'left',
    ...(o.ls !== undefined ? { letterSpacing: o.ls } : {}), ...(o.fillW ? { sizingH: 'fill' } : {}),
  },
});

// Ícones em grade 24x24: paths (sem arcos) + círculos [cx, cy, r]
const ICONS = {
  check: { p: ['M5 12.5l4.5 4.5L19 7.5'] }, x: { p: ['M6 6l12 12', 'M18 6L6 18'] }, chevR: { p: ['M9 6l6 6-6 6'] }, chevD: { p: ['M6 9l6 6 6-6'] },
  plus: { p: ['M12 5v14', 'M5 12h14'] }, clock: { c: [[12, 12, 9]], p: ['M12 7v5l3 2'] }, alert: { p: ['M12 3.5l9.5 16.5h-19z', 'M12 10v4.5', 'M12 17.2v.6'] },
  search: { c: [[11, 11, 6.5]], p: ['M16 16l5 5'] }, home: { p: ['M4 11l8-7 8 7', 'M6 10v10h12V10'] },
  doc: { p: ['M7 3h7l4 4v14H7z', 'M14 3v4h4', 'M10 12h5', 'M10 16h5'] }, cal: { p: ['M4 7h16v13H4z', 'M4 11h16', 'M8 4v5', 'M16 4v5'] },
  users: { c: [[9, 8, 3.2], [17, 9, 2.5]], p: ['M3 20c0-3.5 3-6 6-6s6 2.5 6 6', 'M16 15c2.5 0 5 1.8 5 5'] },
  gear: { c: [[12, 12, 3.2]], p: ['M12 3v3', 'M12 18v3', 'M3 12h3', 'M18 12h3', 'M5.6 5.6l2.1 2.1', 'M16.3 16.3l2.1 2.1', 'M18.4 5.6l-2.1 2.1', 'M7.7 16.3l-2.1 2.1'] },
  book: { p: ['M4 5h7v15H4z', 'M13 5h7v15h-7z'] }, send: { p: ['M21 3L10 14', 'M21 3l-7 18-4-7-7-4z'] }, msg: { p: ['M4 5h16v11H9l-5 4z'] },
  swap: { p: ['M4 8h14l-3-3', 'M20 16H6l3 3'] }, eye: { c: [[12, 12, 3]], p: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'] },
  lock: { p: ['M6 11h12v9H6z', 'M8 11V8c0-2.2 1.8-4 4-4s4 1.8 4 4v3'] }, mail: { p: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'] },
  bell: { p: ['M6 17v-6c0-3.3 2.7-6 6-6s6 2.7 6 6v6l2 2H4z', 'M10 21h4'] }, menu: { p: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
  save: { p: ['M5 4h11l3 3v13H5z', 'M8 4v5h7V4', 'M8 20v-6h8v6'] }, print: { p: ['M7 9V4h10v5', 'M7 17H4v-6h16v6h-3', 'M7 14h10v6H7z'] },
  scroll: { p: ['M7 4h10c1.1 0 2 .9 2 2v13H8c-1.1 0-2-.9-2-2V6', 'M10 9h6', 'M10 13h6'] }, spark: { p: ['M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z'] },
};
export const Icon = (name, size = 20, color = C.fg, weight = 2) => ({ type: 'icon', name: 'icon/' + name, size, color, weight, def: ICONS[name] ?? { p: [] } });

const scalePath = (p, k) => p.replace(/-?\d*\.?\d+/g, n => String(+(parseFloat(n) * k).toFixed(3)));

let uid = 0;
function flatten(node, parentRef, out, root) {
  const as = 'n' + uid++;
  if (node.type === 'icon') {
    const k = node.size / 24;
    const stroke = { fill: 'none', stroke: node.color, strokeWeight: +(node.weight * Math.max(k, 0.8)).toFixed(2), strokeCap: 'round', strokeJoin: 'round' };
    const params = { type: 'frame', name: node.name, width: node.size, height: node.size, props: { fill: 'none', clip: false, sizingH: 'fixed', sizingV: 'fixed' } };
    if (parentRef) params.parent = { $ref: parentRef };
    out.push({ command: 'node.create', as, params });
    for (const [cx, cy, r] of node.def.c ?? []) {
      out.push({ command: 'node.create', params: { type: 'ellipse', name: 'ring', parent: { $ref: as }, x: (cx - r) * k, y: (cy - r) * k, width: r * 2 * k, height: r * 2 * k, props: stroke } });
    }
    for (const p of node.def.p ?? []) {
      out.push({ command: 'node.create', params: { type: 'vector', name: 'stroke', parent: { $ref: as }, path: scalePath(p, k), x: 0, y: 0, props: stroke } });
    }
    return as;
  }
  const params = { type: node.type, name: node.name };
  if (parentRef) params.parent = { $ref: parentRef };
  if (root) { params.x = root.x; params.y = root.y; }
  if (node.type === 'text') { params.text = node.text; if (node.w) params.width = node.w; }
  else { if (node.w !== undefined) params.width = node.w; if (node.h !== undefined) params.height = node.h; }
  params.props = { ...(node.props ?? {}) };
  if ((node.type === 'frame' || node.type === 'component') && params.props.fill === undefined) params.props.fill = 'none';
  if ((node.type === 'frame' || node.type === 'component') && params.props.layout) {
    if (node.w === undefined && params.props.sizingH === undefined) params.props.sizingH = 'hug';
    if (node.h === undefined && params.props.sizingV === undefined) params.props.sizingV = 'hug';
  }
  out.push({ command: 'node.create', as, params });
  for (const c of node.children ?? []) flatten(c, as, out);
  return as;
}

export async function build(fc, spec, x, y) {
  const out = [];
  flatten(spec, null, out, { x, y });
  const r = await fc.call('batch', { commands: out, label: spec.name });
  return { count: out.length, r };
}
export async function session(fn) {
  const fc = start(['--automation-write-root', 'D:\\SYSTRAT\\escriba\\design']);
  try { await fn(fc); } finally { fc.close(); }
}
export async function shot(fc, file, opts = {}) {
  const r = await fc.call('screenshot', { maxSize: 1600, ...opts });
  if (r.images[0]) fc.savePng(r.images[0], file);
  return r;
}


