export interface SharingQuestionItem {
  id?: number;
  question_text: string;
  order_index?: number;
}

export interface AgendaItem {
  id?: number;
  day_label: string;
  event_description: string;
  order_index?: number;
}

export interface SermonData {
  id?: number;
  duty_schedule_id?: number | null;
  organization_id?: number | null;
  scribe_id?: number | null;
  reviewer_id?: number | null;
  status: 'draft' | 'submitted' | 'in_review' | 'rejected' | 'approved';
  title_theme: string;
  theme?: string;
  preacher_name: string;
  minister_name?: string;
  preacher_title: 'pelo' | 'pela' | string;
  minister_title?: string;
  service_date: string;
  service_time?: string;
  location: string;
  cell_aim: string;
  leader_guidelines: string;
  scripture_reference: string;
  scripture_text?: string;
  summary_text: string;
  character_count?: number;
  review_notes?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  auth_hash?: string | null;
  banner_url?: string | null;
  qr_code_url?: string | null;
  reviewer?: { id?: number; name?: string; email?: string } | null;
  organization?: {
    id: number;
    name: string;
    type: 'catedral' | 'nucleo';
    city?: string;
    pix_key?: string | null;
    banner_url?: string | null;
    qr_code_pix_url?: string | null;
  };
  duty_schedule?: {
    id: number;
    service_date: string;
    shift: string;
    deadline_at: string;
    status: string;
  };
  questions: SharingQuestionItem[];
  agenda: AgendaItem[];
  sharing_questions?: Array<{ id?: number; question_text: string; order_index?: number }>;
  weekly_agenda_items?: Array<{ id?: number; day_time_text: string; description_text: string; order_index?: number }>;
  audit_logs?: Array<{
    id: number;
    action: string;
    previous_status: string | null;
    new_status: string;
    notes: string | null;
    created_at: string;
    user?: { name: string; email: string; role: string };
  }>;
}

export const LIMITE_RESUMO = 3400;
export const A4_HEIGHT_PX = (297 * 96) / 25.4; // 1122.52 px

export function norm(s: string | null | undefined): string {
  return String(s ?? '').replace(/\r\n?/g, '\n');
}

export function stripBoldMarks(s: string | null | undefined): string {
  return norm(s)
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/~~/g, '')
    .replace(/\*/g, '');
}

export function countVisibleChars(s: string | null | undefined): number {
  return Array.from(stripBoldMarks(s)).length;
}

export function formatBoldToHtml(s: string): string {
  const escaped = String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');
}

export function formatToLines(s: string | null | undefined): string[] {
  return norm(s)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
}

export function formatDateExtenso(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Gera hash determinístico cliente para mensagens em edição/rascunho
 */
export function generateClientAuthHash(sermon: Partial<SermonData>): string {
  if (sermon.auth_hash) return sermon.auth_hash;

  const seed = [
    'SYS-OUTLINE',
    sermon.id || '0',
    sermon.service_date || '2026-10-18',
    sermon.location || 'Casa de Israel - Catedral',
    sermon.title_theme || sermon.theme || '',
    sermon.preacher_name || sermon.minister_name || '',
    sermon.scripture_reference || sermon.scripture_text || '',
    (sermon.summary_text || '').slice(0, 100),
  ].join('|');

  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const p3 = ((h1 ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const p4 = ((h2 ^ 0xa5a5a5a5) >>> 0).toString(16).padStart(8, '0');
  return `${p1}${p2}${p3}${p4}`.toUpperCase();
}

/**
 * Formata o hash em blocos técnicos legíveis (Inter, números tabulares)
 */
export function formatAuthHash(hash?: string | null): string {
  const clean = (hash || '').trim().toUpperCase();
  if (!clean) return 'DRAFT-AUTENTICACAO-PENDENTE';
  if (clean.length >= 32) {
    const p = clean.slice(0, 32);
    return p.match(/.{1,4}/g)?.join('-') || p;
  }
  return clean;
}

export const SAMPLE_SERMON: SermonData = {
  status: 'draft',
  auth_hash: 'C6E9D507A5880011741A6FC11FA4A6704FB889BEC939DB68DD9983BE0361CA2B',
  title_theme: 'Seja forte e corajoso: atravessando o Jordão rumo à terra prometida',
  preacher_title: 'pela',
  preacher_name: 'Pastora Kelli Mendes',
  service_date: '2026-10-18',
  location: 'Casa de Israel - Catedral',
  cell_aim: 'Quebra gelo/Oração pela liderança/Louvor /Oferta / Kilo do Amor / Palavra / Avisos / DNA.',
  leader_guidelines: 'As ofertas das células são direcionadas para o projeto visão do futuro • Participe e divulgue nas células sobre a carteira de generosidade (cigenerosidade@gmail.com) • As ofertas feitas pelo QrCode Pix, devem ser contabilizadas em anexo no envelope e no relatório das células.',
  scripture_reference: 'Josué 1:1-9',
  summary_text: `A ministração da Pastora Kelli trata da transição do povo de Israel. Após a morte de Moisés, Deus ordena a Josué: **“Passa este Jordão”** (Js 1:2). O rio é a fronteira entre sair do Egito e possuir a terra prometida. Chegamos até aqui pela graça e pela presença de Deus, e não por recursos ou méritos próprios.
**1. A Barreira da Mentalidade:** A pastora destaca que muitos saíram do Egito (o lugar da escravidão), mas o Egito ainda não saiu deles. Ela define o Jordão não apenas como um rio geográfico, mas como uma barreira mental e espiritual. Atravessar o Jordão exige **"desmontar"** a mentalidade de escravo — a pessoa que murmura, que tem saudades do passado de dor e que se sente inferior diante dos gigantes. A vitória começa na mente: é preciso saber quem você é em Deus para saber para onde você está indo.
**2. Coragem como Decisão:** Josué teve medo de assumir o legado de Moisés, e Deus repetiu: **“Sê forte e corajoso”** (Js 1:6-9), pois o Senhor está conosco por onde andarmos. Coragem é decisão, não sentimento: a emoção engana, e vivemos pelo que Deus disse. Quem fica paralisado no choro e na vitimização não avança, porque Deus se move pela Sua Palavra.
**3. A Presença de Deus e o Jordão de Cada Um:** Em um momento profundo, a ministração identifica que o "Jordão" de muitos hoje são as águas amargas da falta de perdão, do orgulho, do ressentimento entre casais e do distanciamento entre pais e filhos. Essas **"águas"** impedem a família de entrar na Terra Prometida. Atravessar o Jordão significa posicionar-se, renunciar ao orgulho e pedir perdão, entendendo que a obediência gera consequências para as próximas gerações.
**4. A Dinâmica do Milagre:** O milagre da abertura das águas só aconteceu quando os sacerdotes colocaram os pés no rio. A lição é clara: Deus não abre o caminho para quem fica parado na margem chorando. O milagre exige o **"passo de fé"** em meio à incerteza. A estação da espera acabou; agora é tempo de avançar sob a luz da Palavra, permitindo que o Espírito Santo faça uma **"faxina"** no coração para que a vida espiritual flua como água viva.
**5. Mudança de Estação:** Em Eclesiastes 3:1, há tempo determinado para tudo. A transição é um processo que exige paciência e perseverança. Israel chorou 30 dias por Moisés e precisou se levantar. Quem plantou em choro voltará com alegria (Sl 126:5). Esquecendo o que ficou para trás (Fp 3:13), a igreja é chamada a ver a **“coisa nova”** que Deus faz (Is 43:19).
**Conclusão:** A palavra encerra-se com uma poderosa ativação de identidade. Atravessar o Jordão significa tomar posse daquilo que já foi prometido. A igreja é desafiada a declarar que a estação da seca terminou e que o tempo da colheita e da posse sobre as famílias e finanças chegou. Egito e mentalidade de escravo, nunca mais.`,
  questions: [
    { question_text: 'Qual é o meu “Jordão” hoje (mágoa, falta de perdão, medo, vergonha, incredulidade)? Que passo concreto de coragem e obediência posso dar esta semana para atravessá-lo, confiando que Deus vai à frente (Js 1:9)?' },
    { question_text: 'Há algo do “Egito” (mentalidade de escravo, murmuração, vontade de voltar atrás) que ainda me prende? Oremos uns pelos outros, declarando a Palavra sobre a casa e a família, e aguardemos com paciência a estação de Deus.' },
    { question_text: 'Como posso apoiar alguém da célula que está “paralisado no choro” e precisa de encorajamento para seguir adiante?' },
  ],
  agenda: [
    { day_label: 'Terça (20h):', event_description: 'Terça Do Avivamento – “Fé Sobrenatural”' },
    { day_label: 'Sábado:', event_description: 'Células Start – As 16h' },
    { day_label: 'Domingo:', event_description: 'Culto 9h- Manhã Do Espírito Santo e às 18h30 - Culto De Celebração' },
    { day_label: '23 e 24 de outubro', event_description: 'Conferência Mulheres - Um lugar em Betânia' },
    { day_label: '11 dezembro', event_description: 'Acampa Start' },
  ],
};

