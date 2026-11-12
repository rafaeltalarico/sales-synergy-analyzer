# CLAUDE.md - Contexto do Projeto LuminAI

## Resumo do Projeto
Sistema de gestão inteligente de vendas e estoque (LuminAI) com IA integrada.
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python) com PostgreSQL no Render
- **IA**: Anthropic Claude API (claude-haiku-5-5) com tool use / function calling (12 tools)
- **Deploy**: Render - backend como Web Service (`uvicorn backend.main:app`), frontend como Static Site separado
- **Dominio**: luminai.app.br

## Branch de Desenvolvimento
- Branch ativa: `feature/mock-to-production`
- Branch de produção anterior: `mock-oficial-luminai`

## Avanços Realizados (sessoes anteriores)

### 1. Migração backend OpenAI -> Anthropic Claude
- Substituído SDK OpenAI pelo Anthropic
- Modelo: `claude-haiku-5-5`
- 12 tools configuradas para function calling
- Loop de tool use com `while response.stop_reason == "tool_use"` e `max_iterations = 10`

### 2. Página BI conectada ao banco real
- Endpoint `GET /api/bi/dados` adicionado ao backend
- Calcula faturamento, markup, margem, estoque, custo_medio, evolucao 6 meses
- Categorias mapeadas para 20 produtos
- Frontend busca dados via `fetchBiData()` em `src/services/biService.ts`

### 3. Sidebar de navegacao
- `src/components/Sidebar.tsx` - Desktop fixo (w-56), mobile hamburger
- `src/components/Layout.tsx` - Wrapper com sidebar + content offset
- Navegacao: Inicio(/), Visao geral(/dashboard), IA Assistente(/analytics), Estoque(/estoque), Relatorios gerenciais(/bi)
- Navbar removido de todas as paginas

### 4. Formatacao markdown na resposta da IA
- Instalados: `react-markdown`, `remark-gfm`, `@tailwindcss/typography`
- `src/pages/Analytics.tsx`: ReactMarkdown v10 dentro de `<div className="prose prose-slate max-w-none">`
- Plugin typography adicionado ao `tailwind.config.ts`

### 5. Correcao de dependencias
- FastAPI atualizado de 0.104.1 para 0.115.6 (resolvia conflito anyio<4 vs anyio>=4)
- anthropic pinado em >=0.39.0 (deploy instalava 1.5.0 sem suporte a tool use)
- Variavel de ambiente `ANTHROPIC_API_KEY` necessaria no Render

## Arquivos Principais
- `backend/main.py` - Backend completo (~2300+ linhas)
- `src/pages/Analytics.tsx` - Pagina IA com ReactMarkdown
- `src/pages/Bi.tsx` - Relatorios BI com dados reais
- `src/pages/Index.tsx` - Pagina inicial (datas config nas linhas 16-28)
- `src/pages/Dashboard.tsx` - Visao geral estoque
- `src/pages/Estoque.tsx` - Gestao estoque
- `src/components/Sidebar.tsx` - Navegacao lateral
- `src/components/Layout.tsx` - Layout wrapper
- `src/services/aiService.ts` - Chamadas ao endpoint /analytics
- `src/services/biService.ts` - Chamadas ao endpoint /api/bi/dados
- `requirements.txt` - Dependencias Python (fastapi==0.115.6, anthropic>=0.39.0)

## Database (PostgreSQL no Render)
- Tabelas: `produto`, `compra`, `estoque`, `itens_compra`
- Datas deslocadas por 639 dias para ficarem atuais (~Nov 2025-2026)

## Notas Importantes
- Deploy frontend e backend sao separados no Render
- Apos `git pull`, sempre rodar `npm install` localmente se houver novos pacotes
- ReactMarkdown v10 nao aceita `className` como prop direta (usar div wrapper)
- Usuario prefere ser consultado antes de mudancas ("Nao faca alteracoes sozinho")
