/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge, Tag, Toast, EmptyState, Tooltip } from '../components/ui/Feedback';
import { LateralDrawer, Modal, Tabs } from '../components/ui/Interactive';
import Breadcrumb from '../components/ui/Breadcrumb';
import { 
  Briefcase, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  CheckCircle, 
  XCircle, 
  FileDown, 
  FileSpreadsheet, 
  Send, 
  ArrowLeft, 
  ArrowRight, 
  Edit, 
  Clock, 
  User, 
  Building2, 
  MapPin, 
  Target, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  History,
  DollarSign,
  Eraser,
  ExternalLink,
  FileText,
  Sliders,
  Eye,
  RefreshCw,
  Sparkles,
  Award
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { REAL_OPPORTUNITIES, REAL_CLIENTS } from '../data/realData';
import GlobalFilters from '../components/shared/GlobalFilters';
import { syncPlatformData } from '../utils/platformSync';

// Type definitions matching requested specifications
export interface OpportunityHistory {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  origem: string;
  observacoes: string;
  statusAnterior?: string;
  novoStatus?: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  cliente: string;
  cidade: string;
  estado: string;
  segmento: string;
  categoria: string;
  scoreComercial: number;
  scoreFit: number;
  faturamentoEstimado: string;
  potencialComercial: 'Alta' | 'Média' | 'Baixa';
  status: 'Nova' | 'Em Avaliação' | 'Aprovada' | 'Enviada ao CRM' | 'Concluída' | 'Descartada';
  prioridade: 'Alta' | 'Média' | 'Baixa';
  produtosRecomendados: string[];
  produtosEncontrados: Array<{ produto: string; marca: string; categoria: string; status: string }>;
  produtosAusentes: Array<{ produto: string; categoria: string; prioridade: string }>;
  marcasConcorrentes: Array<{ marca: string; produtosEncontrados: string[] }>;
  valorPotencialEstimado: number;
  ultimaAnalise: string;
  dataAnalise: string;
  responsavel: string;
  origem: string;
  observacoes: string;
  rejectionReason?: string;
  proximaAcaoSugerida: string;
  historico: OpportunityHistory[];
  
  // Rule-based parameters
  motivo: string;
  dataCriacao: string;

  // RD Station simulation parameters
  crmStatus: 'pending' | 'success' | 'failed' | 'not_exported';
  crmId: string | null;
  exportStatus: 'ready' | 'exported' | 'error' | 'not_ready';
  assignedSeller: string;
  exportedAt: string | null;
  lastSync: string | null;
}

const STORAGE_KEY = 'ctrade_opportunities_data';

const INITIAL_OPPORTUNITIES: Opportunity[] = REAL_OPPORTUNITIES.map(ro => {
  let mappedStatus: Opportunity['status'] = 'Nova';
  const statusStr = String(ro.status);
  if (statusStr === 'Nova oportunidade') {
    mappedStatus = 'Nova';
  } else if (statusStr === 'Em análise') {
    mappedStatus = 'Em Avaliação';
  } else if (statusStr === 'Aprovada' || statusStr === 'Enviar ao CRM') {
    mappedStatus = 'Aprovada';
  } else if (statusStr === 'Enviada ao CRM') {
    mappedStatus = 'Enviada ao CRM';
  } else if (statusStr === 'Concluída') {
    mappedStatus = 'Concluída';
  } else if (statusStr === 'Rejeitado' || statusStr === 'Descartada' || statusStr === 'Rejeitados') {
    mappedStatus = 'Descartada';
  } else {
    mappedStatus = 'Nova';
  }

  let mappedPriority: Opportunity['prioridade'] = 'Média';
  if (ro.prioridade === 'Muito Alta' || ro.prioridade === 'Alta') {
    mappedPriority = 'Alta';
  } else if (ro.prioridade === 'Média') {
    mappedPriority = 'Média';
  } else if (ro.prioridade === 'Baixa' || ro.prioridade === 'Muito Baixa') {
    mappedPriority = 'Baixa';
  }

  const dateCriacao = ro.dataAnalise || '2026-07-01';

  // Rule-based reason generator
  let reason = 'Produto ausente no portfólio';
  if (ro.produtosEncontrados?.some(p => p.status === 'Marca Concorrente' || p.status === 'Substituível')) {
    reason = 'Produto concorrente encontrado';
  } else if (ro.produtosAusentes?.length > 0) {
    reason = 'Produto ausente no portfólio';
  } else if (ro.scoreFit < 75) {
    reason = 'Categoria não atendida';
  } else {
    reason = 'Mudança recente de cardápio';
  }

  return {
    id: ro.id,
    clientId: ro.clientId,
    cliente: ro.cliente,
    cidade: ro.cidade,
    estado: ro.estado,
    segmento: ro.segmento,
    categoria: ro.categoria,
    scoreComercial: ro.scoreComercial,
    scoreFit: ro.scoreFit,
    faturamentoEstimado: ro.faturamentoEstimado,
    potencialComercial: mappedPriority,
    status: mappedStatus,
    prioridade: mappedPriority,
    produtosRecomendados: ro.produtosRecomendados,
    produtosEncontrados: ro.produtosEncontrados,
    produtosAusentes: ro.produtosAusentes,
    marcasConcorrentes: ro.marcasConcorrentes,
    valorPotencialEstimado: ro.valorPotencialEstimado,
    ultimaAnalise: ro.ultimaAnalise,
    dataAnalise: ro.dataAnalise,
    responsavel: ro.responsavel,
    origem: ro.origem,
    observacoes: ro.observacoes,
    proximaAcaoSugerida: ro.proximaAcaoSugerida,
    historico: ro.historico.map((h: any) => ({
      ...h,
      statusAnterior: h.statusAnterior || 'Nova',
      novoStatus: h.novoStatus || 'Nova'
    })),
    crmStatus: ro.crmStatus as any,
    crmId: ro.crmId,
    exportStatus: ro.exportStatus as any,
    assignedSeller: ro.assignedSeller,
    exportedAt: ro.exportedAt,
    lastSync: ro.lastSync,
    dataCriacao: dateCriacao,
    motivo: reason
  };
});

export default function Oportunidades() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'history'>('kanban');

  // Move details observation state
  const [moveObservation, setMoveObservation] = useState('');
  
  // Rejection reason modal
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  
  // Form states for Edit / Create mode
  const [editForm, setEditForm] = useState<Partial<Opportunity>>({});
  const [newForm, setNewForm] = useState<Partial<Opportunity>>({
    cliente: '',
    cidade: 'São Paulo',
    estado: 'SP',
    segmento: 'Trattoria',
    categoria: 'Massas',
    prioridade: 'Média',
    status: 'Nova',
    motivo: 'Produto ausente no portfólio',
    valorPotencialEstimado: 12000,
    scoreComercial: 85,
    scoreFit: 80,
    responsavel: 'Marcelo Baquero (Você)',
    observacoes: 'Inserção manual de oportunidade qualificada.',
    produtosRecomendados: [],
    produtosEncontrados: [],
    produtosAusentes: []
  });
  
  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; desc?: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);
  
  // Simulated CRM Synchronization state
  const [isSyncingCRM, setIsSyncingCRM] = useState(false);
  const [syncingOppId, setSyncingOppId] = useState<string | null>(null);

  // Load clients state from localStorage or fallback
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) {
      setClients(JSON.parse(saved));
    } else {
      setClients(REAL_CLIENTS);
    }
  }, []);

  // Session filters state
  const [sessionFilters, setSessionFilters] = useState(() => {
    const saved = sessionStorage.getItem('ctrade_session_filters_base');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          estados: parsed.estados || [],
          cidades: parsed.cidades || (parsed.cidade ? [parsed.cidade] : []),
          regionais: parsed.regionais || [],
          rcas: parsed.rcas || [],
          categorias: parsed.categorias || [],
          produtos: parsed.produtos || [],
          marcas: parsed.marcas || [],
          segmentos: parsed.segmentos || [],
          statuses: parsed.statuses || [],
          scoreComercial: parsed.scoreComercial || 'all',
          scoreFit: parsed.scoreFit || 'all',
          cidade: parsed.cidade || '',
          cliente: parsed.cliente || '',
          periodoOption: parsed.periodoOption || '30',
          dataInicio: parsed.dataInicio || '',
          dataFim: parsed.dataFim || ''
        };
      } catch (e) {}
    }
    return {
      estados: [] as string[],
      cidades: [] as string[],
      regionais: [] as string[],
      rcas: [] as string[],
      categorias: [] as string[],
      produtos: [] as string[],
      marcas: [] as string[],
      segmentos: [] as string[],
      statuses: [] as string[],
      scoreComercial: 'all',
      scoreFit: 'all',
      cidade: '',
      cliente: '',
      periodoOption: '30',
      dataInicio: '',
      dataFim: ''
    };
  });

  // Persist session filters
  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new Event('storage'));
  }, [sessionFilters]);

  // Read session filters from other tabs
  useEffect(() => {
    const loadSessionFilters = () => {
      const savedFilters = sessionStorage.getItem('ctrade_session_filters_base');
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters);
          setSessionFilters(prev => {
            const nextFilters = {
              estados: parsed.estados || [],
              cidades: parsed.cidades || (parsed.cidade ? [parsed.cidade] : []),
              regionais: parsed.regionais || [],
              rcas: parsed.rcas || [],
              categorias: parsed.categorias || [],
              produtos: parsed.produtos || [],
              marcas: parsed.marcas || [],
              segmentos: parsed.segmentos || [],
              statuses: parsed.statuses || [],
              scoreComercial: parsed.scoreComercial || 'all',
              scoreFit: parsed.scoreFit || 'all',
              cidade: parsed.cidade || '',
              cliente: parsed.cliente || '',
              periodoOption: parsed.periodoOption || '30',
              dataInicio: parsed.dataInicio || '',
              dataFim: parsed.dataFim || ''
            };
            if (JSON.stringify(prev) === JSON.stringify(nextFilters)) {
              return prev;
            }
            return nextFilters;
          });
        } catch (e) {}
      }
    };
    loadSessionFilters();
    window.addEventListener('focus', loadSessionFilters);
    return () => window.removeEventListener('focus', loadSessionFilters);
  }, []);

  const addToast = (msg: string, desc?: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, desc, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Load opportunities with auto-migration of old states
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Migrate old statuses ('Entradas', 'Autorizados', 'Rejeitados') to new ones
        const migrated = parsed.map((o: any) => {
          let updatedStatus = o.status;
          if (o.status === 'Entradas') updatedStatus = 'Nova';
          else if (o.status === 'Autorizados') updatedStatus = 'Aprovada';
          else if (o.status === 'Rejeitados') updatedStatus = 'Descartada';
          
          let updatedPriority = o.prioridade;
          if (o.prioridade === 'Muito Alta' || o.prioridade === 'Muito Baixa') {
            updatedPriority = o.prioridade === 'Muito Alta' ? 'Alta' : 'Baixa';
          }
          
          return {
            ...o,
            status: updatedStatus,
            prioridade: updatedPriority,
            dataCriacao: o.dataCriacao || o.dataAnalise || '2026-07-01',
            motivo: o.motivo || 'Produto ausente no portfólio',
            crmStatus: o.crmStatus || 'not_exported',
            crmId: o.crmId || null,
            exportStatus: o.exportStatus || 'not_ready'
          };
        });
        
        setOpportunities(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch (e) {
        setOpportunities(INITIAL_OPPORTUNITIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OPPORTUNITIES));
      }
    } else {
      setOpportunities(INITIAL_OPPORTUNITIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OPPORTUNITIES));
    }
  }, []);

  // Save to storage helper
  const saveOpportunities = (updated: Opportunity[]) => {
    setOpportunities(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    syncPlatformData();
  };

  // Sync listener
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOpportunities(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filtered Opportunities List based on global session filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      // 0. Date filter
      if (sessionFilters.periodoOption !== 'all') {
        const itemDate = new Date(o.dataCriacao || o.dataAnalise);
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (sessionFilters.periodoOption === '7') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
        } else if (sessionFilters.periodoOption === '15') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 15);
        } else if (sessionFilters.periodoOption === '30') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
        } else if (sessionFilters.periodoOption === 'custom') {
          if (sessionFilters.dataInicio) startDate = new Date(sessionFilters.dataInicio);
          if (sessionFilters.dataFim) endDate = new Date(sessionFilters.dataFim);
        }

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
      }

      // 1. State filter
      if (sessionFilters.estados && sessionFilters.estados.length > 0) {
        if (!sessionFilters.estados.includes(o.estado)) {
          return false;
        }
      }

      // 2. City filter
      if (sessionFilters.cidades && sessionFilters.cidades.length > 0) {
        if (!sessionFilters.cidades.includes(o.cidade)) {
          return false;
        }
      }

      // 3. Segment filter
      if (sessionFilters.segmentos && sessionFilters.segmentos.length > 0) {
        if (!sessionFilters.segmentos.includes(o.segmento)) {
          return false;
        }
      }

      // 4. Categories filter
      if (sessionFilters.categorias && sessionFilters.categorias.length > 0) {
        if (!sessionFilters.categorias.includes(o.categoria)) {
          return false;
        }
      }

      // 5. Brands and products filter (complex intersection)
      if (sessionFilters.marcas && sessionFilters.marcas.length > 0) {
        const hasMatchingBrand = o.produtosEncontrados?.some(p => sessionFilters.marcas.includes(p.marca)) ||
                                 o.produtosAusentes?.some(p => sessionFilters.marcas.includes(p.produto)); // Simple mapping match
        if (!hasMatchingBrand) return false;
      }

      if (sessionFilters.produtos && sessionFilters.produtos.length > 0) {
        const hasMatchingProduct = o.produtosEncontrados?.some(p => sessionFilters.produtos.includes(p.produto)) ||
                                   o.produtosAusentes?.some(p => sessionFilters.produtos.includes(p.produto)) ||
                                   o.produtosRecomendados?.some(p => sessionFilters.produtos.includes(p));
        if (!hasMatchingProduct) return false;
      }

      // 6. RCA / Regional mapping (client level check)
      const clientObj = clients.find(c => c.name === o.cliente || c.id === parseInt(o.clientId, 10));
      if (clientObj) {
        if (sessionFilters.regionais && sessionFilters.regionais.length > 0) {
          if (!sessionFilters.regionais.includes(clientObj.regionalId)) return false;
        }
        if (sessionFilters.rcas && sessionFilters.rcas.length > 0) {
          if (!sessionFilters.rcas.includes(clientObj.rcaId)) return false;
        }
      }

      // 7. General text search (Matches Client Name, City, Segment, Category, Responsible)
      if (sessionFilters.cliente) {
        const q = sessionFilters.cliente.toLowerCase();
        const matchesClientSearch = 
          o.cliente.toLowerCase().includes(q) ||
          o.cidade.toLowerCase().includes(q) ||
          o.categoria.toLowerCase().includes(q) ||
          o.segmento.toLowerCase().includes(q) ||
          o.responsavel.toLowerCase().includes(q) ||
          o.motivo.toLowerCase().includes(q);
        if (!matchesClientSearch) {
          return false;
        }
      }

      return true;
    });
  }, [clients, opportunities, sessionFilters]);

  // Executive Summary & KPIs calculations (Real-time updates)
  const metrics = useMemo(() => {
    const total = filteredOpportunities.length;
    const high = filteredOpportunities.filter(o => o.prioridade === 'Alta').length;
    const med = filteredOpportunities.filter(o => o.prioridade === 'Média').length;
    const low = filteredOpportunities.filter(o => o.prioridade === 'Baixa').length;
    
    // Unique clients impacted
    const clientsImpacted = new Set(filteredOpportunities.map(o => o.cliente)).size;
    
    // Total products involved
    const productsInvolved = new Set(filteredOpportunities.flatMap(o => o.produtosRecomendados)).size;
    
    // Total categories involved
    const categoriesInvolved = new Set(filteredOpportunities.map(o => o.categoria)).size;
    
    // Sum of potential R$ values
    const potentialValue = filteredOpportunities.reduce((acc, o) => acc + o.valorPotencialEstimado, 0);

    return {
      total,
      high,
      med,
      low,
      clientsImpacted,
      productsInvolved,
      categoriesInvolved,
      potentialValue
    };
  }, [filteredOpportunities]);

  // Kanban Columns Definition (The 6 operational stages)
  const kanbanColumns = [
    { id: 'Nova', title: 'Nova', desc: 'Aguardando Qualificação', colorClass: 'text-blue-900 border-blue-100 bg-blue-50/20' },
    { id: 'Em Avaliação', title: 'Em Avaliação', desc: 'Análise de Viabilidade', colorClass: 'text-amber-800 border-amber-100 bg-amber-50/20' },
    { id: 'Aprovada', title: 'Aprovada', desc: 'Qualificada para CRM', colorClass: 'text-emerald-800 border-emerald-100 bg-emerald-50/20 shadow-xs' },
    { id: 'Enviada ao CRM', title: 'Enviada ao CRM', desc: 'RD Station Funil Ativo', colorClass: 'text-indigo-800 border-indigo-100 bg-indigo-50/20' },
    { id: 'Concluída', title: 'Concluída', desc: 'Oportunidade Ganha', colorClass: 'text-teal-800 border-teal-100 bg-teal-50/20' },
    { id: 'Descartada', title: 'Descartada', desc: 'Registros Arquivados', colorClass: 'text-rose-800 border-rose-100 bg-rose-50/20' }
  ] as const;

  // Global history logs compiled dynamically to preserve absolute consistency and single source of truth
  const globalHistoryLogs = useMemo(() => {
    const logs: Array<{ oppId: string; oppCliente: string; log: OpportunityHistory }> = [];
    opportunities.forEach(opp => {
      if (opp.historico) {
        opp.historico.forEach(log => {
          logs.push({
            oppId: opp.id,
            oppCliente: opp.cliente,
            log
          });
        });
      }
    });
    // Sort chronologically descending
    return logs.sort((a, b) => b.log.data.localeCompare(a.log.data));
  }, [opportunities]);

  // Priority and Status Badge Colors
  const getPriorityColor = (priority: Opportunity['prioridade']) => {
    switch (priority) {
      case 'Alta': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Média': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Baixa': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusColor = (status: Opportunity['status']) => {
    switch (status) {
      case 'Nova': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Em Avaliação': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Aprovada': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Enviada ao CRM': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Concluída': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'Descartada': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Quick-Access Navigation Actions (Establishing clean relationship links)
  const handleGoToClient = (opp: Opportunity) => {
    // Set localStorage selection trigger
    localStorage.setItem('ctrade_selected_client_id', opp.clientId);
    // Dispatch custom navigation event
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'clientes' }));
    addToast('Redirecionando...', `Abrindo dossiê do cliente ${opp.cliente}`, 'info');
  };

  const handleGoToMenu = (opp: Opportunity) => {
    // Search menu by matching client name or ID in Biblioteca.tsx trigger
    localStorage.setItem('ctrade_selected_menu_id', opp.cliente);
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'biblioteca' }));
    addToast('Redirecionando...', `Abrindo cardápio de ${opp.cliente}`, 'info');
  };

  const handleGoToDossie = (opp: Opportunity) => {
    localStorage.setItem('ctrade_selected_report_client', opp.cliente);
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'relatorios' }));
    addToast('Redirecionando...', `Abrindo relatório de inteligência de ${opp.cliente}`, 'info');
  };

  const handleGoToProducts = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'produtos' }));
  };

  // Operational Action: Move opportunity column with required history logging
  const handleMoveOpportunity = (oppId: string, newStatus: Opportunity['status'], obs?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const updated = opportunities.map(o => {
      if (o.id === oppId) {
        const oldStatus = o.status;
        if (oldStatus === newStatus) return o;

        const newHistoryItem: OpportunityHistory = {
          id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          data: timestamp,
          usuario: 'Marcelo Baquero (Você)',
          acao: `Movimentação de status`,
          origem: 'Central de Oportunidades',
          observacoes: obs || `Mudança de estágio comercial de "${oldStatus}" para "${newStatus}".`,
          statusAnterior: oldStatus,
          novoStatus: newStatus
        };

        return {
          ...o,
          status: newStatus,
          ultimaAnalise: timestamp,
          historico: [newHistoryItem, ...(o.historico || [])]
        };
      }
      return o;
    });

    saveOpportunities(updated);
    
    // Update active selections to keep UI synced
    if (selectedOpportunity && selectedOpportunity.id === oppId) {
      const reselected = updated.find(o => o.id === oppId);
      if (reselected) setSelectedOpportunity(reselected);
    }

    addToast('Status Atualizado!', `Oportunidade movida para ${newStatus}`, 'success');
    setMoveObservation('');
  };

  // Simulated RD Station Integration Flow
  const handleExportToCRM = (opp: Opportunity) => {
    setIsSyncingCRM(true);
    setSyncingOppId(opp.id);
    addToast('Iniciando Sincronização', 'Autenticando credenciais do RD Station CRM...', 'info');

    setTimeout(() => {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const crmLeadId = `RD-${Math.floor(100000 + Math.random() * 900000)}`;

      const updated = opportunities.map(o => {
        if (o.id === opp.id) {
          const newHistoryItem: OpportunityHistory = {
            id: `hist-${Date.now()}`,
            data: timestamp,
            usuario: 'Integração RD Station (Automático)',
            acao: 'Exportação para CRM concluída',
            origem: 'RD Station API',
            observacoes: `Lead inserido com sucesso no funil de vendas. ID do Lead: ${crmLeadId}. Vendedor: ${o.assignedSeller || 'Marcelo Baquero'}.`,
            statusAnterior: o.status,
            novoStatus: 'Enviada ao CRM'
          };

          return {
            ...o,
            status: 'Enviada ao CRM' as const,
            crmStatus: 'success' as const,
            crmId: crmLeadId,
            exportStatus: 'exported' as const,
            exportedAt: timestamp,
            lastSync: timestamp,
            historico: [newHistoryItem, ...(o.historico || [])]
          };
        }
        return o;
      });

      saveOpportunities(updated);
      
      // Keep selected sync
      const res = updated.find(o => o.id === opp.id);
      if (res) setSelectedOpportunity(res);

      setIsSyncingCRM(false);
      setSyncingOppId(null);
      addToast('Sucesso!', `Oportunidade integrada ao RD Station. ID: ${crmLeadId}`, 'success');
    }, 2000);
  };

  // Action: Create manual opportunity
  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.cliente) {
      addToast('Erro ao cadastrar', 'Insira o nome do estabelecimento', 'error');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newId = `opp-${Date.now()}`;

    // Ensure matching client relation
    let matchedClientId = '1';
    const foundCli = clients.find(c => c.name.toLowerCase().includes((newForm.cliente || '').toLowerCase()));
    if (foundCli) {
      matchedClientId = foundCli.id.toString();
    }

    const itemHistory: OpportunityHistory = {
      id: `hist-${Date.now()}`,
      data: timestamp,
      usuario: 'Marcelo Baquero (Você)',
      acao: 'Cadastro manual de oportunidade',
      origem: 'Central de Oportunidades',
      observacoes: 'Registro de oportunidade cadastrado manualmente pelo operador.'
    };

    const created: Opportunity = {
      id: newId,
      clientId: matchedClientId,
      cliente: newForm.cliente || 'Estabelecimento Manual',
      cidade: newForm.cidade || 'São Paulo',
      estado: newForm.estado || 'SP',
      segmento: newForm.segmento || 'Restaurante',
      categoria: newForm.categoria || 'Geral',
      scoreComercial: newForm.scoreComercial || 80,
      scoreFit: newForm.scoreFit || 80,
      faturamentoEstimado: 'R$ 100k - R$ 250k',
      potencialComercial: newForm.prioridade || 'Média',
      status: newForm.status || 'Nova',
      prioridade: newForm.prioridade || 'Média',
      produtosRecomendados: newForm.produtosRecomendados || [],
      produtosEncontrados: [],
      produtosAusentes: [],
      marcasConcorrentes: [],
      valorPotencialEstimado: newForm.valorPotencialEstimado || 12000,
      ultimaAnalise: timestamp,
      dataAnalise: timestamp,
      responsavel: newForm.responsavel || 'Marcelo Baquero (Você)',
      origem: 'Inclusão Manual',
      observacoes: newForm.observacoes || '',
      proximaAcaoSugerida: 'Contatar chef executivo para agendar apresentação de portfólio.',
      historico: [itemHistory],
      motivo: newForm.motivo || 'Produto ausente no portfólio',
      dataCriacao: timestamp.substring(0, 10),
      crmStatus: 'not_exported',
      crmId: null,
      exportStatus: 'not_ready',
      assignedSeller: 'Marcelo Baquero',
      exportedAt: null,
      lastSync: null
    };

    saveOpportunities([created, ...opportunities]);
    setIsCreateOpen(false);
    addToast('Oportunidade Criada!', `Oportunidade para ${created.cliente} cadastrada no funil.`, 'success');
    
    // Reset form
    setNewForm({
      cliente: '',
      cidade: 'São Paulo',
      estado: 'SP',
      segmento: 'Trattoria',
      categoria: 'Massas',
      prioridade: 'Média',
      status: 'Nova',
      motivo: 'Produto ausente no portfólio',
      valorPotencialEstimado: 12000,
      scoreComercial: 85,
      scoreFit: 80,
      responsavel: 'Marcelo Baquero (Você)',
      observacoes: 'Inserção manual de oportunidade qualificada.',
      produtosRecomendados: [],
      produtosEncontrados: [],
      produtosAusentes: []
    });
  };

  // Action: Save edited opportunity parameters
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updated = opportunities.map(o => {
      if (o.id === editForm.id) {
        const historyLogs = [...(o.historico || [])];
        
        // Track changes for history logging
        const changes: string[] = [];
        if (o.status !== editForm.status) {
          changes.push(`status ("${o.status}" → "${editForm.status}")`);
        }
        if (o.prioridade !== editForm.prioridade) {
          changes.push(`prioridade ("${o.prioridade}" → "${editForm.prioridade}")`);
        }
        if (o.valorPotencialEstimado !== editForm.valorPotencialEstimado) {
          changes.push(`potencial comercial ("${formatCurrency(o.valorPotencialEstimado)}" → "${formatCurrency(editForm.valorPotencialEstimado || 0)}")`);
        }

        if (changes.length > 0) {
          historyLogs.unshift({
            id: `hist-${Date.now()}`,
            data: timestamp,
            usuario: 'Marcelo Baquero (Você)',
            acao: 'Edição de parâmetros',
            origem: 'Central de Oportunidades',
            observacoes: `Alterações salvas no registro: ${changes.join(', ')}.`
          });
        }

        return {
          ...o,
          ...editForm,
          ultimaAnalise: timestamp,
          historico: historyLogs
        } as Opportunity;
      }
      return o;
    });

    saveOpportunities(updated);
    setIsEditOpen(false);
    
    const reselected = updated.find(o => o.id === editForm.id);
    if (reselected) setSelectedOpportunity(reselected);

    addToast('Alterações salvas!', 'Os dados da oportunidade foram atualizados.', 'success');
  };

  // Simulated export methods
  const handleDownloadPDF = (opp: Opportunity) => {
    addToast('Gerando Documento', `Compilando PDF de oportunidade comercial para ${opp.cliente}...`, 'info');
    setTimeout(() => {
      addToast('Download concluído', `PDF da Oportunidade (${opp.cliente}) salvo com sucesso.`, 'success');
    }, 1200);
  };

  const handleExportLote = () => {
    addToast('Preparando Lote', `Compilando ${filteredOpportunities.length} registros para planilha...`, 'info');
    setTimeout(() => {
      addToast('Planilha Exportada', `Sucesso! Matriz de oportunidades baixada em formato XLSX.`, 'success');
    }, 1500);
  };

  const ruleOptions = [
    'Produto concorrente encontrado',
    'Categoria não atendida',
    'Produto premium substituível',
    'Categoria com alto potencial',
    'Cliente utilizando marca concorrente',
    'Produto ausente no portfólio',
    'Mudança recente de cardápio'
  ];

  return (
    <PageContainer id="page-opportunities-central">
      <Breadcrumb items={[{ label: 'Central de Oportunidades', active: true }]} />
      
      {/* Simulation overlay for CRM Sync */}
      {isSyncingCRM && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-indigo-700 animate-spin" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Sincronizando com RD Station CRM</h4>
              <p className="text-xs text-slate-400 leading-normal">Transmitindo fit score, gaps de SKU e pitch de abordagem tática para o funil de vendas ativo...</p>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-700 h-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Floater Toasts */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              message={t.msg}
              description={t.desc}
              type={t.type}
              onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            />
          </div>
        ))}
      </div>

      {/* PAGE HEADER */}
      <PageHeader
        title="Central de Oportunidades Comerciais"
        subtitle="Organize, priorize e gerencie oportunidades curadas pelo Radar C-Trade e sincronize os leads com seu CRM de vendas."
        badge="Fase 15"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
              onClick={handleExportLote}
            >
              Exportar Planilha ({filteredOpportunities.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Inserir Oportunidade
            </Button>
          </div>
        }
      />

      {/* --- RESUMO EXECUTIVO --- */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm mt-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="h-32 w-32 text-blue-400 rotate-12" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="bg-blue-900/60 text-blue-200 border border-blue-700 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
            Ficha Executiva de Inteligência
          </span>
          <h2 className="text-lg font-black tracking-tight">Qualificação e Funil Comercial Ativo</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esta área consolida todas as oportunidades de abastecimento identificadas a partir dos cardápios homologados. 
            Você pode priorizar os leads, acompanhar o pipeline e exportá-los diretamente para o CRM de vendas de forma unificada, 
            garantindo que nenhuma venda potencial de SKUs homologados seja perdida.
          </p>
        </div>
      </div>

      {/* --- FILTROS GLOBAIS --- */}
      <div className="mt-6">
        <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
      </div>

      {/* --- KPIs SECTION (8 INDICATORS) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-6" id="opportunities-kpi-row">
        <MetricCard
          title="Total Oportunidades"
          value={metrics.total.toString()}
          icon={<Layers className="h-4 w-4 text-blue-900" />}
          comparisonText="Filtradas"
        />
        <MetricCard
          title="Prioridade Alta"
          value={metrics.high.toString()}
          icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
          trend={{ value: `${((metrics.high / (metrics.total || 1)) * 100).toFixed(0)}% do funil`, type: 'neutral' }}
        />
        <MetricCard
          title="Prioridade Média"
          value={metrics.med.toString()}
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          comparisonText="Em andamento"
        />
        <MetricCard
          title="Prioridade Baixa"
          value={metrics.low.toString()}
          icon={<CheckCircle className="h-4 w-4 text-slate-400" />}
          comparisonText="De apoio"
        />
        <MetricCard
          title="Clientes Impactados"
          value={metrics.clientsImpacted.toString()}
          icon={<Building2 className="h-4 w-4 text-emerald-600" />}
          trend={{ value: 'Estabelecimentos', type: 'neutral' }}
        />
        <MetricCard
          title="Produtos Envolvidos"
          value={metrics.productsInvolved.toString()}
          icon={<Briefcase className="h-4 w-4 text-indigo-600" />}
          comparisonText="SKUs sugeridos"
        />
        <MetricCard
          title="Categorias Ativas"
          value={metrics.categoriesInvolved.toString()}
          icon={<Target className="h-4 w-4 text-purple-600" />}
          comparisonText="Massas, Queijos..."
        />
        <MetricCard
          title="Potencial Estimado"
          value={formatCurrency(metrics.potentialValue)}
          icon={<DollarSign className="h-4 w-4 text-teal-600" />}
          trend={{ value: 'Retorno anualizado', type: 'up' }}
        />
      </div>

      {/* --- VIEW SWITCHER TABS --- */}
      <div className="flex border-b border-slate-200 mt-8 gap-6">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 px-1 ${
            activeTab === 'kanban'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Pipeline Kanban ({filteredOpportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 px-1 ${
            activeTab === 'list'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="h-4 w-4" />
          Lista Detalhada
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 px-1 ${
            activeTab === 'history'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="h-4 w-4" />
          Histórico de Operações ({globalHistoryLogs.length})
        </button>
      </div>

      {/* --- TAB 1: PIPELINE KANBAN BOARD --- */}
      {activeTab === 'kanban' && (
        <div className="mt-6">
          {filteredOpportunities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center flex flex-col items-center justify-center space-y-4">
              <Layers className="h-10 w-10 text-slate-300 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Nenhuma oportunidade atende a estes critérios</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Experimente alterar as seleções de estados, marcas ou categorias no painel de Filtros Globais acima.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSessionFilters({
                estados: [], cidades: [], regionais: [], rcas: [], categorias: [], produtos: [], marcas: [], segmentos: [], statuses: [], scoreComercial: 'all', scoreFit: 'all', cidade: '', cliente: '', periodoOption: '30', dataInicio: '', dataFim: ''
              })}>Limpar Filtros</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4" id="opportunities-kanban-board">
              {kanbanColumns.map(col => {
                const colOpps = filteredOpportunities.filter(o => o.status === col.id);
                return (
                  <div key={col.id} className="flex flex-col space-y-3 min-w-[220px]">
                    {/* Column Header */}
                    <div className={`p-3 rounded-2xl border ${col.colorClass} flex flex-col justify-between shrink-0`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider">{col.title}</span>
                        <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] font-bold">
                          {colOpps.length}
                        </Badge>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-semibold">{col.desc}</span>
                    </div>

                    {/* Column Body / Cards Stack */}
                    <div className="flex-1 bg-slate-50/50 p-2 rounded-2xl border border-dashed border-slate-200/60 min-h-[450px] space-y-3">
                      {colOpps.map(opp => (
                        <div
                          key={opp.id}
                          className="bg-white rounded-xl border border-slate-100 p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative group text-left"
                          onClick={() => {
                            setSelectedOpportunity(opp);
                            setIsDetailsOpen(true);
                          }}
                        >
                          {/* Priority badge and ID */}
                          <div className="flex justify-between items-center mb-2.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getPriorityColor(opp.prioridade)}`}>
                              {opp.prioridade}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">ID: {opp.id}</span>
                          </div>

                          {/* Client & City */}
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-black text-slate-800 leading-tight group-hover:text-blue-900 transition-colors">
                              {opp.cliente}
                            </h4>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {opp.cidade} - {opp.estado}
                            </span>
                          </div>

                          {/* Category & Reason */}
                          <div className="mt-3.5 space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-500 font-semibold border-t border-slate-50 pt-2.5">
                              <span>Segmento:</span>
                              <span className="text-slate-700">{opp.segmento}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                              <span>Categoria:</span>
                              <span className="text-slate-700">{opp.categoria}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-2">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Motivo Detectado</span>
                              <span className="text-[9px] text-slate-700 font-bold line-clamp-1">{opp.motivo}</span>
                            </div>
                          </div>

                          {/* Fit Score & Commercial potential */}
                          <div className="mt-3 flex justify-between items-end border-t border-slate-50 pt-3">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Aderência</span>
                              <span className="text-xs font-black text-emerald-600">{opp.scoreFit} pts</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Potencial R$</span>
                              <span className="text-xs font-black text-slate-800">{formatCurrency(opp.valorPotencialEstimado)}</span>
                            </div>
                          </div>

                          {/* Export trigger for approved leads */}
                          {opp.status === 'Aprovada' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportToCRM(opp);
                              }}
                              className="mt-3 w-full py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer animate-pulse"
                            >
                              <Send className="h-3 w-3" />
                              Exportar ao CRM
                            </button>
                          )}

                          {opp.status === 'Enviada ao CRM' && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg py-1 text-[9px] font-bold">
                              <CheckCircle className="h-3 w-3 text-indigo-600" />
                              <span>Sincronizado • {opp.crmId}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {colOpps.length === 0 && (
                        <div className="h-full flex items-center justify-center p-4">
                          <span className="text-[10px] text-slate-300 italic">Vazio</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: DETAILED LIST VIEW --- */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs mt-6 overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Lista Detalhada de Oportunidades ({filteredOpportunities.length})</span>
            <span className="text-[10px] font-medium text-slate-400">Clique nas linhas para visualizar os atalhos de relacionamento</span>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Layers className="h-8 w-8 text-slate-300 mb-2 animate-pulse" />
              <h5 className="text-xs font-bold text-slate-800">Nenhum registro encontrado</h5>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Ajuste os filtros globais na parte superior do painel para exibir mais resultados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Cliente / Local</th>
                    <th className="py-3 px-4">Segmento & Categoria</th>
                    <th className="py-3 px-4">Motivo Detectado</th>
                    <th className="py-3 px-4 text-center">Aderência</th>
                    <th className="py-3 px-4 text-right">Potencial</th>
                    <th className="py-3 px-4 text-center">Prioridade</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                  {filteredOpportunities.map((opp) => (
                    <tr
                      key={opp.id}
                      className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setIsDetailsOpen(true);
                      }}
                    >
                      {/* Client */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                            {opp.cliente}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {opp.cidade} - {opp.estado}
                          </span>
                        </div>
                      </td>

                      {/* Segment & Category */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-bold">{opp.segmento}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{opp.categoria}</span>
                        </div>
                      </td>

                      {/* Motivo */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="text-[11px] text-slate-800 font-semibold block truncate bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200/50">
                          {opp.motivo}
                        </span>
                      </td>

                      {/* Fit Score */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-black text-emerald-600 text-[11px] bg-emerald-50 px-2 py-1 rounded-lg">
                          {opp.scoreFit} pts
                        </span>
                      </td>

                      {/* Potencial Estimado */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{formatCurrency(opp.valorPotencialEstimado)}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Anual</span>
                        </div>
                      </td>

                      {/* Prioridade */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getPriorityColor(opp.prioridade)}`}>
                          {opp.prioridade}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <Badge variant={
                          opp.status === 'Aprovada' ? 'success' : 
                          opp.status === 'Nova' ? 'info' :
                          opp.status === 'Em Avaliação' ? 'warning' :
                          opp.status === 'Enviada ao CRM' ? 'secondary' : 'secondary'
                        }>
                          {opp.status}
                        </Badge>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="px-2 py-1 h-7 text-[10px] font-bold"
                            onClick={() => {
                              setSelectedOpportunity(opp);
                              setIsDetailsOpen(true);
                            }}
                          >
                            Detalhar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 h-7 text-[10px] font-bold"
                            onClick={() => handleDownloadPDF(opp)}
                          >
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: GLOBAL OPERATIONS HISTORY LOGS --- */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs mt-6 overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-blue-900" />
              Histórico Consolidado de Operações Comerciais
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              Pristine Audit Log
            </span>
          </div>

          <div className="p-6">
            {globalHistoryLogs.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Clock className="h-8 w-8 text-slate-300 mb-2 animate-pulse" />
                <h5 className="text-xs font-bold text-slate-800">Sem histórico registrado</h5>
                <p className="text-[10px] text-slate-400 mt-1">Nenhuma movimentação foi realizada nas oportunidades da sessão atual.</p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {globalHistoryLogs.map((item, idx) => (
                    <li key={item.log.id || idx}>
                      <div className="relative pb-8">
                        {idx !== globalHistoryLogs.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3.5">
                          {/* Circular Marker icon based on status */}
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                              item.log.origem?.includes('RD Station') 
                                ? 'bg-indigo-50 text-indigo-700' 
                                : item.log.acao?.includes('manual') 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Clock className="h-4 w-4" />
                            </span>
                          </div>

                          {/* Historical description */}
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex justify-between items-center gap-4">
                              <p className="text-[11px] text-slate-600 font-medium">
                                <span className="font-bold text-slate-800">{item.log.usuario}</span> {item.log.acao} no lead de{' '}
                                <span className="font-bold text-slate-800 cursor-pointer hover:underline" onClick={() => {
                                  const op = opportunities.find(o => o.id === item.oppId);
                                  if (op) {
                                    setSelectedOpportunity(op);
                                    setIsDetailsOpen(true);
                                  }
                                }}>{item.oppCliente}</span>
                              </p>
                              <span className="text-[9.5px] text-slate-400 font-mono shrink-0 font-bold">{item.log.data}</span>
                            </div>

                            {/* Status movement block if available */}
                            {item.log.statusAnterior && item.log.novoStatus && (
                              <div className="flex items-center gap-1.5 mt-1.5 text-[9.5px] font-bold">
                                <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(item.log.statusAnterior as any)}`}>{item.log.statusAnterior}</span>
                                <ArrowRight className="h-3 w-3 text-slate-300" />
                                <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(item.log.novoStatus as any)}`}>{item.log.novoStatus}</span>
                              </div>
                            )}

                            {/* Observations */}
                            <p className="text-[10px] text-slate-400 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 leading-relaxed max-w-3xl">
                              {item.log.observacoes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- LATERAL DETAILS DRAWER (OPERATIONAL CENTRAL) --- */}
      <LateralDrawer
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setMoveObservation('');
        }}
        title="Dossiê Operacional da Oportunidade"
      >
        {selectedOpportunity && (
          <div className="space-y-6 text-left pb-12">
            {/* Lead Primary Identity */}
            <div className="p-4 bg-slate-950 text-white rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                <Briefcase className="h-16 w-16" />
              </div>
              <div className="space-y-1.5">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getPriorityColor(selectedOpportunity.prioridade)}`}>
                  Prioridade {selectedOpportunity.prioridade}
                </span>
                <h3 className="text-sm font-black tracking-tight leading-snug">{selectedOpportunity.cliente}</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {selectedOpportunity.cidade} - {selectedOpportunity.estado}
                </span>
              </div>
            </div>

            {/* Quick Relationship Shortcuts (The requested chain) */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Sinalizadores de Relacionamento</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGoToClient(selectedOpportunity)}
                  className="bg-white hover:bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col justify-between group transition-all text-left h-20"
                >
                  <User className="h-4 w-4 text-emerald-600 group-hover:scale-105 transition-transform" />
                  <div className="flex justify-between items-center w-full mt-1">
                    <span className="text-[10px] font-bold text-slate-700">Ver Cliente</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                  </div>
                </button>

                <button
                  onClick={() => handleGoToMenu(selectedOpportunity)}
                  className="bg-white hover:bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col justify-between group transition-all text-left h-20"
                >
                  <FileText className="h-4 w-4 text-amber-500 group-hover:scale-105 transition-transform" />
                  <div className="flex justify-between items-center w-full mt-1">
                    <span className="text-[10px] font-bold text-slate-700">Ver Cardápio</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                  </div>
                </button>

                <button
                  onClick={() => handleGoToDossie(selectedOpportunity)}
                  className="bg-white hover:bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col justify-between group transition-all text-left h-20 col-span-2"
                >
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-blue-900 group-hover:scale-105 transition-transform" />
                    <span className="bg-blue-50 text-blue-800 text-[8px] font-black px-1.5 rounded uppercase">Dossiê de Campo</span>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-black text-slate-800">Abrir Dossiê de Inteligência Comercial</span>
                    <ExternalLink className="h-3.5 w-3.5 text-blue-900" />
                  </div>
                </button>
              </div>
            </div>

            {/* Current Stage and Transition qualification */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Estágio Qualificação</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getStatusColor(selectedOpportunity.status)}`}>
                  {selectedOpportunity.status}
                </span>
              </div>

              {/* CRM Export and integration values */}
              {selectedOpportunity.status === 'Aprovada' && (
                <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-900">
                    <Send className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase">Lead Qualificado para o CRM</span>
                  </div>
                  <p className="text-[9px] text-indigo-700/80 leading-normal">Esta oportunidade está homologada. Clique no botão abaixo para simular a transmissão automática e handshake com o RD Station CRM.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full h-8 text-[10px] font-bold bg-indigo-700 hover:bg-indigo-800"
                    onClick={() => handleExportToCRM(selectedOpportunity)}
                  >
                    Transmitir para o RD Station
                  </Button>
                </div>
              )}

              {selectedOpportunity.status === 'Enviada ao CRM' && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between text-[10px] text-emerald-800 font-bold">
                    <span>Código de Registro CRM:</span>
                    <span className="font-mono">{selectedOpportunity.crmId}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-emerald-600 font-medium">
                    <span>Exportado em:</span>
                    <span>{selectedOpportunity.exportedAt}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-emerald-600 font-medium">
                    <span>Vendedor Responsável:</span>
                    <span>{selectedOpportunity.assignedSeller}</span>
                  </div>
                </div>
              )}

              {/* Status Movement Quick Selector (Required Operational Transitioning with logs) */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Qualificar e Mover de Estágio</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {kanbanColumns.map(btn => (
                    <button
                      key={btn.id}
                      disabled={selectedOpportunity.status === btn.id}
                      onClick={() => handleMoveOpportunity(selectedOpportunity.id, btn.id, moveObservation)}
                      className={`py-1.5 rounded-lg text-[9.5px] font-extrabold transition-all border cursor-pointer ${
                        selectedOpportunity.status === btn.id
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {btn.title}
                    </button>
                  ))}
                </div>
                
                {/* Optional justification input for transitions */}
                <div className="space-y-1 mt-3">
                  <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider block">Justificativa / Nota Interna de Qualificação (Opcional)</span>
                  <input
                    type="text"
                    value={moveObservation}
                    onChange={(e) => setMoveObservation(e.target.value)}
                    placeholder="Ex: Cliente demonstrou interesse na pizza demo"
                    className="w-full text-[11px] bg-white border border-slate-200 rounded-lg p-2 h-8 text-slate-700 placeholder-slate-300 focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Core parameters */}
            <div className="space-y-2.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Atributos Operacionais</span>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Motivo Detectado:</span>
                  <span className="text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{selectedOpportunity.motivo}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Potencial Comercial:</span>
                  <span className="text-blue-950 font-black">{formatCurrency(selectedOpportunity.valorPotencialEstimado)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Aderência ao Portfólio:</span>
                  <span className="text-emerald-600 font-extrabold">{selectedOpportunity.scoreFit} pts</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Data de Cadastro:</span>
                  <span className="text-slate-700">{selectedOpportunity.dataCriacao}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Última Atualização:</span>
                  <span className="text-slate-700">{selectedOpportunity.ultimaAnalise}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Responsável:</span>
                  <span className="text-slate-700">{selectedOpportunity.responsavel}</span>
                </div>
              </div>
            </div>

            {/* Gap de Produtos specific recommended */}
            {selectedOpportunity.produtosRecomendados && selectedOpportunity.produtosRecomendados.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Gaps de Produtos Mapeados</span>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2 shadow-2xs">
                  {selectedOpportunity.produtosRecomendados.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-slate-800 font-bold">{prod}</span>
                      <span className="text-[9.5px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-black border border-rose-100">Ausente</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunity Actions footer */}
            <div className="flex gap-2.5 pt-4">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  setEditForm(selectedOpportunity);
                  setIsEditOpen(true);
                }}
              >
                Editar Parâmetros
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={() => handleDownloadPDF(selectedOpportunity)}
              >
                <FileDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Individual history trail */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Linha do Tempo deste Lead</span>
              <div className="space-y-4">
                {selectedOpportunity.historico?.map((hist, i) => (
                  <div key={hist.id || i} className="flex gap-3 text-xs leading-relaxed">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-slate-400" />
                      <div className="w-0.5 bg-slate-100 flex-1" />
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>{hist.usuario}</span>
                        <span className="font-mono">{hist.data}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 block mt-1">{hist.acao}</span>
                      <p className="text-[10px] text-slate-400 mt-1">{hist.observacoes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </LateralDrawer>

      {/* --- MODAL: CREATE MANUAL OPPORTUNITY --- */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Cadastrar Oportunidade Comercial"
      >
        <form onSubmit={handleCreateOpportunity} className="space-y-4 text-left p-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Nome do Estabelecimento *</label>
              <Input
                type="text"
                value={newForm.cliente}
                onChange={(e) => setNewForm({ ...newForm, cliente: e.target.value })}
                placeholder="Ex: Trattoria Donna"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Região / Cidade</label>
              <Input
                type="text"
                value={newForm.cidade}
                onChange={(e) => setNewForm({ ...newForm, cidade: e.target.value })}
                placeholder="Ex: São Paulo"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Estado</label>
              <Select
                value={newForm.estado}
                onChange={(e) => setNewForm({ ...newForm, estado: e.target.value })}
                options={[
                  { value: 'SP', label: 'SP' },
                  { value: 'RJ', label: 'RJ' },
                  { value: 'MG', label: 'MG' },
                  { value: 'PR', label: 'PR' },
                  { value: 'RS', label: 'RS' }
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Segmento</label>
              <Input
                type="text"
                value={newForm.segmento}
                onChange={(e) => setNewForm({ ...newForm, segmento: e.target.value })}
                placeholder="Ex: Pizzaria"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Categoria Portfólio</label>
              <Input
                type="text"
                value={newForm.categoria}
                onChange={(e) => setNewForm({ ...newForm, categoria: e.target.value })}
                placeholder="Ex: Queijos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Motivo Regulamentado</label>
              <Select
                value={newForm.motivo}
                onChange={(e) => setNewForm({ ...newForm, motivo: e.target.value })}
                options={ruleOptions.map(opt => ({ value: opt, label: opt }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Prioridade</label>
              <Select
                value={newForm.prioridade}
                onChange={(e) => setNewForm({ ...newForm, prioridade: e.target.value as any })}
                options={[
                  { value: 'Alta', label: 'Alta' },
                  { value: 'Média', label: 'Média' },
                  { value: 'Baixa', label: 'Baixa' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Potencial Estimado (R$)</label>
              <Input
                type="number"
                value={newForm.valorPotencialEstimado || ''}
                onChange={(e) => setNewForm({ ...newForm, valorPotencialEstimado: parseInt(e.target.value, 10) || 0 })}
                placeholder="12000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Score de Fit (Aderência)</label>
              <Input
                type="number"
                value={newForm.scoreFit || ''}
                onChange={(e) => setNewForm({ ...newForm, scoreFit: parseInt(e.target.value, 10) || 0 })}
                placeholder="80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Score Comercial</label>
              <Input
                type="number"
                value={newForm.scoreComercial || ''}
                onChange={(e) => setNewForm({ ...newForm, scoreComercial: parseInt(e.target.value, 10) || 0 })}
                placeholder="85"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-500">Responsável Operador</label>
            <Input
              type="text"
              value={newForm.responsavel}
              onChange={(e) => setNewForm({ ...newForm, responsavel: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-500">Observações Estratégicas</label>
            <Textarea
              value={newForm.observacoes}
              onChange={(e) => setNewForm({ ...newForm, observacoes: e.target.value })}
              placeholder="Descreva detalhes ou pitch inicial..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Gravar Oportunidade</Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL: EDIT OPPORTUNITY --- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Parâmetros da Oportunidade"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-left p-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Estabelecimento</label>
              <Input
                type="text"
                disabled
                value={editForm.cliente || ''}
                className="bg-slate-50 text-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Motivo Detectado</label>
              <Select
                value={editForm.motivo || ''}
                onChange={(e) => setEditForm({ ...editForm, motivo: e.target.value })}
                options={ruleOptions.map(opt => ({ value: opt, label: opt }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Prioridade</label>
              <Select
                value={editForm.prioridade || 'Média'}
                onChange={(e) => setEditForm({ ...editForm, prioridade: e.target.value as any })}
                options={[
                  { value: 'Alta', label: 'Alta' },
                  { value: 'Média', label: 'Média' },
                  { value: 'Baixa', label: 'Baixa' }
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Estágio Status</label>
              <Select
                value={editForm.status || 'Nova'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                options={[
                  { value: 'Nova', label: 'Nova' },
                  { value: 'Em Avaliação', label: 'Em Avaliação' },
                  { value: 'Aprovada', label: 'Aprovada' },
                  { value: 'Enviada ao CRM', label: 'Enviada ao CRM' },
                  { value: 'Concluída', label: 'Concluída' },
                  { value: 'Descartada', label: 'Descartada' }
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Potencial Estimado (R$)</label>
              <Input
                type="number"
                value={editForm.valorPotencialEstimado || ''}
                onChange={(e) => setEditForm({ ...editForm, valorPotencialEstimado: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Score de Fit</label>
              <Input
                type="number"
                value={editForm.scoreFit || ''}
                onChange={(e) => setEditForm({ ...editForm, scoreFit: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Score Comercial</label>
              <Input
                type="number"
                value={editForm.scoreComercial || ''}
                onChange={(e) => setEditForm({ ...editForm, scoreComercial: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500">Responsável</label>
              <Input
                type="text"
                value={editForm.responsavel || ''}
                onChange={(e) => setEditForm({ ...editForm, responsavel: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-500">Anotações Estratégicas</label>
            <Textarea
              value={editForm.observacoes || ''}
              onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Salvar Parâmetros</Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
