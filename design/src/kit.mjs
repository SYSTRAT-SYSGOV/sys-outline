import { C, F, T, R, Icon } from './ui.mjs';
export { C, F, T, R, Icon };

const SHADOW = [{ type: 'dropShadow', color: '#0f172a14', offset: [0, 1], radius: 3 }];
const SHADOW_MD = [{ type: 'dropShadow', color: '#0f172a1f', offset: [0, 8], radius: 24 }];
export { SHADOW, SHADOW_MD };

// Botão: altura 40 (desktop) / 48 (toque). Texto branco só sobre fundos com contraste >= 4.5:1.
export const Btn = (label, o = {}) => {
  const kinds = {
    primary: { bg: C.primary, fg: C.white, stroke: null },
    success: { bg: C.successStrong, fg: C.white, stroke: null },
    danger: { bg: C.criticalStrong, fg: C.white, stroke: null },
    outline: { bg: C.card, fg: C.fg, stroke: C.border },
    ghost: { bg: 'none', fg: C.primary, stroke: null },
  };
  const k = kinds[o.kind ?? 'primary'];
  const h = o.touch ? 48 : o.small ? 32 : 40;
  const kids = [];
  if (o.icon) kids.push(Icon(o.icon, 18, k.fg));
  kids.push(T(label, { weight: 600, size: 14, color: k.fg, name: 'label' }));
  return F('btn/' + label.slice(0, 24), {
    layout: 'horizontal', gap: 8, padding: [0, o.small ? 12 : 18, 0, o.small ? 12 : 18], mainAlign: 'center', crossAlign: 'center',
    fill: k.bg, cornerRadius: 8, ...(k.stroke ? { stroke: k.stroke, strokeWeight: 1 } : {}), ...(o.fillW ? { sizingH: 'fill' } : {}),
  }, kids, { h });
};

export const STATUS = {
  draft: { label: 'Rascunho', bg: C.bg, fg: '#475569', bd: C.border },
  submitted: { label: 'Submetido', bg: C.infoSurface, fg: C.infoStrong, bd: C.infoBorder },
  review: { label: 'Em revisão', bg: C.warningSurface, fg: C.warningStrong, bd: C.warningBorder },
  rejected: { label: 'Devolvido', bg: C.criticalSurface, fg: C.criticalStrong, bd: C.criticalBorder },
  approved: { label: 'Aprovado', bg: C.successSurface, fg: C.successStrong, bd: C.successBorder },
  late: { label: 'Prazo vencido', bg: C.criticalSurface, fg: C.criticalStrong, bd: C.criticalBorder },
  pending: { label: 'Pendente', bg: C.warningSurface, fg: C.warningStrong, bd: C.warningBorder },
};
export const Badge = key => {
  const s = STATUS[key];
  return F('badge/' + key, { layout: 'horizontal', gap: 6, padding: [4, 10, 4, 8], crossAlign: 'center', fill: s.bg, cornerRadius: 999, stroke: s.bd, strokeWeight: 1 }, [
    R('dot', 8, 8, s.fg, 4), T(s.label, { size: 12, weight: 600, color: s.fg, lh: 16 }),
  ]);
};
export const Chip = (label, o = {}) => F('chip/' + label, {
  layout: 'horizontal', gap: 6, padding: [6, 12, 6, 12], crossAlign: 'center', cornerRadius: 999,
  fill: o.active ? C.primaryLight : C.card, stroke: o.active ? C.primary : C.border, strokeWeight: 1,
}, [...(o.icon ? [Icon(o.icon, 14, o.active ? C.primary : C.slate)] : []), T(label, { size: 13, weight: o.active ? 600 : 500, color: o.active ? C.primary : C.slate, lh: 18 })]);

// Campo: rótulo visível acima, ajuda persistente, erro com ícone + texto (não só cor), borda com contraste 4.7:1.
export const Field = (label, o = {}) => {
  const err = !!o.error;
  const box = {
    layout: 'horizontal', padding: [0, 12, 0, 12], crossAlign: o.area ? 'min' : 'center', gap: 8, fill: C.card, cornerRadius: 8,
    stroke: err ? C.criticalStrong : o.focus ? C.primary : C.inputBorder, strokeWeight: err || o.focus ? 2 : 1, sizingH: 'fill',
    ...(o.focus ? { effects: [{ type: 'dropShadow', color: '#1d4ed833', offset: [0, 0], radius: 4 }] } : {}),
  };
  const valueText = o.value
    ? T(o.value, { size: 14, color: C.fg, name: 'value', fillW: true })
    : T(o.placeholder ?? '', { size: 14, color: C.mutedFg, name: 'placeholder', fillW: true });
  const kids = [valueText];
  if (o.icon) kids.unshift(Icon(o.icon, 18, C.mutedFg));
  if (o.trailing) kids.push(typeof o.trailing === 'string' ? T(o.trailing, { size: 13, color: C.mutedFg }) : o.trailing);
  const h = o.area ? (o.h ?? 120) : (o.touch ? 48 : 44);
  const labelRow = F('label-row', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [
    T(label, { size: 14, weight: 600, name: 'label' }),
    ...(o.required ? [T('obrigatório', { size: 12, color: C.criticalStrong, weight: 600, name: 'required' })] : []),
    ...(o.badge ? [o.badge] : []),
  ]);
  const col = [labelRow, F('input', box, kids, { h })];
  if (err) col.push(F('error', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [Icon('alert', 16, C.criticalStrong), T(o.error, { size: 12, weight: 500, color: C.criticalStrong, lh: 16 })]));
  else if (o.helper) col.push(T(o.helper, { size: 12, color: C.mutedFg, lh: 16, name: 'helper', fillW: true }));
  return F('field/' + label.slice(0, 26), { layout: 'vertical', gap: 6, ...(o.w ? {} : { sizingH: 'fill' }) }, col, o.w ? { w: o.w } : {});
};

export const Card = (name, children, o = {}) => F(name, {
  layout: 'vertical', gap: o.gap ?? 16, padding: o.padding ?? 20, fill: C.card, cornerRadius: 12, stroke: C.border, strokeWeight: 1, effects: SHADOW,
  ...(o.fillW ? { sizingH: 'fill' } : {}), ...(o.fillH ? { sizingV: 'fill' } : {}),
}, children, o.w ? { w: o.w } : {});

export const Avatar = (ini, size = 36, bg = C.primary) => F('avatar', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: bg, cornerRadius: size / 2 }, [T(ini, { size: size * 0.38, weight: 700, color: C.white, lh: size * 0.5, align: 'center' })], { w: size, h: size });

const NAV = [
  { group: 'Operação', items: [['home', 'Início', 'Alt+H'], ['doc', 'Editor da Mensagem', 'Alt+E'], ['cal', 'Escalas Dominicais', 'Alt+S'], ['send', 'Fila de Revisão', 'Alt+R']] },
  { group: 'Acervo & Células', items: [['book', 'Biblioteca de Resumos', 'Alt+B']] },
  { group: 'Administração', items: [['users', 'Voluntários & Equipe', 'Alt+U'], ['gear', 'Configurações', 'Alt+C']] },
];
export const Sidebar = (active, h = 900, user = { name: 'Escriba Voluntário', unit: 'Casa de Israel · Catedral', ini: 'EV' }, only = null) => {
  const groups = NAV.filter(g => !only || g.items.some(i => only.includes(i[1]))).map(g => F('group/' + g.group, { layout: 'vertical', gap: 4, sizingH: 'fill' }, [
    T(g.group.toUpperCase(), { size: 11, weight: 700, color: C.mutedFg, ls: 0.8, lh: 16, name: 'group-title' }),
    ...g.items.filter(i => !only || only.includes(i[1])).map(([ic, label, key]) => {
      const on = label === active;
      return F('nav/' + label, {
        layout: 'horizontal', gap: 12, padding: [0, 12, 0, 12], crossAlign: 'center', sizingH: 'fill', fill: on ? C.primaryLight : 'none',
        cornerRadius: 8, ...(on ? { stroke: C.primaryBorder, strokeWeight: 1 } : {}),
      }, [Icon(ic, 20, on ? C.primary : C.slate), T(label, { size: 14, weight: on ? 600 : 500, color: on ? C.primary : C.fg, name: 'label', fillW: true })], { h: 44 });
    }),
  ]));
  return F('sidebar', { layout: 'vertical', gap: 24, padding: 16, fill: C.card, stroke: C.border, strokeWeight: 1 }, [
    F('brand', { layout: 'horizontal', gap: 12, crossAlign: 'center', padding: [4, 8, 8, 8] }, [
      F('logo', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.primary, cornerRadius: 10 }, [Icon('scroll', 22, C.white)], { w: 40, h: 40 }),
      F('brand-text', { layout: 'vertical', gap: 0 }, [
        F('wordmark', { layout: 'horizontal', gap: 0 }, [T('SYS', { size: 15, weight: 800, color: C.primary, lh: 20 }), T('-OUTLINE', { size: 15, weight: 800, color: C.successStrong, lh: 20 })]),
        T('Escriba da Palavra', { size: 12, color: C.mutedFg, lh: 16 }),
      ]),
    ]),
    ...groups,
    F('spacer', { sizingV: 'fill' }, [], { w: 1 }),
    F('profile', { layout: 'horizontal', gap: 10, padding: 10, crossAlign: 'center', fill: C.muted, cornerRadius: 10, sizingH: 'fill' }, [
      Avatar(user.ini, 36),
      F('who', { layout: 'vertical', gap: 0, sizingH: 'fill' }, [T(user.name, { size: 13, weight: 600, lh: 18 }), T(user.unit, { size: 11, color: C.mutedFg, lh: 14 })]),
      Icon('chevD', 16, C.slate),
    ]),
  ], { w: 272, h });
};

export const Topbar = (crumb, title, w) => F('topbar', {
  layout: 'horizontal', padding: [0, 32, 0, 32], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill',
}, [
  F('titles', { layout: 'vertical', gap: 0 }, [T(crumb, { size: 12, color: C.mutedFg, lh: 16 }), T(title, { size: 18, weight: 700, lh: 26 })]),
  F('actions', { layout: 'horizontal', gap: 12, crossAlign: 'center' }, [
    F('online', { layout: 'horizontal', gap: 6, padding: [4, 10, 4, 10], crossAlign: 'center', fill: C.successSurface, cornerRadius: 999 }, [R('dot', 8, 8, C.success, 4), T('Online', { size: 12, weight: 600, color: C.successStrong, lh: 16 })]),
    F('unit', { layout: 'horizontal', gap: 6, padding: [6, 12, 6, 12], crossAlign: 'center', fill: C.muted, cornerRadius: 999 }, [Icon('home', 14, C.slate), T('Casa de Israel · Catedral', { size: 12, weight: 500, color: C.slate, lh: 16 })]),
    F('bell', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 8 }, [Icon('bell', 20, C.slate)], { w: 40, h: 40 }),
    Avatar('EV', 36),
  ]),
], { h: 64 });

export const Shell = (active, crumb, title, body, o = {}) => {
  const W = o.w ?? 1440, H = o.h ?? 960;
  return F('tela/' + title, { layout: 'horizontal', fill: C.bg, clip: true }, [
    Sidebar(active, H, o.user, o.only),
    F('main', { layout: 'vertical', sizingH: 'fill', sizingV: 'fill' }, [
      Topbar(crumb, title),
      F('content', { layout: 'vertical', gap: 24, padding: o.padding ?? 32, sizingH: 'fill', sizingV: 'fill' }, body),
    ]),
  ], { w: W, h: H });
};

export const Stat = (label, value, sub, color = C.primary, icon = 'doc') => Card('stat/' + label, [
  F('row', { layout: 'horizontal', mainAlign: 'spaceBetween', crossAlign: 'center', sizingH: 'fill' }, [
    T(label, { size: 13, weight: 600, color: C.slate, lh: 18 }),
    F('ic', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.muted, cornerRadius: 8 }, [Icon(icon, 18, color)], { w: 32, h: 32 }),
  ]),
  T(value, { size: 32, weight: 700, lh: 38, color: C.fg }),
  T(sub, { size: 12, color: C.mutedFg, lh: 16 }),
], { gap: 8, fillW: true });

export const ProgressBar = (pct, color = C.successStrong, w = 200) => F('progress', { layout: 'horizontal', fill: C.muted, cornerRadius: 4, clip: true }, [R('bar', Math.max(4, Math.round(w * pct / 100)), 8, color, 4)], { w, h: 8 });


