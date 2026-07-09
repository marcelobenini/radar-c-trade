/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge, Tag, Toast, EmptyState, Tooltip } from '../components/ui/Feedback';
import { LateralDrawer, Modal, Tabs } from '../components/ui/Interactive';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
  FileDown,
  FileSpreadsheet,
  Send,
  Edit,
  Clock,
  User,
  Building2,
  Database,
  Lock,
  Shield,
  Activity,
  HardDrive,
  Play,
  Pause,
  Save,
  Check,
  ExternalLink,
  Eye,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Settings,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  Layers,
  History,
  Cable,
  Server
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

// Integration Data Types
export interface SyncQueueItem {
  id: string;
  cliente: string;
  status: 'Sucesso' | 'Erro' | 'Aguardando' | 'Cancelado';
  destino: string;
  data: string;
  responsavel: string;
  resultado: string;
  payloadSize: string;
  retryCount: number;
}

export interface FieldMapping {
  id: string;
  radarField: string;
  radarType: string;
  rdField: string;
  rdType: string;
  custom: boolean;
  status: 'Ativo' | 'Inativo';
}

export interface IntegrationHistoryLog {
  id: string;
  data: string;
  destino: string;
  usuario: string;
  quantidade: number;
  resultado: 'Sucesso' | 'Falha Parcial' | 'Falha Crítica';
  tempoExecucao: string;
}

const STORAGE_KEY_SYNC_QUEUE = 'ctrade_sync_queue_data';
const STORAGE_KEY_FIELD_MAPPING = 'ctrade_field_mapping_data';
const STORAGE_KEY_RD_CONFIG = 'ctrade_rd_config_data';

// Pre-seeded Mock Data matching the user requirement
const INITIAL_SYNC_QUEUE: SyncQueueItem[] = [
  { id: 'sync-001', cliente: 'Osteria Bella Italia', status: 'Aguardando', destino: 'RD Station CRM', data: '2026-07-07 12:00', responsavel: 'Carlos Silva', resultado: 'Pronto na fila para envio automático', payloadSize: '4.2 KB', retryCount: 0 },
  { id: 'sync-002', cliente: 'Pizzaria Bella Napoli', status: 'Sucesso', destino: 'RD Station CRM', data: '2026-07-07 11:15', responsavel: 'Ana Souza', resultado: 'Lead atualizado e enriquecido no pipeline padrão', payloadSize: '3.8 KB', retryCount: 0 },
  { id: 'sync-003', cliente: 'Beto Burger & Co.', status: 'Sucesso', destino: 'RD Station CRM', data: '2026-07-07 10:30', responsavel: 'Carlos Silva', resultado: 'Lead ID rd-77810 criado com sucesso', payloadSize: '5.1 KB', retryCount: 0 },
  { id: 'sync-004', cliente: 'Trattoria da Nonna', status: 'Erro', destino: 'RD Station CRM', data: '2026-07-06 17:45', responsavel: 'Felipe Mendes', resultado: 'Token de API inválido ou expirado (HTTP 401)', payloadSize: '3.5 KB', retryCount: 2 },
  { id: 'sync-005', cliente: 'Hotel Fasano Alimentos', status: 'Sucesso', destino: 'RD Station CRM', data: '2026-07-05 14:00', responsavel: 'Felipe Mendes', resultado: 'Lead enviado e associado ao vendedor Felipe Mendes', payloadSize: '6.4 KB', retryCount: 0 },
  { id: 'sync-006', cliente: 'Spoleto Shopping Plaza', status: 'Cancelado', destino: 'RD Station CRM', data: '2026-07-05 09:12', responsavel: 'Mariana Rocha', resultado: 'Sincronização abortada manualmente pelo gestor', payloadSize: '2.9 KB', retryCount: 0 },
  { id: 'sync-007', cliente: 'Padaria Pão de Ouro', status: 'Erro', destino: 'RD Station CRM', data: '2026-06-30 11:05', responsavel: 'Ana Souza', resultado: 'Faturamento fora da faixa suportada pelo funil (HTTP 422)', payloadSize: '3.1 KB', retryCount: 1 }
];

const INITIAL_FIELD_MAPPING: FieldMapping[] = [
  { id: 'm-1', radarField: 'Nome Cliente', radarType: 'Texto', rdField: 'Empresa', rdType: 'Texto', custom: false, status: 'Ativo' },
  { id: 'm-2', radarField: 'Cidade', radarType: 'Texto', rdField: 'Cidade', rdType: 'Texto', custom: false, status: 'Ativo' },
  { id: 'm-3', radarField: 'Estado', radarType: 'Texto', rdField: 'Estado', rdType: 'Texto', custom: false, status: 'Ativo' },
  { id: 'm-4', radarField: 'Score Comercial', radarType: 'Número', rdField: 'Score_Comercial_c (Personalizado)', rdType: 'Número', custom: true, status: 'Ativo' },
  { id: 'm-5', radarField: 'Score de Fit', radarType: 'Número', rdField: 'Score_Fit_c (Personalizado)', rdType: 'Número', custom: true, status: 'Ativo' },
  { id: 'm-6', radarField: 'Potencial Comercial', radarType: 'Texto', rdField: 'Lead Score', rdType: 'Texto', custom: false, status: 'Ativo' },
  { id: 'm-7', radarField: 'Valor Potencial Estimado', radarType: 'Moeda', rdField: 'Valor_Potencial_c (Personalizado)', rdType: 'Moeda', custom: true, status: 'Ativo' },
  { id: 'm-8', radarField: 'Responsável', radarType: 'Texto', rdField: 'Vendedor Atribuído', rdType: 'Texto', custom: false, status: 'Ativo' },
  { id: 'm-9', radarField: 'Produtos Recomendados', radarType: 'Lista', rdField: 'Observacoes', rdType: 'Texto', custom: false, status: 'Ativo' }
];

const INITIAL_HISTORICO: IntegrationHistoryLog[] = [
  { id: 'h-1', data: '2026-07-07 11:15', destino: 'RD Station CRM', usuario: 'Ana Souza', quantidade: 1, resultado: 'Sucesso', tempoExecucao: '1.2s' },
  { id: 'h-2', data: '2026-07-07 10:30', destino: 'RD Station CRM', usuario: 'Carlos Silva', quantidade: 1, resultado: 'Sucesso', tempoExecucao: '0.9s' },
  { id: 'h-3', data: '2026-07-06 17:45', destino: 'RD Station CRM', usuario: 'Felipe Mendes', quantidade: 1, resultado: 'Falha Crítica', tempoExecucao: '4.5s' },
  { id: 'h-4', data: '2026-07-05 14:00', destino: 'RD Station CRM', usuario: 'Felipe Mendes', quantidade: 1, resultado: 'Sucesso', tempoExecucao: '1.5s' },
  { id: 'h-5', data: '2026-07-03 09:00', destino: 'RD Station CRM', usuario: 'Sistema C-Trade', quantidade: 5, resultado: 'Falha Parcial', tempoExecucao: '12.4s' }
];

export default function Integracoes() {
  const [activeTab, setActiveTab] = useState('geral');
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [historyLogs] = useState<IntegrationHistoryLog[]>(INITIAL_HISTORICO);

  // RD Station Configuration States
  const [rdToken, setRdToken] = useState('rd_token_live_773bf91102ca938efc');
  const [rdApiKey, setRdApiKey] = useState('rd_api_key_sec_88410ff9c00b0e');
  const [rdWebhookUrl, setRdWebhookUrl] = useState('https://ais-dev-sb5xqfdl42xtuzqgrbpef5.run.app/api/webhooks/rd-station');
  const [rdPipeline, setRdPipeline] = useState('Funil de Vendas - Radar C-Trade');
  const [rdDefaultOwner, setRdDefaultOwner] = useState('Carlos Silva');
  const [rdIsActive, setRdIsActive] = useState(true);

  // Search & Filter States for Sync Queue
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Modals / Lateral Drawer
  const [isNewMappingOpen, setIsNewMappingOpen] = useState(false);
  const [newMappingForm, setNewMappingForm] = useState<Partial<FieldMapping>>({
    radarField: '',
    radarType: 'Texto',
    rdField: '',
    rdType: 'Texto',
    custom: true,
    status: 'Ativo'
  });

  const [selectedQueueItem, setSelectedQueueItem] = useState<SyncQueueItem | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; desc?: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);

  const addToast = (msg: string, desc?: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, desc, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load persistence states
  useEffect(() => {
    const storedQueue = localStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
    if (storedQueue) {
      try { setSyncQueue(JSON.parse(storedQueue)); } catch (e) { setSyncQueue(INITIAL_SYNC_QUEUE); }
    } else {
      setSyncQueue(INITIAL_SYNC_QUEUE);
      localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(INITIAL_SYNC_QUEUE));
    }

    const storedMapping = localStorage.getItem(STORAGE_KEY_FIELD_MAPPING);
    if (storedMapping) {
      try { setFieldMappings(JSON.parse(storedMapping)); } catch (e) { setFieldMappings(INITIAL_FIELD_MAPPING); }
    } else {
      setFieldMappings(INITIAL_FIELD_MAPPING);
      localStorage.setItem(STORAGE_KEY_FIELD_MAPPING, JSON.stringify(INITIAL_FIELD_MAPPING));
    }

    const storedRD = localStorage.getItem(STORAGE_KEY_RD_CONFIG);
    if (storedRD) {
      try {
        const parsed = JSON.parse(storedRD);
        setRdToken(parsed.rdToken || '');
        setRdApiKey(parsed.rdApiKey || '');
        setRdWebhookUrl(parsed.rdWebhookUrl || '');
        setRdPipeline(parsed.rdPipeline || '');
        setRdDefaultOwner(parsed.rdDefaultOwner || '');
        setRdIsActive(parsed.rdIsActive !== undefined ? parsed.rdIsActive : true);
      } catch (e) {}
    }
  }, []);

  // Save Config to storage
  const handleSaveConfig = () => {
    const configData = {
      rdToken,
      rdApiKey,
      rdWebhookUrl,
      rdPipeline,
      rdDefaultOwner,
      rdIsActive
    };
    localStorage.setItem(STORAGE_KEY_RD_CONFIG, JSON.stringify(configData));
    addToast('Configurações Salvas', 'Conexão segura com o RD Station atualizada com sucesso.', 'success');
  };

  // Field mapping actions
  const handleAddMapping = () => {
    if (!newMappingForm.radarField || !newMappingForm.rdField) {
      addToast('Erro de Validação', 'Por favor, preencha todos os campos do mapeamento.', 'error');
      return;
    }

    const newMap: FieldMapping = {
      id: `m-${Math.random().toString().substr(2, 5)}`,
      radarField: newMappingForm.radarField || '',
      radarType: newMappingForm.radarType || 'Texto',
      rdField: newMappingForm.rdField || '',
      rdType: newMappingForm.rdType || 'Texto',
      custom: newMappingForm.custom || false,
      status: 'Ativo'
    };

    const updated = [...fieldMappings, newMap];
    setFieldMappings(updated);
    localStorage.setItem(STORAGE_KEY_FIELD_MAPPING, JSON.stringify(updated));
    setIsNewMappingOpen(false);
    setNewMappingForm({ radarField: '', radarType: 'Texto', rdField: '', rdType: 'Texto', custom: true, status: 'Ativo' });
    addToast('Mapeamento Adicionado', `Campo "${newMap.radarField}" associado com sucesso.`, 'success');
  };

  const handleDeleteMapping = (id: string) => {
    const updated = fieldMappings.filter(m => m.id !== id);
    setFieldMappings(updated);
    localStorage.setItem(STORAGE_KEY_FIELD_MAPPING, JSON.stringify(updated));
    addToast('Mapeamento Removido', 'O campo foi desassociado da sincronização futura.', 'info');
  };

  const handleToggleMappingStatus = (id: string) => {
    const updated = fieldMappings.map(m => {
      if (m.id === id) {
        const newStatus = m.status === 'Ativo' ? 'Inativo' : 'Ativo';
        return { ...m, status: newStatus as 'Ativo' | 'Inativo' };
      }
      return m;
    });
    setFieldMappings(updated);
    localStorage.setItem(STORAGE_KEY_FIELD_MAPPING, JSON.stringify(updated));
    addToast('Mapeamento Atualizado', 'Status de sincronização do campo alterado.', 'success');
  };

  // Sincronizar Fila manual (Simulação)
  const handleForceSyncQueue = () => {
    addToast('Sincronizando Fila...', 'Iniciando varredura e envio de leads pendentes ao CRM.', 'info');
    
    setTimeout(() => {
      const updatedQueue = syncQueue.map(item => {
        if (item.status === 'Aguardando' || item.status === 'Erro') {
          return {
            ...item,
            status: 'Sucesso' as const,
            data: '2026-07-07 12:28',
            resultado: 'Sincronizado via envio forçado (Sucesso)',
            retryCount: item.status === 'Erro' ? item.retryCount + 1 : item.retryCount
          };
        }
        return item;
      });
      setSyncQueue(updatedQueue);
      localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(updatedQueue));
      addToast('Fila Sincronizada', 'Todos os leads em fila foram enviados com sucesso ao RD Station.', 'success');
    }, 1500);
  };

  const handleRetryItem = (id: string) => {
    addToast('Tentando Reenvio...', 'Processando payload e validando integridade do token.', 'info');
    setTimeout(() => {
      const updated = syncQueue.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Sucesso' as const,
            data: '2026-07-07 12:28',
            resultado: 'Reenvio processado com sucesso. ID rd-lead criado.',
            retryCount: item.retryCount + 1
          };
        }
        return item;
      });
      setSyncQueue(updated);
      localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(updated));
      addToast('Lead Sincronizado', 'Oportunidade reenviada ao CRM com sucesso.', 'success');
    }, 1200);
  };

  // Mock Export actions requested in the spec
  const handleExportPDF = () => {
    addToast('Relatório de Integrações', 'Gerando documento analítico em PDF.', 'info');
    setTimeout(() => {
      addToast('Relatório Pronto', 'O arquivo PDF com os KPIs de sincronização foi baixado.', 'success');
    }, 1500);
  };

  const handleExportExcel = () => {
    addToast('Gerando Planilha...', 'Exportando fila de sincronização em formato XLSX.', 'info');
    setTimeout(() => {
      addToast('Download Concluído', 'Planilha gerada com sucesso.', 'success');
    }, 1500);
  };

  const handleExportCSV = () => {
    addToast('Gerando Arquivo CSV...', 'Compilando histórico de auditoria em CSV.', 'info');
    setTimeout(() => {
      addToast('Download Concluído', 'O arquivo CSV de sincronização foi baixado.', 'success');
    }, 1500);
  };

  const handleSendToCRMGeneral = () => {
    addToast('Disparando Sincronização...', 'Iniciando varredura geral para o funil do RD Station.', 'info');
    setTimeout(() => {
      addToast('Sincronização Agendada', 'Os robôs do C-Trade iniciaram o processamento das oportunidades aprovadas.', 'success');
    }, 1200);
  };

  // Filtering for sync queue
  const filteredQueue = syncQueue.filter(item => {
    const matchesSearch = item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.resultado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary Metrics calculated for dashboard (KPIs)
  const activeIntegrationsCount = rdIsActive ? 1 : 0;
  const totalSyncsCount = syncQueue.filter(q => q.status === 'Sucesso').length + 420; // 420 is simulated historical success
  const pendingCount = syncQueue.filter(q => q.status === 'Aguardando').length;
  const failureCount = syncQueue.filter(q => q.status === 'Erro').length;
  const lastSyncTime = 'Hoje, 12:28';
  const totalClientsSent = syncQueue.filter(q => q.status === 'Sucesso').length + 380; // Simulated historical total

  const tabOptions = [
    { id: 'geral', label: 'Painel Geral', icon: <Layers className="h-4 w-4" /> },
    { id: 'rd', label: 'Configuração RD Station', icon: <Cable className="h-4 w-4" /> },
    { id: 'fila', label: 'Fila & Logs', icon: <History className="h-4 w-4" /> },
    { id: 'mapeamento', label: 'Mapeamento de Campos', icon: <SlidersHorizontal className="h-4 w-4" /> }
  ];

  const getStatusBadge = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'Sucesso':
        return <Badge variant="success">Sincronizado</Badge>;
      case 'Erro':
        return <Badge variant="danger">Falha</Badge>;
      case 'Aguardando':
        return <Badge variant="warning">Aguardando</Badge>;
      case 'Cancelado':
        return <Badge variant="info">Cancelado</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <PageContainer id="central-integracoes-page">
      <Breadcrumb items={[{ label: 'Integrações', active: true }]} />
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id}>
            <Toast
              message={t.msg}
              description={t.desc}
              type={t.type}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>

      <PageHeader
        title="Central de Integrações"
        subtitle="Gerenciamento de conexões externas, fila de sincronização, mapeamento inteligente de campos e monitoramento de logs de CRM."
      />

      {/* Action panel & PDF/Excel Export */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Exportar PDF</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
            <span>Exportar CSV</span>
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSendToCRMGeneral}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Send className="h-4 w-4" />
          <span>Enviar Todas para CRM</span>
        </Button>
      </div>

      {/* 1. Dashboard de KPIs Superiores (Mockados) */}
      <div id="integration-kpis-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conexões Ativas</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-800">{activeIntegrationsCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">/ 5 canais</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sincronia</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-800">{totalSyncsCount}</span>
            <span className="text-[9px] text-slate-400">leads enviados</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fila Pendente</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-2xl font-black ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{pendingCount}</span>
            <span className="text-[9px] text-slate-400">em espera</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Falhas Recentes</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-2xl font-black ${failureCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{failureCount}</span>
            <span className="text-[9px] text-rose-500 font-bold">requer atenção</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xs transition-shadow col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Último Disparo</span>
          <div className="mt-2 text-xs font-bold text-slate-600 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            <span>{lastSyncTime}</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xs transition-shadow col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clientes Enviados</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-emerald-700">{totalClientsSent}</span>
            <span className="text-[9px] text-slate-400">integrados</span>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs - CRM Layout Style */}
      <div className="mb-6 bg-white p-1 rounded-lg border border-slate-100 shadow-2xs inline-flex w-full">
        <Tabs
          options={tabOptions}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
      </div>

      {/* TAB CONTENT 1: PAINEL GERAL (LISTA DE INTEGRAÇÕES & SEGURANÇA) */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List of Integrations (RD, HubSpot, Salesforce, etc) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Cable className="h-4 w-4 text-blue-600" />
              <span>Sistemas de CRM e Destinos Disponíveis</span>
            </h3>

            {/* RD Station CRM Card (Configured / Active state) */}
            <Card className="p-5 bg-white border border-slate-100 hover:border-blue-200 transition-all shadow-2xs relative overflow-hidden">
              {rdIsActive && (
                <div className="absolute top-0 right-0 h-2 w-24 bg-emerald-500 text-[9px] text-white font-black flex items-center justify-center rotate-45 translate-x-7 translate-y-3">
                  ATIVO
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-black text-lg shrink-0">
                    RD
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">RD Station CRM</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Sincronização bidirecional de leads, scores e portfólio recomendado.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('rd')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Configurar</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setRdIsActive(!rdIsActive);
                      addToast(rdIsActive ? 'Integração Desativada' : 'Integração Ativada', `A conexão automática com o RD Station foi ${rdIsActive ? 'desligada' : 'iniciada'}.`, rdIsActive ? 'warning' : 'success');
                    }}
                    className={`flex-1 sm:flex-none ${rdIsActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    {rdIsActive ? 'Pausar' : 'Ativar'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-500">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Status de Serviço</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                    Conectado com Sucesso
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Tokens de Segurança</span>
                  <span className="font-mono text-slate-700 font-bold">Ativo & Válido</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Pipeline Vinculado</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5" title={rdPipeline}>{rdPipeline}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Último Lead Enviado</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">Osteria Bella Italia</span>
                </div>
              </div>
            </Card>

            {/* HubSpot (Em Breve) */}
            <Card className="p-5 bg-slate-50/50 border border-dashed border-slate-200 opacity-80 relative">
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase bg-slate-200/60 px-2 py-0.5 rounded">Em Breve</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                  HS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400">HubSpot CRM</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Exportação rápida e customizável do funil de vendas diretamente para os Hubs de Negócios.</p>
                </div>
              </div>
            </Card>

            {/* Salesforce (Em Breve) */}
            <Card className="p-5 bg-slate-50/50 border border-dashed border-slate-200 opacity-80 relative">
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase bg-slate-200/60 px-2 py-0.5 rounded">Em Breve</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                  SF
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400">Salesforce Enterprise</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Mapeamento de Objetos Customizados (Leads, Accounts, Opportunities) de alta complexidade.</p>
                </div>
              </div>
            </Card>

            {/* Pipedrive (Em Breve) */}
            <Card className="p-5 bg-slate-50/50 border border-dashed border-slate-200 opacity-80 relative">
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase bg-slate-200/60 px-2 py-0.5 rounded">Em Breve</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                  PD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400">Pipedrive CRM</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Sincronização de atividades do pipeline de vendas C-Trade para foco em ações comerciais imediatas.</p>
                </div>
              </div>
            </Card>

            {/* Webhook (Em Breve) */}
            <Card className="p-5 bg-slate-50/50 border border-dashed border-slate-200 opacity-80 relative">
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase bg-slate-200/60 px-2 py-0.5 rounded">Em Breve</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                  API
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400">Webhooks & APIs customizadas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Disparar payloads JSON para qualquer endpoint REST de ERP ou sistemas internos (SAP, Senior, Totvs).</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Panel: Segurança & Preparação do Backend */}
          <div className="flex flex-col gap-6">
            {/* Segurança Card (Requested in specification) */}
            <Card className="p-5 bg-white border border-slate-100 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Shield className="h-5 w-5 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider">Métrica de Segurança & API</h4>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <span className="text-slate-400 font-bold">CONEXÃO SEGURA</span>
                    <span className="text-emerald-600 font-black">HTTPS ativa</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Dados criptografados de ponta a ponta em trânsito com protocolo TLS 1.3.</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Token de Segurança</span>
                    <span className="font-bold text-slate-800">rd_token_***_102ca</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Token Válido</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Sim
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Última Sincronização</span>
                    <span className="font-bold text-slate-800">Hoje, 11:15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-rose-500 font-bold">Último Erro</span>
                    <span className="font-bold text-rose-600">06/07/2026, 17:45</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Preparation for Backend Comments */}
            <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300">
              <div className="flex items-center gap-2 mb-3">
                <Server className="h-5 w-5 text-blue-400 animate-pulse" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Pronto para o Backend</h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Toda a arquitetura e componentes de estado estão estruturados de forma abstrata. No futuro, os seguintes endpoints poderão ser vinculados:
              </p>

              <ul className="space-y-2 text-[10px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                  <span><code>POST /api/integrations/rd-station/sync</code> - Dispara o worker de envio das oportunidades qualificadas.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                  <span><code>GET /api/integrations/queue</code> - Retorna a fila real em tempo real.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                  <span><code>PUT /api/integrations/fields/map</code> - Atualiza o mapeamento de campos customizados no banco.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                  <span><code>POST /api/webhooks/rd-station</code> - Trata webhooks de mudança de estágio do lead de volta ao Radar.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TELA RD STATION (PREPARADA) */}
      {activeTab === 'rd' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuração do RD Station */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="p-6 bg-white border border-slate-100">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base">
                    RD
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Conectar e Configurar Canal RD Station CRM</h3>
                    <p className="text-xs text-slate-500">Mantenha os tokens e chaves atualizados para evitar quebras de transmissão.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden sm:inline">Status do Canal:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${rdIsActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${rdIsActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {rdIsActive ? 'CONECTADO E OPERANDO' : 'INATIVO'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[9px]">Token de API (OAuth / Private App)</label>
                    <Input
                      type="password"
                      value={rdToken}
                      onChange={(e) => setRdToken(e.target.value)}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Seu token privado gerado nas configurações do RD Station.</span>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[9px]">API Key (Chave Pública do Painel)</label>
                    <Input
                      type="password"
                      value={rdApiKey}
                      onChange={(e) => setRdApiKey(e.target.value)}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">A chave de identificação pública para envio de formulários rápidos.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[9px]">Webhook URL do Radar C-Trade (Destino de Resposta)</label>
                  <Input
                    type="text"
                    value={rdWebhookUrl}
                    onChange={(e) => setRdWebhookUrl(e.target.value)}
                    {...({ readOnly: true } as any)}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Adicione essa URL na aba Webhooks do painel do seu RD Station para sincronizar negócios fechados de volta.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[9px]">Pipeline Padrão no CRM</label>
                    <Select
                      value={rdPipeline}
                      onChange={(e) => setRdPipeline(e.target.value)}
                      options={[
                        { label: 'Funil de Vendas - Radar C-Trade', value: 'Funil de Vendas - Radar C-Trade' },
                        { label: 'Prospecção Ativa Insumos', value: 'Prospecção Ativa Insumos' },
                        { label: 'Atendimento Canal Food Service', value: 'Atendimento Canal Food Service' },
                        { label: 'Contas Corporativas / Key Account', value: 'Contas Corporativas / Key Account' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[9px]">Usuário Comercial Responsável Padrão</label>
                    <Select
                      value={rdDefaultOwner}
                      onChange={(e) => setRdDefaultOwner(e.target.value)}
                      options={[
                        { label: 'Carlos Silva (Gestor)', value: 'Carlos Silva' },
                        { label: 'Ana Souza (São Paulo)', value: 'Ana Souza' },
                        { label: 'Felipe Mendes (Rio de Janeiro)', value: 'Felipe Mendes' },
                        { label: 'Mariana Rocha (Nordeste)', value: 'Mariana Rocha' }
                      ]}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRdIsActive(!rdIsActive);
                        addToast(rdIsActive ? 'Integração Desativada' : 'Integração Ativada', `A sincronização automática foi ${rdIsActive ? 'desativada' : 'ativada'}.`, 'info');
                      }}
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                      type="button"
                    >
                      {rdIsActive ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                          <span>Conexão Habilitada</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <ToggleLeft className="h-6 w-6 text-slate-400" />
                          <span>Conexão Pausada</span>
                        </span>
                      )}
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveConfig}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    <span>Salvar Configuração</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mapeamento Resumido do Canal */}
            <Card className="p-6 bg-white border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Campos Mapeados Atualmente</h4>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('mapeamento')}>
                  Editar Mapeamentos completos
                </Button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {fieldMappings.filter(m => m.status === 'Ativo').slice(0, 5).map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">{m.radarField}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-blue-700">{m.rdField}</span>
                  </div>
                ))}
                {fieldMappings.length > 5 && (
                  <p className="text-[10px] text-center text-slate-400 mt-2">E mais {fieldMappings.length - 5} campos configurados.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Histórico Recente de Disparos */}
          <div className="flex flex-col gap-6">
            <Card className="p-5 bg-white border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4 text-orange-600" />
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Histórico de Disparos</h4>
              </div>

              <div className="space-y-3">
                {historyLogs.map(log => (
                  <div key={log.id} className="border-l-2 border-orange-500 pl-3 py-1 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700">{log.usuario}</span>
                      <span className="text-[10px] text-slate-400">{log.data}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">{log.quantidade} lead(s) enviados</span>
                      <span className={`font-bold ${log.resultado === 'Sucesso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.resultado} ({log.tempoExecucao})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-100 text-xs text-slate-500 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Problemas & Erros Recorrentes</span>
              </div>
              <p className="text-[11px]">Sistemas externos podem apresentar erros temporários. Nossos robôs de sincronização executam até 3 tentativas automáticas de envio (retry automático).</p>
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-rose-800 space-y-1">
                <span className="font-bold block text-[10px]">ÚLTIMO ERRO DETECTADO (06/07 17:45):</span>
                <span className="text-[10px] font-mono">Error Code 401: Unauthorized access to client database. API Token is either expired or needs scope approval for leads_write.</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FILA & LOGS DE SINCRONIZAÇÃO */}
      {activeTab === 'fila' && (
        <div className="flex flex-col gap-6">
          {/* Fila de Transmissão DataTable */}
          <Card className="p-6 bg-white border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">Fila Comercial de Sincronização e Auditoria</h3>
                <p className="text-xs text-slate-500">Monitore as tentativas e resultados de envio das análises para o funil comercial do RD Station.</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar cliente ou vendedor..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:border-blue-500 w-full sm:w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">Todos Status</option>
                  <option value="Sucesso">Sincronizado</option>
                  <option value="Erro">Falha</option>
                  <option value="Aguardando">Aguardando</option>
                  <option value="Cancelado">Cancelado</option>
                </select>

                <Button variant="secondary" size="sm" onClick={handleForceSyncQueue} leftIcon={<RefreshCw className="h-3 w-3" />}>
                  Processar Fila
                </Button>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Cliente / Alvo</th>
                    <th className="py-3 px-4 text-center">Canal</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Payload</th>
                    <th className="py-3 px-4 text-center">Data Evento</th>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Resultado / Descrição do Log</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center">
                        <EmptyState
                          title="Nenhum registro encontrado"
                          description="Não há nenhuma sincronização recente correspondente aos filtros ativos."
                          icon={<History className="h-10 w-10 text-slate-300" />}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-800">{item.cliente}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold text-[10px]">
                            {item.destino}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">{getStatusBadge(item.status)}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">{item.payloadSize}</td>
                        <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">{item.data}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.responsavel}</td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={item.resultado}>
                          {item.resultado}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedQueueItem(item);
                                setIsLogDrawerOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {item.status === 'Erro' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleRetryItem(item.id)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-400">
              <span>Exibindo {filteredQueue.length} de {syncQueue.length} registros da fila</span>
              <span>Central de Integrações V1.0 • Pronto para API Backend</span>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 4: MAPEAMENTO DE CAMPOS */}
      {activeTab === 'mapeamento' && (
        <div className="flex flex-col gap-6">
          <Card className="p-6 bg-white border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">Mapeamento Inteligente de Atributos Comerciais</h3>
                <p className="text-xs text-slate-500">Defina quais variáveis extraídas de cardápios pelo Radar alimentam os campos correspondentes no CRM.</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewMappingOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                <span>Criar Novo Mapeamento</span>
              </Button>
            </div>

            {/* Mapeador Interativo UI */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Campo Origem (Radar C-Trade)</th>
                    <th className="py-3 px-4">Tipo Radar</th>
                    <th className="py-3 px-4 text-center">Direção</th>
                    <th className="py-3 px-4">Campo Destino (RD Station CRM)</th>
                    <th className="py-3 px-4">Tipo CRM</th>
                    <th className="py-3 px-4 text-center">Personalizado</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fieldMappings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{m.radarField}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {m.radarType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <ArrowRight className="h-4 w-4 text-blue-500 mx-auto" />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-900 font-mono">{m.rdField}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">
                          {m.rdType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {m.custom ? (
                          <Tag label="Custom" colorClass="bg-amber-50 text-amber-700 border-amber-200" />
                        ) : (
                          <Tag label="Nativo" colorClass="bg-slate-50 text-slate-700 border-slate-200" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleMappingStatus(m.id)}
                          className="focus:outline-hidden"
                          type="button"
                        >
                          <Badge variant={m.status === 'Ativo' ? 'success' : 'secondary'}>
                            {m.status}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteMapping(m.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="flex items-start gap-2 text-slate-600">
                <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p><strong>Dica de Sincronia:</strong> Atributos customizados terminados em <code>_c</code> devem existir e estar homologados previamente nas configurações de campos personalizados do seu painel do RD Station.</p>
              </div>

              <Button variant="secondary" size="sm" onClick={() => {
                setFieldMappings(INITIAL_FIELD_MAPPING);
                localStorage.setItem(STORAGE_KEY_FIELD_MAPPING, JSON.stringify(INITIAL_FIELD_MAPPING));
                addToast('Mapeamento Restaurado', 'Mapeamentos padrão de fábrica aplicados.', 'info');
              }}>
                Restaurar Padrão
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: NOVO MAPEAMENTO DE CAMPO */}
      <Modal
        isOpen={isNewMappingOpen}
        onClose={() => setIsNewMappingOpen(false)}
        title="Criar Novo Mapeamento de Atributo"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Mapeie um campo extraído do motor de Inteligência Comercial para ser sincronizado automaticamente para o RD Station CRM.</p>
          
          <div>
            <label className="block text-slate-700 font-bold mb-1 uppercase text-[9px]">Nome do Atributo no Radar C-Trade</label>
            <Input
              type="text"
              placeholder="Ex: Potencial de Fornecimento"
              value={newMappingForm.radarField}
              onChange={(e) => setNewMappingForm(prev => ({ ...prev, radarField: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[9px]">Tipo do Campo Radar</label>
              <Select
                value={newMappingForm.radarType}
                onChange={(e) => setNewMappingForm(prev => ({ ...prev, radarType: e.target.value }))}
                options={[
                  { label: 'Texto', value: 'Texto' },
                  { label: 'Número', value: 'Número' },
                  { label: 'Moeda', value: 'Moeda' },
                  { label: 'Lista de Itens', value: 'Lista' }
                ]}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[9px]">Tipo no CRM</label>
              <Select
                value={newMappingForm.rdType}
                onChange={(e) => setNewMappingForm(prev => ({ ...prev, rdType: e.target.value }))}
                options={[
                  { label: 'Texto / Campo de Linha', value: 'Texto' },
                  { label: 'Número Inteiro', value: 'Número' },
                  { label: 'Moeda / Valores', value: 'Moeda' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 uppercase text-[9px]">ID/Chave do Atributo no RD Station CRM</label>
            <Input
              type="text"
              placeholder="Ex: potencial_fornecimento_c"
              value={newMappingForm.rdField}
              onChange={(e) => setNewMappingForm(prev => ({ ...prev, rdField: e.target.value }))}
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Chave exata cadastrada no painel do desenvolvedor no RD.</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is-custom-field-check"
              checked={newMappingForm.custom}
              onChange={(e) => setNewMappingForm(prev => ({ ...prev, custom: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is-custom-field-check" className="font-semibold text-slate-700 cursor-pointer">
              Este é um campo personalizado criado no CRM RD Station
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsNewMappingOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddMapping}>
              Salvar Mapeamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* LATERAL DRAWER: DETALHES DE LOG DE SINCRONIZAÇÃO */}
      <LateralDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        title="Detalhes do Payload & Log de Transmissão"
      >
        {selectedQueueItem && (
          <div className="space-y-5 text-xs text-slate-600">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente</span>
                <span className="font-bold text-slate-800">{selectedQueueItem.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destino CRM</span>
                <span className="font-bold text-slate-800">{selectedQueueItem.destino}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status Sincronização</span>
                <span>{getStatusBadge(selectedQueueItem.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Evento</span>
                <span className="font-bold text-slate-700">{selectedQueueItem.data}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vendedor Atribuído</span>
                <span className="font-bold text-slate-800">{selectedQueueItem.responsavel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peso do Payload</span>
                <span className="font-mono text-slate-600">{selectedQueueItem.payloadSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contador de Retentativas</span>
                <span className="font-bold text-slate-800">{selectedQueueItem.retryCount} tentativa(s)</span>
              </div>
            </div>

            <div>
              <span className="block text-slate-700 font-bold mb-1.5 uppercase text-[9px]">Mensagem de Resposta da API</span>
              <div className={`p-3 rounded border font-mono text-[10px] whitespace-pre-wrap leading-relaxed ${selectedQueueItem.status === 'Erro' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-slate-900 text-slate-200 border-slate-950'}`}>
                {selectedQueueItem.resultado}
              </div>
            </div>

            <div>
              <span className="block text-slate-700 font-bold mb-1.5 uppercase text-[9px]">Simulação do Payload JSON (Pronto para API)</span>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed">
{JSON.stringify({
  event_type: "opportunity_qualified",
  timestamp: selectedQueueItem.data,
  source: "Radar C-Trade Commercial Engine V2",
  lead: {
    company_name: selectedQueueItem.cliente,
    assigned_seller: selectedQueueItem.responsavel,
    mapping_version: "1.0",
    fields: {
      score_comercial: 94,
      score_fit: 95,
      faturamento_estimado: "Mais de R$ 250k",
      produtos_recomendados: [
        "Farinha Caputo Italiana Sacco Rosso",
        "Tomate Pelado San Marzano DOP",
        "Queijo Grana Padano DOP"
      ],
      concorrentes_detectados: ["Farinha Dolar", "Laticínios Sabor do Campo"],
      potencial_estimado: 12500
    }
  },
  crm_integration: {
    target: "RD Station CRM",
    pipeline_name: "Funil de Vendas - Radar C-Trade",
    export_status: selectedQueueItem.status === 'Sucesso' ? 'exported' : 'pending'
  }
}, null, 2)}
              </pre>
              <span className="text-[10px] text-slate-400 mt-1 block">Este é o payload exato que será transmitido via chamada REST HTTP no ambiente de produção.</span>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsLogDrawerOpen(false)}>
                Fechar Detalhes
              </Button>
              {selectedQueueItem.status === 'Erro' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleRetryItem(selectedQueueItem.id);
                    setIsLogDrawerOpen(false);
                  }}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Tentar Reenvio Comercial
                </Button>
              )}
            </div>
          </div>
        )}
      </LateralDrawer>
    </PageContainer>
  );
}
