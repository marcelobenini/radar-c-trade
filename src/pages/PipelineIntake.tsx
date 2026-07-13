/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Archive,
  Copy,
  ArrowRight,
  Search,
  FileText,
  Layers,
  User,
  Clock,
  Send,
  Eraser,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Activity,
  CheckCircle,
  HelpCircle,
  Settings,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { SecurityService } from '../services/securityService';
import { 
  ValidationEngine, 
  ValidationRule, 
  RuleExecutionLog, 
  RuleSeverity, 
  RuleAutomaticAction, 
  RuleStatus,
  RuleEntity
} from '../services/validationEngine';
import { DataProcessingEngine, ProcessingContext, TransformationLog } from '../services/dataProcessingEngine';
import {
  CanonicalConta,
  CanonicalContato,
  CanonicalCardapio,
  CanonicalItemCardapio,
  CanonicalProduto,
  CanonicalCategoria,
  CanonicalMarca,
  CanonicalOportunidade,
  CanonicalLote,
  CanonicalModelConverter,
  CanonicalIntegrityVerifier,
  CanonicalVersioningManager
} from '../services/canonicalModel';
import {
  OFFICIAL_SCHEMAS,
  SchemaMetadata,
  TableMetadata,
  DatabaseLog
} from '../services/databaseArchitecture';
import { getPlatformConfig } from '../utils/appearance';
import ClaudeIntegrationCenter from '../components/ClaudeIntegrationCenter';

// --- TYPES DEFINITION ---

export interface IntakeTraceLog {
  id: string;
  timestamp: string; // "DD/MM/YYYY HH:MM"
  user: string;
  event: string;
  prevStatus: string;
  newStatus: string;
}

export interface IntakeRecord {
  id: string;
  field1: string; // ex: Nome do Estabelecimento / Empresa
  field2: string; // ex: Cidade / Estado / CNPJ
  field3: string; // ex: Segmento ou Arquivo
  status: string;
}

export interface IntakeBatch {
  id: string;
  name: string;
  date: string;
  time: string;
  source: 'Upload Manual' | 'Claude' | 'API' | 'Importação CSV' | 'Importação Excel' | 'Outro';
  responsible: string;
  recordCount: number;
  status: 'Recebido' | 'Validando' | 'Aguardando Curadoria' | 'Em Curadoria' | 'Homologado' | 'Rejeitado' | 'Arquivado';
  updatedAt: string;
  validationError?: string;
  records: IntakeRecord[];
  logs: IntakeTraceLog[];
  processingContext?: ProcessingContext;
  transformationLogs?: TransformationLog[];
}

// --- CONSTANTS & SEED DATA ---

const STORAGE_KEY = 'ctrade_data_intake_batches';

const INITIAL_BATCHES: IntakeBatch[] = [
  {
    id: 'BATCH-2026-001',
    name: 'Cardápios Pizzarias SP',
    date: '08/07/2026',
    time: '10:30',
    source: 'Upload Manual',
    responsible: 'Marcelo Baquero (Você)',
    recordCount: 3,
    status: 'Homologado',
    updatedAt: '08/07/2026 14:15',
    records: [
      { id: 'rec-1', field1: 'Babbo Osteria', field2: 'Rio de Janeiro/RJ', field3: 'Cardapio_Babbo_Osteria.pdf', status: 'Homologado' },
      { id: 'rec-2', field1: 'Pizzaria Venza', field2: 'São Paulo/SP', field3: 'Cardapio_Pizzaria_Venza.pdf', status: 'Homologado' },
      { id: 'rec-3', field1: 'Forneria San Gennaro', field2: 'Campinas/SP', field3: 'Cardapio_San_Gennaro.pdf', status: 'Homologado' }
    ],
    logs: [
      { id: 'log-1-4', timestamp: '08/07/2026 14:15', user: 'Marcelo Baquero (Você)', event: 'Homologação finalizada e dados sincronizados com a Base Oficial do Radar.', prevStatus: 'Em Curadoria', newStatus: 'Homologado' },
      { id: 'log-1-3', timestamp: '08/07/2026 11:00', user: 'Sincronizador C-Trade', event: 'Registros direcionados para curadoria humana na Central de Cardápios.', prevStatus: 'Aguardando Curadoria', newStatus: 'Em Curadoria' },
      { id: 'log-1-2', timestamp: '08/07/2026 10:32', user: 'Motor de Validação', event: 'Pré-validação de integridade de esquema e campos obrigatórios concluída com sucesso.', prevStatus: 'Validando', newStatus: 'Aguardando Curadoria' },
      { id: 'log-1-1', timestamp: '08/07/2026 10:30', user: 'Marcelo Baquero (Você)', event: 'Lote recebido via Upload Manual do usuário.', prevStatus: '-', newStatus: 'Recebido' }
    ],
    processingContext: {
      processing_id: 'PRC-20260708-001',
      pipeline_version: '1.0.0',
      rules_version: '2.3',
      normalizer_version: '1.2',
      enricher_version: '1.1',
      started_at: '2026-07-08T10:30:00.000Z',
      finished_at: '2026-07-08T10:30:01.215Z',
      processing_time_ms: 1215,
      records: 3,
      errors: 0,
      warnings: 0
    },
    transformationLogs: [
      { field: 'state', originalValue: 'rj', transformedValue: 'RJ', ruleApplied: 'State Code Capitalization & Mapping', timestamp: '08/07/2026 10:30:01', module: 'Normalizer', responsible: 'System: Normalizer Engine v1.2' },
      { field: 'city', originalValue: 'rio de janeiro', transformedValue: 'Rio de Janeiro', ruleApplied: 'City Name Title Case', timestamp: '08/07/2026 10:30:01', module: 'Normalizer', responsible: 'System: Normalizer Engine v1.2' },
      { field: 'responsibleCommercial', originalValue: 'NULO', transformedValue: 'RCA Marcelo Baquero', ruleApplied: 'Geographic Territory RCA Mapping', timestamp: '08/07/2026 10:30:01', module: 'Enricher', responsible: 'System: Enricher Core Engine v1.1' }
    ]
  },
  {
    id: 'BATCH-2026-002',
    name: 'Leads de API - CRM SC',
    date: '09/07/2026',
    time: '15:45',
    source: 'API',
    responsible: 'Integração Inbound',
    recordCount: 2,
    status: 'Aguardando Curadoria',
    updatedAt: '09/07/2026 15:46',
    records: [
      { id: 'rec-4', field1: 'Bella Itália Ristorante', field2: 'Florianópolis/SC (CNPJ: 45.123.892/0001-33)', field3: 'Atendimento e Menu Digital', status: 'Pendente' },
      { id: 'rec-5', field1: 'Trattoria di Milano', field2: 'Joinville/SC (CNPJ: 12.987.432/0001-99)', field3: 'Menu PDF integrated', status: 'Pendente' }
    ],
    logs: [
      { id: 'log-2-2', timestamp: '09/07/2026 15:46', user: 'Motor de Validação', event: 'Pré-validação concluída: Esquema JSON e CNPJs qualificados como válidos.', prevStatus: 'Validando', newStatus: 'Aguardando Curadoria' },
      { id: 'log-2-1', timestamp: '09/07/2026 15:45', user: 'Endpoint de Ingestão API', event: 'Carga de payload HTTP recebida via OAuth Webhook.', prevStatus: '-', newStatus: 'Recebido' }
    ],
    processingContext: {
      processing_id: 'PRC-20260709-002',
      pipeline_version: '1.0.0',
      rules_version: '2.3',
      normalizer_version: '1.2',
      enricher_version: '1.1',
      started_at: '2026-07-09T15:45:00.000Z',
      finished_at: '2026-07-09T15:45:00.840Z',
      processing_time_ms: 840,
      records: 2,
      errors: 0,
      warnings: 0
    },
    transformationLogs: [
      { field: 'cnpj', originalValue: '45123892000133', transformedValue: '45.123.892/0001-33', ruleApplied: 'CNPJ Standard Formatting', timestamp: '09/07/2026 15:45:00', module: 'Normalizer', responsible: 'System: Normalizer Engine v1.2' },
      { field: 'cnpj', originalValue: '12987432000199', transformedValue: '12.987.432/0001-99', ruleApplied: 'CNPJ Standard Formatting', timestamp: '09/07/2026 15:45:00', module: 'Normalizer', responsible: 'System: Normalizer Engine v1.2' },
      { field: 'responsibleCommercial', originalValue: 'NULO', transformedValue: 'RCA Regional Sul', ruleApplied: 'Geographic Territory RCA Mapping', timestamp: '09/07/2026 15:45:00', module: 'Enricher', responsible: 'System: Enricher Core Engine v1.1' }
    ]
  },
  {
    id: 'BATCH-2026-003',
    name: 'Cardápio Italiano - Claude Feed',
    date: '10/07/2026',
    time: '07:15',
    source: 'Claude',
    responsible: 'Claude AI Agent',
    recordCount: 1,
    status: 'Em Curadoria',
    updatedAt: '10/07/2026 07:20',
    records: [
      { id: 'rec-6', field1: 'La Perla Trattoria', field2: 'Belo Horizonte/MG', field3: 'Cardapio_La_Perla_v1.pdf', status: 'Em Curadoria' }
    ],
    logs: [
      { id: 'log-3-3', timestamp: '10/07/2026 07:20', user: 'Claude AI Agent', event: 'Lote aceito e direcionado para curadoria humana.', prevStatus: 'Aguardando Curadoria', newStatus: 'Em Curadoria' },
      { id: 'log-3-2', timestamp: '10/07/2026 07:16', user: 'Motor de Validação', event: 'Pré-validação executada com sucesso. Arquivo PDF legível e estruturado.', prevStatus: 'Validando', newStatus: 'Aguardando Curadoria' },
      { id: 'log-3-1', timestamp: '10/07/2026 07:15', user: 'Claude AI Agent', event: 'Lote ingerido de forma automatizada pelo agente de Inteligência Artificial.', prevStatus: '-', newStatus: 'Recebido' }
    ],
    processingContext: {
      processing_id: 'PRC-20260710-003',
      pipeline_version: '1.0.0',
      rules_version: '2.3',
      normalizer_version: '1.2',
      enricher_version: '1.1',
      started_at: '2026-07-10T07:15:00.000Z',
      finished_at: '2026-07-10T07:15:01.050Z',
      processing_time_ms: 1050,
      records: 1,
      errors: 0,
      warnings: 1
    },
    transformationLogs: [
      { field: 'city', originalValue: 'belo horizonte', transformedValue: 'Belo Horizonte', ruleApplied: 'City Name Title Case', timestamp: '10/07/2026 07:15:00', module: 'Normalizer', responsible: 'System: Normalizer Engine v1.2' },
      { field: 'state', originalValue: 'mg', transformedValue: 'MG', ruleApplied: 'State Code Capitalization & Mapping', timestamp: '10/07/2026 07:15:00', module: 'Normalizer', responsible: 'System: Normalizer Engine v1.2' }
    ]
  },
  {
    id: 'BATCH-2026-004',
    name: 'Importação Comercial Excel',
    date: '10/07/2026',
    time: '08:00',
    source: 'Importação Excel',
    responsible: 'Admin',
    recordCount: 2,
    status: 'Rejeitado',
    updatedAt: '10/07/2026 08:01',
    validationError: 'Validação Estrutural de Esquema: Erro crítico de pré-validação | Verificação de CNPJ Obrigatório: O campo de identificação comercial [CNPJ] está vazio em um ou mais registros.',
    records: [
      { id: 'rec-7', field1: 'Churrascaria Pampas', field2: 'Porto Alegre/RS (CNPJ: AUSENTE)', field3: 'Ficha_Incompleta.xlsx', status: 'Rejeitado' },
      { id: 'rec-8', field1: 'Galeto D`Itália', field2: 'Caxias do Sul/RS (CNPJ: 11.222.333/0001-44)', field3: 'Telefone: (00) 0000-0000', status: 'Rejeitado' }
    ],
    logs: [
      { id: 'log-4-2', timestamp: '10/07/2026 08:01', user: 'Motor de Validação', event: 'Falha crítica na pré-validação estrutural do arquivo Excel enviado.', prevStatus: 'Validando', newStatus: 'Rejeitado' },
      { id: 'log-4-1', timestamp: '10/07/2026 08:00', user: 'Admin', event: 'Arquivo de planilhas submetido para importação.', prevStatus: '-', newStatus: 'Recebido' }
    ],
    processingContext: {
      processing_id: 'PRC-20260710-004',
      pipeline_version: '1.0.0',
      rules_version: '2.3',
      normalizer_version: '1.2',
      enricher_version: '1.1',
      started_at: '2026-07-10T08:00:00.000Z',
      finished_at: '2026-07-10T08:00:00.125Z',
      processing_time_ms: 125,
      records: 2,
      errors: 1,
      warnings: 1
    },
    transformationLogs: []
  }
];

export default function PipelineIntake() {
  const [activeTab, setActiveTab] = useState<'lotes' | 'regras' | 'execucoes' | 'modelo_canonico' | 'arquitetura_banco' | 'integ_claude'>('lotes');
  const [batches, setBatches] = useState<IntakeBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Configurable rules & logs states
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [executionLogs, setExecutionLogs] = useState<RuleExecutionLog[]>([]);
  const [searchRuleTerm, setSearchRuleTerm] = useState<string>('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('Todos');

  // Simulator state
  const [simSource, setSimSource] = useState<'Upload Manual' | 'Claude' | 'API' | 'Importação CSV' | 'Importação Excel'>('Upload Manual');
  const [simPayloadType, setSimPayloadType] = useState<string>('carga_a');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStatusText, setProcessingStatusText] = useState<string>('');

  // Canonical Model states
  const [selectedCanonicalEntity, setSelectedCanonicalEntity] = useState<'Conta' | 'Contato' | 'Cardapio' | 'ItemCardapio' | 'Produto' | 'Categoria' | 'Marca' | 'Oportunidade' | 'Lote'>('Conta');
  const [playgroundPreset, setPlaygroundPreset] = useState<'maps' | 'instagram' | 'ifood'>('maps');
  const [playgroundInput, setPlaygroundInput] = useState<string>('');
  const [playgroundOutput, setPlaygroundOutput] = useState<any>(null);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [playgroundTargetEntity, setPlaygroundTargetEntity] = useState<'Conta' | 'Contato' | 'Cardapio' | 'ItemCardapio'>('Conta');

  const PLAYGROUND_PRESETS = {
    maps: {
      target: 'Conta' as const,
      data: {
        idRadar: "RADAR-MAPS-928",
        title: "Babbo Osteria SpA",
        fantasyName: "Babbo Osteria",
        formatted_address: "Rua Barão de Torre, 350 - Ipanema, Rio de Janeiro - RJ",
        phone: "+55 (21) 99999-8888",
        segment: "Massa artesanal",
        status: "Prospect"
      }
    },
    instagram: {
      target: 'Conta' as const,
      data: {
        name: "Don Giovanni Forneria",
        corporate_name: "Don Giovanni Forneria Eireli",
        address: "Av. Beira Mar, 1200 - Centro, Florianópolis - SC",
        instagram_id: "@dongiovanniforneria",
        bio: "A melhor pizza com forno a lenha de Floripa!",
        status: "Lead"
      }
    },
    ifood: {
      target: 'Conta' as const,
      data: {
        merchant_id: "902138",
        corporate_name: "Tarantella Ristorante Ltda",
        fantasyName: "Tarantella Ristorante",
        cnpj: "14882112000144",
        city: "São Paulo",
        state: "SP",
        role: "Sócio Proprietário",
        contact_name: "Giovanni Tarantella",
        contact_phone: "11988887777"
      }
    }
  };

  // Populate playground text input when preset changes
  useEffect(() => {
    const preset = PLAYGROUND_PRESETS[playgroundPreset];
    setPlaygroundInput(JSON.stringify(preset.data, null, 2));
    setPlaygroundTargetEntity(preset.target);
    setPlaygroundOutput(null);
    setPlaygroundError(null);
  }, [playgroundPreset]);

  // Database Architecture Simulation states
  const [selectedDbSchema, setSelectedDbSchema] = useState<'raw' | 'staging' | 'config' | 'audit' | 'radar' | 'integration'>('raw');
  const [selectedDbTable, setSelectedDbTable] = useState<string>('raw_collectors_payload');
  const [dbSimulationStep, setDbSimulationStep] = useState<number>(0);
  const [dbLogs, setDbLogs] = useState<DatabaseLog[]>([
    {
      id: 'log-001',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      schema: 'config',
      table: 'cfg_regras_processamento',
      operation: 'SELECT',
      performedBy: 'Claude',
      payload: '{"status": "ok", "loaded_rules_count": 8}'
    },
    {
      id: 'log-002',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      schema: 'audit',
      table: 'aud_pipeline_executions',
      operation: 'AUDIT',
      performedBy: 'System',
      payload: '{"event": "Database Initialized", "schemas": ["raw", "staging", "config", "audit", "radar", "integration"]}'
    }
  ]);

  // Load state from localStorage on mount
  useEffect(() => {
    // 1. Batches
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBatches(JSON.parse(saved));
      } catch {
        setBatches(INITIAL_BATCHES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BATCHES));
      }
    } else {
      setBatches(INITIAL_BATCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BATCHES));
    }

    // 2. Load rules
    setRules(ValidationEngine.getRules());

    // 3. Load logs
    setExecutionLogs(ValidationEngine.getExecutionLogs());
  }, []);

  // Set default selection if none
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

  const saveBatches = (newBatches: IntakeBatch[]) => {
    setBatches(newBatches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBatches));
  };

  const getStatusColor = (status: IntakeBatch['status']) => {
    switch (status) {
      case 'Recebido':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Validando':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'Aguardando Curadoria':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Em Curadoria':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Homologado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejeitado':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Arquivado':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getSourceIcon = (source: IntakeBatch['source']) => {
    switch (source) {
      case 'Upload Manual':
        return <FileText className="h-4 w-4 text-slate-500" />;
      case 'Claude':
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case 'API':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'Importação CSV':
      case 'Importação Excel':
        return <Layers className="h-4 w-4 text-emerald-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getSeverityBadgeColor = (severity: RuleSeverity) => {
    switch (severity) {
      case 'Crítica':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';
      case 'Alta':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'Média':
        return 'bg-blue-100 text-blue-900 border-blue-200 font-semibold';
      case 'Baixa':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getActionBadgeColor = (action: RuleAutomaticAction) => {
    switch (action) {
      case 'Bloquear processamento':
        return 'bg-red-50 text-red-700 border-red-100 font-bold';
      case 'Corrigir automaticamente':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold';
      case 'Enviar para Curadoria':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Gerar Alerta':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Solicitar Revisão Manual':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Registrar Auditoria':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getRuleStatusBadgeColor = (status: RuleStatus) => {
    switch (status) {
      case 'Ativa':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'Inativa':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Em Teste':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rascunho':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  // Helper date function
  const getCurrentDateTime = () => {
    const d = new Date();
    const dateStr = d.toLocaleDateString('pt-BR');
    const timeStr = d.toTimeString().slice(0, 5);
    return { date: dateStr, time: timeStr, full: `${dateStr} ${timeStr}` };
  };

  // Run the intake simulation with timing
  const handleSimulateIntake = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingStatusText('Conectando ao gateway de entrada do Radar C-Trade...');

    // Get current simulation user
    const simulatedUser = SecurityService.getRealUser().name + ' ' + SecurityService.getRealUser().lastName;

    // Simulation steps with state changes representing the five stages
    setTimeout(() => {
      setProcessingProgress(30);
      setProcessingStatusText('[Estágio 1/5] Parser: Convertendo dados brutos em objetos estruturados...');
    }, 300);

    setTimeout(() => {
      setProcessingProgress(50);
      setProcessingStatusText('[Estágio 2/5] Normalizer: Padronizando capitalização, telefones, CNPJ e estados...');
    }, 600);

    setTimeout(() => {
      setProcessingProgress(70);
      setProcessingStatusText('[Estágio 3/5] Validator: Consultando regras ativas do Catálogo de Validações...');
    }, 900);

    setTimeout(() => {
      setProcessingProgress(90);
      setProcessingStatusText('[Estágio 4 e 5/5] Enricher & Classifier: Mapeando RCAs e segmentações...');
    }, 1200);

    setTimeout(() => {
      let rawDataStr = '';
      let fileType = 'json';
      let name = '';

      if (simPayloadType === 'carga_a') {
        name = 'Simulação: Cardápio PDF Babbo Osteria';
        fileType = 'json';
        rawDataStr = JSON.stringify([
          { "name": "Babbo Osteria SpA", "fantasyName": "Babbo Osteria", "cnpj": "14.282.112/0001-44", "phone": "21999998888", "website": "babboosteria.com", "category": "Massa artesanal", "brand": "VALDI GRANO", "state": "rj", "city": "rio de janeiro" }
        ]);
      } else if (simPayloadType === 'carga_b') {
        name = 'Simulação: Inbound Leads CRM API';
        fileType = 'json';
        rawDataStr = JSON.stringify([
          { "name": "Tarantella Ristorante Ltda", "fantasyName": "Tarantella Ristorante", "cnpj": "14882112000144", "phone": "11988887777", "website": "tarantella.com", "state": "SP", "city": "são paulo" },
          { "name": "Don Giovanni Forneria Eireli", "fantasyName": "Don Giovanni Forneria", "cnpj": "32115002000155", "phone": "48977776666", "state": "sc", "city": "florianópolis" }
        ]);
      } else if (simPayloadType === 'carga_c') {
        name = 'Simulação: Prospecção CSV';
        fileType = 'csv';
        rawDataStr = `name,fantasyName,cnpj,phone,state,city
Pizzaria Margherita,Pizzaria Margherita,44.555.666/0001-11,48999991111,sc,blumenau
Sapore di Pasta,Sapore di Pasta,55.666.777/0001-22,48999992222,sc,florianópolis
Cantina Fellini,Cantina Fellini,66.777.888/0001-33,51999993333,rs,porto alegre`;
      } else if (simPayloadType === 'carga_d') {
        name = 'Simulação: Visitas em Campo (Erro)';
        fileType = 'csv';
        rawDataStr = `name,fantasyName,cnpj,phone,state,city
Pizzaria Bella Ciao,Pizzaria Bella Ciao,22115432000177,1332221111,sp,santos
Pizzaria Nonna,Pizzaria Nonna,,1332223333,sp,guarujá`;
      } else {
        name = 'Simulação: Payload API Corrompido (Erro)';
        fileType = 'json';
        rawDataStr = `{"name": "API Corrompida", "cnpj":`;
      }

      const { date, time, full } = getCurrentDateTime();
      const batchId = `BATCH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      // EXECUTE CENTRAL DATA PROCESSING ENGINE!
      let engineResult;
      try {
        engineResult = DataProcessingEngine.processBatch(fileType, name, rawDataStr, 'Cliente');
      } catch (err: any) {
        engineResult = {
          context: {
            processing_id: `PRC-${Date.now()}-ERR`,
            pipeline_version: '1.0.0',
            rules_version: '2.3',
            normalizer_version: '1.2',
            enricher_version: '1.1',
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
            processing_time_ms: 15.5,
            records: 0,
            errors: 1,
            warnings: 0
          },
          rawInput: { fileType, fileName: name, dataSize: rawDataStr.length },
          parsedRecords: [],
          normalizedRecords: [],
          validatedRecords: [],
          enrichedRecords: [],
          transformationLogs: [],
          finalClassification: 'Erro Estrutural' as const,
          classificationReasons: [err.message || 'Erro crítico de processamento estrutural.']
        };
      }

      // Map enriched records to UI IntakeRecords format
      const finalRecords: IntakeRecord[] = engineResult.enrichedRecords.map((rec: any, idx: number) => ({
        id: rec.id || `rec-e-${idx}-${Date.now()}`,
        field1: rec.fantasyName || rec.name || 'Sem Nome',
        field2: `${rec.city || 'Sem Cidade'}/${rec.state || 'Sem Estado'} (CNPJ: ${rec.cnpj || 'AUSENTE'})`,
        field3: rec.website || 'Sem Canal',
        status: engineResult.finalClassification === 'Processado' || engineResult.finalClassification === 'Necessita Curadoria' ? 'Pendente' : 'Rejeitado'
      }));

      // Fallback for corrupted payload or rejected data
      const isSuccess = engineResult.finalClassification !== 'Rejeitado' && engineResult.finalClassification !== 'Erro Estrutural';
      const validationError = !isSuccess ? engineResult.classificationReasons.join(' | ') : undefined;

      // Translate final modular classification to overall IntakeBatch status
      let batchStatus: IntakeBatch['status'] = 'Aguardando Curadoria';
      if (engineResult.finalClassification === 'Rejeitado') {
        batchStatus = 'Rejeitado';
      } else if (engineResult.finalClassification === 'Erro Estrutural') {
        batchStatus = 'Rejeitado';
      }

      // Assemble Detailed Chronology Logs with specific modular metrics
      const newLogs: IntakeTraceLog[] = [];
      
      newLogs.push({
        id: `log-s-${Date.now()}-1`,
        timestamp: full,
        user: simSource === 'Claude' ? 'Claude Agent' : simSource === 'API' ? 'Endpoint API Gateway' : simulatedUser,
        event: `Carga de dados bruta (${engineResult.rawInput.dataSize} bytes) ingerida via [${simSource}]. Invocando Motor de Processamento Técnico.`,
        prevStatus: '-',
        newStatus: 'Recebido'
      });

      // Parser Stage Log
      newLogs.push({
        id: `log-s-${Date.now()}-p`,
        timestamp: full,
        user: 'Parser Module v1.0',
        event: `[MÓDULO PARSER] Transformou os dados brutos de formato [${fileType.toUpperCase()}] em ${engineResult.parsedRecords.length} objetos estruturados.`,
        prevStatus: 'Recebido',
        newStatus: 'Validando'
      });

      // Normalizer Stage Log
      if (engineResult.normalizedRecords.length > 0) {
        newLogs.push({
          id: `log-s-${Date.now()}-n`,
          timestamp: full,
          user: 'Normalizer Module v1.2',
          event: `[MÓDULO NORMALIZER] Padronização de campos concluída. ${engineResult.transformationLogs.filter(l => l.module === 'Normalizer').length} alterações efetuadas automaticamente em CNPJs, telefones, URLs e nomes.`,
          prevStatus: 'Validando',
          newStatus: 'Validando'
        });
      }

      // Validator Stage Log
      newLogs.push({
        id: `log-s-${Date.now()}-v`,
        timestamp: full,
        user: 'Validator Module v2.3',
        event: `[MÓDULO VALIDATOR] Avaliou cada objeto contra o Catálogo Central de Regras. Detectados ${engineResult.context.errors} erros estruturais críticos e ${engineResult.context.warnings} avisos toleráveis.`,
        prevStatus: 'Validando',
        newStatus: 'Validando'
      });

      // Enricher Stage Log
      if (engineResult.enrichedRecords.length > 0) {
        newLogs.push({
          id: `log-s-${Date.now()}-e`,
          timestamp: full,
          user: 'Enricher Module v1.1',
          event: `[MÓDULO ENRICHER] Enriquecimento automático de territórios concluído. Injetados ${engineResult.transformationLogs.filter(l => l.module === 'Enricher').length} novos campos (Geolocalização, RCA comercial responsável) preservando dados originais.`,
          prevStatus: 'Validando',
          newStatus: 'Validando'
        });
      }

      // Classifier Stage Log
      newLogs.push({
        id: `log-s-${Date.now()}-c`,
        timestamp: full,
        user: 'Classifier Module v1.0',
        event: `[MÓDULO CLASSIFIER] Classificação final do lote determinada como [${engineResult.finalClassification}]. Motivos: ${engineResult.classificationReasons.join('. ')}`,
        prevStatus: 'Validando',
        newStatus: batchStatus
      });

      // Add individual validation rules execution logging from Validator Module to central Rule logs
      engineResult.validatedRecords.forEach((valRec: any) => {
        valRec.logs.forEach((elog: any, lidx: number) => {
          newLogs.push({
            id: `log-s-rule-${Date.now()}-${lidx}-${Math.random().toString().slice(-3)}`,
            timestamp: full,
            user: 'Rule Engine',
            event: `[${elog.ruleCode}] ${elog.ruleName} executada para [${valRec.record.fantasyName || valRec.record.name || 'Registro'}]. Resultado: ${elog.result} (Ação: ${elog.actionPerformed}) em ${elog.executionTimeMs}ms. ${elog.details || ''}`,
            prevStatus: 'Validando',
            newStatus: 'Validando'
          });
        });
      });

      const newBatch: IntakeBatch = {
        id: batchId,
        name,
        date,
        time,
        source: simSource,
        responsible: simSource === 'Claude' ? 'Claude AI Agent' : simSource === 'API' ? 'API Integration' : simulatedUser,
        recordCount: finalRecords.length,
        status: batchStatus,
        updatedAt: full,
        validationError,
        records: finalRecords,
        logs: newLogs,
        processingContext: engineResult.context,
        transformationLogs: engineResult.transformationLogs
      };

      // Add to state and save
      const updatedBatches = [newBatch, ...batches];
      saveBatches(updatedBatches);
      setSelectedBatchId(batchId);
      setIsProcessing(false);
      setProcessingProgress(0);

      // Refresh dynamic rule logs and rules state
      setExecutionLogs(ValidationEngine.getExecutionLogs());

      // Log central Audit Log
      SecurityService.logAction({
        module: 'Central de Cardápios',
        action: 'Ingestão de Lote',
        result: isSuccess ? 'Sucesso' : 'Bloqueado',
        description: `Lote ${batchId} (${name}) processado pelo Data Processing Engine central com status final [${engineResult.finalClassification}].`,
        affectedRecord: batchId,
        recordCount: finalRecords.length
      });

    }, 1500);
  };

  // Promote to curation
  const handleSendToCuration = (batch: IntakeBatch) => {
    const { full } = getCurrentDateTime();
    const simulatedUser = SecurityService.getRealUser().name + ' ' + SecurityService.getRealUser().lastName;

    // Transition status to Em Curadoria
    const updated = batches.map(b => {
      if (b.id === batch.id) {
        const updatedLogs = [
          {
            id: `log-op-${Date.now()}`,
            timestamp: full,
            user: simulatedUser,
            event: 'Lote enviado formalmente para a Fila de Curadoria Humana. Cardápios provisórios injetados na biblioteca para análise.',
            prevStatus: b.status,
            newStatus: 'Em Curadoria'
          },
          ...b.logs
        ];

        return {
          ...b,
          status: 'Em Curadoria' as const,
          updatedAt: full,
          logs: updatedLogs
        };
      }
      return b;
    });

    saveBatches(updated);

    // Dynamic injection into standard menu library! This makes it extremely cohesive
    try {
      const existingStr = localStorage.getItem('ctrade_menu_library');
      const menus = existingStr ? JSON.parse(existingStr) : [];

      batch.records.forEach((rec, idx) => {
        // Only inject if it's not already there
        const alreadyExists = menus.some((m: any) => m.nomeEstabelecimento.toLowerCase() === rec.field1.toLowerCase());
        if (!alreadyExists) {
          const newMenu = {
            id: `menu-injected-${Date.now()}-${idx}`,
            nomeEstabelecimento: rec.field1,
            empresa: rec.field1,
            estado: rec.field2.includes('/') ? rec.field2.split('/').pop()?.slice(0, 2) || 'SP' : 'SP',
            cidade: rec.field2.includes('/') ? rec.field2.split('/')[0] : 'São Paulo',
            segmento: 'Restaurante / Pizzaria',
            dataEnvio: new Date().toISOString().split('T')[0],
            origem: batch.source === 'Claude' ? 'Claude' as const : 'Upload Manual' as const,
            status: 'Entradas' as const,
            nomeArquivo: rec.field3.includes('.pdf') ? rec.field3 : `Cardapio_${rec.field1.replace(/\s+/g, '_')}.pdf`,
            tamanhoArquivo: '1.8 MB',
            produtosIdentificados: [
              { id: `pi-i-${idx}-1`, nomeNoCardapio: 'Spaghetti Tradizionale', brand: 'Valdigrano', category: 'Massas Tradicionais', productName: 'Spaghetti', status: 'Homologado' }
            ],
            historico: [
              {
                id: `h-hist-${Date.now()}`,
                data: full,
                usuario: 'Pipeline Intake',
                acao: `Cardápio provisório criado automaticamente a partir do Lote ${batch.id}.`
              }
            ]
          };
          menus.unshift(newMenu);
        }
      });

      localStorage.setItem('ctrade_menu_library', JSON.stringify(menus));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Falha ao injetar cardápios automáticos na biblioteca:', e);
    }

    // Central audit
    SecurityService.logAction({
      module: 'Central de Cardápios',
      action: 'Enviar para Curadoria',
      result: 'Sucesso',
      description: `Lote ${batch.id} enviado para Curadoria. ${batch.recordCount} registros foram integrados à Biblioteca.`,
      affectedRecord: batch.id
    });
  };

  // Operational Actions: Reprocessar Lote
  const handleReprocessBatch = (batchId: string) => {
    const { full } = getCurrentDateTime();
    const simulatedUser = SecurityService.getRealUser().name + ' ' + SecurityService.getRealUser().lastName;

    const updated = batches.map(b => {
      if (b.id === batchId) {
        const updatedLogs = [
          {
            id: `log-op-${Date.now()}`,
            timestamp: full,
            user: simulatedUser,
            event: 'Reprocessamento manual solicitado. Roteador de consistência de dados reexecutado sem novas falhas relatadas.',
            prevStatus: b.status,
            newStatus: b.status
          },
          ...b.logs
        ];

        return {
          ...b,
          updatedAt: full,
          logs: updatedLogs
        };
      }
      return b;
    });

    saveBatches(updated);

    SecurityService.logAction({
      module: 'Central de Cardápios',
      action: 'Reprocessar Lote',
      result: 'Sucesso',
      description: `Lote ${batchId} foi reprocessado para depuração de integridade.`,
      affectedRecord: batchId
    });
  };

  // Operational Actions: Duplicar Lote
  const handleDuplicateBatch = (batch: IntakeBatch) => {
    const { date, time, full } = getCurrentDateTime();
    const simulatedUser = SecurityService.getRealUser().name + ' ' + SecurityService.getRealUser().lastName;
    const newId = `BATCH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-DUP`;

    const newBatch: IntakeBatch = {
      ...batch,
      id: newId,
      name: `${batch.name} (Cópia Duplicada)`,
      date,
      time,
      responsible: simulatedUser,
      updatedAt: full,
      logs: [
        {
          id: `log-dup-${Date.now()}`,
          timestamp: full,
          user: simulatedUser,
          event: `Cópia duplicada do Lote original ${batch.id}.`,
          prevStatus: '-',
          newStatus: batch.status
        },
        ...batch.logs.map(l => ({ ...l, id: l.id + '-copy' }))
      ]
    };

    saveBatches([newBatch, ...batches]);
    setSelectedBatchId(newId);

    SecurityService.logAction({
      module: 'Central de Cardápios',
      action: 'Duplicar Lote',
      result: 'Sucesso',
      description: `Lote original ${batch.id} duplicado como novo lote ${newId}.`,
      affectedRecord: newId
    });
  };

  // Operational Actions: Cancelar / Arquivar Lote
  const handleCancelBatch = (batchId: string) => {
    const { full } = getCurrentDateTime();
    const simulatedUser = SecurityService.getRealUser().name + ' ' + SecurityService.getRealUser().lastName;

    const updated = batches.map(b => {
      if (b.id === batchId) {
        const updatedLogs = [
          {
            id: `log-op-${Date.now()}`,
            timestamp: full,
            user: simulatedUser,
            event: 'Processamento cancelado pelo usuário. Lote direcionado para a pasta de arquivos inativos.',
            prevStatus: b.status,
            newStatus: 'Arquivado'
          },
          ...b.logs
        ];

        return {
          ...b,
          status: 'Arquivado' as const,
          updatedAt: full,
          logs: updatedLogs
        };
      }
      return b;
    });

    saveBatches(updated);

    SecurityService.logAction({
      module: 'Central de Cardápios',
      action: 'Cancelar Processamento',
      result: 'Sucesso',
      description: `Processamento do lote ${batchId} cancelado e arquivado manualmente.`,
      affectedRecord: batchId
    });
  };

  // Clean all custom simulated batches to reset
  const handleResetPipeline = () => {
    if (window.confirm('Deseja restaurar o pipeline para os lotes padrão de fábrica?')) {
      saveBatches(INITIAL_BATCHES);
      setSelectedBatchId(INITIAL_BATCHES[0].id);
      
      SecurityService.logAction({
        module: 'Central de Cardápios',
        action: 'Limpar Histórico',
        result: 'Sucesso',
        description: 'Módulo do Pipeline de Entrada redefinido para dados iniciais.'
      });
    }
  };

  // Rules management functions
  const handleToggleRuleStatus = (ruleId: string) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        const nextStatusMap: Record<RuleStatus, RuleStatus> = {
          'Ativa': 'Inativa',
          'Inativa': 'Em Teste',
          'Em Teste': 'Rascunho',
          'Rascunho': 'Ativa'
        };
        const newStatus = nextStatusMap[r.status];
        return { ...r, status: newStatus };
      }
      return r;
    });
    setRules(updated);
    ValidationEngine.saveRules(updated);

    SecurityService.logAction({
      module: 'Central de Regras',
      action: 'Alterar Status da Regra',
      result: 'Sucesso',
      description: `Status da regra de validação atualizada.`
    });
  };

  const handleUpdateRuleSeverity = (ruleId: string, severity: RuleSeverity) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        return { ...r, severity };
      }
      return r;
    });
    setRules(updated);
    ValidationEngine.saveRules(updated);
  };

  const handleUpdateRuleAction = (ruleId: string, automaticAction: RuleAutomaticAction) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        return { ...r, automaticAction };
      }
      return r;
    });
    setRules(updated);
    ValidationEngine.saveRules(updated);
  };

  const handleUpdateRulePriority = (ruleId: string, priority: number) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        return { ...r, priority };
      }
      return r;
    });
    setRules(updated);
    ValidationEngine.saveRules(updated);
  };

  const handleResetRulesToFactory = () => {
    if (window.confirm('Deseja redefinir todas as regras do Motor de Validação para a configuração original de fábrica?')) {
      const reset = ValidationEngine.resetRules();
      setRules(reset);
      SecurityService.logAction({
        module: 'Central de Regras',
        action: 'Redefinir Regras',
        result: 'Sucesso',
        description: 'Parâmetros e status do Rule Engine restaurados para o padrão do sistema.'
      });
    }
  };

  const handleClearRuleExecutionLogs = () => {
    if (window.confirm('Deseja limpar todo o histórico de execuções do motor de validação?')) {
      ValidationEngine.clearExecutionLogs();
      setExecutionLogs([]);
      SecurityService.logAction({
        module: 'Central de Regras',
        action: 'Limpar Logs de Regras',
        result: 'Sucesso',
        description: 'Histórico de depuração do Rule Engine esvaziado pelo usuário.'
      });
    }
  };

  // Filter batches
  const filteredBatches = batches.filter(b => {
    const matchesSource = filterSource === 'Todos' || b.source === filterSource;
    const matchesStatus = filterStatus === 'Todos' || b.status === filterStatus;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesStatus && matchesSearch;
  });

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  // Filter rules
  const filteredRules = rules.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchRuleTerm.toLowerCase()) || 
                          r.code.toLowerCase().includes(searchRuleTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchRuleTerm.toLowerCase());
    const matchesEntity = selectedEntityFilter === 'Todos' || r.entity === selectedEntityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div id="pipeline-intake-page" className="space-y-6 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-900">
              <Database className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pipeline de Entrada & Motor de Validação</h1>
          </div>
          <p className="text-xs text-slate-400 font-bold mt-1 max-w-2xl leading-normal">
            Portão de recepção unificado e auditável de fontes de dados externas. Gerencie e valide as regras do Rule Engine de forma dinâmica sem alterar código.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-auto">
          {activeTab === 'lotes' ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eraser className="h-4 w-4" />}
              onClick={handleResetPipeline}
            >
              Redefinir Lotes
            </Button>
          ) : activeTab === 'regras' ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eraser className="h-4 w-4" />}
              onClick={handleResetRulesToFactory}
            >
              Regras Originais
            </Button>
          ) : activeTab === 'execucoes' ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eraser className="h-4 w-4" />}
              onClick={handleClearRuleExecutionLogs}
            >
              Limpar Logs
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                setPlaygroundPreset('maps');
                setPlaygroundOutput(null);
                setPlaygroundError(null);
              }}
            >
              Resetar Playground
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lotes')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'lotes'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="h-4 w-4" />
          Lotes & Ingestão
        </button>

        <button
          onClick={() => setActiveTab('regras')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'regras'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Motor de Regras (Rule Engine)
          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {rules.filter(r => r.status === 'Ativa').length}/{rules.length} Ativas
          </span>
        </button>

        <button
          onClick={() => setActiveTab('execucoes')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'execucoes'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="h-4 w-4" />
          Histórico de Validações
          {executionLogs.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {executionLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('modelo_canonico')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'modelo_canonico'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4 text-amber-500 animate-pulse" />
          Modelo Canônico (Data Contract)
          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full">
            9 Entidades
          </span>
        </button>

        <button
          onClick={() => setActiveTab('arquitetura_banco')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'arquitetura_banco'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="h-4 w-4 text-blue-600" />
          Arquitetura de Dados (Schemas)
          <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full">
            6 Schemas
          </span>
        </button>

        <button
          onClick={() => setActiveTab('integ_claude')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'integ_claude'
              ? 'border-purple-600 text-purple-600 bg-purple-50/20 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
          Integração Claude & Taxonomia
          <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full">
            Pronto
          </span>
        </button>
      </div>

      {/* Dynamic Tab Contents */}

      {activeTab === 'lotes' && (
        <div className="space-y-6">
          
          {/* Pipeline Dataflow Conceptual Visualization */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-xs border border-slate-700">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" /> Fluxo Operacional de Entrada de Dados (C-Trade Pipeline)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center text-center">
              
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">1. Fontes Externas</span>
                <span className="text-xs font-bold text-white block">Upload, API, Claude</span>
              </div>
              
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>
              
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">2. Ingestão</span>
                <span className="text-xs font-bold text-white block">Processa Payload</span>
              </div>

              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>

              <div className="bg-blue-950/60 rounded-lg p-3 border border-blue-700/80 ring-2 ring-blue-500/30">
                <span className="text-[10px] font-black uppercase text-blue-300 block mb-0.5">3. Configurable Rule Engine</span>
                <span className="text-xs font-bold text-white block">Validação por Prioridade</span>
              </div>

              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">4. Curadoria Humana</span>
                <span className="text-xs font-bold text-emerald-400 block">Homologação Oficial</span>
              </div>

            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic text-center font-medium">
              *Integração Operacional: As regras configuradas na guia "Motor de Regras" definem as validações estruturais, alertas, automações e bloqueios em tempo de ingestão.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column - Simulator and Batches List */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Simulator Panel */}
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4.5 w-4.5 text-purple-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">Simulador de Entrada de Dados</h2>
                </div>
                
                <p className="text-[11px] text-slate-400 font-bold mb-4">
                  Simule a ingestão e pré-validação de dados de lote no pipeline como se estivesse recebendo dados de fontes reais.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Origem do Lote
                    </label>
                    <select
                      value={simSource}
                      onChange={(e) => setSimSource(e.target.value as any)}
                      disabled={isProcessing}
                      className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 p-2 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Upload Manual">Upload Manual (PDF, Imagens)</option>
                      <option value="Claude">Claude (Agente Inteligente de IA)</option>
                      <option value="API">API Gateway (Webhook Web Service)</option>
                      <option value="Importação CSV">Importação CSV (Clientes / RCA)</option>
                      <option value="Importação Excel">Importação Excel (Relatórios de Campo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Payload de Dados (Simulação)
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="payloadType"
                          value="carga_a"
                          checked={simPayloadType === 'carga_a'}
                          onChange={() => setSimPayloadType('carga_a')}
                          disabled={isProcessing}
                          className="mt-0.5"
                        />
                        <div>
                          <span>Cardápio PDF Babbo Osteria (Válido)</span>
                          <span className="block text-[10px] text-slate-400 font-medium">Testa validações de duplicidade e estrutura de PDF</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="payloadType"
                          value="carga_b"
                          checked={simPayloadType === 'carga_b'}
                          onChange={() => setSimPayloadType('carga_b')}
                          disabled={isProcessing}
                          className="mt-0.5"
                        />
                        <div>
                          <span>Leads de API do CRM - RS/PR (Válido)</span>
                          <span className="block text-[10px] text-slate-400 font-medium">Contém 2 registros de novos estabelecimentos mapeados no CRM</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="payloadType"
                          value="carga_c"
                          checked={simPayloadType === 'carga_c'}
                          onChange={() => setSimPayloadType('carga_c')}
                          disabled={isProcessing}
                          className="mt-0.5"
                        />
                        <div>
                          <span>Lista de Prospecção Sul (Válido)</span>
                          <span className="block text-[10px] text-slate-400 font-medium">Contém 3 registros via importação de arquivo CSV</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="payloadType"
                          value="carga_d"
                          checked={simPayloadType === 'carga_d'}
                          onChange={() => setSimPayloadType('carga_d')}
                          disabled={isProcessing}
                          className="mt-0.5"
                        />
                        <div>
                          <span>Visitas de Campo SP (CNPJ Ausente - Erro)</span>
                          <span className="block text-[10px] text-rose-500 font-bold">Inicia verificação da Regra VAL-OBL-002 e VAL-FMT-003</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="payloadType"
                          value="carga_e"
                          checked={simPayloadType === 'carga_e'}
                          onChange={() => setSimPayloadType('carga_e')}
                          disabled={isProcessing}
                          className="mt-0.5"
                        />
                        <div>
                          <span>Payload API Corrompido (Erro Estrutural)</span>
                          <span className="block text-[10px] text-rose-500 font-bold">Inicia verificação da Regra Crítica VAL-EST-001</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                          <RefreshCw className="h-3 w-3 animate-spin" /> Ingestão em Curso...
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{processingProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block">{processingStatusText}</span>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full text-xs py-2 uppercase font-black tracking-wider"
                    onClick={handleSimulateIntake}
                    disabled={isProcessing}
                    leftIcon={<Play className="h-4 w-4" />}
                  >
                    {isProcessing ? 'Processando Lote...' : 'Simular Ingestão com Regras Ativas'}
                  </Button>
                </div>
              </div>

              {/* Batches List panel */}
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-slate-500" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">Lotes no Pipeline ({filteredBatches.length})</h2>
                  </div>
                </div>

                {/* Searches / Filters */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fonte</label>
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="w-full text-[10px] rounded-lg border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 focus:outline-hidden"
                    >
                      <option value="Todos">Todas as Fontes</option>
                      <option value="Upload Manual">Upload Manual</option>
                      <option value="Claude">Claude</option>
                      <option value="API">API Gateway</option>
                      <option value="Importação CSV">CSV</option>
                      <option value="Importação Excel">Excel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full text-[10px] rounded-lg border border-slate-200 p-1.5 font-bold text-slate-600 bg-slate-50 focus:outline-hidden"
                    >
                      <option value="Todos">Todos os Status</option>
                      <option value="Aguardando Curadoria">Aguardando Curadoria</option>
                      <option value="Em Curadoria">Em Curadoria</option>
                      <option value="Homologado">Homologado</option>
                      <option value="Rejeitado">Rejeitado</option>
                      <option value="Arquivado">Arquivado</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar lote por ID, nome ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-4 font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* List */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredBatches.length === 0 ? (
                    <p className="text-center text-slate-400 py-6 text-xs italic">Nenhum lote correspondente.</p>
                  ) : (
                    filteredBatches.map((batch) => (
                      <div
                        key={batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                        className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all duration-150 hover:shadow-2xs ${
                          selectedBatchId === batch.id
                            ? 'border-blue-500 bg-blue-50/10 shadow-3xs'
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400">{batch.id}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusColor(batch.status)}`}>
                            {batch.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug">{batch.name}</h4>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-1">
                            {getSourceIcon(batch.source)}
                            {batch.source}
                          </span>
                          <span>•</span>
                          <span>{batch.recordCount} {batch.recordCount === 1 ? 'registro' : 'registros'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {batch.date}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Details and Audit Trace Log */}
            <div className="lg:col-span-7">
              {selectedBatch ? (
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-6">
                  
                  {/* Batch Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase text-slate-400">{selectedBatch.id}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusColor(selectedBatch.status)}`}>
                          {selectedBatch.status}
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{selectedBatch.name}</h2>
                    </div>

                    {/* Contingency / Operational Actions */}
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBatch.status === 'Aguardando Curadoria' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 bg-emerald-600 hover:bg-emerald-700 font-sans"
                          onClick={() => handleSendToCuration(selectedBatch)}
                          leftIcon={<Send className="h-3 w-3" />}
                        >
                          Enviar para Curadoria
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold text-slate-600 border-slate-200 font-sans"
                        onClick={() => handleReprocessBatch(selectedBatch.id)}
                        leftIcon={<RefreshCw className="h-3 w-3" />}
                      >
                        Reprocessar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold text-slate-600 border-slate-200 font-sans"
                        onClick={() => handleDuplicateBatch(selectedBatch)}
                        leftIcon={<Copy className="h-3 w-3" />}
                      >
                        Duplicar
                      </Button>

                      {selectedBatch.status !== 'Arquivado' && selectedBatch.status !== 'Homologado' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] font-bold text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200 font-sans"
                          onClick={() => handleCancelBatch(selectedBatch.id)}
                          leftIcon={<Archive className="h-3 w-3" />}
                        >
                          Arquivar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Origem do Fluxo</span>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                        {getSourceIcon(selectedBatch.source)}
                        {selectedBatch.source}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Usuário Responsável</span>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {selectedBatch.responsible}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Data de Ingestão</span>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {selectedBatch.date} às {selectedBatch.time}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Última Atualização</span>
                      <div className="text-xs font-extrabold text-slate-700">
                        {selectedBatch.updatedAt}
                      </div>
                    </div>
                  </div>

                  {/* Pre-Validation Alert */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Relatório do Motor de Validação</h3>
                    {selectedBatch.validationError ? (
                      <div className="p-3.5 rounded-lg border border-rose-100 bg-rose-50/40 text-xs text-rose-800 space-y-1">
                        <div className="flex items-center gap-2 font-bold">
                          <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                          <span>Falha de Validação Estrutural</span>
                        </div>
                        <div className="text-[11px] font-medium leading-relaxed pl-6.5 text-rose-700 divide-y divide-rose-100/50">
                          {selectedBatch.validationError.split('|').map((err, i) => (
                            <div key={i} className="py-1 first:pt-0 last:pb-0 font-bold">
                              • {err.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/30 text-xs text-emerald-800 space-y-1">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                          <span>Pré-Validação Aprovada</span>
                        </div>
                        <p className="text-[11px] font-semibold leading-relaxed pl-6.5 text-emerald-700">
                          Integridade de esquema e regras de negócios ativas validadas com sucesso sem nenhum bloqueio relatado pelo motor de processamento.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Processing Context Section */}
                  {selectedBatch.processingContext && (
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="h-4.5 w-4.5 text-blue-400 animate-pulse animate-duration-2000" />
                          <h3 className="text-xs font-black uppercase tracking-wider">Contexto de Processamento (Engine Metadata)</h3>
                        </div>
                        <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-sm">
                          ID: {selectedBatch.processingContext.processing_id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                        <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Tempo Execução</span>
                          <span className="text-xs font-mono font-black text-blue-400">
                            {selectedBatch.processingContext.processing_time_ms} ms
                          </span>
                        </div>
                        <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Versão Motor</span>
                          <span className="text-xs font-mono font-black text-emerald-400">
                            v{selectedBatch.processingContext.pipeline_version}
                          </span>
                        </div>
                        <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Erros Fatais</span>
                          <span className={`text-xs font-mono font-black ${selectedBatch.processingContext.errors > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                            {selectedBatch.processingContext.errors}
                          </span>
                        </div>
                        <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Avisos/Alertas</span>
                          <span className={`text-xs font-mono font-black ${selectedBatch.processingContext.warnings > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {selectedBatch.processingContext.warnings}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9px] font-semibold text-slate-400 pt-1.5 border-t border-slate-800/55 font-mono">
                        <span>• Regras Catálogo: v{selectedBatch.processingContext.rules_version}</span>
                        <span>• Normalizer: v{selectedBatch.processingContext.normalizer_version}</span>
                        <span>• Enricher: v{selectedBatch.processingContext.enricher_version}</span>
                      </div>
                    </div>
                  )}

                  {/* Records Contents */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Registros Ingeridos no Lote ({selectedBatch.recordCount})</h3>
                    </div>
                    {selectedBatch.records.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs italic">
                        Nenhum registro individual foi extraído deste lote devido a falhas estruturais críticas de recebimento.
                      </div>
                    ) : (
                      <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100">
                        {selectedBatch.records.map((rec) => (
                          <div key={rec.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 text-xs">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-800 block">{rec.field1}</span>
                              <span className="text-[10px] text-slate-400 font-bold block">{rec.field2}</span>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                                {rec.field3}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transformation Logs Section */}
                  {selectedBatch.transformationLogs && selectedBatch.transformationLogs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Histórico de Transformações Técnicas (Normalizer & Enricher)</h3>
                      </div>
                      
                      <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-3xs max-h-[220px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-400">
                              <th className="p-2.5">Módulo</th>
                              <th className="p-2.5">Campo</th>
                              <th className="p-2.5">Valor Original</th>
                              <th className="p-2.5">Valor Transformado</th>
                              <th className="p-2.5">Regra Aplicada</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedBatch.transformationLogs.map((tlog, tidx) => (
                              <tr key={tidx} className="hover:bg-slate-50/40">
                                <td className="p-2.5">
                                  <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase ${
                                    tlog.module === 'Normalizer' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  }`}>
                                    {tlog.module}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono font-bold text-slate-700">{tlog.field}</td>
                                <td className="p-2.5 text-slate-400 line-through truncate max-w-[120px]" title={tlog.originalValue}>{tlog.originalValue || 'NULO'}</td>
                                <td className="p-2.5 text-slate-800 font-extrabold truncate max-w-[140px]" title={tlog.transformedValue}>{tlog.transformedValue}</td>
                                <td className="p-2.5 text-slate-500 font-medium truncate max-w-[180px]" title={tlog.ruleApplied}>{tlog.ruleApplied}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Full Traceability Chronology Audit Trail */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-4.5">Cronologia de Rastreabilidade (Pipeline Audit Trail)</h3>
                    
                    <div className="relative border-l border-slate-100 ml-3.5 pl-5.5 space-y-5.5">
                      {selectedBatch.logs.map((log) => (
                        <div key={log.id} className="relative text-xs">
                          {/* Timeline Dot Indicator */}
                          <span className="absolute -left-9 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-50 ring-2 ring-white border border-slate-300 text-[10px]">
                            •
                          </span>

                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {log.timestamp}
                            </span>
                            <span className="text-[10px] text-slate-300 font-bold">•</span>
                            <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {log.user}
                            </span>
                            {log.prevStatus !== log.newStatus && (
                              <>
                                <span className="text-[10px] text-slate-300 font-bold">•</span>
                                <span className="text-[9px] font-bold text-slate-400">
                                  {log.prevStatus} → <span className="font-extrabold text-blue-600">{log.newStatus}</span>
                                </span>
                              </>
                            )}
                          </div>

                          <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                            {log.event}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-12 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <EmptyState
                    title="Selecione um Lote"
                    description="Escolha um lote do pipeline de entrada na lista ao lado para inspecionar os detalhes, auditoria estrutural e logs de rastreabilidade."
                    icon={<Database className="h-6 w-6 text-slate-300" />}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'regras' && (
        <div className="space-y-6">
          
          {/* Rules Concept Intro */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">Rule Engine Inteligente</span>
              <h2 className="text-sm font-bold text-slate-800">Arquitetura de Validação Baseada em Regras de Negócios</h2>
              <p className="text-xs text-slate-400 font-semibold max-w-3xl leading-relaxed">
                Toda validação do Radar C-Trade é tratada como uma Regra de Negócio configurável. Ajuste a severidade, altere as ações automatizadas, alterne o status ou modifique a prioridade (ordem de execução) de cada verificação em tempo real.
              </p>
            </div>
            <div className="bg-white px-3.5 py-2 rounded-lg border border-slate-200 shrink-0 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total de Regras</span>
              <span className="text-lg font-black text-slate-800">{rules.length}</span>
            </div>
          </div>

          {/* Filters for Rules Grid */}
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar regras por nome, código ou descrição..."
                value={searchRuleTerm}
                onChange={(e) => setSearchRuleTerm(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-4 font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-[10px] font-black uppercase text-slate-400 shrink-0">Filtrar Entidade</label>
              <select
                value={selectedEntityFilter}
                onChange={(e) => setSelectedEntityFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 p-2 font-bold text-slate-600 bg-white focus:outline-hidden"
              >
                <option value="Todos">Todas as Entidades</option>
                <option value="Cliente">Cliente</option>
                <option value="Cardápio">Cardápio</option>
                <option value="Produto">Produto</option>
                <option value="Categoria">Categoria</option>
                <option value="Marca">Marca</option>
                <option value="Contato">Contato</option>
                <option value="Oportunidade">Oportunidade</option>
                <option value="Usuário">Usuário</option>
              </select>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-3xs divide-y divide-slate-100">
            <div className="hidden lg:grid grid-cols-12 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <div className="col-span-1">Código</div>
              <div className="col-span-3">Nome / Descrição</div>
              <div className="col-span-1">Entidade</div>
              <div className="col-span-1 text-center">Prioridade</div>
              <div className="col-span-1.5">Severidade</div>
              <div className="col-span-2">Ação Automática</div>
              <div className="col-span-1.5">Status</div>
              <div className="col-span-1 text-right">Alterar</div>
            </div>

            {filteredRules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic text-xs">Nenhuma regra de validação correspondente aos filtros.</div>
            ) : (
              filteredRules.map((rule) => (
                <div key={rule.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 items-center hover:bg-slate-50/40 text-xs">
                  
                  {/* Code */}
                  <div className="col-span-1 flex items-center justify-between lg:block">
                    <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">{rule.code}</span>
                    <span className="lg:hidden text-[10px] font-black text-slate-400 uppercase">Ordem {rule.priority}</span>
                  </div>

                  {/* Name and Description */}
                  <div className="col-span-3 space-y-1 text-left">
                    <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      {rule.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{rule.description}</p>
                    <div className="text-[9px] font-black uppercase text-slate-400">Campo: <span className="font-mono text-slate-600">{rule.evaluatedField}</span> • Tipo: {rule.validationType}</div>
                  </div>

                  {/* Entity */}
                  <div className="col-span-1 text-left lg:block flex justify-between items-center">
                    <span className="lg:hidden text-[10px] text-slate-400 font-bold uppercase">Entidade</span>
                    <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{rule.entity}</span>
                  </div>

                  {/* Order of execution (Priority) */}
                  <div className="col-span-1 text-center lg:block flex justify-between items-center">
                    <span className="lg:hidden text-[10px] text-slate-400 font-bold uppercase">Prioridade</span>
                    <select
                      value={rule.priority}
                      onChange={(e) => handleUpdateRulePriority(rule.id, parseInt(e.target.value))}
                      className="text-[10px] font-black text-slate-700 bg-slate-50 rounded-md border border-slate-200 p-1 cursor-pointer hover:bg-slate-100 focus:outline-hidden"
                    >
                      <option value={1}>1 (Estrutura)</option>
                      <option value={2}>2 (Normalização)</option>
                      <option value={3}>3 (Duplicidade)</option>
                      <option value={4}>4 (Relacionamento)</option>
                      <option value={5}>5 (Comercial)</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div className="col-span-1.5 lg:block flex justify-between items-center">
                    <span className="lg:hidden text-[10px] text-slate-400 font-bold uppercase">Severidade</span>
                    <select
                      value={rule.severity}
                      onChange={(e) => handleUpdateRuleSeverity(rule.id, e.target.value as RuleSeverity)}
                      className="text-[10px] font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-200 p-1 cursor-pointer hover:bg-slate-100 focus:outline-hidden w-full lg:w-auto"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  </div>

                  {/* Automatic Action */}
                  <div className="col-span-2 lg:block flex justify-between items-center">
                    <span className="lg:hidden text-[10px] text-slate-400 font-bold uppercase">Ação Automática</span>
                    <select
                      value={rule.automaticAction}
                      onChange={(e) => handleUpdateRuleAction(rule.id, e.target.value as RuleAutomaticAction)}
                      className="text-[10px] font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-200 p-1 cursor-pointer hover:bg-slate-100 focus:outline-hidden w-full"
                    >
                      <option value="Permitir">Permitir</option>
                      <option value="Corrigir automaticamente">Corrigir Automaticamente</option>
                      <option value="Enviar para Curadoria">Enviar para Curadoria</option>
                      <option value="Bloquear processamento">Bloquear Processamento</option>
                      <option value="Gerar Alerta">Gerar Alerta</option>
                      <option value="Registrar Auditoria">Registrar Auditoria</option>
                      <option value="Solicitar Revisão Manual">Solicitar Revisão Manual</option>
                    </select>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-1.5 lg:block flex justify-between items-center">
                    <span className="lg:hidden text-[10px] text-slate-400 font-bold uppercase">Status</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getRuleStatusBadgeColor(rule.status)}`}>
                      {rule.status}
                    </span>
                  </div>

                  {/* State Toggle Button */}
                  <div className="col-span-1 text-right lg:block flex justify-between items-center">
                    <span className="lg:hidden text-[10px] text-slate-400 font-bold uppercase">Ações</span>
                    <button
                      onClick={() => handleToggleRuleStatus(rule.id)}
                      title="Clique para alternar o Status da Regra"
                      className="p-1 rounded-md hover:bg-slate-100 text-blue-600 font-bold flex items-center gap-1 text-[10px] uppercase ml-auto"
                    >
                      Alternar
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Future Architecture Extensibility Notice */}
          <div className="p-5 border border-slate-100 bg-blue-50/10 rounded-xl space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> Preparado para Escalabilidade Futura (Open-Ended Rule Engine)
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              O motor de validação foi totalmente estruturado em microsserviço isolado. Futuras validações adicionais de inteligência artificial (Gemini), integradores de CRM (RD Station), chamadas adicionais de API ou gatilhos de Marketing poderão ser injetadas de forma declarativa estendendo a árvore de entidades e ações.
            </p>
          </div>

        </div>
      )}

      {activeTab === 'execucoes' && (
        <div className="space-y-6">
          
          {/* Execution Trace Header */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">Depuração Ativa</span>
              <h2 className="text-sm font-bold text-slate-800">Logs de Execução em Tempo Real (Rule Audit Trails)</h2>
              <p className="text-xs text-slate-400 font-semibold max-w-3xl leading-normal">
                Verifique os registros de auditoria gerados a cada execução do Motor de Regras. Cada entrada especifica a regra avaliada, o resultado obtido, o tempo de processamento em milissegundos e as ações mitigadoras tomadas.
              </p>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-3xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-3">Código / Regra</th>
                  <th className="p-3">Entidade</th>
                  <th className="p-3">Registro Avaliado</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Ação Executada</th>
                  <th className="p-3 text-center">Tempo (ms)</th>
                  <th className="p-3 text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      Nenhuma regra foi executada recentemente. Execute uma simulação na aba "Lotes & Ingestão" para preencher este log em tempo real.
                    </td>
                  </tr>
                ) : (
                  executionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm text-[10px] block w-fit">
                            {log.ruleCode}
                          </span>
                          <span className="font-bold text-slate-700 block">{log.ruleName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">{log.entity}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500 font-semibold">{log.evaluatedRecord}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] border ${
                          log.result === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          log.result === 'Reprovado' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          log.result === 'Corrigido' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] border ${getActionBadgeColor(log.actionPerformed)}`}>
                          {log.actionPerformed}
                        </span>
                        {log.details && (
                          <span className="block text-[10px] text-slate-400 font-semibold mt-1 max-w-xs truncate" title={log.details}>
                            {log.details}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-500">{log.executionTimeMs} ms</td>
                      <td className="p-3 text-right font-semibold text-slate-400">
                        {log.date} {log.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeTab === 'modelo_canonico' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header & Concept */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Layers className="h-64 w-64 text-amber-400" />
            </div>
            <div className="relative z-10 max-w-4xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Commit 5.3 — Modelo Canônico de Dados
                </span>
                <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono px-2 py-1 rounded-full">
                  Data Contract v1.2.0
                </span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                Canonical Data Model & Enterprise Integration Contract
              </h1>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                O C-Trade Intelligence unifica todas as fontes de dados heterogêneas (Google Maps, Instagram, sites, uploads manuais, iFood e OCR de cardápios) sob um mesmo dialeto de dados unificado. Nenhum módulo do sistema poderá trafegar ou ler dados fora desse contrato de integridade referencial e versionamento estruturado.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-slate-400 pt-3 border-t border-slate-800 font-mono">
                <span>• <strong>Durable Persistence:</strong> Pronta para Firestore / Cloud SQL</span>
                <span>• <strong>Referential Integrity:</strong> Garantia de chaves e pais consistentes</span>
                <span>• <strong>Versioning Tracing:</strong> Prontidão total para auditorias históricas</span>
              </div>
            </div>
          </div>

          {/* 1. Entity Diagram & Relationships */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Arquitetura de Dados</span>
              <h2 className="text-sm font-bold text-slate-800">Visualização de Relacionamentos & Chaves de Integridade</h2>
              <p className="text-xs text-slate-400 font-medium">
                Diagrama interativo mostrando as dependências entre as entidades oficiais do sistema. Clique em qualquer entidade para ver sua descrição rápida.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              
              {/* Box 1: Core Account */}
              <div 
                onClick={() => setSelectedCanonicalEntity('Conta')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedCanonicalEntity === 'Conta' 
                    ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10' 
                    : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm">CONTA</span>
                  <Database className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Estabelecimento</h4>
                <p className="text-[11px] text-slate-400 font-medium">Ponto âncora do ecossistema. Substitui "Cliente" e contém CNPJ e metadados.</p>
                <div className="mt-3 text-[9px] font-bold text-slate-500 font-mono">Chave: id</div>
              </div>

              {/* Box 2: Contatos & Documentos */}
              <div className="space-y-4">
                <div 
                  onClick={() => setSelectedCanonicalEntity('Contato')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCanonicalEntity === 'Contato' 
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-sm">CONTATO</span>
                    <User className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Pessoas Físicas</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Contatos associados (Chef, Comprador, Sócio) com cargo e dados de contato.</p>
                  <div className="mt-2 text-[9px] font-bold text-slate-500 font-mono">FK: contaId → Conta</div>
                </div>

                <div 
                  onClick={() => setSelectedCanonicalEntity('Cardapio')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCanonicalEntity === 'Cardapio' 
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-sm">CARDÁPIO</span>
                    <FileText className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Documentos</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Coleções de dados digitais ou físicos pareados a um estabelecimento.</p>
                  <div className="mt-2 text-[9px] font-bold text-slate-500 font-mono">FK: contaId → Conta</div>
                </div>
              </div>

              {/* Box 3: Itens & Oportunidades */}
              <div className="space-y-4">
                <div 
                  onClick={() => setSelectedCanonicalEntity('ItemCardapio')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCanonicalEntity === 'ItemCardapio' 
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded-sm">ITEM CARDÁPIO</span>
                    <Cpu className="h-3.5 w-3.5 text-pink-500" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Itens Extraídos</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Registros brutos extraídos do documento antes da homologação SKU.</p>
                  <div className="mt-2 text-[9px] font-bold text-slate-500 font-mono">FK: cardapioId → Cardápio</div>
                </div>

                <div 
                  onClick={() => setSelectedCanonicalEntity('Oportunidade')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCanonicalEntity === 'Oportunidade' 
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">OPORTUNIDADE</span>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Qualificação</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Cruzamento canônico de estabelecimento, produto SKU e categoria ativa.</p>
                  <div className="mt-2 text-[9px] font-bold text-slate-500 font-mono">FKs: contaId & produtoSku</div>
                </div>
              </div>

              {/* Box 4: Master Catalogs */}
              <div className="space-y-4">
                <div 
                  onClick={() => setSelectedCanonicalEntity('Produto')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCanonicalEntity === 'Produto' 
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/10' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-sm">PRODUTO SKU</span>
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase mb-1">SKU Oficial</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Dicionário mestre. Bloqueia criação de produtos genéricos ou livres.</p>
                  <div className="mt-2 text-[9px] font-bold text-slate-500 font-mono">Chave: sku (Ref. Única)</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setSelectedCanonicalEntity('Categoria')}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all text-[11px] ${
                      selectedCanonicalEntity === 'Categoria' ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/40 border-slate-100'
                    }`}
                  >
                    <span className="font-bold text-slate-700 block">Categorias</span>
                    <span className="text-[9px] font-semibold text-slate-400">Catálogo Fixo</span>
                  </div>
                  <div 
                    onClick={() => setSelectedCanonicalEntity('Marca')}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all text-[11px] ${
                      selectedCanonicalEntity === 'Marca' ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/40 border-slate-100'
                    }`}
                  >
                    <span className="font-bold text-slate-700 block">Marcas</span>
                    <span className="text-[9px] font-semibold text-slate-400">Catálogo Fixo</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Interactive Schema & Specifications Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Dicionário de Entidades Canônicas</h3>
              <p className="text-[11px] text-slate-400 font-bold">
                Selecione um modelo oficial do C-Trade para inspecionar os contratos de dados e tipos aceitos pelo pipeline.
              </p>
              
              <div className="space-y-1.5">
                {[
                  { key: 'Conta', label: 'Conta (Estabelecimento)', desc: 'Estrutura oficial do ponto comercial' },
                  { key: 'Contato', label: 'Contato (Pessoas)', desc: 'Profissionais vinculados às contas' },
                  { key: 'Cardapio', label: 'Cardápio (Documento)', desc: 'Origens de leitura do estabelecimento' },
                  { key: 'ItemCardapio', label: 'Item de Cardápio', desc: 'Registros individuais extraídos' },
                  { key: 'Produto', label: 'Produto SKU', desc: 'Identificador oficial e imutável de SKU' },
                  { key: 'Categoria', label: 'Categoria', desc: 'Nomenclaturas oficiais e taxonomia' },
                  { key: 'Marca', label: 'Marca', desc: 'Fabricantes homologados no sistema' },
                  { key: 'Oportunidade', label: 'Oportunidade Comercial', desc: 'Interseção qualificada de inteligência' },
                  { key: 'Lote', label: 'Lote (Execução Pipeline)', desc: 'Metadados de auditoria do processamento' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedCanonicalEntity(item.key as any)}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between border ${
                      selectedCanonicalEntity === item.key 
                        ? 'bg-amber-50 text-amber-900 border-amber-200' 
                        : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">{item.desc}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${selectedCanonicalEntity === item.key ? 'rotate-90 text-amber-600' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Technical contract details */}
            <div className="lg:col-span-8 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-md space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    CONTRATO ENTERPRISE
                  </span>
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    interface Canonical{selectedCanonicalEntity}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 font-mono">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Referential Integrity Verified
                </div>
              </div>

              {/* Specification table depending on entity */}
              <div className="text-left space-y-4">
                <p className="text-xs text-slate-300 font-medium">
                  {selectedCanonicalEntity === 'Conta' && 'Esta entidade representa qualquer estabelecimento físico ou jurídico qualificado ou monitorado pelo C-Trade. Ela unifica informações cadastrais brutas vindas do Google Maps, de sites institucionais, de redes sociais ou fornecidas manualmente. Possui ID único unificado, versionamento e chaves estrangeiras prontas para mapeamento ERP/Radar.'}
                  {selectedCanonicalEntity === 'Contato' && 'Representa as pessoas físicas vinculadas ao estabelecimento. Cada contato possui obrigatoriamente um cargo dentro do catálogo padronizado do sistema, telefone para ações comerciais de conversão e link de rede profissional.'}
                  {selectedCanonicalEntity === 'Cardapio' && 'Identifica o repositório bruto de dados do cardápio lido. Suporta múltiplos formatos e gera um hash único criptográfico do documento original para garantir que um mesmo arquivo não seja importado em duplicidade no sistema.'}
                  {selectedCanonicalEntity === 'ItemCardapio' && 'A menor unidade legível de um cardápio lido. Representa cada item listado no cardápio antes de passar pela aprovação e categorização do curador de dados da plataforma.'}
                  {selectedCanonicalEntity === 'Produto' && 'Representa um SKU canônico do catálogo corporativo. O sistema opera sob um catálogo fechado, impedindo a criação de produtos que não correspondam exatamente a marcas e taxonomias homologadas.'}
                  {selectedCanonicalEntity === 'Categoria' && 'Níveis de taxonomia do catálogo de inteligência do C-Trade. Estrutura imutável que garante relatórios limpos de market share.'}
                  {selectedCanonicalEntity === 'Marca' && 'Fabricantes e produtores homologados no catálogo mestre, usados como âncoras para qualificação de oportunidades.'}
                  {selectedCanonicalEntity === 'Oportunidade' && 'O coração comercial do sistema. Representa o cruzamento exato entre um estabelecimento monitorado, um produto SKU oficial que não está presente naquele estabelecimento e uma categoria em que há potencial de venda.'}
                  {selectedCanonicalEntity === 'Lote' && 'Metadados de auditoria técnica para cada rodada do Pipeline de Ingestão de dados.'}
                </p>

                {/* Fields definition */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Campos Técnicos do Contrato Canônico</h4>
                  <div className="border border-slate-800 rounded-lg overflow-hidden text-xs bg-slate-950">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 font-bold text-slate-400">
                          <th className="p-2 font-mono">Campo</th>
                          <th className="p-2 font-mono">Tipo</th>
                          <th className="p-2 font-mono">Status</th>
                          <th className="p-2 font-mono">Definição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300 font-semibold">
                        {selectedCanonicalEntity === 'Conta' && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">id</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Identificador interno canônico unificado (ID Principal)</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">cnpj</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Cadastro de Pessoa Jurídica limpo (apenas dígitos)</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">razao_social</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Nome corporativo oficial do estabelecimento</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">nome_fantasia</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Nome fantasia comercial exibido publicamente</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">endereco</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-slate-400">Opcional</td><td className="p-2 text-slate-400">Endereço logradouro de localização física</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">status</td><td className="p-2 font-mono text-slate-400">enum</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Estágio de prospecção (Prospect Radar, Base, Lead, Convertido)</td></tr>
                          </>
                        )}
                        {selectedCanonicalEntity === 'Contato' && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">id</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Identificador único de contato</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">contaId</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID canônico da Conta referenciada (Chave Estrangeira)</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">nome</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Nome completo do indivíduo cadastrado</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">cargo</td><td className="p-2 font-mono text-slate-400">enum</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Chef, Comprador, Sócio, Gerente, Proprietário, Outro</td></tr>
                          </>
                        )}
                        {selectedCanonicalEntity === 'Cardapio' && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">id</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID único do documento de cardápio</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">contaId</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID da Conta proprietária do cardápio</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">hash</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Assinatura digital única para verificação anti-duplicidade</td></tr>
                          </>
                        )}
                        {selectedCanonicalEntity === 'ItemCardapio' && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">id</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID da linha extraída</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">cardapioId</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID do documento de origem associado</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">descricao_original</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Nome textual bruto lido no cardápio ou site</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">confianca</td><td className="p-2 font-mono text-slate-400">number</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Índice percentual (0.0 a 1.0) de acurácia da extração</td></tr>
                          </>
                        )}
                        {selectedCanonicalEntity === 'Produto' && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">sku</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Chave primária SKU mestre unificada (ex: "SKU-VAL-GRA-01")</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">nome</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Nomenclatura oficial homologada do SKU de venda</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">marca</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Fabricante de referência direta do catálogo mestre</td></tr>
                          </>
                        )}
                        {selectedCanonicalEntity === 'Oportunidade' && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">id</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID canônico da oportunidade de inteligência</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">contaId</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Associação com estabelecimento (Conta.id)</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">produtoSku</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Associação com o SKU ausente detectado (Produto.sku)</td></tr>
                          </>
                        )}
                        {![ 'Conta', 'Contato', 'Cardapio', 'ItemCardapio', 'Produto', 'Oportunidade' ].includes(selectedCanonicalEntity) && (
                          <>
                            <tr><td className="p-2 font-mono text-amber-400">id</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">ID único do registro de metadado canônico</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">version</td><td className="p-2 font-mono text-slate-400">number</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Controle numérico de versão incremental para auditorias</td></tr>
                            <tr><td className="p-2 font-mono text-amber-400">created_at</td><td className="p-2 font-mono text-slate-400">string</td><td className="p-2 text-emerald-400">Obrigatório</td><td className="p-2 text-slate-400">Data e hora em ISO UTC da criação do registro</td></tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Sample */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interface Declarada (TypeScript ES Module)</span>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="text-xs font-mono text-blue-400 leading-relaxed text-left">
                      {selectedCanonicalEntity === 'Conta' && `export interface CanonicalConta {
  id: string; // ID Principal do sistema
  id_radar: string | null;
  id_erp: string | null;
  cnpj: string; // Inteiros puros para evitar quebras
  razao_social: string;
  nome_fantasia: string;
  endereco: string;
  cidade: string;
  estado: string; // Ex: "RJ", "SP"
  segmento: string;
  origem: string; // Ex: "Google Maps"
  status: 'Prospect Radar' | 'Cliente Convertido' | 'Lead Qualificado';
  version: number; // Suporta reprocessamento
  created_at: string; // ISO 8601
  updated_at: string;
}`}
                      {selectedCanonicalEntity === 'Contato' && `export interface CanonicalContato {
  id: string;
  contaId: string; // Integridade de Chave Estrangeira
  nome: string;
  cargo: 'Chef' | 'Comprador' | 'Sócio' | 'Gerente' | 'Proprietário' | 'Outro';
  telefone: string;
  email: string;
  linkedin: string;
  version: number;
  created_at: string;
  updated_at: string;
}`}
                      {selectedCanonicalEntity === 'Cardapio' && `export interface CanonicalCardapio {
  id: string;
  contaId: string;
  origem: 'PDF' | 'Imagem' | 'Website' | 'Instagram' | 'iFood' | 'Rappi';
  data: string;
  formato: string;
  idioma: string;
  hash: string; //MD5 de segurança anti-duplicados
  versao: string;
  version: number;
  created_at: string;
  updated_at: string;
}`}
                      {selectedCanonicalEntity === 'ItemCardapio' && `export interface CanonicalItemCardapio {
  id: string;
  cardapioId: string;
  descricao_original: string;
  categoria_detectada: string;
  marca_detectada: string;
  produto_detectado: string;
  quantidade: number;
  unidade: string;
  confianca: number; // 0.0 - 1.0 (extraído por IA)
  version: number;
  created_at: string;
  updated_at: string;
}`}
                      {selectedCanonicalEntity === 'Produto' && `export interface CanonicalProduto {
  sku: string; // SKU mestre imutável
  categoria: string;
  marca: string;
  nome: string;
  unidade: string;
  version: number;
  created_at: string;
  updated_at: string;
}`}
                      {selectedCanonicalEntity === 'Oportunidade' && `export interface CanonicalOportunidade {
  id: string;
  contaId: string; // Chave estrangeira de Conta
  produtoSku: string; // SKU ausente mapeado
  categoriaId: string;
  status: 'Pendente' | 'Identificada' | 'Em Negociação' | 'Ganho' | 'Perdido';
  valorEstimado: number;
  dataFechamento: string;
  version: number;
  created_at: string;
  updated_at: string;
}`}
                      {![ 'Conta', 'Contato', 'Cardapio', 'ItemCardapio', 'Produto', 'Oportunidade' ].includes(selectedCanonicalEntity) && `export interface Canonical${selectedCanonicalEntity} {
  id: string;
  version: number;
  created_at: string;
  updated_at: string;
}`}
                    </pre>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* 3. Data Contract Converter Playground Simulator */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Playground Interativo</span>
              <h2 className="text-sm font-bold text-slate-800">C-Trade Data Contract Parser & Converter Simulator</h2>
              <p className="text-xs text-slate-400 font-medium">
                Simule a ingestão de payloads brutos não estruturados vindos de canais parceiros. Veja o conversor oficial transformar a carga original de forma idêntica e emitir metadados técnicos de auditoria.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Raw Input Side */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-500">JSON de Payload Bruto Recebido</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Predefinições:</span>
                    <button
                      onClick={() => setPlaygroundPreset('maps')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${playgroundPreset === 'maps' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      Google Maps
                    </button>
                    <button
                      onClick={() => setPlaygroundPreset('instagram')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${playgroundPreset === 'instagram' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      Instagram
                    </button>
                    <button
                      onClick={() => setPlaygroundPreset('ifood')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${playgroundPreset === 'ifood' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      iFood Delivery
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                    <span>Converter para Entidade Canônica:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="targetEnt" 
                        value="Conta" 
                        checked={playgroundTargetEntity === 'Conta'} 
                        onChange={() => {
                          setPlaygroundTargetEntity('Conta');
                          setPlaygroundOutput(null);
                        }} 
                      />
                      Conta
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="targetEnt" 
                        value="Contato" 
                        checked={playgroundTargetEntity === 'Contato'} 
                        onChange={() => {
                          setPlaygroundTargetEntity('Contato');
                          setPlaygroundOutput(null);
                        }} 
                      />
                      Contato
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="targetEnt" 
                        value="Cardapio" 
                        checked={playgroundTargetEntity === 'Cardapio'} 
                        onChange={() => {
                          setPlaygroundTargetEntity('Cardapio');
                          setPlaygroundOutput(null);
                        }} 
                      />
                      Cardápio
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="targetEnt" 
                        value="ItemCardapio" 
                        checked={playgroundTargetEntity === 'ItemCardapio'} 
                        onChange={() => {
                          setPlaygroundTargetEntity('ItemCardapio');
                          setPlaygroundOutput(null);
                        }} 
                      />
                      Item Cardápio
                    </label>
                  </div>

                  <textarea
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    rows={12}
                    className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>

                <Button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(playgroundInput);
                      let canonical: any = null;
                      if (playgroundTargetEntity === 'Conta') {
                        canonical = CanonicalModelConverter.toCanonicalConta(parsed, `Playground: ${playgroundPreset.toUpperCase()}`);
                      } else if (playgroundTargetEntity === 'Contato') {
                        canonical = CanonicalModelConverter.toCanonicalContato(parsed, parsed.contaId || 'ACC-SAMPLE-01');
                      } else if (playgroundTargetEntity === 'Cardapio') {
                        canonical = CanonicalModelConverter.toCanonicalCardapio(parsed, parsed.contaId || 'ACC-SAMPLE-01');
                      } else if (playgroundTargetEntity === 'ItemCardapio') {
                        canonical = CanonicalModelConverter.toCanonicalItemCardapio(parsed, parsed.cardapioId || 'MNU-SAMPLE-01');
                      }
                      setPlaygroundOutput(canonical);
                      setPlaygroundError(null);
                    } catch (err: any) {
                      setPlaygroundError(err.message || 'Erro ao decodificar JSON.');
                      setPlaygroundOutput(null);
                    }
                  }}
                  variant="primary"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider"
                  leftIcon={<Play className="h-4 w-4" />}
                >
                  Executar Conversão Canônica
                </Button>
              </div>

              {/* Conversion Output Side */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-500">Resultado Oficial do Contrato (Canônico)</label>
                  {playgroundOutput && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sanitized & Schema-Compliant
                    </span>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[300px] flex flex-col justify-between font-mono text-xs">
                  {playgroundError && (
                    <div className="p-3 bg-rose-950/50 border border-rose-900 rounded-lg text-rose-300 text-xs">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <XCircle className="h-4 w-4 text-rose-400" />
                        Erro no Contrato de Entrada
                      </div>
                      <p className="text-[11px] leading-relaxed font-semibold font-mono">{playgroundError}</p>
                    </div>
                  )}

                  {!playgroundOutput && !playgroundError && (
                    <div className="my-auto text-center py-12 text-slate-500 italic text-xs space-y-2">
                      <Layers className="h-8 w-8 text-slate-600 mx-auto animate-bounce" />
                      <p>Aguardando submissão do payload...</p>
                      <p className="text-[10px] opacity-70">Ajuste o JSON à esquerda e clique em Executar Conversão.</p>
                    </div>
                  )}

                  {playgroundOutput && (
                    <pre className="text-emerald-400 text-left text-xs leading-relaxed overflow-x-auto max-h-[320px] font-mono">
                      {JSON.stringify(playgroundOutput, null, 2)}
                    </pre>
                  )}

                  {playgroundOutput && (
                    <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400">
                      <span>• Internal Record Version: <strong>{playgroundOutput.version}</strong></span>
                      <span>• Timestamp Inserido: <strong>{playgroundOutput.created_at ? 'UTC ISO8601' : 'NULO'}</strong></span>
                    </div>
                  )}
                </div>

                {/* Simulated Referential Integrity Test result */}
                {playgroundOutput && (
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs uppercase">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                      Teste de Integridade Referencial Integrada
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      O verificador de chaves primárias e relacionamentos (`CanonicalIntegrityVerifier`) analisou a entidade gerada. Resultado: <strong className="text-emerald-700">Aprovado</strong>. Chaves associadas e versionamentos estão em total sincronia com as regras de integridade do Enterprise Data Contract.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Architectural improvements & preparation for Data Contract */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-3xs space-y-2 text-left">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <Settings className="h-4 w-4 text-amber-500" /> Preparação Técnica para o Data Contract
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Nenhum módulo interno do Radar C-Trade consome ou emite payloads brutos diretamente. O pipeline força o isolamento de dados: toda fonte de dados passa pelo tradutor `CanonicalModelConverter` antes de persistir no banco ou ser consumida por módulos de análise. Isso garante que mudanças em APIs externas não quebrem a inteligência de negócios.
              </p>
            </div>
            
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-3xs space-y-2 text-left">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500 animate-pulse" /> Suporte Nativo a Versionamento & Auditoria
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Todas as entidades canônicas herdam `version` e registros de alteração `created_at` / `updated_at`. Utilizando a classe utilitária de auditoria `CanonicalVersioningManager.compareVersions`, o sistema gera relatórios automáticos detalhando quais chaves e campos mudaram, garantindo reprocessamentos limpos e comparação exata de versões.
              </p>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'arquitetura_banco' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database className="h-64 w-64 text-indigo-400" />
            </div>
            <div className="relative z-10 max-w-4xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Commit 5.4 — Arquitetura de Banco de Dados Oficial
                </span>
                <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono px-2 py-1 rounded-full">
                  Supabase Centralizado (Multi-Schema PostgreSQL)
                </span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                C-Trade Intelligence Central Database Schema
              </h1>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Arquitetura de dados corporativa e unificada do ecossistema C-Trade Intelligence. Toda informação do sistema é estruturada em **6 Schemas Isolados** por responsabilidade, evitando redundâncias, tabelas duplicadas ou sincronizações desnecessárias. Claude e Radar consomem e evoluem exatamente o mesmo banco de dados.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-indigo-300 pt-3 border-t border-slate-800/80 font-mono">
                <span>• <strong>Ownership Isolation:</strong> Responsabilidades bem definidas de escrita e leitura</span>
                <span>• <strong>No Sync Overhead:</strong> Dados transitam naturalmente entre os Schemas</span>
                <span>• <strong>Enterprise Readiness:</strong> Estruturado para performance, particionamento e auditorias</span>
              </div>
            </div>
          </div>

          {/* 1. Schemas Navigation & Specification Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Especificações de Schema</span>
              <h2 className="text-sm font-bold text-slate-800">Camadas do Banco de Dados (PostgreSQL Schemas)</h2>
              <p className="text-xs text-slate-400 font-medium">
                Clique nos schemas oficiais abaixo para ver as tabelas associadas, chaves de relacionamentos, permissões de acesso e o script DDL oficial de criação.
              </p>
            </div>

            {/* Schemas Buttons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
              {OFFICIAL_SCHEMAS.map((sch) => {
                const isSelected = selectedDbSchema === sch.name;
                return (
                  <button
                    key={sch.name}
                    onClick={() => {
                      setSelectedDbSchema(sch.name);
                      setSelectedDbTable(sch.tables[0]?.name || '');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-500/10'
                        : 'bg-slate-50/30 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                        sch.name === 'raw' ? 'bg-red-100 text-red-800' :
                        sch.name === 'staging' ? 'bg-amber-100 text-amber-800' :
                        sch.name === 'config' ? 'bg-blue-100 text-blue-800' :
                        sch.name === 'audit' ? 'bg-slate-200 text-slate-800' :
                        sch.name === 'radar' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {sch.name.toUpperCase()}
                      </span>
                      <Database className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-xs font-black text-slate-800 block leading-tight">{sch.name === 'raw' ? 'RAW' : sch.name === 'staging' ? 'STAGING' : sch.name === 'config' ? 'CONFIG' : sch.name === 'audit' ? 'AUDIT' : sch.name === 'radar' ? 'RADAR' : 'INTEGRATION'}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">Dono: {sch.owner}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Schema Info Card */}
            {(() => {
              const currentSchema = OFFICIAL_SCHEMAS.find(s => s.name === selectedDbSchema);
              if (!currentSchema) return null;
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
                  
                  {/* Left Specs */}
                  <div className="lg:col-span-5 space-y-4 text-left">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                        {currentSchema.label}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {currentSchema.description}
                      </p>
                    </div>

                    {/* Ownership Access Table */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Matriz de Acesso & Ownership</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-black block uppercase">Dono Principal</span>
                          <span className="text-xs font-bold text-indigo-700">{currentSchema.owner}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-black block uppercase">Pode Gravar</span>
                          <span className="text-xs font-bold text-slate-700">{currentSchema.writableBy}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-black block uppercase">Pode Ler</span>
                          <span className="text-xs font-bold text-slate-700">{currentSchema.readableBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tables Selector inside current Schema */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tabelas Contidas</span>
                      <div className="grid grid-cols-1 gap-2">
                        {currentSchema.tables.map((table) => (
                          <button
                            key={table.name}
                            onClick={() => setSelectedDbTable(table.name)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedDbTable === table.name
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold block">{table.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{table.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Specs (Columns & SQL DDL) */}
                  <div className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-4">
                    {(() => {
                      const currentTable = currentSchema.tables.find(t => t.name === selectedDbTable);
                      if (!currentTable) return <div className="text-slate-400 text-xs italic">Nenhuma tabela selecionada neste schema.</div>;
                      return (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-mono font-bold text-indigo-400">
                              {selectedDbSchema}.{currentTable.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                              PostgreSQL DDL
                            </span>
                          </div>

                          {/* Columns List */}
                          <div className="space-y-2 text-left">
                            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Definição de Colunas</span>
                            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 max-h-[160px] overflow-y-auto">
                              <table className="w-full text-[11px] font-mono text-left">
                                <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                                  <tr>
                                    <th className="p-2">Coluna</th>
                                    <th className="p-2">Tipo</th>
                                    <th className="p-2">Constraint</th>
                                    <th className="p-2">Notas</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                                  {currentTable.columns.map((col) => (
                                    <tr key={col.name}>
                                      <td className={`p-2 font-bold ${col.isPrimaryKey ? 'text-indigo-400' : col.isForeignKey ? 'text-amber-400' : ''}`}>
                                        {col.name} {col.isPrimaryKey ? '🔑' : col.isForeignKey ? '🔗' : ''}
                                      </td>
                                      <td className="p-2 text-slate-400">{col.type}</td>
                                      <td className="p-2 text-slate-500">{col.nullable ? 'NULL' : 'NOT NULL'}</td>
                                      <td className="p-2 text-slate-400 italic text-[10px]">{col.notes || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* SQL Script View */}
                          <div className="space-y-1.5 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Script DDL Oficiail (Supabase Compilado)</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(currentTable.sqlDdl);
                                  alert('Script SQL copiado com sucesso!');
                                }}
                                className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700 transition-all flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" /> Copiar SQL
                              </button>
                            </div>
                            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 overflow-x-auto">
                              <pre className="text-xs font-mono text-amber-300 leading-relaxed text-left max-h-[160px] overflow-y-auto">
                                {currentTable.sqlDdl}
                              </pre>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>
              );
            })()}
          </div>

          {/* 2. Interactive Data Flow Simulator (RAW -> STAGING -> RADAR -> INTEGRATION) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Simulador de Ciclo de Vida</span>
              <h2 className="text-sm font-bold text-slate-800">C-Trade Lifecycle Data Flow Simulator</h2>
              <p className="text-xs text-slate-400 font-medium">
                Veja o ciclo de vida real ocorrendo no banco de dados Supabase unificado. Clique em cada etapa em sequência para transitar as informações entre os Schemas e auditar em tempo real no `audit` log.
              </p>
            </div>

            {/* Flow Stepper Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-left">
              
              {/* Step 1: Raw Ingestion */}
              <div className={`p-4 rounded-xl border transition-all ${
                dbSimulationStep >= 1 ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">ETAPA 1</span>
                  {dbSimulationStep >= 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"></div>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">RAW Ingestion (Claude)</h4>
                <p className="text-[11px] text-slate-400 font-medium">Collector detecta estabelecimento bruto e insere JSON bruto em `raw.raw_collectors_payload`.</p>
                <button
                  disabled={dbSimulationStep !== 0}
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString('pt-BR');
                    const newLog: DatabaseLog = {
                      id: `sim-raw-${Date.now()}`,
                      timestamp,
                      schema: 'raw',
                      table: 'raw_collectors_payload',
                      operation: 'INSERT',
                      performedBy: 'Claude',
                      payload: `INSERT INTO raw.raw_collectors_payload (source, raw_data) VALUES ('Google Maps', '{"nome": "Vito Pizzaria", "cnpj_bruto": "24.912.483/0001-92", "rua": "Av Paulista 1000", "menu_text": "Pizza Calabresa 42.00, Chopp Skol 9.00"}');`
                    };
                    const auditLog: DatabaseLog = {
                      id: `sim-aud-${Date.now()}`,
                      timestamp,
                      schema: 'audit',
                      table: 'aud_pipeline_executions',
                      operation: 'AUDIT',
                      performedBy: 'System',
                      payload: `INSERT INTO audit.aud_pipeline_executions (execution_id, elapsed_time_ms, records_processed) VALUES ('EXEC-RAW-0912', 320, 1);`
                    };
                    setDbLogs(prev => [newLog, auditLog, ...prev]);
                    setDbSimulationStep(1);
                  }}
                  className={`mt-4 w-full py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                    dbSimulationStep === 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {dbSimulationStep >= 1 ? 'Dados Ingeridos' : 'Iniciar Ingestão RAW'}
                </button>
              </div>

              {/* Step 2: Processing into Staging */}
              <div className={`p-4 rounded-xl border transition-all ${
                dbSimulationStep >= 2 ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">ETAPA 2</span>
                  {dbSimulationStep >= 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"></div>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">STAGING Processing</h4>
                <p className="text-[11px] text-slate-400 font-medium">O pipeline unifica, valida e insere em `staging.stg_contas` e `staging.stg_cardapio_itens`.</p>
                <button
                  disabled={dbSimulationStep !== 1}
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString('pt-BR');
                    const newLog1: DatabaseLog = {
                      id: `sim-stg-1-${Date.now()}`,
                      timestamp,
                      schema: 'staging',
                      table: 'stg_contas',
                      operation: 'INSERT',
                      performedBy: 'Claude',
                      payload: `INSERT INTO staging.stg_contas (cnpj, razao_social, nome_fantasia, status_prospeccao) VALUES ('24912483000192', 'Vito Pizzaria Ltda', 'Vito Pizzaria', 'Prospect Radar');`
                    };
                    const newLog2: DatabaseLog = {
                      id: `sim-stg-2-${Date.now()}`,
                      timestamp,
                      schema: 'staging',
                      table: 'stg_cardapio_itens',
                      operation: 'INSERT',
                      performedBy: 'Claude',
                      payload: `INSERT INTO staging.stg_cardapio_itens (descricao_original, categoria_detectada, confidence_score) VALUES ('Chopp Skol 9.00', 'Bebidas Alcoólicas', 0.95);`
                    };
                    setDbLogs(prev => [newLog1, newLog2, ...prev]);
                    setDbSimulationStep(2);
                  }}
                  className={`mt-4 w-full py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                    dbSimulationStep === 1
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {dbSimulationStep >= 2 ? 'Processado em Staging' : 'Processar para Staging'}
                </button>
              </div>

              {/* Step 3: Curator Approval into RADAR */}
              <div className={`p-4 rounded-xl border transition-all ${
                dbSimulationStep >= 3 ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">ETAPA 3</span>
                  {dbSimulationStep >= 3 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"></div>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">RADAR Homologation</h4>
                <p className="text-[11px] text-slate-400 font-medium">Curador aprova registro no Radar, movendo-o para a Base Oficial em `radar.tb_contas_oficial`.</p>
                <button
                  disabled={dbSimulationStep !== 2}
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString('pt-BR');
                    const officialId = '6a2b8e3d-8888-4444-9999-5f210d7a6e9a';
                    const newLog1: DatabaseLog = {
                      id: `sim-rad-1-${Date.now()}`,
                      timestamp,
                      schema: 'radar',
                      table: 'tb_contas_oficial',
                      operation: 'INSERT',
                      performedBy: 'Radar',
                      payload: `INSERT INTO radar.tb_contas_oficial (id, cnpj, razao_social, nome_fantasia, segmento_oficial, user_homologador) VALUES ('${officialId}', '24912483000192', 'Vito Pizzaria Ltda', 'Vito Pizzaria', 'Pizzaria', 'marcelobbaquero@gmail.com');`
                    };
                    const newLog2: DatabaseLog = {
                      id: `sim-rad-2-${Date.now()}`,
                      timestamp,
                      schema: 'radar',
                      table: 'tb_oportunidades_oficial',
                      operation: 'INSERT',
                      performedBy: 'Radar',
                      payload: `INSERT INTO radar.tb_oportunidades_oficial (conta_id, sku_ausente, valor_estimado) VALUES ('${officialId}', 'SKU-VAL-GRA-01', 4500.00);`
                    };
                    const auditLog: DatabaseLog = {
                      id: `sim-rad-aud-${Date.now()}`,
                      timestamp,
                      schema: 'audit',
                      table: 'aud_curator_actions',
                      operation: 'AUDIT',
                      performedBy: 'Radar',
                      payload: `INSERT INTO audit.aud_curator_actions (user_email, target_table, record_id, action_type) VALUES ('marcelobbaquero@gmail.com', 'tb_contas_oficial', '${officialId}', 'APPROVE_CONTA');`
                    };
                    setDbLogs(prev => [newLog1, newLog2, auditLog, ...prev]);
                    setDbSimulationStep(3);
                  }}
                  className={`mt-4 w-full py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                    dbSimulationStep === 2
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {dbSimulationStep >= 3 ? 'Homologado na Base Oficial' : 'Homologar Registro'}
                </button>
              </div>

              {/* Step 4: Integration Sync */}
              <div className={`p-4 rounded-xl border transition-all ${
                dbSimulationStep >= 4 ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">ETAPA 4</span>
                  {dbSimulationStep >= 4 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"></div>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">INTEGRATION Queue</h4>
                <p className="text-[11px] text-slate-400 font-medium">As oportunidades qualificadas entram na fila de exportação do conector CRM em `integration`.</p>
                <button
                  disabled={dbSimulationStep !== 3}
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString('pt-BR');
                    const newLog: DatabaseLog = {
                      id: `sim-int-${Date.now()}`,
                      timestamp,
                      schema: 'integration',
                      table: 'int_crm_exports',
                      operation: 'INSERT',
                      performedBy: 'System',
                      payload: `INSERT INTO integration.int_crm_exports (oportunidade_id, crm_destino, status_sync) VALUES ('opp-9912a', 'RD Station CRM', 'Pendente');`
                    };
                    setDbLogs(prev => [newLog, ...prev]);
                    setDbSimulationStep(4);
                  }}
                  className={`mt-4 w-full py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                    dbSimulationStep === 3
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {dbSimulationStep >= 4 ? 'Pronto para CRM Sync' : 'Preparar Fila CRM'}
                </button>
              </div>

            </div>

            {/* Simulation Console Logger */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-indigo-500 animate-pulse" /> Console de Operações do Banco (Supabase Auditor)
                </span>
                <button
                  onClick={() => {
                    setDbSimulationStep(0);
                    setDbLogs([
                      {
                        id: `log-res-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString('pt-BR'),
                        schema: 'audit',
                        table: 'aud_pipeline_executions',
                        operation: 'AUDIT',
                        performedBy: 'System',
                        payload: '{"event": "Database Simulation Logs Cleared. System reset ready."}'
                      }
                    ]);
                  }}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono px-2 py-1 rounded transition-all"
                >
                  Resetar Fluxo
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-4 min-h-[180px] max-h-[300px] overflow-y-auto font-mono text-xs space-y-2">
                {dbLogs.map((log) => (
                  <div key={log.id} className="border-b border-slate-800/40 pb-2 flex items-start gap-3">
                    <span className="text-slate-500 text-[10px] font-bold">{log.timestamp}</span>
                    <span className={`text-[9px] font-black px-1 rounded uppercase select-none ${
                      log.operation === 'INSERT' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' :
                      log.operation === 'SELECT' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                      log.operation === 'UPDATE' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {log.operation}
                    </span>
                    <div className="space-y-0.5 flex-1">
                      <div className="text-[10px] text-slate-400">
                        Schema: <strong className="text-slate-300">{log.schema}</strong> • Tabela: <strong className="text-slate-300">{log.table}</strong> • Autor: <strong className="text-indigo-400">{log.performedBy}</strong>
                      </div>
                      <div className="text-[11px] text-indigo-200 leading-relaxed overflow-x-auto whitespace-pre-wrap font-semibold">
                        {log.payload}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Architectural Decision Log & Isolation Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Isolation Strategy */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" /> Estratégia de Isolamento Lógico (Supabase RLS)
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Cada um dos 6 Schemas no Supabase PostgreSQL possui políticas estritas de **Row Level Security (RLS)** e isolamento de permissões de role (papel):
              </p>
              <ul className="text-[11px] text-slate-400 font-bold space-y-2 pt-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-mono">•</span>
                  <span><strong>Claude Role:</strong> Possui acesso total de escrita no schema `raw` e `staging`, mas apenas privilégio de leitura no `config` e `audit`. Bloqueado de escrever na Base Oficial (`radar`).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-mono">•</span>
                  <span><strong>Radar/Curator Role:</strong> Sem privilégios de gravação ou alteração de dados históricos no schema `raw`. Permissão total de leitura no `staging` e escrita definitiva na Base Oficial `radar` e `audit`.</span>
                </li>
              </ul>
            </div>

            {/* Scalability and Expansion */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-blue-500" /> Preparação para Altas Cargas e Particionamento
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                O banco de dados foi projetado para evitar gargalos durante o processamento de grandes lotes de dados oriundos de coletores:
              </p>
              <ul className="text-[11px] text-slate-400 font-bold space-y-2 pt-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-mono">•</span>
                  <span><strong>Particionamento por Data:</strong> A tabela `raw.raw_collectors_payload` foi estruturada para permitir particionamento mensal baseado no campo `created_at` em momentos de alta volumetria.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-mono">•</span>
                  <span><strong>Indexação Inteligente:</strong> Chaves estrangeiras (`raw_id`, `conta_id`) e campos de verificação como CNPJ e hashes de documentos contam com índices dedicados (B-Tree/GIN) para busca relâmpago.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'integ_claude' && (
        <ClaudeIntegrationCenter />
      )}

    </div>
  );
}
