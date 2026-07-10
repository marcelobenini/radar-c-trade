/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, ProgressBar, Spinner, Toast, EmptyState } from '../components/ui/Feedback';
import ScoreIndicator from '../components/ui/Score';
import GlobalFilters, { matchesScoreRange } from '../components/shared/GlobalFilters';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';

import {
  Package,
  Search,
  SlidersHorizontal,
  Star,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Info,
  X,
  Plus,
  Compass,
  Award,
  ListFilter,
  Grid,
  List,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Eraser,
  XCircle,
  Link2
} from 'lucide-react';

const rcas = [
  { id: 'rca-marcelo', name: 'RCA Marcelo Baquero' },
  { id: 'rca-amanda', name: 'RCA Amanda Souza' },
  { id: 'rca-pedro', name: 'RCA Pedro Santos' },
  { id: 'rca-lucas', name: 'RCA Lucas Oliveira' },
];

/// --- DATA STRUCTURE ---
interface Product {
  id: string;
  sku: string; // Código SKU
  name: string;
  brand: string;
  category: string;
  origin: string;
  description: string;
  longDescription: string;
  isPremium: boolean;
  isImported: boolean;
  adherenceRate: number; // % estimated adherence
  analyzedCount: number; // how many restaurants have this
  potentialCustomersCount: number; // target client count in area
  averageScore: number; // score of restaurants who have it
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
  applications: string[];
  idealSegments: string[];
  complementaryProducts: string[];
  relatedProducts: string[];
  topAdherents: string[];
  imageGradient: string; // Background gradient for premium placeholder feel
  manufacturer: string; // Fabricante
  status: 'Ativo' | 'Inativo'; // Status (Ativo/Inativo)
  dateCreated: string; // Data de Cadastro
  dateUpdated: string; // Última Atualização
  relatedMenus?: string[]; // Relacionamentos - Cardápios
  relatedClients?: string[]; // Relacionamentos - Clientes
  relatedOpportunities?: string[]; // Relacionamentos - Oportunidades
  relatedAnalyses?: string[]; // Relacionamentos - Análises
  
  // Extra official C-Trade fields
  codeRio?: string;
  codeSP?: string;
  codePOA?: string;
  line?: string;
  unit?: string;
  weight?: string;
  priceLocal?: number;
  priceInter?: number;
  packaging?: string;
  notes?: string;
}

import { REAL_PRODUCTS, REAL_CLIENTS, REAL_OPPORTUNITIES } from '../data/realData';

const initialProducts: Product[] = REAL_PRODUCTS.map(rp => ({
  id: rp.id,
  sku: rp.sku,
  name: rp.name,
  brand: rp.brand,
  category: rp.category,
  origin: rp.isImported ? 'Itália' : 'Brasil',
  description: rp.notes || 'Produto oficial C-Trade.',
  longDescription: rp.notes || 'Produto oficial C-Trade.',
  isPremium: rp.isPremium,
  isImported: rp.isImported,
  adherenceRate: rp.adherenceRate,
  analyzedCount: rp.analyzedCount,
  potentialCustomersCount: rp.potentialCustomersCount,
  averageScore: rp.averageScore,
  potential: rp.potential,
  applications: rp.applications,
  idealSegments: rp.idealSegments,
  complementaryProducts: rp.complementaryProducts,
  relatedProducts: rp.relatedProducts,
  topAdherents: rp.topAdherents,
  imageGradient: rp.imageGradient,
  manufacturer: rp.manufacturer,
  status: rp.status,
  dateCreated: rp.dateCreated,
  dateUpdated: rp.dateUpdated,
  relatedMenus: rp.relatedMenus || [],
  relatedClients: rp.relatedClients || [],
  relatedOpportunities: rp.relatedOpportunities || [],
  relatedAnalyses: rp.relatedAnalyses || [],
  
  codeRio: rp.codeRio,
  codeSP: rp.codeSP,
  codePOA: rp.codePOA,
  line: rp.line,
  unit: rp.unit,
  weight: rp.weight,
  priceLocal: rp.priceLocal,
  priceInter: rp.priceInter,
  packaging: rp.packaging,
  notes: rp.notes
}));

export default function Produtos() {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Load and synchronize global base session filters
  const [sessionFilters, setSessionFilters] = useState(() => {
    const saved = sessionStorage.getItem('ctrade_session_filters_base');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error reading session filters', e);
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

  // Persist session filters base
  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new Event('storage'));
  }, [sessionFilters]);

  // Read base session filters upon window focus (cross-tab synchronization)
  useEffect(() => {
    const handleFocus = () => {
      const saved = sessionStorage.getItem('ctrade_session_filters_base');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSessionFilters(prev => {
            if (JSON.stringify(prev) === JSON.stringify(parsed)) {
              return prev;
            }
            return parsed;
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleFocus);
    };
  }, []);

  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filtered Cities list based on selected states
  const cidadeOptions = useMemo(() => {
    const allCitiesFromData = Array.from(new Set(REAL_CLIENTS.map(c => c.city).filter(Boolean)));
    if (sessionFilters.estados.length > 0) {
      return Array.from(new Set(
        REAL_CLIENTS
          .filter(c => sessionFilters.estados.includes(c.state))
          .map(c => c.city)
          .filter(Boolean)
      )).map(c => ({ value: c, label: c }));
    }
    return allCitiesFromData.map(c => ({ value: c, label: c }));
  }, [sessionFilters.estados]);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'adherence' | 'potential_num' | 'analyzed'>('adherence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // View state: Grid vs. List
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Favorites (Stored in local component state)
  const [favorites, setFavorites] = useState<string[]>(['1', '3']);

  // Selected Product for Details Drawer
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'perfil' | 'ia'>('perfil');

  // Target pre-selection and custom event listener for Products
  useEffect(() => {
    const checkTargetProduct = () => {
      const targetProdId = localStorage.getItem('ctrade_selected_product_id');
      if (targetProdId && initialProducts.length > 0) {
        const found = initialProducts.find(p => p.id === targetProdId || p.sku === targetProdId);
        if (found) {
          setSelectedProduct(found);
          localStorage.removeItem('ctrade_selected_product_id');
        }
      }
    };
    checkTargetProduct();

    const handleOpenProduct = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId: string }>;
      if (customEvent.detail && customEvent.detail.productId && initialProducts.length > 0) {
        const found = initialProducts.find(p => p.id === customEvent.detail.productId || p.sku === customEvent.detail.productId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    };
    window.addEventListener('open-product', handleOpenProduct);
    window.addEventListener('storage', checkTargetProduct);
    window.addEventListener('focus', checkTargetProduct);

    return () => {
      window.removeEventListener('open-product', handleOpenProduct);
      window.removeEventListener('storage', checkTargetProduct);
      window.removeEventListener('focus', checkTargetProduct);
    };
  }, []);

  // Simulated calculations
  const [isSimulatingSinergy, setIsSimulatingSinergy] = useState<boolean>(false);
  const [sinergyResult, setSinergyResult] = useState<string | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // --- DERIVED METADATA / CATEGORIES ---
  const categoriesList = useMemo(() => {
    const fromProducts = Array.from(new Set(initialProducts.map(p => p.category))).filter(Boolean).sort();
    return ['Todos', ...fromProducts];
  }, []);
  
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    initialProducts.forEach(p => brands.add(p.brand));
    return ['Todos', ...Array.from(brands)];
  }, []);

  const uniqueOrigins = useMemo(() => {
    const origins = new Set<string>();
    initialProducts.forEach(p => origins.add(p.origin));
    return ['Todos', ...Array.from(origins)];
  }, []);

  // Show Toast helper
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
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
    showNotification('Todos os critérios de busca foram redefinidos.', 'info');
  };

  // Favoriting Action
  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening drawer
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
      showNotification('Produto removido dos favoritos.', 'info');
    } else {
      setFavorites([...favorites, productId]);
      showNotification('Produto adicionado aos favoritos!', 'success');
    }
  };

  // Export functions (mock)
  const handleExport = (type: 'PDF' | 'Excel' | 'Print') => {
    if (type === 'PDF') {
      showNotification('Gerando catálogo completo em PDF comercial...', 'success');
    } else if (type === 'Excel') {
      showNotification('Exportando matriz de portfólio e leads para Excel...', 'success');
    } else {
      showNotification('Preparando layout de impressão para catálogo de campo...', 'success');
    }
  };

  // Commercial simulation for selected product
  const handleRunSinergyAnalysis = () => {
    setIsSimulatingSinergy(true);
    setSinergyResult(null);

    setTimeout(() => {
      setIsSimulatingSinergy(false);
      setSinergyResult(
        `Oportunidade Comercial Consolidada: Identificamos que este produto possui sinergia de 94% com a base comercial. No momento, 5 restaurantes mapeados em nosso Radar Comercial que preenchem os pré-requisitos não possuem este insumo listado. Sugerimos agendar abordagens comerciais enviando amostras de teste na próxima semana.`
      );
      showNotification('Análise de acoplamento executada pelo modelo cognitivo!', 'success');
    }, 1200);
  };

  // Reset Drawer states when closing or changing product
  const handleCloseDrawer = () => {
    setSelectedProduct(null);
    setSinergyResult(null);
    setDrawerActiveTab('perfil');
  };

  // Filter clients to dynamically calculate metrics
  const filteredClientsForProducts = useMemo(() => {
    return REAL_CLIENTS.filter(c => {
      // 1. Estado
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(c.state)) return false;
      // 2. Cidade
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(c.city)) return false;
      // 3. RCA
      const rcaId = c.state === 'RJ' ? 'rca-marcelo' : 'rca-amanda';
      if (sessionFilters.rcas.length > 0 && !sessionFilters.rcas.includes(rcaId)) return false;
      // 4. Segmento
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(c.segment)) return false;
      // 5. Status
      const mappedStatus = c.status === 'Analisado' ? 'Autorizados' : 'Entradas';
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(mappedStatus)) return false;

      // Score Comercial
      if (sessionFilters.scoreComercial !== 'all') {
        const score = c.score;
        if (!matchesScoreRange(score, sessionFilters.scoreComercial)) return false;
      }

      return true;
    });
  }, [sessionFilters]);

  // Recalculate each product's presence and fit dynamically
  const productsWithDynamicMetrics = useMemo(() => {
    return products.map(p => {
      let analyzedCount = 0;
      let potentialCustomersCount = 0;
      let totalScoreSum = 0;
      let totalScoreCount = 0;

      filteredClientsForProducts.forEach(c => {
        const opp = REAL_OPPORTUNITIES.find(o => o.clientId === String(c.id));
        if (opp) {
          const hasProduct = opp.produtosEncontrados.some(pe => pe.produto.toLowerCase() === p.name.toLowerCase());
          const isAbsent = opp.produtosAusentes.some(pa => pa.produto.toLowerCase() === p.name.toLowerCase()) || 
                           opp.produtosRecomendados.some(pr => pr.toLowerCase() === p.name.toLowerCase());

          if (hasProduct) {
            analyzedCount++;
            totalScoreSum += c.score;
            totalScoreCount++;
          } else if (isAbsent) {
            potentialCustomersCount++;
          }
        }
      });

      // Use default stats if no specific filter is active to preserve real base numbers
      const noActiveFilters = sessionFilters.estados.length === 0 &&
                              sessionFilters.cidades.length === 0 &&
                              sessionFilters.rcas.length === 0 &&
                              sessionFilters.segmentos.length === 0 &&
                              sessionFilters.statuses.length === 0 &&
                              sessionFilters.scoreComercial === 'all' &&
                              sessionFilters.scoreFit === 'all';

      const finalAnalyzedCount = noActiveFilters ? p.analyzedCount : analyzedCount;
      const finalPotentialCount = noActiveFilters ? p.potentialCustomersCount : potentialCustomersCount;
      const finalAdherenceRate = finalAnalyzedCount + finalPotentialCount > 0 
        ? Math.round((finalAnalyzedCount / (finalAnalyzedCount + finalPotentialCount)) * 100)
        : (noActiveFilters ? p.adherenceRate : 0);
      const finalAverageScore = totalScoreCount > 0 
        ? Math.round(totalScoreSum / totalScoreCount)
        : p.averageScore;

      return {
        ...p,
        analyzedCount: finalAnalyzedCount,
        potentialCustomersCount: finalPotentialCount,
        adherenceRate: finalAdherenceRate,
        averageScore: finalAverageScore,
      };
    });
  }, [products, filteredClientsForProducts, sessionFilters]);

  // --- FILTERING & SORTING LOGIC ---
  const filteredProducts = useMemo(() => {
    return productsWithDynamicMetrics
      .filter(p => {
        // Text Search Match
        const text = (sessionFilters.cliente || '').trim().toLowerCase();
        const matchQuery = !text ||
          p.name.toLowerCase().includes(text) ||
          p.brand.toLowerCase().includes(text) ||
          p.category.toLowerCase().includes(text) ||
          p.origin.toLowerCase().includes(text) ||
          p.description.toLowerCase().includes(text);
        
        // Category Filter Match (Multi-select)
        const matchCategory = sessionFilters.categorias.length === 0 || sessionFilters.categorias.includes(p.category);

        // Product Filter Match (Multi-select)
        const matchProduct = sessionFilters.produtos.length === 0 || sessionFilters.produtos.includes(p.name);

        return matchQuery && matchCategory && matchProduct;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy === 'potential_num' ? 'adherenceRate' : sortBy];
        let valB: any = b[sortBy === 'potential_num' ? 'adherenceRate' : sortBy];

        if (sortBy === 'potential_num') {
          const potWeight = { 'Muito Alto': 4, 'Alto': 3, 'Médio': 2, 'Baixo': 1 };
          valA = potWeight[a.potential];
          valB = potWeight[b.potential];
        }

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
      });
  }, [productsWithDynamicMetrics, sessionFilters.cliente, sessionFilters.categorias, sessionFilters.produtos, sortBy, sortOrder]);

  const totalActive = filteredProducts.length;
  const totalEncontrados = filteredProducts.reduce((sum, p) => sum + p.analyzedCount, 0);
  const totalPremium = filteredProducts.filter(p => p.isPremium).length;
  const totalCategories = new Set(filteredProducts.map(p => p.category)).size;

  const highestAdherenceProd = useMemo(() => {
    if (filteredProducts.length === 0) return { name: '-', rate: 0 };
    let best = filteredProducts[0];
    filteredProducts.forEach(p => {
      if (p.adherenceRate > best.adherenceRate) best = p;
    });
    return { name: best.name, rate: best.adherenceRate };
  }, [filteredProducts]);

  const lowestPresenceProd = useMemo(() => {
    if (filteredProducts.length === 0) return { name: '-', count: 0 };
    let worst = filteredProducts[0];
    filteredProducts.forEach(p => {
      if (p.analyzedCount < worst.analyzedCount) worst = p;
    });
    return { name: worst.name, count: worst.analyzedCount };
  }, [filteredProducts]);

  return (
    <PageContainer id="page-portfolio-ctrade">
      <Breadcrumb items={[{ label: 'Portfólio CTrade', active: true }]} />
      <div className="relative">
        {/* Toast Feedbacks */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* PAGE HEADER */}
        <PageHeader
          title="Portfólio CTrade"
          subtitle="Gerencie o catálogo oficial de distribuição e consulte oportunidades de vendas integradas com Inteligência Artificial."
          badge="Fase 06"
        />

        {/* --- UTILITIES & FILTERS BAR --- */}
        <div className="mt-6">
          <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
        </div>

        {/* --- HEADER KPIS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6" id="portfolio-metrics-grid">
          <MetricCard
            title="Produtos Ativos"
            value={totalActive.toString()}
            icon={<Package className="h-4.5 w-4.5 text-blue-900" />}
            trend={{ value: 'Em estoque real', type: 'up' }}
          />
          <MetricCard
            title="Encontrados Base"
            value={totalEncontrados.toString()}
            icon={<TrendingUp className="h-4.5 w-4.5 text-emerald-600" />}
            trend={{ value: 'Nos cardápios', type: 'up' }}
          />
          <MetricCard
            title="Produtos Premium"
            value={totalPremium.toString()}
            icon={<Award className="h-4.5 w-4.5 text-amber-500" />}
            trend={{ value: 'Foco de Margem', type: 'up' }}
          />
          <MetricCard
            title="Categorias"
            value={totalCategories.toString()}
            icon={<SlidersHorizontal className="h-4.5 w-4.5 text-indigo-600" />}
            trend={{ value: 'Mapeadas pela IA', type: 'up' }}
          />
          <MetricCard
            title="Maior Aderência"
            value={highestAdherenceProd.name}
            icon={<CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />}
            trend={{ value: `${highestAdherenceProd.rate}% de fit geral`, type: 'up' }}
          />
          <MetricCard
            title="Menor Presença"
            value={lowestPresenceProd.name}
            icon={<AlertCircle className="h-4.5 w-4.5 text-rose-500" />}
            trend={{ value: `Encontrado em ${lowestPresenceProd.count}`, type: 'down' }}
          />
        </div>

        {/* --- UTILITIES & FILTERS BAR --- */}
        <div className="mt-8 space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs">
            {/* Left: Sorting */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-medium">Ordenar por:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSortBy('adherence'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${sortBy === 'adherence' ? 'bg-blue-900 text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Aderência {sortBy === 'adherence' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => { setSortBy('potential_num'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${sortBy === 'potential_num' ? 'bg-blue-900 text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Potencial {sortBy === 'potential_num' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => { setSortBy('analyzed'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${sortBy === 'analyzed' ? 'bg-blue-900 text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cardápios {sortBy === 'analyzed' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
            </div>

            {/* Right: Layout style & exports */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Layout Switcher */}
              <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewLayout === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Layout em Grid"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-md transition-all ${viewLayout === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Layout em Lista"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Quick Exports buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="secondary" size="sm" leftIcon={<FileSpreadsheet className="h-3 w-3" />} onClick={() => handleExport('Excel')}>
                  Excel
                </Button>
                <Button variant="secondary" size="sm" leftIcon={<Download className="h-3 w-3" />} onClick={() => handleExport('PDF')}>
                  Catálogo PDF
                </Button>
                <Button variant="secondary" size="sm" leftIcon={<Printer className="h-3 w-3" />} onClick={() => handleExport('Print')}>
                  Imprimir
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- CATEGORIES PILLS SLIDER --- */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="categories-tabs-container">
          {categoriesList.map((cat) => {
            const isActive = cat === 'Todos' ? sessionFilters.categorias.length === 0 : sessionFilters.categorias.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  if (cat === 'Todos') {
                    setSessionFilters(prev => ({ ...prev, categorias: [] }));
                  } else {
                    setSessionFilters(prev => {
                      const exists = prev.categorias.includes(cat);
                      const newCats = exists ? prev.categorias.filter(c => c !== cat) : [...prev.categorias, cat];
                      return { ...prev, categorias: newCats };
                    });
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 border ${
                  isActive
                    ? 'bg-blue-950 text-white border-blue-950 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* --- CATALOG VIEW CONTROLLER --- */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Nenhum produto localizado."
            description="Não encontramos registros que correspondam aos termos de busca ou filtros ativos."
            action={
              <div className="flex flex-wrap items-center gap-2.5 justify-center">
                <Button variant="outline" size="sm" onClick={handleClearFilters} leftIcon={<Eraser className="h-4 w-4" />}>
                  Limpar Filtros
                </Button>
                <Button variant="primary" size="sm" onClick={handleClearFilters}>
                  Consultar Catálogo
                </Button>
              </div>
            }
          />
        ) : viewLayout === 'grid' ? (
          // --- GRID VIEW ---
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6" id="products-catalog-grid">
            {filteredProducts.map((p) => {
              const isFav = favorites.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Card Premium Header Color Blocks */}
                  <div className={`h-24 bg-gradient-to-br ${p.imageGradient} p-4 flex flex-col justify-between relative`}>
                    <div className="flex justify-between items-start w-full z-10">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white/90 shadow-2xs backdrop-blur-xs text-slate-800">
                        {p.category}
                      </span>
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`p-1.5 rounded-full bg-white/90 shadow-2xs transition-colors hover:bg-white ${isFav ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                      >
                        <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="z-10 flex items-center justify-between text-xs">
                      <span className="font-extrabold tracking-wide drop-shadow-2xs">{p.brand}</span>
                      <span className="text-[10px] font-medium bg-black/15 text-white px-2 py-0.5 rounded-full">
                        {p.origin}
                      </span>
                    </div>

                    {/* Background subtle mesh or pattern */}
                    <div className="absolute inset-0 bg-slate-950/5 opacity-20" />
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-900 transition-colors">
                          {p.name}
                        </h3>
                        {p.isPremium && (
                          <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" title="Premium" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Sinergy Meter Badge */}
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex flex-col space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">Aderência Estimada</span>
                        <span className="font-bold text-emerald-600">{p.adherenceRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${p.adherenceRate}%` }} />
                      </div>
                    </div>

                    {/* Footer Info & Details Button */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-medium">Cardápios Mapeados</span>
                        <span className="font-bold text-slate-700">{p.analyzedCount} casas</span>
                      </div>
                      
                      <div className="text-blue-900 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>Ver detalhes</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // --- LIST VIEW ---
          <div className="mt-6 space-y-3" id="products-catalog-list">
            {filteredProducts.map((p) => {
              const isFav = favorites.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative group"
                >
                  {/* Accent Brand block on the left */}
                  <div className={`w-2 md:w-3 rounded-l-lg absolute left-0 top-0 bottom-0 bg-gradient-to-b ${p.imageGradient}`} />

                  {/* Left Column: Title & Info */}
                  <div className="pl-3 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {p.category}
                      </span>
                      <h3 className="text-xs font-black text-slate-800 group-hover:text-blue-900 transition-colors">
                        {p.name}
                      </h3>
                      {p.isPremium && (
                        <Award className="h-3.5 w-3.5 text-amber-500" title="Premium" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 max-w-xl line-clamp-1 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex gap-4 text-[10px] text-slate-500 pt-1">
                      <span>Marca: <strong className="text-slate-700 font-semibold">{p.brand}</strong></span>
                      <span>Origem: <strong className="text-slate-700 font-semibold">{p.origin}</strong></span>
                      <span>Cardápios Analisados: <strong className="text-slate-700 font-semibold">{p.analyzedCount}</strong></span>
                    </div>
                  </div>

                  {/* Middle Column: Fit Meter */}
                  <div className="w-full md:w-44 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-medium">Sinergia Comercial</span>
                      <span className="font-extrabold text-blue-900">{p.adherenceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-900 h-full" style={{ width: `${p.adherenceRate}%` }} />
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className={`p-2 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors ${isFav ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                    >
                      <Star className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <div className="h-8 w-8 rounded-full bg-slate-50 group-hover:bg-blue-55 text-slate-400 group-hover:text-blue-900 flex items-center justify-center border border-slate-100 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- PREMIUM SLIDE-OVER DRAWER (NOTION/HUBSPOT STYLE) --- */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDrawer}
                className="fixed inset-0 bg-black z-40"
              />

              {/* Side Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
                id="product-details-drawer"
              >
                {/* Header block with gradient background matching item card */}
                <div className={`p-6 bg-gradient-to-r ${selectedProduct.imageGradient} relative text-slate-800 border-b border-slate-100 shrink-0`}>
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-1.5 max-w-[85%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-white/90 text-slate-800 shadow-3xs">
                          {selectedProduct.category}
                        </span>
                        {selectedProduct.isPremium && (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-amber-500 text-white shadow-3xs flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Premium
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/10 text-slate-700">
                          {selectedProduct.origin}
                        </span>
                      </div>

                      <h2 className="text-base font-black tracking-tight text-slate-900">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-xs text-slate-700/80 font-bold">Marca: {selectedProduct.brand}</p>
                    </div>

                    <button
                      onClick={handleCloseDrawer}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs transition-colors shrink-0 outline-none"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Mesh layer opacity */}
                  <div className="absolute inset-0 bg-slate-950/5 opacity-10" />
                </div>

                {/* Sub-Header Tabs Nav */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 shrink-0">
                  <button
                    onClick={() => setDrawerActiveTab('perfil')}
                    className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      drawerActiveTab === 'perfil' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Ficha Técnica
                  </button>
                  <button
                    onClick={() => setDrawerActiveTab('ia')}
                    className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      drawerActiveTab === 'ia' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Inteligência & Sinergia
                  </button>
                </div>

                {/* Main scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {drawerActiveTab === 'perfil' ? (
                    // --- TAB: SPECS ---
                    <div className="space-y-6">
                      
                      {/* C-Trade Official Specs Grid */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-blue-900" />
                          Dados Oficiais & Controle SKU
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium block">Código SKU</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-200/50 px-1.5 py-0.5 rounded-sm">{selectedProduct.sku}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Fabricante</span>
                            <span className="font-bold text-slate-800">{selectedProduct.manufacturer}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Status do Catálogo</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${selectedProduct.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                              {selectedProduct.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Unidade / Embalagem</span>
                            <span className="font-semibold text-slate-700">
                              {selectedProduct.unit || 'CX'} {selectedProduct.weight ? `(${selectedProduct.weight})` : ''} - {selectedProduct.packaging || 'Embalagem padrão'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Data de Cadastro</span>
                            <span className="font-medium text-slate-600">{selectedProduct.dateCreated}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Última Atualização</span>
                            <span className="font-medium text-slate-600">{selectedProduct.dateUpdated}</span>
                          </div>
                          {selectedProduct.priceLocal !== undefined && (
                            <div>
                              <span className="text-slate-400 font-medium block">Preço Local (Sugerido)</span>
                              <span className="font-bold text-blue-900">R$ {selectedProduct.priceLocal.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedProduct.priceInter !== undefined && (
                            <div>
                              <span className="text-slate-400 font-medium block">Preço Inter (Sugerido)</span>
                              <span className="font-bold text-indigo-900 font-mono">R$ {selectedProduct.priceInter.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Description */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
                          <Info className="h-3.5 w-3.5 text-slate-400" />
                          Descrição do Insumo
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">
                          {selectedProduct.longDescription}
                        </p>
                      </div>

                      {/* Related Ecosystem Modules Section */}
                      <div className="p-4 bg-blue-50/25 border border-blue-100/50 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <Link2 className="h-4 w-4 text-blue-950" />
                          Relacionamentos no Radar Comercial
                        </h4>
                        
                        <div className="space-y-3 text-xs">
                          {/* Related Clients */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clientes Vinculados ({selectedProduct.relatedClients?.length || 0})</span>
                            {selectedProduct.relatedClients && selectedProduct.relatedClients.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedProduct.relatedClients.map((cli, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1">
                                    <Building2 className="h-3 w-3 text-slate-400" />
                                    {cli}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-light">Nenhum cliente vinculado no momento.</span>
                            )}
                          </div>

                          {/* Related Menus */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cardápios Vinculados ({selectedProduct.relatedMenus?.length || 0})</span>
                            {selectedProduct.relatedMenus && selectedProduct.relatedMenus.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedProduct.relatedMenus.map((men, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1">
                                    <FileSpreadsheet className="h-3 w-3 text-slate-400" />
                                    {men}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-light">Nenhum cardápio vinculado no momento.</span>
                            )}
                          </div>

                          {/* Related Opportunities */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Oportunidades Relacionadas ({selectedProduct.relatedOpportunities?.length || 0})</span>
                            {selectedProduct.relatedOpportunities && selectedProduct.relatedOpportunities.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedProduct.relatedOpportunities.map((opp, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1">
                                    <ShoppingBag className="h-3 w-3 text-slate-400" />
                                    {opp}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-light">Nenhuma oportunidade registrada para este SKU.</span>
                            )}
                          </div>

                          {/* Related Analyses */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Análises de Inteligência ({selectedProduct.relatedAnalyses?.length || 0})</span>
                            {selectedProduct.relatedAnalyses && selectedProduct.relatedAnalyses.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedProduct.relatedAnalyses.map((ana, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-slate-400" />
                                    {ana}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-light">Nenhuma análise de inteligência vinculada.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Applications list */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Aplicações Recomendadas</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.applications.map((app, index) => (
                            <span key={index} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Ideal segments list */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Segmentos Ideais de Mercado</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.idealSegments.map((seg, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-900">
                              {seg}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Complementary and related items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Mapeamento Complementar</h4>
                          <ul className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                            {selectedProduct.complementaryProducts.map((p, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Pratos & Categoria Correlata</h4>
                          <ul className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                            {selectedProduct.relatedProducts.map((p, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Top Adherents List */}
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Maiores Adquirentes da Base</h4>
                        <div className="space-y-1.5">
                          {selectedProduct.topAdherents.map((client, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-150 text-xs">
                              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                {client}
                              </span>
                              <Badge variant="success">Ativo</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    // --- TAB: IA ANALYSIS & SYNERGIES ---
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Sub header explanation */}
                      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex gap-3">
                        <Sparkles className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Motor de Sinergias da CTrade</span>
                          <p className="mt-0.5 text-indigo-800 font-light">
                            Algoritmo que correlaciona pratos cadastrados no Radar Comercial aos insumos do portfólio oficial de distribuição.
                          </p>
                        </div>
                      </div>

                      {/* Score metrics bento container */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-100 text-center space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Cardápios em que Apareceu</span>
                          <p className="text-xl font-extrabold text-blue-900">{selectedProduct.analyzedCount}</p>
                          <span className="text-[9px] text-slate-400 block">Restaurantes mapeados</span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-100 text-center space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Alvos em Potencial</span>
                          <p className="text-xl font-extrabold text-indigo-900">{selectedProduct.potentialCustomersCount}</p>
                          <span className="text-[9px] text-slate-400 block">Clientes aptos no radar</span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-100 text-center space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Score de Fit Médio</span>
                          <p className="text-xl font-extrabold text-emerald-600">{selectedProduct.averageScore}%</p>
                          <span className="text-[9px] text-slate-400 block">Adequação de perfil</span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-100 text-center space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Nível de Demanda</span>
                          <p className="text-xl font-extrabold text-amber-600">{selectedProduct.potential}</p>
                          <span className="text-[9px] text-slate-400 block">Estimativa comercial</span>
                        </div>
                      </div>

                      {/* Interactive calculation area */}
                      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ações de Venda Inteligentes</span>
                          <h4 className="text-xs font-bold text-slate-800">Calcular Acoplamento na Base Geral</h4>
                          <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                            Cruza a composição deste produto com todos os cardápios mapeados para listar os restaurantes exatos com maior propensão de compra.
                          </p>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          disabled={isSimulatingSinergy}
                          leftIcon={isSimulatingSinergy ? <Spinner className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4" />}
                          onClick={handleRunSinergyAnalysis}
                        >
                          {isSimulatingSinergy ? 'Consultando e cruzando dados...' : 'Executar Cruzamento de Lead'}
                        </Button>

                        {/* Analysis results */}
                        <AnimatePresence>
                          {sinergyResult && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-900 leading-relaxed font-light space-y-1.5"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Oportunidades de Acoplamento localizadas</span>
                              </div>
                              <p>{sinergyResult}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Future prediction disclaimer */}
                      <div className="text-[10px] text-slate-400 font-medium leading-relaxed italic border-t border-slate-100 pt-4 flex gap-1.5">
                        <Info className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />
                        <span>Este painel está preparado para futura integração bidirecional com o Claude no back-end. Ele cruzará o banco de dados em tempo real com as análises do Gemini.</span>
                      </div>

                    </div>
                  )}

                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4.5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                  <Button variant="secondary" className="flex-1" size="sm" onClick={handleCloseDrawer}>
                    Fechar Ficha
                  </Button>
                  <Button variant="primary" className="flex-1" size="sm" leftIcon={<ShoppingBag className="h-4 w-4" />} onClick={() => showNotification('Insumo selecionado para recomendação ativa de vendas!', 'success')}>
                    Abordar Leads (34)
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- COMMERCIAL RANKING SECTIONS (BOTTOM) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* Table 1: Most Mapped Ingredients */}
          <Card className="p-6">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-blue-900" />
              Insumos Mais Encontrados nos Cardápios
            </h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">1. Farinha de Trigo Napoletana</span>
                <span className="font-semibold text-slate-500">Mapeado em 22 estabelecimentos (91%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">2. Molho de Tomate / Pomodoro</span>
                <span className="font-semibold text-slate-500">Mapeado em 19 estabelecimentos (79%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">3. Queijo Tipo Grana / Parmigiano</span>
                <span className="font-semibold text-slate-500">Mapeado em 16 estabelecimentos (66%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">4. Azeite de Oliva Clássico</span>
                <span className="font-semibold text-slate-500">Mapeado em 15 estabelecimentos (62%)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-slate-700">5. Embutidos Nobres (Prosciutto)</span>
                <span className="font-semibold text-slate-500">Mapeado em 11 estabelecimentos (45%)</span>
              </div>
            </div>
          </Card>

          {/* Table 2: Premium Sinergy Candidates */}
          <Card className="p-6">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-500" />
              Produtos Premium de Maior Potencial de Venda
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">1. Farinha Caputo Pizzeria</span>
                <Badge variant="success">Forte Sinergia</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">2. Tomate Pelado DOP San Marzano</span>
                <Badge variant="success">Forte Sinergia</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">3. Queijo Grana Padano DOP CTrade</span>
                <Badge variant="success">Forte Sinergia</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-bold text-slate-700">4. Prosciutto di Parma DOP</span>
                <Badge variant="primary">Médio-Alto Fit</Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-slate-700">5. Trufa Negra Inteira Urbani</span>
                <Badge variant="secondary">Nicho Específico</Badge>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </PageContainer>
  );
}
