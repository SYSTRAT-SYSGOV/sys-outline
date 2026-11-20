import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Card, Field, Avatar, Shell, ProgressBar, SHADOW } from './kit.mjs';

const num = (n, t) => F('titulo-secao', { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [
  F('n', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.primaryLight, cornerRadius: 14 }, [T(String(n), { size: 13, weight: 800, color: C.primary, lh: 16, align: 'center' })], { w: 28, h: 28 }),
  T(t, { size: 16, weight: 700, lh: 24 }),
]);
const tool = (ic, label) => F('ferr/' + label, { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 6, fill: C.card, stroke: C.border, strokeWeight: 1 }, [Icon(ic, 16, C.slate)], { w: 36, h: 36 });

const actionBar = () => F('barra-acoes', { layout: 'horizontal', gap: 16, padding: [14, 20, 14, 20], crossAlign: 'center', fill: C.card, cornerRadius: 12, stroke: C.border, strokeWeight: 1, effects: SHADOW, sizingH: 'fill' }, [
  F('info', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [
    F('t', { layout: 'horizontal', gap: 10, crossAlign: 'center' }, [T('Edificando sobre a Rocha', { size: 17, weight: 700, lh: 24 }), Badge('rejected')]),
    F('salvo', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [Icon('save', 14, C.successStrong), T('Cópia local salva às 19:04 · ainda não enviado', { size: 12, color: C.slate, lh: 16 })]),
  ]),
  Btn('Salvar rascunho', { kind: 'outline', icon: 'save' }), Btn('Pré-visualizar A4', { kind: 'outline', icon: 'eye' }), Btn('Reenviar após ajustes', { icon: 'send' }),
]);

const returned = () => F('devolvido', { layout: 'horizontal', gap: 14, padding: 16, fill: C.criticalSurface, cornerRadius: 12, stroke: C.criticalBorder, strokeWeight: 1, sizingH: 'fill' }, [
  F('ic', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.criticalStrong, cornerRadius: 18 }, [Icon('alert', 20, C.white)], { w: 36, h: 36 }),
  F('txt', { layout: 'vertical', gap: 4, sizingH: 'fill' }, [T('Devolvido para ajustes por Revisor Voluntário', { size: 15, weight: 700, color: C.criticalStrong, lh: 22 }), T('Ajustar a ortografia e citar o versículo completo. Depois de corrigir, reenvie — o revisor verá o que mudou desde o envio anterior.', { size: 14, lh: 20, fillW: true })]),
  Btn('Ver 1 comentário', { kind: 'outline', small: true }),
]);

const identificacao = () => Card('identificacao', [num(1, 'Identificação'),
  Field('Tema da Palavra', { required: true, value: 'Edificando sobre a Rocha', helper: 'Aparece em destaque no topo da folha A4.' }),
  F('l2', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [Field('Quem ministrou', { required: true, value: 'Pastor Marcos' }), Field('Data do culto', { required: true, value: '22/11/2026', icon: 'cal' }), Field('Texto lido', { required: true, value: 'Mateus 7:24-27' })]),
], { fillW: true });

const direc = () => Card('direcionamento', [num(2, 'Direcionamento e orientações'),
  F('l', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [
    Field('Direcionamento para a célula', { required: true, area: true, h: 96, value: 'Conduzir um momento de louvor e, em seguida, conversar sobre onde cada um está construindo a vida.' }),
    Field('Orientações para os líderes', { required: true, area: true, h: 96, value: 'Reforçar a importância de ouvir e praticar a Palavra. Avisar sobre a ceia de domingo.' }),
  ]),
], { fillW: true });

const resumo = () => Card('resumo', [num(3, 'Palavra e resumo'),
  F('tools', { layout: 'horizontal', gap: 6, crossAlign: 'center', sizingH: 'fill' }, [tool('menu', 'Lista'), tool('doc', 'Citação'), tool('x', 'Limpar'), F('sp', { sizingH: 'fill' }, [], { w: 1, h: 1 }),
    F('corretor', { layout: 'horizontal', gap: 8, padding: [0, 12, 0, 12], crossAlign: 'center', fill: C.warningSurface, cornerRadius: 8, stroke: C.warningBorder, strokeWeight: 1 }, [Icon('check', 16, C.warningStrong), T('Corretor pt-BR', { size: 13, weight: 600, color: C.warningStrong }), F('n', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.warningStrong, cornerRadius: 10 }, [T('2', { size: 11, weight: 700, color: C.white, lh: 14, align: 'center' })], { w: 20, h: 20 })], { h: 36 })]),
  F('texto', { layout: 'vertical', gap: 10, padding: 16, fill: C.card, cornerRadius: 8, stroke: C.inputBorder, strokeWeight: 1, sizingH: 'fill' }, [
    T('A ministração trata de construir a vida sobre a rocha. A bencao de Deus alcança quem ouve a Palavra e a pratica, como Jesus ensina em Mateus 7:24-27.', { size: 15, lh: 24, fillW: true }),
    T('O sábio edifica a sua casa na rocha: quando vêm a chuva, os rios e os ventos, ela permanece firme. A oracao e a obediência são o alicerce.', { size: 15, lh: 24, fillW: true }),
  ]),
  F('contador', { layout: 'vertical', gap: 6, sizingH: 'fill' }, [F('cl', { layout: 'horizontal', mainAlign: 'spaceBetween', sizingH: 'fill' }, [T('Cabe em uma folha A4', { size: 12, weight: 600, color: C.successStrong }), T('2.140 / 3.400 caracteres', { size: 13, weight: 700, color: C.slate })]), ProgressBar(63, C.successStrong, 1064)]),
  F('sugestoes', { layout: 'vertical', gap: 8, padding: 12, fill: C.warningSurface, cornerRadius: 8, stroke: C.warningBorder, strokeWeight: 1, sizingH: 'fill' }, [
    T('Sugestões de correção (pt-BR)', { size: 13, weight: 700, color: C.warningStrong }),
    ...[['bencao', 'bênção'], ['oracao', 'oração']].map(([a, b]) => F('s/' + a, { layout: 'horizontal', gap: 10, crossAlign: 'center', padding: [6, 10, 6, 10], fill: C.card, cornerRadius: 8, sizingH: 'fill' }, [T(a, { size: 14, color: C.criticalStrong, w: 90 }), Icon('chevR', 14, C.slate), T(b, { size: 14, weight: 700, color: C.successStrong, fillW: true }), Btn('Aplicar', { kind: 'outline', small: true })])),
  ]),
], { fillW: true });

const outros = () => Card('perguntas-avisos', [num(4, 'Perguntas e avisos'),
  F('l', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [
    F('perg', { layout: 'vertical', gap: 8, sizingH: 'fill' }, [T('Perguntas de compartilhamento (2)', { size: 14, weight: 600 }), T('1. Em que área da sua vida você tem construído sobre a rocha?', { size: 13, color: C.slate, lh: 18, fillW: true }), T('2. O que impede você de praticar o que ouviu?', { size: 13, color: C.slate, lh: 18, fillW: true })]),
    F('av', { layout: 'vertical', gap: 8, sizingH: 'fill' }, [T('Avisos da semana (1 de 8)', { size: 14, weight: 600 }), F('a1', { layout: 'horizontal', gap: 8, padding: 10, fill: C.primaryLight, cornerRadius: 8, crossAlign: 'center', sizingH: 'fill' }, [Badge('submitted'), T('Culto de Ceia · domingo, 19h', { size: 13, fillW: true })]), Btn('Adicionar aviso', { kind: 'ghost', icon: 'plus', small: true })]),
  ]),
], { fillW: true });

const sheet = () => F('folha-A4', { layout: 'vertical', fill: C.white, stroke: C.border, strokeWeight: 1, effects: SHADOW_SHEET, clip: true }, [
  F('faixa', { layout: 'vertical', gap: 2, padding: [12, 14, 12, 14], fill: C.primaryActive, sizingH: 'fill' }, [T('CASA DE ISRAEL · CATEDRAL', { size: 8, weight: 800, color: '#fde68a', ls: 0.6, lh: 10 }), T('Mensagem para as células', { size: 11, weight: 700, color: C.white, lh: 14 })]),
  F('corpo', { layout: 'vertical', gap: 8, padding: 14, sizingH: 'fill' }, [
    T('Edificando sobre a Rocha', { size: 13, weight: 800, lh: 16, fillW: true }), T('Pastor Marcos · 22/11/2026 · Mateus 7:24-27', { size: 8, color: C.slate, lh: 11, fillW: true }),
    ...[100, 96, 100, 92, 100, 88, 100, 95, 60].map((p, i) => R('linha' + i, Math.round(212 * p / 100), 5, '#cbd5e1', 2)),
    R('sep', 212, 1, C.border, 0), T('Perguntas', { size: 8, weight: 700, lh: 11 }), R('p1', 190, 4, '#e2e8f0', 2), R('p2', 160, 4, '#e2e8f0', 2),
  ]),
  F('rodape', { layout: 'horizontal', padding: [8, 14, 8, 14], sizingH: 'fill', mainAlign: 'center' }, [T('Casa de Israel · Rua Exemplo, 100', { size: 7, color: C.mutedFg, lh: 10 })]),
], { w: 240, h: 340 });
const SHADOW_SHEET = [{ type: 'dropShadow', color: '#0f172a26', offset: [0, 6], radius: 16 }];

const rail = () => F('abaixo', { layout: 'horizontal', gap: 20, sizingH: 'fill' }, [
  Card('pronto', [T('Pronto para enviar?', { size: 15, weight: 700 }),
    ...[['Tema, ministrante e texto lido', true], ['Resumo dentro do limite (2.140 / 3.400)', true], ['Pelo menos um aviso da semana', true], ['Correção ortográfica (2 pendências)', false], ['Comentário da revisão resolvido (1 aberto)', false]].map(([t, ok]) =>
      F('ck/' + t.slice(0, 14), { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [F('b', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 10, fill: ok ? C.successStrong : C.warningSurface, stroke: ok ? 'none' : C.warningStrong, strokeWeight: ok ? 0 : 1.5 }, [Icon(ok ? 'check' : 'alert', 12, ok ? C.white : C.warningStrong, 2.5)], { w: 20, h: 20 }), T(t, { size: 13, color: ok ? C.fg : C.warningStrong, weight: ok ? 400 : 600, fillW: true, lh: 18 })])),
  ], { fillW: true, gap: 10 }),
  Card('comentarios', [F('h', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [Icon('msg', 18, C.warningStrong), T('Comentários da revisão', { size: 15, weight: 700, fillW: true }), T('1 aberto', { size: 12, weight: 600, color: C.warningStrong })]),
    F('c1', { layout: 'vertical', gap: 6, padding: 12, fill: C.muted, cornerRadius: 10, sizingH: 'fill' }, [T('“Edificando sobre a Rocha”', { size: 12, color: C.slate, lh: 16, fillW: true }), T('Citar a referência bíblica completa no título.', { size: 14, lh: 20, fillW: true }), Btn('Marcar como resolvido', { kind: 'outline', small: true })]),
  ], { fillW: true, gap: 12 }),
]);

const desktop = Shell('Editor da Mensagem', 'Operação', 'Editor da Mensagem', [
  actionBar(), returned(),
  F('form', { layout: 'vertical', gap: 20, sizingH: 'fill' }, [identificacao(), direc(), resumo(), outros(), rail()]),
], { h: 1790 });

// --- Celular ---
const tab = (l, on, badge) => F('aba/' + l, { layout: 'horizontal', gap: 6, mainAlign: 'center', crossAlign: 'center', sizingH: 'fill', fill: on ? C.primaryLight : 'none', cornerRadius: 8 }, [T(l, { size: 13, weight: on ? 700 : 500, color: on ? C.primary : C.slate }), ...(badge ? [F('b', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.warningStrong, cornerRadius: 9 }, [T(badge, { size: 11, weight: 700, color: C.white, lh: 14, align: 'center' })], { w: 18, h: 18 })] : [])], { h: 44 });
const mobile = F('editor/mobile', { layout: 'vertical', fill: C.bg, clip: true }, [
  F('topo', { layout: 'horizontal', padding: [0, 8, 0, 8], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [
    F('m', { layout: 'horizontal', gap: 4, crossAlign: 'center' }, [F('bk', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center' }, [Icon('chevR', 22, C.slate)], { w: 44, h: 44 }), F('tt', { layout: 'vertical', gap: 0 }, [T('Edificando sobre a Rocha', { size: 15, weight: 700, lh: 20 }), T('Cópia local salva às 19:04', { size: 11, color: C.slate, lh: 14 })])]), Badge('rejected')], { h: 60 }),
  F('abas', { layout: 'horizontal', gap: 4, padding: 8, fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [tab('Escrever', true), tab('Prévia', false), tab('Revisão', false, '1')]),
  F('corpo', { layout: 'vertical', gap: 14, padding: 16, sizingH: 'fill', sizingV: 'fill' }, [
    F('dev', { layout: 'horizontal', gap: 10, padding: 12, crossAlign: 'center', fill: C.criticalSurface, cornerRadius: 12, stroke: C.criticalBorder, strokeWeight: 1, sizingH: 'fill' }, [Icon('alert', 20, C.criticalStrong), T('Devolvido para ajustes. Veja o comentário na aba Revisão.', { size: 13, weight: 600, color: C.criticalStrong, fillW: true, lh: 18 })]),
    Field('Tema da Palavra', { required: true, value: 'Edificando sobre a Rocha', touch: true }),
    Field('Texto lido', { required: true, error: 'Informe o texto lido (ex.: Mateus 7:24-27).', touch: true }),
    F('res', { layout: 'vertical', gap: 6, sizingH: 'fill' }, [T('Resumo da ministração', { size: 14, weight: 600 }), F('t', { layout: 'vertical', padding: 14, fill: C.card, cornerRadius: 8, stroke: C.inputBorder, strokeWeight: 1, sizingH: 'fill' }, [T('A ministração trata de construir a vida sobre a rocha. A bencao de Deus alcança quem ouve a Palavra e a pratica…', { size: 15, lh: 24, fillW: true })], { h: 150 }),
      F('cl', { layout: 'horizontal', mainAlign: 'spaceBetween', sizingH: 'fill' }, [T('2 sugestões ortográficas', { size: 12, weight: 600, color: C.warningStrong }), T('2.140 / 3.400', { size: 12, weight: 700, color: C.slate })]), ProgressBar(63, C.successStrong, 358)]),
  ]),
  F('barra', { layout: 'horizontal', gap: 10, padding: [10, 16, 14, 16], crossAlign: 'center', fill: C.card, stroke: C.border, strokeWeight: 1, strokeSides: [1, 0, 0, 0], sizingH: 'fill' }, [Btn('Salvar', { kind: 'outline', touch: true, icon: 'save' }), Btn('Reenviar', { touch: true, icon: 'send', fillW: true })]),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Editor' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });
  await build(fc, desktop, 0, 0);
  await build(fc, mobile, 1520, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\03-editor.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s03.png', { maxSize: 2000 });
});
process.exit(0);



