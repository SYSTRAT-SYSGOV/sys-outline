import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Field, Card, ProgressBar, SHADOW } from './kit.mjs';

const lum = hex => { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const swatch = (name, hex, role, on = C.white) => F('sw/' + name, { layout: 'vertical', gap: 0, cornerRadius: 12, clip: true, stroke: C.border, strokeWeight: 1, fill: C.card }, [
  F('chip', { layout: 'vertical', padding: 12, fill: hex, mainAlign: 'max' }, [T(hex.toUpperCase(), { size: 12, weight: 700, color: on, lh: 16 })], { w: 168, h: 72 }),
  F('meta', { layout: 'vertical', gap: 2, padding: 12 }, [T(name, { size: 13, weight: 600, lh: 18 }), T(role, { size: 11, color: C.mutedFg, lh: 14, w: 144 })]),
]);

const section = (title, sub, children) => F('secao/' + title, { layout: 'vertical', gap: 20, padding: 32, fill: C.card, cornerRadius: 16, stroke: C.border, strokeWeight: 1, effects: SHADOW }, [
  F('head', { layout: 'vertical', gap: 4 }, [T(title, { size: 20, weight: 700, lh: 28 }), T(sub, { size: 13, color: C.mutedFg, w: 1100 })]), ...children,
], { w: 1280 });

const pairs = [
  ['Texto principal', C.fg, C.card], ['Texto principal em fundo base', C.fg, C.bg], ['Texto secundário (muted)', C.mutedFg, C.card], ['Texto secundário em superfície muted (legado)', C.mutedFg, C.muted], ['Texto secundário em superfície muted (v2 slate)', C.slate, C.muted],
  ['Botão primário', C.white, C.primary], ['Botão aprovar (verde forte)', C.white, C.successStrong], ['Botão aprovar do legado (#16a34a)', C.white, C.success],
  ['Botão devolver (crítico forte)', C.white, C.criticalStrong], ['Botão devolver do legado (#ef4444)', C.white, C.critical], ['Selo Em revisão', C.warningStrong, C.warningSurface],
  ['Selo Aprovado', C.successStrong, C.successSurface], ['Selo Devolvido', C.criticalStrong, C.criticalSurface], ['Selo Submetido', C.infoStrong, C.infoSurface],
  ['Borda de campo (legado #e2e8f0)', C.border, C.card], ['Borda de campo (v2 #64748b)', C.inputBorder, C.card], ['Link / ação primária em texto', C.primary, C.card],
];
const auditRows = pairs.map(([n, fg, bg]) => {
  const r = ratio(fg, bg); const isBorder = n.startsWith('Borda'); const need = isBorder ? 3 : 4.5; const ok = r >= need;
  return F('linha/' + n, { layout: 'horizontal', gap: 16, crossAlign: 'center', padding: [10, 0, 10, 0], sizingH: 'fill', stroke: C.border, strokeWeight: 0, strokeSides: [0, 0, 1, 0] }, [
    F('amostra', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 6, fill: bg, stroke: C.border, strokeWeight: 1 }, [T(isBorder ? '▭' : 'Aa', { size: 14, weight: 700, color: fg, lh: 18 })], { w: 56, h: 32 }),
    T(n, { size: 13, w: 380 }), T(`${fg.toUpperCase()} sobre ${bg.toUpperCase()}`, { size: 12, color: C.mutedFg, w: 260 }),
    T(r.toFixed(2) + ' : 1', { size: 13, weight: 600, w: 90 }), T(`mínimo ${need} : 1`, { size: 12, color: C.mutedFg, w: 110 }),
    F('res', { layout: 'horizontal', gap: 6, padding: [4, 10, 4, 8], crossAlign: 'center', cornerRadius: 999, fill: ok ? C.successSurface : C.criticalSurface }, [Icon(ok ? 'check' : 'x', 14, ok ? C.successStrong : C.criticalStrong), T(ok ? 'Passa' : 'Falha', { size: 12, weight: 700, color: ok ? C.successStrong : C.criticalStrong, lh: 16 })]),
  ]);
});

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Design System v2' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });

  const title = F('capa', { layout: 'vertical', gap: 8, padding: [40, 40, 40, 40], fill: C.primaryActive, cornerRadius: 20 }, [
    T('ESCRIBA DA PALAVRA · SYS-OUTLINE', { size: 12, weight: 700, color: '#bfdbfe', ls: 1.2, lh: 16 }),
    T('Design System v2', { size: 40, weight: 800, color: C.white, lh: 48 }),
    T('Evolução do SYSGOV para telas mais claras, acessíveis (WCAG 2.2 AA) e preparadas para celular. Mantém a paleta, a Inter Variable e os raios do DESIGN_SYSTEM.md; ajusta apenas onde a auditoria de contraste abaixo reprova.', { size: 15, color: '#dbeafe', w: 900, lh: 24 }),
  ], { w: 1280 });

  const colors = section('Cores (tokens do projeto)', 'Sem cores novas: tudo vem do DESIGN_SYSTEM.md / index.css. As variantes "forte" são usadas sempre que o fundo recebe texto branco.', [
    F('grade1', { layout: 'horizontal', gap: 16, wrap: true, sizingH: 'fill' }, [
      swatch('primary', C.primary, 'Ações primárias, links, foco'), swatch('primary-hover', C.primaryHover, 'Hover de botão e títulos'), swatch('primary-active', C.primaryActive, 'Estado ativo, capas'),
      swatch('primary-light', C.primaryLight, 'Fundo de item ativo', C.primary), swatch('gold', C.gold, 'Acento institucional', C.fg), swatch('success-strong', C.successStrong, 'Aprovar (texto branco ok)'),
      swatch('critical-strong', C.criticalStrong, 'Devolver (texto branco ok)'), swatch('warning-strong', C.warningStrong, 'Atenção, prazo próximo'), swatch('info-strong', C.infoStrong, 'Informativo, submetido'),
    ]),
    F('grade2', { layout: 'horizontal', gap: 16, wrap: true, sizingH: 'fill' }, [
      swatch('background', C.bg, 'Fundo da aplicação', C.fg), swatch('card', C.card, 'Cards, modais, menus', C.fg), swatch('muted', C.muted, 'Superfícies neutras', C.fg),
      swatch('muted-foreground', C.mutedFg, 'Texto secundário'), swatch('foreground', C.fg, 'Texto principal'), swatch('input-border', C.inputBorder, 'NOVO uso: borda de campo (4,8:1)'),
      swatch('border', C.border, 'Divisórias e cards', C.fg),
    ]),
  ]);

  const audit = section('Auditoria de contraste', 'Texto normal exige 4,5:1 (WCAG 1.4.3); bordas e ícones de controles exigem 3:1 (1.4.11). Em vermelho, o que o legado reprovava e o que a v2 troca.', [
    F('tabela', { layout: 'vertical', gap: 0, sizingH: 'fill' }, auditRows),
  ]);

  const type = section('Tipografia · Inter Variable', 'Uma única família para interface e documento. Números sempre tabulares (contadores, datas, métricas).', [
    F('escala', { layout: 'vertical', gap: 14 }, [
      F('r1', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [T('Display 32 / 800', { size: 12, color: C.mutedFg, w: 160 }), T('Resumo da palavra', { size: 32, weight: 800, lh: 40 })]),
      F('r2', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [T('Título 24 / 700', { size: 12, color: C.mutedFg, w: 160 }), T('Edificando sobre a Rocha', { size: 24, weight: 700, lh: 32 })]),
      F('r3', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [T('Seção 18 / 700', { size: 12, color: C.mutedFg, w: 160 }), T('Direcionamento para a célula', { size: 18, weight: 700, lh: 26 })]),
      F('r4', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [T('Corpo 14 / 400', { size: 12, color: C.mutedFg, w: 160 }), T('Chegamos até aqui pela graça e pela presença de Deus, e não por recursos próprios.', { size: 14, w: 700 })]),
      F('r5', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [T('Rótulo 14 / 600', { size: 12, color: C.mutedFg, w: 160 }), T('Tema da Palavra', { size: 14, weight: 600 })]),
      F('r6', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [T('Apoio 12 / 400', { size: 12, color: C.mutedFg, w: 160 }), T('Prazo de entrega: 21/11/2026 às 07:28 · 2.847 / 3.400 caracteres', { size: 12, color: C.mutedFg })]),
    ]),
  ]);

  const comps = section('Componentes e estados', 'Alvos de toque ≥ 44 px no celular e ≥ 24 px no desktop (WCAG 2.5.8). Rótulo sempre visível acima do campo; erro com ícone e texto, nunca só cor.', [
    F('botoes', { layout: 'horizontal', gap: 12, crossAlign: 'center', wrap: true, sizingH: 'fill' }, [Btn('Submeter para revisão', { icon: 'send' }), Btn('Aprovar resumo', { kind: 'success', icon: 'check' }), Btn('Devolver com ajustes', { kind: 'danger' }), Btn('Salvar rascunho', { kind: 'outline', icon: 'save' }), Btn('Cancelar', { kind: 'ghost' }), Btn('Toque 48 px', { touch: true })]),
    F('selos', { layout: 'horizontal', gap: 12, crossAlign: 'center', wrap: true, sizingH: 'fill' }, [Badge('draft'), Badge('submitted'), Badge('review'), Badge('rejected'), Badge('approved'), Badge('late'), Chip('Pendentes', { active: true }), Chip('Aprovados'), Chip('Meu núcleo', { icon: 'home' })]),
    F('campos', { layout: 'horizontal', gap: 20 }, [
      Field('Padrão', { value: 'Edificando sobre a Rocha', required: true, helper: 'Até 200 caracteres.' }), Field('Foco', { value: 'Edificando', focus: true, required: true }), Field('Erro', { error: 'Informe o texto lido (ex.: Mateus 7:24-27).', required: true }),
    ].map(f => ({ ...f, props: { ...f.props, sizingH: 'fixed' }, w: 380 }))),
    F('contador', { layout: 'horizontal', gap: 24, crossAlign: 'center' }, [
      F('c1', { layout: 'vertical', gap: 6 }, [T('2.140 / 3.400', { size: 13, weight: 600, color: C.mutedFg }), ProgressBar(63, C.successStrong, 260)]),
      F('c2', { layout: 'vertical', gap: 6 }, [T('3.150 / 3.400 · quase no limite', { size: 13, weight: 600, color: C.warningStrong }), ProgressBar(93, C.warning, 260)]),
      F('c3', { layout: 'vertical', gap: 6 }, [T('3.445 / 3.400 (+45) · excedido', { size: 13, weight: 600, color: C.criticalStrong }), ProgressBar(100, C.criticalStrong, 260)]),
    ]),
  ]);

  const spacing = section('Espaçamento, raios e elevação', 'Escala de 4 px. Raios: cards 12, botões e campos 8, pills 999. Sombra única e discreta (shadow-xs).', [
    F('esp', { layout: 'horizontal', gap: 24, crossAlign: 'max' }, [4, 8, 12, 16, 24, 32, 48].map(n => F('e' + n, { layout: 'vertical', gap: 6, crossAlign: 'center' }, [R('bloco', n, n, C.primary, 2), T(n + ' px', { size: 11, color: C.mutedFg, lh: 14 })]))),
  ]);

  const page = F('pagina', { layout: 'vertical', gap: 32, padding: 40 }, [title, colors, audit, type, comps, spacing], { w: 1360 });
  await build(fc, page, 0, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\00-design-system.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s00.png', { maxSize: 1800 });
});
process.exit(0);


