# DESIGN.md — Arquitetura e Decisões de Design do Sistema Escriba

## 1. Visão Geral da Arquitetura

O **Sistema Escriba** é estruturado como uma aplicação moderna e desacoplada:
- **Frontend SPA**: React com TypeScript, empacotado via Vite, utilizando Tailwind CSS e a biblioteca de componentes **shadcn/ui**.
- **Backend API**: Framework PHP **Laravel 13** expondo endpoints RESTful autenticados via Laravel Sanctum e autorizados via Policies/FormRequests.
- **Persistência**: Banco de dados relacional **MySQL 8+**, com isolamento de dados por localidade (`organization_id`).

## 2. Componentes e Jornada do Usuário

```
[Administrador] ──> Configura Catedral / Núcleos e Cadastra Escalas Dominicais
                          │
                          ▼
[Escriba]       ──> Recebe a Escala, Ouve a Palavra de Domingo e Digita o Resumo
                    (Editor com máx. 3.400 chars, atalhos **negrito** e Corretor pt-BR)
                          │
                          ▼
                    Submete para Revisão
                          │
                          ▼
[Revisor]       ──> Analisa o Resumo, Ajusta Grafia / Gramática e Valida Tamanho
                    (Pode Aprovar ou Devolver com Apontamentos)
                          │
                          ▼
                    Resumo Aprovado
                          │
                          ▼
[Líderes Célula] <── Folha A4 Única com Topo Contextualizado da Unidade (PDF/Print)
                    + Roteiro Formatado para WhatsApp / Mensageiros
```

## 3. Diretrizes de Interface e Fidelidade A4

- **Enquadramento em 1 Folha A4**: O resumo possui teto estrito de 3.400 caracteres. O container de visualização possui altura calibrada de 297mm (1122px a 96dpi) e bloqueia a submissão caso transborde.
- **Topo Dinâmico por Unidade**: A folha impressa herda o banner institucional, o título temático, a concordância do ministrante e o QR Code Pix específico da Catedral ou do Núcleo responsável pelo culto.
- **Modo de Impressão Limpo**: Estilos `@media print` eliminam qualquer componente de navegação, painéis ou botões, enviando para o PDF ou impressora apenas a folha A4 oficial.

