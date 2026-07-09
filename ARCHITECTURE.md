# Arquitetura do Sistema — Radar Comercial

Este documento descreve as decisões arquiteturais, fluxos de dados, padrões de componentes e as diretrizes adotadas para garantir a escalabilidade, segurança e robustez do **Radar Comercial**.

---

## 🧭 Visão Geral Arquitetural

O Radar Comercial adota um modelo de **arquitetura full-stack integrada (Server-Side Proxy)** utilizando **Express** na camada de servidor e **Vite/React** na camada do cliente. Este design é essencial para garantir a segurança cibernética da plataforma:

```text
┌───────────────────────────────────────────────────────────────┐
│                    Navegador do Cliente (SPA)                 │
│                                                               │
│   ┌──────────────┐   ┌─────────────────┐   ┌──────────────┐   │
│   │  React Views │──>│  API Service    │──>│ UseState/    │   │
│   │  & Pages     │   │  (services/api) │   │ LocalStorage │   │
│   └──────────────┘   └─────────────────┘   └──────────────┘   │
└───────────────────────────────┬───────────────────────────────┘
                                │ Requisições HTTP
                                ▼ (/api/*)
┌───────────────────────────────────────────────────────────────┐
│                    Servidor Express (Backend)                 │
│                                                               │
│   ┌──────────────┐   ┌─────────────────┐   ┌──────────────┐   │
│   │ API Routes   │──>│  Gemini Client  │──>│ static file  │   │
│   │ (/api/gemini)│   │  (GenAI SDK)    │   │  handler     │   │
│   └──────────────┘   └─────────────────┘   └──────────────┘   │
└───────────────────────────────┬───────────────────────────────┘
                                │ Conexão Segura (HTTPS)
                                ▼
                 ┌─────────────────────────────┐
                 │ Google Gemini API Gateway   │
                 └─────────────────────────────┘
```

### Por que Server-Side Proxy?
De acordo com as boas práticas de segurança, **chaves API de inteligência artificial (como a chave do Gemini) nunca devem ser expostas no código do cliente ou enviadas diretamente no tráfego HTTP do navegador**. 
- O servidor Express funciona como um interceptador confiável. Ele armazena a `GEMINI_API_KEY` como uma variável de ambiente segura no contêiner de execução Cloud Run.
- O cliente envia payloads de arquivos de cardápios para o endpoint `/api/gemini/analyze-menu`, que processa a requisição usando o SDK oficial `@google/genai` e devolve apenas a resposta em formato JSON estruturado ao frontend.

---

## 🔄 Fluxo de Dados: Análise de Cardápios

O processamento inteligente de cardápios gastronômicos ocorre seguindo a seguinte cadeia de eventos:

1. **Upload do Arquivo**: O usuário arrasta ou seleciona um PDF ou imagem de cardápio no componente `<Upload />` na tela `<InteligenciaComercial />`.
2. **Conversão Base64**: O arquivo é lido no navegador usando o `FileReader API` e convertido em uma string codificada em Base64.
3. **Disparo do Serviço**: O componente invoca a função `GeminiApiService.analyzeMenu()`, que faz uma requisição `POST` contendo os dados do arquivo para o servidor local.
4. **Chamada de IA**: O servidor Express inicializa o cliente Gemini, configura as instruções detalhadas de prospecção comercial da CTrade (System Instructions / Prompt), e executa a chamada usando o modelo `gemini-3.5-flash`.
5. **Esquema Estruturado (JSON)**: O Gemini utiliza a capacidade nativa de `responseSchema` para garantir que o resultado seja devolvido exatamente no formato JSON estruturado que o frontend espera (definido na interface `GeminiAnalysisResult` de `/src/services/api.ts`).
6. **Atualização da View**: O frontend recebe a resposta do servidor, atualiza o estado local do lead, armazena no histórico do localStorage e atualiza os gráficos e badges da tela.

---

## 🧩 Componentes e Padrões de Design

A interface foi modularizada utilizando o conceito de **Responsabilidade Única (Single Responsibility Principle)**:

### 1. Camada de Apresentação (Presentational Components)
Componentes puros criados na pasta `/src/components/ui` que cuidam unicamente da representação gráfica. Eles não gerenciam estados complexos ou chamadas de API, apenas recebem propriedades (props):
- `Button`: Trata cores de botões, estados de carregamento e variações de tamanho.
- `Card`: Organiza o layout bento-grid com visual uniforme.
- `Table`: Fornece visualização para listagem de clientes e produtos com responsividade.
- `Skeletons`: Estruturas animadas para imitar layouts e reduzir o estresse de carregamento percebido pelo usuário.

### 2. Camada de Compartilhamento (Shared Components)
Componentes que possuem lógica de negócios leve ou interações compartilhadas entre múltiplas telas:
- `PermissionMatrix`: Sincroniza dinamicamente as permissões de perfis de usuários em tempo real utilizandoLocalStorage.
- `ActivityTimeline`: Rastreia ações e gera logs de auditoria visual de leads.

### 3. Camada de Páginas (Container Components)
Telas completas localizadas em `/src/pages` que orquestram os sub-componentes, gerenciam a memória de estados voláteis e manipulam as chamadas para a camada de serviços.

---

## ⚡ Estratégia de Performance e Transições

Para que a aplicação entregue uma experiência fluida equivalente a softwares prontos para produção:
- **Handoff de Estado por Transição**: No arquivo `App.tsx`, monitoramos a troca da propriedade `activePage`. Ao navegar, o sistema ativa imediatamente o estado de `isPageLoading` por um breve intervalo (850ms), exibindo o `Skeleton` apropriado de cada página. Isso previne oscilações bruscas de tela branca enquanto os dados são processados.
- **Microinterações com Motion**: O uso de animações leves de fade-in e escalonamento na inicialização de modais e painéis de filtros reduz a percepção de tempo de resposta do sistema.

---

## 🔒 Diretrizes de Segurança Futuristas

O código está estruturado para receber implementações completas de autenticação sem necessidade de refatoração:
- **Proteção de Rotas**: O componente principal `App.tsx` possui o espaço para validar o perfil ativo do usuário (`dynamicProfiles`) e ocultar ou exibir abas do menu de acordo com as permissões da `PermissionMatrix`.
- **Firebase Auth Ready**: No momento da introdução de autenticação na nuvem, o provedor de contexto de autenticação (`useAuth`) poderá ser inserido diretamente envolvendo a raiz em `main.tsx`, e as rotas de API no Express podem receber validadores de cabeçalho `Authorization: Bearer <JWT_TOKEN>`.
