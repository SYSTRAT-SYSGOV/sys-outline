import React, { useEffect, useRef, useState } from 'react';
import {
  SermonData,
  SAMPLE_SERMON,
  formatDateExtenso,
  formatBoldToHtml,
  formatToLines,
  formatAuthHash,
  generateClientAuthHash,
  A4_HEIGHT_PX,
} from '../lib/sermonUtils';

export type SheetTemplate = 'classic' | 'modern';

interface SheetPreviewProps {
  sermon: SermonData;
  onOverflowChange?: (isOverflowing: boolean, currentHeightPx: number) => void;
  scale?: number;
  template?: SheetTemplate;
}

export const SheetPreview: React.FC<SheetPreviewProps> = ({
  sermon,
  onOverflowChange,
  scale = 1,
  template = 'modern',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(0);

  useEffect(() => {
    const checkHeight = () => {
      if (sheetRef.current) {
        const height = sheetRef.current.scrollHeight;
        setCurrentHeight(height);
        // Tolerância de 4px para diferenças sutis de fontes
        const overflowing = height > A4_HEIGHT_PX + 4;
        setIsOverflowing(overflowing);
        if (onOverflowChange) {
          onOverflowChange(overflowing, height);
        }
      }
    };

    checkHeight();
    const resizeObserver = new ResizeObserver(() => checkHeight());
    if (sheetRef.current) {
      resizeObserver.observe(sheetRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [sermon, onOverflowChange, template]);

  // Se o resumo estiver totalmente vazio no formulário novo, mesclar com dados padrão para visualização
  const hasUserText = Boolean(sermon.summary_text?.trim() || sermon.title_theme?.trim());
  const activeSermon: SermonData = {
    ...SAMPLE_SERMON,
    ...sermon,
    title_theme: sermon.title_theme || sermon.theme || (hasUserText ? '' : SAMPLE_SERMON.title_theme),
    preacher_name: sermon.preacher_name || sermon.minister_name || (hasUserText ? '' : SAMPLE_SERMON.preacher_name),
    preacher_title: sermon.preacher_title || sermon.minister_title || SAMPLE_SERMON.preacher_title,
    service_date: sermon.service_date || SAMPLE_SERMON.service_date,
    location: sermon.location || sermon.organization?.name || SAMPLE_SERMON.location,
    cell_aim: sermon.cell_aim || (hasUserText ? '' : SAMPLE_SERMON.cell_aim),
    leader_guidelines: sermon.leader_guidelines || (hasUserText ? '' : SAMPLE_SERMON.leader_guidelines),
    scripture_reference: sermon.scripture_reference || sermon.scripture_text || (hasUserText ? '' : SAMPLE_SERMON.scripture_reference),
    summary_text: sermon.summary_text?.trim() ? sermon.summary_text : (hasUserText ? '' : SAMPLE_SERMON.summary_text),
    questions: (sermon.questions && sermon.questions.length > 0 && sermon.questions[0].question_text.trim())
      ? sermon.questions
      : (hasUserText ? [] : SAMPLE_SERMON.questions),
    agenda: (sermon.agenda && sermon.agenda.length > 0 && (sermon.agenda[0].day_label.trim() || sermon.agenda[0].event_description.trim()))
      ? sermon.agenda
      : SAMPLE_SERMON.agenda,
  };

  // Imagem do PIX: Prioridade para o upload do usuário, depois organização, depois o oficial extraído do docx
  const pixImageSrc =
    sermon.qr_code_url ||
    sermon.organization?.qr_code_pix_url ||
    '/pix_card_official.png';

  // Nome da Unidade / Núcleo / Igreja para personalização no topo e no corpo
  const churchOrNucleoName = activeSermon.location || 'Casa de Israel - Catedral';

  const dataExt = formatDateExtenso(activeSermon.service_date) || '18 de outubro de 2026';
  const year = activeSermon.service_date
    ? new Date(activeSermon.service_date).getFullYear()
    : 2026;

  const summaryParagraphs = formatToLines(activeSermon.summary_text);
  const themeText = activeSermon.title_theme || '(Informe o tema da ministração)';
  const scriptureText = activeSermon.scripture_reference || '(Informe o texto bíblico lido)';
  const preacherName = activeSermon.preacher_name || 'Ministrante';
  const preacherTitle = activeSermon.preacher_title || 'pela';
  const pixKey = sermon.organization?.pix_key || (sermon as any).pix_key || 'pixcelulasci@gmail.com';
  const displayAuthHash = formatAuthHash(activeSermon.auth_hash || generateClientAuthHash(activeSermon));

  return (
    <div className="sheet-preview-container flex flex-col items-center">
      {/* Indicador de Conformidade A4 em 1 Página */}
      <div className="no-print mb-3 flex items-center gap-3">
        {isOverflowing ? (
          <div className="flex items-center gap-2 rounded-full bg-[#fde4e4] px-3.5 py-1 text-xs font-semibold text-[#c0262d] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#c0262d] animate-pulse" />
            <span>Atenção: Conteúdo excede 1 folha A4</span>
            <span className="font-mono text-[11px] text-[#c0262d]">
              ({Math.round(currentHeight)}px / {Math.round(A4_HEIGHT_PX)}px)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-[#dcf5e7] px-3.5 py-1 text-xs font-semibold text-[#1a7f4b] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#1a7f4b]" />
            <span>Conforme: Relatório Editorial em 1 folha A4 (Página Única)</span>
            <span className="font-mono text-[11px] text-[#1a7f4b]">
              ({Math.round(currentHeight)}px / {Math.round(A4_HEIGHT_PX)}px)
            </span>
          </div>
        )}
      </div>

      {/* Scaler Wrapper */}
      <div
        className="scaler-wrapper shadow-2xl transition-all"
        style={{
          width: `${210 * scale}mm`,
          height: `${297 * scale}mm`,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          className="sheet-transform-wrapper"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '210mm',
          }}
        >
          {/* ============================================================== */}
          {/* RELATÓRIO OFICIAL A4 - BOAS PRÁTICAS EDITORIAIS (210mm x 297mm) */}
          {/* ============================================================== */}
          <article
            ref={sheetRef}
            id="sheet"
            className={`sheet-a4 relative bg-white text-slate-900 font-sans text-[8.8pt] leading-[1.16] p-[6mm_8mm_5mm_8mm] ${
              isOverflowing ? 'over' : ''
            }`}
            style={{
              width: '210mm',
              height: '297mm',
              minHeight: '297mm',
              maxHeight: '297mm',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              padding: '6mm 8mm 5mm 8mm',
            }}
          >
            {/* 1. TOPO: BANNER LIMPO OFICIAL + BOX DO PIX NO CANTO DIREITO */}
            <div className="header-section relative shrink-0 mb-[1.5mm] rounded-xs overflow-hidden border-b-[1.2px] border-[#17365D] shadow-2xs">
              <div className="relative w-full flex items-center justify-between bg-[#282E4E] min-h-[23mm] max-h-[25mm] h-[24mm]">
                {/* Banner Oficial em Alta Definição com Logo Centralizada sem Cortes */}
                <img
                  src="/church_header_banner_clean.png"
                  alt="Casa de Israel Church"
                  className="w-full h-[24mm] object-contain object-center bg-[#282E4E]"
                />

                {/* Badge da Unidade / Núcleo no Topo Esquerdo */}
                <div className="absolute left-[3mm] bottom-[2mm] z-10 flex items-center gap-1.5 bg-[#17365D]/90 backdrop-blur-xs px-2.5 py-0.5 rounded text-[7.5pt] font-mono text-[#FDE047] font-bold tracking-wider uppercase border border-white/20 shadow-xs">
                  <span>{churchOrNucleoName}</span>
                </div>

                {/* Box do PIX no Canto Direito do Banner */}
                <div className="absolute right-[2mm] top-[1mm] bottom-[1mm] z-10 bg-white p-[1.2mm_2mm] flex flex-col items-center justify-center rounded-xs border border-slate-300 shadow-sm max-w-[42mm]">
                  <img
                    src={pixImageSrc}
                    alt="PIX Oficial"
                    className="h-[19.5mm] w-auto max-w-[38mm] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 2. SUB-CABEÇALHO: ÍCONE DO CORAÇÃO + MENSAGEM PARA CÉLULAS + TEMA */}
            <div className="sub-header flex items-center gap-2.5 mb-[1.5mm] shrink-0">
              <div className="heart-icon shrink-0">
                <img
                  src="/heart_icon_official.png"
                  alt="Células"
                  className="w-[10mm] h-[10mm] object-contain drop-shadow-xs"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 mb-[0.5mm]">
                  <span className="text-[#17365D] font-black text-[12pt] leading-none">/</span>
                  <span className="text-[#17365D] font-extrabold italic text-[14pt] tracking-tight leading-none font-sans">
                    Mensagem para Células
                  </span>
                </div>
                <div className="border border-slate-300 rounded-xs px-[2.5mm] py-[0.5mm] bg-[#F8FAFC] shadow-2xs">
                  <span className="text-[#17365D] font-bold text-[9pt] uppercase tracking-wide">Tema: </span>
                  <span className="text-slate-900 font-bold text-[9.5pt] leading-tight">
                    {themeText}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. BARRA DE METADADOS DA MINISTRAÇÃO (FORMATO RELATÓRIO EXECUTIVO) */}
            <div className="meta-bar mb-[1.5mm] bg-[#F1F5F9] border border-slate-300 rounded-xs px-[2.5mm] py-[0.5mm] text-center shadow-2xs shrink-0">
              <div className="text-[8.5pt] font-bold text-slate-800 leading-tight">
                Ministrada {preacherTitle} <span className="text-[#17365D] font-black">{preacherName}</span>, em <span className="font-semibold">{dataExt}</span>. {churchOrNucleoName}
              </div>
            </div>

            {/* 4. TABELA DE CONTEÚDO PRINCIPAL (DESIGN DE RELATÓRIO INSTITUCIONAL) */}
            <div className="main-content-table shrink-0 w-full">
              <table className="main-table w-full border-collapse border border-slate-300 table-fixed text-[8.8pt] shadow-2xs">
                <tbody>
                  {/* Direcionamento Para a Célula — TÍTULO CENTRALIZADO */}
                  <tr>
                    <td className="bg-[#EAEFF6] text-[#17365D] text-center font-bold text-[8.8pt] p-[0.4mm_1mm] border border-slate-300 tracking-wide uppercase">
                      DIRECIONAMENTO PARA A CÉLULA
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center text-[8.5pt] p-[0.6mm_2mm] border border-slate-300 bg-white leading-tight">
                      {formatToLines(activeSermon.cell_aim).map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </td>
                  </tr>

                  {/* Orientações para os Líderes (CALLOUT DE ALERTA EDITORIAL) — TÍTULO CENTRALIZADO */}
                  <tr>
                    <td className="bg-[#FEE2E2] text-[#B91C1C] text-center font-bold text-[8.8pt] p-[0.4mm_1mm] border border-slate-300 tracking-wide uppercase">
                      ORIENTAÇÕES PARA OS LÍDERES
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#B91C1C] text-center text-[8.2pt] p-[0.6mm_2mm] border border-slate-300 bg-[#FEF2F2]/60 font-semibold leading-tight">
                      {formatToLines(activeSermon.leader_guidelines).map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </td>
                  </tr>

                  {/* Texto Lido — CENTRALIZADO */}
                  <tr>
                    <td className="bg-[#EAEFF6] text-slate-900 text-center text-[8.8pt] p-[0.4mm_1.5mm] border border-slate-300">
                      <span className="font-bold">Texto lido: </span>
                      <span className="font-black text-[#17365D]">{scriptureText}</span>
                    </td>
                  </tr>

                  {/* RESUMO — TÍTULO CENTRALIZADO */}
                  <tr>
                    <td className="bg-[#EAEFF6] text-[#17365D] text-center font-bold text-[8.8pt] p-[0.4mm_1mm] border border-slate-300 tracking-wide uppercase">
                      RESUMO DA MINISTRAÇÃO
                    </td>
                  </tr>
                  {/* TEXTO DO RESUMO: RIGOROSAMENTE JUSTIFICADO COM BOA LEITURA */}
                  <tr>
                    <td
                      className="text-justify text-[8.6pt] leading-[1.16] p-[1mm_2.5mm] border border-slate-300 bg-white"
                      style={{
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        hyphens: 'auto',
                      }}
                    >
                      {summaryParagraphs.length > 0 ? (
                        summaryParagraphs.map((para, idx) => (
                          <p
                            key={idx}
                            className="m-0 mb-[0.8mm] last:mb-0 text-justify"
                            style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                            dangerouslySetInnerHTML={{ __html: formatBoldToHtml(para) }}
                          />
                        ))
                      ) : (
                        <p className="m-0 italic text-slate-400 text-center">(Resumo não preenchido)</p>
                      )}
                    </td>
                  </tr>

                  {/* Compartilhamento (Aplicação Prática) — TÍTULO CENTRALIZADO */}
                  <tr>
                    <td className="bg-[#EAEFF6] text-[#17365D] text-center font-bold text-[8.8pt] p-[0.4mm_1mm] border border-slate-300 tracking-wide uppercase">
                      COMPARTILHAMENTO (APLICAÇÃO PRÁTICA)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-[0.7mm_2.5mm] text-[8.2pt] leading-tight border border-slate-300 bg-[#F8FAFC]">
                      {activeSermon.questions && activeSermon.questions.length > 0 ? (
                        activeSermon.questions.map((q, idx) => (
                          <div key={idx} className="flex items-baseline gap-1.5 mb-[0.5mm] last:mb-0">
                            <span className="font-bold text-[#17365D] shrink-0">{idx + 1})</span>
                            <span className="text-slate-900">{q.question_text}</span>
                          </div>
                        ))
                      ) : (
                        <p className="m-0 italic text-slate-400 text-center">(Nenhuma pergunta cadastrada)</p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. AGENDA DA SEMANA — RIGOROSAMENTE COLADA NO RODAPÉ DO RELATÓRIO */}
            <div className="agenda-footer-block mt-auto shrink-0 w-full pt-[1mm]">
              {/* Cabeçalho da Agenda — CENTRALIZADO */}
              <div className="bg-[#17365D] text-white text-center font-bold italic text-[8.8pt] p-[0.5mm_2mm] border border-[#17365D] border-b-0 uppercase tracking-wide rounded-t-xs shadow-2xs">
                FIQUE LIGADO NA AGENDA {year} DA {churchOrNucleoName.toUpperCase()}
              </div>

              {/* Tabela Zebrada de Horários e Eventos com Acabamento Executivo */}
              <table className="agenda-table w-full border-collapse border border-slate-300 shadow-2xs">
                <tbody>
                  {activeSermon.agenda && activeSermon.agenda.length > 0 ? (
                    activeSermon.agenda.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#C6D9F1]' : 'bg-[#EBF2FA]'}>
                        <td className="border border-slate-300 p-[0.4mm_2mm] text-[8.2pt] font-bold text-[#17365D] w-[24%]">
                          {item.day_label}
                        </td>
                        <td className="border border-slate-300 p-[0.4mm_2mm] text-[8.2pt] text-slate-900 font-medium">
                          {item.event_description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-[#C6D9F1]">
                      <td
                        colSpan={2}
                        className="border border-slate-300 p-[0.5mm_2mm] text-[8.2pt] text-center italic text-slate-600"
                      >
                        (Sem avisos na agenda)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 6. HASH DE AUTENTICAÇÃO DIGITAL INSTITUCIONAL (SYSGOV / SYSTRAT) */}
              <div className="auth-seal-bar mt-[0.8mm] pt-[0.6mm] flex items-center justify-between text-[6.5pt] font-mono text-slate-500 border-t border-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#17365D] uppercase tracking-wider">Hash de Autenticação:</span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 select-all">
                    {displayAuthHash}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <span className="text-[#1351B4] font-bold">SYS-OUTLINE</span>
                  <span>•</span>
                  <span>Documento Oficial Verificado</span>
                </div>
              </div>
            </div>

            {/* Linha Guia Visual caso ultrapasse (Visível apenas na tela, nunca impresso) */}
            {isOverflowing && (
              <div
                className="guide no-print absolute left-0 right-0 border-t-2 border-dashed border-[#c0262d] pointer-events-none"
                style={{ top: '297mm' }}
              >
                <span className="absolute right-[6px] top-[3px] bg-white px-2 py-0.5 text-[11px] font-bold text-[#c0262d] shadow-xs">
                  ⚠️ Limite da página A4 atingido
                </span>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};
