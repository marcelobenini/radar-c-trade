/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, ProgressBar, Toast } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Interactive';
import GlobalFilters, { matchesScoreRange } from '../components/shared/GlobalFilters';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import {
  RotateCw,
  Download,
  Users,
  Layers,
  DollarSign,
  Sparkles,
  Award,
  Zap,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Flame,
  Globe,
  Tag,
  Briefcase,
  X,
  SlidersHorizontal,
  Eraser,
  Search,
  Settings,
  Trash2,
  Edit2,
  Activity,
  ChevronRight,
  ChevronLeft,
  Building2,
  Calendar
} from 'lucide-react';
import { REAL_CLIENTS, REAL_OPPORTUNITIES, REAL_PRODUCTS } from '../data/realData';

export default function VisaoGeral() {
  // Load Regionais & RCAs from localStorage or defaults
  const [regionals, setRegionals] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_regionals');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'reg-sudeste', name: 'Regional Sudeste', active: true },
      { id: 'reg-sul', name: 'Regional Sul', active: true },
      { id: 'reg-nordeste', name: 'Regional Nordeste', active: true },
      { id: 'reg-centro-oeste', name: 'Regional Centro-Oeste', active: true },
    ];
  });

  const [rcas, setRcas] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_rcas');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'rca-marcelo', name: 'RCA Marcelo Baquero', regionalId: 'reg-sudeste', active: true },
      { id: 'rca-amanda', name: 'RCA Amanda Souza', regionalId: 'reg-sul', active: true },
      { id: 'rca-pedro', name: 'RCA Pedro Santos', regionalId: 'reg-nordeste', active: true },
      { id: 'rca-lucas', name: 'RCA Lucas Oliveira', regionalId: 'reg-centro-oeste', active: true },
    ];
  });

  // Persist Regionais & RCAs
  useEffect(() => {
    localStorage.setItem('ctrade_regionals', JSON.stringify(regionals));
  }, [regionals]);

  useEffect(() => {
    localStorage.setItem('ctrade_rcas', JSON.stringify(rcas));
  }, [rcas]);

  // Load clients state from localStorage or fallback
  const [clients, setClients] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) return JSON.parse(saved);
    return REAL_CLIENTS.map(rc => ({
      id: rc.id,
      name: rc.name,
      fantasyName: rc.fantasyName,
      city: rc.city,
      state: rc.state,
      segment: rc.segment,
      category: rc.category,
      instagram: rc.instagram,
      website: rc.website,
      phone: rc.phone,
      email: rc.email,
      responsible: rc.responsible,
      responsibleRole: rc.responsibleRole,
      observations: rc.observations,
      score: rc.score,
      potential: rc.potential,
      status: rc.status === 'Analisado' ? 'Autorizados' : 'Entradas',
      lastAnalysis: rc.lastAnalysis,
      lastUpload: rc.lastUpload,
      regionalId: rc.state === 'RJ' ? 'reg-sudeste' : 'reg-sul',
      rcaId: rc.state === 'RJ' ? 'rca-marcelo' : 'rca-amanda'
    }));
  });

  // Load opportunities state from localStorage or fallback
  const [opportunities, setOpportunities] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_opportunities_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return REAL_OPPORTUNITIES.map(ro => {
      let mappedStatus: 'Entradas' | 'Autorizados' | 'Rejeitados' = 'Entradas';
      if (ro.status === 'Nova oportunidade' || ro.status === 'Em análise') {
        mappedStatus = 'Entradas';
      } else if (ro.status === 'Aprovada' || ro.status === 'Enviar ao CRM' || ro.status === 'Enviada ao CRM') {
        mappedStatus = 'Autorizados';
      } else {
        mappedStatus = 'Rejeitados';
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
        potencialComercial: ro.potencialComercial,
        status: mappedStatus,
        prioridade: ro.prioridade,
        produtosRecomendados: ro.produtosRecomendados,
        produtosEncontrados: ro.produtosEncontrados || [],
        produtosAusentes: ro.produtosAusentes || [],
        marcasConcorrentes: ro.marcasConcorrentes || [],
        valorPotencialEstimado: ro.valorPotencialEstimado,
        ultimaAnalise: ro.ultimaAnalise,
        dataAnalise: ro.dataAnalise,
        responsavel: ro.responsavel,
        origem: ro.origem,
        observacoes: ro.observacoes,
        proximaAcaoSugerida: ro.proximaAcaoSugerida,
        historico: ro.historico || [],
        crmStatus: ro.crmStatus,
        crmId: ro.crmId,
        exportStatus: ro.exportStatus,
        assignedSeller: ro.assignedSeller,
        exportedAt: ro.exportedAt,
        lastSync: ro.lastSync
      };
    });
  });

  // Sync state from localStorage on mount/focus
  useEffect(() => {
    const syncData = () => {
      const savedClients = localStorage.getItem('ctrade_clients_list_v2');
      if (savedClients) {
        try { setClients(JSON.parse(savedClients)); } catch (e) {}
      }
      const savedOpps = localStorage.getItem('ctrade_opportunities_data');
      if (savedOpps) {
        try { setOpportunities(JSON.parse(savedOpps)); } catch (e) {}
      }
    };
    syncData();
    window.addEventListener('focus', syncData);
    return () => window.removeEventListener('focus', syncData);
  }, []);

  // Toast alert state
  const [toast, setToast] = useState<{ message: string; description: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Synchronized global session filters state (exact match of Clientes.tsx)
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
      scoreComercial: 'all' as string,
      scoreFit: 'all' as string,
      cidade: '' as string,
      cliente: '' as string,
      periodoOption: '30' as string,
      dataInicio: '' as string,
      dataFim: '' as string
    };
  });

  // Persist session filters to sessionStorage & broadcast event
  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new Event('storage'));
  }, [sessionFilters]);

  // Read session filters if changed on other tabs
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

  // --- DATE PARSING & FILTERING FOR PERÍODO ---
  const parseDateString = (str: string): Date | null => {
    if (!str) return null;
    const s = str.trim();
    // Check if it's already a standard Date input format YYYY-MM-DD
    const yyyymmdd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (yyyymmdd) {
      return new Date(Number(yyyymmdd[1]), Number(yyyymmdd[2]) - 1, Number(yyyymmdd[3]));
    }
    // Check if it's DD/MM/YYYY
    const ddmmyyyy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyyyy) {
      return new Date(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1]));
    }
    // If it's something like "Hoje, às 14:30" or similar
    if (s.toLowerCase().includes('hoje')) {
      return new Date('2026-07-08T11:51:34-07:00');
    }
    if (s.toLowerCase().includes('ontem')) {
      const yesterday = new Date('2026-07-08T11:51:34-07:00');
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
    return null;
  };

  const activeDateRange = useMemo(() => {
    const option = sessionFilters.periodoOption || '30';
    const now = new Date('2026-07-08T11:51:34-07:00'); // Use system local time from metadata
    
    let start: Date | null = null;
    let end: Date | null = null;
    
    if (option === '7') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      end = new Date(now);
    } else if (option === '15') {
      start = new Date(now);
      start.setDate(now.getDate() - 15);
      end = new Date(now);
    } else if (option === '30') {
      start = new Date(now);
      start.setDate(now.getDate() - 30);
      end = new Date(now);
    } else if (option === 'custom') {
      if (sessionFilters.dataInicio) {
        start = parseDateString(sessionFilters.dataInicio);
      }
      if (sessionFilters.dataFim) {
        end = parseDateString(sessionFilters.dataFim);
      }
    }
    
    // Normalize hours to start/end of day
    if (start) {
      start.setHours(0, 0, 0, 0);
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
  }, [sessionFilters.periodoOption, sessionFilters.dataInicio, sessionFilters.dataFim]);

  const isDateInActiveRange = (dateStr?: string) => {
    if (!dateStr) return true; // Sane fallback
    const cleanDateStr = (dateStr === 'Sem análise' || dateStr === 'Aguardando envio' || dateStr === 'Sem cardápio submetido') 
      ? '07/07/2026' 
      : dateStr;
      
    const itemDate = parseDateString(cleanDateStr);
    if (!itemDate) return true;
    
    const { start, end } = activeDateRange;
    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    
    return true;
  };

  // Modal de regionais / rca states
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingRegionalId, setEditingRegionalId] = useState<string | null>(null);
  const [newRegionalName, setNewRegionalName] = useState('');
  const [editingRcaId, setEditingRcaId] = useState<string | null>(null);
  const [newRcaName, setNewRcaName] = useState('');

  // Pagination states for dashboard tables
  const [pageAguardando, setPageAguardando] = useState(1);
  const [pageRejeitados, setPageRejeitados] = useState(1);
  const [pageUltimos, setPageUltimos] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Reset pagination on filter changes
  useEffect(() => {
    setPageAguardando(1);
    setPageRejeitados(1);
    setPageUltimos(1);
  }, [sessionFilters]);

  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = () => {
    const savedClients = localStorage.getItem('ctrade_clients_list_v2');
    if (savedClients) {
      try { setClients(JSON.parse(savedClients)); } catch (e) {}
    }
    const savedOpps = localStorage.getItem('ctrade_opportunities_data');
    if (savedOpps) {
      try { setOpportunities(JSON.parse(savedOpps)); } catch (e) {}
    }
    triggerToast(
      'success',
      'Dados atualizados',
      'As métricas executivas e o pipeline comercial foram recalculados com sucesso.'
    );
  };

  const handleExport = () => {
    triggerToast(
      'info',
      'Relatório gerado',
      'O consolidado executivo está sendo preparado para download em formato PDF/Excel.'
    );
  };

  const handleClearFilters = () => {
    setSessionFilters({
      estados: [],
      cidades: [],
      regionais: [],
      rcas: [],
      categorias: [],
      produtos: [],
      marcas: [],
      segmentos: [],
      statuses: [],
      scoreComercial: 'all',
      scoreFit: 'all',
      cidade: '',
      cliente: '',
      periodoOption: '30',
      dataInicio: '',
      dataFim: ''
    });
    triggerToast('info', 'Filtros Limpos', 'A visualização foi restaurada para o estado original (Últimos 30 dias).');
  };

  // Helper getters for names
  const getRegionalName = (id?: string) => {
    const reg = regionals.find(r => r.id === id);
    return reg ? reg.name : 'Não Definida';
  };

  const getRcaName = (id?: string) => {
    const rca = rcas.find(r => r.id === id);
    return rca ? rca.name : 'Não Definido';
  };

  // --- COMPREHENSIVE FILTERING LOGIC ---
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 0. Período filter (global)
      const hasValidDate = isDateInActiveRange(client.lastAnalysis) || isDateInActiveRange(client.lastUpload);
      if (!hasValidDate) {
        return false;
      }

      // 1. Cliente text filter
      if (sessionFilters.cliente) {
        const q = sessionFilters.cliente.toLowerCase();
        if (!client.name.toLowerCase().includes(q) && !client.fantasyName?.toLowerCase().includes(q)) {
          return false;
        }
      }

      // 2. Cidade filter (multiple)
      if (sessionFilters.cidades && sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(client.city)) {
        return false;
      }

      // 3. Estado filter (multiple)
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(client.state)) {
        return false;
      }

      // 5. RCA filter (multiple)
      if (sessionFilters.rcas.length > 0 && (!client.rcaId || !sessionFilters.rcas.includes(client.rcaId))) {
        return false;
      }

      // 6. Categoria filter (multiple)
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(client.category)) {
        return false;
      }

      // 7. Produto filter (multiple)
      if (sessionFilters.produtos.length > 0) {
        const clientOpps = opportunities.filter(o => o.cliente.toLowerCase() === client.name.toLowerCase() || o.clientId?.toString() === client.id.toString());
        const clientProducts = clientOpps.flatMap(o => [
          ...(o.produtosRecomendados || []),
          ...(o.produtosEncontrados?.map((pe: any) => pe.produto) || [])
        ]);
        const hasMatch = sessionFilters.produtos.some(p => clientProducts.some(cp => cp.toLowerCase().includes(p.toLowerCase())));
        if (!hasMatch) return false;
      }

      // 9. Segmento filter (multiple)
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(client.segment)) {
        return false;
      }

      // 10. Status filter (multiple)
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(client.status)) {
        return false;
      }

      // 11. Score de Fit Filter
      if (sessionFilters.scoreFit !== 'all') {
        const score = client.score;
        if (!matchesScoreRange(score, sessionFilters.scoreFit)) return false;
      }

      // 12. Score Comercial Filter
      if (sessionFilters.scoreComercial !== 'all') {
        const opp = opportunities.find(o => o.cliente.toLowerCase() === client.name.toLowerCase() || o.clientId?.toString() === client.id.toString());
        const score = opp ? opp.scoreComercial : client.score;
        if (!matchesScoreRange(score, sessionFilters.scoreComercial)) return false;
      }

      return true;
    });
  }, [clients, opportunities, sessionFilters]);

  // Dynamic city-state relationship as requested
  const availableCitiesAndStates = useMemo(() => {
    const list = clients.map(c => ({ city: c.city, state: c.state }));
    const defaults = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Campinas', state: 'SP' },
      { city: 'Santos', state: 'SP' },
      { city: 'Ribeirão Preto', state: 'SP' },
      { city: 'Sorocaba', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Niterói', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Uberlândia', state: 'MG' },
      { city: 'Curitiba', state: 'PR' },
      { city: 'Porto Alegre', state: 'RS' },
      { city: 'Florianópolis', state: 'SC' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Recife', state: 'PE' },
      { city: 'Fortaleza', state: 'CE' },
      { city: 'Goiânia', state: 'GO' },
      { city: 'Brasília', state: 'DF' }
    ];
    const combined = [...list, ...defaults];
    const unique: { [key: string]: string } = {};
    combined.forEach(item => {
      if (item.city && item.state) {
        unique[item.city.trim()] = item.state.trim().toUpperCase();
      }
    });
    return Object.entries(unique).map(([city, state]) => ({ city, state }));
  }, [clients]);

  const cidadeOptions = useMemo(() => {
    let filtered = availableCitiesAndStates;
    if (sessionFilters.estados && sessionFilters.estados.length > 0) {
      filtered = availableCitiesAndStates.filter(item => sessionFilters.estados.includes(item.state));
    }
    return filtered
      .map(item => ({ value: item.city, label: `${item.city} (${item.state})` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [availableCitiesAndStates, sessionFilters.estados]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      // 0. Período filter (global)
      if (o.dataAnalise && !isDateInActiveRange(o.dataAnalise)) {
        return false;
      }

      const clientOfOpp = clients.find(c => c.id.toString() === o.clientId?.toString() || c.name.toLowerCase() === o.cliente.toLowerCase());
      
      // 1. Cliente text filter
      if (sessionFilters.cliente) {
        const q = sessionFilters.cliente.toLowerCase();
        if (!o.cliente.toLowerCase().includes(q)) {
          return false;
        }
      }

      // 2. Cidade filter (multiple)
      if (sessionFilters.cidades && sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(o.cidade)) {
        return false;
      }

      // 3. Estado filter (multiple)
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(o.estado)) {
        return false;
      }

      // 5. RCA filter (multiple)
      if (sessionFilters.rcas.length > 0) {
        if (!clientOfOpp || !clientOfOpp.rcaId || !sessionFilters.rcas.includes(clientOfOpp.rcaId)) {
          return false;
        }
      }

      // 6. Categoria filter (multiple)
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(o.categoria)) {
        return false;
      }

      // 7. Produto filter (multiple)
      if (sessionFilters.produtos.length > 0) {
        const oppProducts = [
          ...(o.produtosRecomendados || []),
          ...(o.produtosEncontrados?.map((pe: any) => pe.produto) || [])
        ];
        const hasMatch = sessionFilters.produtos.some(p => oppProducts.some(op => op.toLowerCase().includes(p.toLowerCase())));
        if (!hasMatch) return false;
      }

      // 9. Segmento filter (multiple)
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(o.segmento)) {
        return false;
      }

      // 10. Status filter (multiple)
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(o.status)) {
        return false;
      }

      // 11. Score de Fit Filter
      if (sessionFilters.scoreFit !== 'all') {
        const score = o.scoreFit || (clientOfOpp ? clientOfOpp.score : 0);
        if (!matchesScoreRange(score, sessionFilters.scoreFit)) return false;
      }

      // 12. Score Comercial Filter
      if (sessionFilters.scoreComercial !== 'all') {
        const score = o.scoreComercial;
        if (!matchesScoreRange(score, sessionFilters.scoreComercial)) return false;
      }

      return true;
    });
  }, [opportunities, clients, sessionFilters]);

  // --- CALCULATION OF 8 EXECUTIVE KPIS ---
  const kpiBase = filteredClients.length;
  const kpiEntradas = filteredClients.filter(c => c.status === 'Entradas').length;
  const kpiAutorizados = filteredClients.filter(c => c.status === 'Autorizados').length;
  const kpiRejeitados = filteredClients.filter(c => c.status === 'Rejeitados').length;
  const kpiOportunidades = filteredOpportunities.length;
  const kpiPrioritarios = filteredClients.filter(c => c.score >= 90).length;
  
  const totalScoreSum = filteredClients.reduce((sum, c) => sum + c.score, 0);
  const kpiScoreMedio = kpiBase > 0 ? (totalScoreSum / kpiBase).toFixed(1) : '0.0';
  
  const totalPotentialSum = filteredOpportunities.reduce((sum, o) => sum + o.valorPotencialEstimado, 0);
  const kpiPotencial = totalPotentialSum;

  // --- CHARTS CALCULATIONS ---
  // Chart 1: Distribuição por Estado
  const sortedEstados = useMemo(() => {
    const counts = filteredClients.reduce((acc, c) => {
      const st = String(c.state || '');
      if (st) acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, count]) => {
        const num = Number(count);
        return {
          name,
          count: num,
          percentage: kpiBase > 0 ? Math.round((num / kpiBase) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredClients, kpiBase]);

  // Chart 2: Distribuição por Regional
  const sortedRegionals = useMemo(() => {
    const counts = filteredClients.reduce((acc, c) => {
      const name = getRegionalName(c.regionalId);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, count]) => {
        const num = Number(count);
        return {
          name,
          count: num,
          percentage: kpiBase > 0 ? Math.round((num / kpiBase) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredClients, kpiBase, regionals]);

  // Chart 3: Distribuição por RCA
  const sortedRcas = useMemo(() => {
    const counts = filteredClients.reduce((acc, c) => {
      const name = getRcaName(c.rcaId);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, count]) => {
        const num = Number(count);
        return {
          name,
          count: num,
          percentage: kpiBase > 0 ? Math.round((num / kpiBase) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredClients, kpiBase, rcas]);

  // --- RANKINGS STRATEGIC COUNTERS (Leaderboards) ---
  // Ranking 1: Categorias mais encontradas
  const sortedCategories = useMemo(() => {
    const counts = filteredOpportunities.reduce((acc, o) => {
      if (o.categoria) {
        acc[o.categoria] = (acc[o.categoria] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const total = Object.keys(counts).reduce((acc, key) => acc + (counts[key] || 0), 0);
    return Object.entries(counts)
      .map(([name, count]) => {
        const num = Number(count);
        return {
          name,
          count: num,
          percentage: total > 0 ? Math.round((num / total) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOpportunities]);

  // Ranking 2: Produtos mais encontrados
  const sortedProducts = useMemo(() => {
    const counts = filteredOpportunities.reduce((acc, o) => {
      o.produtosEncontrados?.forEach((pe: any) => {
        acc[pe.produto] = (acc[pe.produto] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    const total = Object.keys(counts).reduce((acc, key) => acc + (counts[key] || 0), 0);
    return Object.entries(counts)
      .map(([name, count]) => {
        const num = Number(count);
        return {
          name,
          count: num,
          percentage: total > 0 ? Math.round((num / total) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOpportunities]);

  // Ranking 3: Marcas Concorrentes
  const sortedCompetitors = useMemo(() => {
    const counts = filteredOpportunities.reduce((acc, o) => {
      o.marcasConcorrentes?.forEach((mc: any) => {
        acc[mc.marca] = (acc[mc.marca] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    const total = Object.keys(counts).reduce((acc, key) => acc + (counts[key] || 0), 0);
    return Object.entries(counts)
      .map(([name, count]) => {
        const num = Number(count);
        return {
          name,
          count: num,
          percentage: total > 0 ? Math.round((num / total) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOpportunities]);

  // Ranking 4: Top Oportunidades por Score Comercial
  const tableTopOportunidades = useMemo(() => {
    return [...filteredOpportunities]
      .sort((a, b) => b.scoreComercial - a.scoreComercial)
      .slice(0, 5);
  }, [filteredOpportunities]);

  // --- NEW RANKINGS (COMMIT 1.2 REQUIREMENT) ---
  const rankingTopClientes = useMemo(() => {
    return [...filteredClients]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [filteredClients]);

  const rankingTopRcas = useMemo(() => {
    const counts = filteredClients.reduce((acc, c) => {
      const name = getRcaName(c.rcaId);
      const clientOpps = opportunities.filter(o => o.cliente.toLowerCase() === c.name.toLowerCase() || o.clientId?.toString() === c.id.toString());
      const potential = clientOpps.reduce((sum, o) => sum + o.valorPotencialEstimado, 0);
      if (!acc[name]) acc[name] = { count: 0, potential: 0 };
      acc[name].count += 1;
      acc[name].potential += potential;
      return acc;
    }, {} as Record<string, { count: number; potential: number }>);

    const totalPotential = Object.keys(counts).reduce((sum, key) => sum + counts[key].potential, 0);

    return Object.keys(counts)
      .map((name) => {
        const data = counts[name];
        return {
          name,
          count: data.count,
          potential: data.potential,
          percentage: totalPotential > 0 ? Math.round((data.potential / totalPotential) * 100) : 0
        };
      })
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 5);
  }, [filteredClients, opportunities, rcas]);

  const rankingMaiorPotencial = useMemo(() => {
    return [...filteredOpportunities]
      .sort((a, b) => b.valorPotencialEstimado - a.valorPotencialEstimado)
      .slice(0, 5);
  }, [filteredOpportunities]);

  // --- TABLES DATA SLICES ---
  const tableUltimosClientes = useMemo(() => {
    return [...filteredClients].reverse().slice(0, 5);
  }, [filteredClients]);

  const tableAguardandoAnalise = useMemo(() => {
    return filteredClients.filter(c => c.status === 'Entradas').slice(0, 5);
  }, [filteredClients]);

  const tableRejeitados = useMemo(() => {
    return filteredClients.filter(c => c.status === 'Rejeitados').slice(0, 5);
  }, [filteredClients]);

  // --- TABLES PAGINATED SLICES ---
  const paginatedAguardando = useMemo(() => {
    const list = filteredClients.filter(c => c.status === 'Entradas');
    const startIdx = (pageAguardando - 1) * ITEMS_PER_PAGE;
    return {
      items: list.slice(startIdx, startIdx + ITEMS_PER_PAGE),
      total: list.length,
      totalPages: Math.ceil(list.length / ITEMS_PER_PAGE) || 1
    };
  }, [filteredClients, pageAguardando]);

  const paginatedRejeitados = useMemo(() => {
    const list = filteredClients.filter(c => c.status === 'Rejeitados');
    const startIdx = (pageRejeitados - 1) * ITEMS_PER_PAGE;
    return {
      items: list.slice(startIdx, startIdx + ITEMS_PER_PAGE),
      total: list.length,
      totalPages: Math.ceil(list.length / ITEMS_PER_PAGE) || 1
    };
  }, [filteredClients, pageRejeitados]);

  const paginatedUltimos = useMemo(() => {
    const list = [...filteredClients].reverse();
    const startIdx = (pageUltimos - 1) * ITEMS_PER_PAGE;
    return {
      items: list.slice(startIdx, startIdx + ITEMS_PER_PAGE),
      total: list.length,
      totalPages: Math.ceil(list.length / ITEMS_PER_PAGE) || 1
    };
  }, [filteredClients, pageUltimos]);

  // Status Distribution memo
  const statusDistribution = useMemo(() => {
    const total = kpiBase;
    return [
      { name: 'Autorizados', count: kpiAutorizados, color: 'bg-emerald-600', percentage: total > 0 ? Math.round((kpiAutorizados / total) * 100) : 0 },
      { name: 'Entradas', count: kpiEntradas, color: 'bg-amber-500', percentage: total > 0 ? Math.round((kpiEntradas / total) * 100) : 0 },
      { name: 'Rejeitados', count: kpiRejeitados, color: 'bg-rose-500', percentage: total > 0 ? Math.round((kpiRejeitados / total) * 100) : 0 }
    ].sort((a, b) => b.count - a.count);
  }, [kpiBase, kpiAutorizados, kpiEntradas, kpiRejeitados]);

  // Opportunities by Period memo
  const opportunitiesByPeriod = useMemo(() => {
    const counts = filteredOpportunities.reduce((acc, o) => {
      const d = o.dataAnalise || '08/07/2026';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => {
        const dateA = parseDateString(a.date) || new Date();
        const dateB = parseDateString(b.date) || new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-5); // take latest 5 days of activity
  }, [filteredOpportunities]);

  // --- LIVE CHRONOLOGICAL LOGS (Últimas Movimentações) ---
  const ultimasMovimentacoes = useMemo(() => {
    const list: any[] = [];
    
    // Process client status logs
    clients.forEach(c => {
      if (c.lastUpload && c.lastUpload !== 'Sem cardápio submetido') {
        list.push({
          id: `act-upload-${c.id}`,
          clientName: c.name,
          title: 'Cardápio Recebido',
          description: `Cardápio "${c.lastUpload}" carregado pelo RCA ${getRcaName(c.rcaId)}.`,
          timeLabel: 'Hoje, ' + (c.lastUpload.includes('às') ? c.lastUpload.split('às')[1] : '10:45'),
          icon: <Download className="h-3.5 w-3.5 text-blue-800" />,
          colorClass: 'bg-blue-50 border-blue-100'
        });
      }
      if (c.lastAnalysis && c.lastAnalysis !== 'Aguardando envio') {
        list.push({
          id: `act-analysis-${c.id}`,
          clientName: c.name,
          title: 'IA Calibrada',
          description: `Score de fit recalibrado para ${c.score} pontos pelo motor Radar C-Trade.`,
          timeLabel: c.lastAnalysis.includes('Hoje') ? c.lastAnalysis : 'Há poucas horas',
          icon: <Sparkles className="h-3.5 w-3.5 text-purple-700" />,
          colorClass: 'bg-purple-50 border-purple-100'
        });
      }
      if (c.status === 'Rejeitados') {
        list.push({
          id: `act-reject-${c.id}`,
          clientName: c.name,
          title: 'Registro Rejeitado',
          description: `Motivo: "${c.rejectionReason || 'Falta de aderência de portfólio'}"`,
          timeLabel: '08/07/2026',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-700" />,
          colorClass: 'bg-rose-50 border-rose-100'
        });
      } else if (c.status === 'Autorizados') {
        list.push({
          id: `act-authorize-${c.id}`,
          clientName: c.name,
          title: 'Lead Autorizado',
          description: `Cliente movido para o pipeline como qualificado no segmento ${c.segment}.`,
          timeLabel: '08/07/2026',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />,
          colorClass: 'bg-emerald-50 border-emerald-100'
        });
      }
    });

    // Process opportunity history logs
    opportunities.forEach(o => {
      if (o.historico && Array.isArray(o.historico)) {
        o.historico.forEach((h: any, idx: number) => {
          list.push({
            id: `act-opp-hist-${o.id}-${idx}`,
            clientName: o.cliente,
            title: h.titulo || 'Mapeamento Comercial',
            description: h.descricao || `Oportunidade de ${o.categoria} mapeada com faturamento estimado.`,
            timeLabel: h.data || '08/07/2026',
            icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-700" />,
            colorClass: 'bg-indigo-50 border-indigo-100'
          });
        });
      }
    });

    // Filter to only display timeline events for currently filtered clients
    const filteredClientNames = new Set(filteredClients.map(c => c.name.toLowerCase()));
    
    // Sort logically and slice to latest 8 entries
    const finalTimeline = list
      .filter(item => filteredClientNames.has(item.clientName.toLowerCase()))
      .slice(0, 8);

    if (finalTimeline.length === 0) {
      return [
        {
          id: 'def-activity',
          clientName: 'Geral',
          title: 'Módulo Ativo',
          description: 'Todos os registros estão sincronizados. Ajuste os filtros operacionais para visualizar movimentações correspondentes.',
          timeLabel: 'Agora',
          icon: <Activity className="h-3.5 w-3.5 text-slate-500" />,
          colorClass: 'bg-slate-50 border-slate-200'
        }
      ];
    }
    return finalTimeline;
  }, [filteredClients, clients, opportunities, regionals, rcas]);

  // Chart Wrapper Component
  function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
      <Card className="w-full flex flex-col justify-between p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all duration-200">
        <div className="w-full">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5 mb-3.5">
            <span className="p-1 rounded-md bg-blue-50 text-blue-900 shrink-0">
              {icon}
            </span>
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className="space-y-3">
            {children}
          </div>
        </div>
      </Card>
    );
  }

  // Ranking Wrapper Component
  function RankingCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
      <Card className="w-full p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5 mb-3">
            <span className="p-1 rounded-md bg-purple-50 text-purple-900 shrink-0">
              {icon}
            </span>
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className="space-y-3">
            {children}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <PageContainer id="page-visao-geral-dashboard">
      <Breadcrumb items={[{ label: 'Visão Geral', active: true }]} />
      {/* Toast floating notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp pointer-events-none">
          <Toast
            message={toast.message}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header com Metadados e Ações */}
      <PageHeader
        title="Visão Geral"
        subtitle="Painel executivo da C-Trade"
        badge="Radar Ativo"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-right mr-1 hidden sm:block">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Status Operacional</span>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5 justify-end">
                <Clock className="h-3 w-3 text-slate-400" />
                Hoje às 11:15
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Settings className="h-3.5 w-3.5 text-blue-900" />}
              onClick={() => setIsManageModalOpen(true)}
            >
              Configurar RCAs
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCw className="h-3.5 w-3.5" />}
              onClick={handleRefresh}
            >
              Recalcular
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExport}
            >
              Exportar
            </Button>
          </div>
        }
      />

      {/* 1. RESUMO EXECUTIVO DO CONSOLIDADO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
        className="mb-6"
      >
        <Card className="p-5 border border-slate-200 bg-linear-to-r from-slate-50 to-white shadow-xs rounded-xl relative overflow-hidden">
          {/* Subtle design accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-900" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Inteligência Comercial
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5">
                Resumo Executivo do Diretor
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">Consolidado dinâmico da operação ativa de vendas da C-Trade.</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-250 px-3 py-1.5 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Última atualização: Hoje às 11:15</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-1 font-sans">
            <div className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-2xs transition-shadow">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Clientes na Base</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{kpiBase}</span>
              <span className="text-[8px] text-slate-500 font-semibold mt-0.5 block font-sans">Total de PDVs</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-2xs transition-shadow">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Entradas</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">{kpiEntradas}</span>
              <span className="text-[8px] text-slate-500 font-semibold mt-0.5 block font-sans">Aguardando curadoria</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-2xs transition-shadow">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Autorizados</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">{kpiAutorizados}</span>
              <span className="text-[8px] text-slate-500 font-semibold mt-0.5 block font-sans">Qualificados e ativos</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-2xs transition-shadow">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Rejeitados</span>
              <span className="text-xl font-black text-rose-500 mt-1 block">{kpiRejeitados}</span>
              <span className="text-[8px] text-slate-500 font-semibold mt-0.5 block font-sans">Sem fit comercial</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-2xs transition-shadow">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Oportunidades</span>
              <span className="text-xl font-black text-purple-600 mt-1 block">{kpiOportunidades}</span>
              <span className="text-[8px] text-slate-500 font-semibold mt-0.5 block font-sans">Pipeline ativo</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-2xs transition-shadow">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Potencial Comercial</span>
              <span className="text-xl font-black text-blue-950 mt-1 block">R$ {(kpiPotencial / 1000).toFixed(0)}k/mês</span>
              <span className="text-[8px] text-slate-500 font-semibold mt-0.5 block font-sans">Volume financeiro</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 2. PAINEL OPERACIONAL DE FILTROS E CLASSIFICAÇÃO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
      </motion.div>

      {/* 3. KPIs INDICADORES PADRONIZADOS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Clientes na Base"
            value={kpiBase}
            icon={<Building2 className="h-5 w-5 text-blue-950" />}
            comparisonText="Total de estabelecimentos"
            trend={{ value: 'Total Base', type: 'neutral' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Entradas"
            value={kpiEntradas}
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            comparisonText="Aguardando curadoria"
            trend={{ value: 'Cardápios', type: 'neutral' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Autorizados"
            value={kpiAutorizados}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            comparisonText="Leads homologados"
            trend={{ value: 'Qualificados', type: 'up' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Rejeitados"
            value={kpiRejeitados}
            icon={<AlertTriangle className="h-5 w-5 text-rose-500" />}
            comparisonText="Sem fit comercial"
            trend={{ value: 'Descartados', type: 'down' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Oportunidades"
            value={kpiOportunidades}
            icon={<Zap className="h-5 w-5 text-purple-600" />}
            comparisonText="Pipeline comercial"
            trend={{ value: 'Cruza Ativo', type: 'up' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Clientes Prioritários"
            value={kpiPrioritarios}
            icon={<Award className="h-5 w-5 text-indigo-600" />}
            comparisonText="Filtro de Score ≥ 90"
            trend={{ value: 'Foco Alta Fit', type: 'up' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Score de Fit"
            value={`${kpiScoreMedio} pts`}
            icon={<TrendingUp className="h-5 w-5 text-sky-600" />}
            comparisonText="Média ponderada geral"
            trend={{ value: 'Índice Geral', type: 'neutral' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />

          <MetricCard
            title="Potencial Comercial"
            value={`R$ ${(kpiPotencial / 1000).toFixed(0)}k/m`}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            comparisonText="Volume estimado adicional"
            trend={{ value: `R$ ${(kpiPotencial * 12 / 1000).toFixed(0)}k/ano`, type: 'up' }}
            className="min-h-[140px] p-4.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-shadow duration-200"
          />
        </div>
      </motion.div>

      {/* 4. GRÁFICOS DE DISTRIBUIÇÃO OPERACIONAL */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.11 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6"
      >
        {/* Distribuição por Estado */}
        <ChartCard title="Distribuição por Estado" icon={<Globe className="h-3.5 w-3.5 text-blue-900" />}>
          <div className="space-y-3 pt-1">
            {sortedEstados.slice(0, 5).map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{item.name}</span>
                  <span>{item.count} ({item.percentage}%)</span>
                </div>
                <ProgressBar value={item.percentage} colorClass="bg-blue-900" />
              </div>
            ))}
            {sortedEstados.length === 0 && (
              <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Nenhum registro encontrado</p>
            )}
          </div>
        </ChartCard>

        {/* Status dos Clientes */}
        <ChartCard title="Status de Processamento" icon={<Briefcase className="h-3.5 w-3.5 text-emerald-600" />}>
          <div className="space-y-3 pt-1">
            {statusDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.name}
                  </span>
                  <span>{item.count} ({item.percentage}%)</span>
                </div>
                <ProgressBar value={item.percentage} colorClass={item.color} />
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Oportunidades por Período */}
        <ChartCard title="Oportunidades por Período" icon={<Calendar className="h-3.5 w-3.5 text-indigo-600" />}>
          <div className="space-y-3 pt-1">
            {opportunitiesByPeriod.map((item) => (
              <div key={item.date} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{item.date}</span>
                  <span>{item.count} {item.count === 1 ? 'oportunidade' : 'oportunidades'}</span>
                </div>
                <ProgressBar value={Math.min(100, (item.count / 10) * 100)} colorClass="bg-indigo-600" />
              </div>
            ))}
            {opportunitiesByPeriod.length === 0 && (
              <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Sem dados de análise no período</p>
            )}
          </div>
        </ChartCard>

        {/* Categorias Mais Encontradas */}
        <ChartCard title="Categorias mais encontradas" icon={<Tag className="h-3.5 w-3.5 text-purple-700" />}>
          <div className="space-y-3 pt-1">
            {sortedCategories.slice(0, 5).map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span>{item.count}m ({item.percentage}%)</span>
                </div>
                <ProgressBar value={item.percentage} colorClass="bg-purple-600" />
              </div>
            ))}
            {sortedCategories.length === 0 && (
              <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Sem dados de categorias</p>
            )}
          </div>
        </ChartCard>

        {/* Produtos Mais Encontrados */}
        <ChartCard title="Produtos mais recomendados" icon={<Layers className="h-3.5 w-3.5 text-sky-600" />}>
          <div className="space-y-3 pt-1">
            {sortedProducts.slice(0, 5).map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span>{item.count}m ({item.percentage}%)</span>
                </div>
                <ProgressBar value={item.percentage} colorClass="bg-sky-500" />
              </div>
            ))}
            {sortedProducts.length === 0 && (
              <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Nenhum produto detectado</p>
            )}
          </div>
        </ChartCard>
      </motion.div>

      {/* 5. SEÇÃO EXCLUSIVA DE RANKINGS E LEADERBOARDS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-purple-800" />
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Rankings de Alta Performance</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Os destaques operacionais em tempo real com base nos filtros vigentes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Top Clientes */}
          <RankingCard title="Top Clientes" icon={<Users className="h-3.5 w-3.5 text-blue-900" />}>
            <div className="space-y-2.5 pt-1">
              {rankingTopClientes.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between p-1.5 rounded-lg border border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <span className="text-[10px] font-black text-slate-800 truncate flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-900 text-[8px] flex items-center justify-center font-black shrink-0">{idx + 1}</span>
                      {c.fantasyName || c.name}
                    </span>
                    <span className="text-[8px] text-slate-400 font-semibold pl-5">{c.city} ({c.state})</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-1 rounded-sm bg-blue-50 border border-blue-100 text-[8px] font-black text-blue-700 font-mono">{c.score} pts</span>
                  </div>
                </div>
              ))}
              {rankingTopClientes.length === 0 && (
                <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Sem dados de clientes</p>
              )}
            </div>
          </RankingCard>

          {/* Top Categorias */}
          <RankingCard title="Top Categorias" icon={<Tag className="h-3.5 w-3.5 text-purple-700" />}>
            <div className="space-y-3 pt-1">
              {sortedCategories.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-600 items-center">
                    <span className="truncate max-w-[120px] flex items-center gap-1 font-sans">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-800 text-[8px] flex items-center justify-center font-black shrink-0">{index + 1}º</span>
                      {item.name}
                    </span>
                    <span className="font-mono">{item.count}m</span>
                  </div>
                  <ProgressBar value={item.percentage} colorClass="bg-purple-600" />
                </div>
              ))}
              {sortedCategories.length === 0 && (
                <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Sem dados de categorias</p>
              )}
            </div>
          </RankingCard>

          {/* Top Produtos */}
          <RankingCard title="Top SKUs" icon={<Layers className="h-3.5 w-3.5 text-sky-600" />}>
            <div className="space-y-3 pt-1">
              {sortedProducts.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-600 items-center">
                    <span className="truncate max-w-[120px] flex items-center gap-1 font-sans">
                      <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 text-[8px] flex items-center justify-center font-black shrink-0">{index + 1}º</span>
                      {item.name}
                    </span>
                    <span className="font-mono">{item.count}m</span>
                  </div>
                  <ProgressBar value={item.percentage} colorClass="bg-sky-500" />
                </div>
              ))}
              {sortedProducts.length === 0 && (
                <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Nenhum SKU detectado</p>
              )}
            </div>
          </RankingCard>

          {/* Top RCAs (by revenue potential representation) */}
          <RankingCard title="Top RCAs (Potencial)" icon={<Briefcase className="h-3.5 w-3.5 text-emerald-600" />}>
            <div className="space-y-3 pt-1 font-sans">
              {rankingTopRcas.map((item, index) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-600 items-center">
                    <span className="truncate max-w-[110px] flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[8px] flex items-center justify-center font-black shrink-0">{index + 1}º</span>
                      {item.name.replace('RCA ', '')}
                    </span>
                    <span className="font-mono">R$ {(item.potential / 1000).toFixed(0)}k</span>
                  </div>
                  <ProgressBar value={item.percentage} colorClass="bg-emerald-600" />
                </div>
              ))}
              {rankingTopRcas.length === 0 && (
                <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Sem dados de RCAs</p>
              )}
            </div>
          </RankingCard>

          {/* Maior Potencial Comercial */}
          <RankingCard title="Potencial Lead" icon={<DollarSign className="h-3.5 w-3.5 text-indigo-700" />}>
            <div className="space-y-2.5 pt-1">
              {rankingMaiorPotencial.map((o, idx) => (
                <div key={o.id} className="flex items-center justify-between p-1.5 rounded-lg border border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <span className="text-[10px] font-black text-slate-800 truncate flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[8px] flex items-center justify-center font-black shrink-0">{idx + 1}</span>
                      {o.cliente}
                    </span>
                    <span className="text-[8px] text-slate-400 font-semibold pl-5">{o.cidade} ({o.estado})</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] font-black text-slate-900 font-mono">R$ {(o.valorPotencialEstimado / 1000).toFixed(1)}k</span>
                    <span className="inline-block px-1 rounded-sm bg-indigo-50 border border-indigo-100 text-[8px] font-black text-indigo-700 mt-0.5">{o.scoreComercial} pts</span>
                  </div>
                </div>
              ))}
              {rankingMaiorPotencial.length === 0 && (
                <p className="text-[11px] text-slate-400 py-4 text-center font-medium">Sem leads com score ativo</p>
              )}
            </div>
          </RankingCard>
        </div>
      </motion.div>

      {/* 6. TABELAS DE DADOS OPERACIONAL (PAGINADAS) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.17 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
      >
        {/* Tabela 1: Clientes aguardando análise */}
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-amber-500 animate-pulse" />
                Clientes Aguardando Análise
              </span>
              <Badge variant="warning">{paginatedAguardando.total} entradas</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Estabelecimento</th>
                    <th className="py-2.5 px-2 text-center">Estado</th>
                    <th className="py-2.5 px-2">RCA / Regional</th>
                    <th className="py-2.5 px-2 text-center">Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {paginatedAguardando.items.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800 truncate max-w-[110px]">
                        {c.fantasyName || c.name}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-500">{c.state}</td>
                      <td className="py-2.5 px-2 truncate max-w-[100px]">
                        <div className="flex flex-col text-[9px] leading-tight">
                          <span>{getRcaName(c.rcaId).replace('RCA ', '')}</span>
                          <span className="text-slate-400 font-semibold">{getRegionalName(c.regionalId)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[9px] border border-amber-100 font-bold">
                          {c.score} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedAguardando.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                        Nenhum registro pendente de análise.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 1 Pagination footer */}
          {paginatedAguardando.totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold">
                Pág. {pageAguardando} de {paginatedAguardando.totalPages} ({paginatedAguardando.total} itens)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pageAguardando === 1}
                  onClick={() => setPageAguardando(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded-md border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={pageAguardando === paginatedAguardando.totalPages}
                  onClick={() => setPageAguardando(prev => Math.min(paginatedAguardando.totalPages, prev + 1))}
                  className="p-1 rounded-md border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabela 2: Clientes rejeitados */}
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-rose-500" />
                Clientes Rejeitados
              </span>
              <Badge variant="danger">{paginatedRejeitados.total} rejeitados</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Estabelecimento</th>
                    <th className="py-2.5 px-3">Motivo da Rejeição</th>
                    <th className="py-2.5 px-3 text-right">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {paginatedRejeitados.items.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800 truncate max-w-[110px]">
                        {c.fantasyName || c.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[140px] truncate">
                        <span className="bg-rose-50/50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-100/50 text-[9px] leading-tight font-semibold">
                          {c.rejectionReason || 'Fora de área / Sem Fit'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-bold truncate max-w-[90px]">
                        {getRcaName(c.rcaId).replace('RCA ', '')}
                      </td>
                    </tr>
                  ))}
                  {paginatedRejeitados.items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                        Nenhum cliente rejeitado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2 Pagination footer */}
          {paginatedRejeitados.totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold">
                Pág. {pageRejeitados} de {paginatedRejeitados.totalPages} ({paginatedRejeitados.total} itens)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pageRejeitados === 1}
                  onClick={() => setPageRejeitados(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded-md border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={pageRejeitados === paginatedRejeitados.totalPages}
                  onClick={() => setPageRejeitados(prev => Math.min(paginatedRejeitados.totalPages, prev + 1))}
                  className="p-1 rounded-md border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabela 3: Últimos clientes adicionados */}
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-blue-900" />
                Últimos Clientes Adicionados
              </span>
              <Badge variant="info">{paginatedUltimos.total} na base</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Estabelecimento</th>
                    <th className="py-2.5 px-2 text-center">Estado</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Categoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {paginatedUltimos.items.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800 truncate max-w-[120px]">
                        {c.fantasyName || c.name}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-500">{c.state}</td>
                      <td className="py-2.5 px-2 text-center">
                        <Badge variant={c.status === 'Autorizados' ? 'success' : c.status === 'Entradas' ? 'warning' : 'danger'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-indigo-700 font-sans truncate max-w-[95px]">{c.category}</td>
                    </tr>
                  ))}
                  {paginatedUltimos.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                        Nenhum cliente disponível na base.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3 Pagination footer */}
          {paginatedUltimos.totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold">
                Pág. {pageUltimos} de {paginatedUltimos.totalPages} ({paginatedUltimos.total} itens)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pageUltimos === 1}
                  onClick={() => setPageUltimos(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded-md border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={pageUltimos === paginatedUltimos.totalPages}
                  onClick={() => setPageUltimos(prev => Math.min(paginatedUltimos.totalPages, prev + 1))}
                  className="p-1 rounded-md border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 7. ÚLTIMAS MOVIMENTAÇÕES (Activity Timeline Log) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="mb-6"
      >
        <Card className="p-5 border border-slate-100 shadow-sm bg-white rounded-xl">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4.5">
            <Activity className="h-4.5 w-4.5 text-blue-900 shrink-0" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Últimas Movimentações Operacionais
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Atividades e eventos em tempo real associados aos estabelecimentos filtrados.</p>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-100 space-y-4 font-sans text-xs">
            {ultimasMovimentacoes.map((item) => (
              <div key={item.id} className="relative">
                {/* Timeline node icon */}
                <span className={`absolute -left-[35px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-2xs ${item.colorClass}`}>
                  {item.icon}
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-slate-50/45 border border-slate-100 rounded-lg p-3 hover:shadow-2xs transition-shadow">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-800 leading-none">{item.title}</span>
                      <span className="text-[9px] font-black text-blue-900 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm">{item.clientName}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{item.description}</p>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 shrink-0 font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-300" />
                    {item.timeLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* MODAL DE GERENCIAMENTO DE REGIONAIS E RCAs */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Gerenciador Operacional de Regionais & RCAs"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
          
          {/* SEÇÃO REGIONAIS */}
          <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Regionais</h4>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {regionals.length} cadastradas
              </span>
            </div>

            {/* Form Adicionar/Editar Regional */}
            <div className="bg-slate-50 p-3 rounded-lg space-y-3 border border-slate-100">
              <span className="font-bold text-slate-700 block">
                {editingRegionalId ? 'Editar Regional' : 'Nova Regional'}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da Regional (Ex: Regional Sul)"
                  value={newRegionalName}
                  onChange={(e) => setNewRegionalName(e.target.value)}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!newRegionalName.trim()) return;
                    if (editingRegionalId) {
                      setRegionals(prev => prev.map(r => r.id === editingRegionalId ? { ...r, name: newRegionalName.trim() } : r));
                      triggerToast('success', 'Regional Atualizada', 'Nome da Regional alterado com sucesso.');
                      setEditingRegionalId(null);
                    } else {
                      const newReg = {
                        id: 'reg-' + Date.now(),
                        name: newRegionalName.trim(),
                        active: true
                      };
                      setRegionals(prev => [...prev, newReg]);
                      triggerToast('success', 'Regional Criada', 'Nova Regional cadastrada para filtros.');
                    }
                    setNewRegionalName('');
                  }}
                >
                  {editingRegionalId ? 'Salvar' : 'Adicionar'}
                </Button>
                {editingRegionalId && (
                  <button
                    onClick={() => {
                      setEditingRegionalId(null);
                      setNewRegionalName('');
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* List of Regionals */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {regionals.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-150 shadow-2xs">
                  <span className={`font-bold ${r.active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                    {r.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRegionals(prev => prev.map(item => item.id === r.id ? { ...item, active: !item.active } : item));
                        triggerToast('info', 'Status Alterado', `Regional "${r.name}" foi ${r.active ? 'desativada' : 'ativada'}.`);
                      }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${r.active ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {r.active ? 'Ativa' : 'Inativa'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingRegionalId(r.id);
                        setNewRegionalName(r.name);
                      }}
                      className="text-slate-500 hover:text-blue-700 font-bold text-[10px]"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setRegionals(prev => prev.filter(item => item.id !== r.id));
                        triggerToast('warning', 'Regional Removida', `A regional "${r.name}" foi excluída.`);
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEÇÃO RCAs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">RCAs (Representantes)</h4>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {rcas.length} cadastrados
              </span>
            </div>

            {/* Form Adicionar/Editar RCA */}
            <div className="bg-slate-50 p-3 rounded-lg space-y-3 border border-slate-100">
              <span className="font-bold text-slate-700 block">
                {editingRcaId ? 'Editar RCA' : 'Novo RCA'}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do RCA (Ex: Giovanni Rossi)"
                  value={newRcaName}
                  onChange={(e) => setNewRcaName(e.target.value)}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!newRcaName.trim()) return;
                    if (editingRcaId) {
                      setRcas(prev => prev.map(r => r.id === editingRcaId ? { ...r, name: newRcaName.trim() } : r));
                      triggerToast('success', 'RCA Atualizado', 'Nome do RCA alterado com sucesso.');
                      setEditingRcaId(null);
                    } else {
                      const newRcaObj = {
                        id: 'rca-' + Date.now(),
                        name: newRcaName.trim(),
                        active: true
                      };
                      setRcas(prev => [...prev, newRcaObj]);
                      triggerToast('success', 'RCA Criado', 'Novo RCA cadastrado para filtros.');
                    }
                    setNewRcaName('');
                  }}
                >
                  {editingRcaId ? 'Salvar' : 'Adicionar'}
                </Button>
                {editingRcaId && (
                  <button
                    onClick={() => {
                      setEditingRcaId(null);
                      setNewRcaName('');
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* List of RCAs */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {rcas.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-150 shadow-2xs">
                  <span className={`font-bold ${r.active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                    {r.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRcas(prev => prev.map(item => item.id === r.id ? { ...item, active: !item.active } : item));
                        triggerToast('info', 'Status Alterado', `RCA "${r.name}" foi ${r.active ? 'desativado' : 'ativado'}.`);
                      }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${r.active ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {r.active ? 'Ativo' : 'Inativo'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingRcaId(r.id);
                        setNewRcaName(r.name);
                      }}
                      className="text-slate-500 hover:text-blue-700 font-bold text-[10px]"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setRcas(prev => prev.filter(item => item.id !== r.id));
                        triggerToast('warning', 'RCA Removido', `O RCA "${r.name}" foi excluído.`);
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Modal>
    </PageContainer>
  );
}
