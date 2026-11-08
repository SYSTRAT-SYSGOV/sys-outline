import { SermonData, formatDateExtenso } from './sermonUtils';

export function formatSermonForWhatsApp(sermon: SermonData): string {
  const lines: string[] = [];

  lines.push('📖 *MENSAGEM PARA CÉLULAS*');
  if (sermon.location) {
    lines.push(`🏛️ *${sermon.location}*`);
  }
  lines.push('');

  lines.push(`📌 *TEMA:* ${sermon.title_theme.toUpperCase()}`);
  lines.push(`👤 *Ministrada:* ${sermon.preacher_title} ${sermon.preacher_name}`);
  const dataExt = formatDateExtenso(sermon.service_date);
  if (dataExt) {
    lines.push(`📅 *Data:* ${dataExt}`);
  }
  lines.push(`📖 *Texto Lido:* ${sermon.scripture_reference}`);
  lines.push('');

  lines.push('🧭 *DIRECIONAMENTO PARA A CÉLULA:*');
  lines.push(sermon.cell_aim);
  lines.push('');

  lines.push('⚠️ *ORIENTAÇÕES PARA OS LÍDERES:*');
  lines.push(sermon.leader_guidelines);
  lines.push('');

  lines.push('📝 *RESUMO DA PALAVRA:*');
  // For WhatsApp, double asterisks **bold** are converted to single *bold*
  const cleanSummary = sermon.summary_text.replace(/\*\*(.+?)\*\*/g, '*$1*');
  lines.push(cleanSummary);
  lines.push('');

  if (sermon.questions && sermon.questions.length > 0) {
    lines.push('🗣️ *COMPARTILHAMENTO (APLICAÇÃO PRÁTICA):*');
    const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    sermon.questions.forEach((q, idx) => {
      const num = numbers[idx] || `${idx + 1}.`;
      lines.push(`${num} ${q.question_text}`);
    });
    lines.push('');
  }

  if (sermon.agenda && sermon.agenda.length > 0) {
    lines.push('📅 *FIQUE LIGADO NA AGENDA DA SEMANA:*');
    sermon.agenda.forEach(item => {
      lines.push(`• *${item.day_label}* ${item.event_description}`);
    });
  }

  return lines.join('\n');
}

export function copySermonToClipboard(sermon: SermonData): Promise<boolean> {
  const text = formatSermonForWhatsApp(sermon);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve(success);
    } catch {
      return Promise.resolve(false);
    }
  }
}
