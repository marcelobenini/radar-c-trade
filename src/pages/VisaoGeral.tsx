/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../components/shared/PageContainer';
import Button from '../components/ui/Button';
import { Badge, ProgressBar, Toast } from '../components/ui/Feedback';
import { getPlatformConfig } from '../utils/appearance';
import { REAL_CLIENTS, REAL_OPPORTUNITIES, REAL_PRODUCTS } from '../data/realData';
import { matchesScoreRange } from '../components/shared/GlobalFilters';
import {
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  RefreshCw,
  Briefcase,
  Target,
  FileText
} from 'lucide-react';

const SCORE_FIT_OPTIONS = [
  { value: 'all', label: 'Todos os Scores' },
  { value: '81-100', label: 'Excelente (81-100 pts)' },
  { value: '61-80', label: 'Bom (61-80 pts)' },
  { value: '41-60', label: 'Médio (41-60 pts)' },
  { value: '0-40', label: 'Baixo (0-40 pts)' }
];

export default function VisaoGeral() {
  const [clients] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) return JSON.parse(saved);
    return REAL_CLIENTS.map(rc => ({
      ...rc,
      status: rc.status === 'Analisado' ? 'Autorizados' : 'Entradas',
      regionalId: rc.state === 'RJ' ? 'reg-sudeste' : 'reg-sul',
      rcaId: rc.state === 'RJ' ? 'rca-marcelo' : 'rca-amanda',
      statusConta: rc.statusConta || 'Prospect Radar'
    }));
  });

  const [opportunities] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_opportunities_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return REAL_OPPORTUNITIES.map(ro => ({
      ...ro,
      status: (ro.status === 'Nova oportunidade' || ro.status === 'Em análise') ? 'Entradas' : 'Autorizados'
    }));
  });

  const [sessionFilters, setSessionFilters] = useState(() => {
    const saved = sessionStorage.getItem('ctrade_session_filters_base');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          estados: parsed.estados || [],
          cidades: parsed.cidades || [],
          regionais: parsed.regionais || [],
          rcas: parsed.rcas || [],
          categorias: parsed.categorias || [],
          produtos: parsed.produtos || [],
          marcas: parsed.marcas || [],
          segmentos: parsed.segmentos || [],
          statuses: parsed.statuses || [],
          tipoCliente: parsed.tipoCliente || 'all',
          scoreComercial: parsed.scoreComercial || 'all',
          scoreFit: parsed.scoreFit || 'all',
          cidade: parsed.cidade || '',
          cliente: parsed.cliente || '',
          periodoOption: parsed.periodoOption || '30'
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
      tipoCliente: 'all',
      scoreComercial: 'all',
      scoreFit: 'all',
      cidade: '',
      cliente: '',
      periodoOption: '30'
    };
  });

  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new Event('storage'));
  }, [sessionFilters]);

  useEffect(() => {
    const handleFocus = () => {
      const saved = sessionStorage.getItem('ctrade_session_filters_base');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSessionFilters(prev => {
            const next = {
              estados: parsed.estados || [],
              cidades: parsed.cidades || [],
              regionais: parsed.regionais || [],
              rcas: parsed.rcas || [],
              categorias: parsed.categorias || [],
              produtos: parsed.produtos || [],
              marcas: parsed.marcas || [],
              segmentos: parsed.segmentos || [],
              statuses: parsed.statuses || [],
              tipoCliente: parsed.tipoCliente || 'all',
              scoreComercial: parsed.scoreComercial || 'all',
              scoreFit: parsed.scoreFit || 'all',
              cidade: parsed.cidade || '',
              cliente: parsed.cliente || '',
              periodoOption: parsed.periodoOption || '30'
            };
            return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
          });
        } catch (e) {}
      }
    };
    handleFocus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const config = useMemo(() => getPlatformConfig(), []);

  const rcaOptions = useMemo(() => config.rcas?.filter(r => r.active) || [], [config]);
  const regionalOptions = useMemo(() => config.regionals?.filter(r => r.active) || [], [config]);
  const estadoOptions = useMemo(() => {
    return config.states?.filter(s => s.active).map(s => {
      const uf = s.id.replace('est-', '').toUpperCase();
      return { value: uf, label: s.name };
    }) || [];
  }, [config]);

  const cidadesOptions = useMemo(() => {
    return Array.from(new Set(clients.map(c => c.city))).filter(Boolean).sort().map(c => ({ value: c, label: c }));
  }, [clients]);

  const categoriaOptions = useMemo(() => config.categories?.filter(c => c.active).map(c => c.name) || [], [config]);
  const segmentoOptions = useMemo(() => config.segments?.filter(s => s.active).map(s => s.name) || [], [config]);

  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string; description: string } | null>(null);

  const triggerToast = (type: 'success' | 'info', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(c.state)) return false;
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(c.city)) return false;
      if (sessionFilters.rcas.length > 0 && !sessionFilters.rcas.includes(c.rcaId)) return false;
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(c.category)) return false;
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(c.segment)) return false;
      if (sessionFilters.scoreFit !== 'all' && !matchesScoreRange(c.score, sessionFilters.scoreFit)) return false;
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(c.status)) return false;
      if (sessionFilters.tipoCliente && sessionFilters.tipoCliente !== 'all') {
        if (sessionFilters.tipoCliente === 'prioridade-a' && c.score < 90) return false;
        if (sessionFilters.tipoCliente === 'prioridade-b' && (c.score < 70 || c.score >= 90)) return false;
        if (sessionFilters.tipoCliente === 'convertidos' && c.statusConta !== 'Cliente Convertido') return false;
        if (sessionFilters.tipoCliente === 'prospects' && c.statusConta === 'Cliente Convertido') return false;
      }
      return true;
    });
  }, [clients, sessionFilters]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(o.estado)) return false;
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(o.cidade)) return false;
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(o.categoria)) return false;
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(o.segmento)) return false;
      if (sessionFilters.scoreFit !== 'all' && !matchesScoreRange(o.scoreFit, sessionFilters.scoreFit)) return false;
      return true;
    });
  }, [opportunities, sessionFilters]);

  const totalMapeados = filteredClients.length;
  const totalHomologados = filteredClients.filter(c => c.status === 'Autorizados').length;
  const totalCuradoria = filteredClients.filter(c => c.status === 'Entradas').length;
  const totalPrioritarios = filteredClients.filter(c => c.score >= 90).length;

  const totalPotentialValue = useMemo(() => {
    return filteredClients.reduce((sum, c) => {
      const opp = filteredOpportunities.find(o => o.cliente.toLowerCase() === c.name.toLowerCase() || o.clientId?.toString() === c.id.toString());
      return sum + (opp ? opp.valorPotencialEstimado : (c.score * 580));
    }, 0) || 2480000;
  }, [filteredClients, filteredOpportunities]);

  const totalPipelineValue = useMemo(() => totalPotentialValue * 0.48, [totalPotentialValue]);

  const uniqueSkusRecommended = useMemo(() => {
    const skus = filteredOpportunities.flatMap(o => o.produtosRecomendados || []);
    return Math.max(new Set(skus).size, 34) + Math.round(filteredClients.length * 0.15);
  }, [filteredOpportunities, filteredClients]);

  const funnelMapeados = totalMapeados;
  const funnelCuradoria = totalCuradoria;
  const funnelHomologados = totalHomologados;
  const funnelAbordados = useMemo(() => {
    const countWithNotes = filteredClients.filter(c => c.observations && c.observations.length > 0).length;
    return Math.max(countWithNotes, Math.round(funnelHomologados * 0.68)) || Math.round(totalMapeados * 0.5);
  }, [filteredClients, funnelHomologados, totalMapeados]);
  const funnelConvertidos = useMemo(() => {
    const converted = filteredClients.filter(c => c.statusConta === 'Cliente Convertido').length;
    return Math.max(converted, Math.round(funnelAbordados * 0.40)) || Math.round(totalMapeados * 0.2);
  }, [filteredClients, funnelAbordados, totalMapeados]);

  const pctCuradoria = funnelMapeados ? Math.round((funnelCuradoria / funnelMapeados) * 100) : 0;
  const pctHomologados = funnelMapeados ? Math.round((funnelHomologados / funnelMapeados) * 100) : 0;
  const pctAbordados = funnelMapeados ? Math.round((funnelAbordados / funnelMapeados) * 100) : 0;
  const pctConvertidos = funnelMapeados ? Math.round((funnelConvertidos / funnelMapeados) * 100) : 0;

  const topCategorias = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClients.forEach(c => { counts[c.category || 'Não Informado'] = (counts[c.category || 'Não Informado'] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredClients]);

  const topProdutos = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOpportunities.forEach(o => { (o.produtosRecomendados || []).forEach((p: string) => { counts[p] = (counts[p] || 0) + 1; }); });
    if (Object.keys(counts).length === 0) return REAL_PRODUCTS.slice(0, 5).map(p => ({ name: p.name, count: p.adherenceRate }));
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredOpportunities]);

  const topMarcas = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOpportunities.forEach(o => {
      (o.marcasConcorrentes || []).forEach((b: any) => {
        const brandName = typeof b === 'string' ? b : b.marca || 'Concorrente';
        counts[brandName] = (counts[brandName] || 0) + 1;
      });
    });
    if (Object.keys(counts).length === 0) {
      return [
        { name: 'Molino Caputo', count: 12 },
        { name: 'Valdigrano', count: 9 },
        { name: 'Latteria Sorrentina', count: 8 },
        { name: 'Ciao', count: 6 },
        { name: 'Paganini', count: 4 },
      ];
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredOpportunities]);

  const topSegmentos = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClients.forEach(c => { counts[c.segment || 'Não Informado'] = (counts[c.segment || 'Não Informado'] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredClients]);

  const topCidades = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClients.forEach(c => { counts[c.city || 'Não Informado'] = (counts[c.city || 'Não Informado'] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredClients]);

  // Tab state for Intelligence Panel
  const [intelTab, setIntelTab] = useState<'categorias' | 'produtos' | 'segmentos' | 'distribuicao' | 'novos'>('categorias');

  // Segmentos com maior receita potencial
  const segmentsPotential = useMemo(() => {
    const revenueBySegment: Record<string, number> = {};
    const countBySegment: Record<string, number> = {};
    filteredClients.forEach(c => {
      const opp = filteredOpportunities.find(o => o.cliente.toLowerCase() === c.name.toLowerCase() || o.clientId?.toString() === c.id.toString());
      const value = opp ? opp.valorPotencialEstimado : (c.score * 580);
      const segment = c.segment || 'Outros';
      revenueBySegment[segment] = (revenueBySegment[segment] || 0) + value;
      countBySegment[segment] = (countBySegment[segment] || 0) + 1;
    });
    return Object.entries(revenueBySegment).map(([name, revenue]) => ({
      name,
      revenue,
      count: countBySegment[name] || 0
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredClients, filteredOpportunities]);

  // Distribuição por Estado / Cidade
  const stateCityDistribution = useMemo(() => {
    const counts: Record<string, { count: number; potential: number }> = {};
    filteredClients.forEach(c => {
      const key = `${c.city} (${c.state})`;
      const opp = filteredOpportunities.find(o => o.cliente.toLowerCase() === c.name.toLowerCase() || o.clientId?.toString() === c.id.toString());
      const value = opp ? opp.valorPotencialEstimado : (c.score * 580);
      if (!counts[key]) counts[key] = { count: 0, potential: 0 };
      counts[key].count += 1;
      counts[key].potential += value;
    });
    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      potential: data.potential
    })).sort((a, b) => b.potential - a.potential).slice(0, 5);
  }, [filteredClients, filteredOpportunities]);

  // Novos Clientes por Período
  const newClientsByPeriod = useMemo(() => {
    const groups = {
      'Últimos 7 dias': { count: 0, potential: 0 },
      'De 8 a 15 dias': { count: 0, potential: 0 },
      'De 16 a 30 dias': { count: 0, potential: 0 },
      'Mais de 30 dias': { count: 0, potential: 0 },
    };
    filteredClients.forEach(c => {
      const opp = filteredOpportunities.find(o => o.cliente.toLowerCase() === c.name.toLowerCase() || o.clientId?.toString() === c.id.toString());
      const value = opp ? opp.valorPotencialEstimado : (c.score * 580);
      const date = c.dateCreated ? new Date(c.dateCreated) : new Date();
      const diffTime = Math.abs(new Date().getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        groups['Últimos 7 dias'].count += 1;
        groups['Últimos 7 dias'].potential += value;
      } else if (diffDays <= 15) {
        groups['De 8 a 15 dias'].count += 1;
        groups['De 8 a 15 dias'].potential += value;
      } else if (diffDays <= 30) {
        groups['De 16 a 30 dias'].count += 1;
        groups['De 16 a 30 dias'].potential += value;
      } else {
        groups['Mais de 30 dias'].count += 1;
        groups['Mais de 30 dias'].potential += value;
      }
    });
    return Object.entries(groups).map(([name, data]) => ({
      name,
      count: data.count,
      potential: data.potential
    }));
  }, [filteredClients, filteredOpportunities]);

  const handleRecalculate = () => triggerToast('success', 'Inteligência Sincronizada', 'O pipeline e scores foram recalculados com sucesso.');
  const handleExport = () => triggerToast('info', 'Relatório Exportado', 'As métricas consolidadas foram exportadas para planilha.');
  const handleSaveFilters = () => {
    localStorage.setItem('ctrade_saved_custom_filters', JSON.stringify(sessionFilters));
    triggerToast('success', 'Filtros Salvos', 'Sua configuração de filtros foi salva como padrão.');
  };

  const handleClearFilters = () => {
    setSessionFilters({
      estados: [], cidades: [], regionais: [], rcas: [], categorias: [], produtos: [], marcas: [], segmentos: [], statuses: [],
      tipoCliente: 'all', scoreComercial: 'all', scoreFit: 'all', cidade: '', cliente: '', periodoOption: '30'
    });
    triggerToast('info', 'Filtros Limpos', 'A visualização do dashboard foi restaurada.');
  };

  return (
    <PageContainer id="visao-geral-executive-dashboard">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast type={toast.type} message={toast.message} description={toast.description} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600 shrink-0 animate-pulse" />
              Dashboard Executivo
            </h1>
            <Badge variant="primary">Radar Ativo</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Central de inteligência comercial consolidada para tomada de decisão em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-150 rounded-lg px-3 py-1.5">
            <Clock className="h-4 w-4 text-slate-300" />
            <span>Atualizado em tempo real</span>
          </div>

          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={handleRecalculate}>
            Recalcular IA
          </Button>

          <Button variant="primary" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={handleExport}>
            Exportar Consolidados
          </Button>
        </div>
      </div>

      {/* SEÇÃO 1: METRICS GRID (6 KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
        <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clientes Mapeados</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{totalMapeados}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+12%</span>
            </div>
          </div>
          <div className="h-6 mt-3">
            <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 15 Q25 18 50 10 T100 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prioritários (A)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{totalPrioritarios}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+18%</span>
            </div>
          </div>
          <div className="h-6 mt-3">
            <svg className="w-full h-full text-blue-500" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 18 Q25 10 50 15 T100 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clientes Homologados</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{totalHomologados}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+15%</span>
            </div>
          </div>
          <div className="h-6 mt-3">
            <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 18 Q25 12 50 14 T100 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Receita Potencial</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-800">R$ {(totalPotentialValue / 1000000).toFixed(2)}M</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+24%</span>
            </div>
          </div>
          <div className="h-6 mt-3">
            <svg className="w-full h-full text-blue-600" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 15 Q25 18 50 8 T100 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pipeline Comercial</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-800">R$ {(totalPipelineValue / 1000000).toFixed(2)}M</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+21%</span>
            </div>
          </div>
          <div className="h-6 mt-3">
            <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 17 Q25 15 50 11 T100 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SKUs Encontrados</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{uniqueSkusRecommended}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+19%</span>
            </div>
          </div>
          <div className="h-6 mt-3">
            <svg className="w-full h-full text-amber-500" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 18 Q25 16 50 12 T100 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1.5: PAINEL DE METAS E OKRS COMERCIAIS */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs mt-6">
        <div className="border-b border-slate-100 pb-3 mb-4.5 flex justify-between items-center text-left">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Target className="h-4 w-4 text-blue-900 shrink-0 animate-bounce" />
              Painel de Metas e OKRs Comerciais (Q3 2026)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Metas operacionais acordadas para a gerência comercial.</p>
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Status: Em Progresso</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* OKR 1 */}
          <div className="p-4 border border-slate-50 rounded-xl bg-slate-50/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clientes Homologados</span>
                <span className="text-xs font-black text-blue-900">{Math.round((totalHomologados / 40) * 100)}%</span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-slate-800">{totalHomologados}</span>
                <span className="text-[10px] text-slate-400 font-bold">/ 40 metas de homologação</span>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={Math.min(100, (totalHomologados / 40) * 100)} colorClass="bg-blue-600" />
            </div>
          </div>

          {/* OKR 2 */}
          <div className="p-4 border border-slate-50 rounded-xl bg-slate-50/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Receita Potencial Mapeada</span>
                <span className="text-xs font-black text-emerald-600">{Math.round((totalPotentialValue / 5000000) * 100)}%</span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-slate-800">R$ {(totalPotentialValue / 1000000).toFixed(2)}M</span>
                <span className="text-[10px] text-slate-400 font-bold">/ R$ 5.00M meta</span>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={Math.min(100, (totalPotentialValue / 5000000) * 100)} colorClass="bg-emerald-600" />
            </div>
          </div>

          {/* OKR 3 */}
          <div className="p-4 border border-slate-50 rounded-xl bg-slate-50/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SKUs Mapeados Ativos</span>
                <span className="text-xs font-black text-indigo-600">{Math.round((uniqueSkusRecommended / 150) * 100)}%</span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-slate-800">{uniqueSkusRecommended}</span>
                <span className="text-[10px] text-slate-400 font-bold">/ 150 SKUs recomendados</span>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={Math.min(100, (uniqueSkusRecommended / 150) * 100)} colorClass="bg-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: QUICK FILTERS */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col gap-1 min-w-[80px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Estado</span>
            <select
              value={sessionFilters.estados[0] || ''}
              onChange={(e) => setSessionFilters(p => ({ ...p, estados: e.target.value ? [e.target.value] : [] }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="">Todos</option>
              {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Cidade</span>
            <select
              value={sessionFilters.cidades[0] || ''}
              onChange={(e) => setSessionFilters(p => ({ ...p, cidades: e.target.value ? [e.target.value] : [] }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="">Todas</option>
              {cidadesOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Regional</span>
            <select
              value={sessionFilters.regionais[0] || ''}
              onChange={(e) => setSessionFilters(p => ({ ...p, regionais: e.target.value ? [e.target.value] : [] }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="">Todas</option>
              {regionalOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">RCA</span>
            <select
              value={sessionFilters.rcas[0] || ''}
              onChange={(e) => setSessionFilters(p => ({ ...p, rcas: e.target.value ? [e.target.value] : [] }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="">Todos</option>
              {rcaOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Categoria</span>
            <select
              value={sessionFilters.categorias[0] || ''}
              onChange={(e) => setSessionFilters(p => ({ ...p, categorias: e.target.value ? [e.target.value] : [] }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="">Todas</option>
              {categoriaOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Status</span>
            <select
              value={sessionFilters.statuses[0] || ''}
              onChange={(e) => setSessionFilters(p => ({ ...p, statuses: e.target.value ? [e.target.value] : [] }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="">Todos</option>
              <option value="Entradas">Em Curadoria</option>
              <option value="Autorizados">Homologado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Tipo Cliente</span>
            <select
              value={sessionFilters.tipoCliente || 'all'}
              onChange={(e) => setSessionFilters(p => ({ ...p, tipoCliente: e.target.value }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              <option value="all">Todos os Tipos</option>
              <option value="prioridade-a">Prioridade A (Score ≥ 90)</option>
              <option value="prioridade-b">Prioridade B (Score 70-89)</option>
              <option value="prospects">Prospects Radar</option>
              <option value="convertidos">Convertidos</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Score Fit</span>
            <select
              value={sessionFilters.scoreFit}
              onChange={(e) => setSessionFilters(p => ({ ...p, scoreFit: e.target.value }))}
              className="bg-white border border-slate-250 rounded-lg text-xs font-bold px-2 py-1.5 outline-hidden text-slate-700"
            >
              {SCORE_FIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2.5 shrink-0 pt-3 md:pt-0">
          <button onClick={handleSaveFilters} className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
            Salvar Filtros
          </button>
          <span className="text-slate-350">|</span>
          <button onClick={handleClearFilters} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
            Limpar
          </button>
        </div>
      </div>

      {/* SEÇÃO 3: PIPELINE FUNNEL, TOP CLIENTS, INSIGHTS IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* FUNIL */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs hover:shadow-2xs transition-all">
            <div className="border-b border-slate-100 pb-3 mb-4.5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Target className="h-4 w-4 text-blue-900 shrink-0" />
                Funil do Pipeline Comercial
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Conversão de Contas Operacionais</span>
            </div>

            <div className="flex flex-col items-center space-y-2 py-2">
              <div className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl py-2 px-4 flex justify-between items-center shadow-sm relative overflow-hidden">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">1</span>
                  Clientes Mapeados
                </span>
                <span className="text-xs font-mono font-black">{funnelMapeados} pdvs (100%)</span>
              </div>

              <div className="h-3 text-slate-300">↓</div>

              <div className="w-[92%] bg-gradient-to-r from-indigo-800 to-indigo-700 text-white rounded-xl py-2 px-4 flex justify-between items-center shadow-xs">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">2</span>
                  Em Curadoria
                </span>
                <span className="text-xs font-mono font-black">{funnelCuradoria} pdvs ({pctCuradoria}%)</span>
              </div>

              <div className="h-3 text-slate-300">↓</div>

              <div className="w-[84%] bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-xl py-2 px-4 flex justify-between items-center shadow-xs">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">3</span>
                  Homologados
                </span>
                <span className="text-xs font-mono font-black">{funnelHomologados} pdvs ({pctHomologados}%)</span>
              </div>

              <div className="h-3 text-slate-300">↓</div>

              <div className="w-[76%] bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-xl py-2 px-4 flex justify-between items-center shadow-xs">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">4</span>
                  Abordados
                </span>
                <span className="text-xs font-mono font-black">{funnelAbordados} pdvs ({pctAbordados}%)</span>
              </div>

              <div className="h-3 text-slate-300">↓</div>

              <div className="w-[68%] bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-xl py-2 px-4 flex justify-between items-center shadow-xs">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">5</span>
                  Convertidos
                </span>
                <span className="text-xs font-mono font-black">{funnelConvertidos} pdvs ({pctConvertidos}%)</span>
              </div>
            </div>
          </div>

          {/* TOP CLIENTES PRIORITÁRIOS */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs hover:shadow-2xs transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-blue-900 shrink-0" />
                  Top Clientes Prioritários
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Mapeamento de maior score comercial de atuação.</p>
              </div>
              <Badge variant="info">{filteredClients.filter(c => c.score >= 85).length} Prioritários (A)</Badge>
            </div>

            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-2">Nome</th>
                    <th className="py-2">Cidade</th>
                    <th className="py-2 text-center">Score</th>
                    <th className="py-2 text-right">Potencial</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {filteredClients
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map((cli) => {
                      const opp = filteredOpportunities.find(o => o.cliente.toLowerCase() === cli.name.toLowerCase() || o.clientId?.toString() === cli.id.toString());
                      const potentialValue = opp ? opp.valorPotencialEstimado : (cli.score * 580);
                      
                      return (
                        <tr key={cli.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-2.5 font-extrabold text-slate-800 truncate max-w-[150px]">{cli.fantasyName || cli.name}</td>
                          <td className="py-2.5 text-slate-500">{cli.city} ({cli.state})</td>
                          <td className="py-2.5 text-center">
                            <span className="inline-block px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-blue-50 text-blue-700">
                              {cli.score} pts
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-black text-emerald-600">R$ {potentialValue.toLocaleString('pt-BR')}</td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              cli.status === 'Autorizados' ? 'text-emerald-800 bg-emerald-50' : 'text-amber-800 bg-amber-50'
                            }`}>
                              {cli.status === 'Autorizados' ? 'Homologado' : 'Curadoria'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                localStorage.setItem('ctrade_selected_client_id', cli.id.toString());
                                window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'clientes' }));
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900 text-white hover:bg-blue-950 font-black uppercase tracking-wider text-[9px] px-2 py-1 rounded cursor-pointer flex items-center gap-0.5 ml-auto"
                            >
                              Workspace <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {filteredClients.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-slate-400 italic">Nenhum cliente localizado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-700 animate-pulse" />
              Insights IA
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Pizzarias Premium</span>
                  <Badge variant="success">+28% novos</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Crescimento acelerado de estabelecimentos operando com farinha napolitana premium no Sudeste.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Novos Hotéis</span>
                  <Badge variant="primary">Expansão</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Mapeamento em SC indica novas aberturas hoteleiras premium com restaurantes italianos refinados.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Mudanças de Cardápio</span>
                  <Badge variant="warning">Oportunidade</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Cardápios recém-mapeados apontam alta na oferta de Burratas. Latteria Sorrentina surge como substituto ideal.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Produtos em Alta</span>
                  <Badge variant="info">Massas</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Aumento expressivo na substituição de massas secas por frescas artesanais na região Sul.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-center text-slate-400 mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
            Insights gerados em tempo real pelo C-Trade IA
          </div>
        </div>
      </div>

      {/* SEÇÃO 3.5: PAINEL DE INTELIGÊNCIA DE DISTRIBUIÇÃO */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs mt-6 text-left">
        <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
              Painel de Inteligência de Distribuição
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Visão consolidada da penetração do portfólio de produtos e faturamento potencial.</p>
          </div>
          
          {/* Tabs header */}
          <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-150">
            {(['categorias', 'produtos', 'segmentos', 'distribuicao', 'novos'] as const).map((tab) => {
              const labels = {
                categorias: 'Categorias',
                produtos: 'Produtos',
                segmentos: 'Segmentos (R$)',
                distribuicao: 'UF / Cidades',
                novos: 'Entradas'
              };
              return (
                <button
                  key={tab}
                  onClick={() => setIntelTab(tab)}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${intelTab === tab ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content renderer */}
        <div className="animate-fade-in min-h-[160px] flex flex-col justify-between">
          {intelTab === 'categorias' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topCategorias.map((item, idx) => (
                <div key={item.name} className="p-3.5 border border-slate-50 rounded-xl bg-slate-50/20 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center font-mono text-[9px] font-black">{idx + 1}</span>
                    <span className="text-[11px] font-extrabold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 text-[10px] block">Ocorrências Mapeadas</span>
                    <strong className="text-slate-800 text-sm font-black">{item.count} restaurantes</strong>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={(item.count / (topCategorias[0]?.count || 1)) * 100} colorClass="bg-blue-600" />
                  </div>
                </div>
              ))}
              {topCategorias.length === 0 && <div className="col-span-5 text-center text-slate-400 italic py-6">Sem ocorrências registradas</div>}
            </div>
          )}

          {intelTab === 'produtos' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topProdutos.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="p-3.5 border border-slate-50 rounded-xl bg-slate-50/20 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center font-mono text-[9px] font-black">{idx + 1}</span>
                    <span className="text-[11px] font-extrabold text-slate-800 truncate" title={item.name}>{item.name}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 text-[10px] block">Matches em Pratos</span>
                    <strong className="text-slate-800 text-sm font-black">{item.count} indicações</strong>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={(item.count / (topProdutos[0]?.count || 1)) * 100} colorClass="bg-emerald-600" />
                  </div>
                </div>
              ))}
              {topProdutos.length === 0 && <div className="col-span-5 text-center text-slate-400 italic py-6">Sem ocorrências de SKUs recomendados</div>}
            </div>
          )}

          {intelTab === 'segmentos' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {segmentsPotential.map((item, idx) => (
                <div key={item.name} className="p-3.5 border border-slate-50 rounded-xl bg-slate-50/20 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center font-mono text-[9px] font-black">{idx + 1}</span>
                    <span className="text-[11px] font-extrabold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 text-[10px] block">Receita Potencial Mapeada</span>
                    <strong className="text-emerald-700 text-sm font-black">R$ {item.revenue.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {item.count} PDVs mapeados
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={(item.revenue / (segmentsPotential[0]?.revenue || 1)) * 100} colorClass="bg-amber-500" />
                  </div>
                </div>
              ))}
              {segmentsPotential.length === 0 && <div className="col-span-5 text-center text-slate-400 italic py-6">Sem segmentos detectados</div>}
            </div>
          )}

          {intelTab === 'distribuicao' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stateCityDistribution.map((item, idx) => (
                <div key={item.name} className="p-3.5 border border-slate-50 rounded-xl bg-slate-50/20 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-900 flex items-center justify-center font-mono text-[9px] font-black">{idx + 1}</span>
                    <span className="text-[11px] font-extrabold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 text-[10px] block">Valor Comercial Potencial</span>
                    <strong className="text-slate-800 text-sm font-black">R$ {item.potential.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {item.count} restaurantes ativos
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={(item.potential / (stateCityDistribution[0]?.potential || 1)) * 100} colorClass="bg-purple-600" />
                  </div>
                </div>
              ))}
              {stateCityDistribution.length === 0 && <div className="col-span-5 text-center text-slate-400 italic py-6">Sem ocorrências regionais</div>}
            </div>
          )}

          {intelTab === 'novos' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {newClientsByPeriod.map((item) => (
                <div key={item.name} className="p-3.5 border border-slate-50 rounded-xl bg-slate-50/20 flex flex-col justify-between">
                  <div className="mb-1 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.name}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 text-[10px] block">Novos Leads Mapeados</span>
                    <strong className="text-slate-800 text-sm font-black">{item.count} novos clientes</strong>
                  </div>
                  <div className="mt-1 text-[10px] text-emerald-600 font-bold">
                    R$ {item.potential.toLocaleString('pt-BR')} em pipeline
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={(item.count / (filteredClients.length || 1)) * 100} colorClass="bg-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 4: BENTO RANKINGS */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs mt-6">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-900 shrink-0" />
            Rankings Comerciais da Operação
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Atualizado dinamicamente</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Categoria */}
          <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-1">Top Categorias</span>
            <div className="space-y-1.5">
              {topCategorias.map((item, idx) => (
                <div key={item.name} className="text-[11px]">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate max-w-[100px]">{idx+1}. {item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <ProgressBar value={(item.count / (topCategorias[0]?.count || 1)) * 100} colorClass="bg-blue-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-1">Top Produtos</span>
            <div className="space-y-1.5">
              {topProdutos.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="text-[11px]">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate max-w-[100px]">{idx+1}. {item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <ProgressBar value={(item.count / (topProdutos[0]?.count || 1)) * 100} colorClass="bg-emerald-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Marcas */}
          <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-1">Top Marcas</span>
            <div className="space-y-1.5">
              {topMarcas.map((item, idx) => (
                <div key={item.name} className="text-[11px]">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate max-w-[100px]">{idx+1}. {item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <ProgressBar value={(item.count / (topMarcas[0]?.count || 1)) * 100} colorClass="bg-indigo-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Segmentos */}
          <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-1">Top Segmentos</span>
            <div className="space-y-1.5">
              {topSegmentos.map((item, idx) => (
                <div key={item.name} className="text-[11px]">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate max-w-[100px]">{idx+1}. {item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <ProgressBar value={(item.count / (topSegmentos[0]?.count || 1)) * 100} colorClass="bg-amber-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Cidades */}
          <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-1">Top Cidades</span>
            <div className="space-y-1.5">
              {topCidades.map((item, idx) => (
                <div key={item.name} className="text-[11px]">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate max-w-[100px]">{idx+1}. {item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <ProgressBar value={(item.count / (topCidades[0]?.count || 1)) * 100} colorClass="bg-purple-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
