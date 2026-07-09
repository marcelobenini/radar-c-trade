/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard, InsightCard, AlertCard } from '../components/ui/Card';
import { Input, Textarea, SearchInput, Select, MultiSelect, Autocomplete, PasswordInput, DatePicker } from '../components/ui/Input';
import { Badge, Tag, Toast, EmptyState, Skeleton, Spinner, ProgressBar, LoadingOverlay, Tooltip } from '../components/ui/Feedback';
import { Modal, LateralDrawer, Tabs, Accordion, Dropdown, ContextMenu } from '../components/ui/Interactive';
import DataTable, { Column } from '../components/ui/Table';
import Upload from '../components/ui/Upload';
import ScoreIndicator from '../components/ui/Score';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';

import {
  Settings,
  HelpCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  Bell,
  Eye,
  Sliders,
  Play,
  FileText,
  User,
  ExternalLink,
  Plus,
  Compass,
  ChevronDown,
  Lock,
  Shield,
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal,
  ListFilter,
  Activity,
  Database,
  BookOpen,
  Coffee,
  Hotel,
  Utensils,
  Store,
  Check,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  Workflow,
  Cpu,
  Layers2,
  FileDown,
  X,
  MapPin,
  TrendingUp,
  Clock,
  Building2,
  LockKeyhole
} from 'lucide-react';

// --- DATA STRUCTURES ---
interface MockRestaurant {
  id: number;
  name: string;
  segment: string;
  score: number;
  potential: string;
  status: 'Ativo' | 'Em Análise' | 'Pendente';
}

interface HistoricalAnalysis {
  id: string;
  client: string;
  model: string;
  tokens: string;
  time: string;
  status: 'Sucesso' | 'Pendente' | 'Erro';
  date: string;
}

export default function Configuracoes() {
  // Navigation Tabs State (Includes the requested tabs and preserves the Showcase UI tab)
  const [activeTab, setActiveTab] = useState<'geral' | 'gemini' | 'prompt' | 'produtos' | 'score' | 'historico' | 'seguranca' | 'playbooks' | 'design_system'>('geral');

  // --- GENERAL STATES ---
  const [toast, setToast] = useState<{ message: string; description: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [statePreview, setStatePreview] = useState<'empty' | 'loading' | 'error' | 'success' | 'no_results' | 'no_connection' | 'first_access'>('empty');

  // --- CARD 1: GEMINI API KEY ---
  const [apiKey, setApiKey] = useState('AQ.Ab8RN6LTxwHBgfBSQVJ5LvcN-Pp-mbjCcrBruP65OiPI1vOEow');
  const [connectionStatus, setConnectionStatus] = useState<'conectado' | 'desconectado' | 'conectando' | 'erro'>('conectado');

  // --- CARD 2: MODEL SELECTION ---
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  // --- CARD 3: PROMPT MESTRE ---
  const defaultPrompt = `Você é o motor de inteligência comercial do Radar CTrade, especializado em analisar cardápios de restaurantes e correlacionar as ofertas deles com as soluções do portfólio da CTrade.

Instruções fundamentais:
1. Analise detalhadamente a lista de pratos, ingredientes, descrições e ticket médio do estabelecimento comercial fornecido.
2. Identifique quais produtos premium da CTrade têm maior fit de penetração (ex: Farinha Caputo Tipo 00, Tomate Pelado San Marzano DOP, Queijo Grana Padano DOP, Azeite Extra Virgem Premium).
3. Estime com precisão matemática o Score de Fit Comercial (0 a 100) utilizando os critérios calibrados.
4. Gere argumentos táticos de vendas altamente persuasivos e o pitch econômico com base na melhoria de margem ou redução de desperdício na cozinha de serviço do cliente.
5. Indique as próximas ações estratégicas recomendadas para o vendedor de campo.`;

  const [promptMestre, setPromptMestre] = useState(defaultPrompt);

  // --- CARD 4: PORTFOLIO UPLOADS ---
  const [catalogFiles, setCatalogFiles] = useState<{ name: string; size: string; date: string }[]>([
    { name: 'catalogo_ctrade_v3.xlsx', size: '1.2 MB', date: 'Há 2 dias' },
    { name: 'tabela_precos_sul.csv', size: '412 KB', date: 'Há 5 dias' }
  ]);

  // --- CARD 5: CONFIGURAÇÃO DA ANÁLISE (SWITCHES) ---
  const [analysisSettings, setAnalysisSettings] = useState({
    extrairProdutos: true,
    calcularScore: true,
    identificarSegmento: true,
    gerarInsights: true,
    recomendarProdutos: true,
    gerarResumoExecutivo: true,
  });

  // --- CARD 6: CRITÉRIOS DE SCORE (SLIDERS) ---
  const [scoreWeights, setScoreWeights] = useState({
    pesoCardapio: 40,
    pesoSegmento: 25,
    pesoProdutos: 15,
    pesoTicket: 10,
    pesoPerfil: 10,
  });

  // --- MOCK INTERACTIVE ACTION HANDLERS ---
  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveApiKey = () => {
    triggerToast(
      'success',
      'API Key Salva',
      'A chave do Gemini foi salva com segurança na sua sessão de trabalho.'
    );
  };

  const handleTestConnection = () => {
    setConnectionStatus('conectando');
    triggerToast('info', 'Testando Conexão', 'Enviando ping de teste estruturado para o endpoint do Gemini...');
    
    setTimeout(() => {
      if (apiKey.trim() === '') {
        setConnectionStatus('desconectado');
        triggerToast('warning', 'Conexão Ausente', 'Insira uma chave API válida para testar a conexão.');
      } else if (apiKey.length < 15) {
        setConnectionStatus('erro');
        triggerToast('error', 'Erro de Autenticação', 'A chave API fornecida não é válida ou foi revogada.');
      } else {
        setConnectionStatus('conectado');
        triggerToast('success', 'Conectado com Sucesso', 'Conexão com Gemini API estabelecida! Latência de resposta: 412ms.');
      }
    }, 1200);
  };

  const handleRestorePromptDefault = () => {
    setPromptMestre(defaultPrompt);
    triggerToast('info', 'Prompt Restaurado', 'O Prompt Mestre foi redefinido para o modelo padrão da plataforma.');
  };

  const handleSavePrompt = () => {
    triggerToast('success', 'Prompt Mestre Salvo', 'As novas diretrizes cognitivas foram aplicadas com sucesso.');
  };

  const handleUploadCatalog = (file: File) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setCatalogFiles([
      { name: file.name, size: `${sizeMB} MB`, date: 'Agora mesmo' },
      ...catalogFiles
    ]);
    triggerToast(
      'success',
      'Catálogo Enviado',
      `O arquivo "${file.name}" foi importado para a Biblioteca de Produtos. Ele será utilizado futuramente nas recomendações de fit.`
    );
  };

  const toggleAnalysisSetting = (key: keyof typeof analysisSettings) => {
    setAnalysisSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSliderChange = (key: keyof typeof scoreWeights, val: number) => {
    setScoreWeights(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const totalWeight = (Object.values(scoreWeights) as number[]).reduce((a, b) => a + b, 0);

  // --- CARD 7: HISTÓRICO DE ANÁLISES (MOCK) ---
  const historicalAnalyses: HistoricalAnalysis[] = [
    { id: 'an-1', client: 'Osteria Bella Italia', model: 'Gemini 2.5 Pro', tokens: '14.8k', time: '4.2s', status: 'Sucesso', date: 'Hoje, 10:14' },
    { id: 'an-2', client: 'La Slice Pizzas', model: 'Gemini 2.5 Flash', tokens: '8.4k', time: '1.9s', status: 'Sucesso', date: 'Hoje, 09:32' },
    { id: 'an-3', client: 'Bistro de la Ville', model: 'Gemini 2.5 Flash', tokens: '11.1k', time: '2.1s', status: 'Sucesso', date: 'Ontem, 16:45' },
    { id: 'an-4', client: 'Gero Rio', model: 'Gemini 2.5 Pro', tokens: '19.2k', time: '4.8s', status: 'Sucesso', date: '05/07/2026' },
    { id: 'an-5', client: 'Forno & Sabor', model: 'Gemini 2.0 Flash', tokens: '6.2k', time: '1.4s', status: 'Sucesso', date: '04/07/2026' },
  ];

  // --- PRESERVED DESIGN SYSTEM SHOWCASE STATES & DATA ---
  const [btnLoading, setBtnLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMulti, setSelectedMulti] = useState<string[]>(['italiano', 'premium']);
  const [autocompleteVal, setAutocompleteVal] = useState('');
  const [scoreVal, setScoreVal] = useState<number>(85);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Central de Inteligência', active: true }
  ];

  const segmentOptions = [
    { value: 'italiano', label: 'Italiano' },
    { value: 'premium', label: 'Premium' },
    { value: 'pizzaria', label: 'Pizzaria' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'fine_dining', label: 'Fine Dining' },
  ];

  const suggestions = [
    'Bella Italia',
    'Burger & Co',
    'La Piazzetta',
    'Spoleto Gourmet',
    'Steakhouse 19',
    'Sushi Bar Sunset'
  ];

  const mockRestaurants: MockRestaurant[] = [
    { id: 1, name: 'La Cantina di Napoli', segment: 'Italiano', score: 92, potential: 'Alto', status: 'Ativo' },
    { id: 2, name: 'Steakhouse Prime', segment: 'Carnes', score: 78, potential: 'Médio', status: 'Ativo' },
    { id: 3, name: 'Pizzaria Bella Vista', segment: 'Pizzaria', score: 55, potential: 'Médio', status: 'Em Análise' },
    { id: 4, name: 'Sushi Zen', segment: 'Japonês', score: 38, potential: 'Baixo', status: 'Pendente' },
    { id: 5, name: 'Gourmet Bistrô', segment: 'Fine Dining', score: 87, potential: 'Alto', status: 'Ativo' },
    { id: 6, name: 'Hamburgueria do Chef', segment: 'Fast Food', score: 48, potential: 'Baixo', status: 'Pendente' },
  ];

  const tableColumns: Column<MockRestaurant>[] = [
    { key: 'name', header: 'Restaurante', sortable: true },
    {
      key: 'segment',
      header: 'Segmento',
      render: (row) => <Badge variant="info">{row.segment}</Badge>
    },
    {
      key: 'score',
      header: 'Score de Fit',
      sortable: true,
      render: (row) => (
        <span className={`font-bold ${row.score > 70 ? 'text-emerald-600' : row.score > 40 ? 'text-amber-600' : 'text-rose-600'}`}>
          {row.score} pts
        </span>
      )
    },
    {
      key: 'potential',
      header: 'Potencial',
      render: (row) => (
        <Badge variant={row.potential === 'Alto' ? 'success' : row.potential === 'Médio' ? 'warning' : 'danger'}>
          {row.potential}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = {
          'Ativo': 'success',
          'Em Análise': 'warning',
          'Pendente': 'danger'
        };
        return <Badge variant={variants[row.status] || 'secondary'}>{row.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <ContextMenu
          items={[
            { label: 'Ver detalhes', onClick: () => triggerToast('info', `Visualizando ${row.name}`, 'Detalhes do restaurante carregados.') },
            { label: 'Analisar cardápio', onClick: () => triggerToast('success', `Iniciando análise de ${row.name}`, 'Processamento agendado com sucesso.') },
            { label: 'Excluir registro', onClick: () => triggerToast('error', `Excluindo ${row.name}`, 'O registro será removido permanentemente.'), danger: true },
          ]}
        />
      )
    }
  ];

  // Switch custom component helper
  const renderSwitch = (enabled: boolean, onChange: () => void) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-1 focus:ring-blue-900 focus:ring-offset-1 ${
        enabled ? 'bg-blue-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <PageContainer id="page-central-inteligencia">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <Toast
            message={toast.message}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Central de Inteligência"
        subtitle="Gestão integrada da inteligência artificial, portfólio de produtos e critérios de calibração comercial do Radar CTrade."
        badge="Fase 08"
        action={
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 max-w-full overflow-x-auto gap-0.5">
            <button
              onClick={() => setActiveTab('geral')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'geral' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-blue-900" />
              <span>Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'gemini' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-blue-900" />
              <span>Gemini</span>
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'prompt' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-blue-900" />
              <span>Prompt Mestre</span>
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'produtos' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-blue-900" />
              <span>Portfólio</span>
            </button>
            <button
              onClick={() => setActiveTab('score')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'score' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-900" />
              <span>Score</span>
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'historico' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-blue-900" />
              <span>Histórico</span>
            </button>
            <button
              onClick={() => setActiveTab('seguranca')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'seguranca' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-blue-900" />
              <span>Segurança</span>
            </button>
            <button
              onClick={() => setActiveTab('playbooks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'playbooks' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-900" />
              <span>Playbooks</span>
            </button>
            <button
              onClick={() => setActiveTab('design_system')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'design_system' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-blue-900" />
              <span>Design UI</span>
            </button>
          </div>
        }
      />

      {/* TAB CONTENT SPACES */}

      {/* 1. GERAL TAB */}
      {activeTab === 'geral' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 5: Configuração da análise */}
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Workflow className="h-4 w-4 text-blue-900" />
                Configuração da Análise do Cardápio
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Determine as ações e as camadas de dados processadas pela IA no momento da leitura de cardápios submetidos pelos vendedores.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-slate-800 block">Extrair Produtos do Menu</span>
                    <p className="text-[11px] text-slate-400">Varre o documento em PDF ou imagem para elencar ingredientes de interesse.</p>
                  </div>
                  {renderSwitch(analysisSettings.extrairProdutos, () => toggleAnalysisSetting('extrairProdutos'))}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-slate-800 block">Calcular Score de Fit</span>
                    <p className="text-[11px] text-slate-400">Aplica pesos e executa a equação matemática para estimar o alinhamento comercial.</p>
                  </div>
                  {renderSwitch(analysisSettings.calcularScore, () => toggleAnalysisSetting('calcularScore'))}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-slate-800 block">Identificar Segmento de Culinária</span>
                    <p className="text-[11px] text-slate-400">Avalia receitas e terminologias para autodetectar a especialidade gastronômica.</p>
                  </div>
                  {renderSwitch(analysisSettings.identificarSegmento, () => toggleAnalysisSetting('identificarSegmento'))}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-slate-800 block">Gerar Insights Táticos</span>
                    <p className="text-[11px] text-slate-400">Produz força/fraqueza competitiva e analisa as marcas concorrentes em uso.</p>
                  </div>
                  {renderSwitch(analysisSettings.gerarInsights, () => toggleAnalysisSetting('gerarInsights'))}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-slate-800 block">Recomendar Produtos CTrade</span>
                    <p className="text-[11px] text-slate-400">Sugere as melhores substituições baseadas no portfólio importado ativo.</p>
                  </div>
                  {renderSwitch(analysisSettings.recomendarProdutos, () => toggleAnalysisSetting('recomendarProdutos'))}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-slate-800 block">Gerar Resumo Executivo Completo</span>
                    <p className="text-[11px] text-slate-400">Formata as conclusões em um dossiê comercial gerencial com pitch comercial.</p>
                  </div>
                  {renderSwitch(analysisSettings.gerarResumoExecutivo, () => toggleAnalysisSetting('gerarResumoExecutivo'))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-50 pt-4">
                <Button variant="outline" size="sm" onClick={() => triggerToast('info', 'Switches Redefinidos', 'Configurações de análise restauradas.')}>Restaurar Padrão</Button>
                <Button variant="primary" size="sm" onClick={() => triggerToast('success', 'Configurações Salvas', 'Os filtros de análise foram atualizados.')}>
                  Salvar Parâmetros
                </Button>
              </div>
            </Card>

            {/* Card 8: Limites */}
            <div className="space-y-6">
              <Card className="flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-blue-900" />
                    Limites do Plano IA
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal mb-5">Consumo atualizado em tempo real da equipe comercial.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Análises Hoje</span>
                      <span>18 / 50</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-900 h-full rounded-full" style={{ width: '36%' }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Disponível para novos uploads</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Tokens Utilizados</span>
                      <span>412.8k / 1.5M</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '27.5%' }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Quota mensal corporativa do Gemini</span>
                  </div>

                  <div className="h-px bg-slate-100 my-2" />

                  <div className="grid grid-cols-2 gap-4 text-left pt-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Última Execução</span>
                      <span className="text-xs font-bold text-slate-800">Hoje às 10:14</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Tempo Médio IA</span>
                      <span className="text-xs font-bold text-slate-800">2.4 segundos</span>
                    </div>
                  </div>
                </div>
              </Card>

              <AlertCard
                type="info"
                title="Sincronização em Lote"
                content="A Central de Inteligência monitora as chaves criptografadas no local storage. Todos os vendedores ativos utilizam esta mesma parametrização."
              />
            </div>

          </div>
        </div>
      )}

      {/* 2. GEMINI TAB */}
      {activeTab === 'gemini' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Gemini API */}
            <Card className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-blue-900" />
                Conectar Gemini API Key
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Assegure que as chamadas de processamento do cardápio ocorram através do seu plano empresarial do Google AI Studio.
              </p>

              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">API Key do Gemini</label>
                    <span className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${
                        connectionStatus === 'conectado' ? 'bg-emerald-500 animate-pulse' :
                        connectionStatus === 'erro' ? 'bg-rose-500' :
                        connectionStatus === 'conectando' ? 'bg-amber-500 animate-spin' : 'bg-slate-400'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {connectionStatus === 'conectado' ? 'Conectado' :
                         connectionStatus === 'erro' ? 'Erro' :
                         connectionStatus === 'conectando' ? 'Conectando...' : 'Desconectado'}
                      </span>
                    </span>
                  </div>

                  <div className="relative">
                    <PasswordInput
                      value={apiKey}
                      onChange={(e: any) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="font-mono text-xs pr-10"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Nota: O seu token é mantido sob sigilo criptográfico na plataforma e nunca é exposto aos canais front-end.
                  </p>
                </div>

                <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-50">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className={`h-3 w-3 ${connectionStatus === 'conectando' ? 'animate-spin' : ''}`} />}
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'conectando'}
                  >
                    Testar Conexão
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveApiKey}
                  >
                    Salvar API Key
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card 2: Modelo Utilizado & Futuras integrações */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-blue-900" />
                  Modelo Ativo do Gemini
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-normal">Selecione o modelo cognitivo padrão para este ambiente.</p>

                <div className="space-y-4">
                  <Select
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      triggerToast('info', 'Modelo Selecionado', `O motor passará a direcionar chamadas ao ${e.target.value}.`);
                    }}
                    options={[
                      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recomendado)' },
                      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Alta Complexidade)' },
                      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Legado)' }
                    ]}
                  />

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                    <strong>Flash:</strong> Recomendado para menor tempo de resposta (1.8s) e alta acurácia na extração de texto estruturado.<br />
                    <strong>Pro:</strong> Indicado para análises financeiras pesadas e geração profunda de táticas de objeções comerciais.
                  </div>
                </div>
              </Card>

              {/* Prep for integrations card */}
              <Card className="bg-slate-50 border border-slate-100">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-2">Futuras Versões</span>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Arquitetura de Modelos Multicloud</h4>
                <div className="space-y-2 text-[10px] text-slate-500 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Claude 3.5 Sonnet</span>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>DeepSeek Coder</span>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      )}

      {/* 3. PROMPT MESTRE TAB */}
      {activeTab === 'prompt' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 3: Prompt Mestre */}
            <Card className="lg:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-blue-900" />
                    Diretriz e Prompt Mestre de Análise
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Este prompt determina como o Gemini deve interpretar os ingredientes, calcular o score e gerar o pitch de campo para o vendedor.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7"
                  leftIcon={<RefreshCw className="h-3 w-3" />}
                  onClick={handleRestorePromptDefault}
                >
                  Restaurar Padrão
                </Button>
              </div>

              <div className="space-y-4">
                <Textarea
                  value={promptMestre}
                  onChange={(e) => setPromptMestre(e.target.value)}
                  placeholder="Defina as regras estruturadas para o Gemini..."
                  className="font-mono text-xs text-slate-700 min-h-[320px] leading-relaxed p-4 bg-slate-50 border border-slate-200"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <Button variant="outline" size="sm" onClick={() => triggerToast('info', 'Cancelado', 'Nenhuma alteração foi efetuada.')}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={handleSavePrompt}>Salvar Diretrizes</Button>
                </div>
              </div>
            </Card>

            {/* Card 9: Prompt Builder */}
            <div className="space-y-6">
              <Card className="flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded block w-fit mb-3">
                    Acelerador de Campo
                  </span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5">
                    Prompt Builder
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal mb-5">
                    Personalize dinamicamente as táticas comerciais do Gemini criando sub-prompts por região do estado ou linhas exclusivas de insumos.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                    Use o Prompt Builder para injetar contextos sazonais (ex: Festivais de Inverno, Semana Santa) nas táticas sem interferir no código principal.
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full text-xs"
                    leftIcon={<Sparkles className="h-4 w-4" />}
                    onClick={() => setIsPromptModalOpen(true)}
                  >
                    Editar Prompt (Prompt Builder)
                  </Button>
                </div>
              </Card>

              <AlertCard
                type="warning"
                title="Aviso de Estrutura"
                content="Modificar excessivamente a formatação final do JSON de saída do prompt pode desestabilizar as listagens nos cards das telas do Radar Comercial."
              />
            </div>

          </div>
        </div>
      )}

      {/* 4. BIBLIOTECA DE PRODUTOS TAB */}
      {activeTab === 'produtos' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 4: Upload Catálogo */}
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-blue-900" />
                Catálogo de Portfólio CTrade
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Carregue arquivos atualizados de produtos. O motor inteligente cruzará esta lista com os ingredientes dos menus para sugerir as marcas ideais ao vendedor.
              </p>

              <div className="space-y-6">
                <Upload onFileSelect={handleUploadCatalog} />

                <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">Formatos Aceitos</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold text-slate-600">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 flex flex-col items-center gap-1">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                      <span>Microsoft Excel</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 flex flex-col items-center gap-1">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span>Planilha CSV</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 flex flex-col items-center gap-1">
                      <FileDown className="h-5 w-5 text-rose-500" />
                      <span>Catálogo PDF</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 flex flex-col items-center gap-1">
                      <Cpu className="h-5 w-5 text-indigo-500" />
                      <span>Arquivo JSON</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* List of currently active catalogs */}
            <div className="space-y-6">
              <Card>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Arquivos no Portfólio ({catalogFiles.length})
                </h4>
                
                <div className="space-y-3">
                  {catalogFiles.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-all">
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">{f.name}</span>
                          <span className="text-[9px] text-slate-400">{f.size} • {f.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCatalogFiles(catalogFiles.filter((_, i) => i !== idx));
                          triggerToast('warning', 'Arquivo Removido', `O arquivo "${f.name}" foi deletado.`);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-slate-100 my-4" />

                <div className="space-y-2 text-[10px] text-slate-500 leading-relaxed font-medium">
                  <span className="font-bold text-slate-700 block">Estatísticas do Catálogo:</span>
                  • 84 SKU (Produtos de Portfólio mapeados)<br />
                  • Última sincronização global: Há 2 dias por Marcelo B.<br />
                  • Preparado para cruzamento semântico avançado.
                </div>
              </Card>

              <AlertCard
                type="info"
                title="Sincronização do Catálogo"
                content="A leitura do catálogo importado de produtos é simulada visualmente nesta fase. O motor de matching será integrado no próximo release."
              />
            </div>

          </div>
        </div>
      )}

      {/* 5. CRITÉRIOS DE SCORE TAB */}
      {activeTab === 'score' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 6: Critérios de Score */}
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-blue-900" />
                Pesos e Relevância do Score de Fit
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Ajuste os percentuais de relevância para calibrar o motor automático que avalia o nível de acoplamento do lead aos nossos insumos.
              </p>

              <div className="space-y-6">
                
                {/* Slider 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Peso do Cardápio (Ingredientes de Alta Relevância)</span>
                    <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-black">{scoreWeights.pesoCardapio}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreWeights.pesoCardapio}
                    onChange={(e) => handleSliderChange('pesoCardapio', Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <p className="text-[10px] text-slate-400">Relevância atribuída a itens como Farinhas Italianas, Tomates e Azeites encontrados.</p>
                </div>

                {/* Slider 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Peso do Segmento de Atuação (Foco em Italianos/Pizzarias)</span>
                    <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-black">{scoreWeights.pesoSegmento}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreWeights.pesoSegmento}
                    onChange={(e) => handleSliderChange('pesoSegmento', Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <p className="text-[10px] text-slate-400">Classificação com base na especialidade culinária (Trattoria e Pizzarias recebem pontuação bônus).</p>
                </div>

                {/* Slider 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Peso dos Produtos Concorrentes Identificados</span>
                    <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-black">{scoreWeights.pesoProdutos}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreWeights.pesoProdutos}
                    onChange={(e) => handleSliderChange('pesoProdutos', Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <p className="text-[10px] text-slate-400">Presença de marcas concorrentes de porte similar ou inferior que podem ser substituídas por CTrade.</p>
                </div>

                {/* Slider 4 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Peso da Faixa do Ticket Médio</span>
                    <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-black">{scoreWeights.pesoTicket}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreWeights.pesoTicket}
                    onChange={(e) => handleSliderChange('pesoTicket', Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <p className="text-[10px] text-slate-400">Tíquete estimado para refeições (Fine Dining e pratos Premium impulsionam o Score).</p>
                </div>

                {/* Slider 5 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Peso do Perfil de Cozinha (Massas Frescas / Fornos)</span>
                    <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-black">{scoreWeights.pesoPerfil}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreWeights.pesoPerfil}
                    onChange={(e) => handleSliderChange('pesoPerfil', Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <p className="text-[10px] text-slate-400">Detecção de maquinário especial ou foco de cozinha (Forno a lenha de alta temperatura, etc.).</p>
                </div>

              </div>

              {/* Slider sum notification */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${totalWeight === 100 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  <span className="text-xs text-slate-500 font-semibold">
                    Soma dos Pesos: <strong className={totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}>{totalWeight}%</strong>
                  </span>
                  {totalWeight !== 100 && (
                    <span className="text-[10px] text-rose-500 font-medium">Recomenda-se calibrar para somar exatamente 100%</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setScoreWeights({ pesoCardapio: 40, pesoSegmento: 25, pesoProdutos: 15, pesoTicket: 10, pesoPerfil: 10 });
                    triggerToast('info', 'Calibração Restaurada', 'Os pesos originais de fit foram restabelecidos.');
                  }}>
                    Restaurar Padrão
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => triggerToast('success', 'Score Calibrado', 'Os pesos de Score de Fit foram atualizados.')}>
                    Confirmar Calibração
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="bg-slate-900 text-white p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-blue-300">Resumo da Fórmula</span>
                  <h4 className="text-sm font-bold mt-1 mb-4">Equação de Fit CTrade</h4>
                </div>

                <div className="space-y-3 text-[11px] text-slate-300 font-medium leading-relaxed">
                  <p>O Score de Fit Comercial para cada estabelecimento é computado como:</p>
                  <div className="bg-slate-800 p-3.5 rounded-xl font-mono text-[10px] text-blue-200 border border-slate-700/50">
                    Fit = (C × {scoreWeights.pesoCardapio} + S × {scoreWeights.pesoSegmento} + P × {scoreWeights.pesoProdutos} + T × {scoreWeights.pesoTicket} + G × {scoreWeights.pesoPerfil}) / 100
                  </div>
                  <p className="text-[10px] text-slate-400">Onde C = Cardápio, S = Segmento, P = Produtos, T = Tíquete e G = Perfil Gastronômico.</p>
                </div>
              </Card>

              <AlertCard
                type="info"
                title="Acurácia Analítica"
                content="A calibração dos pesos afeta instantaneamente a reordenação das bases na aba de Radar Comercial, movendo os melhores leads ao topo."
              />
            </div>

          </div>
        </div>
      )}

      {/* 6. HISTÓRICO TAB */}
      {activeTab === 'historico' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          
          {/* Card 7: Histórico */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-blue-900" />
                  Registro Histórico de Execuções IA
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Log de auditoria tática das análises processadas pelo motor cognitivo do Radar CTrade.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px]"
                leftIcon={<RefreshCw className="h-3 w-3" />}
                onClick={() => triggerToast('success', 'Histórico Sincronizado', 'Lista de execuções atualizada com a base de dados.')}
              >
                Atualizar Logs
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse font-medium text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                    <th className="py-3 px-4">ID de Execução</th>
                    <th className="py-3 px-4">Cliente / Estabelecimento</th>
                    <th className="py-3 px-4">Modelo Utilizado</th>
                    <th className="py-3 px-4">Tokens Consumidos</th>
                    <th className="py-3 px-4">Tempo de Resposta</th>
                    <th className="py-3 px-4">Data e Hora</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historicalAnalyses.map((an) => (
                    <tr key={an.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{an.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{an.client}</td>
                      <td className="py-3 px-4 text-slate-500">{an.model}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 font-bold">{an.tokens}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{an.time}</td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">{an.date}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success">{an.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400 font-semibold px-1">
              <span>Mostrando 5 de 284 análises globais.</span>
              <button className="text-blue-900 hover:underline">Ver Log Completo de Transações</button>
            </div>
          </Card>
        </div>
      )}

      {/* 7. SEGURANÇA TAB */}
      {activeTab === 'seguranca' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 10: Segurança */}
            <Card className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-blue-900" />
                Políticas de Segurança e Criptografia
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Auditoria e controle de privacidade de dados sensíveis, conformidade com canais criptográficos e proteção das API Keys.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-2 text-left">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block">API Key Criptografada</span>
                    <div className="flex items-center gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-800">Criptografia Local (AES-256)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Nenhum token é mantido desprotegido em canais de cookies do navegador ou enviado para terceiros.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-2 text-left">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block">Conexão Segura Ativa</span>
                    <div className="flex items-center gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-800">SSL TLS 1.3 / HTTPS restrito</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Tráfego de dados blindado e canais de trânsito 100% seguros de ponta a ponta.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-2 text-left">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block">Último Acesso Comercial</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-blue-900" />
                      <span className="text-xs font-bold text-slate-800">Hoje, 09:12</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Sua sessão de acesso atualizado de IP mapeado: 187.54.212.9 (Região SP).</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-2 text-left">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block">Políticas de Treinamento</span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5 text-blue-900" />
                      <span className="text-xs font-bold text-slate-800">Retenção Zero (Zero-Data Training)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Nenhum dado é utilizado pela OpenAI ou Google para refinar modelos de LLM públicos.</p>
                  </div>

                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 mt-4 text-left">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">Conformidade e Segurança</span>
                    <p className="text-[11px] text-emerald-700 leading-normal mt-0.5">
                      Este ambiente do Radar Comercial está em plena conformidade com as diretrizes de governança do CTrade, assegurando a blindagem de informações corporativas e sigilo absoluto de dados dos leads.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Side summary of audits */}
            <div className="space-y-6">
              <Card className="space-y-3">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Privacidade de Dados</span>
                <h4 className="text-xs font-bold text-slate-800">Termos de Uso do Motor IA</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Todos os arquivos submetidos (PDFs, imagens) são processados de forma temporária e deletados logo após a geração de metadados táticos e estruturação de cards.
                </p>
                <div className="h-px bg-slate-100" />
                <button
                  className="text-xs text-blue-900 font-bold hover:underline flex items-center gap-1"
                  onClick={() => triggerToast('info', 'Termos de Segurança', 'Nossos termos estão de acordo com a LGPD.')}
                >
                  Ler Políticas Completas <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </Card>
            </div>

          </div>
        </div>
      )}

      {/* 8. PLAYBOOKS TAB */}
      {activeTab === 'playbooks' && (
        <div className="space-y-6 mt-6 animate-fadeIn">
          <div className="mb-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-blue-900" />
              Playbooks Comerciais Inteligentes
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Templates estratégicos de vendas, contorno de objeções e abordagens por perfil de estabelecimento gastronômico. (Funcionalidade visual pré-mapeada para futuras versões)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="playbooks-grid">
            
            {/* Playbook 1 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                    <Utensils className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Restaurantes Italianos</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Estratégias de vendas com foco em Azeites Premium e massas secas artesanais de grano duro.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

            {/* Playbook 2 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                    <Store className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Pizzarias Premium</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Elevação de tíquete médio usando lascas de Grana Padano DOP, Farinhas Caputo e embutidos Negroni fatiados.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

            {/* Playbook 3 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-amber-50 text-amber-800 rounded-lg">
                    <Hotel className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Hotéis de Negócios</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Abordagem para buffets de café da manhã executivo e catering para eventos corporativos.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

            {/* Playbook 4 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-indigo-50 text-indigo-800 rounded-lg">
                    <Compass className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Resorts & Lazer</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Logística e fornecimento em grande escala com foco em marcas exclusivas de importação própria.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

            {/* Playbook 5 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-rose-50 text-rose-800 rounded-lg">
                    <Utensils className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Casas de Carnes / Steak</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Introdução de azeites defumados artesanais e flor de sal gourmet para finalização de carnes nobres.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

            {/* Playbook 6 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-amber-50 text-amber-800 rounded-lg">
                    <Coffee className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Cafeterias Especiais</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Foco na oferta de leites vegetais baristas, licores finos e caldas aromáticas artesanais.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

            {/* Playbook 7 */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                    <Store className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Padarias Artesanais</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Abordagens com foco em farinhas especiais de alto rendimento para panificação de longa fermentação.
                </p>
              </div>
              <button
                onClick={() => triggerToast('info', 'Abordagem Comercial', 'Este playbook está em desenvolvimento e será ativado em breve.')}
                className="mt-5 w-full text-center text-xs font-bold text-blue-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/50 transition-colors"
              >
                Visualizar Playbook
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 9. DESIGN SYSTEM PRESERVED TAB */}
      {activeTab === 'design_system' && (
        <div className="space-y-10 pb-16 animate-fadeIn mt-6">
          <div className="rounded-xl bg-blue-900 text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-blue-300">Design System Preservado</span>
              <h2 className="text-xl font-bold tracking-tight mt-1">Biblioteca Visual CTrade</h2>
              <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
                Os componentes originais do Radar CTrade foram mantidos intactos nesta aba para visualização e verificação de fidelidade do Design System.
              </p>
            </div>
            <div className="inline-flex gap-2 bg-blue-950/40 p-2.5 rounded-lg border border-blue-800">
              <span className="text-[10px] font-bold text-blue-200">Paleta Principal:</span>
              <div className="flex gap-1">
                <span className="h-4 w-4 rounded bg-blue-900 border border-blue-700" title="Primary Blue-900" />
                <span className="h-4 w-4 rounded bg-slate-900" title="Dark Slate" />
                <span className="h-4 w-4 rounded bg-slate-100" title="Neutral Gray" />
                <span className="h-4 w-4 rounded bg-emerald-600" title="Success Green" />
                <span className="h-4 w-4 rounded bg-rose-600" title="Error Red" />
              </div>
            </div>
          </div>

          {/* Buttons Showcase */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Botões e Ações
            </h3>
            
            <Card>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary" onClick={() => triggerToast('info', 'Primary Clicked', 'Botão de ação primária do sistema.')}>Primary</Button>
                <Button variant="secondary" onClick={() => triggerToast('info', 'Secondary Clicked', 'Ações de apoio.')}>Secondary</Button>
                <Button variant="outline" onClick={() => triggerToast('info', 'Outline Clicked', 'Ações secundárias ou links.')}>Outline</Button>
                <Button variant="ghost" onClick={() => triggerToast('info', 'Ghost Clicked', 'Menu e visual discreto.')}>Ghost</Button>
                <Button variant="success" onClick={() => triggerToast('success', 'Success Clicked', 'Salvar ou confirmar dados.')}>Success</Button>
                <Button variant="danger" onClick={() => triggerToast('error', 'Danger Clicked', 'Excluir ou cancelar dados de alto risco.')}>Danger</Button>
              </div>

              <div className="h-px bg-slate-100 my-5" />

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Sizing (Tamanhos)</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="primary">Small (sm)</Button>
                    <Button size="md" variant="primary">Medium (md)</Button>
                    <Button size="lg" variant="primary">Large (lg)</Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Com Estados</span>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="secondary" isLoading={btnLoading} onClick={() => {
                      setBtnLoading(true);
                      setTimeout(() => setBtnLoading(false), 2000);
                    }}>
                      {btnLoading ? 'Carregando...' : 'Clique para Carregar'}
                    </Button>
                    <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />}>Com Ícone</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Score Indicator and KPIs Showcase */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Score de Fit & KPIs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 col-span-1 md:col-span-2">
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Simulador de Fit Comercial</span>
                  <p className="text-xs text-slate-500 mb-4 text-left">
                    Altere o valor para simular as 3 faixas visuais de calibração: 0–40 (Vermelho), 41–70 (Amarelo) e 71–100 (Verde).
                  </p>
                  
                  <ScoreIndicator score={scoreVal} size="lg" />

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scoreVal}
                      onChange={(e) => setScoreVal(Number(e.target.value))}
                      className="flex-1 accent-blue-900"
                    />
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border">
                      {scoreVal} pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <MetricCard
                  title="Clientes Mapeados"
                  value="128"
                  trend={{ value: '+14% este mês', type: 'up' }}
                  comparisonText="vs. período anterior"
                />
                <MetricCard
                  title="Score de Fit Médio"
                  value="74.2"
                  trend={{ value: 'Elevado', type: 'neutral' }}
                  comparisonText="CTrade Alinhado"
                />
              </div>
            </div>
          </div>

          {/* Inputs & Forms Showcase */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Formulários, Inputs e Filtros
            </h3>

            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                <Input
                  label="Nome do Estabelecimento"
                  placeholder="Ex: Osteria Bella Italia"
                  helperText="Nome fantasia do restaurante."
                />
                
                <Input
                  label="Erro de Validação"
                  placeholder="Digite algo incorreto..."
                  error="Este campo é obrigatório no cadastro."
                />

                <PasswordInput
                  label="Senha de Acesso (Placeholder)"
                  placeholder="Sua senha secreta"
                />

                <Select
                  label="Segmento de Culinária"
                  options={[
                    { value: 'italiano', label: 'Italiana' },
                    { value: 'pizzaria', label: 'Pizzaria' },
                    { value: 'japones', label: 'Japonesa' },
                    { value: 'carnes', label: 'Churrascaria' },
                  ]}
                />

                <DatePicker
                  label="Data de Cadastro"
                />

                <Autocomplete
                  label="Busca de Leads (Sugestões)"
                  value={autocompleteVal}
                  onChange={setAutocompleteVal}
                  suggestions={suggestions}
                  placeholder="Comece a digitar..."
                />

                <div className="col-span-1 md:col-span-3">
                  <MultiSelect
                    label="Tags Comerciais do Cliente"
                    options={segmentOptions}
                    selectedValues={selectedMulti}
                    onChange={setSelectedMulti}
                  />
                </div>

                <div className="col-span-1 md:col-span-3">
                  <Textarea
                    label="Observações Comerciais Estratégicas"
                    placeholder="Anote detalhes de fit, volume de pratos, marcas concorrentes encontradas no cardápio..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Modals and Drawers Trigger Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Interações, Modais e Drawers
            </h3>

            <Card>
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="outline"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Abrir Modal Demonstrativo
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<Compass className="h-4 w-4" />}
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Abrir Drawer Lateral
                </Button>

                <Dropdown
                  trigger={
                    <Button variant="secondary">
                      Menu Dropdown <ChevronDown className="h-4 w-4 ml-1 shrink-0" />
                    </Button>
                  }
                  items={[
                    { label: 'Exportar XLS', onClick: () => triggerToast('info', 'Exportar XLS', 'Ação agendada.') },
                    { label: 'Exportar PDF', onClick: () => triggerToast('info', 'Exportar PDF', 'Documento gerado.') },
                    { label: 'Deletar Leads', onClick: () => triggerToast('error', 'Remover tudo', 'Todos os leads serão deletados.'), danger: true },
                  ]}
                />
              </div>

              {/* Accordion visual menu */}
              <div className="mt-6 max-w-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Accordions Reutilizáveis</span>
                <Accordion title="O que é o Score de Fit Comercial?">
                  <p>O score de fit comercial é uma pontuação automática calculada pelo sistema que avalia o nível de acoplamento entre as necessidades do restaurante (com base no cardápio dele) e as soluções de alimentos que a CTrade comercializa.</p>
                </Accordion>
                <Accordion title="Quais arquivos o motor de IA aceita?">
                  <p>Atualmente aceitamos documentos nos formatos PDF e imagens nos formatos PNG, JPG e JPEG. O tamanho máximo permitido para o MVP é de 10 megabytes.</p>
                </Accordion>
              </div>
            </Card>

            {/* Modal Demonstration */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Análise Estratégica Base"
              footer={
                <>
                  <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>Fechar</Button>
                  <Button variant="primary" size="sm" onClick={() => {
                    setIsModalOpen(false);
                    triggerToast('success', 'Ação Confirmada', 'Modal fechado e alteração salva.');
                  }}>Confirmar</Button>
                </>
              }
            >
              <div className="space-y-3 text-left">
                <p>Este é um modal reutilizável de demonstração. Ele se adapta de forma fluida a layouts responsivos (Desktop, Notebook, Mobile) e possui fundo embaçado (backdrop-blur) para melhor foco do usuário.</p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700 block mb-1">Acessibilidade:</span>
                  Possui fechamento por teclado (tecla ESC ou clique no overlay cinza) e gerenciamento de foco nativo.
                </div>
              </div>
            </Modal>

            {/* Lateral Drawer Demonstration */}
            <LateralDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              title="Painel de Insights Rápidos"
              footer={
                <Button variant="primary" size="sm" className="w-full" onClick={() => setIsDrawerOpen(false)}>
                  Entendido
                </Button>
              }
            >
              <div className="space-y-4 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Últimos Insights Gerados</span>
                
                <InsightCard
                  title="Foco em queijos italianos"
                  content="Identificado alta presença de queijo Grana Padano e Parmesão no menu. Ótima oportunidade de cross-selling."
                />

                <InsightCard
                  title="Carta de vinhos premium"
                  content="O estabelecimento possui vinhos de alto padrão. Sugerir produtos da linha gourmet de importados CTrade."
                  category="Oportunidade Comercial"
                />

                <div className="border border-slate-100 p-3 rounded-lg bg-slate-50 text-[11px] text-slate-400 leading-relaxed">
                  O Drawer Lateral é ideal para exibir informações adicionais de clientes e detalhes de relatórios de IA sem tirar o vendedor do contexto da página principal.
                </div>
              </div>
            </LateralDrawer>
          </div>

          {/* DataTable Showcase */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Tabela de Dados (DataTable Reutilizável)
            </h3>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed text-left">
                Tabela inteligente contendo paginação de registros, pesquisa dinâmica por texto (filtra instantaneamente) e ordenação por colunas clicáveis (Restaurante e Score).
              </p>
              <DataTable
                columns={tableColumns}
                data={mockRestaurants}
                searchPlaceholder="Pesquisar restaurante por nome..."
                searchKey="name"
                initialRowsPerPage={5}
              />
            </div>
          </div>

          {/* Feedback & Badges & Empty States */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Badges, Chips, Toasts e Empty States
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="space-y-4 text-left">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Tipos de Badges</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="dark">Dark Badge</Badge>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Chips / Tags Comerciais</span>
                  <div className="flex flex-wrap gap-2">
                    <Tag label="Italiano" />
                    <Tag label="Premium" colorClass="bg-blue-50 border-blue-200 text-blue-700" />
                    <Tag label="Pizzaria" colorClass="bg-emerald-50 border-emerald-200 text-emerald-700" />
                    <Tag label="Com exclusão" onRemove={() => triggerToast('info', 'Tag Removida', 'Ação mockada com sucesso.')} />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Tooltip Informativo</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Passe o mouse no ícone para ajuda:</span>
                    <Tooltip content="Essas informações são 100% fictícias para demonstração do Design System.">
                      <HelpCircle className="h-4.5 w-4.5 text-slate-400 hover:text-blue-600 cursor-help" />
                    </Tooltip>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Gabarito de Estados de Interface (Fase 10)</span>
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(['empty', 'loading', 'error', 'success', 'no_results', 'no_connection', 'first_access'] as const).map((st) => {
                    const labels = {
                      empty: 'Empty State',
                      loading: 'Loading State',
                      error: 'Erro',
                      success: 'Sucesso',
                      no_results: 'Sem Resultados',
                      no_connection: 'Sem Conexão',
                      first_access: '1º Acesso',
                    };
                    return (
                      <button
                        key={st}
                        onClick={() => setStatePreview(st)}
                        className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                          statePreview === st
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        {labels[st]}
                      </button>
                    );
                  })}
                </div>

                <div className="border border-slate-100 rounded-xl bg-white p-6 shadow-2xs min-h-[260px] flex items-center justify-center">
                  {statePreview === 'empty' && (
                    <EmptyState
                      title="Nenhum cardápio processado"
                      description="O vendedor ainda não submeteu nenhum arquivo PDF para análise de IA neste estabelecimento."
                      action={
                        <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                          Adicionar Cardápio
                        </Button>
                      }
                    />
                  )}

                  {statePreview === 'loading' && (
                    <div className="text-center p-6 max-w-md mx-auto space-y-4">
                      <div className="relative h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Processando análise de cardápio...</h4>
                        <p className="mt-1 text-xs text-slate-400">Nossos modelos de inteligência comercial estão extraindo ingredientes e calculando scores de aderência.</p>
                      </div>
                      <div className="pt-2">
                        <ProgressBar value={65} max={100} colorClass="bg-blue-600" />
                        <span className="text-[10px] text-slate-400 font-bold mt-1 block">65% concluído...</span>
                      </div>
                    </div>
                  )}

                  {statePreview === 'error' && (
                    <div className="text-center p-6 max-w-md mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 mx-auto text-rose-600">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Erro ao processar documento</h4>
                        <p className="mt-1 text-xs text-slate-400">Não foi possível realizar o parse do arquivo PDF enviado. O arquivo pode estar corrompido ou o formato é incompatível.</p>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                          Tentar Novamente
                        </Button>
                      </div>
                    </div>
                  )}

                  {statePreview === 'success' && (
                    <div className="text-center p-6 max-w-md mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 mx-auto text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Análise concluída com sucesso</h4>
                        <p className="mt-1 text-xs text-slate-400">O score de compatibilidade do restaurante foi reclassificado para 94 pts com base no novo cardápio.</p>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" variant="primary">
                          Visualizar Insights de IA
                        </Button>
                      </div>
                    </div>
                  )}

                  {statePreview === 'no_results' && (
                    <div className="text-center p-6 max-w-md mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mx-auto text-slate-400">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Sem resultados correspondentes</h4>
                        <p className="mt-1 text-xs text-slate-400">Não encontramos nenhum estabelecimento que corresponda aos filtros de busca selecionados.</p>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" variant="secondary">
                          Limpar Todos os Filtros
                        </Button>
                      </div>
                    </div>
                  )}

                  {statePreview === 'no_connection' && (
                    <div className="text-center p-6 max-w-md mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 mx-auto text-amber-600">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Sem conexão com o motor de IA</h4>
                        <p className="mt-1 text-xs text-slate-400">Não foi possível estabelecer contato com a API do Gemini. Verifique sua chave API ou conexão de rede.</p>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                          Testar Conexão Novamente
                        </Button>
                      </div>
                    </div>
                  )}

                  {statePreview === 'first_access' && (
                    <div className="text-center p-6 max-w-md mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 mx-auto text-indigo-600">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Bem-vindo à CTrade Inteligência</h4>
                        <p className="mt-1 text-xs text-slate-400">Mapeie novos restaurantes, faça o upload de cardápios PDF e utilize IA para otimizar suas abordagens comerciais.</p>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" variant="primary">
                          Iniciar Tour do Produto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PROMPT BUILDER MODAL (Card 9) --- */}
      <Modal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        title="Prompt Builder — Assistente de Personas"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsPromptModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={() => {
              setIsPromptModalOpen(false);
              triggerToast('success', 'Configuração de Persona Salva', 'Configuração tática de personas comerciais aplicada com sucesso!');
            }}>
              Aplicar Persona
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-500 leading-relaxed">
            Personalize o estilo de redação e o vocabulário da IA para se adequar a perfis específicos de clientes ou microrregiões.
          </p>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Persona Comercial Selecionada</span>
            <select
              defaultValue="consultor"
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-900 focus:bg-white outline-none"
              onChange={(e) => {
                triggerToast('info', 'Foco de Abordagem Selecionado', `A IA priorizará argumentos baseados em ${e.target.value === 'consultor' ? 'Gourmet/Chef' : 'Eficiência/Economia'}.`);
              }}
            >
              <option value="consultor">Consultor Gastronômico Premium (Foco em Receitas & Chef)</option>
              <option value="economico">Gestor Financeiro Pragmático (Foco em Margem & Desperdício)</option>
              <option value="agressivo">Vendedor de Alta Conversão (Abordagem Direta & Fechamento)</option>
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Prompt Adicional de Persona (Customização Futura)</span>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 font-mono outline-none min-h-[120px] focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all"
              placeholder="Ex: Priorize tom de urgência, fale de frete grátis na primeira compra e destaque a validade longa dos queijos frescos..."
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-relaxed flex gap-2">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Nota Importante:</strong> Esta funcionalidade de compilação dinâmica do Prompt Builder está pré-arquitetada visualmente e será totalmente implementada nas versões futuras com persistência em banco.
            </span>
          </div>
        </div>
      </Modal>

    </PageContainer>
  );
}
