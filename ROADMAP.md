# Roadmap Estratégico — Radar Comercial CTrade

Este documento descreve a visão de longo prazo do **Radar Comercial CTrade**, dividindo o cronograma de evolução em marcos estratégicos bem definidos.

---

## 📈 Resumo Visual do Roadmap

```text
  [ MVP Atual ] ──────> [ Versão 1.0 ] ──────> [ Versão 2.0 ] ──────> [ Versão Enterprise ]
  • Client state        • Firebase Auth        • Integração CRM        • Relatórios Dinâmicos BI
  • Gemini proxy        • Firestore DB         • Envio WhatsApp        • App Mobile Nativo (Android)
  • UI Skeletons        • Cloud Storage        • Sincronia ERP         • Autoconexão Google Maps
```

---

## 🟩 MVP — Versão Atual (Pronta para Demonstração)

Foco em validar a usabilidade, o design system, o motor de análise de cardápios com inteligência artificial e a experiência de representantes comerciais em campo.

- **Persistência**: Memória local de dados (*LocalStorage*) para fluxo síncrono offline-first.
- **Camada de IA**: Análise via *Gemini-3.5-Flash* orquestrada server-side para segurança de chaves.
- **Design System**: Interfaces com transições suaves de loading, feedbacks de toast e esqueletos estruturais de transição (*Skeleton Loaders*).
- **Controle de Acessos**: Matriz interativa simulando perfis comerciais, supervisores e inteligência de vendas.

---

## 🟨 Versão 1.0 — Conectividade, Cloud e Multi-Usuário (Q3 2026)

Foco em transformar a aplicação em uma ferramenta de nuvem durável, permitindo que múltiplos vendedores compartilhem leads e colaborem em tempo real.

### 🔌 Conectividade & Infraestrutura
- **Banco de Dados (Firebase Firestore)**:
  - Sincronização automática em tempo real de estabelecimentos e leads cadastrados.
  - Substituição da memória do localStorage para coleções estruturadas e seguras no Firestore.
  - Implementação de regras de segurança rígidas (*Firestore Security Rules*) para impedir leituras não autorizadas.
- **Autenticação (Firebase Auth)**:
  - Tela de login unificada com suporte a e-mail/senha e login com conta do Google da CTrade.
  - Vinculação de perfis de acesso reais baseados em tokens JWT para proteger rotas administrativas.
- **Armazenamento (Google Cloud Storage)**:
  - Repositório de arquivos para guardar os PDFs de cardápios submetidos por vendedores para futuras auditorias e consultas rápidas.

---

## 🟦 Versão 2.0 — Automação de Abordagem & Integrações (Q4 2026)

Foco em aumentar a taxa de conversão dos leads ao encurtar o tempo entre a prospecção e a primeira proposta comercial.

### 🤖 Automação de Abordagens Comerciais
- **Integração WhatsApp (API Evolution ou Z-API)**:
  - Botão de ação rápida para enviar o resumo executivo gerado pela IA diretamente para o WhatsApp do vendedor com um clique.
  - Opção de envio de proposta de portfólio customizada em PDF gerada pela IA para o decisor do estabelecimento.
- **Conectividade CRM (RD Station ou HubSpot)**:
  - Criação automática de um card de oportunidade no funil de vendas do CRM sempre que a IA identificar um estabelecimento com *Fit Score* acima de 80.
- **Sincronização de ERP**:
  - Integração com o ERP de faturamento da CTrade para obter estoque em tempo real de farinhas Caputo e tomates San Marzano e atualizar dinamicamente o catálogo de preços.

---

## 🟪 Versão Enterprise — Expansão e Escala Corporativa (Q1 2027)

Foco em oferecer inteligência preditiva profunda de mercado para a liderança executiva da CTrade, facilitando expansões geográficas.

### 📊 Business Intelligence e Aplicativos Nativos
- **Análise Dinâmica de Market Share**:
  - Cruzamento de dados de cardápios mapeados pelo radar com dados de importações nacionais para gerar relatórios preditivos de demanda de farinha de trigo especial no Brasil.
- **Dashboard Executivo Avançado**:
  - Integração nativa com **Power BI** ou **Looker Studio** para consolidar o funil de vendas geográfico de todas as filiais nacionais.
- **Aplicativo Mobile Dedicado**:
  - Empacotamento do frontend com *Capacitor/React Native* ou desenvolvimento nativo para que os vendedores tenham acesso rápido ao mapa GPS offline mesmo em regiões com baixa cobertura de internet.
- **Grounding Geográfico de Google Maps**:
  - Conexão do Radar Comercial com a API oficial do Google Places para auto-descobrir novos restaurantes em funcionamento na região e pré-cadastrar leads de forma automatizada no funil da distribuidora.
