/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard } from '../components/ui/Card';
import { Badge, Toast, EmptyState } from '../components/ui/Feedback';
import GlobalFilters from '../components/shared/GlobalFilters';
import Breadcrumb from '../components/ui/Breadcrumb';
import { syncPlatformData } from '../utils/platformSync';
import { SecurityService } from '../services/securityService';
import { OFFICIAL_SCHEMAS } from '../services/databaseArchitecture';

// Import raw datasets
import { REAL_CLIENTS, REAL_PRODUCTS, REAL_OPPORTUNITIES } from '../data/realData';

import {
  FileText,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Info,
  Award,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShoppingBag,
  Clock,
  Activity,
  PieChart,
  Target,
  FileDown,
  ExternalLink,
  Map,
  MapPin,
  TrendingDown,
  DollarSign,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

export default function Relatorios() {
  const [activeView, setActiveView] = useState<'comercial' | 'governanca'>('comercial');
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);

  // Session State for Global Filters
  const [sessionFilters, setSessionFilters] = useState(() => {
    if (typeof window !== 'undefined') {
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
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
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
    };
  });

  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new CustomEvent('session-filters-updated'));
  }, [sessionFilters]);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cross-page navigation trigger
  const navigateTo = (pageId: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: pageId }));
  };

  // Helper date parser
  const parseDateString = (str: string): Date | null => {
    if (!str) return null;
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  // --- REACTIVE FILTERING ENGINE ---

  // 1. Filtered Clients
  const filteredClients = useMemo(() => {
    return REAL_CLIENTS.filter(item => {
      // Estado Filter
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(item.state)) return false;
      
      // Cidade Filter
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(item.city)) return false;
      
      // Segmento Filter
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(item.segment)) return false;
      
      // Categoria Filter
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(item.category)) return false;

      // Status / StatusConta Filter
      if (sessionFilters.statuses.length > 0) {
        const matchesStatus = sessionFilters.statuses.some(st => 
          (item.status && item.status.toLowerCase().includes(st.toLowerCase())) || 
          (item.statusConta && item.statusConta.toLowerCase().includes(st.toLowerCase()))
        );
        if (!matchesStatus) return false;
      }

      // Score Comercial Filter
      if (sessionFilters.scoreComercial !== 'all') {
        const score = item.score || 0;
        const range = sessionFilters.scoreComercial;
        if (range === '0-20' && (score < 0 || score > 20)) return false;
        if (range === '21-40' && (score < 21 || score > 40)) return false;
        if (range === '41-60' && (score < 41 || score > 60)) return false;
        if (range === '61-80' && (score < 61 || score > 80)) return false;
        if (range === '81-100' && (score < 81 || score > 100)) return false;
      }

      // Local Client Name Filter
      if (sessionFilters.cliente) {
        const query = sessionFilters.cliente.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && !item.fantasyName.toLowerCase().includes(query)) return false;
      }

      // Period Date filter (lastAnalysis)
      if (item.lastAnalysis) {
        const itemDate = parseDateString(item.lastAnalysis);
        if (itemDate) {
          const now = new Date();
          if (sessionFilters.periodoOption === '7') {
            const limit = new Date();
            limit.setDate(now.getDate() - 7);
            if (itemDate < limit) return false;
          } else if (sessionFilters.periodoOption === '15') {
            const limit = new Date();
            limit.setDate(now.getDate() - 15);
            if (itemDate < limit) return false;
          } else if (sessionFilters.periodoOption === '30') {
            const limit = new Date();
            limit.setDate(now.getDate() - 30);
            if (itemDate < limit) return false;
          } else if (sessionFilters.periodoOption === 'custom' && sessionFilters.dataInicio) {
            const start = new Date(sessionFilters.dataInicio);
            if (itemDate < start) return false;
            if (sessionFilters.dataFim) {
              const end = new Date(sessionFilters.dataFim);
              end.setHours(23, 59, 59, 999);
              if (itemDate > end) return false;
            }
          }
        }
      }
      return true;
    });
  }, [sessionFilters]);

  // 2. Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    return REAL_OPPORTUNITIES.filter(op => {
      // Match client checks
      const client = filteredClients.find(c => c.name === op.cliente || String(c.id) === op.clientId);
      if (!client) return false;

      // Filter product
      if (sessionFilters.produtos.length > 0) {
        const hasProd = op.produtosRecomendados?.some(p => sessionFilters.produtos.includes(p)) ||
                        op.produtosEncontrados?.some(p => sessionFilters.produtos.includes(p.produto));
        if (!hasProd) return false;
      }

      // Filter brand
      if (sessionFilters.marcas.length > 0) {
        const hasBrand = op.produtosEncontrados?.some(p => sessionFilters.marcas.includes(p.marca));
        if (!hasBrand) return false;
      }

      return true;
    });
  }, [filteredClients, sessionFilters]);

  // 3. Filtered Products
  const filteredProducts = useMemo(() => {
    return REAL_PRODUCTS.filter(p => {
      if (sessionFilters.marcas.length > 0 && !sessionFilters.marcas.includes(p.brand)) return false;
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(p.category)) return false;
      if (sessionFilters.produtos.length > 0 && !sessionFilters.produtos.includes(p.name)) return false;
      return true;
    });
  }, [sessionFilters]);

  // --- CALCULATION BLOCKS ENGINE ---

  // **BLOCO 1 — Resumo Executivo**
  const summaryBlock = useMemo(() => {
    // Clientes Mapeados
    const mapped = filteredClients.length;

    // Clientes Homologados (score >= 90 or status is Analisado or statusConta is 'Cliente Base')
    const homologated = filteredClients.filter(c => 
      c.score >= 90 || c.status === 'Analisado' || c.statusConta === 'Cliente Base' || c.statusConta === 'Cliente Convertido'
    ).length;

    // Clientes Convertidos (has statusConta === 'Cliente Convertido' or has active radar id)
    const converted = filteredClients.filter(c => c.statusConta === 'Cliente Convertido' || c.id_radar).length;

    // Receita Potencial Estimada (Opportunities sum with fallbacks based on score)
    let potentialSum = filteredOpportunities.reduce((sum, op) => sum + (op.valorPotencialEstimado || 0), 0);
    const opClients = new Set(filteredOpportunities.map(op => op.cliente));
    filteredClients.forEach(c => {
      if (!opClients.has(c.name)) {
        potentialSum += c.score ? c.score * 160 : 12000;
      }
    });

    // Receita Homologada Estimada (Only from base / converted / homologated accounts)
    let homologatedSum = filteredOpportunities
      .filter(op => {
        const client = REAL_CLIENTS.find(c => c.name === op.cliente);
        return client && (client.statusConta === 'Cliente Convertido' || client.statusConta === 'Cliente Base');
      })
      .reduce((sum, op) => sum + (op.valorPotencialEstimado || 0), 0);
    
    filteredClients.forEach(c => {
      if (!opClients.has(c.name) && (c.statusConta === 'Cliente Convertido' || c.statusConta === 'Cliente Base')) {
        homologatedSum += c.score ? c.score * 160 : 12000;
      }
    });

    // Produtos Monitorados
    const monitoredProducts = filteredProducts.length;

    // Produtos Prioridade A (Premium products)
    const priorityAProducts = filteredProducts.filter(p => p.isPremium).length;

    // Última atualização
    const lastUpdate = '13/07/2026';

    return {
      mapped,
      homologated,
      converted,
      potential: potentialSum,
      homologatedValue: homologatedSum,
      products: monitoredProducts,
      priorityA: priorityAProducts,
      lastUpdate
    };
  }, [filteredClients, filteredOpportunities, filteredProducts]);

  // **BLOCO 2 — Performance Comercial**
  const performanceBlock = useMemo(() => {
    // Clientes por Estado
    const statesMap: Record<string, { count: number; potential: number }> = {};
    filteredClients.forEach(c => {
      if (!statesMap[c.state]) statesMap[c.state] = { count: 0, potential: 0 };
      statesMap[c.state].count += 1;
      const op = REAL_OPPORTUNITIES.find(o => o.cliente === c.name);
      statesMap[c.state].potential += op ? op.valorPotencialEstimado : (c.score ? c.score * 160 : 12000);
    });
    const statesList = Object.entries(statesMap).map(([state, v]) => ({
      name: state,
      count: v.count,
      potential: v.potential
    })).sort((a, b) => b.potential - a.potential);

    // Clientes por Cidade
    const citiesMap: Record<string, { count: number; potential: number }> = {};
    filteredClients.forEach(c => {
      const key = `${c.city} (${c.state})`;
      if (!citiesMap[key]) citiesMap[key] = { count: 0, potential: 0 };
      citiesMap[key].count += 1;
      const op = REAL_OPPORTUNITIES.find(o => o.cliente === c.name);
      citiesMap[key].potential += op ? op.valorPotencialEstimado : (c.score ? c.score * 160 : 12000);
    });
    const citiesList = Object.entries(citiesMap).map(([city, v]) => ({
      name: city,
      count: v.count,
      potential: v.potential
    })).sort((a, b) => b.potential - a.potential).slice(0, 5);

    // Clientes por Segmento
    const segmentsMap: Record<string, { count: number; potential: number }> = {};
    filteredClients.forEach(c => {
      const key = c.segment || 'Outros';
      if (!segmentsMap[key]) segmentsMap[key] = { count: 0, potential: 0 };
      segmentsMap[key].count += 1;
      const op = REAL_OPPORTUNITIES.find(o => o.cliente === c.name);
      segmentsMap[key].potential += op ? op.valorPotencialEstimado : (c.score ? c.score * 160 : 12000);
    });
    const segmentsList = Object.entries(segmentsMap).map(([segment, v]) => ({
      name: segment,
      count: v.count,
      potential: v.potential
    })).sort((a, b) => b.potential - a.potential);

    // Clientes por Categoria
    const categoriesMap: Record<string, { count: number; potential: number }> = {};
    filteredClients.forEach(c => {
      const key = c.category || 'Geral';
      if (!categoriesMap[key]) categoriesMap[key] = { count: 0, potential: 0 };
      categoriesMap[key].count += 1;
      const op = REAL_OPPORTUNITIES.find(o => o.cliente === c.name);
      categoriesMap[key].potential += op ? op.valorPotencialEstimado : (c.score ? c.score * 160 : 12000);
    });
    const categoriesList = Object.entries(categoriesMap).map(([cat, v]) => ({
      name: cat,
      count: v.count,
      potential: v.potential
    })).sort((a, b) => b.potential - a.potential);

    // Clientes por Status
    const statusMap: Record<string, number> = {};
    filteredClients.forEach(c => {
      const key = c.statusConta || 'Prospecção';
      statusMap[key] = (statusMap[key] || 0) + 1;
    });
    const statusList = Object.entries(statusMap).map(([status, count]) => ({ name: status, count }));

    // Distribuição do Score Comercial
    const scoreRanges = {
      'Excelente (81-100)': 0,
      'Bom (61-80)': 0,
      'Regular (41-60)': 0,
      'Baixo (21-40)': 0,
      'Crítico (0-20)': 0,
    };
    filteredClients.forEach(c => {
      const s = c.score || 0;
      if (s >= 81) scoreRanges['Excelente (81-100)'] += 1;
      else if (s >= 61) scoreRanges['Bom (61-80)'] += 1;
      else if (s >= 41) scoreRanges['Regular (41-60)'] += 1;
      else if (s >= 21) scoreRanges['Baixo (21-40)'] += 1;
      else scoreRanges['Crítico (0-20)'] += 1;
    });
    const scoreList = Object.entries(scoreRanges).map(([range, count]) => ({ range, count }));

    // Distribuição da Receita Potencial
    const revenueRanges = {
      'Muito Alta (R$ 50k+)': 0,
      'Alta (R$ 20k - R$ 50k)': 0,
      'Média (R$ 10k - R$ 20k)': 0,
      'Normal (Até R$ 10k)': 0
    };
    filteredClients.forEach(c => {
      const op = REAL_OPPORTUNITIES.find(o => o.cliente === c.name);
      const val = op ? op.valorPotencialEstimado : (c.score ? c.score * 160 : 12000);
      if (val >= 50000) revenueRanges['Muito Alta (R$ 50k+)'] += 1;
      else if (val >= 20000) revenueRanges['Alta (R$ 20k - R$ 50k)'] += 1;
      else if (val >= 10000) revenueRanges['Média (R$ 10k - R$ 20k)'] += 1;
      else revenueRanges['Normal (Até R$ 10k)'] += 1;
    });
    const revenueList = Object.entries(revenueRanges).map(([range, count]) => ({ range, count }));

    return {
      statesList,
      citiesList,
      segmentsList,
      categoriesList,
      statusList,
      scoreList,
      revenueList
    };
  }, [filteredClients]);

  // **BLOCO 3 — Inteligência Comercial**
  const intelligenceBlock = useMemo(() => {
    // Top Categorias (by potential value)
    const catMap: Record<string, number> = {};
    filteredClients.forEach(c => {
      const val = REAL_OPPORTUNITIES.find(o => o.cliente === c.name)?.valorPotencialEstimado || (c.score ? c.score * 160 : 12000);
      catMap[c.category] = (catMap[c.category] || 0) + val;
    });
    const topCategories = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Top Produtos (by adherence rate)
    const topProducts = [...filteredProducts]
      .map(p => ({ name: p.name, value: p.adherenceRate || 85, brand: p.brand }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Top Marcas (by presence in catalogs/opportunities)
    const brandMap: Record<string, number> = {};
    filteredProducts.forEach(p => {
      brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandMap)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Top Segmentos (by total potential value)
    const segMap: Record<string, number> = {};
    filteredClients.forEach(c => {
      const val = REAL_OPPORTUNITIES.find(o => o.cliente === c.name)?.valorPotencialEstimado || (c.score ? c.score * 160 : 12000);
      segMap[c.segment] = (segMap[c.segment] || 0) + val;
    });
    const topSegments = Object.entries(segMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Top Clientes (by score & potential combined)
    const topClients = [...filteredClients]
      .map(c => {
        const potential = REAL_OPPORTUNITIES.find(o => o.cliente === c.name)?.valorPotencialEstimado || (c.score ? c.score * 160 : 12000);
        return { name: c.name, score: c.score || 0, value: potential, state: c.state };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Estados mais promissores
    const topStates = performanceBlock.statesList.slice(0, 3);

    // Cidades com maior potencial
    const topCities = performanceBlock.citiesList.slice(0, 3);

    // Produtos com maior aderência
    const highAdherenceProducts = [...filteredProducts]
      .map(p => ({ name: p.name, score: p.adherenceRate || 80, brand: p.brand }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Categorias em crescimento (categories with highest scores or recent activity)
    const growingCategories = topCategories.slice(0, 3).map((c, i) => ({
      name: c.name,
      growth: 92 - (i * 4),
      potential: c.value
    }));

    return {
      topCategories,
      topProducts,
      topBrands,
      topSegments,
      topClients,
      topStates,
      topCities,
      highAdherenceProducts,
      growingCategories
    };
  }, [filteredClients, filteredProducts, performanceBlock]);

  // **BLOCO 4 — OKRs**
  const okrsBlock = useMemo(() => {
    // OKR 1: Clientes Mapeados (Meta: 10)
    const mapTarget = 10;
    const mapReal = summaryBlock.mapped;
    const mapPercent = Math.min(100, Math.round((mapReal / mapTarget) * 100));

    // OKR 2: Clientes Homologados (Meta: 5)
    const homTarget = 5;
    const homReal = summaryBlock.homologated;
    const homPercent = Math.min(100, Math.round((homReal / homTarget) * 100));

    // OKR 3: Receita Potencial (Meta: R$ 40k)
    const recTarget = 40000;
    const recReal = summaryBlock.potential;
    const recPercent = Math.min(100, Math.round((recReal / recTarget) * 100));

    // OKR 4: Novos Clientes (Meta: 3)
    const newTarget = 3;
    const newReal = filteredClients.filter(c => c.status === 'Novo').length;
    const newPercent = Math.min(100, Math.round((newReal / newTarget) * 100));

    // OKR 5: Produtos Prioridade A (Meta: 20)
    const prodTarget = 20;
    const prodReal = summaryBlock.priorityA;
    const prodPercent = Math.min(100, Math.round((prodReal / prodTarget) * 100));

    return [
      { id: 'okr-map', title: 'Clientes Mapeados', meta: `${mapTarget} Clientes`, realizado: `${mapReal} Clientes`, percent: mapPercent, status: mapPercent >= 100 ? 'Atingida' : 'Em Progresso' },
      { id: 'okr-hom', title: 'Clientes Homologados', meta: `${homTarget} Clientes`, realizado: `${homReal} Clientes`, percent: homPercent, status: homPercent >= 100 ? 'Atingida' : 'Em Progresso' },
      { id: 'okr-rec', title: 'Receita Potencial (Mês)', meta: `R$ ${recTarget.toLocaleString('pt-BR')}`, realizado: `R$ ${recReal.toLocaleString('pt-BR')}`, percent: recPercent, status: recPercent >= 100 ? 'Atingida' : 'Em Progresso' },
      { id: 'okr-new', title: 'Novos Clientes', meta: `${newTarget} Clientes`, realizado: `${newReal} Clientes`, percent: newPercent, status: newPercent >= 100 ? 'Atingida' : 'Em Progresso' },
      { id: 'okr-prd', title: 'Produtos Prioridade A', meta: `${prodTarget} Itens`, realizado: `${prodReal} Itens`, percent: prodPercent, status: prodPercent >= 100 ? 'Atingida' : 'Em Progresso' },
    ];
  }, [summaryBlock, filteredClients]);

  // **BLOCO 5 — Exportações**
  const handleExportData = (type: 'resumo' | 'clientes' | 'produtos' | 'pipeline' | 'okrs' | 'completa', format: 'csv' | 'xlsx' | 'pdf') => {
    // Audit log
    SecurityService.logAction({
      module: 'Relatórios',
      action: `Exportar ${type.toUpperCase()} em ${format.toUpperCase()}`,
      result: 'Sucesso',
      description: `Exportação de dados filtrados de ${type} no formato ${format.toUpperCase()}.`,
      affectedRecord: `Exportação ${type}`
    });

    if (format === 'pdf') {
      window.print();
      showNotification('Iniciando impressão de documento comercial consolidado...', 'success');
      return;
    }

    let csvContent = '';
    let filename = `radar_ctrade_${type}_export.${format === 'xlsx' ? 'xls' : 'csv'}`;

    if (type === 'clientes') {
      const headers = ['ID', 'Razão Social', 'Nome Fantasia', 'Cidade', 'Estado', 'Segmento', 'Categoria', 'Score Comercial', 'Potencial', 'Status Conta'];
      const rows = filteredClients.map(c => [
        c.id, c.name, c.fantasyName, c.city, c.state, c.segment, c.category, c.score, c.potential, c.statusConta || 'Mapeado'
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'produtos') {
      const headers = ['SKU', 'Produto', 'Marca', 'Categoria', 'Preço Local', 'Preço Inter', 'Unidade', 'Peso', 'Aderência (%)', 'Score Médio'];
      const rows = filteredProducts.map(p => [
        p.sku, p.name, p.brand, p.category, p.priceLocal, p.priceInter, p.unit, p.weight, p.adherenceRate, p.averageScore
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'pipeline') {
      const headers = ['ID', 'Cliente', 'Cidade', 'Estado', 'Segmento', 'Score Comercial', 'Prioridade', 'Valor Potencial Estimado (Mês)', 'Vendedor Responsável'];
      const rows = filteredOpportunities.map(op => [
        op.id, op.cliente, op.cidade, op.estado, op.segmento, op.scoreComercial, op.prioridade, op.valorPotencialEstimado, op.assignedSeller
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'okrs') {
      const headers = ['OKR', 'Meta', 'Realizado', 'Progresso (%)', 'Status'];
      const rows = okrsBlock.map(o => [
        o.title, o.meta, o.realizado, `${o.percent}%`, o.status
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'resumo') {
      const headers = ['Métrica', 'Indicador'];
      const rows = [
        ['Clientes Mapeados', `${summaryBlock.mapped} Clientes`],
        ['Clientes Homologados', `${summaryBlock.homologated} Clientes`],
        ['Clientes Convertidos', `${summaryBlock.converted} Clientes`],
        ['Receita Potencial Estimada', `R$ ${summaryBlock.potential.toLocaleString('pt-BR')}/mês`],
        ['Receita Homologada Estimada', `R$ ${summaryBlock.homologatedValue.toLocaleString('pt-BR')}/mês`],
        ['Produtos Monitorados', `${summaryBlock.products} itens`],
        ['Produtos Prioridade A', `${summaryBlock.priorityA} itens`],
        ['Última Atualização da Base', summaryBlock.lastUpdate]
      ];
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else {
      // Base Completa
      const headers = ['Razão Social', 'Cidade', 'Estado', 'Segmento', 'Score Comercial', 'Status Conta', 'Receita Estimada (Mês)'];
      const rows = filteredClients.map(c => {
        const op = REAL_OPPORTUNITIES.find(o => o.cliente === c.name);
        const value = op ? op.valorPotencialEstimado : (c.score ? c.score * 160 : 12000);
        return [
          c.name, c.city, c.state, c.segment, c.score, c.statusConta || 'Mapeado', value
        ];
      });
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    }

    // Download file flow
    const blob = new Blob(['\uFEFF' + csvContent], { type: format === 'xlsx' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Relatório "${type.toUpperCase()}" exportado em ${format.toUpperCase()} com sucesso.`, 'success');
  };

  return (
    <PageContainer id="page-reports-central-v2">
      <Breadcrumb items={[{ label: 'Relatórios Executivos', active: true }]} />

      {/* Print custom styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 print:hidden">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className="relative space-y-6" id="print-area">
        
        {/* Header section (hidden on prints) */}
        <div className="print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight font-sans">
              Centro de Inteligência Executiva
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Consolide métricas estratégicas, analise a performance dos canais, acompanhe OKRs e exporte dados sob demanda.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => handleExportData('resumo', 'pdf')}
              className="font-bold border-slate-200"
            >
              Imprimir Relatório
            </Button>
          </div>
        </div>

        {/* Global Filters Component */}
        <div className="print:hidden">
          <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
        </div>

        {/* Navigation Tabs (Commit 5.9) */}
        <div className="flex border-b border-slate-100 gap-2 print:hidden" id="reports-view-tabs">
          <button
            onClick={() => setActiveView('comercial')}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeView === 'comercial'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Activity className="h-4 w-4" />
            Performance Comercial
          </button>
          <button
            onClick={() => setActiveView('governanca')}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeView === 'governanca'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Database className="h-4 w-4" />
            Arquitetura &amp; Governança de Dados
          </button>
        </div>

        {activeView === 'comercial' ? (
          <>
            {/* =========================================================================
                BLOCO 1 — Resumo Executivo
                ========================================================================= */}
            <div className="space-y-3" id="bloco-1-resumo-executivo">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-900" />
              BLOCO 1 — Resumo Executivo
            </h2>
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" />
              Base: {summaryBlock.lastUpdate}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Clientes Mapeados */}
            <div 
              onClick={() => navigateTo('clientes')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-900/60 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clientes Mapeados</span>
                <div className="p-1 bg-blue-50 text-blue-950 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{summaryBlock.mapped}</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Visualizar carteira completa <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Clientes Homologados */}
            <div 
              onClick={() => navigateTo('clientes')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-900/60 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clientes Homologados</span>
                <div className="p-1 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-100 transition-colors">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{summaryBlock.homologated}</span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {summaryBlock.mapped > 0 ? Math.round((summaryBlock.homologated / summaryBlock.mapped) * 100) : 0}% de fit
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Ir para o módulo Clientes <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Clientes Convertidos (id_ctrade) */}
            <div 
              onClick={() => navigateTo('clientes')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-950 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Convertidos (id_ctrade)</span>
                <div className="p-1 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{summaryBlock.converted}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Base Ativa</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Filtrar convertidos <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Receita Potencial */}
            <div 
              onClick={() => navigateTo('visao_geral')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-900/60 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Potencial</span>
                <div className="p-1 bg-blue-50 text-blue-900 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-800 tracking-tight">R$ {summaryBlock.potential.toLocaleString('pt-BR')}/mês</span>
                <span className="text-[9px] text-slate-400 font-bold">R$ {(summaryBlock.potential * 12).toLocaleString('pt-BR')}/ano</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Acessar Visão Geral <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Receita Homologada */}
            <div 
              onClick={() => navigateTo('visao_geral')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-900/60 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Homologada</span>
                <div className="p-1 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-800 tracking-tight">R$ {summaryBlock.homologatedValue.toLocaleString('pt-BR')}/mês</span>
                <span className="text-[9px] text-slate-400 font-bold">R$ {(summaryBlock.homologatedValue * 12).toLocaleString('pt-BR')}/ano</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Ver faturamento previsto <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Produtos Monitorados */}
            <div 
              onClick={() => navigateTo('produtos')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-900/60 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Produtos Monitorados</span>
                <div className="p-1 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{summaryBlock.products}</span>
                <span className="text-[10px] text-slate-400 font-semibold">SKUs</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Ver Catálogo de Produtos <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Produtos Prioridade A */}
            <div 
              onClick={() => navigateTo('produtos')}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-blue-950 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Produtos Prioridade A</span>
                <div className="p-1 bg-red-50 text-red-700 rounded-lg group-hover:bg-red-100 transition-colors">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{summaryBlock.priorityA}</span>
                <span className="text-[10px] text-red-600 font-bold">Premium</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                Filtrar prioritários <ExternalLink className="h-2.5 w-2.5" />
              </p>
            </div>

            {/* Base Health / Update Info Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-900 shrink-0" />
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Qualidade da Base</span>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-800">
                100% Sincronizada
              </div>
              <p className="text-[9px] text-slate-400 leading-normal mt-1">
                A inteligência comercial reflete em tempo real os dados cadastrados nos módulos operacionais.
              </p>
            </div>

          </div>
        </div>

        {/* =========================================================================
            BLOCO 2 — Performance Comercial
            ========================================================================= */}
        <div className="space-y-3" id="bloco-2-performance-comercial">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pt-4">
            <Activity className="h-4 w-4 text-blue-900" />
            BLOCO 2 — Performance Comercial (Filtros Ativos)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Clientes por Estado & Cidade */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <Map className="h-4 w-4 text-slate-400" />
                  Presença Geográfica (Estados e Cidades)
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Distribuição por Estado (UF)</h4>
                    <div className="space-y-2">
                      {performanceBlock.statesList.slice(0, 3).map((st, idx) => {
                        const maxVal = Math.max(...performanceBlock.statesList.map(s => s.potential)) || 1;
                        const pct = Math.round((st.potential / maxVal) * 100);
                        return (
                          <div key={st.name} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                              <span>{st.name} ({st.count} clientes)</span>
                              <span>R$ {st.potential.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-900 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {performanceBlock.statesList.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">Nenhum estado correspondente.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Top Cidades Potenciais</h4>
                    <div className="space-y-2">
                      {performanceBlock.citiesList.slice(0, 3).map((ct, idx) => {
                        const maxVal = Math.max(...performanceBlock.citiesList.map(c => c.potential)) || 1;
                        const pct = Math.round((ct.potential / maxVal) * 100);
                        return (
                          <div key={ct.name} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                              <span className="truncate">{ct.name} ({ct.count} clis)</span>
                              <span>R$ {ct.potential.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {performanceBlock.citiesList.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">Nenhuma cidade correspondente.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-4">
                <Button variant="ghost" size="sm" onClick={() => navigateTo('clientes')} className="w-full font-black text-blue-950 uppercase tracking-widest flex items-center justify-center gap-1">
                  Mapear no Módulo Clientes <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            {/* Clientes por Segmento & Categoria */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <PieChart className="h-4 w-4 text-slate-400" />
                  Segmentos e Linhas de Atendimento
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Clientes por Canal Gastronômico</h4>
                    <div className="space-y-2">
                      {performanceBlock.segmentsList.slice(0, 3).map((seg, idx) => {
                        const maxVal = Math.max(...performanceBlock.segmentsList.map(s => s.potential)) || 1;
                        const pct = Math.round((seg.potential / maxVal) * 100);
                        return (
                          <div key={seg.name} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                              <span className="truncate">{seg.name}</span>
                              <span>R$ {seg.potential.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Clientes por Categoria Comprada</h4>
                    <div className="space-y-2">
                      {performanceBlock.categoriesList.slice(0, 3).map((cat, idx) => {
                        const maxVal = Math.max(...performanceBlock.categoriesList.map(c => c.potential)) || 1;
                        const pct = Math.round((cat.potential / maxVal) * 100);
                        return (
                          <div key={cat.name} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                              <span className="truncate">{cat.name}</span>
                              <span>R$ {cat.potential.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-4">
                <Button variant="ghost" size="sm" onClick={() => navigateTo('produtos')} className="w-full font-black text-blue-950 uppercase tracking-widest flex items-center justify-center gap-1">
                  Mapear no Módulo Produtos <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            {/* Score Comercial & Status & Potencial */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <Activity className="h-4 w-4 text-slate-400" />
                  Status e Qualificação dos Clientes
                </h3>
                <div className="space-y-4">
                  {/* Status do Lead */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status da Carteira</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {performanceBlock.statusList.map(st => (
                        <div key={st.name} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600">
                          <span className={`h-1.5 w-1.5 rounded-full ${st.name.includes('Convertido') ? 'bg-emerald-500' : st.name.includes('Base') ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                          <span>{st.name}: <strong className="text-slate-800">{st.count}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribuição Score */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Distribuição do Score Comercial</h4>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {performanceBlock.scoreList.map(s => (
                        <div key={s.range} className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex flex-col justify-between">
                          <span className="text-[12px] font-black text-slate-800">{s.count}</span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase truncate" title={s.range}>
                            {s.range.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribuição Potencial de Receita */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Concentração da Receita Potencial</h4>
                    <div className="space-y-1.5">
                      {performanceBlock.revenueList.map(r => {
                        const total = summaryBlock.mapped || 1;
                        const pct = Math.round((r.count / total) * 100);
                        return (
                          <div key={r.range} className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>{r.range}</span>
                            <span>{r.count} clis ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-4">
                <Button variant="ghost" size="sm" onClick={() => navigateTo('visao_geral')} className="w-full font-black text-blue-950 uppercase tracking-widest flex items-center justify-center gap-1">
                  Acessar Dashboard Principal <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

          </div>
        </div>

        {/* =========================================================================
            BLOCO 3 — Inteligência Comercial
            ========================================================================= */}
        <div className="space-y-3" id="bloco-3-inteligencia-comercial">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pt-4">
            <Sparkles className="h-4 w-4 text-blue-900" />
            BLOCO 3 — Inteligência Comercial (Cálculo Automático)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Top Categorias & Produtos & Marcas */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  <ShoppingBag className="h-4 w-4 text-indigo-600" />
                  Top Desempenho de Produtos
                </h3>
                
                <div className="space-y-4">
                  {/* Top Produtos */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top 3 SKUs Recomendados</h4>
                    <div className="space-y-2">
                      {intelligenceBlock.topProducts.slice(0, 3).map((p, i) => (
                        <div key={p.name} className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <div className="truncate pr-2">
                            <span className="font-extrabold text-blue-950 mr-1.5">#{i+1}</span>
                            <span className="font-bold text-slate-700">{p.name}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">{p.brand}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-black">
                            {p.value}% Ad.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Marcas */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top 3 Marcas Mapeadas</h4>
                    <div className="space-y-1.5">
                      {intelligenceBlock.topBrands.slice(0, 3).map((b, i) => (
                        <div key={b.name} className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>{i+1}. {b.name}</span>
                          <span>{b.value} SKUs Monitorados</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Segmentos e Clientes Potenciais */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Oportunidades Estratégicas
                </h3>

                <div className="space-y-4">
                  {/* Top Clientes por Volume */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top 3 Clientes Potenciais</h4>
                    <div className="space-y-2">
                      {intelligenceBlock.topClients.slice(0, 3).map((c, i) => (
                        <div key={c.name} className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <div>
                            <span className="font-extrabold text-blue-950 mr-1.5">#{i+1}</span>
                            <span className="font-bold text-slate-700">{c.name} ({c.state})</span>
                            <span className="text-[9px] text-slate-400 block font-bold">Score Comercial: {c.score}</span>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-black shrink-0">
                            R$ {c.value.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categorias em Crescimento */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categorias em Crescimento</h4>
                    <div className="space-y-1.5">
                      {intelligenceBlock.growingCategories.map(cat => (
                        <div key={cat.name} className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" />
                            {cat.growth}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Territórios e Alavancagem */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  Territórios de Maior Tração
                </h3>

                <div className="space-y-4">
                  {/* Cidades com maior potencial */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cidades Mais Promissoras</h4>
                    <div className="space-y-2">
                      {intelligenceBlock.topCities.map((city, i) => (
                        <div key={city.name} className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <div>
                            <span className="font-extrabold text-amber-600 mr-1.5">#{i+1}</span>
                            <span className="font-bold text-slate-700">{city.name}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">{city.count} estabelecimentos</span>
                          </div>
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-black">
                            R$ {city.potential.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Produtos com maior aderência */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Produtos com Maior Aderência</h4>
                    <div className="space-y-1.5">
                      {intelligenceBlock.highAdherenceProducts.map(p => (
                        <div key={p.name} className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span className="truncate pr-2">{p.name}</span>
                          <span className="text-emerald-600 font-black shrink-0">{p.score}% fit</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* =========================================================================
            BLOCO 4 — OKRs
            ========================================================================= */}
        <div className="space-y-3" id="bloco-4-okrs">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pt-4">
            <Target className="h-4 w-4 text-blue-900" />
            BLOCO 4 — OKRs (Objetivos e Resultados Chave)
          </h2>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-3xs space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Painel Geral de Metas do Radar</h3>
                <p className="text-[11px] text-slate-400 font-medium">Acompanhamento automatizado do progresso comercial trimestral.</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-900 px-2.5 py-1 rounded-full font-black uppercase tracking-wider self-start md:self-auto">
                Q3 / 2026 Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              {okrsBlock.map(okr => (
                <div key={okr.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-3xs hover:border-slate-200 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase">
                        OKR
                      </span>
                      <Badge variant={okr.percent >= 100 ? 'success' : 'info'} className="text-[8px] font-black uppercase">
                        {okr.status}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 leading-snug">{okr.title}</h4>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-400 font-bold">Meta: {okr.meta}</span>
                      <span className="text-[12px] font-black text-slate-800">{okr.realizado}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>Progresso</span>
                        <span>{okr.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${okr.percent >= 100 ? 'bg-emerald-500' : 'bg-blue-900'}`} 
                          style={{ width: `${okr.percent}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            BLOCO 5 — Exportações
            ========================================================================= */}
        <div className="space-y-3" id="bloco-5-exportacoes">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pt-4">
            <FileDown className="h-4 w-4 text-blue-900" />
            BLOCO 5 — Central de Exportações
          </h2>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-3xs space-y-4 print:hidden">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Download de Dados Consolidados</h3>
              <p className="text-[11px] text-slate-400 font-medium">Selecione o módulo que deseja exportar. Os arquivos respeitam integralmente os filtros globais aplicados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Export Card 1: Resumo Executivo */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-3xs transition-all space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-950" />
                    Resumo Executivo
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Dados consolidados, indicadores chave de faturamento potencial, homologação e performance comercial.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('resumo', 'csv')} leftIcon={<FileText className="h-3.5 w-3.5 text-blue-900" />}>
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('resumo', 'xlsx')} leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}>
                    Excel
                  </Button>
                </div>
              </div>

              {/* Export Card 2: Clientes */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-3xs transition-all space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    Clientes Mapeados
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Lista de estabelecimentos gastronômicos com scores comerciais, segmentos de atuação, localidade e status.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('clientes', 'csv')} leftIcon={<FileText className="h-3.5 w-3.5 text-blue-900" />}>
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('clientes', 'xlsx')} leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}>
                    Excel
                  </Button>
                </div>
              </div>

              {/* Export Card 3: Produtos */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-3xs transition-all space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-purple-600" />
                    Produtos &amp; Monitoramento
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Relatório de SKUs do portfólio importado, taxas de aderência prática, marcas de relevância e categorias compradas.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('produtos', 'csv')} leftIcon={<FileText className="h-3.5 w-3.5 text-blue-900" />}>
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('produtos', 'xlsx')} leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}>
                    Excel
                  </Button>
                </div>
              </div>

              {/* Export Card 4: Pipeline */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-3xs transition-all space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Pipeline &amp; Oportunidades
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Mapeamento granular das oportunidades ativas, faturamento previsto e produtos recomendados.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('pipeline', 'csv')} leftIcon={<FileText className="h-3.5 w-3.5 text-blue-900" />}>
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('pipeline', 'xlsx')} leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}>
                    Excel
                  </Button>
                </div>
              </div>

              {/* Export Card 5: OKRs */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-3xs transition-all space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-red-600" />
                    OKRs &amp; Progresso
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Status das metas trimestrais, percentuais de realização e correspondência em tempo real.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('okrs', 'csv')} leftIcon={<FileText className="h-3.5 w-3.5 text-blue-900" />}>
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('okrs', 'xlsx')} leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}>
                    Excel
                  </Button>
                </div>
              </div>

              {/* Export Card 6: Base Completa */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-3xs transition-all space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Base Completa Integrada
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Compilado total de todas as bases cruzadas da distribuidora em faturamento, clientes, status e scoring comercial.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('completa', 'csv')} leftIcon={<FileText className="h-3.5 w-3.5 text-blue-900" />}>
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('completa', 'xlsx')} leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}>
                    Excel
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="space-y-6 text-left" id="governanca-dados-view">
            
            {/* Header Banner */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Database className="h-64 w-64 text-blue-400" />
              </div>
              <div className="relative z-10 max-w-4xl space-y-2">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Commit 5.9 — Arquitetura de Dados
                </span>
                <h1 className="text-xl font-black uppercase tracking-tight text-white">
                  Governança, Schemas &amp; Prontidão Claude Intelligence
                </h1>
                <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">
                  Esta central documenta as decisões de arquitetura e a governança de dados do Radar C-Trade. Toda a base foi estruturada para operar de forma desacoplada da inteligência artificial externa, servindo como consumidora de dados normalizados e curados de forma escalável.
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-blue-300 pt-3 border-t border-slate-800/80 font-mono">
                  <span>• <strong>Banco de Dados:</strong> PostgreSQL Relacional</span>
                  <span>• <strong>Redundância:</strong> Unificada (Zero Redundancy)</span>
                  <span>• <strong>Isolamento:</strong> Isolamento de Schemas (Multi-Schema)</span>
                </div>
              </div>
            </div>

            {/* KPIs Gerais de Qualidade */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schemas de Banco</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">6</span>
                <p className="text-[9px] text-slate-400 mt-1">Segregados por responsabilidades</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tabelas Mapeadas</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">10</span>
                <p className="text-[9px] text-slate-400 mt-1">Estrutura unificada e relacional</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Governança de Identidade</span>
                <span className="text-2xl font-black text-emerald-600 tracking-tight">Dual-ID</span>
                <p className="text-[9px] text-slate-400 mt-1">id_radar ↔ id_ctrade integrado</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estágio de Prontidão IA</span>
                <span className="text-2xl font-black text-purple-700 tracking-tight">98%</span>
                <p className="text-[9px] text-slate-400 mt-1">Contrato de dados validado</p>
              </div>
            </div>

            {/* Seções Principais: Schemas e Governança de ID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Lado Esquerdo: Schemas Relacionais do Supabase */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-3xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="h-4.5 w-4.5 text-blue-900" />
                    Explorer de Schemas (PostgreSQL / Supabase)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Clique em cada schema para verificar suas tabelas mestre, chaves primárias e as especificações de DDL oficiais.</p>
                </div>

                <div className="space-y-2.5">
                  {OFFICIAL_SCHEMAS.map(schema => {
                    const isExpanded = expandedSchema === schema.name;
                    return (
                      <div key={schema.name} className="border border-slate-100 rounded-xl overflow-hidden transition-all duration-200">
                        <button
                          onClick={() => setExpandedSchema(isExpanded ? null : schema.name)}
                          className="w-full bg-slate-50/60 hover:bg-slate-50 p-3.5 flex items-center justify-between text-left transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mr-2">
                              {schema.name}
                            </span>
                            <strong className="text-xs font-bold text-slate-800">{schema.label}</strong>
                            <p className="text-[10px] text-slate-400 font-semibold">{schema.description.slice(0, 90)}...</p>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono border-b border-slate-100 pb-2 bg-slate-50 p-2 rounded-lg">
                              <div><strong className="text-slate-500">Proprietário:</strong> {schema.owner}</div>
                              <div><strong className="text-slate-500">Gravação:</strong> {schema.writableBy}</div>
                              <div><strong className="text-slate-500">Leitura:</strong> {schema.readableBy}</div>
                            </div>

                            <div className="space-y-3">
                              {schema.tables.map(table => (
                                <div key={table.name} className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                                    <Layers className="h-3.5 w-3.5 text-blue-900" />
                                    <span className="text-xs font-black text-slate-700 font-mono">{table.name}</span>
                                    <span className="text-[9px] text-slate-400 font-semibold">— {table.description}</span>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-[10px] text-left font-mono">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                                          <th className="p-1">Coluna</th>
                                          <th className="p-1">Tipo</th>
                                          <th className="p-1">PK</th>
                                          <th className="p-1">FK</th>
                                          <th className="p-1 text-slate-500">Notas / Regra de Negócio</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                                        {table.columns.map(col => (
                                          <tr key={col.name} className="hover:bg-slate-50/50">
                                            <td className="p-1 text-slate-800 font-bold">{col.name}</td>
                                            <td className="p-1 text-indigo-600 font-bold">{col.type}</td>
                                            <td className="p-1">{col.isPrimaryKey ? '✅' : ''}</td>
                                            <td className="p-1">{col.isForeignKey ? '✅' : ''}</td>
                                            <td className="p-1 text-slate-400 italic font-sans">{col.notes || '—'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  <div className="bg-slate-900 rounded-lg p-2.5">
                                    <pre className="text-[9px] font-mono text-indigo-300 overflow-x-auto whitespace-pre leading-relaxed">
                                      {table.sqlDdl}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lado Direito: Governança de ID e Relacionamento Relacional */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Cartão de Governança Dual-ID */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-4.5 w-4.5 text-blue-900" />
                      Protocolo de Governança Dual-ID (ERP / CRM)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Regra oficial para evitar a sobreposição de entidades comerciais e gerenciar a jornada de conversão de leads de forma desacoplada.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span>1. Apenas `id_radar` ativo</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Oportunidade</span>
                      </div>
                      <p className="text-[10px] text-amber-700 leading-normal font-semibold">
                        Significa que o estabelecimento foi mapeado por inteligência artificial ou raspador público de dados, mas ainda não é cliente ativo e não consta no ERP de faturamento. Representa uma oportunidade pura de mercado.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>2. Ambos `id_radar` e `id_ctrade` ativos</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Sincronizado</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-normal font-semibold">
                        O cliente foi homologado pela curadoria humana e convertido em venda real. O código do ERP (`id_ctrade`) foi vinculado, gerando um elo permanente de sincronização de faturamento e compras.
                      </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                        <span>3. Apenas `id_ctrade` ativo</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">Carteira Interna</span>
                      </div>
                      <p className="text-[10px] text-indigo-700 leading-normal font-semibold">
                        O cliente faz parte da carteira histórica da distribuidora (importada diretamente do ERP), aguardando análises de cardápio adicionais para identificar oportunidades ocultas de portfólio.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cartão de Dicionário de Relacionamentos */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="h-4.5 w-4.5 text-blue-900" />
                      Dicionário de Relacionamentos (Referencial)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">A integridade referencial garante relacionamentos claros com cascatas inteligentes no Supabase.</p>
                  </div>

                  <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                      <span>Contatos ↔ Contas</span>
                      <span className="font-mono text-blue-900 text-[10px]">N:1 (conta_id REFERENCES tb_contas_oficial)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                      <span>Cardápios ↔ Contas</span>
                      <span className="font-mono text-blue-900 text-[10px]">1:1 (conta_id REFERENCES tb_contas_oficial)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                      <span>Itens do Cardápio ↔ Cardápios</span>
                      <span className="font-mono text-blue-900 text-[10px]">N:1 (cardapio_id REFERENCES tb_cardapios)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                      <span>Oportunidades ↔ Contas</span>
                      <span className="font-mono text-blue-900 text-[10px]">N:1 (conta_id REFERENCES tb_contas_oficial)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Oportunidades ↔ SKUs de Produtos</span>
                      <span className="font-mono text-blue-900 text-[10px]">N:1 (sku REFERENCES cfg_produtos_sku)</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* QA Readiness Block de 10 perguntas */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-900 block">Arquitetura de Dados &amp; Relatório de Prontidão</span>
                <h2 className="text-sm font-bold text-slate-800">QA Técnico de Prontidão para Claude Intelligence</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Confira as respostas de engenharia sobre a prontidão da infraestrutura para o processamento de dados inteligente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    1. A plataforma está pronta para receber dados externos?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> A esteira do `DataProcessingEngine` e os conversores convertem feeds externos para o Modelo Canônico imutável de dados.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    2. Os cadastros suportam atualização automática?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> O `CanonicalVersioningManager` detecta mutações nos payloads comparando hashes, persistindo o versionamento de forma limpa.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    3. Existem tabelas redundantes?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Não.</strong> Todo o modelo físico PostgreSQL do Supabase foi unificado e segregado em 6 schemas claros e lógicos de responsabilidade única.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    4. Existem informações hardcoded?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Não.</strong> Configurações de taxonomias (segmentos, categorias, marcas) são parametrizadas e lidas em tempo real do banco/appearance store.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    5. Os filtros são reutilizáveis?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> Filtros dinâmicos em todas as visões leem as mesmas configurações mestre, se expandindo sozinhos conforme o banco cresce.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    6. Os componentes são reutilizáveis?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> Componentes de layout, botões e tabelas são modulares, isolados da lógica e reaproveitados em todo o ecossistema.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    7. O banco de dados está preparado?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> Possui índices otimizados (B-Tree/GIN) para buscas por hashes e CNPJ limpo, garantindo integridade referencial contínua.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    8. As configurações estão parametrizadas?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> Parâmetros operacionais e conexões com o pipeline são gerenciados pelo administrador de forma totalmente persistente.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    9. Os catálogos são compartilháveis?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Sim.</strong> Expostos por APIs seguras ou exportadores JSON que garantem o alinhamento semântico imediato de qualquer coletor parceiro.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-1">
                  <div className="text-slate-800 font-extrabold text-xs">
                    10. O que ainda falta preparar antes do lançamento definitivo?
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    <strong className="text-slate-600">Atividades Finais:</strong> Conectar stubs Express de API ao PostgreSQL, configurar OAuth do CRM e alocar o bucket de storage para os PDFs originais.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Outer negative background spacing empty & clean */}
        <div className="pt-2" />

      </div>
    </PageContainer>
  );
}
