/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, Spinner, Toast, EmptyState } from '../components/ui/Feedback';
import Breadcrumb from '../components/ui/Breadcrumb';

import {
  Package,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  X,
  Award,
  ChevronDown,
  ChevronUp,
  Eraser,
  Building2,
  DollarSign,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  ListFilter,
  SlidersHorizontal,
  Percent,
  ArrowRight
} from 'lucide-react';

import { REAL_PRODUCTS, REAL_CLIENTS } from '../data/realData';

// Core Interfaces
interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  origin: string;
  description: string;
  isPremium: boolean;
  isImported: boolean;
  status: 'Ativo' | 'Inativo';
  dateCreated: string;
  dateUpdated: string;
  unit: string;
  weight: string;
  priceLocal: number;
  priceInter: number;
  packaging: string;
  notes: string;
}

interface Client {
  id: number;
  name: string;
  fantasyName: string;
  city: string;
  state: string;
  segment: string;
  category: string;
  score: number;
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
  status: string;
  lastAnalysis: string;
  lastUpload: string;
}

interface ProductIntelligence {
  product: Product;
  identifiedClients: Array<{
    id: number;
    fantasyName: string;
    city: string;
    state: string;
    score: number;
    dish: string;
    menuName: string;
    potentialRevenue: number;
    segment: string;
  }>;
  potentialClients: Array<{
    id: number;
    fantasyName: string;
    city: string;
    state: string;
    score: number;
    potentialRevenue: number;
    segment: string;
  }>;
  totalIdentified: number;
  totalPotential: number;
  matchCount: number;
  revenuePotential: number;
  averageScore: number;
  priority: 'A' | 'B' | 'C';
}

// Map REAL_PRODUCTS safely
const initialProducts: Product[] = REAL_PRODUCTS.map(rp => ({
  id: rp.id,
  sku: rp.sku,
  name: rp.name,
  brand: rp.brand,
  category: rp.category,
  origin: rp.isImported ? 'Itália' : 'Brasil',
  description: rp.notes || 'Insumo homologado de alta performance comercial.',
  isPremium: !!rp.isPremium,
  isImported: !!rp.isImported,
  status: rp.status || 'Ativo',
  dateCreated: rp.dateCreated || '2026-01-01',
  dateUpdated: rp.dateUpdated || '2026-01-01',
  unit: rp.unit || 'CX',
  weight: rp.weight || '500g',
  priceLocal: rp.priceLocal || 0,
  priceInter: rp.priceInter || 0,
  packaging: rp.packaging || 'Caixa',
  notes: rp.notes || ''
}));

export default function Produtos() {
  // Sync client list state with localStorage or default to REAL_CLIENTS
  const [clientsList, setClientsList] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return REAL_CLIENTS as unknown as Client[];
  });

  // Sync session filters from sessionStorage (using ctrade_session_filters_base)
  const [sessionFilters, setSessionFilters] = useState(() => {
    const saved = sessionStorage.getItem('ctrade_session_filters_base');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          estados: parsed.estados || [],
          cidades: parsed.cidades || [],
          regionais: parsed.regionais || [],
          categorias: parsed.categorias || [],
          marcas: parsed.marcas || [],
          segmentos: parsed.segmentos || [],
          scoreComercial: parsed.scoreComercial || 'all',
          cliente: parsed.cliente || '',
          periodoOption: parsed.periodoOption || 'all'
        };
      } catch (e) {}
    }
    return {
      estados: [] as string[],
      cidades: [] as string[],
      regionais: [] as string[],
      categorias: [] as string[],
      marcas: [] as string[],
      segmentos: [] as string[],
      scoreComercial: 'all',
      cliente: '',
      periodoOption: 'all'
    };
  });

  // Save session filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(sessionFilters));
    window.dispatchEvent(new Event('storage'));
  }, [sessionFilters]);

  // Handle cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ctrade_clients_list_v2');
      if (saved) {
        try { setClientsList(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // --- FILTER STATES ---
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterCidade, setFilterCidade] = useState<string>('all');
  const [filterRegional, setFilterRegional] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [filterMarca, setFilterMarca] = useState<string>('all');
  const [filterProduto, setFilterProduto] = useState<string>('all');
  const [filterSegmento, setFilterSegmento] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [filterReceita, setFilterReceita] = useState<string>('all');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  // --- SELECTED PRODUCT & UI STATES ---
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  
  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Table Sorting
  const [sortField, setSortField] = useState<keyof ProductIntelligence | 'sku' | 'name' | 'brand' | 'category' | 'revenuePotential' | 'averageScore' | 'matchCount'>('revenuePotential');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Active Tab for Rankings inside the bento grid
  const [rankingTabProducts, setRankingTabProducts] = useState<'products' | 'clients'>('products');
  const [rankingTabCategories, setRankingTabCategories] = useState<'categories' | 'brands'>('categories');
  const [rankingTabDemographics, setRankingTabDemographics] = useState<'segments' | 'locations'>('segments');

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- DERIVE FILTER OPTIONS ---
  const filterOptions = useMemo(() => {
    const estados = Array.from(new Set(clientsList.map(c => c.state))).filter(Boolean).sort();
    const cidades = Array.from(new Set(clientsList.map(c => c.city))).filter(Boolean).sort();
    const categorias = Array.from(new Set(initialProducts.map(p => p.category))).filter(Boolean).sort();
    const marcas = Array.from(new Set(initialProducts.map(p => p.brand))).filter(Boolean).sort();
    const segmentos = Array.from(new Set(clientsList.map(c => c.segment))).filter(Boolean).sort();
    const regionais = ['Sudeste - SP', 'Sudeste - RJ', 'Sul', 'Outros'];
    const produtos = initialProducts.map(p => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name));

    return { estados, cidades, categorias, marcas, segmentos, regionais, produtos };
  }, [clientsList]);

  // Helper to resolve client regional group
  const getClientRegional = (client: Client): string => {
    if (client.state === 'SP') return 'Sudeste - SP';
    if (client.state === 'RJ') return 'Sudeste - RJ';
    if (client.state === 'RS') return 'Sul';
    return 'Outros';
  };

  // --- AREA 1: FILTER CLIENTS FIRST ---
  const filteredClients = useMemo(() => {
    return clientsList.filter(c => {
      // Estado
      if (filterEstado !== 'all' && c.state !== filterEstado) return false;
      // Cidade
      if (filterCidade !== 'all' && c.city !== filterCidade) return false;
      // Regional
      if (filterRegional !== 'all' && getClientRegional(c) !== filterRegional) return false;
      // Segmento
      if (filterSegmento !== 'all' && c.segment !== filterSegmento) return false;
      // Score range
      if (filterScore !== 'all') {
        if (filterScore === 'high' && c.score < 80) return false;
        if (filterScore === 'medium' && (c.score < 50 || c.score >= 80)) return false;
        if (filterScore === 'low' && c.score >= 50) return false;
      }
      // Periodo
      if (filterPeriodo !== 'all') {
        const analysisDate = new Date(c.lastAnalysis || '2026-01-01');
        const now = new Date('2026-07-13'); // Fixed current local time
        const diffTime = Math.abs(now.getTime() - analysisDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filterPeriodo === '30' && diffDays > 30) return false;
        if (filterPeriodo === '90' && diffDays > 90) return false;
        if (filterPeriodo === '180' && diffDays > 180) return false;
      }
      return true;
    });
  }, [clientsList, filterEstado, filterCidade, filterRegional, filterSegmento, filterScore, filterPeriodo]);

  // --- AREA 2: COMPUTE INTEL FOR EACH PRODUCT BASED ON FILTERED CLIENTS ---
  const computedProductIntelligence = useMemo(() => {
    return initialProducts.map(p => {
      const nameLower = p.name.toLowerCase();
      const catLower = p.category.toLowerCase();
      const brandLower = p.brand.toLowerCase();

      const identifiedClients: ProductIntelligence['identifiedClients'] = [];
      const potentialClients: ProductIntelligence['potentialClients'] = [];

      filteredClients.forEach(c => {
        let isIdentified = false;
        let dishFound = '';
        let menuName = c.lastUpload || 'cardapio_analisado.pdf';
        let revenueFactor = c.score / 100;

        // Babbo Osteria (ID 1)
        if (c.id === 1) {
          if (nameLower.includes('spaghetti') || nameLower.includes('capellini') || brandLower === 'valdigrano') {
            isIdentified = true;
            dishFound = 'Spaghetti alla Chitarra / Capellini Especial';
          } else if (nameLower.includes('bramata') || nameLower.includes('polenta') || brandLower === 'moretti') {
            isIdentified = true;
            dishFound = 'Polenta Cremosa de Ragu';
          } else if (nameLower.includes('fiordilatte') || nameLower.includes('burrata') || brandLower === 'latteria sorrentina') {
            isIdentified = true;
            dishFound = 'Insalata di Burrata / Gnocchi Sorrentina';
          } else if (nameLower.includes('porcini') || nameLower.includes('funghi') || brandLower === 'greci') {
            isIdentified = true;
            dishFound = 'Risotto di Porcini';
          }
        } 
        // Ella Pizzaria / Eva (ID 2)
        else if (c.id === 2) {
          if (nameLower.includes('pizzeria') || nameLower.includes('caputo') || brandLower === 'molino caputo') {
            isIdentified = true;
            dishFound = 'Pizza de Longa Fermentação Canotto';
          } else if (nameLower.includes('fiordilatte') || nameLower.includes('burrata') || brandLower === 'latteria sorrentina') {
            isIdentified = true;
            dishFound = 'Pizza Margherita Premium / Pizza Burrata';
          } else if (nameLower.includes('pelati') || nameLower.includes('tomate') || brandLower === 'ciao' || brandLower === 'solania') {
            isIdentified = true;
            dishFound = 'Molho San Marzano Artesanal';
          } else if (nameLower.includes('orégano') || brandLower === 'girafi') {
            isIdentified = true;
            dishFound = 'Focaccia ao Perfume de Orégano Siciliano';
          }
        }
        // Gero Fasano (ID 3)
        else if (c.id === 3) {
          if (nameLower.includes('linguine') || nameLower.includes('fettuccine') || brandLower === 'valdigrano') {
            isIdentified = true;
            dishFound = 'Linguine alle Vongole Fasano';
          } else if (nameLower.includes('grana') || nameLower.includes('parmigiano') || brandLower === 'greci') {
            isIdentified = true;
            dishFound = 'Tagliolini Gratinati';
          } else if (nameLower.includes('trufa') || nameLower.includes('tartufo') || brandLower === 'urbani') {
            isIdentified = true;
            dishFound = 'Filetto al Tartufo Nero';
          }
        }

        // Segment-based rules for other clients
        if (!isIdentified && c.id > 3) {
          const charSum = p.name.charCodeAt(0) + c.fantasyName.charCodeAt(0);
          
          if (c.segment.toLowerCase().includes('pizzaria') || c.segment.toLowerCase().includes('pizza')) {
            if (catLower.includes('farinhas') || brandLower === 'molino caputo') {
              isIdentified = true;
              dishFound = 'Massa Clássica de Longa Fermentação';
            } else if (catLower.includes('tomates') || brandLower === 'ciao' || brandLower === 'solania') {
              isIdentified = true;
              dishFound = 'Molho de Tomate Pelati da Casa';
            } else if (catLower.includes('fiordilatte') || brandLower === 'latteria sorrentina') {
              isIdentified = true;
              dishFound = 'Cobertura Especial de Muçarela Fiordilatte';
            } else if (charSum % 5 === 0) {
              potentialClients.push({
                id: c.id,
                fantasyName: c.fantasyName,
                city: c.city,
                state: c.state,
                score: c.score,
                potentialRevenue: Math.round((p.isPremium ? 15000 : 8000) * revenueFactor),
                segment: c.segment
              });
            }
          } else if (c.segment.toLowerCase().includes('italiano') || c.segment.toLowerCase().includes('cantina') || c.segment.toLowerCase().includes('restaurante')) {
            if (catLower.includes('massas') || brandLower === 'valdigrano') {
              isIdentified = true;
              dishFound = 'Prato de Massa Italiana Tradicional';
            } else if (catLower.includes('arrozes') || brandLower === 'scotti') {
              isIdentified = true;
              dishFound = 'Risoto de Alta Gastronomia';
            } else if (charSum % 5 === 0) {
              potentialClients.push({
                id: c.id,
                fantasyName: c.fantasyName,
                city: c.city,
                state: c.state,
                score: c.score,
                potentialRevenue: Math.round((p.isPremium ? 20000 : 10000) * revenueFactor),
                segment: c.segment
              });
            }
          } else {
            // General potential
            if (charSum % 6 === 0) {
              potentialClients.push({
                id: c.id,
                fantasyName: c.fantasyName,
                city: c.city,
                state: c.state,
                score: c.score,
                potentialRevenue: Math.round((p.isPremium ? 12000 : 6000) * revenueFactor),
                segment: c.segment
              });
            }
          }
        }

        if (isIdentified) {
          identifiedClients.push({
            id: c.id,
            fantasyName: c.fantasyName,
            city: c.city,
            state: c.state,
            score: c.score,
            dish: dishFound,
            menuName,
            potentialRevenue: Math.round((p.isPremium ? 24000 : 12000) * revenueFactor),
            segment: c.segment
          });
        }
      });

      const totalIdentified = identifiedClients.length;
      const totalPotential = potentialClients.length;
      const matchCount = totalIdentified + totalPotential;
      
      const revenuePotential = identifiedClients.reduce((acc, x) => acc + x.potentialRevenue, 0) + 
                               potentialClients.reduce((acc, x) => acc + x.potentialRevenue, 0);

      const sumScores = identifiedClients.reduce((acc, x) => acc + x.score, 0) + 
                        potentialClients.reduce((acc, x) => acc + x.score, 0);
      const averageScore = matchCount > 0 ? Math.round(sumScores / matchCount) : 0;

      // Priority calculation: A (Score >= 80 & Rev >= 30k), B (Score >= 60 & Rev >= 10k), C (others)
      let priority: 'A' | 'B' | 'C' = 'C';
      if (averageScore >= 80 && revenuePotential >= 30000) {
        priority = 'A';
      } else if (averageScore >= 60 && revenuePotential >= 10000) {
        priority = 'B';
      }

      return {
        product: p,
        identifiedClients,
        potentialClients,
        totalIdentified,
        totalPotential,
        matchCount,
        revenuePotential,
        averageScore,
        priority
      };
    });
  }, [filteredClients]);

  // --- FILTER THE COMPUTED INTELLIGENCE PRODUCTS ---
  const filteredProductIntelligence = useMemo(() => {
    return computedProductIntelligence.filter(pi => {
      const p = pi.product;
      // Categoria
      if (filterCategoria !== 'all' && p.category !== filterCategoria) return false;
      // Marca
      if (filterMarca !== 'all' && p.brand !== filterMarca) return false;
      // Produto (select filter)
      if (filterProduto !== 'all' && p.id !== filterProduto) return false;
      // General search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = p.name.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      p.brand.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      p.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Receita Potencial range
      if (filterReceita !== 'all') {
        if (filterReceita === 'high' && pi.revenuePotential < 50000) return false;
        if (filterReceita === 'medium' && (pi.revenuePotential < 15000 || pi.revenuePotential >= 50000)) return false;
        if (filterReceita === 'low' && pi.revenuePotential >= 15000) return false;
      }

      return true;
    });
  }, [computedProductIntelligence, filterCategoria, filterMarca, filterProduto, searchQuery, filterReceita]);

  // --- KPI CALCULATIONS ---
  const kpiStats = useMemo(() => {
    const totalMonitoredProducts = filteredProductIntelligence.length;
    
    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();
    let totalRevenuePotential = 0;
    const clientsWithMatchSet = new Set<number>();
    let priorityACount = 0;

    filteredProductIntelligence.forEach(pi => {
      categoriesSet.add(pi.product.category);
      brandsSet.add(pi.product.brand);
      totalRevenuePotential += pi.revenuePotential;
      if (pi.priority === 'A') priorityACount++;

      pi.identifiedClients.forEach(c => clientsWithMatchSet.add(c.id));
      pi.potentialClients.forEach(c => clientsWithMatchSet.add(c.id));
    });

    return {
      productsMonitored: totalMonitoredProducts,
      categoriesMonitored: categoriesSet.size,
      brandsMonitored: brandsSet.size,
      revenuePotentialTotal: totalRevenuePotential,
      clientsWithMatch: clientsWithMatchSet.size,
      skusPriorityA: priorityACount
    };
  }, [filteredProductIntelligence]);

  // --- SORTING AND PAGINATION ---
  const sortedProductIntelligence = useMemo(() => {
    return [...filteredProductIntelligence].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'sku') {
        valA = a.product.sku;
        valB = b.product.sku;
      } else if (sortField === 'name') {
        valA = a.product.name;
        valB = b.product.name;
      } else if (sortField === 'brand') {
        valA = a.product.brand;
        valB = b.product.brand;
      } else if (sortField === 'category') {
        valA = a.product.category;
        valB = b.product.category;
      } else {
        valA = a[sortField as keyof ProductIntelligence];
        valB = b[sortField as keyof ProductIntelligence];
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      }
    });
  }, [filteredProductIntelligence, sortField, sortDirection]);

  const paginatedProductIntelligence = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProductIntelligence.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProductIntelligence, currentPage]);

  const totalPages = Math.ceil(sortedProductIntelligence.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // --- EXECUTIVE RANKINGS (AREA 4) ---
  const rankingsData = useMemo(() => {
    // 1. Top Products (by Revenue)
    const topProducts = [...filteredProductIntelligence]
      .sort((a, b) => b.revenuePotential - a.revenuePotential)
      .slice(0, 5)
      .map(pi => ({ name: pi.product.name, value: pi.revenuePotential, sub: `${pi.product.brand} - SKU #${pi.product.sku}` }));

    // 2. Top Categories
    const categoriesMap: Record<string, number> = {};
    filteredProductIntelligence.forEach(pi => {
      categoriesMap[pi.product.category] = (categoriesMap[pi.product.category] || 0) + pi.revenuePotential;
    });
    const topCategories = Object.entries(categoriesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, sub: 'Foco em Demanda' }));

    // 3. Top Brands
    const brandsMap: Record<string, number> = {};
    filteredProductIntelligence.forEach(pi => {
      brandsMap[pi.product.brand] = (brandsMap[pi.product.brand] || 0) + pi.revenuePotential;
    });
    const topBrands = Object.entries(brandsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, sub: 'Fornecedor Parceiro' }));

    // 4. Top Potential Clientes
    const clientsMap: Record<string, { name: string; value: number; city: string }> = {};
    filteredProductIntelligence.forEach(pi => {
      pi.identifiedClients.forEach(c => {
        if (!clientsMap[c.id]) clientsMap[c.id] = { name: c.fantasyName, value: 0, city: c.city };
        clientsMap[c.id].value += c.potentialRevenue;
      });
      pi.potentialClients.forEach(c => {
        if (!clientsMap[c.id]) clientsMap[c.id] = { name: c.fantasyName, value: 0, city: c.city };
        clientsMap[c.id].value += c.potentialRevenue;
      });
    });
    const topClients = Object.entries(clientsMap)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5)
      .map(([_, data]) => ({ name: data.name, value: data.value, sub: `${data.city} (Oportunidades)` }));

    // 5. Top Segments
    const segmentsMap: Record<string, number> = {};
    filteredProductIntelligence.forEach(pi => {
      pi.identifiedClients.forEach(c => {
        segmentsMap[c.segment] = (segmentsMap[c.segment] || 0) + c.potentialRevenue;
      });
      pi.potentialClients.forEach(c => {
        segmentsMap[c.segment] = (segmentsMap[c.segment] || 0) + c.potentialRevenue;
      });
    });
    const topSegments = Object.entries(segmentsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, sub: 'Segmento Estratégico' }));

    // 6. Top States
    const statesMap: Record<string, number> = {};
    filteredProductIntelligence.forEach(pi => {
      pi.identifiedClients.forEach(c => {
        statesMap[c.state] = (statesMap[c.state] || 0) + c.potentialRevenue;
      });
      pi.potentialClients.forEach(c => {
        statesMap[c.state] = (statesMap[c.state] || 0) + c.potentialRevenue;
      });
    });
    const topStates = Object.entries(statesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value: value === 0 ? 0 : value, sub: `Estado: ${name}` }));

    // 7. Top Cities
    const citiesMap: Record<string, number> = {};
    filteredProductIntelligence.forEach(pi => {
      pi.identifiedClients.forEach(c => {
        citiesMap[c.city] = (citiesMap[c.city] || 0) + c.potentialRevenue;
      });
      pi.potentialClients.forEach(c => {
        citiesMap[c.city] = (citiesMap[c.city] || 0) + c.potentialRevenue;
      });
    });
    const topCities = Object.entries(citiesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, sub: 'Polo Comercial' }));

    return { topProducts, topCategories, topBrands, topClients, topSegments, topStates, topCities };
  }, [filteredProductIntelligence]);

  // --- EXPORTATIONS (AREA 5) ---
  const activeFiltersString = useMemo(() => {
    const active = [];
    if (filterEstado !== 'all') active.push(`Estado: ${filterEstado}`);
    if (filterCidade !== 'all') active.push(`Cidade: ${filterCidade}`);
    if (filterRegional !== 'all') active.push(`Regional: ${filterRegional}`);
    if (filterCategoria !== 'all') active.push(`Categoria: ${filterCategoria}`);
    if (filterMarca !== 'all') active.push(`Marca: ${filterMarca}`);
    if (filterProduto !== 'all') active.push(`ProdutoID: ${filterProduto}`);
    if (filterSegmento !== 'all') active.push(`Segmento: ${filterSegmento}`);
    if (filterScore !== 'all') active.push(`Score: ${filterScore}`);
    if (filterReceita !== 'all') active.push(`Receita: ${filterReceita}`);
    if (filterPeriodo !== 'all') active.push(`Período: ${filterPeriodo} dias`);
    if (searchQuery.trim()) active.push(`Pesquisa: "${searchQuery}"`);
    return active.join(', ') || 'Nenhum filtro aplicado';
  }, [filterEstado, filterCidade, filterRegional, filterCategoria, filterMarca, filterProduto, filterSegmento, filterScore, filterReceita, filterPeriodo, searchQuery]);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Filtros Aplicados: ' + activeFiltersString.replace(/,/g, ';') + '\n\n';
    csvContent += 'SKU,Produto,Categoria,Marca,Clientes Encontrados,Receita Potencial (BRL),Score Medio (%),Prioridade,Ultima Atualizacao\n';
    
    sortedProductIntelligence.forEach(pi => {
      const row = [
        pi.product.sku,
        `"${pi.product.name}"`,
        `"${pi.product.category}"`,
        `"${pi.product.brand}"`,
        pi.matchCount,
        pi.revenuePotential,
        pi.averageScore,
        pi.priority,
        pi.product.dateUpdated
      ];
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RadarCTrade_Inteligencia_Produtos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exportação CSV iniciada!', 'success');
  };

  const handleExportExcel = () => {
    // Excel-compatible tab-separated with BOM for Portuguese Windows Excel layout
    let excelContent = '\uFEFF';
    excelContent += 'Radar C-Trade - Relatório de Inteligência Comercial de Produtos\n';
    excelContent += `Data de Geração: 13/07/2026\n`;
    excelContent += `Filtros Ativos: ${activeFiltersString}\n\n`;
    excelContent += 'SKU\tProduto\tCategoria\tMarca\tClientes Mapeados\tReceita Potencial\tScore Médio (%)\tPrioridade\tÚltima Atualização\n';

    sortedProductIntelligence.forEach(pi => {
      const row = [
        pi.product.sku,
        pi.product.name,
        pi.product.category,
        pi.product.brand,
        pi.matchCount,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pi.revenuePotential),
        `${pi.averageScore}%`,
        `Prioridade ${pi.priority}`,
        pi.product.dateUpdated
      ];
      excelContent += row.join('\t') + '\n';
    });

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RadarCTrade_Inteligencia_Produtos_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Relatório Excel gerado com sucesso!', 'success');
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification('Por favor, permita popups para imprimir o PDF Executivo.', 'warning');
      return;
    }

    const rowsHtml = sortedProductIntelligence.map(pi => `
      <tr>
        <td style="font-family: monospace; font-size: 11px;">#${pi.product.sku}</td>
        <td style="font-weight: bold; font-size: 11px;">${pi.product.name}</td>
        <td style="font-size: 11px;">${pi.product.category}</td>
        <td style="font-size: 11px;">${pi.product.brand}</td>
        <td style="text-align: center; font-size: 11px;">${pi.matchCount}</td>
        <td style="text-align: right; font-weight: bold; font-size: 11px; color: #166534;">
          ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(pi.revenuePotential)}
        </td>
        <td style="text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${pi.averageScore}%</td>
        <td style="text-align: center; font-size: 11px;">
          <span style="padding: 2px 6px; border-radius: 4px; font-weight: bold; background-color: ${
            pi.priority === 'A' ? '#fef3c7' : pi.priority === 'B' ? '#dbeafe' : '#f1f5f9'
          }; color: ${
            pi.priority === 'A' ? '#92400e' : pi.priority === 'B' ? '#1e40af' : '#475569'
          };">
            Prioridade ${pi.priority}
          </span>
        </td>
        <td style="font-size: 10px; color: #64748b;">${pi.product.dateUpdated}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Executivo - Radar C-Trade</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; }
            .metadata { font-size: 11px; text-align: right; color: #64748b; }
            .filters-badge { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 25px; font-size: 11px; line-height: 1.5; }
            .kpi-container { display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; background-color: #fafafa; }
            .kpi-title { font-size: 9px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 4px; }
            .kpi-val { font-size: 16px; font-weight: 900; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Radar C-Trade</div>
              <div class="subtitle">Central de Inteligência de Produtos — Relatório Estratégico Executivo</div>
            </div>
            <div class="metadata">
              <strong>Data de Emissão:</strong> 13/07/2026<br>
              <strong>Emissor:</strong> Comercial C-Trade
            </div>
          </div>

          <div class="filters-badge">
            <strong>Filtros Ativos na Consulta:</strong> ${activeFiltersString}<br>
            <i>Apenas dados correspondentes aos filtros foram incluídos para esta análise estratégica.</i>
          </div>

          <div class="kpi-container">
            <div class="kpi-card">
              <div class="kpi-title">SKUs Monitorados</div>
              <div class="kpi-val">${kpiStats.productsMonitored}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Categorias</div>
              <div class="kpi-val">${kpiStats.categoriesMonitored}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Marcas</div>
              <div class="kpi-val">${kpiStats.brandsMonitored}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Receita Potencial</div>
              <div class="kpi-val">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpiStats.revenuePotentialTotal)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">PDVs com Match</div>
              <div class="kpi-val">${kpiStats.clientsWithMatch}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Prioridade A</div>
              <div class="kpi-val">${kpiStats.skusPriorityA}</div>
            </div>
          </div>

          <h3>Mapeamento de Oportunidades por SKU</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Marca</th>
                <th style="text-align: center;">Matches</th>
                <th style="text-align: right;">Receita Potencial</th>
                <th style="text-align: center;">Score Médio</th>
                <th style="text-align: center;">Prioridade</th>
                <th>Última Atualiz.</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            Radar C-Trade Commercial Intelligence Module © 2026 — Confidencial para Uso Interno
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showNotification('Documento PDF Executivo enviado para impressão!', 'success');
  };

  const handleClearFilters = () => {
    setFilterEstado('all');
    setFilterCidade('all');
    setFilterRegional('all');
    setFilterCategoria('all');
    setFilterMarca('all');
    setFilterProduto('all');
    setFilterSegmento('all');
    setFilterScore('all');
    setFilterReceita('all');
    setFilterPeriodo('all');
    setSearchQuery('');
    setCurrentPage(1);
    showNotification('Todos os filtros foram redefinidos com sucesso!', 'info');
  };

  const handleOpenDrawer = (productId: string) => {
    setSelectedProductId(productId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProductId(null);
  };

  // Switch to Clients view filtering by the selected product
  const handleViewRelatedClients = (pi: ProductIntelligence) => {
    // Save updated session storage filters consistent with system structure
    const currentSession = sessionStorage.getItem('ctrade_session_filters_base');
    let parsedSession = { produtos: [] as string[] };
    if (currentSession) {
      try { parsedSession = JSON.parse(currentSession); } catch (e) {}
    }

    const updatedFilters = {
      ...parsedSession,
      produtos: [pi.product.name],
      cliente: '' // clear text query to prevent search conflicts
    };

    sessionStorage.setItem('ctrade_session_filters_base', JSON.stringify(updatedFilters));

    // Pre-select first matched client in localstorage so work area loads it instantly
    const firstMatch = pi.identifiedClients[0] || pi.potentialClients[0];
    if (firstMatch) {
      localStorage.setItem('ctrade_selected_client_id', String(firstMatch.id));
    }

    // Trigger navigation event to switch global view
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'clientes' }));
    handleCloseDrawer();
    showNotification(`Navegando para Clientes filtrados por ${pi.product.name}`, 'info');
  };

  // Get current active intelligence item for side panel (Drawer)
  const activeIntelItem = useMemo(() => {
    if (!selectedProductId) return null;
    return computedProductIntelligence.find(pi => pi.product.id === selectedProductId) || null;
  }, [selectedProductId, computedProductIntelligence]);

  // Compute stats for segments and cities in Drawer
  const activeIntelDemographics = useMemo(() => {
    if (!activeIntelItem) return null;

    const segmentsMap: Record<string, number> = {};
    const citiesMap: Record<string, number> = {};
    const allMatches = [...activeIntelItem.identifiedClients, ...activeIntelItem.potentialClients];
    const totalCount = allMatches.length || 1;

    allMatches.forEach(c => {
      segmentsMap[c.segment] = (segmentsMap[c.segment] || 0) + 1;
      citiesMap[c.city] = (citiesMap[c.city] || 0) + 1;
    });

    const segments = Object.entries(segmentsMap)
      .map(([name, count]) => ({ name, percentage: Math.round((count / totalCount) * 100) }))
      .sort((a, b) => b.percentage - a.percentage);

    const cities = Object.entries(citiesMap)
      .map(([name, count]) => ({ name, percentage: Math.round((count / totalCount) * 100) }))
      .sort((a, b) => b.percentage - a.percentage);

    return { segments, cities };
  }, [activeIntelItem]);

  return (
    <PageContainer id="central-inteligencia-produtos-workspace">
      <Breadcrumb items={[{ label: 'Central de Inteligência de Produtos', active: true }]} />
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-fade-in shadow-2xl rounded-xl">
            <div className={`p-4 rounded-xl text-white font-bold flex items-center gap-3 border shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-100' :
              toast.type === 'warning' ? 'bg-amber-950 border-amber-800 text-amber-100' :
              toast.type === 'error' ? 'bg-rose-950 border-rose-800 text-rose-100' :
              'bg-blue-950 border-blue-800 text-blue-100'
            }`}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-4 opacity-75 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 mt-4">
          <PageHeader
            title="Central de Inteligência de Produtos"
            subtitle="Plataforma estratégica para análise de demanda, identificação de potencial e qualificação de oportunidades comerciais de SKUs C-Trade."
            badge="Estratégico"
          />
          
          {/* Quick Relatórios Bar */}
          <div className="flex items-center gap-2 self-stretch xl:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
              onClick={handleExportExcel}
              className="text-[11px] font-black uppercase tracking-wider bg-white"
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4 text-blue-600" />}
              onClick={handleExportCSV}
              className="text-[11px] font-black uppercase tracking-wider bg-white"
            >
              CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="h-4 w-4 text-slate-700" />}
              onClick={handleExportPDF}
              className="text-[11px] font-black uppercase tracking-wider border border-slate-200"
            >
              Relatório Executivo PDF
            </Button>
          </div>
        </div>

        {/* --- 1. FILTER WIDGET PANELS (COLLAPSIBLE) --- */}
        <div className="mt-6 bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
          <button 
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="w-full px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-left"
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-4.5 w-4.5 text-blue-950" />
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Filtros de Inteligência Comercial</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block mt-0.5">
                  Refine e filtre todos os widgets simultaneamente
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeFiltersString !== 'Nenhum filtro aplicado' && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-bold text-blue-900">
                  Filtros Ativos
                </span>
              )}
              <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showFiltersPanel && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-white border-b border-slate-100">
                  
                  {/* Estado */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
                    <select 
                      value={filterEstado}
                      onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todos os Estados</option>
                      {filterOptions.estados.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cidade */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                    <select 
                      value={filterCidade}
                      onChange={(e) => { setFilterCidade(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todas as Cidades</option>
                      {filterOptions.cidades.map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  {/* Regional */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regional</label>
                    <select 
                      value={filterRegional}
                      onChange={(e) => { setFilterRegional(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todas as Regionais</option>
                      {filterOptions.regionais.map(rg => (
                        <option key={rg} value={rg}>{rg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Segmento */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segmento Cliente</label>
                    <select 
                      value={filterSegmento}
                      onChange={(e) => { setFilterSegmento(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todos os Segmentos</option>
                      {filterOptions.segmentos.map(sg => (
                        <option key={sg} value={sg}>{sg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria SKU</label>
                    <select 
                      value={filterCategoria}
                      onChange={(e) => { setFilterCategoria(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todas as Categorias</option>
                      {filterOptions.categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Marca */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca SKU</label>
                    <select 
                      value={filterMarca}
                      onChange={(e) => { setFilterMarca(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todas as Marcas</option>
                      {filterOptions.marcas.map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  {/* Produto */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo / SKU</label>
                    <select 
                      value={filterProduto}
                      onChange={(e) => { setFilterProduto(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todos os SKUs</option>
                      {filterOptions.produtos.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Score */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score de Fit Médio</label>
                    <select 
                      value={filterScore}
                      onChange={(e) => { setFilterScore(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todos os Scores</option>
                      <option value="high">Excelente (Fit &gt;= 80)</option>
                      <option value="medium">Adequado (Fit 50 - 79)</option>
                      <option value="low">Insuficiente (Fit &lt; 50)</option>
                    </select>
                  </div>

                  {/* Receita Potencial */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Potencial</label>
                    <select 
                      value={filterReceita}
                      onChange={(e) => { setFilterReceita(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todos os Potenciais</option>
                      <option value="high">Alta (Faturamento &gt;= R$ 50k)</option>
                      <option value="medium">Média (R$ 15k - R$ 49.9k)</option>
                      <option value="low">Baixa (&lt; R$ 15k)</option>
                    </select>
                  </div>

                  {/* Periodo */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período de Monitoramento</label>
                    <select 
                      value={filterPeriodo}
                      onChange={(e) => { setFilterPeriodo(e.target.value); setCurrentPage(1); }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">Todo o período</option>
                      <option value="30">Últimos 30 dias</option>
                      <option value="90">Últimos 90 dias</option>
                      <option value="180">Último Semestre</option>
                    </select>
                  </div>

                </div>

                {/* Sub filter bar with text query search and clear filters button */}
                <div className="px-5 py-3.5 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="relative w-full md:max-w-md text-left">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por SKU, Produto ou Descrição..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                      {filteredProductIntelligence.length} SKUs filtrados
                    </span>
                    {(activeFiltersString !== 'Nenhum filtro aplicado') && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eraser className="h-3.5 w-3.5" />}
                        onClick={handleClearFilters}
                        className="text-[11px] font-bold py-1 bg-white border-slate-200"
                      >
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- 2. KPIS DASHBOARD AREA (AREA 1) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          
          <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="relative space-y-3 z-10 text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Produtos Monitorados</span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">{kpiStats.productsMonitored}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="relative space-y-3 z-10 text-left">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Categorias</span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">{kpiStats.categoriesMonitored}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="relative space-y-3 z-10 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Marcas</span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">{kpiStats.brandsMonitored}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="relative space-y-3 z-10 text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Receita Potencial</span>
                <span className="text-base font-black text-slate-800 block mt-0.5">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpiStats.revenuePotentialTotal)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="relative space-y-3 z-10 text-left">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-900 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Clientes com Match</span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">{kpiStats.clientsWithMatch} PDVs</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="relative space-y-3 z-10 text-left">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Prioridade A</span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">{kpiStats.skusPriorityA} SKUs</span>
              </div>
            </div>
          </Card>

        </div>

        {/* --- 3. PRODUCTS INTELLIGENCE LIST TABLE (AREA 2) --- */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
            <div className="text-left">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Produtos e Cruzamento de Cardápios</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                Clique em qualquer produto da lista para abrir a análise detalhada e ver o mapeamento do menu
              </p>
            </div>
            
            <span className="text-[10px] text-slate-400 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              Mostrando <strong>{sortedProductIntelligence.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong>-
              <strong>{Math.min(currentPage * itemsPerPage, sortedProductIntelligence.length)}</strong> de <strong>{sortedProductIntelligence.length}</strong> produtos
            </span>
          </div>

          {sortedProductIntelligence.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title="Nenhum produto ou oportunidade localizada."
                description="Experimente remover ou alterar os filtros ativos para expandir o mapeamento comercial."
                action={
                  <Button variant="primary" size="sm" onClick={handleClearFilters} className="font-bold">
                    Limpar Filtros Ativos
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">
                        Categoria
                        {sortField === 'category' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('brand')}>
                      <div className="flex items-center gap-1">
                        Marca
                        {sortField === 'brand' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Produto
                        {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('sku')}>
                      <div className="flex items-center gap-1">
                        SKU
                        {sortField === 'sku' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none text-center" onClick={() => handleSort('matchCount')}>
                      <div className="flex items-center justify-center gap-1">
                        PDVs com Match
                        {sortField === 'matchCount' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none text-right" onClick={() => handleSort('revenuePotential')}>
                      <div className="flex items-center justify-end gap-1">
                        Receita Potencial
                        {sortField === 'revenuePotential' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none text-center" onClick={() => handleSort('averageScore')}>
                      <div className="flex items-center justify-center gap-1">
                        Score Médio
                        {sortField === 'averageScore' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none text-center" onClick={() => handleSort('priority')}>
                      <div className="flex items-center justify-center gap-1">
                        Prioridade
                        {sortField === 'priority' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="py-3 px-4 font-black">Última Atualiz.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {paginatedProductIntelligence.map((pi) => (
                    <tr 
                      key={pi.product.id}
                      onClick={() => handleOpenDrawer(pi.product.id)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-left">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-bold rounded-md">
                          {pi.product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-left">{pi.product.brand}</td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-blue-950 block">{pi.product.name}</span>
                          {pi.product.isPremium && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] rounded-md font-black uppercase">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 text-left">#{pi.product.sku}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-800">{pi.matchCount} PDVs</span>
                          <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                            {pi.totalIdentified} Ativos &bull; {pi.totalPotential} Potenciais
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(pi.revenuePotential)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-1 rounded-lg font-mono font-bold text-[11px] ${
                          pi.averageScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                          pi.averageScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                          'bg-slate-50 text-slate-500 border border-slate-150'
                        }`}>
                          {pi.averageScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          pi.priority === 'A' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          pi.priority === 'B' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          Prioridade {pi.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px] text-left">{pi.product.dateUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1 bg-white"
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pg 
                        ? 'bg-blue-950 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-350'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1 bg-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* --- 4. EXECUTIVE BENTO RANKINGS (AREA 4) --- */}
        <div className="mt-8">
          <div className="text-left mb-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Rankings de Performance Comercial</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
              Identificação de pólos, categorias de maior receita e SKUs campeões de aderência na base ativa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CARD 1: Products vs Clients */}
            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {rankingTabProducts === 'products' ? 'Top 5 SKUs de Maior Impacto' : 'Top 5 PDVs com Maior Fit'}
                  </span>
                  <div className="flex p-0.5 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setRankingTabProducts('products')}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                        rankingTabProducts === 'products' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Produtos
                    </button>
                    <button
                      onClick={() => setRankingTabProducts('clients')}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                        rankingTabProducts === 'clients' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Clientes
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {(rankingTabProducts === 'products' ? rankingsData.topProducts : rankingsData.topClients).map((item, index) => {
                    const maxValue = rankingTabProducts === 'products' 
                      ? Math.max(...rankingsData.topProducts.map(x => x.value)) 
                      : Math.max(...rankingsData.topClients.map(x => x.value));
                    const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-xs">
                          <div className="truncate max-w-[200px]">
                            <span className="font-bold text-slate-400 mr-1.5 font-mono">#{index + 1}</span>
                            <span className="font-extrabold text-blue-950">{item.name}</span>
                            <span className="block text-[9px] text-slate-400 font-medium truncate">{item.sub}</span>
                          </div>
                          <span className="font-black text-emerald-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${pct}%` }} 
                            className="h-full bg-blue-900 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(rankingTabProducts === 'products' ? rankingsData.topProducts : rankingsData.topClients).length === 0 && (
                    <span className="text-xs text-slate-400 italic font-medium block py-5">Sem dados de cruzamento ativos.</span>
                  )}
                </div>
              </div>
            </Card>

            {/* CARD 2: Categories vs Brands */}
            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {rankingTabCategories === 'categories' ? 'Top 5 Categorias' : 'Top 5 Marcas Parceiras'}
                  </span>
                  <div className="flex p-0.5 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setRankingTabCategories('categories')}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                        rankingTabCategories === 'categories' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Categorias
                    </button>
                    <button
                      onClick={() => setRankingTabCategories('brands')}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                        rankingTabCategories === 'brands' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Marcas
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {(rankingTabCategories === 'categories' ? rankingsData.topCategories : rankingsData.topBrands).map((item, index) => {
                    const maxValue = rankingTabCategories === 'categories' 
                      ? Math.max(...rankingsData.topCategories.map(x => x.value)) 
                      : Math.max(...rankingsData.topBrands.map(x => x.value));
                    const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-xs">
                          <div className="truncate max-w-[200px]">
                            <span className="font-bold text-slate-400 mr-1.5 font-mono">#{index + 1}</span>
                            <span className="font-extrabold text-blue-950">{item.name}</span>
                            <span className="block text-[9px] text-slate-400 font-medium">{item.sub}</span>
                          </div>
                          <span className="font-black text-emerald-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${pct}%` }} 
                            className="h-full bg-purple-900 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(rankingTabCategories === 'categories' ? rankingsData.topCategories : rankingsData.topBrands).length === 0 && (
                    <span className="text-xs text-slate-400 italic font-medium block py-5">Sem dados de cruzamento ativos.</span>
                  )}
                </div>
              </div>
            </Card>

            {/* CARD 3: Demographics & Polo Locations */}
            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {rankingTabDemographics === 'segments' ? 'Top Segmentos' : 'Top Cidades & Estados'}
                  </span>
                  <div className="flex p-0.5 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setRankingTabDemographics('segments')}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                        rankingTabDemographics === 'segments' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Segmentos
                    </button>
                    <button
                      onClick={() => setRankingTabDemographics('locations')}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                        rankingTabDemographics === 'locations' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Geografia
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {(rankingTabDemographics === 'segments' ? rankingsData.topSegments : rankingsData.topCities).map((item, index) => {
                    const maxValue = rankingTabDemographics === 'segments' 
                      ? Math.max(...rankingsData.topSegments.map(x => x.value)) 
                      : Math.max(...rankingsData.topCities.map(x => x.value));
                    const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-xs">
                          <div className="truncate max-w-[200px]">
                            <span className="font-bold text-slate-400 mr-1.5 font-mono">#{index + 1}</span>
                            <span className="font-extrabold text-blue-950">{item.name}</span>
                            <span className="block text-[9px] text-slate-400 font-medium">{item.sub}</span>
                          </div>
                          <span className="font-black text-emerald-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${pct}%` }} 
                            className="h-full bg-orange-950 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(rankingTabDemographics === 'segments' ? rankingsData.topSegments : rankingsData.topCities).length === 0 && (
                    <span className="text-xs text-slate-400 italic font-medium block py-5">Sem dados de cruzamento ativos.</span>
                  )}
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* --- 5. LATERAL DETAIL PRODUCT ANALYSIS PANEL (AREA 3) --- */}
        <AnimatePresence>
          {isDrawerOpen && activeIntelItem && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDrawer}
                className="fixed inset-0 bg-slate-950/40 z-40"
              />

              {/* Slide panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 22, stiffness: 120 }}
                className="fixed top-0 right-0 bottom-0 w-full sm:w-[540px] bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col h-full overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">
                        SKU: #{activeIntelItem.product.sku}
                      </span>
                      {activeIntelItem.product.isPremium && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                          <Award className="h-3 w-3" /> Premium
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wide leading-tight text-white">{activeIntelItem.product.name}</h3>
                    <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                      {activeIntelItem.product.brand} &bull; {activeIntelItem.product.category}
                    </p>
                  </div>
                  <button onClick={handleCloseDrawer} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content: Cascade of Commercial Intelligence */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 relative">
                  <div className="absolute left-9 top-8 bottom-8 w-[1px] border-l border-dashed border-slate-300/80 z-0" />
                  
                  {/* STEP 1: Resumo Executivo */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      1
                    </div>
                    <div className="flex-1 space-y-1.5 bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Resumo Executivo</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        Este insumo é classificado como <strong className="text-blue-950">Prioridade {activeIntelItem.priority}</strong> baseado em sua receita mapeável na base de clientes ativos. Trata-se de uma oportunidade com score médio de <strong className="text-indigo-950">{activeIntelItem.averageScore}%</strong>.
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light mt-1">
                        {activeIntelItem.product.description}
                      </p>
                    </div>
                  </div>

                  {/* STEP 2: Clientes onde foi encontrado */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      2
                    </div>
                    <div className="flex-1 space-y-3 bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PDVs Mapeados ({activeIntelItem.matchCount})</span>
                      
                      <div className="space-y-2">
                        {activeIntelItem.identifiedClients.map((c, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-xs font-black text-blue-950 block">{c.fantasyName}</span>
                              <span className="text-[10px] text-slate-400 font-bold block">{c.city} - {c.state}</span>
                            </div>
                            <Badge variant="success" className="text-[9px] font-bold">Ativo</Badge>
                          </div>
                        ))}
                        {activeIntelItem.potentialClients.map((c, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-amber-50/40 rounded-xl border border-amber-100/60">
                            <div>
                              <span className="text-xs font-black text-slate-800 block">{c.fantasyName}</span>
                              <span className="text-[10px] text-slate-400 font-semibold block">{c.city} - {c.state}</span>
                            </div>
                            <Badge variant="warning" className="text-[9px] font-bold">Potencial</Badge>
                          </div>
                        ))}
                        {activeIntelItem.matchCount === 0 && (
                          <p className="text-xs text-slate-400 italic">Nenhum cliente ativo para os filtros selecionados.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Segmentos Predominantes */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      3
                    </div>
                    <div className="flex-1 space-y-3.5 bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">Segmentos Predominantes</span>
                      <div className="space-y-2.5">
                        {activeIntelDemographics?.segments.map((seg, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-blue-950">{seg.name}</span>
                              <span className="font-black text-slate-500">{seg.percentage}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div style={{ width: `${seg.percentage}%` }} className="h-full bg-indigo-900 rounded-full" />
                            </div>
                          </div>
                        ))}
                        {activeIntelDemographics?.segments.length === 0 && (
                          <p className="text-xs text-slate-400 italic">Nenhum segmento detectado.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STEP 4: Principais Cidades */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      4
                    </div>
                    <div className="flex-1 space-y-3.5 bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Geolocalização / Principais Cidades</span>
                      <div className="space-y-2.5">
                        {activeIntelDemographics?.cities.map((city, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-blue-950 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" /> {city.name}
                              </span>
                              <span className="font-black text-slate-500">{city.percentage}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div style={{ width: `${city.percentage}%` }} className="h-full bg-purple-900 rounded-full" />
                            </div>
                          </div>
                        ))}
                        {activeIntelDemographics?.cities.length === 0 && (
                          <p className="text-xs text-slate-400 italic font-medium">Nenhuma cidade mapeada.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STEP 5: Pratos identificados */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      5
                    </div>
                    <div className="flex-1 space-y-3 bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pratos Identificados no Cardápio</span>
                      <div className="space-y-2">
                        {activeIntelItem.identifiedClients.map((c, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-start gap-3">
                            <BookOpen className="h-4 w-4 text-indigo-900 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400">{c.fantasyName}</span>
                              <p className="text-xs font-extrabold text-slate-800 leading-relaxed">{c.dish}</p>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Ref: {c.menuName}</span>
                            </div>
                          </div>
                        ))}
                        {activeIntelItem.totalIdentified === 0 && (
                          <p className="text-xs text-slate-400 italic">Nenhum prato mapeado ativamente nos menus.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STEP 6: Receita Potencial */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      6
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-xl border border-blue-950 shadow-3xs">
                      <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">Receita Potencial Estimada</span>
                      <span className="text-2xl font-black block mt-1.5">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeIntelItem.revenuePotential)}
                      </span>
                      <p className="text-[10px] text-indigo-100 font-semibold mt-1">
                        Valor gerado pelo cruzamento da base ativa de leads qualificados.
                      </p>
                    </div>
                  </div>

                  {/* STEP 7: Insights da IA */}
                  <div className="flex gap-4 relative z-10 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs">
                      7
                    </div>
                    <div className="flex-1 space-y-2 bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1 text-slate-800">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Insights C-Trade IA
                      </span>
                      <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl text-xs text-indigo-950 font-medium leading-relaxed">
                        Identificamos {activeIntelItem.totalPotential} estabelecimentos com características culinárias idênticas aos atuais compradores do item <strong className="text-indigo-900">{activeIntelItem.product.name}</strong>. A abordagem comercial focando em ganho de margem para o parceiro estratégica de embalagem ({activeIntelItem.product.packaging}) possui conversão estimada de 24%.
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Drawer Controls */}
                <div className="p-4 bg-white border-t border-slate-150 flex gap-3 shrink-0">
                  <Button variant="secondary" className="flex-1 font-bold" size="sm" onClick={handleCloseDrawer}>
                    Fechar Painel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 font-black uppercase tracking-wider"
                    size="sm"
                    leftIcon={<Building2 className="h-4 w-4" />}
                    onClick={() => handleViewRelatedClients(activeIntelItem)}
                  >
                    Ver Clientes Relacionados
                  </Button>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </PageContainer>
  );
}
