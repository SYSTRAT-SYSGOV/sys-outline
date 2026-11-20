import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Card, Avatar, Shell, Stat, ProgressBar, Sidebar, SHADOW } from './kit.mjs';

const Step = (n, label, state) => {
  const done = state === 'done', cur = state === 'cur';
  return F('passo/' + label, { layout: 'horizontal', gap: 10, crossAlign: 'center' }, [
    F('bolha', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 14, fill: done ? C.successStrong : cur ? C.primary : C.card, stroke: done || cur ? 'none' : C.inputBorder, strokeWeight: done || cur ? 0 : 1 },
      [done ? Icon('check', 16, C.white, 2.5) : T(String(n), { size: 13, weight: 700, color: cur ? C.white : C.slate, lh: 16, align: 'center' })], { w: 28, h: 28 }),
    T(label, { size: 13, weight: cur ? 700 : 500, color: cur ? C.fg : C.slate, lh: 18 }),
  ]);
};
const Line = () => R('liga', 28, 2, C.border, 1);
const stepper = () => F('stepper', { layout: 'horizontal', gap: 10, crossAlign: 'center', wrap: true, sizingH: 'fill' }, [Step(1, 'Rascunho', 'cur'), Line(), Step(2, 'Submetido', ''), Line(), Step(3, 'Em revisão', ''), Line(), Step(4, 'Aprovado', '')]);

const Row = (a, b, c, d) => F('linha/' + a.slice(0, 20), { layout: 'horizontal', gap: 16, crossAlign: 'center', padding: [14, 0, 14, 0], sizingH: 'fill', stroke: C.border, strokeWeight: 0, strokeSides: [1, 0, 0, 0] }, [
  F('txt', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T(a, { size: 14, weight: 600, lh: 20 }), T(b, { size: 12, color: C.mutedFg, lh: 16 })]), ...(c ? [c] : []), ...(d ? [d] : []),
]);

const greet = (name, sub) => F('saudacao', { layout: 'vertical', gap: 2 }, [T(name, { size: 26, weight: 800, lh: 34 }), T(sub, { size: 14, color: C.slate, lh: 20 })]);

const hero = () => Card('proxima-entrega', [
  F('topo', { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [T('Sua próxima entrega', { size: 13, weight: 700, color: C.slate, ls: 0.4 }), F('sp', { sizingH: 'fill' }, [], { w: 1, h: 1 }), Badge('pending'),
    F('contagem', { layout: 'horizontal', gap: 6, padding: [4, 10, 4, 10], crossAlign: 'center', fill: C.warningSurface, cornerRadius: 999 }, [Icon('clock', 14, C.warningStrong), T('vence em 2 dias', { size: 12, weight: 700, color: C.warningStrong, lh: 16 })])]),
  F('titulo', { layout: 'vertical', gap: 4, sizingH: 'fill' }, [T('Culto de domingo, 22/11/2026 · noite', { size: 22, weight: 800, lh: 30 }), T('Entrega até sábado, 21/11/2026 às 07:28 · Casa de Israel · Catedral', { size: 14, color: C.slate, lh: 20 })]),
  stepper(),
  F('prog', { layout: 'vertical', gap: 8, sizingH: 'fill' }, [F('pl', { layout: 'horizontal', mainAlign: 'spaceBetween', sizingH: 'fill' }, [T('Resumo da palavra', { size: 13, weight: 600 }), T('2.140 / 3.400 caracteres', { size: 13, weight: 600, color: C.slate })]), ProgressBar(63, C.successStrong, 560)]),
  F('acoes', { layout: 'horizontal', gap: 12 }, [Btn('Continuar escrevendo', { icon: 'doc' }), Btn('Passar escala', { kind: 'outline', icon: 'swap' })]),
], { gap: 20, padding: 24, fillW: true });

const comentarios = () => Card('comentarios', [
  F('h', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [Icon('msg', 18, C.warningStrong), T('Comentários da revisão', { size: 15, weight: 700, fillW: true }), Badge('review')]),
  F('c1', { layout: 'vertical', gap: 8, padding: 12, fill: C.muted, cornerRadius: 10, sizingH: 'fill' }, [
    T('“Edificando sobre a Rocha”', { size: 12, color: C.slate, lh: 16, fillW: true }), T('Citar a referência bíblica completa no título.', { size: 14, lh: 20, fillW: true }), T('Revisor Voluntário · hoje', { size: 12, color: C.mutedFg, lh: 16 }),
  ]),
  Btn('Ver comentários', { kind: 'outline', small: true }),
], { w: 400, gap: 14 });

const recebida = () => F('aviso-escala', { layout: 'horizontal', gap: 12, padding: 16, crossAlign: 'center', fill: C.infoSurface, cornerRadius: 12, stroke: C.infoBorder, strokeWeight: 1 }, [
  Icon('swap', 20, C.infoStrong), F('t', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T('Você recebeu uma escala', { size: 14, weight: 700, color: C.infoStrong, lh: 20 }), T('Marina passou o culto de 29/11 para você. Entrega até 28/11.', { size: 13, color: C.fg, lh: 18, fillW: true })]),
], { w: 400 });

const recentes = () => Card('recentes', [
  F('h', { layout: 'horizontal', mainAlign: 'spaceBetween', crossAlign: 'center', sizingH: 'fill' }, [T('Seus resumos recentes', { size: 16, weight: 700 }), Btn('Ver biblioteca', { kind: 'ghost', small: true })]),
  F('lista', { layout: 'vertical', gap: 0, sizingH: 'fill' }, [
    Row('Edificando sobre a Rocha', 'Culto de 15/11/2026 · 3.012 caracteres', Badge('approved')),
    Row('Passa este Jordão', 'Culto de 08/11/2026 · 2.874 caracteres', Badge('approved')),
    Row('O poder da oração perseverante', 'Culto de 01/11/2026 · 2.990 caracteres', Badge('rejected')),
  ]),
], { fillW: true });

const escriba = Shell('Início', 'SYSTRAT · SYS-OUTLINE', 'Início', [
  greet('Bom dia, Escriba', 'Casa de Israel · Catedral · sexta-feira, 20 de novembro'),
  F('linha1', { layout: 'horizontal', gap: 24, sizingH: 'fill' }, [hero(), F('dir', { layout: 'vertical', gap: 16 }, [comentarios(), recebida()], { w: 400 })]),
  recentes(),
], { h: 960 });

const gestor = Shell('Início', 'SYSTRAT · SYS-OUTLINE', 'Início', [
  greet('Bom dia, Administrador', 'Visão da Casa de Israel · Catedral'),
  F('alerta', { layout: 'horizontal', gap: 12, padding: [12, 16, 12, 16], crossAlign: 'center', fill: C.criticalSurface, cornerRadius: 12, stroke: C.criticalBorder, strokeWeight: 1, sizingH: 'fill' }, [
    Icon('alert', 20, C.criticalStrong), T('2 escalas com prazo vencido precisam da sua atenção.', { size: 14, weight: 600, color: C.criticalStrong, fillW: true }), Btn('Ver escalas', { kind: 'outline', small: true })]),
  F('stats', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [Stat('Fila de revisão', '3', 'aguardando revisão', C.warningStrong, 'send'), Stat('Prazos vencidos', '2', 'escalas atrasadas', C.criticalStrong, 'clock'), Stat('Homologadas', '12', 'neste trimestre', C.successStrong, 'check'), Stat('Equipe ativa', '9', 'escribas e revisores', C.primary, 'users')]),
  F('linha2', { layout: 'horizontal', gap: 24, sizingH: 'fill' }, [
    Card('fila', [F('h', { layout: 'horizontal', mainAlign: 'spaceBetween', crossAlign: 'center', sizingH: 'fill' }, [T('Fila de revisão prioritária', { size: 16, weight: 700 }), Btn('Abrir fila', { kind: 'ghost', small: true })]),
      F('l', { layout: 'vertical', sizingH: 'fill' }, [Row('Edificando sobre a Rocha', 'Escriba Voluntário · domingo em 2 dias', Badge('submitted'), Btn('Revisar', { small: true })), Row('Passa este Jordão', 'Marina Colega · domingo em 2 dias', Badge('review'), Btn('Revisar', { small: true })), Row('A vitória da fé', 'Carlos Lima · domingo em 9 dias', Badge('submitted'), Btn('Revisar', { small: true }))])], { fillW: true }),
    Card('pont', [T('Pontualidade dos escribas · 90 dias', { size: 16, weight: 700 }),
      ...[['Marina Colega', 100, C.successStrong], ['Escriba Voluntário', 83, C.successStrong], ['Carlos Lima', 50, C.warningStrong]].map(([n, p, col]) => F('p/' + n, { layout: 'horizontal', gap: 12, crossAlign: 'center', sizingH: 'fill' }, [T(n, { size: 13, weight: 500, w: 130 }), ProgressBar(p, col, 190), T(p + '%', { size: 13, weight: 700, color: col, w: 44, align: 'right' })]))], { w: 460 }),
  ]),
  Card('trocas', [T('Trocas de escala recentes · 14 dias', { size: 16, weight: 700 }), T('Culto de 29/11/2026: Escriba Voluntário passou para Marina Colega', { size: 14, lh: 20 })], { fillW: true }),
], { h: 960 });

const nav = (a) => F('barra-inferior', { layout: 'horizontal', mainAlign: 'spaceAround', crossAlign: 'center', fill: C.card, stroke: C.border, strokeWeight: 1, strokeSides: [1, 0, 0, 0], sizingH: 'fill' },
  [['home', 'Início'], ['doc', 'Editor'], ['cal', 'Escalas'], ['book', 'Biblioteca']].map(([ic, l]) => F('tab/' + l, { layout: 'vertical', gap: 2, mainAlign: 'center', crossAlign: 'center' }, [Icon(ic, 22, l === a ? C.primary : C.slate), T(l, { size: 11, weight: l === a ? 700 : 500, color: l === a ? C.primary : C.slate, lh: 14 })], { w: 80, h: 56 })), { h: 64 });

const mobile = F('inicio/mobile', { layout: 'vertical', fill: C.bg, clip: true }, [
  F('topo', { layout: 'horizontal', padding: [0, 16, 0, 16], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [
    F('m', { layout: 'horizontal', gap: 10, crossAlign: 'center' }, [F('logo', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.primary, cornerRadius: 8 }, [Icon('scroll', 18, C.white)], { w: 32, h: 32 }), T('Início', { size: 17, weight: 700 })]),
    F('r', { layout: 'horizontal', gap: 8, crossAlign: 'center' }, [F('bell', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center' }, [Icon('bell', 22, C.slate)], { w: 44, h: 44 }), Avatar('EV', 36)])], { h: 60 }),
  F('corpo', { layout: 'vertical', gap: 16, padding: 16, sizingH: 'fill', sizingV: 'fill' }, [
    F('s', { layout: 'vertical', gap: 2 }, [T('Bom dia, Escriba', { size: 22, weight: 800, lh: 30 }), T('Casa de Israel · Catedral', { size: 13, color: C.slate, lh: 18 })]),
    Card('hero-m', [
      F('b', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [Badge('pending'), T('vence em 2 dias', { size: 12, weight: 700, color: C.warningStrong, lh: 16 })]),
      T('Culto de 22/11 · noite', { size: 19, weight: 800, lh: 26 }), T('Entrega até 21/11 às 07:28', { size: 13, color: C.slate, lh: 18 }),
      F('pr', { layout: 'vertical', gap: 6, sizingH: 'fill' }, [T('2.140 / 3.400 caracteres', { size: 12, weight: 600, color: C.slate }), ProgressBar(63, C.successStrong, 310)]),
      Btn('Continuar escrevendo', { icon: 'doc', touch: true, fillW: true }), Btn('Passar escala', { kind: 'outline', icon: 'swap', touch: true, fillW: true }),
    ], { gap: 12, padding: 18, fillW: true }),
    F('com', { layout: 'horizontal', gap: 10, padding: 14, crossAlign: 'center', fill: C.warningSurface, cornerRadius: 12, stroke: C.warningBorder, strokeWeight: 1, sizingH: 'fill' }, [Icon('msg', 20, C.warningStrong), F('t', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T('1 comentário da revisão', { size: 14, weight: 700, color: C.warningStrong, lh: 20 }), T('Toque para ver e resolver', { size: 12, color: C.slate, lh: 16 })]), Icon('chevR', 18, C.slate)]),
    Card('rec-m', [T('Resumos recentes', { size: 15, weight: 700 }), Row('Edificando sobre a Rocha', '15/11 · 3.012 caracteres', Badge('approved')), Row('Passa este Jordão', '08/11 · 2.874 caracteres', Badge('approved'))], { gap: 4, padding: 16, fillW: true }),
  ]),
  nav('Início'),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Início' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });
  await build(fc, escriba, 0, 0);
  await build(fc, gestor, 1520, 0);
  await build(fc, mobile, 3040, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\02-inicio.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s02.png', { maxSize: 2000 });
});
process.exit(0);

