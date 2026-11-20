import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon } from './kit.mjs';

const D = { bg: '#090d16', card: '#0f172a', text: '#f8fafc', muted: '#94a3b8', border: '#94a3b8', blue: '#2563eb', blueHi: '#3b82f6', errBg: '#2a0f12', errBd: '#f87171', errTx: '#fecaca' };

const dField = (label, o = {}) => F('field/' + label, { layout: 'vertical', gap: 8, sizingH: 'fill' }, [
  T(label, { size: 14, weight: 600, color: D.text, name: 'label' }),
  F('input', { layout: 'horizontal', gap: 10, padding: [0, 14, 0, 14], crossAlign: 'center', fill: '#0b1220', cornerRadius: 10, stroke: o.error ? D.errBd : o.focus ? D.blueHi : D.border, strokeWeight: o.error || o.focus ? 2 : 1, sizingH: 'fill',
    ...(o.focus ? { effects: [{ type: 'dropShadow', color: '#3b82f655', offset: [0, 0], radius: 5 }] } : {}) }, [
    Icon(o.icon, 18, D.muted), T(o.value ?? o.placeholder, { size: 15, color: o.value ? D.text : D.muted, fillW: true, name: 'value' }),
    ...(o.reveal ? [T('Mostrar', { size: 13, weight: 600, color: '#93c5fd' })] : []),
  ], { h: o.h ?? 48 }),
  ...(o.error ? [F('err', { layout: 'horizontal', gap: 6, crossAlign: 'center' }, [Icon('alert', 16, D.errTx), T(o.error, { size: 12, weight: 500, color: D.errTx, lh: 16 })])] : []),
]);

const banner = msg => F('banner', { layout: 'horizontal', gap: 10, padding: 12, crossAlign: 'center', fill: D.errBg, cornerRadius: 10, stroke: D.errBd, strokeWeight: 1, sizingH: 'fill' }, [
  Icon('alert', 20, D.errTx), T(msg, { size: 13, weight: 500, color: D.errTx, fillW: true, lh: 18 }),
]);

const formCard = (o = {}) => F('card-login', { layout: 'vertical', gap: 20, padding: o.pad ?? 36, fill: D.card, cornerRadius: 20, stroke: '#ffffff26', strokeWeight: 1, effects: [{ type: 'dropShadow', color: '#00000066', offset: [0, 24], radius: 48 }], ...(o.fillW ? { sizingH: 'fill' } : {}) }, [
  F('head', { layout: 'vertical', gap: 6 }, [
    F('logo-row', { layout: 'horizontal', gap: 12, crossAlign: 'center' }, [
      F('logo', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.primary, cornerRadius: 12 }, [Icon('scroll', 24, C.white)], { w: 44, h: 44 }),
      F('wm', { layout: 'vertical', gap: 0 }, [F('w', { layout: 'horizontal' }, [T('SYS', { size: 16, weight: 800, color: '#60a5fa', lh: 22 }), T('-OUTLINE', { size: 16, weight: 800, color: '#4ade80', lh: 22 })]), T('Escriba da Palavra', { size: 12, color: D.muted, lh: 16 })]),
    ]),
    T('Acesso ao sistema', { size: 26, weight: 800, color: D.text, lh: 34 }),
    T('Entre para escrever ou revisar os resumos da ministração.', { size: 14, color: D.muted, lh: 20, w: o.textW ?? 380 }),
  ]),
  ...(o.error ? [banner('E-mail ou senha incorretos. Confira os dados e tente de novo.')] : []),
  dField('E-mail', { icon: 'mail', value: o.error ? 'revisor@igreja.org' : undefined, placeholder: 'nome@igreja.org', focus: !o.error, error: undefined }),
  dField('Senha', { icon: 'lock', value: o.error ? '••••••••••' : undefined, placeholder: 'Digite sua senha', reveal: true }),
  F('cta', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: D.blue, cornerRadius: 10, sizingH: 'fill' }, [T('Entrar no painel', { size: 15, weight: 700, color: C.white })], { h: 50 }),
  F('nota', { layout: 'horizontal', gap: 8, crossAlign: 'center', sizingH: 'fill' }, [Icon('lock', 14, D.muted), T('Acesso restrito a usuários autorizados. Operações auditadas.', { size: 12, color: D.muted, lh: 16, fillW: true })]),
], o.fillW ? {} : { w: 440 });

const hero = (h) => F('hero', { layout: 'vertical', gap: 28, padding: [64, 72, 64, 72], mainAlign: 'center', fills: [{ type: 'linearGradient', stops: ['#172554', '#090d16'], from: [0, 0], to: [1, 1] }], sizingV: 'fill' }, [
  T('A palavra de domingo,\nna mesa da célula.', { size: 44, weight: 800, color: C.white, lh: 54, w: 560 }),
  T('Registre a mensagem, revise com cuidado e entregue em uma única folha A4 para os líderes.', { size: 18, color: '#cbd5e1', lh: 28, w: 520 }),
  F('pontos', { layout: 'vertical', gap: 14 }, [['doc', 'Resumo estruturado com limite que cabe em uma página'], ['check', 'Revisão com comentários e comparação entre envios'], ['cal', 'Escalas e prazos claros para cada escriba']].map(([ic, tx]) =>
    F('p/' + tx.slice(0, 12), { layout: 'horizontal', gap: 12, crossAlign: 'center' }, [
      F('ic', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: '#ffffff1a', cornerRadius: 8 }, [Icon(ic, 18, '#93c5fd')], { w: 36, h: 36 }), T(tx, { size: 15, color: '#e2e8f0', lh: 22 })]))),
], { w: 880 });

const desktop = err => F('login/desktop' + (err ? '-erro' : ''), { layout: 'horizontal', fill: D.bg, clip: true }, [
  hero(),
  F('lado', { layout: 'vertical', mainAlign: 'center', crossAlign: 'center', padding: 40, sizingH: 'fill', sizingV: 'fill' }, [formCard({ error: err })]),
], { w: 1440, h: 900 });

const mobile = F('login/mobile', { layout: 'vertical', gap: 24, padding: [32, 20, 24, 20], fills: [{ type: 'linearGradient', stops: ['#172554', '#090d16'], from: [0, 0], to: [0, 1] }], clip: true }, [
  F('topo', { layout: 'vertical', gap: 8 }, [T('A palavra de domingo, na mesa da célula.', { size: 24, weight: 800, color: C.white, lh: 32, w: 340 })]),
  formCard({ fillW: true, pad: 24, textW: 300, error: false }),
  T('SYSTRAT Inteligência em Gestão e Tecnologia', { size: 11, color: D.muted, lh: 16, align: 'center', w: 350 }),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Login' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#1e293b' } });
  await build(fc, desktop(false), 0, 0);
  await build(fc, desktop(true), 1520, 0);
  await build(fc, mobile, 3040, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\01-login.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s01.png', { maxSize: 1900 });
});
process.exit(0);

