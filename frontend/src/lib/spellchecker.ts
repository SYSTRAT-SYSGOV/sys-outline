/**
 * Corretor Léxico e Ortográfico em Português do Brasil (pt-BR)
 * Valida termos comuns, acentuação e vocabulário eclesiástico.
 */

// Dicionário de correções e termos comuns com erro frequente em resumos de cultos
const DICIONARIO_PT_BR: Record<string, string> = {
  // Acentuações e erros comuns
  'ministerio': 'ministério',
  'bencao': 'bênção',
  'bencaos': 'bênçãos',
  'oracao': 'oração',
  'oracoes': 'orações',
  'coracao': 'coração',
  'coracoes': 'corações',
  'pregacao': 'pregação',
  'pregacoes': 'pregações',
  'ministracao': 'ministração',
  'ministracoes': 'ministrações',
  'edificacao': 'edificação',
  'comunhao': 'comunhão',
  'uncao': 'unção',
  'visoes': 'visões',
  'visao': 'visão',
  'perdao': 'perdão',
  'renovacao': 'renovação',
  'salvacao': 'salvação',
  'gratidao': 'gratidão',
  'geracao': 'geração',
  'geracoes': 'gerações',
  'libertacao': 'libertação',
  'restauracao': 'restauração',
  'proposito': 'propósito',
  'propositos': 'propósitos',
  'espirito': 'espírito',
  'biblia': 'bíblia',
  'biblico': 'bíblico',
  'biblica': 'bíblica',
  'fe': 'fé',
  'graca': 'graça',
  'justica': 'justiça',
  'esperanca': 'esperança',
  'paciencia': 'paciência',
  'sabedoria': 'sabedoria',
  'alianca': 'aliança',
  'presenca': 'presença',
  'familia': 'família',
  'familias': 'famílias',
  'celula': 'célula',
  'celulas': 'células',
  'lider': 'líder',
  'lideres': 'líderes',
  'lideranca': 'liderança',
  'estacao': 'estação',
  'estacoes': 'estações',
  'decisao': 'decisão',
  'decisoes': 'decisões',
  'emocao': 'emoção',
  'emocoes': 'emoções',
  'vitoria': 'vitória',
  'vitorias': 'vitórias',
  'historia': 'história',
  'memorias': 'memórias',
  'memoria': 'memória',
  'pratica': 'prática',
  'pratico': 'prático',
  'dinamica': 'dinâmica',
  'atravessando': 'atravessando',
  'obediencia': 'obediência',
  'consequencia': 'consequência',
  'consequencias': 'consequências',
  'renuncia': 'renúncia',
  'resistencia': 'resistência',
  'experiencia': 'experiência',
  'dizimo': 'dízimo',
  'dizimos': 'dízimos',
  'submissao': 'submissão',
  'transicao': 'transição',
  'ressurreicao': 'ressurreição',
  'paralisia': 'paralisia',
  'dificil': 'difícil',
  'possivel': 'possível',
  'impossivel': 'impossível',
}

export interface SpellError {
  word: string
  suggestion: string
  index: number
}

/**
 * Analisa o texto em busca de palavras grafadas sem acento ou incorretas.
 */
export function checkSpelling(text: string): SpellError[] {
  if (!text) return []

  const errors: SpellError[] = []
  // Regex para encontrar palavras
  const regex = /\b[a-zA-ZÀ-ÿ]+\b/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const rawWord = match[0]
    const lower = rawWord.toLowerCase()

    if (DICIONARIO_PT_BR[lower] && DICIONARIO_PT_BR[lower] !== lower) {
      // Manter caixa alta se a palavra original estava capitalizada
      let suggestion = DICIONARIO_PT_BR[lower]
      if (rawWord[0] === rawWord[0].toUpperCase()) {
        suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
      }

      errors.push({
        word: rawWord,
        suggestion,
        index: match.index,
      })
    }
  }

  return errors
}

/**
 * Aplica sugestão de correção ortográfica substituindo a ocorrência.
 */
export function applySuggestion(text: string, error: SpellError): string {
  const before = text.slice(0, error.index)
  const after = text.slice(error.index + error.word.length)
  return before + error.suggestion + after
}

