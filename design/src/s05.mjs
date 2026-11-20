import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Card, Field, Avatar, Shell, SHADOW_MD } from './kit.mjs';

const col = (t, w) => T(t, { size: 12, weight: 700, color: C.slate, ls: 0.4, lh: 16, w });
const row = (d, turno, nome, sub, prazo, urg, badge, acoes) => F('linha/' + d, { layout: 'horizontal', gap: 16, padding: [14, 20, 14, 20], crossAlign: 'center', sizingH: 'fill', stroke: C.border, strokeWeight: 0, strokeSides: [1, 0, 0, 0] }, [
  F('culto', { layout: 'vertical', gap: 2 }, [T(d, { size: 14, weight: 700, lh: 20 }), T(turno, { size: 12, color: C.slate, lh: 16 })], { w: 150 }),
  F('escriba', { layout: 'horizontal', gap: 10, crossAlign: 'center' }, [Avatar(nome.split(' ').map(p => p[0]).slice(0, 2).join(''), 32, C.slate), F('n', { layout: 'vertical', gap: 0 }, [T(nome, { size: 14, weight: 600, lh: 20 }), ...(sub ? [T(sub, { size: 11, color: C.slate, lh: 14 })] : [])])], { w: 260 }),
  F('prazo', { layout: 'vertical', gap: 2 }, [T(prazo[0], { size: 13, lh: 18 }), T(prazo[1], { size: 12, weight: 600, color: urg ? C.criticalStrong : C.slate, lh: 16 })], { w: 190 }),
  F('st', { layout: 'horizontal' }, [Badge(badge)], { w: 130 }),
  F('ac', { layout: 'horizontal', gap: 8, mainAlign: 'max', sizingH: 'fill' }, acoes),
]);

const table = () => Card('tabela', [
  F('cab', { layout: 'horizontal', gap: 16, padding: [10, 20, 10, 20], fill: C.muted, cornerRadius: 8, sizingH: 'fill' }, [col('CULTO', 150), col('ESCRIBA TITULAR', 260), col('PRAZO DE ENTREGA', 190), col('STATUS', 130), T('AÇÕES', { size: 12, weight: 700, color: C.slate, ls: 0.4, lh: 16, align: 'right', fillW: true })]),
  row('22/11/2026', 'Domingo · noite', 'Escriba Voluntário', 'Passada por Marina Colega', ['21/11/2026 às 07:28', 'vence em 10 h'], false, 'pending', [Btn('Passar escala', { kind: 'outline', small: true, icon: 'swap' }), Btn('Editar', { kind: 'ghost', small: true })]),
  row('15/11/2026', 'Domingo · noite', 'Marina Colega', '', ['14/11/2026 às 07:28', 'entregue no prazo'], false, 'approved', [Btn('Abrir resumo', { kind: 'ghost', small: true })]),
  row('08/11/2026', 'Domingo · manhã', 'Carlos Lima', '', ['07/11/2026 às 07:28', 'venceu há 13 dias'], true, 'late', [Btn('Passar escala', { kind: 'outline', small: true, icon: 'swap' }), Btn('Cobrar', { kind: 'ghost', small: true })]),
  row('29/11/2026', 'Domingo · noite', 'Marina Colega', 'Recebida de Escriba Voluntário', ['28/11/2026 às 07:28', 'em 8 dias'], false, 'pending', [Btn('Passar escala', { kind: 'outline', small: true, icon: 'swap' })]),
], { fillW: true, padding: 12, gap: 0 });

const radio = (n, sub, on) => F('op/' + n, { layout: 'horizontal', gap: 12, padding: [10, 14, 10, 14], crossAlign: 'center', sizingH: 'fill', cornerRadius: 10, fill: on ? C.primaryLight : C.card, stroke: on ? C.primary : C.inputBorder, strokeWeight: on ? 2 : 1 }, [
  F('r', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 11, stroke: on ? C.primary : C.inputBorder, strokeWeight: 2, fill: C.card }, on ? [R('p', 10, 10, C.primary, 5)] : [], { w: 22, h: 22 }),
  Avatar(n.split(' ').map(p => p[0]).join(''), 32, C.slate), F('t', { layout: 'vertical', sizingH: 'fill' }, [T(n, { size: 14, weight: 600, lh: 20 }), T(sub, { size: 12, color: C.slate, lh: 16 })]),
]);
const dialog = () => F('dialog-passar', { layout: 'vertical', gap: 16, padding: 24, fill: C.card, cornerRadius: 16, stroke: C.border, strokeWeight: 1, effects: SHADOW_MD }, [
  F('h', { layout: 'horizontal', crossAlign: 'center', sizingH: 'fill' }, [F('t', { layout: 'vertical', gap: 4, sizingH: 'fill' }, [T('Passar escala para um colega', { size: 18, weight: 800, lh: 26 }), T('Culto de 22/11/2026 · noite. O colega assume a escala e o resumo em andamento. A troca vale na hora e a coordenação é avisada.', { size: 13, color: C.slate, lh: 18, fillW: true })]), F('x', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center' }, [Icon('x', 20, C.slate)], { w: 44, h: 44 })]),
  F('opcoes', { layout: 'vertical', gap: 8, sizingH: 'fill' }, [T('Colegas disponíveis neste dia e horário', { size: 13, weight: 600 }), radio('Marina Colega', 'Catedral · 12 resumos entregues', true), radio('Carlos Lima', 'Catedral · 8 resumos entregues', false)]),
  F('bt', { layout: 'horizontal', gap: 10, mainAlign: 'max', sizingH: 'fill' }, [Btn('Cancelar', { kind: 'outline' }), Btn('Passar escala', { icon: 'swap' })]),
], { w: 520 });

const desktop = F('escalas/desktop', { clip: true }, [
  Shell('Escalas Dominicais', 'Operação', 'Escalas Dominicais', [
    F('topo', { layout: 'horizontal', gap: 12, crossAlign: 'center', sizingH: 'fill' }, [F('t', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T('Escalas dominicais', { size: 24, weight: 800, lh: 32 }), T('Quem escreve em cada culto, o prazo de entrega e o estado de cada resumo.', { size: 14, color: C.slate, lh: 20 })]), Btn('Nova escala', { icon: 'plus' })]),
    F('filtros', { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [Chip('Todas · 4', { active: true }), Chip('Pendentes · 2'), Chip('Atrasadas · 1'), Chip('Concluídas · 1'), Chip('Meu núcleo', { icon: 'home' })]),
    table(),
  ], { h: 960 }),
  F('scrim', { fill: '#0f172a99' }, [], { w: 1440, h: 960 }),
], { w: 1440, h: 960 });
const desktopFull = F('escalas/desktop+dialogo', { layout: 'vertical', clip: true }, [], { w: 1440, h: 960 });

const card = (d, turno, badge, prazo, urg, acoes) => Card('card/' + d, [
  F('l1', { layout: 'horizontal', crossAlign: 'center', sizingH: 'fill' }, [F('t', { layout: 'vertical', gap: 0, sizingH: 'fill' }, [T(d, { size: 17, weight: 800, lh: 24 }), T(turno, { size: 12, color: C.slate, lh: 16 })]), Badge(badge)]),
  F('pz', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [Icon('clock', 16, urg ? C.criticalStrong : C.slate), T(prazo, { size: 13, weight: 600, color: urg ? C.criticalStrong : C.slate })]),
  ...acoes,
], { gap: 12, padding: 16, fillW: true });
const mobile = F('escalas/mobile', { layout: 'vertical', fill: C.bg, clip: true }, [
  F('topo', { layout: 'horizontal', padding: [0, 16, 0, 16], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [T('Minhas escalas', { size: 17, weight: 700 }), Avatar('EV', 36)], { h: 60 }),
  F('corpo', { layout: 'vertical', gap: 12, padding: 16, sizingH: 'fill', sizingV: 'fill' }, [
    F('ch', { layout: 'horizontal', gap: 8 }, [Chip('Pendentes · 2', { active: true }), Chip('Concluídas')]),
    card('Dom, 22/11 · noite', 'Casa de Israel · Catedral', 'pending', 'Entrega até 21/11 às 07:28 · vence em 10 h', false, [Btn('Continuar escrevendo', { icon: 'doc', touch: true, fillW: true }), Btn('Passar escala', { kind: 'outline', icon: 'swap', touch: true, fillW: true })]),
    card('Dom, 29/11 · noite', 'Recebida de Escriba Voluntário', 'pending', 'Entrega até 28/11 às 07:28 · em 8 dias', false, [Btn('Começar a escrever', { icon: 'doc', touch: true, fillW: true })]),
  ]),
  F('barra-inferior', { layout: 'horizontal', mainAlign: 'spaceAround', crossAlign: 'center', fill: C.card, stroke: C.border, strokeWeight: 1, strokeSides: [1, 0, 0, 0], sizingH: 'fill' }, [['home', 'Início', false], ['doc', 'Editor', false], ['cal', 'Escalas', true], ['book', 'Biblioteca', false]].map(([ic, l, on]) => F('tab/' + l, { layout: 'vertical', gap: 2, mainAlign: 'center', crossAlign: 'center' }, [Icon(ic, 22, on ? C.primary : C.slate), T(l, { size: 11, weight: on ? 700 : 500, color: on ? C.primary : C.slate, lh: 14 })], { w: 80, h: 56 })), { h: 64 }),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Escalas' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });
  await build(fc, desktop, 0, 0);
  const d = await build(fc, F('modal-posicao', { layout: 'vertical', mainAlign: 'center', crossAlign: 'center' }, [dialog()], { w: 1440, h: 960 }), 0, 0);
  await build(fc, mobile, 1520, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\05-escalas.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s05.png', { maxSize: 1900 });
});
process.exit(0);
