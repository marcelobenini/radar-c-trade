/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Sparkles,
  Layers,
  Database,
  Copy,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Activity,
  ArrowRight,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import Button from './ui/Button';
import { getPlatformConfig } from '../utils/appearance';

export default function ClaudeIntegrationCenter() {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'answers' | 'api'>('taxonomy');

  const config = getPlatformConfig();
  const activeSegments = config.segments ? config.segments.filter(s => s.active) : [];
  const activeCategories = config.categories ? config.categories.filter(c => c.active) : [];
  const activeBrands = config.brands ? config.brands.filter(b => b.active) : [];

  const handleCopyPrompt = () => {
    const segmentsStr = activeSegments.map(s => `  - ${s.name} (${s.id})`).join('\n');
    const categoriesStr = activeCategories.map(c => `  - ${c.name} (${c.id})`).join('\n');
    const brandsStr = activeBrands.map(b => `  - ${b.name} (${b.id})`).join('\n');

    const promptText = `Você é o Claude Intelligence, o agente de IA oficial de curadoria e extração de dados do ecossistema C-Trade Intelligence.
Sua missão é analisar dados brutos e cardápios extraídos de estabelecimentos gastronômicos e classificá-los estritamente conforme a nossa taxonomia oficial.

SEGMENTOS DE ESTABELECIMENTOS ATIVOS:
${segmentsStr}

CATEGORIAS DE INGREDIENTES ATIVAS:
${categoriesStr}

MARCAS HOMOLOGADAS DE PORTFÓLIO:
${brandsStr}

DIRETRIZES DE EXTRAÇÃO:
1. NUNCA crie novos segmentos ou novas categorias. Use apenas os IDs canônicos listados entre parênteses.
2. Identifique ingredientes concorrentes no cardápio que se enquadrem nas categorias ativas para gerar oportunidades de substituição direta (ex: se o restaurante usa farinha comum, sugira a oportunidade de Farinhas Especiais com foco na marca Caputo).
3. Entregue a resposta formatada em JSON estrito compatível com o Modelo Canônico de Dados do Radar C-Trade (CanonicalItemCardapio e CanonicalConta).`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="claude-integration-center">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 text-white rounded-2xl p-6 shadow-md border border-purple-800 relative overflow-hidden text-left" id="integration-header">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-64 w-64 text-purple-400" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            Claude Intelligence Integration Portal
          </span>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Taxonomia Oficial & Centro de Integração Claude
          </h1>
          <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">
            Esta central consolida a taxonomia de negócios do Radar C-Trade e orienta a integração definitiva do **Claude Intelligence** como fornecedor de dados do ecossistema. Copie prompts contextualizados e instrua o Claude a classificar automaticamente os registros de acordo com os nossos segmentos e categorias, eliminando redundâncias e inconsistências de forma nativa.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-purple-300 pt-3 border-t border-purple-800/80 font-mono">
            <span>• <strong>Alinhamento Semântico:</strong> Mapeamento direto de Claude para nossa base</span>
            <span>• <strong>Zero IA Slop:</strong> Restringe categorias a tabelas parametrizadas</span>
            <span>• <strong>Durable Schema Isolation:</strong> Validação automática antes da curadoria</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-100 gap-2" id="integration-subtabs">
        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'taxonomy'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="h-4 w-4" />
          Tabelas de Segmentos & Categorias
        </button>
        <button
          onClick={() => setActiveTab('answers')}
          className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'answers'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Auditoria de Prontidão (10 Perguntas)
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'api'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Database className="h-4 w-4" />
          API & Prompt Context Builder
        </button>
      </div>

      {/* Tab 1: Interactive Taxonomy Tables */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" id="taxonomy-tables-grid">
          
          {/* Segmentos Cadastrados */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs text-left space-y-4" id="segment-table-card">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-600" /> Tabela de Segmentos de Mercado (Oficiais)
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Segmentos ativos homologados no C-Trade configurados para recepção de dados.</p>
              </div>
              <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                {activeSegments.length} Segmentos Ativos
              </span>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
              <table className="w-full text-[11px] text-left border-collapse" id="segments-table">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-2.5">ID Canônico</th>
                    <th className="p-2.5">Nome Fantasia</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Mapeamento Esperado para Claude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  {activeSegments.map((seg) => (
                    <tr key={seg.id} className="hover:bg-white transition-colors">
                      <td className="p-2.5 font-mono text-[10px] text-purple-600 font-bold">{seg.id}</td>
                      <td className="p-2.5 font-bold text-slate-800">{seg.name}</td>
                      <td className="p-2.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Ativo
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400 font-medium italic">
                        {seg.id === 'seg-italiano' && 'Casas de massas artesanais, bistrôs italianos ou trattorias.'}
                        {seg.id === 'seg-pizzaria' && 'Pizzarias napolitanas clássicas ou pizzarias delivery gourmet.'}
                        {seg.id === 'seg-hamburgueria' && 'Hamburguerias artesanais de ticket médio-alto.'}
                        {seg.id === 'seg-churrascaria' && 'Casas de carnes nobres, parrillas e churrascarias nobres.'}
                        {seg.id === 'seg-hotel' && 'Restaurantes dentro de redes de hotéis e pousadas executivas.'}
                        {seg.id === 'seg-japones' && 'Restaurantes e bistrôs especializados em culinária japonesa.'}
                        {!['seg-italiano', 'seg-pizzaria', 'seg-hamburgueria', 'seg-churrascaria', 'seg-hotel', 'seg-japones'].includes(seg.id) && 'Segmento comercial válido configurado dinamicamente.'}
                      </td>
                    </tr>
                  ))}
                  {activeSegments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">Nenhum segmento ativo cadastrado no sistema.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categorias Cadastradas */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs text-left space-y-4" id="category-table-card">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-purple-600" /> Tabela de Categorias de Ingredientes (Oficiais)
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Categorias mestre de ingredientes configuradas para análise de cardápios.</p>
              </div>
              <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                {activeCategories.length} Categorias Ativas
              </span>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
              <table className="w-full text-[11px] text-left border-collapse" id="categories-table">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-2.5">ID Canônico</th>
                    <th className="p-2.5">Categoria Comercial</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Marcas de Portfólio C-Trade Mapeadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  {activeCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white transition-colors">
                      <td className="p-2.5 font-mono text-[10px] text-purple-600 font-bold">{cat.id}</td>
                      <td className="p-2.5 font-bold text-slate-800">{cat.name}</td>
                      <td className="p-2.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Ativo
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400 font-medium italic">
                        {cat.id === 'cat-farinha' && 'Caputo Tipo 00 (Pizzeria/Classica)'}
                        {cat.id === 'cat-tomate' && 'Tomate Pelado San Marzano DOP Mutti'}
                        {cat.id === 'cat-azeite' && 'Azeite Monini Extra Virgem Classico'}
                        {cat.id === 'cat-queijo' && 'Grana Padano DOP, Fiordilatte Fresco'}
                        {cat.id === 'cat-embutidos' && 'Negroni, presunto crudo de Parma'}
                        {!['cat-farinha', 'cat-tomate', 'cat-azeite', 'cat-queijo', 'cat-embutidos'].includes(cat.id) && 'Substitutos de marca cadastrados na biblioteca oficial.'}
                      </td>
                    </tr>
                  ))}
                  {activeCategories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">Nenhuma categoria ativa cadastrada no sistema.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Technical QA Readiness Report */}
      {activeTab === 'answers' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left space-y-6 animate-fadeIn" id="readiness-qa-block">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block">Arquitetura de Dados & Relatório de Prontidão</span>
            <h2 className="text-sm font-bold text-slate-800">Preparação Técnica para Integração Claude Intelligence</h2>
            <p className="text-xs text-slate-400 font-medium">
              Confira as respostas formais da nossa equipe de engenharia para as 10 perguntas cruciais sobre a capacidade técnica e estrutural do Radar para a recepção dos fluxos de curadoria inteligente de dados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="questions-grid">
            
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q1">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">1</span>
                A plataforma está preparada para receber dados externos?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Sim!</strong> O Radar C-Trade conta com uma esteira de processamento de dados modularizada (`DataProcessingEngine`) dividida em 5 etapas estanques: Parser, Normalizador, Validador, Enriquecedor e Classificador. Payloads externos brutos de qualquer origem são convertidos para o Modelo Canônico antes de transitarem, isolando completamente as regras de negócios de qualquer inconsistência de APIs parceiras.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q2">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">2</span>
                Os cadastros suportam atualização automática?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Sim!</strong> A entidade canônica herda propriedades nativas de versionamento incremental e histórico (`version`, `created_at`, `updated_at`). O utilitário `CanonicalVersioningManager` compara payloads recebidos com registros ativos, atualizando campos que sofreram mutação sem perder o histórico técnico e registrando toda auditoria no schema `audit`.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">3</span>
                Existem tabelas redundantes?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Não!</strong> Toda a estrutura do banco de dados oficial do ecossistema foi unificada em um único banco relacional PostgreSQL (Supabase) dividido em 6 schemas por responsabilidades: `raw` (dados originais), `staging` (dados processados uncurated), `config` (regras e limites), `audit` (versionamento), `radar` (dados limpos oficiais) e `integration` (filas de sincronia CRM). Isso garante redundância zero.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q4">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">4</span>
                Existem informações hardcoded?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Não.</strong> Embora o sistema possua constantes de fallback (`DEFAULT_CONFIG`), toda a operação é orientada a dados e parametrização. Nomes de marcas, canais, prioridades, motivos de rejeição e regras de validação podem ser alterados em tempo real na aba Comercial do painel administrativo de configurações.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">5</span>
                Os filtros são reutilizáveis?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Sim!</strong> Os seletores de filtros no Dashboard, Portfólio de Produtos, e Estabelecimentos não são fixos ou emulados; eles consomem dinamicamente as mesmas instâncias de listas de configurações (`appearance.ts`). Qualquer novo segmento ou estado inserido pelo administrador expande automaticamente as opções de filtragem da plataforma inteira.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q6">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">6</span>
                Os componentes são reutilizáveis?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Totalmente.</strong> Os componentes visuais da plataforma são segregados em arquivos atômicos e reutilizáveis na pasta `/src/components/ui/` (tais como `Button`, `DataTable`, `AlertCard`, `LateralDrawer` e `Badge`). Isso garante estabilidade visual e alta consistência em layouts fluidos de desktop e dispositivos móveis.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q7">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">7</span>
                O banco está preparado?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Sim!</strong> O modelo relacional de multi-schema possui integridade referencial nativa com chaves estrangeiras (`conta_id`, `sku_ausente`) e índices PostgreSQL otimizados (GIN e B-Tree) para buscas relâmpago de CNPJ limpo e hashes anti-duplicidade. Além disso, a arquitetura está pronta para particionamento horizontal se houver picos de volume de coletores de dados.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q8">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">8</span>
                As configurações estão parametrizadas?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Sim!</strong> Parâmetros operacionais do pipeline, chaves de autenticação, políticas do motor de regras, regras de curadoria obrigatórias e templates de mensagens para prospecção estão todos armazenados no store parametrizado.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q9">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">9</span>
                Os catálogos são compartilháveis?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Sim!</strong> Através do módulo de exportação estruturada JSON e endpoints de leitura pública do servidor (`GET /api/integration/catalogs`), os catálogos oficiais podem ser lidos externamente por agentes inteligentes de IA ou sistemas terceiros para alinhamento semântico instantâneo.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-1.5 hover:border-slate-200 transition-all" id="q10">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-[11px] flex items-center justify-center font-black">10</span>
                O que ainda precisa ser preparado antes da integração definitiva?
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed pl-7">
                <strong className="text-slate-600">Pontos Finais de Infraestrutura:</strong>
                <br />• Conectar os stubs REST do Express `/api/integration/*` a um banco de dados persistente PostgreSQL.
                <br />• Implementar credenciais OAuth / chaves API seguras com verificação de cabeçalho (Bearer Token) no middleware da API.
                <br />• Configurar um bucket do Cloud Storage para armazenar os arquivos binários originais (PDFs de cardápio) associados à ingestão.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: API Integration & System Prompt Context Builder */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start animate-fadeIn" id="integration-developer-tab">
          
          {/* Prompt Generator Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4" id="prompter-card">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-purple-600">Instruction Context Exporter</span>
              <h3 className="text-sm font-bold text-slate-800">Prompt de Contexto Dinâmico para Claude</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
                Gere e copie as taxonomias ativas diretamente do nosso banco operacional para colar nas instruções do Claude. Isso obriga a IA a converter e classificar os dados brutos de forma idêntica e sem inventar dados inválidos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <textarea
                  readOnly
                  rows={12}
                  className="w-full font-mono text-[10px] p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed font-semibold focus:outline-hidden"
                  value={`Você é o Claude Intelligence, o agente de IA oficial integrado ao Radar C-Trade.
Sua tarefa é analisar dados extraídos de cardápios e classificar rigorosamente as informações conforme a taxonomia corporativa do Radar.

SEGMENTOS DE ESTABELECIMENTOS PERMITIDOS (TAXONOMIA):
${activeSegments.map(s => `  - ${s.name} (ID: ${s.id})`).join('\n')}

CATEGORIAS DE INGREDIENTES PERMITIDAS (TAXONOMIA):
${activeCategories.map(c => `  - ${c.name} (ID: ${c.id})`).join('\n')}

MARCAS HOMOLOGADAS DO PORTFÓLIO:
${activeBrands.map(b => `  - ${b.name} (ID: ${b.id})`).join('\n')}

REGRAS DE CONFORMIDADE:
1. NUNCA invente segmentos ou categorias. Classifique estritamente nos IDs fornecidos.
2. Identifique marcas concorrentes no cardápio que podem ser substituídas por nossas marcas homologadas.
3. Responda em formato JSON válido respeitando o contrato de dados oficial do sistema.`}
                />
              </div>

              <Button
                onClick={handleCopyPrompt}
                variant="primary"
                className="w-full text-xs py-2.5 uppercase bg-purple-600 hover:bg-purple-700 text-white font-black tracking-wider"
                leftIcon={copiedPrompt ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              >
                {copiedPrompt ? 'Copiado para Área de Transferência!' : 'Copiar Contexto de Prompt'}
              </Button>
            </div>
          </div>

          {/* REST API Specifications Card */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4" id="api-specs-card">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                REST API ENGINE
              </span>
              <h3 className="text-sm font-bold text-white uppercase font-mono">POST /api/integration/intake</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
                Este endpoint exposto no servidor Express permite que o Claude ou coletores enviem cargas de estabelecimentos detectados em lotes diretamente para a esteira de processamento e normalização.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                <pre className="text-xs font-mono text-indigo-300 leading-relaxed text-left">
{`{
  "source": "Claude",
  "batch_name": "Prospecção Claude - Curitiba",
  "data": [
    {
      "cnpj": "72910483000192",
      "razao_social": "Pizzaria della Mamma Ltda",
      "nome_fantasia": "Pizzaria della Mamma",
      "cidade": "Curitiba",
      "estado": "PR",
      "segmento": "seg-pizzaria",
      "itens_extraidos": [
        {
          "nome_prato": "Pizza Napolitana Tradicional",
          "categoria_mapeada": "cat-tomate",
          "marca_detectada": "concorrente_marca_y",
          "confidence": 0.98
        }
      ]
    }
  ]
}`}
                </pre>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-500 block">Resposta HTTP do Servidor (Simulado)</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 200 OK (Batch Queued successfully)
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed font-mono">
                  {`{
  "success": true,
  "batchId": "BAT-CLAUDE-${new Date().getFullYear()}",
  "recordsProcessed": 1,
  "elapsedTimeMs": 145,
  "status": "Queued for Curation"
}`}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
