import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Card, Field, Avatar, Shell, SHADOW } from './kit.mjs';

const item = (tema, quem, badge, prazo, sel, chars) => F('item/' + tema.slice(0, 18), { layout: 'vertical', gap: 8, padding: 14, fill: sel ? C.primaryLight : C.card, cornerRadius: 12, stroke: sel ? C.primary : C.border, strokeWeight: sel ? 2 : 1, sizingH: 'fill' }, [
  F('l1', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [T(tema, { size: 14, weight: 700, lh: 20, fillW: true }), Badge(badge)]),
  T(quem, { size: 12, color: C.slate, lh: 16 }),
  F('l3', { layout: 'horizontal', gap: 8, crossAlign: 'center' }, [F('pz', { layout: 'horizontal', gap: 4, padding: [3, 8, 3, 8], crossAlign: 'center', fill: prazo.urgent ? C.warningSurface : C.muted, cornerRadius: 999 }, [Icon('clock', 12, prazo.urgent ? C.warningStrong : C.slate), T(prazo.t, { size: 11, weight: 600, color: prazo.urgent ? C.warningStrong : C.slate, lh: 14 })]), T(chars, { size: 11, color: C.slate, lh: 14 })]),
]);

const span = (t, kind) => F('s', { layout: 'horizontal', padding: [1, 3, 1, 3], cornerRadius: 4, fill: kind === 'add' ? C.successSurface : kind === 'del' ? C.criticalSurface : 'none' }, [T(t, { size: 15, lh: 24, color: kind === 'add' ? C.successStrong : kind === 'del' ? C.criticalStrong : C.fg, weight: kind ? 600 : 400 })]);
const plain = txt => { const w = txt.split(' '); const out = []; for (let i = 0; i < w.length; i += 3) out.push(span(w.slice(i, i + 3).join(' ') + ' ')); return out; };
const diff = () => F('diff', { layout: 'horizontal', gap: 0, wrap: true, crossAlign: 'center', sizingH: 'fill' }, [
  ...plain('A ministração trata de construir a vida sobre a rocha. A'), span('bencao', 'del'), span('bênção', 'add'), ...plain('de Deus alcança quem ouve a Palavra e a pratica, como Jesus ensina em'), span('Mateus 7:24-27', 'add'), ...plain('. O sábio edifica a sua casa na rocha: quando vêm a chuva e os ventos, ela permanece firme. A'), span('oracao', 'del'), span('oração', 'add'), ...plain('e a obediência são o alicerce.'),
]);

const tabs = () => F('abas', { layout: 'horizontal', gap: 4, sizingH: 'fill', stroke: C.border, strokeWeight: 0, strokeSides: [0, 0, 1, 0] }, [['Texto', false], ['Mudanças', true], ['Folha A4', false]].map(([l, on]) =>
  F('aba/' + l, { layout: 'horizontal', gap: 8, padding: [0, 16, 0, 16], crossAlign: 'center', stroke: on ? C.primary : 'none', strokeWeight: on ? 0 : 0, strokeSides: [0, 0, 3, 0] }, [T(l, { size: 14, weight: on ? 700 : 500, color: on ? C.primary : C.slate }), ...(on ? [F('d', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.primary, cornerRadius: 9 }, [T('4', { size: 11, weight: 700, color: C.white, lh: 14, align: 'center' })], { w: 18, h: 18 })] : [])], { h: 44 })));

const check = (t, st) => F('ck/' + t.slice(0, 12), { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [
  F('b', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 6, fill: st ? C.successStrong : C.card, stroke: st ? 'none' : C.inputBorder, strokeWeight: st ? 0 : 1.5 }, st ? [Icon('check', 14, C.white, 3)] : [], { w: 22, h: 22 }), T(t, { size: 13, fillW: true, lh: 18 })]);

const rail = () => F('trilho', { layout: 'vertical', gap: 16 }, [
  Card('conferencia', [T('Conferência do revisor', { size: 15, weight: 700 }), check('Ortografia e acentuação pt-BR', true), check('Coerência da palavra', true), check('Agenda e avisos atualizados', true), check('Enquadramento A4 (2.140 / 3.400)', false)], { w: 300, gap: 12 }),
  Card('comentar', [F('h', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [Icon('msg', 18, C.primary), T('Comentários (1)', { size: 15, weight: 700, fillW: true })]),
    F('c1', { layout: 'vertical', gap: 4, padding: 12, fill: C.muted, cornerRadius: 10, sizingH: 'fill' }, [T('“Edificando sobre a Rocha”', { size: 12, color: C.slate, lh: 16, fillW: true }), T('Citar a referência bíblica completa no título.', { size: 13, lh: 18, fillW: true }), T('Você · resolvido pelo escriba', { size: 11, color: C.successStrong, weight: 600, lh: 14 })]),
    Field('Trecho (opcional)', { placeholder: 'Selecione no texto ou digite', trailing: T('Usar seleção', { size: 12, weight: 600, color: C.primary }) }),
    Field('Comentário', { area: true, h: 80, placeholder: 'Escreva para o escriba', required: true }), Btn('Adicionar comentário', { kind: 'outline', small: true })], { w: 300, gap: 12 }),
]);

const work = () => F('trabalho', { layout: 'vertical', gap: 16, sizingH: 'fill' }, [
  Card('cabecalho', [F('l1', { layout: 'horizontal', gap: 12, crossAlign: 'center', sizingH: 'fill' }, [T('Edificando sobre a Rocha', { size: 20, weight: 800, lh: 28, fillW: true }), Badge('review')]),
    T('Pastor Marcos · Mateus 7:24-27 · Culto de 22/11/2026 · Escriba Voluntário · 2º envio hoje às 18:42', { size: 13, color: C.slate, lh: 18, fillW: true })], { fillW: true, gap: 6 }),
  F('corpo', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [
    Card('area-texto', [tabs(), F('leg', { layout: 'horizontal', gap: 12, crossAlign: 'center', sizingH: 'fill' }, [T('Comparado ao envio de 15/11', { size: 13, weight: 600, color: C.slate, fillW: true }), F('l1', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [R('d', 12, 12, C.criticalSurface, 3, { stroke: C.criticalBorder, strokeWeight: 1 }), T('removido', { size: 12, color: C.slate })]), F('l2', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [R('d', 12, 12, C.successSurface, 3, { stroke: C.successBorder, strokeWeight: 1 }), T('acrescentado', { size: 12, color: C.slate })])]), diff(),
      F('camposAlt', { layout: 'horizontal', gap: 8, padding: 12, fill: C.muted, cornerRadius: 10, sizingH: 'fill', crossAlign: 'center' }, [Icon('check', 16, C.slate), T('Campos alterados: Texto lido, Direcionamento para a célula.', { size: 13, color: C.slate, fillW: true })])], { fillW: true, gap: 16, padding: 20 }),
    rail(),
  ]),
  F('decisao', { layout: 'horizontal', gap: 12, padding: [14, 20, 14, 20], crossAlign: 'center', fill: C.card, cornerRadius: 12, stroke: C.border, strokeWeight: 1, effects: SHADOW, sizingH: 'fill' }, [
    F('n', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [Icon('alert', 16, C.slate), T('Devolver exige uma justificativa com pelo menos 5 caracteres.', { size: 13, color: C.slate, fillW: true })]),
    Btn('Devolver com ajustes', { kind: 'danger' }), Btn('Aprovar resumo', { kind: 'success', icon: 'check' }),
  ]),
]);

const desktop = Shell('Fila de Revisão', 'Operação', 'Fila de Revisão', [
  F('filtros', { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [Chip('Todos · 3', { active: true }), Chip('Submetidos · 2'), Chip('Em revisão · 1'), F('sp', { sizingH: 'fill' }, [], { w: 1, h: 1 }), F('busca', { layout: 'horizontal', gap: 8, padding: [0, 12, 0, 12], crossAlign: 'center', fill: C.card, cornerRadius: 8, stroke: C.inputBorder, strokeWeight: 1 }, [Icon('search', 18, C.mutedFg), T('Buscar por tema, texto bíblico ou escriba', { size: 14, color: C.mutedFg })], { w: 360, h: 44 })]),
  F('md', { layout: 'horizontal', gap: 20, sizingH: 'fill' }, [
    F('lista', { layout: 'vertical', gap: 10 }, [item('Edificando sobre a Rocha', 'Escriba Voluntário · 2º envio', 'review', { t: 'domingo em 2 dias', urgent: true }, true, '2.140 caracteres'), item('Passa este Jordão', 'Marina Colega · 1º envio', 'submitted', { t: 'domingo em 2 dias', urgent: true }, false, '2.874 caracteres'), item('A vitória da fé', 'Carlos Lima · 1º envio', 'submitted', { t: 'domingo em 9 dias' }, false, '3.012 caracteres')], { w: 300 }),
    work(),
  ]),
], { h: 1160 });

const mobile = F('revisao/mobile', { layout: 'vertical', fill: C.bg, clip: true }, [
  F('topo', { layout: 'horizontal', padding: [0, 8, 0, 8], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [F('m', { layout: 'horizontal', gap: 4, crossAlign: 'center' }, [F('bk', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center' }, [Icon('chevR', 22, C.slate)], { w: 44, h: 44 }), F('tt', { layout: 'vertical' }, [T('Edificando sobre a Rocha', { size: 15, weight: 700, lh: 20 }), T('2º envio · domingo em 2 dias', { size: 11, color: C.slate, lh: 14 })])]), Badge('review')], { h: 60 }),
  F('abas', { layout: 'horizontal', gap: 4, padding: 8, fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [['Texto', false], ['Mudanças', true], ['Conferir', false]].map(([l, on]) => F('a/' + l, { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', sizingH: 'fill', fill: on ? C.primaryLight : 'none', cornerRadius: 8 }, [T(l, { size: 13, weight: on ? 700 : 500, color: on ? C.primary : C.slate })], { h: 44 }))),
  F('corpo', { layout: 'vertical', gap: 14, padding: 16, sizingH: 'fill', sizingV: 'fill' }, [
    T('4 alterações desde o envio de 15/11', { size: 13, weight: 600, color: C.slate }),
    F('txt', { layout: 'vertical', gap: 6, padding: 14, fill: C.card, cornerRadius: 12, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [
      F('dd', { layout: 'horizontal', gap: 0, wrap: true, sizingH: 'fill' }, [...plain('…sobre a rocha. A'), span('bencao', 'del'), span('bênção', 'add'), ...plain('de Deus alcança quem ouve a Palavra e a pratica, como Jesus ensina em'), span('Mateus 7:24-27', 'add')])]),
    F('cm', { layout: 'horizontal', gap: 10, padding: 12, crossAlign: 'center', fill: C.card, cornerRadius: 12, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [Icon('msg', 20, C.primary), T('1 comentário · resolvido pelo escriba', { size: 13, fillW: true }), Icon('chevR', 18, C.slate)]),
  ]),
  F('decisao', { layout: 'horizontal', gap: 10, padding: [10, 16, 14, 16], fill: C.card, stroke: C.border, strokeWeight: 1, strokeSides: [1, 0, 0, 0], sizingH: 'fill' }, [Btn('Devolver', { kind: 'danger', touch: true, fillW: true }), Btn('Aprovar', { kind: 'success', touch: true, icon: 'check', fillW: true })]),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Fila de revisão' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });
  await build(fc, desktop, 0, 0);
  await build(fc, mobile, 1520, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\04-revisao.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s04.png', { maxSize: 1900 });
});
process.exit(0);

