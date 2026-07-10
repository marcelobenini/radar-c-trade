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
    ]
  }
];

export default function PipelineIntake() {
  const [activeTab, setActiveTab] = useState<'lotes' | 'regras' | 'execucoes'>('lotes');
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
    setProcessingProgress(15);
    setProcessingStatusText('Conectando ao endpoint de recebimento...');

    // Get current simulation user
    const simulatedUser = SecurityService.getRealUser().name + ' ' + SecurityService.getRealUser().lastName;

    // Simulation steps
    setTimeout(() => {
      setProcessingProgress(45);
      setProcessingStatusText('Esquema recebido. Iniciando motor de pré-validação...');
    }, 400);

    setTimeout(() => {
      setProcessingProgress(80);
      setProcessingStatusText('Executando validações estruturais, formatos e regras de chaves obrigatórias...');
    }, 850);

    setTimeout(() => {
      // Define the payload based on chosen type
      let name = '';
      let records: IntakeRecord[] = [];

      const { date, time, full } = getCurrentDateTime();
      const batchId = `BATCH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      if (simPayloadType === 'carga_a') {
        name = 'Simulação: Cardápio PDF Babbo Osteria';
        records = [
          { id: 's-rec-1', field1: 'Babbo Osteria SpA', field2: 'Rio de Janeiro/RJ', field3: 'Cardapio_Osteria_Original.pdf', status: 'Pendente' }
        ];
      } else if (simPayloadType === 'carga_b') {
        name = 'Simulação: Inbound Leads CRM API';
        records = [
          { id: 's-rec-2', field1: 'Tarantella Ristorante', field2: 'São Paulo/SP (CNPJ: 14.882.112/0001-44)', field3: 'Lead ID: crm-9842', status: 'Pendente' },
          { id: 's-rec-3', field1: 'Don Giovanni Forneria', field2: 'Curitiba/PR (CNPJ: 32.115.002/0001-55)', field3: 'Lead ID: crm-9843', status: 'Pendente' }
        ];
      } else if (simPayloadType === 'carga_c') {
        name = 'Simulação: Prospecção CSV';
        records = [
          { id: 's-rec-4', field1: 'Pizzaria Margherita', field2: 'Blumenau/SC', field3: 'Lista_Prospects_Sul.csv', status: 'Pendente' },
          { id: 's-rec-5', field1: 'Sapore di Pasta', field2: 'Florianópolis/SC', field3: 'Lista_Prospects_Sul.csv', status: 'Pendente' },
          { id: 's-rec-6', field1: 'Cantina Fellini', field2: 'Porto Alegre/RS', field3: 'Lista_Prospects_Sul.csv', status: 'Pendente' }
        ];
      } else if (simPayloadType === 'carga_d') {
        name = 'Simulação: Visitas em Campo (Erro)';
        records = [
          { id: 's-rec-7', field1: 'Pizzaria Bella Ciao', field2: 'Santos/SP (CNPJ: 22.115.432/0001-77)', field3: 'Visitas_Campo_Noroeste.xlsx', status: 'Rejeitado' },
          { id: 's-rec-8', field1: 'Pizzaria Nonna', field2: 'Guarujá/SP (CNPJ: AUSENTE)', field3: 'Visitas_Campo_Noroeste.xlsx', status: 'Rejeitado' }
        ];
      } else {
        name = 'Simulação: Payload API Corrompido (Erro)';
        records = [];
      }

      // EXECUTE CONFIGURED RULE ENGINE
      const engineResult = ValidationEngine.runEngine({
        batchId,
        payloadType: simPayloadType,
        recordsCount: records.length,
        hasCnpjMissing: simPayloadType === 'carga_d',
        isCorruptedPayload: simPayloadType === 'carga_e'
      });

      const isSuccess = engineResult.success;
      // Gather errors and warnings from Rule Engine
      const validationError = !isSuccess ? engineResult.errors.join(' | ') : undefined;

      const finalStatus: IntakeBatch['status'] = isSuccess ? 'Aguardando Curadoria' : 'Rejeitado';

      // Create tracking chronology logs based on the rule execution results!
      const newLogs: IntakeTraceLog[] = [];
      
      if (isSuccess) {
        newLogs.push({
          id: `log-s-${Date.now()}-3`,
          timestamp: full,
          user: 'Motor de Validação',
          event: `Pré-validação concluída com sucesso. Regras ativas aplicadas sem falhas estruturais críticas. (${engineResult.warnings.length} avisos tolerados).`,
          prevStatus: 'Validando',
          newStatus: 'Aguardando Curadoria'
        });
      } else {
        newLogs.push({
          id: `log-s-${Date.now()}-3`,
          timestamp: full,
          user: 'Motor de Validação',
          event: `Falha na pré-validação estrutural. Regra configurada impediu o processamento. Causa: ${validationError}`,
          prevStatus: 'Validando',
          newStatus: 'Rejeitado'
        });
      }

      // Stagger details of rules executed in log
      engineResult.executionLogs.forEach((elog, idx) => {
        newLogs.push({
          id: `log-s-rule-${elog.id}`,
          timestamp: full,
          user: 'Rule Engine',
          event: `[${elog.ruleCode}] ${elog.ruleName} aplicada. Resultado: ${elog.result} (Ação: ${elog.actionPerformed}) em ${elog.executionTimeMs}ms.`,
          prevStatus: 'Validando',
          newStatus: 'Validando'
        });
      });

      newLogs.push({
        id: `log-s-${Date.now()}-2`,
        timestamp: full,
        user: 'Sistema Global C-Trade',
        event: 'Iniciando validação preliminar do esquema e integridade de integradores externos.',
        prevStatus: 'Recebido',
        newStatus: 'Validando'
      });

      newLogs.push({
        id: `log-s-${Date.now()}-1`,
        timestamp: full,
        user: simSource === 'Claude' ? 'Claude Agent' : simSource === 'API' ? 'Endpoint API Gateway' : simulatedUser,
        event: `Carga de dados ingerida através da fonte externa: [${simSource}].`,
        prevStatus: '-',
        newStatus: 'Recebido'
      });

      const newBatch: IntakeBatch = {
        id: batchId,
        name,
        date,
        time,
        source: simSource,
        responsible: simSource === 'Claude' ? 'Claude AI Agent' : simSource === 'API' ? 'API Integration' : simulatedUser,
        recordCount: records.length,
        status: finalStatus,
        updatedAt: full,
        validationError,
        records,
        logs: newLogs
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
        description: `Lote ${batchId} (${name}) de origem [${simSource}] processado pelo Motor de Regras configuráveis.`,
        affectedRecord: batchId,
        recordCount: records.length
      });

    }, 1200);
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
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eraser className="h-4 w-4" />}
              onClick={handleClearRuleExecutionLogs}
            >
              Limpar Logs
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
                          Integridade de esquema e regras de negócios ativas validadas com sucesso sem nenhum bloqueio relatado.
                        </p>
                      </div>
                    )}
                  </div>

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

    </div>
  );
}
