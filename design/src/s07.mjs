import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Card, Field, Avatar, Shell } from './kit.mjs';

const col = (t, w, right) => T(t, { size: 12, weight: 700, color: C.slate, ls: 0.4, lh: 16, w, align: right ? 'right' : 'left' });
const row = (tema, texto, quem, data, badge) => F('linha/' + tema.slice(0, 20), { layout: 'horizontal', gap: 16, padding: [14, 20, 14, 20], crossAlign: 'center', sizingH: 'fill', stroke: C.border, strokeWeight: 0, strokeSides: [1, 0, 0, 0] }, [
  F('tema', { layout: 'vertical', gap: 2 }, [T(tema, { size: 14, weight: 700, lh: 20 }), T(texto, { size: 12, color: C.slate, lh: 16 })], { w: 300 }),
  T(quem, { size: 13, w: 170 }), T(data, { size: 13, w: 110 }), F('st', { layout: 'horizontal' }, [Badge(badge)], { w: 130 }),
  F('ac', { layout: 'horizontal', gap: 8, mainAlign: 'max', sizingH: 'fill' }, [Btn('Copiar para WhatsApp', { kind: 'outline', small: true, icon: 'send' }), Btn('Abrir', { kind: 'ghost', small: true })]),
]);

const tabela = () => Card('tabela', [
  F('cab', { layout: 'horizontal', gap: 16, padding: [10, 20, 10, 20], fill: C.muted, cornerRadius: 8, sizingH: 'fill' }, [col('TEMA E TEXTO LIDO', 300), col('MINISTRANTE', 170), col('CULTO', 110), col('STATUS', 130), T('AÇÕES', { size: 12, weight: 700, color: C.slate, ls: 0.4, lh: 16, align: 'right', fillW: true })]),
  row('Edificando sobre a Rocha', 'Mateus 7:24-27', 'Pastor Marcos', '15/11/2026', 'approved'),
  row('Passa este Jordão', 'Josué 1:1-9', 'Pastora Kelli', '08/11/2026', 'approved'),
  row('O poder da oração perseverante', 'Lucas 18:1-8', 'Pastor Marcos', '01/11/2026', 'approved'),
  row('A vitória da fé', 'Hebreus 11:1-6', 'Pastor Lucas', '25/10/2026', 'approved'),
  row('Fé que move montanhas', 'Marcos 11:22-24', 'Pastora Kelli', '18/10/2026', 'approved'),
  F('pag', { layout: 'horizontal', mainAlign: 'spaceBetween', crossAlign: 'center', padding: [14, 20, 6, 20], sizingH: 'fill' }, [T('Mostrando 1–5 de 42 resumos', { size: 13, color: C.slate }), F('p', { layout: 'horizontal', gap: 6 }, [Btn('Anterior', { kind: 'outline', small: true }), Btn('Próxima', { kind: 'outline', small: true })])]),
], { fillW: true, padding: 12, gap: 0 });

const desktop = Shell('Biblioteca de Resumos', 'Acervo & Células', 'Biblioteca de Resumos', [
  F('topo', { layout: 'vertical', gap: 14, sizingH: 'fill' }, [
    F('t', { layout: 'vertical', gap: 2 }, [T('Biblioteca de resumos', { size: 24, weight: 800, lh: 32 }), T('Todas as palavras aprovadas, prontas para reutilizar nas células.', { size: 14, color: C.slate, lh: 20 })]),
    F('busca', { layout: 'horizontal', gap: 10, padding: [0, 16, 0, 16], crossAlign: 'center', fill: C.card, cornerRadius: 10, stroke: C.inputBorder, strokeWeight: 1, sizingH: 'fill' }, [Icon('search', 20, C.mutedFg), T('Buscar por tema, texto bíblico, ministrante ou trecho do resumo', { size: 15, color: C.mutedFg, fillW: true })], { h: 52 }),
    F('filtros', { layout: 'horizontal', gap: 10, crossAlign: 'center', sizingH: 'fill' }, [Chip('Todos os anos', { active: true }), Chip('Minha unidade', { icon: 'home' }), Chip('Ministrante'), Chip('Livro bíblico'), Chip('Série'), F('sp', { sizingH: 'fill' }, [], { w: 1, h: 1 }), T('42 resumos', { size: 13, weight: 600, color: C.slate })]),
  ]),
  tabela(),
], { h: 960 });

const cartao = (tema, texto, quem, data) => Card('card/' + tema.slice(0, 16), [
  F('l1', { layout: 'horizontal', crossAlign: 'center', sizingH: 'fill' }, [F('t', { layout: 'vertical', gap: 0, sizingH: 'fill' }, [T(tema, { size: 15, weight: 700, lh: 22, fillW: true }), T(texto, { size: 12, color: C.slate, lh: 16 })]), Badge('approved')]),
  T(quem + ' · ' + data, { size: 13, color: C.slate }),
  F('ac', { layout: 'horizontal', gap: 8, sizingH: 'fill' }, [Btn('Copiar WhatsApp', { kind: 'outline', icon: 'send', touch: true, fillW: true }), Btn('Abrir', { touch: true })]),
], { gap: 10, padding: 16, fillW: true });
const mobile = F('biblioteca/mobile', { layout: 'vertical', fill: C.bg, clip: true }, [
  F('topo', { layout: 'horizontal', padding: [0, 16, 0, 16], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [T('Biblioteca', { size: 17, weight: 700 }), Avatar('EV', 36)], { h: 60 }),
  F('corpo', { layout: 'vertical', gap: 12, padding: 16, sizingH: 'fill', sizingV: 'fill' }, [
    F('busca', { layout: 'horizontal', gap: 8, padding: [0, 14, 0, 14], crossAlign: 'center', fill: C.card, cornerRadius: 10, stroke: C.inputBorder, strokeWeight: 1, sizingH: 'fill' }, [Icon('search', 20, C.mutedFg), T('Buscar resumo', { size: 15, color: C.mutedFg })], { h: 48 }),
    F('ch', { layout: 'horizontal', gap: 8, sizingH: 'fill', wrap: true }, [Chip('Todos', { active: true }), Chip('Ministrante'), Chip('Livro')]),
    cartao('Edificando sobre a Rocha', 'Mateus 7:24-27', 'Pastor Marcos', '15/11'),
    cartao('Passa este Jordão', 'Josué 1:1-9', 'Pastora Kelli', '08/11'),
  ]),
  F('barra-inferior', { layout: 'horizontal', mainAlign: 'spaceAround', crossAlign: 'center', fill: C.card, stroke: C.border, strokeWeight: 1, strokeSides: [1, 0, 0, 0], sizingH: 'fill' }, [['home', 'Início', false], ['doc', 'Editor', false], ['cal', 'Escalas', false], ['book', 'Biblioteca', true]].map(([ic, l, on]) => F('tab/' + l, { layout: 'vertical', gap: 2, mainAlign: 'center', crossAlign: 'center' }, [Icon(ic, 22, on ? C.primary : C.slate), T(l, { size: 11, weight: on ? 700 : 500, color: on ? C.primary : C.slate, lh: 14 })], { w: 80, h: 56 })), { h: 64 }),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Biblioteca' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });
  await build(fc, desktop, 0, 0);
  await build(fc, mobile, 1520, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\07-biblioteca.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s07.png', { maxSize: 1900 });
});
process.exit(0);
