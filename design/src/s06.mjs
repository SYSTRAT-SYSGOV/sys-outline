import { session, build, shot } from './ui.mjs';
import { C, F, T, R, Icon, Btn, Badge, Chip, Card, Field, Avatar, Shell } from './kit.mjs';

const sub = (label, on, ic) => F('sub/' + label, { layout: 'horizontal', gap: 10, padding: [0, 12, 0, 12], crossAlign: 'center', sizingH: 'fill', cornerRadius: 8, fill: on ? C.primaryLight : 'none', stroke: on ? C.primaryBorder : 'none', strokeWeight: on ? 1 : 0 }, [Icon(ic, 18, on ? C.primary : C.slate), T(label, { size: 14, weight: on ? 700 : 500, color: on ? C.primary : C.fg, fillW: true })], { h: 44 });
const switchRow = (label, help, on) => F('switch', { layout: 'horizontal', gap: 14, padding: 14, crossAlign: 'center', fill: on ? C.successSurface : C.muted, cornerRadius: 12, stroke: on ? C.successBorder : C.border, strokeWeight: 1, sizingH: 'fill' }, [
  F('txt', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T(label, { size: 14, weight: 700, lh: 20 }), T(help, { size: 12, color: C.slate, lh: 16, fillW: true })]),
  F('trilho', { layout: 'horizontal', padding: 3, crossAlign: 'center', mainAlign: on ? 'max' : 'min', fill: on ? C.successStrong : C.inputBorder, cornerRadius: 14 }, [R('bola', 22, 22, C.white, 11)], { w: 48, h: 28 }),
  T(on ? 'Ativado' : 'Desativado', { size: 13, weight: 700, color: on ? C.successStrong : C.slate }),
]);
const radio = (l, on) => F('rd/' + l, { layout: 'horizontal', gap: 10, padding: [0, 14, 0, 14], crossAlign: 'center', sizingH: 'fill', cornerRadius: 8, fill: on ? C.primaryLight : C.card, stroke: on ? C.primary : C.inputBorder, strokeWeight: on ? 2 : 1 }, [
  F('r', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', cornerRadius: 10, stroke: on ? C.primary : C.inputBorder, strokeWeight: 2, fill: C.card }, on ? [R('p', 8, 8, C.primary, 4)] : [], { w: 20, h: 20 }), T(l, { size: 14, weight: on ? 600 : 400 })], { h: 44 });

const smtp = () => Card('form-smtp', [
  F('h', { layout: 'vertical', gap: 4, sizingH: 'fill' }, [T('E-mail (SMTP)', { size: 20, weight: 800, lh: 28 }), T('Servidor usado para os lembretes de prazo e os avisos de escala recebida. Só o administrador geral vê e edita esta seção.', { size: 13, color: C.slate, lh: 18, fillW: true })]),
  F('ok', { layout: 'horizontal', gap: 10, padding: 12, crossAlign: 'center', fill: C.successSurface, cornerRadius: 10, stroke: C.successBorder, strokeWeight: 1, sizingH: 'fill' }, [Icon('check', 18, C.successStrong, 2.5), T('Envio ativo. Último teste bem-sucedido hoje às 19:12 para admin@escriba.com.', { size: 13, weight: 600, color: C.successStrong, fillW: true, lh: 18 })]),
  switchRow('Enviar e-mails pelo servidor SMTP', 'Desativado, as mensagens só são registradas no log do servidor.', true),
  F('l1', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [Field('Servidor SMTP', { required: true, value: 'smtp.igreja.org', helper: 'Ex.: smtp.seudominio.com' }), Field('Porta', { required: true, value: '587', w: 140 })]),
  F('seg', { layout: 'vertical', gap: 8, sizingH: 'fill' }, [T('Segurança da conexão', { size: 14, weight: 600 }), F('ops', { layout: 'horizontal', gap: 12, sizingH: 'fill' }, [radio('STARTTLS · porta 587', true), radio('SSL/TLS · porta 465', false)])]),
  Field('Usuário', { required: true, value: 'avisos@igreja.org', helper: 'Login do servidor SMTP.' }),
  Field('Senha', { value: '', placeholder: '••••••••••', icon: 'lock', trailing: T('Mostrar', { size: 12, weight: 600, color: C.primary }), badge: F('b', { layout: 'horizontal', gap: 4, padding: [2, 8, 2, 8], fill: C.successSurface, cornerRadius: 999 }, [Icon('check', 12, C.successStrong, 2.5), T('Senha definida', { size: 11, weight: 700, color: C.successStrong, lh: 14 })]), helper: 'Guardada criptografada e nunca exibida. Deixe em branco para manter a senha atual.' }),
  F('l2', { layout: 'horizontal', gap: 16, sizingH: 'fill' }, [Field('E-mail do remetente', { value: 'avisos@igreja.org', icon: 'mail' }), Field('Nome do remetente', { value: 'Escriba da Palavra' })]),
  F('acoes', { layout: 'horizontal', gap: 12, crossAlign: 'center', sizingH: 'fill' }, [Btn('Salvar alterações', { icon: 'save' }), Btn('Enviar e-mail de teste', { kind: 'outline', icon: 'mail' }), T('Configurações salvas.', { size: 13, weight: 600, color: C.successStrong, fillW: true })]),
], { fillW: true, gap: 18, padding: 28 });

const lateral = () => F('lateral', { layout: 'vertical', gap: 16 }, [
  Card('quem-recebe', [T('Quando o sistema envia e-mail', { size: 15, weight: 700 }),
    ...[['Lembrete de prazo', '24 horas antes do vencimento, uma única vez, ao escriba da escala.'], ['Escala recebida', 'Ao colega que recebe uma escala passada por outro escriba.']].map(([a, b]) => F('ev/' + a, { layout: 'horizontal', gap: 10, sizingH: 'fill' }, [F('ic', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: C.primaryLight, cornerRadius: 8 }, [Icon('mail', 16, C.primary)], { w: 32, h: 32 }), F('t', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T(a, { size: 13, weight: 700, lh: 18 }), T(b, { size: 12, color: C.slate, lh: 16, fillW: true })])]))], { w: 280, gap: 14 }),
  Card('dica', [F('h', { layout: 'horizontal', gap: 8, crossAlign: 'center' }, [Icon('lock', 16, C.warningStrong), T('Provedores com senha de app', { size: 14, weight: 700, color: C.warningStrong })]), T('Gmail e Microsoft costumam exigir uma "senha de aplicativo". Gere uma no provedor e cole no campo Senha.', { size: 12, color: C.slate, lh: 17, fillW: true })], { w: 280, gap: 8 }),
]);

const abas = () => F('abas', { layout: 'horizontal', gap: 4, padding: 4, fill: C.muted, cornerRadius: 10 }, [['Unidade', false], ['Sistema', true]].map(([l, on]) => F('a/' + l, { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center', fill: on ? C.card : 'none', cornerRadius: 8, effects: on ? [{ type: 'dropShadow', color: '#0f172a14', offset: [0, 1], radius: 3 }] : [] }, [T(l, { size: 14, weight: on ? 700 : 500, color: on ? C.fg : C.slate })], { w: 120, h: 36 })));

const desktop = Shell('Configurações', 'Administração', 'Configurações', [
  F('topo', { layout: 'horizontal', gap: 12, crossAlign: 'center', sizingH: 'fill' }, [F('t', { layout: 'vertical', gap: 2, sizingH: 'fill' }, [T('Configurações', { size: 24, weight: 800, lh: 32 }), T('Padrões do sistema inteiro e ajustes de cada igreja ou núcleo.', { size: 14, color: C.slate, lh: 20 })]), abas()]),
  F('cols', { layout: 'horizontal', gap: 24, sizingH: 'fill' }, [
    F('sub', { layout: 'vertical', gap: 4 }, [sub('Geral', false, 'gear'), sub('Folha A4', false, 'doc'), sub('Escalas e prazos', false, 'cal'), sub('Mensagem de WhatsApp', false, 'msg'), sub('E-mail (SMTP)', true, 'mail')], { w: 200 }),
    F('form', { layout: 'vertical', sizingH: 'fill' }, [smtp()]), lateral(),
  ]),
], { h: 1160 });

const mobile = F('config/mobile', { layout: 'vertical', fill: C.bg, clip: true }, [
  F('topo', { layout: 'horizontal', padding: [0, 8, 0, 8], crossAlign: 'center', mainAlign: 'spaceBetween', fill: C.card, stroke: C.border, strokeWeight: 1, sizingH: 'fill' }, [F('m', { layout: 'horizontal', gap: 4, crossAlign: 'center' }, [F('bk', { layout: 'horizontal', mainAlign: 'center', crossAlign: 'center' }, [Icon('chevR', 22, C.slate)], { w: 44, h: 44 }), T('E-mail (SMTP)', { size: 17, weight: 700 })]), Badge('approved')], { h: 60 }),
  F('corpo', { layout: 'vertical', gap: 14, padding: 16, sizingH: 'fill', sizingV: 'fill' }, [
    switchRow('Enviar por SMTP', 'Desativado, só vai para o log.', true),
    Field('Servidor SMTP', { required: true, value: 'smtp.igreja.org', touch: true }), Field('Porta', { required: true, value: '587', touch: true }),
    F('seg', { layout: 'vertical', gap: 8, sizingH: 'fill' }, [T('Segurança da conexão', { size: 14, weight: 600 }), radio('STARTTLS · porta 587', true), radio('SSL/TLS · porta 465', false)]),
    Field('Senha', { placeholder: '••••••••••', icon: 'lock', touch: true, helper: 'Deixe em branco para manter a atual.' }),
  ]),
  F('barra', { layout: 'horizontal', gap: 10, padding: [10, 16, 14, 16], fill: C.card, stroke: C.border, strokeWeight: 1, strokeSides: [1, 0, 0, 0], sizingH: 'fill' }, [Btn('Testar', { kind: 'outline', touch: true }), Btn('Salvar alterações', { touch: true, fillW: true })]),
], { w: 390, h: 844 });

await session(async fc => {
  await fc.call('run_command', { command: 'page.rename', params: { name: 'Configurações' } });
  await fc.call('run_command', { command: 'page.setBackground', params: { color: '#e8edf3' } });
  await build(fc, desktop, 0, 0);
  await build(fc, mobile, 1520, 0);
  await fc.call('save_file', { path: 'D:\\SYSTRAT\\escriba\\design\\06-configuracoes.figcraft' });
  await shot(fc, 'D:/SYSTRAT/escriba/design/src/previews/s06.png', { maxSize: 1900 });
});
process.exit(0);

