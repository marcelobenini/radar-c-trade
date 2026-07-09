# Radar Comercial — CTrade

**Plataforma Avançada de Inteligência Comercial e Mapeamento de Estabelecimentos**

O **Radar Comercial** é uma plataforma inovadora desenvolvida sob medida para a força de vendas e analistas de inteligência comercial da **CTrade**, uma distribuidora premium de insumos e ingredientes gastronômicos de padrão internacional (farinas Caputo, tomates San Marzano DOP, queijos curados, azeites premium). 

A plataforma transforma dados geográficos de leads e cardápios analíticos (em PDF ou imagens) em relatórios estruturados de oportunidades e scores de compatibilidade automática (*Fit Score*), acelerando a conversão de novos estabelecimentos e simplificando a prospecção ativa.

---

## 🎯 Objetivo do Projeto

Capacitar o time comercial da CTrade a:
1. **Identificar Oportunidades**: Visualizar em um mapa interativo onde estão os estabelecimentos com maior sinergia com o portfólio.
2. **Análise Automatizada de Cardápio via IA**: Submeter um arquivo de cardápio (PDF ou Imagem) e obter insights em segundos sobre produtos de alto potencial, ingredientes ausentes no estabelecimento e estratégias ideais de abordagem.
3. **Gestão de Times e Acessos**: Administrar equipes, permissões complexas e trilhas de auditoria das ações de prospecção.
4. **Relatórios Gerenciais**: Exportar e visualizar indicadores de vendas e metas de conversão de leads com visualização corporativa executiva.

---

## 🛠️ Tecnologias Utilizadas

A plataforma foi desenvolvida utilizando modernas ferramentas full-stack de alto desempenho:

- **Frontend**:
  - **React 19** com **TypeScript** para máxima segurança de tipos.
  - **Vite** como empacotador ultrarrápido para desenvolvimento.
  - **Tailwind CSS** para estilização com foco em design limpo e interfaces responsivas de alto contraste.
  - **Lucide React** para um conjunto consistente de ícones vetoriais.
  - **Motion** (`motion/react`) para microinterações táteis e transições fluidas de telas.
  - **Recharts** para visualizações analíticas interativas de gráficos e tendências.

- **Backend**:
  - **Node.js** com **Express** como camada de proxy segura e robusta.
  - **@google/genai SDK** para orquestração das chamadas aos modelos **Gemini 3.5 Flash** server-side, garantindo segurança total da chave API.
  - **Esbuild** para compilação otimizada do servidor de produção (`dist/server.cjs`).
  - **Tsx** para execução ágil do ambiente de desenvolvimento TypeScript.

---

## 📁 Estrutura de Pastas

O projeto segue um padrão arquitetural limpo e modularizado, separando a lógica de negócios da camada de apresentação:

```text
/
├── .env.example             # Modelo das variáveis de ambiente necessárias
├── package.json             # Dependências de bibliotecas e scripts npm
├── server.ts                # Servidor Express com rotas de API e proxy Gemini
├── metadata.json            # Metadados e permissões da plataforma
├── src/
│   ├── main.tsx             # Arquivo de entrada do React
│   ├── App.tsx              # Roteador principal e gerenciador de estado das transições
│   ├── index.css            # Estilos globais e importação do Tailwind CSS
│   ├── types.ts             # Definição unificada de tipos e interfaces TypeScript
│   │
│   ├── config/              # Parâmetros globais do sistema
│   │   └── env.ts           # URLs, Feature Flags e chaves padrão
│   │
│   ├── constants/           # Tabelas estáticas e listas imutáveis
│   │   └── index.ts         # Menus, segmentos culinários e níveis de ticket
│   │
│   ├── utils/               # Funções auxiliares reutilizáveis
│   │   └── formatters.ts    # Formatadores de moeda, datas, CNPJ e strings
│   │
│   ├── services/            # Serviços de integração externa e APIs
│   │   └── api.ts           # Chamadas HTTP estruturadas para o motor de IA
│   │
│   ├── hooks/               # Custom hooks reutilizáveis
│   │   ├── useLocalStorage.ts  # Persistência reativa no cliente
│   │   └── useDashboard.ts     # Gerenciamento de estado de filtros e estados
│   │
│   ├── components/          # Componentes reutilizáveis de UI e Layout
│   │   ├── layout/          # Sidebar, Header, Footer e Envelopes de tela
│   │   ├── shared/          # Matriz de permissão, Timeline de auditoria, TeamCard
│   │   └── ui/              # Botões, Cards, inputs, tabelas, esqueletos e feedbacks
│   │
│   └── pages/               # Páginas de visão (Telas do sistema)
│       ├── VisaoGeral.tsx            # KPI Dashboard e gráficos gerais
│       ├── RadarComercial.tsx        # Mapeamento geográfico de leads de prospecção
│       ├── Clientes.tsx              # Tabela e gestão de leads / estabelecimento
│       ├── InteligenciaComercial.tsx # Upload e análise de cardápios por IA
│       ├── Produtos.tsx              # Catálogo comercial de preços do portfólio
│       ├── Relatorios.tsx            # Estatísticas avançadas de prospecção para impressão
│       ├── Usuarios.tsx              # Gestão de equipes, perfis e permissões de acesso
│       └── Configuracoes.tsx         # Central de Inteligência de chaves de IA
```

---

## 🚀 Como Instalar e Executar

Siga os passos abaixo para preparar o ambiente e rodar o projeto localmente:

### 1. Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **NPM** (instalado com o Node)

### 2. Instalação
Clone o repositório ou acesse a pasta do projeto e instale as dependências:
```bash
npm install
```

### 3. Configuração
Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:
```env
GEMINI_API_KEY=sua_chave_do_google_gemini_aqui
```
*Observação: O servidor local utiliza a variável `GEMINI_API_KEY` para autenticar as requisições de análise de IA sem expor a chave no navegador.*

### 4. Executando em Desenvolvimento
Para iniciar o servidor de desenvolvimento e a compilação do frontend simultaneamente:
```bash
npm run dev
```
A aplicação iniciará na porta **3000** e estará acessível em `http://localhost:3000`.

### 5. Compilação para Produção
Para criar um pacote otimizado pronto para deploy em servidores de nuvem (como Cloud Run, Docker, AWS, etc.):
```bash
npm run build
```
Esse comando gera os arquivos estáticos compilados do frontend na pasta `/dist` e empacota o servidor Express em um único arquivo CommonJS executável `/dist/server.cjs`.

### 6. Iniciando em Produção
Após compilar, execute o servidor pronto para ambiente de produção:
```bash
npm start
```

---

## 🗺️ Roadmap de Evoluções

O plano estratégico de desenvolvimento da plataforma do Radar Comercial está dividido em fases incrementais:

### 🟩 FASE 1: MVP Realizado (Concluído)
- [x] Dashboard KPI com faturamento e leads convertidos.
- [x] Mapeamento de estabelecimentos com coordenadas e filtros por região.
- [x] Extração estruturada de dados de cardápios (PDF/Imagem) usando a API do Gemini.
- [x] Catálogo de portfólio CTrade e matriz de permissões de acesso dinâmicas.

### 🟨 FASE 2: Conectividade e Banco de Dados (Próximos Passos)
- [ ] Integração com **Firebase (Auth & Firestore)** para sincronização de dados de múltiplos usuários em tempo real.
- [ ] Migração do estado local para tabelas de banco de dados no **Google Cloud SQL (PostgreSQL)** para gestão empresarial de faturamento.
- [ ] Persistência segura de documentos de cardápios na nuvem (**Google Cloud Storage**).

### 🟦 FASE 3: Automação e Integrações Externas
- [ ] Conexão direta com CRMs de mercado (como **RD Station** ou **HubSpot**) para disparo de funis após análise de cardápio.
- [ ] Envio automático de mensagens e resumos comerciais via **WhatsApp** e **e-mail** para os vendedores usando APIs dedicadas.
- [ ] Sincronização automática do catálogo de produtos com ERPs de faturamento.
