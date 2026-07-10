/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSecurity } from '../hooks/useSecurity';
import { SecurityService, AuditLog } from '../services/securityService';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  Clock,
  Database,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Settings,
  RefreshCw,
  Library,
  MapPin,
  Building2,
  Tag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Archive,
  FolderOpen,
  Plus,
  ArrowRight,
  Lock,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

// Section Tab definitions based on Concept specification
type SectionId = 'alteracoes' | 'curadoria' | 'usuarios' | 'configuracoes' | 'exportacoes';

interface TabItem {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const SECTIONS: TabItem[] = [
  {
    id: 'alteracoes',
    label: 'Histórico de Alterações',
    description: 'Modificações de Clientes, Oportunidades e Catálogo',
    icon: RefreshCw,
  },
  {
    id: 'curadoria',
    label: 'Histórico de Curadoria',
    description: 'Entrada de cardápios, normalização e curadoria',
    icon: Library,
  },
  {
    id: 'usuarios',
    label: 'Histórico de Usuários',
    description: 'Logins, logouts, criação de usuários e RBAC',
    icon: Users,
  },
  {
    id: 'configuracoes',
    label: 'Histórico de Configurações',
    description: 'Modificações de parâmetros críticos de sistema',
    icon: Settings,
  },
  {
    id: 'exportacoes',
    label: 'Histórico de Exportações',
    description: 'Relatório de downloads e exportações em lote',
    icon: Download,
  },
];

export default function Auditoria() {
  const { logs, realUser, activeRole, hasPermission, addLog } = useSecurity();

  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<SectionId>('alteracoes');
  const [viewMode, setViewMode] = useState<'tabela' | 'linha_tempo'>('tabela');

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Filters State
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<string>('todos');
  const [filterUser, setFilterUser] = useState<string>('todos');
  const [filterProfile, setFilterProfile] = useState<string>('todos');
  const [filterModule, setFilterModule] = useState<string>('todos');
  const [filterActionType, setFilterActionType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterClient, setFilterClient] = useState<string>('todos');
  const [filterCity, setFilterCity] = useState<string>('todos');
  const [filterState, setFilterState] = useState<string>('todos');

  // Archiving / Retention State
  const [archivedLogIds, setArchivedLogIds] = useState<string[]>([]);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Export feedback alerts
  const [exportNotification, setExportNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Clear notifications after time
  useEffect(() => {
    if (exportNotification) {
      const timer = setTimeout(() => {
        setExportNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [exportNotification]);

  // Reset pagination when tab/search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterPeriod, filterUser, filterProfile, filterModule, filterActionType, filterStatus, filterClient, filterCity, filterState, showArchivedOnly]);

  // Get distinct values for filter lists from full log base
  const filterOptions = useMemo(() => {
    const usersSet = new Set<string>();
    const profilesSet = new Set<string>();
    const modulesSet = new Set<string>();
    const actionTypesSet = new Set<string>();
    const clientsSet = new Set<string>();
    const citiesSet = new Set<string>();
    const statesSet = new Set<string>();

    logs.forEach(log => {
      if (log.user) usersSet.add(log.user);
      if (log.profile) profilesSet.add(log.profile);
      if (log.module) modulesSet.add(log.module);
      if (log.actionType) actionTypesSet.add(log.actionType);
      if (log.clientName) clientsSet.add(log.clientName);
      if (log.city) citiesSet.add(log.city);
      if (log.state) statesSet.add(log.state);
    });

    return {
      users: Array.from(usersSet).sort(),
      profiles: Array.from(profilesSet).sort(),
      modules: Array.from(modulesSet).sort(),
      actionTypes: Array.from(actionTypesSet).sort(),
      clients: Array.from(clientsSet).sort(),
      cities: Array.from(citiesSet).sort(),
      states: Array.from(statesSet).sort(),
    };
  }, [logs]);

  // Filter logic based on the Section Tab requirement
  const sectionLogs = useMemo(() => {
    return logs.filter(log => {
      const isArchived = archivedLogIds.includes(log.id);
      
      // Filter by archive state
      if (showArchivedOnly) {
        if (!isArchived) return false;
      } else {
        if (isArchived) return false;
      }

      switch (activeTab) {
        case 'alteracoes':
          // Modificações gerais (Criações, Edições, Homologações, Rejeições, Remoções across base modules except user login/logout/config)
          return (
            log.module === 'Base de Clientes' ||
            log.module === 'Catálogo de Produtos' ||
            log.module === 'Central de Oportunidades' ||
            log.module === 'Radar Comercial'
          ) && log.actionType !== 'Exportação';

        case 'curadoria':
          // Central de Cardápios operations
          return log.module === 'Central de Cardápios' || log.actionType === 'Curadoria';

        case 'usuarios':
          // Logins, Logouts, User administration, Simulated roles
          return log.module === 'Usuários';

        case 'configuracoes':
          // Central de Configurações parameters alterations
          return log.module === 'Configurações';

        case 'exportacoes':
          // PDF, Excel, CSV downloads
          return log.actionType === 'Exportação' || log.module === 'Relatórios';

        default:
          return true;
      }
    });
  }, [logs, activeTab, archivedLogIds, showArchivedOnly]);

  // Apply advanced filters & text search to the section-filtered list
  const filteredLogs = useMemo(() => {
    return sectionLogs.filter(log => {
      // 1. Text Search
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchUser = log.user?.toLowerCase().includes(term);
        const matchClient = log.clientName?.toLowerCase().includes(term);
        const matchCnpj = log.cnpj?.replace(/\D/g, '').includes(term.replace(/\D/g, '')) || log.cnpj?.toLowerCase().includes(term);
        const matchProduct = log.productName?.toLowerCase().includes(term);
        const matchId = log.id?.toLowerCase().includes(term);
        const matchDesc = log.description?.toLowerCase().includes(term);
        const matchAction = log.action?.toLowerCase().includes(term);

        if (!matchUser && !matchClient && !matchCnpj && !matchProduct && !matchId && !matchDesc && !matchAction) {
          return false;
        }
      }

      // 2. Period Filter
      if (filterPeriod !== 'todos') {
        const logDate = new Date(log.date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterPeriod === 'hoje') {
          // Check if date represents today
          const today = new Date();
          if (logDate.getDate() !== today.getDate() || logDate.getMonth() !== today.getMonth() || logDate.getFullYear() !== today.getFullYear()) {
            return false;
          }
        } else if (filterPeriod === '7_dias' && diffDays > 7) {
          return false;
        } else if (filterPeriod === '30_dias' && diffDays > 30) {
          return false;
        }
      }

      // 3. User Filter
      if (filterUser !== 'todos' && log.user !== filterUser) {
        return false;
      }

      // 4. Profile Filter
      if (filterProfile !== 'todos' && log.profile !== filterProfile) {
        return false;
      }

      // 5. Module Filter
      if (filterModule !== 'todos' && log.module !== filterModule) {
        return false;
      }

      // 6. Action Type Filter
      if (filterActionType !== 'todos' && log.actionType !== filterActionType) {
        return false;
      }

      // 7. Status Filter
      if (filterStatus !== 'todos' && log.result !== filterStatus) {
        return false;
      }

      // 8. Client Filter
      if (filterClient !== 'todos' && log.clientName !== filterClient) {
        return false;
      }

      // 9. City Filter
      if (filterCity !== 'todos' && log.city !== filterCity) {
        return false;
      }

      // 10. State Filter
      if (filterState !== 'todos' && log.state !== filterState) {
        return false;
      }

      return true;
    });
  }, [sectionLogs, searchTerm, filterPeriod, filterUser, filterProfile, filterModule, filterActionType, filterStatus, filterClient, filterCity, filterState]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

  // Count summary metrics for top dashboard cards
  const summaryMetrics = useMemo(() => {
    const allLogs = logs.filter(l => !archivedLogIds.includes(l.id));
    const total = allLogs.length;

    const alterationsCount = allLogs.filter(l =>
      (l.module === 'Base de Clientes' || l.module === 'Catálogo de Produtos' || l.module === 'Central de Oportunidades') &&
      l.actionType !== 'Exportação'
    ).length;

    const curadoriaCount = allLogs.filter(l => l.module === 'Central de Cardápios' || l.actionType === 'Curadoria').length;
    const exportsCount = allLogs.filter(l => l.actionType === 'Exportação').length;

    return {
      total,
      alterations: alterationsCount,
      curadoria: curadoriaCount,
      exports: exportsCount,
    };
  }, [logs, archivedLogIds]);

  // RBAC Permission Check for Export actions
  const canExportLogs = hasPermission('Auditoria', 'Exportar Logs');

  // Trigger manual logging of actions done on Auditoria page
  const handleExport = (type: 'PDF' | 'Excel' | 'CSV') => {
    if (!canExportLogs) {
      setExportNotification({
        show: true,
        type: 'error',
        message: `Acesso negado: Seu perfil (${activeRole}) não possui permissão para exportar logs de auditoria.`
      });
      // Log blocked export attempt
      SecurityService.logAction({
        module: 'Auditoria',
        action: `Exportação bloqueada (${type})`,
        result: 'Bloqueado',
        description: `Tentativa frustrada de exportação de logs de auditoria em formato ${type} por perfil não autorizado.`,
        actionType: 'Exportação',
        recordCount: filteredLogs.length
      });
      return;
    }

    // Process high-fidelity simulation of download
    const formatName = type === 'Excel' ? 'XLSX' : type;
    setExportNotification({
      show: true,
      type: 'success',
      message: `Exportação concluída! O arquivo Auditoria_${activeTab}_${Date.now()}.${formatName.toLowerCase()} foi gerado contendo ${filteredLogs.length} registros.`
    });

    // Log successful export action automatically
    SecurityService.logAction({
      module: 'Auditoria',
      action: `Exportar Logs (${type})`,
      result: 'Sucesso',
      description: `Exportação de logs de auditoria da seção "${SECTIONS.find(s => s.id === activeTab)?.label}" contendo ${filteredLogs.length} registros gerada em formato ${type}.`,
      actionType: 'Exportação',
      recordCount: filteredLogs.length,
      affectedRecord: `Logs Seção: ${activeTab}`
    });
  };

  // Archiving/Retention method: Never delete logs, but can archive
  const handleArchiveLog = (id: string, logTitle: string) => {
    if (archivedLogIds.includes(id)) {
      setArchivedLogIds(prev => prev.filter(item => item !== id));
      setExportNotification({
        show: true,
        type: 'success',
        message: `O registro de auditoria foi desarquivado.`
      });
      SecurityService.logAction({
        module: 'Auditoria',
        action: 'Desarquivar Log',
        result: 'Sucesso',
        description: `Registro "${logTitle}" movido de volta para o painel de auditoria ativa.`,
        actionType: 'Alteração',
        affectedRecord: id
      });
    } else {
      setArchivedLogIds(prev => [...prev, id]);
      setExportNotification({
        show: true,
        type: 'success',
        message: `Registro de auditoria arquivado com sucesso.`
      });
      SecurityService.logAction({
        module: 'Auditoria',
        action: 'Arquivar Log',
        result: 'Sucesso',
        description: `Registro "${logTitle}" arquivado pelo administrador para otimização de visualização.`,
        actionType: 'Alteração',
        affectedRecord: id
      });
    }
  };

  const handleArchiveAllFiltered = () => {
    const idsToArchive = filteredLogs.map(l => l.id);
    if (idsToArchive.length === 0) return;

    if (showArchivedOnly) {
      setArchivedLogIds(prev => prev.filter(id => !idsToArchive.includes(id)));
      setExportNotification({
        show: true,
        type: 'success',
        message: `${idsToArchive.length} registros desarquivados em lote.`
      });
    } else {
      setArchivedLogIds(prev => [...prev, ...idsToArchive]);
      setExportNotification({
        show: true,
        type: 'success',
        message: `${idsToArchive.length} registros movidos para o arquivo definitivo.`
      });
    }

    SecurityService.logAction({
      module: 'Auditoria',
      action: showArchivedOnly ? 'Desarquivar em Lote' : 'Arquivar em Lote',
      result: 'Sucesso',
      description: `Processamento em lote para ${showArchivedOnly ? 'desarquivamento' : 'arquivamento'} de ${idsToArchive.length} registros da seção ${activeTab}.`,
      actionType: 'Alteração',
      affectedRecord: `Lote Seção: ${activeTab}`
    });
  };

  // Helper to match appropriate Lucide icon with module/action
  const getLogIcon = (log: AuditLog) => {
    if (log.result === 'Bloqueado') {
      return { icon: Lock, bg: 'bg-rose-50 border-rose-100 text-rose-600' };
    }

    switch (log.actionType) {
      case 'Criação':
        return { icon: Plus, bg: 'bg-emerald-50 border-emerald-100 text-emerald-600' };
      case 'Homologação':
        return { icon: CheckCircle2, bg: 'bg-blue-50 border-blue-100 text-blue-600' };
      case 'Rejeição':
        return { icon: XCircle, bg: 'bg-amber-50 border-amber-100 text-amber-600' };
      case 'Exclusão':
        return { icon: Trash2, bg: 'bg-slate-100 border-slate-200 text-slate-600' };
      case 'Curadoria':
        return { icon: Library, bg: 'bg-violet-50 border-violet-100 text-violet-600' };
      case 'Importação':
        return { icon: Download, bg: 'bg-indigo-50 border-indigo-100 text-indigo-600' };
      case 'Exportação':
        return { icon: Download, bg: 'bg-cyan-50 border-cyan-100 text-cyan-600' };
      case 'Acesso':
        return { icon: User, bg: 'bg-slate-100 border-slate-200 text-slate-700' };
      default:
        // By module fallback
        if (log.module === 'Configurações') return { icon: Settings, bg: 'bg-amber-50 border-amber-100 text-amber-600' };
        if (log.module === 'Usuários') return { icon: Users, bg: 'bg-teal-50 border-teal-100 text-teal-600' };
        return { icon: RefreshCw, bg: 'bg-slate-50 border-slate-100 text-slate-600' };
    }
  };

  // Helper for human-readable format of timestamps
  const formatLogDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    } catch {
      return 'Data Inválida';
    }
  };

  const formatLogTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    } catch {
      return '00:00';
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterPeriod('todos');
    setFilterUser('todos');
    setFilterProfile('todos');
    setFilterModule('todos');
    setFilterActionType('todos');
    setFilterStatus('todos');
    setFilterClient('todos');
    setFilterCity('todos');
    setFilterState('todos');
    setSearchTerm('');
  };

  return (
    <div id="audit-center-main-container" className="space-y-6 animate-fade-in">
      
      {/* Header and Brand context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Módulo de Compliance
          </span>
          <h1 className="text-2xl font-sans font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-blue-900" />
            Central de Auditoria
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Rastreabilidade e histórico operacional para governança e segurança de dados do Radar C-Trade.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Button
            variant={showArchivedOnly ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Archive className="h-4 w-4" />}
            onClick={() => setShowArchivedOnly(!showArchivedOnly)}
            className="text-xs font-black uppercase tracking-wider"
          >
            {showArchivedOnly ? 'Ver Auditoria Ativa' : 'Ver Itens Arquivados'}
          </Button>

          <div className="h-8 w-[1px] bg-slate-200" />

          {/* Quick info of simulated profile */}
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Operando como</span>
            <span className="text-xs font-black text-slate-700">{realUser.name} ({activeRole})</span>
          </div>
        </div>
      </div>

      {/* Alert Notifications for feedback */}
      {exportNotification && (
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border animate-slide-in shadow-xs ${
            exportNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200/60 text-emerald-900'
              : 'bg-rose-50 border-rose-200/60 text-rose-900'
          }`}
        >
          {exportNotification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">
              {exportNotification.type === 'success' ? 'Operação Concluída' : 'Ação Impedida'}
            </h4>
            <p className="text-xs font-medium mt-0.5 opacity-90 leading-relaxed">
              {exportNotification.message}
            </p>
          </div>
        </div>
      )}

      {/* Top metrics dashboard indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-4 hover:border-blue-100 transition-all">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Volume Total</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
              {summaryMetrics.total} <span className="text-xs font-bold text-slate-400">registros</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Auditoria unificada e preservada</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-4 hover:border-amber-100 transition-all">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-600">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Alterações de Dados</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
              {summaryMetrics.alterations} <span className="text-xs font-bold text-slate-400">eventos</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Clientes, catálogo e produtos</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-4 hover:border-violet-100 transition-all">
          <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg text-violet-600">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Curadorias Concluídas</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
              {summaryMetrics.curadoria} <span className="text-xs font-bold text-slate-400">validações</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Cardápios normalizados</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-4 hover:border-cyan-100 transition-all">
          <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-lg text-cyan-600">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Exportações Totais</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
              {summaryMetrics.exports} <span className="text-xs font-bold text-slate-400">gerações</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">PDF, Excel e CSV arquivados</p>
          </div>
        </div>

      </div>

      {/* Main Concept Sections Tabs */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 border-b border-slate-200 p-1 flex flex-wrap gap-1">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/55'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50/20 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              {SECTIONS.find(s => s.id === activeTab)?.label}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {SECTIONS.find(s => s.id === activeTab)?.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View switcher: Table vs Timeline */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('tabela')}
                className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  viewMode === 'tabela'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('linha_tempo')}
                className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  viewMode === 'linha_tempo'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Linha do Tempo
              </button>
            </div>

            {/* In lote archive trigger */}
            {filteredLogs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Archive className="h-3.5 w-3.5" />}
                onClick={handleArchiveAllFiltered}
                className="text-xs font-black uppercase tracking-wider text-slate-600"
              >
                {showArchivedOnly ? 'Desarquivar Filtro' : 'Arquivar Filtro'}
              </Button>
            )}
          </div>
        </div>

        {/* Controls: Search, Expandable Advanced Filters and Exports */}
        <div className="p-4 border-b border-slate-150 space-y-4 bg-white">
          <div className="flex flex-col lg:flex-row gap-3">
            
            {/* General Text Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por Nome, Cliente, CNPJ, Produto, Usuário, ID, Descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>

            {/* Trigger Filters drawer & Exports */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={isFilterExpanded ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="text-xs font-black uppercase tracking-wider"
              >
                {isFilterExpanded ? 'Fechar Filtros' : 'Filtros Avançados'}
              </Button>

              {/* Exports Dropdown / Set of actions */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/60 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-400 px-2">Exportar:</span>
                
                <button
                  onClick={() => handleExport('PDF')}
                  className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-blue-900 transition-colors cursor-pointer relative group"
                  title="Exportar PDF"
                >
                  <FileText className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleExport('Excel')}
                  className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer relative group"
                  title="Exportar Excel"
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleExport('CSV')}
                  className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-cyan-700 transition-colors cursor-pointer relative group"
                  title="Exportar CSV"
                >
                  <Layers className="h-4 w-4" />
                </button>
              </div>

              {/* RBAC Visual lock warning */}
              {!canExportLogs && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-100 rounded text-[10px] font-bold text-amber-700">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Exportação Restrita</span>
                </div>
              )}
            </div>

          </div>

          {/* Advanced filters form drawer */}
          {isFilterExpanded && (
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 shadow-inner grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in">
              
              {/* Period Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Período
                </label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todo o histórico</option>
                  <option value="hoje">Hoje</option>
                  <option value="7_dias">Últimos 7 dias</option>
                  <option value="30_dias">Últimos 30 dias</option>
                </select>
              </div>

              {/* User Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" /> Usuário
                </label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os usuários</option>
                  {filterOptions.users.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Profile Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Perfil de Acesso
                </label>
                <select
                  value={filterProfile}
                  onChange={(e) => setFilterProfile(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os perfis</option>
                  {filterOptions.profiles.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Action Type Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Tipo de Ação
                </label>
                <select
                  value={filterActionType}
                  onChange={(e) => setFilterActionType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os tipos</option>
                  {filterOptions.actionTypes.map(act => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Status / Resultado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os resultados</option>
                  <option value="Sucesso">Sucesso</option>
                  <option value="Bloqueado">Bloqueado (Negado)</option>
                </select>
              </div>

              {/* Client Name Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Estabelecimento
                </label>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os clientes</option>
                  {filterOptions.clients.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Cidade
                </label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todas as cidades</option>
                  {filterOptions.cities.map(cty => (
                    <option key={cty} value={cty}>{cty}</option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Estado (UF)
                </label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os estados</option>
                  {filterOptions.states.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Module Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Módulo Operacional
                </label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="todos">Todos os módulos</option>
                  {filterOptions.modules.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Clean all filters */}
              <div className="flex items-end justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full text-xs font-black uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                >
                  Limpar Filtros
                </Button>
              </div>

            </div>
          )}
        </div>

        {/* Dynamic logs render mode block */}
        <div className="min-h-[250px] bg-white">
          
          {filteredLogs.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="Nenhum evento registrado."
                description="Nenhum registro de auditoria foi localizado com os critérios de filtragem ou pesquisa informados."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Limpar Filtros
                  </Button>
                }
              />
            </div>
          ) : viewMode === 'tabela' ? (
            
            /* Tabela (Table mode representation) */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider w-24">Data / Hora</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Usuário / Perfil</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider w-28">Módulo / Ação</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Descrição / Afetado</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider w-20 text-center">Status</th>
                    {activeTab === 'exportacoes' && (
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider w-24 text-center">Registros</th>
                    )}
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider w-16 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => {
                    const iconConfig = getLogIcon(log);
                    const LogIconComp = iconConfig.icon;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                        
                        {/* Data e Hora */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-black text-slate-700">{formatLogDate(log.date)}</div>
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-0.5">
                            <Clock className="h-3 w-3" /> {formatLogTime(log.date)}
                          </div>
                        </td>

                        {/* Usuário / Perfil */}
                        <td className="px-4 py-3">
                          <div className="text-xs font-black text-slate-800">{log.user}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{log.profile}</div>
                        </td>

                        {/* Módulo / Ação */}
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 uppercase">
                            {log.module}
                          </span>
                          <div className="text-xs font-bold text-slate-700 mt-1.5">{log.action}</div>
                        </td>

                        {/* Descrição / Afetado */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-md">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400">ID: {log.id}</span>
                            <span className="text-[10px] text-slate-300">|</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                              <Database className="h-3 w-3" /> Afeta: {log.affectedRecord || 'N/A'}
                            </span>
                            {log.clientName && (
                              <>
                                <span className="text-[10px] text-slate-300">|</span>
                                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50 flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> {log.clientName}
                                  {log.city && ` (${log.city}/${log.state || ''})`}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              log.result === 'Sucesso'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${log.result === 'Sucesso' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {log.result}
                          </span>
                        </td>

                        {/* Record count (exportacoes specific tab column) */}
                        {activeTab === 'exportacoes' && (
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="text-xs font-mono font-black text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                              {log.recordCount ? `${log.recordCount} r.` : 'N/A'}
                            </span>
                          </td>
                        )}

                        {/* Ações (Archive / Retention toggle) */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleArchiveLog(log.id, log.description || log.action)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer inline-flex items-center justify-center ${
                              archivedLogIds.includes(log.id)
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            title={archivedLogIds.includes(log.id) ? "Desarquivar log de auditoria" : "Arquivar log de auditoria"}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            
            /* Linha do Tempo (Chronological Timeline layout representation) */
            <div className="p-6 relative">
              <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-slate-100" />
              
              <div className="space-y-6">
                {paginatedLogs.map((log) => {
                  const iconConfig = getLogIcon(log);
                  const LogIconComp = iconConfig.icon;
                  return (
                    <div key={log.id} className="flex gap-4 relative animate-fade-in group">
                      
                      {/* Timeline Dot/Icon */}
                      <div className={`h-10 w-10 rounded-full border flex items-center justify-center shadow-xs shrink-0 z-10 ${iconConfig.bg}`}>
                        <LogIconComp className="h-4 w-4" />
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 bg-white p-4 rounded-xl border border-slate-150 shadow-2xs group-hover:border-slate-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                          
                          {/* Title and Module context */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 uppercase">
                              {log.module}
                            </span>
                            <h3 className="text-xs font-black text-slate-800 tracking-tight">
                              {log.action}
                            </h3>
                            {log.result === 'Bloqueado' && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-[9px] font-black uppercase text-rose-700 tracking-wider">
                                Bloqueado
                              </span>
                            )}
                          </div>

                          {/* Date and hour metadata */}
                          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-3">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" /> {formatLogDate(log.date)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" /> {formatLogTime(log.date)}
                            </span>
                          </div>

                        </div>

                        {/* Description block */}
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {log.description}
                        </p>

                        {/* Details line */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pt-2.5 border-t border-slate-100/60 text-[10px] text-slate-400">
                          
                          <span className="flex items-center gap-1 font-bold text-slate-500">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {log.user} <span className="font-bold text-slate-300 uppercase">({log.profile})</span>
                          </span>

                          <span className="text-slate-300">|</span>

                          <span>ID: <span className="font-bold font-mono">{log.id}</span></span>

                          {log.affectedRecord && log.affectedRecord !== 'N/A' && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3 text-slate-400" />
                                Registro: <span className="font-bold text-slate-600">{log.affectedRecord}</span>
                              </span>
                            </>
                          )}

                          {log.clientName && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="flex items-center gap-1 font-bold text-blue-900 bg-blue-50 px-1 py-0.5 rounded border border-blue-100/50">
                                <Building2 className="h-3 w-3" /> {log.clientName}
                                {log.city && ` (${log.city}/${log.state || ''})`}
                              </span>
                            </>
                          )}

                          {log.recordCount !== undefined && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="font-bold text-slate-600 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">
                                Contagem: {log.recordCount} registros
                              </span>
                            </>
                          )}

                        </div>

                        {/* Timeline element quick action */}
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleArchiveLog(log.id, log.description || log.action)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Archive className="h-3 w-3" />
                            {archivedLogIds.includes(log.id) ? 'Desarquivar do histórico' : 'Mover para arquivo'}
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Footer info: Retention policies note & Pagination */}
        <div className="bg-slate-50 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Retention compliance note */}
          <div className="flex items-start gap-2 max-w-md">
            <ShieldCheck className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                Política de Retenção Vitalícia
              </p>
              <p className="text-[9px] font-medium text-slate-400 leading-normal mt-0.5">
                Os registros de auditoria são de conformidade legal e nunca são excluídos automaticamente. Apenas o arquivamento manual para fins de organização é permitido a perfis qualificados.
              </p>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            
            {/* Page size selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400">Exibir:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 border border-slate-200 rounded text-[10px] font-black bg-white focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-200" />

            {/* Page info */}
            <span className="text-[10px] font-black uppercase text-slate-400">
              Pág. {currentPage} de {totalPages} ({filteredLogs.length} itens)
            </span>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
