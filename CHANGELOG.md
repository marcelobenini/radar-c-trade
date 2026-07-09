# Changelog — Radar Comercial CTrade

Todas as mudanças relevantes e implementações deste projeto estão registradas aqui.

---

## [0.9.5-MVP] — 2026-07-07

Esta é a versão de lançamento do Produto Mínimo Viável (MVP) do Radar Comercial da CTrade. A arquitetura está consolidada no padrão full-stack (React + Express) e totalmente validada em termos de design, usabilidade, responsividade e inteligência artificial.

### 🚀 Novidades e Recursos Implementados

#### 📈 Módulo de Visão Geral (Dashboard)
- Painel analítico com KPIs estratégicos de faturamento, novos leads e ticket médio.
- Gráficos interativos com a evolução das conversões mensais utilizando **Recharts**.
- Lista dinâmica dos estabelecimentos mais compatíveis com o portfólio de produtos CTrade (*Top Fit Score*).

#### 📍 Módulo Radar Comercial
- Mapa conceitual de estabelecimentos interativo com coordenadas e pinos geográficos de leads.
- Filtros rápidos por nível gastronômico e segmento culinário do estabelecimento.
- Painel lateral ágil para exibição rápida de detalhes de leads clicados no mapa.

#### 🏢 Módulo de Estabelecimentos (Clientes)
- Tabela dinâmica e responsiva para acompanhamento da carteira de leads.
- Funil visual de status de prospecção (Lead, Contato, Visita, Negociação, Ativo, Inativo).
- Sistema de anotações e registro de histórico de contatos integrados a cada cliente.

#### 🤖 Módulo de Inteligência Comercial (Análise de Cardápios por IA)
- Upload de arquivos PDF e imagens de cardápios com suporte a drag-and-drop.
- Processamento server-side assíncrono via **Gemini 3.5 Flash** retornando JSON estritamente estruturado.
- Extração de resumo executivo comercial, score de fit, ticket em potencial, ingredientes identificados e sugestões precisas de abordagem e portfólio da CTrade.

#### 📦 Módulo Portfólio CTrade (Catálogo de Produtos)
- Exibição de catálogo comercial de insumos premium (farinha Caputo, tomates San Marzano, etc.).
- Calculadora de conversão de sacos/volumes comerciais para fáceis simulações de vendas para o representante em campo.

#### 👥 Módulo Gestão de Acessos
- Configuração de perfis e permissões granulares dinâmicas através da matriz interativa.
- Histórico visual de auditoria das ações e trilha de atividades do sistema.

#### 🎨 Design System e Refinamento de UX/UI
- Identidade visual uniforme, elegante e de alto contraste em cinza e azul escuro.
- Implementação de **Skeleton Loaders** em transições de páginas, evitando telas brancas e flickering.
- Gabarito visual de testes de estados de tela (Carregamento, Erro de API, Sucesso, Sem Resultados, Sem Conexão, Primeiro Acesso) integrado à aba "Central de IA".

---

### 📝 Correções e Estabilidade
- Centralização de tipos TypeScript em `/src/types.ts` eliminando declarações implícitas de `any`.
- Isolação de lógica de chamadas externas em `/src/services/api.ts` e configurações em `/src/config/env.ts`.
- Padronização de ícones para importação exclusivamente da biblioteca `lucide-react`.
- Responsividade completa testada em resoluções mobile (Smartphones), tablets e notebooks corporativos.

---

### 🔮 Planejado para Versões Futuras (Fase 12+)
- **Banco de dados na nuvem (Firestore / Google Cloud SQL)** para persistência multi-usuário estável.
- **Autenticação segura via Firebase Auth** com controle de rotas de acordo com perfil de permissões.
- **Integração de notificações ativas** para alertar vendedores sobre novos leads mapeados.
