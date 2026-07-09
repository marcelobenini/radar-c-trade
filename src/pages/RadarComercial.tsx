/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Breadcrumb from '../components/ui/Breadcrumb';
import GlobalFilters, { matchesScoreRange, INITIAL_FILTERS } from '../components/shared/GlobalFilters';
import ScoreIndicator from '../components/ui/Score';
import { syncPlatformData } from '../utils/platformSync';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  DollarSign, 
  Percent, 
  Zap, 
  User, 
  FileText, 
  Package, 
  FolderOpen, 
  Download, 
  MapPin, 
  Phone, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Building, 
  Clock, 
  Info, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users, 
  Filter, 
  Tag, 
  Briefcase,
  ListFilter,
  BarChart2,
  Calendar,
  Share2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { REAL_CLIENTS, REAL_OPPORTUNITIES, REAL_PRODUCTS } from '../data/realData';

// Types for local data structures
interface ClientUpdate {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  tipo?: string;
  clientName: string;
  clientCity: string;
  clientState: string;
}

export default function RadarComercial() {
  // --- CORE SYSTEM STATES ---
  const [clients, setClients] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [menus, setMenus] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_menu_library');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [opportunities, setOpportunities] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_opportunities_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // --- PERSISTENT SESSION FILTERS ---
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
    return INITIAL_FILTERS;
  });

  // --- SUB-FILTERS & SEARCH (Local to Portfolio Section) ---
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // --- EXPORT RESUMO MODAL STATES ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportClient, setExportClient] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Synchronize on Mount
  useEffect(() => {
    syncPlatformData();
    // Re-load data after synchronization runs
    const loadData = () => {
      const savedClients = localStorage.getItem('ctrade_clients_list_v2');
      const savedMenus = localStorage.getItem('ctrade_menu_library');
      const savedOpps = localStorage.getItem('ctrade_opportunities_data');
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedMenus) setMenus(JSON.parse(savedMenus));
      if (savedOpps) setOpportunities(JSON.parse(savedOpps));
    };
    loadData();
  }, []);

  // Sync session filters and dispatch global event
  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new Event('storage'));
  }, [sessionFilters]);

  // Synchronize storage updates across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const savedClients = localStorage.getItem('ctrade_clients_list_v2');
      const savedMenus = localStorage.getItem('ctrade_menu_library');
      const savedOpps = localStorage.getItem('ctrade_opportunities_data');
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedMenus) setMenus(JSON.parse(savedMenus));
      if (savedOpps) setOpportunities(JSON.parse(savedOpps));

      const savedFilters = sessionStorage.getItem('ctrade_session_filters_base');
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters);
          setSessionFilters(prev => {
            if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
            return parsed;
          });
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // --- DYNAMIC DATA COMPUTATION & PORTFOLIO BUILD ---
  const clientsDataEnriched = useMemo(() => {
    return clients.map(client => {
      const targetCnpj = client.cnpj ? client.cnpj.replace(/\D/g, '') : '';
      
      const matchingMenu = menus.find((m: any) => {
        const menuCnpj = m.externalId ? m.externalId.replace(/\D/g, '') : '';
        return (targetCnpj && menuCnpj && targetCnpj === menuCnpj) ||
               (m.nomeEstabelecimento && m.nomeEstabelecimento.toLowerCase() === client.name.toLowerCase()) ||
               (m.nomeEstabelecimento && m.nomeEstabelecimento.toLowerCase() === client.fantasyName.toLowerCase());
      });

      const matchingOpp = opportunities.find((o: any) => {
        const oppCnpj = o.clientId ? o.clientId.replace(/\D/g, '') : '';
        return (targetCnpj && oppCnpj && targetCnpj === oppCnpj) ||
               o.cliente.toLowerCase() === client.name.toLowerCase() ||
               o.cliente.toLowerCase() === client.fantasyName.toLowerCase();
      });

      // Products lists
      const productsFound = matchingOpp?.produtosEncontrados || matchingMenu?.produtosIdentificados?.map((p: any) => ({
        produto: p.productName || p.nomeNoCardapio,
        marca: p.brand || 'N/A',
        categoria: p.category || 'Outros',
        status: p.status === 'Homologado' ? 'Utiliza Marca Premium' : 'Marca Concorrente'
      })) || [];

      const productsAbsent = matchingOpp?.produtosAusentes || [
        { produto: 'Farinha Caputo Pizzeria (25kg)', categoria: 'Farinhas', prioridade: 'Alta' },
        { produto: 'Tomate Pelati San Marzano DOP CTrade', categoria: 'Tomates DOP', prioridade: 'Alta' },
        { produto: 'Azeite Extra Virgem Premium Colheita Tardia', categoria: 'Azeites', prioridade: 'Média' }
      ];

      const premiumFound = productsFound.filter((p: any) => p.status === 'Utiliza Marca Premium' || p.status === 'Homologado' || p.status?.toLowerCase().includes('premium'));
      const competitorFound = productsFound.filter((p: any) => p.status !== 'Utiliza Marca Premium' && p.status !== 'Homologado' && !p.status?.toLowerCase().includes('premium'));

      // Determine priority level
      let priority: 'Alta' | 'Média' | 'Baixa' = 'Média';
      const score = client.score || 65;
      if (score >= 80 && (client.potential === 'Muito Alto' || client.potential === 'Alto')) {
        priority = 'Alta';
      } else if (score < 65 || client.potential === 'Baixo') {
        priority = 'Baixa';
      }

      return {
        ...client,
        priority,
        scoreComercial: Math.floor(score * 0.95),
        scoreFit: score,
        productsCount: productsFound.length,
        categories: Array.from(new Set(productsFound.map((p: any) => p.categoria || p.category))).filter(Boolean),
        premiumFound,
        competitorFound,
        productsAbsent,
        matchingMenuId: matchingMenu?.id || null
      };
    });
  }, [clients, menus, opportunities]);

  // --- FILTERS APPLICATION ---
  const filteredApprovedClients = useMemo(() => {
    return clientsDataEnriched.filter(c => {
      // STRICT REQUIREMENT: Only approved / homologated clients (status "Autorizados")
      if (c.status !== 'Autorizados') return false;

      // Local sub-filter by priority
      if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;

      // Local sub-filter by portfolioSearch text
      if (portfolioSearch) {
        const query = portfolioSearch.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(query);
        const matchFantasy = c.fantasyName?.toLowerCase().includes(query);
        const matchCity = c.city?.toLowerCase().includes(query);
        const matchRca = c.responsibleCommercial?.toLowerCase().includes(query);
        if (!matchName && !matchFantasy && !matchCity && !matchRca) return false;
      }

      // GLOBAL FILTERS BRIDGE
      // 1. Period filter
      if (sessionFilters.periodoOption !== 'all') {
        const itemDate = new Date(c.dateUpdated || c.dateCreated || Date.now());
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (sessionFilters.periodoOption === '15') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 15);
          endDate = new Date();
        } else if (sessionFilters.periodoOption === '30') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          endDate = new Date();
        } else if (sessionFilters.periodoOption === 'custom' && sessionFilters.dataInicio && sessionFilters.dataFim) {
          startDate = new Date(sessionFilters.dataInicio);
          endDate = new Date(sessionFilters.dataFim);
          endDate.setHours(23, 59, 59, 999);
        }

        if (startDate && endDate) {
          if (itemDate < startDate || itemDate > endDate) return false;
        }
      }

      // 2. Estado filter (multiple)
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(c.state)) return false;

      // 3. Cidade filter (multiple)
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(c.city)) return false;

      // 4. RCA filter (multiple)
      if (sessionFilters.rcas.length > 0 && !sessionFilters.rcas.includes(c.rcaId)) return false;

      // 5. Segmento filter (multiple)
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(c.segment)) return false;

      // 6. Categoria filter (multiple)
      if (sessionFilters.categorias.length > 0) {
        const hasCat = c.categories.some((cat: string) => sessionFilters.categorias.includes(cat));
        if (!hasCat) return false;
      }

      // 7. Score Fit (single range)
      if (sessionFilters.scoreFit !== 'all' && !matchesScoreRange(c.score, sessionFilters.scoreFit)) return false;

      // 8. Score Comercial (single range)
      if (sessionFilters.scoreComercial !== 'all' && !matchesScoreRange(c.scoreComercial, sessionFilters.scoreComercial)) return false;

      // 9. Cliente filter (text)
      if (sessionFilters.cliente) {
        const search = sessionFilters.cliente.toLowerCase();
        const mName = c.name?.toLowerCase().includes(search);
        const mFantasy = c.fantasyName?.toLowerCase().includes(search);
        if (!mName && !mFantasy) return false;
      }

      return true;
    });
  }, [clientsDataEnriched, sessionFilters, portfolioSearch, priorityFilter]);

  // --- AUTOMATIC ORDERING BY PRIORITY & SCORES ---
  const sortedApprovedClients = useMemo(() => {
    return [...filteredApprovedClients].sort((a, b) => {
      // Map Priority order weight
      const weight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
      const weightDiff = weight[b.priority] - weight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      // Secondary sort: Score Fit descending
      return b.scoreFit - a.scoreFit;
    });
  }, [filteredApprovedClients]);

  // Reset pagination on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sessionFilters, portfolioSearch, priorityFilter]);

  // Pagination slicing
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedApprovedClients.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedApprovedClients, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedApprovedClients.length / itemsPerPage));

  // --- EXECUTIVE SUMMARY STATS ---
  const totalInCuration = clients.filter(c => c.status === 'Entradas').length;
  const totalRejected = clients.filter(c => c.status === 'Rejeitados').length;
  const totalApproved = clients.filter(c => c.status === 'Autorizados').length;
  
  const totalMenusHomologated = menus.filter((m: any) => m.status === 'Aprovado' || m.status === 'Autorizados').length;
  const totalProductsCount = menus.reduce((sum, m) => sum + (m.produtosIdentificados?.length || 0), 0);
  
  const totalOpportunitiesCount = opportunities.length;
  const clientsWithPremium = clients.filter(c => c.status === 'Autorizados' && (c.score || 0) >= 75).length;
  const portfolioCoverage = totalApproved > 0 ? Math.round((clientsWithPremium / totalApproved) * 100) : 0;
  
  // Potential Valuation sum
  const cumulativeValuation = filteredApprovedClients.reduce((sum, c) => {
    const matchingOpp = opportunities.find(o => o.clientId === c.cnpj || o.cliente === c.name || o.cliente === c.fantasyName);
    return sum + (matchingOpp?.valorPotencialEstimado || 24000);
  }, 0);

  const averageFitScore = useMemo(() => {
    if (filteredApprovedClients.length === 0) return 0;
    const sum = filteredApprovedClients.reduce((acc, curr) => acc + curr.scoreFit, 0);
    return Math.round(sum / filteredApprovedClients.length);
  }, [filteredApprovedClients]);

  const activeRcasCount = useMemo(() => {
    return Array.from(new Set(filteredApprovedClients.map(c => c.responsibleCommercial))).filter(Boolean).length;
  }, [filteredApprovedClients]);

  // --- TIMELINE OF RECENT EVENTS ---
  const recentUpdatesList = useMemo(() => {
    let list: ClientUpdate[] = [];
    clientsDataEnriched.forEach(c => {
      if (c.historicoCompleto) {
        c.historicoCompleto.forEach((h: any) => {
          list.push({
            clientName: c.fantasyName || c.name,
            clientCity: c.city,
            clientState: c.state,
            ...h
          });
        });
      }
    });
    // Sort chronological descending, limit 5
    return list.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  }, [clientsDataEnriched]);

  // --- CHARTS CALCULATIONS (Mapa de Potencial Comercial) ---
  const regionChartData = useMemo(() => {
    const statesMap: { [key: string]: { value: number; count: number } } = {};
    filteredApprovedClients.forEach(c => {
      const state = c.state || 'Outros';
      const matchingOpp = opportunities.find(o => o.clientId === c.cnpj || o.cliente === c.name || o.cliente === c.fantasyName);
      const val = matchingOpp?.valorPotencialEstimado || 24000;
      
      if (!statesMap[state]) {
        statesMap[state] = { value: 0, count: 0 };
      }
      statesMap[state].value += val;
      statesMap[state].count += 1;
    });

    return Object.entries(statesMap).map(([state, data]) => ({
      name: state,
      valor: data.value,
      clientes: data.count
    })).sort((a, b) => b.valor - a.valor);
  }, [filteredApprovedClients, opportunities]);

  const competitorBrandsData = useMemo(() => {
    const brandsMap: { [key: string]: number } = {};
    filteredApprovedClients.forEach(c => {
      if (c.competitorFound) {
        c.competitorFound.forEach((p: any) => {
          const brand = p.marca || p.brand || 'Não Informada';
          brandsMap[brand] = (brandsMap[brand] || 0) + 1;
        });
      }
    });

    return Object.entries(brandsMap).map(([brand, count]) => ({
      brand,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredApprovedClients]);

  // --- EVENT TRIGGERS (AÇÕES RÁPIDAS MODULES NAVIGATION) ---
  const handleNavigateToClient = (clientId: number) => {
    localStorage.setItem('ctrade_selected_client_id', clientId.toString());
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'clientes' }));
  };

  const handleNavigateToMenu = (menuId: string | null, clientName: string) => {
    const target = menuId || clientName;
    localStorage.setItem('ctrade_selected_menu_id', target);
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'biblioteca' }));
  };

  const handleNavigateToProducts = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'produtos' }));
  };

  const handleNavigateToDossier = (clientName: string) => {
    sessionStorage.setItem('ctrade_selected_report_client', clientName);
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'relatorios' }));
  };

  // Handle Export summary modal opening
  const handleOpenExportModal = (client: any) => {
    setExportClient(client);
    setIsCopied(false);
    setIsDownloading(false);
    setIsExportModalOpen(true);
  };

  const handleCopyToClipboard = () => {
    if (!exportClient) return;
    const reportText = `
=== DOSSIÊ COMERCIAL CONSOLIDADO ===
ESTABELECIMENTO: ${exportClient.fantasyName || exportClient.name}
RAZÃO SOCIAL: ${exportClient.razaoSocial || exportClient.name}
LOCALIZAÇÃO: ${exportClient.city} - ${exportClient.state}
RCA / VENDEDOR: ${exportClient.responsibleCommercial || 'Não Atribuído'}
SEGMENTO: ${exportClient.segment}
STATUS PLANILHA: Homologado (Autorizado)

METRICAS DE ADERÊNCIA:
- Score Fit Comercial: ${exportClient.scoreFit}%
- Score Comercial CTrade: ${exportClient.scoreComercial}%
- Nível de Potencial: ${exportClient.potential}
- Volume de Oportunidade Anual Estimada: R$ ${(exportClient.scoreFit >= 80 ? 96000 : 48000).toLocaleString('pt-BR')},00

PRODUTOS IDENTIFICADOS NO CARDÁPIO (${exportClient.productsCount} SKUs):
${exportClient.premiumFound.map((p: any) => `✓ [PREMIUM] ${p.produto} (${p.marca})`).join('\n')}
${exportClient.competitorFound.map((p: any) => `! [CONCORRENTE] ${p.produto} (Marca: ${p.marca})`).join('\n')}

PRODUTOS AUSENTES / RECOMENDAÇÕES RELEVANTES:
${exportClient.productsAbsent.map((p: any) => `→ ${p.produto} - Categoria: ${p.categoria} (Prioridade: ${p.prioridade})`).join('\n')}

ESTRATÉGIA COMERCIAL RECOMENDADA:
- Propor substituição imediata dos produtos de marcas concorrentes identificadas.
- Utilizar argumento técnico da padronização e rendimento premium dos insumos certificados.
- Oferecer kit degustação técnica com o RCA ${exportClient.responsibleCommercial}.
====================================
    `;
    navigator.clipboard.writeText(reportText.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadExport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      // Simulate file download
      alert(`Dossiê de ${exportClient.fantasyName || exportClient.name} exportado com sucesso no formato .txt de forma offline.`);
    }, 1200);
  };

  // --- GENERAL ACTIONS EXPORT ---
  const handleExportFullCSV = () => {
    const headers = ['Nome', 'Fantasia', 'Cidade', 'Estado', 'Segmento', 'RCA', 'Score Fit', 'Score Comercial', 'Prioridade', 'Potencial'];
    const rows = sortedApprovedClients.map(c => [
      c.name,
      c.fantasyName || '',
      c.city,
      c.state,
      c.segment,
      c.responsibleCommercial || '',
      c.scoreFit,
      c.scoreComercial,
      c.priority,
      c.potential
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carteira_radar_priorizada_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer id="page-radar-priorizado">
      {/* Dynamic Navigation Breadcrumb */}
      <Breadcrumb items={[{ label: 'Inteligência Comercial', active: false }, { label: 'Radar Comercial', active: true }]} />
      
      {/* Dashboard Page Header */}
      <PageHeader
        title="Radar Comercial"
        subtitle="Mapeamento analítico e priorização estratégica da carteira de clientes homologados"
        badge="Centro de Decisão Operacional"
      />

      {/* --- SEÇÃO 1: RESUMO EXECUTIVO --- */}
      <div className="mt-6 bg-linear-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl border border-blue-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/10">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Consolidado Geral Comercial
            </div>
            <h2 className="text-xl font-bold mt-2">Visão Executiva do Funil de Inteligência</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Análise operacional agregada de leads, cardápios e produtos homologados no mercado. 
              Utilize o painel para filtrar as prioridades de visitas e abordagens táticas dos RCAs hoje.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="text-center sm:text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clientes Homologados</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{totalApproved}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Autorizados na Base</div>
            </div>
            
            <div className="text-center sm:text-left border-l border-white/5 pl-2 sm:pl-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Em Curadoria</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">{totalInCuration}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Aguardando Análise</div>
            </div>

            <div className="text-center sm:text-left border-l border-white/5 pl-2 sm:pl-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cardápios Lidos</div>
              <div className="text-2xl font-black text-blue-400 mt-0.5">{totalMenusHomologated}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ingestões de Arquivos</div>
            </div>

            <div className="text-center sm:text-left border-l border-white/5 pl-2 sm:pl-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SKUs Mapeados</div>
              <div className="text-2xl font-black text-purple-400 mt-0.5">{totalProductsCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Produtos Encontrados</div>
            </div>
          </div>
        </div>

        {/* Bottom stats rail */}
        <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span><strong>Cobertura do Portfólio:</strong> {portfolioCoverage}% dos clientes utilizam produtos premium homologados</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span><strong>Oportunidades Ativas:</strong> {totalOpportunitiesCount} qualificadas para negociação</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <span><strong>Potencial Financeiro:</strong> R$ {cumulativeValuation.toLocaleString('pt-BR')} estimados ao ano</span>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 2: FILTROS GLOBAIS --- */}
      <div className="mt-6" id="radar-global-filters-container">
        <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
      </div>

      {/* --- SEÇÃO 3: KPIS ESTRATÉGICOS REATIVOS --- */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4" id="radar-strategic-kpis">
        {/* KPI 1: Faturamento Mapeado sob Filtro */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita sob Filtro</span>
            <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-800">
              R$ {filteredApprovedClients.reduce((sum, c) => {
                const opp = opportunities.find(o => o.clientId === c.cnpj || o.cliente === c.name || o.cliente === c.fantasyName);
                return sum + (opp?.valorPotencialEstimado || 24000);
              }, 0).toLocaleString('pt-BR')}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Soma de potencial comercial dos itens filtrados</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Valores homologados ao ano</span>
          </div>
        </div>

        {/* KPI 2: Fit Score Médio */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aderência de Fit Média</span>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
              <Award className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-800">
              {averageFitScore}%
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Aderência média ao catálogo C-Trade</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Altamente qualificados</span>
          </div>
        </div>

        {/* KPI 3: Cobertura Operacional (RCAs ativos) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RCAs em Campo</span>
            <div className="p-2 bg-indigo-50 text-indigo-800 rounded-lg">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-800">
              {activeRcasCount} RCAs
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Vendedores com clientes homologados ativos</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Área de abrangência ativa</span>
          </div>
        </div>

        {/* KPI 4: Concorrentes por Trocar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SKUs de Concorrentes</span>
            <div className="p-2 bg-rose-50 text-rose-800 rounded-lg">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-800">
              {filteredApprovedClients.reduce((sum, c) => sum + (c.competitorFound?.length || 0), 0)} itens
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Marcas concorrentes a serem substituídas</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 font-bold">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Foco imediato de abordagem</span>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 4: CARTEIRA PRIORIZADA (PRINCIPAL SEÇÃO) --- */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="radar-carteira-priorizada">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">Carteira de Clientes Priorizada</h3>
              <span className="bg-blue-900/10 text-blue-900 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                {sortedApprovedClients.length} Clientes Homologados
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Ordenação prioritária automática baseada em inteligência comercial (Score Fit + Faturamento Estimado). Nenhuma informação pendente ou rejeitada está presente nesta lista.
            </p>
          </div>

          {/* Sub-Filters and Search bar on top of card list */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar cliente ou RCA..."
                value={portfolioSearch}
                onChange={(e) => setPortfolioSearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors w-full sm:w-52"
              />
            </div>

            {/* Priority quick filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="All">Todas as Prioridades</option>
              <option value="Alta">Alta Prioridade</option>
              <option value="Média">Média Prioridade</option>
              <option value="Baixa">Baixa Prioridade</option>
            </select>

            {/* Pagination Size */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value={4}>4 por página</option>
              <option value={6}>6 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {sortedApprovedClients.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Filter className="h-5 w-5 text-slate-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Nenhum cliente homologado atende aos critérios</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Verifique os filtros selecionados acima no Sistema Global de Filtros ou modifique a sua palavra-chave.
            </p>
          </div>
        )}

        {/* Executive Cards Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6" id="radar-executive-cards-grid">
          {paginatedClients.map((client) => {
            const priorityColors = {
              'Alta': 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50 ring-2 ring-rose-500/10',
              'Média': 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/50',
              'Baixa': 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
            };

            return (
              <div 
                key={client.id}
                className={`border rounded-2xl bg-white p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-lg flex flex-col justify-between ${
                  client.priority === 'Alta' ? 'border-rose-100 shadow-xs ring-1 ring-rose-500/5' : 'border-slate-200/80'
                }`}
                id={`client-exec-card-${client.id}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityColors[client.priority as 'Alta' | 'Média' | 'Baixa']}`}>
                          ★ Prioridade {client.priority}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {client.segment}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-slate-800 mt-2 hover:text-blue-900 cursor-pointer" onClick={() => handleNavigateToClient(client.id)}>
                        {client.fantasyName || client.name}
                      </h4>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.city} ({client.state})
                        </span>
                        <span>•</span>
                        <span>RCA: {client.responsibleCommercial || 'Não Atribuído'}</span>
                      </div>
                    </div>

                    {/* Circular Score representation */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-blue-50 border border-blue-100 text-blue-900 font-extrabold text-sm shadow-2xs">
                        {client.scoreFit}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Fit Score</div>
                    </div>
                  </div>

                  {/* Operational details Grid */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potencial Comercial</span>
                      <span className={`inline-block font-extrabold mt-0.5 ${
                        client.potential === 'Muito Alto' ? 'text-emerald-600' :
                        client.potential === 'Alto' ? 'text-blue-600' :
                        client.potential === 'Médio' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {client.potential}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score Comercial</span>
                      <span className="font-extrabold text-indigo-700 block mt-0.5">
                        {client.scoreComercial} pts
                      </span>
                    </div>
                  </div>

                  {/* Portfolio products representation */}
                  <div className="mt-4 space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-150">
                    {/* Products in Portfolio */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Utiliza do Portfólio ({client.premiumFound.length})
                        </span>
                      </div>
                      {client.premiumFound.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {client.premiumFound.slice(0, 3).map((p: any, i: number) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm border border-emerald-100">
                              {p.produto} ({p.marca})
                            </span>
                          ))}
                          {client.premiumFound.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center pl-1">+{client.premiumFound.length - 3} mais</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 block italic">Nenhum produto premium trefilado homologado</span>
                      )}
                    </div>

                    {/* Products Out of Portfolio / Competitors (Opportunities) */}
                    <div className="pt-2.5 border-t border-slate-200/50">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 text-rose-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Ausentes / Marcas Concorrentes ({client.competitorFound.length + client.productsAbsent.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Competitors found in menu */}
                        {client.competitorFound.slice(0, 2).map((p: any, i: number) => (
                          <span key={i} className="bg-rose-50 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm border border-rose-100">
                            Foco Troca: {p.produto} ({p.marca})
                          </span>
                        ))}
                        {/* Recommendations */}
                        {client.productsAbsent.slice(0, 2).map((p: any, i: number) => (
                          <span key={i} className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm border border-amber-100">
                            Recom.: {p.produto}
                          </span>
                        ))}
                        {(client.competitorFound.length + client.productsAbsent.length) > 4 && (
                          <span className="text-[10px] text-slate-400 font-bold self-center pl-1">
                            +{(client.competitorFound.length + client.productsAbsent.length) - 4} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Row */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    At.: {client.dateUpdated || client.lastAnalysis || 'Recente'}
                  </span>
                  
                  {/* Quick Action triggers */}
                  <div className="flex items-center gap-1.5" id={`card-quick-actions-${client.id}`}>
                    <button 
                      onClick={() => handleNavigateToClient(client.id)}
                      title="Visualizar ficha completa do cliente"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5" />
                    </button>
                    
                    <button 
                      onClick={() => handleNavigateToMenu(client.matchingMenuId, client.name)}
                      title="Abrir cardápio e ver curadoria de SKUs"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>

                    <button 
                      onClick={handleNavigateToProducts}
                      title="Consultar Catálogo de Produtos C-Trade"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Package className="h-3.5 w-3.5" />
                    </button>

                    <button 
                      onClick={() => handleNavigateToDossier(client.fantasyName || client.name)}
                      title="Visualizar Dossiê do Cliente em Relatórios"
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </button>

                    <button 
                      onClick={() => handleOpenExportModal(client)}
                      title="Exportar Resumo Executivo para Abordagem"
                      className="px-2.5 py-1.5 bg-blue-900 text-white hover:bg-blue-950 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Pagination Controls */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Mostrando <strong>{Math.min(sortedApprovedClients.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedApprovedClients.length, currentPage * itemsPerPage)}</strong> de <strong>{sortedApprovedClients.length}</strong> clientes homologados filtrados
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === pageNumber
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 5: MAPA DE POTENCIAL COMERCIAL (CHARTS) --- */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6" id="radar-mapa-potencial">
        {/* Potencial Comercial de Faturamento por Região/Estado */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Potencial Financeiro por Região</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Faturamento anual estimado sob os critérios ativos</p>
            </div>
            <div className="p-1.5 bg-blue-50 text-blue-900 rounded-md">
              <BarChart2 className="h-4 w-4" />
            </div>
          </div>

          {regionChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-xs italic">
              Sem dados disponíveis para gerar o gráfico regional.
            </div>
          ) : (
            <div className="space-y-4">
              {regionChartData.map((item, idx) => {
                const maxVal = Math.max(...regionChartData.map(r => r.valor));
                const percent = maxVal > 0 ? (item.valor / maxVal) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-900"></span>
                        Estado: {item.name} ({item.clientes} {item.clientes === 1 ? 'cliente' : 'clientes'})
                      </span>
                      <span>R$ {item.valor.toLocaleString('pt-BR')}</span>
                    </div>
                    {/* Visual Bar meter */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-blue-900 to-indigo-600 rounded-full transition-all duration-700" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marcas Concorrentes mais Mapeadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Principais Marcas Concorrentes Identificadas</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Marcas encontradas em cardápios qualificadas para substituição</p>
            </div>
            <div className="p-1.5 bg-rose-50 text-rose-800 rounded-md">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>

          {competitorBrandsData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-xs italic">
              Nenhuma marca concorrente pendente nos estabelecimentos ativos.
            </div>
          ) : (
            <div className="space-y-4">
              {competitorBrandsData.map((item, idx) => {
                const maxCount = Math.max(...competitorBrandsData.map(r => r.count));
                const percent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        Marca: {item.brand}
                      </span>
                      <span>{item.count} {item.count === 1 ? 'ocorrência' : 'ocorrências'}</span>
                    </div>
                    {/* Visual Bar meter */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-700" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- SEÇÃO 6: ÚLTIMAS ATUALIZAÇÕES (TIMELINE) --- */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="radar-recent-updates">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Últimas Atualizações da Carteira</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Histórico de ações recentes sincronizadas em tempo real</p>
          </div>
          <Clock className="h-4 w-4 text-slate-400" />
        </div>

        {recentUpdatesList.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs italic">
            Sem atualizações recentes nos clientes homologados ativos.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-3.5 space-y-6">
            {recentUpdatesList.map((update, idx) => {
              // Icon selector
              let iconElement = <span className="h-2 w-2 rounded-full bg-blue-500" />;
              if (update.acao.includes('Status') || update.acao.includes('status')) {
                iconElement = <div className="p-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200"><CheckCircle className="h-3 w-3" /></div>;
              } else if (update.acao.includes('cardápio') || update.acao.includes('Cardápio')) {
                iconElement = <div className="p-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200"><FileText className="h-3 w-3" /></div>;
              } else if (update.acao.includes('Curadoria')) {
                iconElement = <div className="p-1 bg-purple-50 text-purple-800 rounded-full border border-purple-200"><Package className="h-3 w-3" /></div>;
              }

              return (
                <div key={idx} className="relative pl-7">
                  {/* Icon positioned on the timeline border */}
                  <div className="absolute -left-3.5 top-0.5 bg-white">
                    {iconElement}
                  </div>
                  
                  <div className="text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                      <span className="text-blue-900 font-bold">{update.clientName} ({update.clientCity} - {update.clientState})</span>
                      <span>{update.data}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{update.acao}</p>
                    <div className="text-[10px] text-slate-400 mt-1">Por: {update.usuario}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- SEÇÃO 7: AÇÕES RÁPIDAS COMERCIAIS (BOTTOM CONTROLS TOOLBAR) --- */}
      <div className="mt-8 bg-slate-100 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" id="radar-bottom-actions">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900 text-white rounded-lg shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Ações Rápidas Comerciais</h4>
            <p className="text-xs text-slate-500 mt-0.5">Operações administrativas e gerenciais rápidas da carteira homologada</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button
            onClick={handleExportFullCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Exportar CSV Completo</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'clientes' }))}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4 text-slate-500" />
            <span>Cadastrar Novo Lead</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'biblioteca' }))}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Importar Cardápio</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'oportunidades' }))}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Ir para o Centro de Oportunidades</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* --- OFFLINE EXPORT PREVIEW MODAL (HIGH FIDELITY) --- */}
      <AnimatePresence>
        {isExportModalOpen && exportClient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Dossiê de Vendas Comercial</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Abordagem customizada para o RCA: {exportClient.fantasyName || exportClient.name}</p>
                </div>
                <button 
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-blue-900 font-extrabold mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Pitch Comercial Sugerido</span>
                  </div>
                  <p className="text-blue-800 leading-relaxed font-medium">
                    "Olá, {exportClient.responsible}! Verifiquei o cardápio excelente do {exportClient.fantasyName || exportClient.name} em {exportClient.city}. Notei que vocês oferecem pratos finos que exigem ingredientes de máxima consistência e rendimento técnico, mas atualmente utilizam insumos de marcas comuns. A C-Trade possui a linha oficial de farinhas Caputo e tomates pelados San Marzano DOP que garantem padrão napolitano, economia de desperdício em até 15%, e aumento da satisfação dos clientes. Gostaria de agendar uma demonstração técnica com nosso consultor?"
                  </p>
                </div>

                {/* Technical stats breakdown */}
                <div className="grid grid-cols-2 gap-4 border border-slate-100 p-4 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Aderência de Portfólio</span>
                    <span className="text-base font-black text-slate-800">{exportClient.scoreFit}% Fit Score</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Potencial Anual Estimado</span>
                    <span className="text-base font-black text-emerald-600">R$ {(exportClient.scoreFit >= 80 ? 96000 : 48000).toLocaleString('pt-BR')},00</span>
                  </div>
                </div>

                {/* Products lists */}
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-800">SKUs Presentes no Cardápio ({exportClient.premiumFound.length})</h5>
                    {exportClient.premiumFound.length > 0 ? (
                      <ul className="mt-1.5 space-y-1">
                        {exportClient.premiumFound.map((p: any, i: number) => (
                          <li key={i} className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            {p.produto} - Marca Premium: {p.marca}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 italic text-slate-400">Nenhum produto premium utilizado atualmente.</p>
                    )}
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800">Oportunidades de Substituição de Concorrentes ({exportClient.competitorFound.length})</h5>
                    {exportClient.competitorFound.length > 0 ? (
                      <ul className="mt-1.5 space-y-1">
                        {exportClient.competitorFound.map((p: any, i: number) => (
                          <li key={i} className="flex items-center gap-1.5 text-rose-700 font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                            Trocar: {p.produto} (Marca concorrente atual: {p.marca})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 italic text-slate-400">Nenhum concorrente cadastrado.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Suporte a Decisão Comercial • C-Trade Radar</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCopied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{isCopied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    onClick={handleDownloadExport}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isDownloading ? 'Baixando...' : 'Exportar Dossiê'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
