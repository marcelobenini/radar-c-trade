/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard, InsightCard } from '../components/ui/Card';
import { Badge, ProgressBar, Spinner, Toast } from '../components/ui/Feedback';
import ScoreIndicator from '../components/ui/Score';
import { REAL_CLIENTS } from '../data/realData';
import GlobalFilters from '../components/shared/GlobalFilters';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import { syncPlatformData } from '../utils/platformSync';

const RCA_OPTIONS = [
  { value: 'rca-marcelo', label: 'RCA Marcelo Baquero' },
  { value: 'rca-amanda', label: 'RCA Amanda Souza' },
  { value: 'rca-pedro', label: 'RCA Pedro Santos' },
  { value: 'rca-lucas', label: 'RCA Lucas Oliveira' },
];

import {
  FileText,
  Search,
  SlidersHorizontal,
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
  Calendar,
  Clock,
  User,
  Activity,
  Briefcase,
  Share2,
  ThumbsUp,
  PieChart,
  HelpCircle,
  Eraser
} from 'lucide-react';

// --- DATA STRUCTURES ---
interface Report {
  id: string;
  name: string;
  type: 'Resumo Executivo' | 'Radar Comercial' | 'Análise de Cliente' | 'Análise de Cardápio' | 'Produtos Encontrados' | 'Produtos Recomendados' | 'Ranking Comercial' | 'Clientes por Potencial';
  client: string;
  period: string;
  date: string;
  status: 'Concluído' | 'Rascunho' | 'Atualizado' | 'Pendente';
  responsible: string;
  city: string;
  state: string;
  segment: string;
  score: number;
  revenueTier: string;
  potentialValue: string;
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
  // Dossiê details
  cuisine: string;
  address: string;
  contact: string;
  gastronomicProfile: string;
  foundProducts: string[];
  recommendedProducts: string[];
  competitors: string[];
  approachStrategy: string;
  salesPitch: string;
  nextSteps: string[];
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'Executivo' | 'Comercial' | 'Gerencial' | 'Cliente' | 'Produto' | 'Análise IA';
  iconColor: string;
}

interface TimelineEvent {
  id: string;
  reportName: string;
  action: string;
  user: string;
  time: string;
  status: 'export' | 'create' | 'update';
}

export default function Relatorios() {
  // --- MOCK DATABASE ---
  const initialReports: Report[] = [
    {
      id: 'rep-1',
      name: 'Dossiê de Penetração de Insumos - Osteria Bella Italia',
      type: 'Análise de Cliente',
      client: 'Osteria Bella Italia',
      period: 'Julho 2026',
      date: '07/07/2026',
      status: 'Atualizado',
      responsible: 'Marcelo Baquero',
      city: 'São Paulo',
      state: 'SP',
      segment: 'Trattoria / Pizzaria',
      score: 94,
      revenueTier: 'R$ 150k - R$ 200k',
      potentialValue: 'R$ 48k/ano',
      potential: 'Muito Alto',
      cuisine: 'Italiana Clássica',
      address: 'Al. Lorena, 1420 - Jardins, São Paulo - SP',
      contact: 'Luigi Rossini (Chef/Dono) - (11) 98765-4321',
      gastronomicProfile: 'Restaurante tradicional italiano focado em massas artesanais frescas e pizzas napolitanas clássicas assadas em forno a lenha de alta temperatura (450°C). Prioriza ingredientes com selo de Denominação de Origem Protegida (DOP).',
      foundProducts: [
        'Farinha Caputo Italiana Pizzeria (Tipo 00)',
        'Tomate Pelado San Marzano DOP',
        'Queijo Grana Padano DOP Inteiro (Fração)'
      ],
      recommendedProducts: [
        'Azeite de Oliva Extra Virgem Premium Colheita Tardia',
        'Arroz Carnaroli Superfino Premium',
        'Massa Seca di Grano Duro Penne Rigate trefilada em bronze',
        'Prosciutto di Parma DOP Fatiado Artesanal'
      ],
      competitors: [
        'Trattoria da Enrico (Sócio antigo)',
        'Pizzaria Napoletana 1910 (Delivery local)',
        'Pasta & Co (Foco em almoço executivo)'
      ],
      approachStrategy: 'Apresentar o Azeite Premium CTrade para finalização de pratos quentes e serviço de mesa. Paralelamente, oferecer amostra de 5kg do Arroz Carnaroli para os risotos sazonais, sugerindo um teste cego prático com a equipe da cozinha.',
      salesPitch: 'Demonstrar que o risoto elaborado com grão Carnaroli Superfino retém 12% mais umidade de caldos sem perder a rigidez al dente na rampa de serviço, o que eleva a rentabilidade de cada porção servida em até 15%.',
      nextSteps: [
        'Agendar visita presencial do consultor gastronômico na próxima terça-feira.',
        'Enviar lote teste contendo 1L de Azeite Premium e 5kg de Arroz Carnaroli.',
        'Apresentar proposta comercial de distribuição progressiva por escala de volume.'
      ]
    },
    {
      id: 'rep-2',
      name: 'Análise de Viabilidade de Cardápio - La Slice',
      type: 'Análise de Cardápio',
      client: 'La Slice Pizzas Artesanais',
      period: 'Últimos 30 dias',
      date: '05/07/2026',
      status: 'Concluído',
      responsible: 'Pedro Silva',
      city: 'Campinas',
      state: 'SP',
      segment: 'Pizzaria Express / Delivery',
      score: 88,
      revenueTier: 'R$ 80k - R$ 120k',
      potentialValue: 'R$ 32k/ano',
      potential: 'Alto',
      cuisine: 'Pizzaria Napolitana Moderna',
      address: 'Av. Júlio de Mesquita, 880 - Cambuí, Campinas - SP',
      contact: 'Renato Mendes (Gerente Operacional) - (19) 99122-3344',
      gastronomicProfile: 'Operação de alta eficiência focada em pizzas individuais napolitanas de consumo rápido, focando em delivery de alta performance e salão moderno de poucas mesas. Adota fermentação fria de 48h.',
      foundProducts: [
        'Farinha Caputo Italiana Pizzeria (Tipo 00)',
        'Tomate Pelado San Marzano DOP'
      ],
      recommendedProducts: [
        'Azeite de Oliva Extra Virgem Premium Colheita Tardia',
        'Queijo Grana Padano DOP Inteiro (Fração)',
        'Prosciutto di Parma DOP Fatiado Artesanal'
      ],
      competitors: [
        'Domino\'s Cambuí (Apelo de preço)',
        'Fornellone Pizza (Forno tradicional)',
        'Pizza d\'Oro (Foco em pizza paulistana familiar)'
      ],
      approachStrategy: 'Focar na venda do Queijo Grana Padano DOP em lascas para acabamento de bordas e do Prosciutto de Parma fatiado Negroni para elevar o tíquete das pizzas gourmet assinatura.',
      salesPitch: 'O consumidor de pizza napolitana individual aceita pagar até R$ 12 extras por uma pizza que explicita levar o Prosciutto de Parma certificado na descrição, enquanto o custo adicional do ingrediente é de R$ 3.80 por unidade.',
      nextSteps: [
        'Efetuar ligação telefônica para agendar demonstração de fatiados CTrade.',
        'Disponibilizar embalagem demonstrativa de presunto cru para o pizzaiolo-chefe.',
        'Auxiliar na integração de combos especiais no cardápio do aplicativo próprio.'
      ]
    },
    {
      id: 'rep-3',
      name: 'Relatório de Posicionamento Premium - Gero Rio',
      type: 'Resumo Executivo',
      client: 'Gero Rio',
      period: 'Junho 2026',
      date: '28/06/2026',
      status: 'Concluído',
      responsible: 'Marcelo Baquero',
      city: 'Rio de Janeiro',
      state: 'RJ',
      segment: 'Fine Dining / Alta Gastronomia',
      score: 96,
      revenueTier: 'R$ 300k+',
      potentialValue: 'R$ 120k/ano',
      potential: 'Muito Alto',
      cuisine: 'Italiana Clássica Contemporânea',
      address: 'Rua Aníbal de Mendonça, 157 - Ipanema, Rio de Janeiro - RJ',
      contact: 'Massimo Torres (Maître Gérant) - (21) 2239-1234',
      gastronomicProfile: 'Um dos mais tradicionais e renomados estabelecimentos gastronômicos do país. Execução de receitas clássicas impecáveis para público de altíssimo poder aquisitivo e turistas de negócios.',
      foundProducts: [
        'Farinha Caputo Italiana Pizzeria (Tipo 00)',
        'Tomate Pelado San Marzano DOP',
        'Queijo Grana Padano DOP Inteiro (Fração)',
        'Azeite de Oliva Extra Virgem Premium Colheita Tardia',
        'Arroz Carnaroli Superfino Premium'
      ],
      recommendedProducts: [
        'Trufas Negras Inteiras de Verão em Conserva',
        'Massa Seca di Grano Duro Penne Rigate trefilada em bronze'
      ],
      competitors: [
        'Cipriani - Copacabana Palace (Concorrente de Luxo)',
        'Vieira Souto Ristorante (Foco em frutos do mar sofisticados)',
        'Satyricon (Comida mediterrânea)'
      ],
      approachStrategy: 'Introduzir a exclusividade das Trufas Negras de Verão inteiras Urbani Tartufi. O chef Massimo busca insumos sazonais que justifiquem festivais de inverno de alto valor agregado.',
      salesPitch: 'O trufamento ao vivo em frente ao cliente (ralando as lâminas de trufa negra sobre a massa fresca) gera um apelo estético fortíssimo para os clientes, permitindo precificação de até R$ 240 por prato.',
      nextSteps: [
        'Apresentar proposta comercial exclusiva do lote especial importado da Umbria.',
        'Encaminhar certificados de origem e laudo microbiológico das trufas para a chefia.',
        'Programar envio sob refrigeração customizada direto do estoque alfandegário.'
      ]
    },
    {
      id: 'rep-4',
      name: 'Auditoria de Gaps de Insumos - Forno & Sabor',
      type: 'Produtos Encontrados',
      client: 'Forno & Sabor',
      period: 'Últimos 15 dias',
      date: '15/06/2026',
      status: 'Rascunho',
      responsible: 'Ana Costa',
      city: 'Belo Horizonte',
      state: 'MG',
      segment: 'Pizzaria de Bairro / Tradicional',
      score: 72,
      revenueTier: 'R$ 50k - R$ 80k',
      potentialValue: 'R$ 18k/ano',
      potential: 'Médio',
      cuisine: 'Pizzaria Tradicional Brasileira',
      address: 'Rua Pium-I, 920 - Anchieta, Belo Horizonte - MG',
      contact: 'Manoel Souza (Proprietário) - (31) 3221-5588',
      gastronomicProfile: 'Pizzaria de apelo familiar com enorme volume em canais de delivery e salão focado em rodízio/combos. Processamento de ingredientes nacionais convencionais visando baixo custo fixo.',
      foundProducts: [],
      recommendedProducts: [
        'Farinha Caputo Italiana Pizzeria (Tipo 00)',
        'Tomate Pelado San Marzano DOP',
        'Azeite de Oliva Extra Virgem Premium Colheita Tardia'
      ],
      competitors: [
        'Pizzaria Mangabeiras (Apelo tradicional regional)',
        'Domenico Pizzaria (Especialista em napolitanas gourmet)',
        'Pizza Sur (Foco em gastronomia argentina de rua)'
      ],
      approachStrategy: 'Iniciar uma transição equilibrada. Focar na substituição do molho convencional pelo Tomate Pelado San Marzano para enriquecer a base aromática sem provocar elevação brusca do custo unitário.',
      salesPitch: 'O tomate pelado em conserva elimina as perdas por oxidação e deterioração de tomates in natura no pré-preparo (perdas de até 20%), além de garantir acidez estável e padronização visual em todas as estações.',
      nextSteps: [
        'Compartilhar e-book de eficiência econômica da CTrade com planilhas de custo/porção.',
        'Agendar contato telefônico para propor workshop de pizzas napolitanas rápidas.'
      ]
    },
    {
      id: 'rep-5',
      name: 'Dossiê de Cardápio Executivo - Bistro de la Ville',
      type: 'Análise de Cardápio',
      client: 'Bistro de la Ville',
      period: 'Junho 2026',
      date: '10/06/2026',
      status: 'Concluído',
      responsible: 'Marcelo Baquero',
      city: 'São Paulo',
      state: 'SP',
      segment: 'Bistrô Francês / Contemporâneo',
      score: 82,
      revenueTier: 'R$ 120k - R$ 180k',
      potentialValue: 'R$ 28k/ano',
      potential: 'Alto',
      cuisine: 'Francesa / Contemporânea',
      address: 'Rua Oscar Freire, 540 - Cerqueira César, São Paulo - SP',
      contact: 'Alice Dupont (Chef de Cuisine) - (11) 99887-7665',
      gastronomicProfile: 'Bistrô aconchegante com receitas autorais de inspiração francesa unidas a ingredientes frescos brasileiros. Famoso por sua carta de vinhos finos e menus de almoço de alta rotatividade.',
      foundProducts: [
        'Tomate Pelado San Marzano DOP',
        'Azeite de Oliva Extra Virgem Premium Colheita Tardia'
      ],
      recommendedProducts: [
        'Queijo Grana Padano DOP Inteiro (Fração)',
        'Arroz Carnaroli Superfino Premium'
      ],
      competitors: [
        'Le Jazz Brasserie (Grande fluxo diário)',
        'Bistrô Paris 6 (Comercial massivo)',
        'Chef Rouge (Francês formal tradicional)'
      ],
      approachStrategy: 'Fornecer o Queijo Grana Padano DOP ralado na hora para os risotos e pratos executivos do almoço do bistrô, agregando prestígio ao menu com excelente custo-benefício.',
      salesPitch: 'O queijo Grana Padano importado traz um valor percebido enorme se comparado ao queijo ralado nacional convencional, reduzindo a taxa de atrito nas vendas do almoço executivo premium em até 22%.',
      nextSteps: [
        'Enviar amostra grátis de 1kg do queijo Grana Padano para teste na cozinha de serviço.',
        'Enviar folheto técnico com notas de harmonização para os garçons e sommeliers.'
      ]
    }
  ];

  const reportTemplates: Template[] = [
    {
      id: 'temp-1',
      title: 'Resumo Executivo',
      description: 'Documento consolidado focado na diretoria com kpis de faturamento e volumes globais.',
      category: 'Executivo',
      iconColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'temp-2',
      title: 'Dossiê Comercial',
      description: 'Documento tático individual do estabelecimento unindo fit score, gaps de produtos e pitch de abordagem.',
      category: 'Cliente',
      iconColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'temp-3',
      title: 'Ranking de Adherência',
      description: 'Relatório comparativo mapeando os clientes com maior proximidade de fechamento comercial.',
      category: 'Comercial',
      iconColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'temp-4',
      title: 'Evolução de Penetração',
      description: 'Estudo de marcas e insumos mais frequentes versus explorados por região metropolitana.',
      category: 'Produto',
      iconColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    {
      id: 'temp-5',
      title: 'Inteligência de Mercado',
      description: 'Análise gerada pelo Gemini interpretando tendências de concorrentes e cardápios regionais.',
      category: 'Análise IA',
      iconColor: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      id: 'temp-6',
      title: 'Análise Geográfica',
      description: 'Mapeamento de faturamento e densidade de leads comerciais por região do estado.',
      category: 'Gerencial',
      iconColor: 'bg-slate-50 text-slate-800 border-slate-200'
    }
  ];

  const recentTimeline: TimelineEvent[] = [
    {
      id: 'time-1',
      reportName: 'Dossiê de Penetração - Osteria Bella Italia',
      action: 'exportado em PDF',
      user: 'Marcelo Baquero',
      time: 'Há 12 min',
      status: 'export'
    },
    {
      id: 'time-2',
      reportName: 'Análise de Viabilidade - La Slice',
      action: 'gerado pela inteligência artificial',
      user: 'Sistema IA',
      time: 'Há 1h',
      status: 'create'
    },
    {
      id: 'time-3',
      reportName: 'Auditoria de Gaps - Forno & Sabor',
      action: 'atualizado por Ana Costa',
      user: 'Ana Costa',
      time: 'Ontem',
      status: 'update'
    },
    {
      id: 'time-4',
      reportName: 'Relatório Premium - Gero Rio',
      action: 'exportado em formato Excel',
      user: 'Pedro Silva',
      time: 'Há 2 dias',
      status: 'export'
    }
  ];

  // --- STATE ---
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('ctrade_reports_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialReports;
  });

  useEffect(() => {
    localStorage.setItem('ctrade_reports_data', JSON.stringify(reports));
    syncPlatformData();
  }, [reports]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ctrade_reports_data');
      if (saved) {
        try {
          setReports(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const targetClient = localStorage.getItem('ctrade_selected_report_client');
    if (targetClient && reports.length > 0) {
      const found = reports.find(rep => rep.client.toLowerCase() === targetClient.toLowerCase());
      if (found) {
        setSelectedReport(found);
        localStorage.removeItem('ctrade_selected_report_client');
      }
    }
  }, [reports]);

  const [activeMainTab, setActiveMainTab] = useState<'dossies' | 'rejeitados'>('dossies');

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

  // Load rejected records from localStorage
  const rejectedRecords = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('ctrade_rejected_records');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [activeMainTab]); // Recalculate when tab changes
  
  // Advanced filters state
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('Todos');

  // Interactive Selected Report (Modal / Full View)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'fit' | 'abordagem' | 'analise'>('fit');

  // Simulator for loading reports
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Helper arrays for filters
  const uniqueTypes = ['Todos', 'Resumo Executivo', 'Radar Comercial', 'Análise de Cliente', 'Análise de Cardápio', 'Produtos Encontrados', 'Produtos Recomendados', 'Clientes por Potencial'];

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
    setFilterType('Todos');
    showNotification('Todos os critérios de busca foram redefinidos.', 'info');
  };

  // Filter Reports List
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // 0. Período filter (global)
      if (sessionFilters.periodoOption !== 'all') {
        const [d, m, y] = r.date.split('/');
        const itemDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
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

      // 1. Estado filter
      if (sessionFilters.estados.length > 0) {
        if (!sessionFilters.estados.includes(r.state)) return false;
      }

      // 2. Cidade filter
      if (sessionFilters.cidades.length > 0) {
        if (!sessionFilters.cidades.includes(r.city)) return false;
      }

      // 3. Search input (cliente / query)
      if (sessionFilters.cliente) {
        const query = sessionFilters.cliente.toLowerCase();
        const matchSearch = 
          r.name.toLowerCase().includes(query) ||
          r.client.toLowerCase().includes(query) ||
          r.responsible.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          r.segment.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }

      // 4. Client object based filters (RCA, Categoria, Segmento, Status)
      const clientObj = REAL_CLIENTS.find(c => c.name === r.client);

      // RCA
      if (sessionFilters.rcas.length > 0) {
        const clientRcaId = r.state === 'RJ' ? 'rca-marcelo' : 'rca-amanda';
        if (!sessionFilters.rcas.includes(clientRcaId)) return false;
      }

      // Categoria (mapping r.cuisine or client category)
      if (sessionFilters.categorias.length > 0) {
        const hasMatchingCat = 
          (clientObj && sessionFilters.categorias.includes(clientObj.category)) ||
          sessionFilters.categorias.includes(r.cuisine);
        if (!hasMatchingCat) return false;
      }

      // Segmento
      if (sessionFilters.segmentos.length > 0) {
        const hasMatchingSeg = 
          sessionFilters.segmentos.includes(r.segment) ||
          (clientObj && sessionFilters.segmentos.includes(clientObj.segment));
        if (!hasMatchingSeg) return false;
      }

      // Status
      if (sessionFilters.statuses.length > 0) {
        const mappedStatus = (r.status === 'Concluído' || r.status === 'Atualizado') ? 'Autorizados' : 'Entradas';
        if (!sessionFilters.statuses.includes(mappedStatus)) return false;
      }

      // Score Comercial
      if (sessionFilters.scoreComercial !== 'all') {
        if (sessionFilters.scoreComercial === 'Excelente' && r.score < 90) return false;
        if (sessionFilters.scoreComercial === 'Alto' && (r.score < 80 || r.score >= 90)) return false;
        if (sessionFilters.scoreComercial === 'Médio' && (r.score < 60 || r.score >= 80)) return false;
        if (sessionFilters.scoreComercial === 'Baixo' && r.score >= 60) return false;
      }

      // Local type filter
      if (filterType !== 'Todos' && r.type !== filterType) return false;

      return true;
    });
  }, [reports, sessionFilters, filterType]);

  // Create report from template
  const handleCreateFromTemplate = (template: Template) => {
    setIsGeneratingReport(true);
    showNotification(`Acelerador Cognitivo inicializado para template: ${template.title}`, 'info');

    setTimeout(() => {
      setIsGeneratingReport(false);
      // Generate a mock report based on template
      const newRepId = `rep-${Date.now()}`;
      const newReport: Report = {
        id: newRepId,
        name: `Relatório Automatizado (${template.title}) - Novo Lead Paulista`,
        type: template.title as any,
        client: 'Gero Jardins (Novo)',
        period: 'Julho 2026',
        date: '07/07/2026',
        status: 'Concluído',
        responsible: 'Marcelo Baquero',
        city: 'São Paulo',
        state: 'SP',
        segment: 'Fine Dining / Alta Gastronomia',
        score: 95,
        revenueTier: 'R$ 300k+',
        potentialValue: 'R$ 96k/ano',
        potential: 'Muito Alto',
        cuisine: 'Italiana Clássica Moderna',
        address: 'Rua Haddock Lobo, 1620 - Jardins, São Paulo - SP',
        contact: 'Renato Belinelli (Maitre Executivo) - (11) 98111-2233',
        gastronomicProfile: 'Bistrô clássico italiano de luxo, com alto giro de clientela exigente e menus focados em trufas, risotos e massas longas frescas.',
        foundProducts: ['Farinha Caputo Italiana Pizzeria (Tipo 00)', 'Queijo Grana Padano DOP Inteiro (Fração)'],
        recommendedProducts: ['Tomate Pelado San Marzano DOP', 'Azeite de Oliva Extra Virgem Premium Colheita Tardia', 'Arroz Carnaroli Superfino Premium'],
        competitors: ['Fasano (Concorrente de Grupo)', 'Piselli (Concorrente Direto)', 'Ristorante Parigi'],
        approachStrategy: 'Apresentar o Tomate Pelado San Marzano DOP CTrade destacando a acidez vulcânica perfeitamente equilibrada e o selo DOP que eleva a credibilidade das massas vermelhas.',
        salesPitch: 'Diferencial de acabamento e dulçor inigualável na preparação de molhos que reduz a necessidade de correções com açúcar, mantendo o padrão italiano autêntico exigido pelo público Triple A.',
        nextSteps: ['Iniciar contato com o Sommelier chefe para oferecer também os Azeites Premiuns.', 'Agendar reunião técnica com o chef executivo para demonstração de rendimento.']
      };

      setReports([newReport, ...reports]);
      setSelectedReport(newReport); // Auto-open detail
      showNotification(`Dossiê de Inteligência Gerado! Novo documento ativo.`, 'success');
    }, 1500);
  };

  // Export Simulated Actions
  const handleSimulateExport = (format: 'PDF' | 'Excel' | 'CSV' | 'PPT') => {
    showNotification(`Preparando estrutura de dados para exportação em ${format}...`, 'info');
    setTimeout(() => {
      showNotification(`Sucesso! Relatório gerencial baixado em formato ${format}.`, 'success');
    }, 1200);
  };

  return (
    <PageContainer id="page-reports-central">
      <Breadcrumb items={[{ label: 'Relatórios', active: true }]} />
      <div className="relative">
        
        {/* Loading overlay for generation */}
        {isGeneratingReport && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center">
            <div className="bg-white p-6.5 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
              <Spinner className="h-10 w-10 text-blue-900" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Compilando Dossiê Comercial</h4>
                <p className="text-xs text-slate-400 leading-normal">O Gemini está interpretando cardápios, cruzando oportunidades e estruturando o pitch executivo...</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-blue-900 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.4 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* PAGE HEADER */}
        <PageHeader
          title="Central de Relatórios Executivos"
          subtitle="Visualize, gere e exporte dossiês comerciais e relatórios táticos de alto impacto estruturados por inteligência artificial."
          badge="Fase 07"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calendar className="h-3.5 w-3.5" />}
                onClick={() => showNotification('Funcionalidade de agendamento em segundo plano configurada como rascunho.', 'info')}
              >
                Agendar Envio
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={() => handleSimulateExport('PDF')}
              >
                Exportar Lote
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => {
                  const demoTemp = reportTemplates[1]; // Use Dossiê template
                  handleCreateFromTemplate(demoTemp);
                }}
              >
                Novo Relatório
              </Button>
            </div>
          }
        />

        {/* --- FILTROS GLOBAIS --- */}
        <div className="mt-6">
          <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
        </div>

        {/* --- CARDS SUPERIORES / KPIS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6" id="reports-metrics-row">
          <MetricCard
            title="Relatórios Gerados"
            value="284"
            icon={<FileText className="h-4.5 w-4.5 text-blue-900" />}
            trend={{ value: 'Mensal', type: 'neutral' }}
          />
          <MetricCard
            title="PDF Exportados"
            value="142"
            icon={<Download className="h-4.5 w-4.5 text-indigo-600" />}
            trend={{ value: '+14% esta sem.', type: 'up' }}
          />
          <MetricCard
            title="Atualização Base"
            value="Hoje, 09:45"
            icon={<Clock className="h-4.5 w-4.5 text-amber-500" />}
            comparisonText="Sincronizado"
          />
          <MetricCard
            title="Clientes Analisados"
            value="86"
            icon={<Building2 className="h-4.5 w-4.5 text-emerald-600" />}
            trend={{ value: '+8 novos', type: 'up' }}
          />
          <MetricCard
            title="Itens Identificados"
            value="412"
            icon={<CheckCircle2 className="h-4.5 w-4.5 text-blue-600" />}
            trend={{ value: 'No Radar', type: 'neutral' }}
          />
          <MetricCard
            title="Potencial Estimado"
            value="R$ 1.8M"
            icon={<TrendingUp className="h-4.5 w-4.5 text-emerald-500" />}
            trend={{ value: 'Alto retorno', type: 'up' }}
          />
        </div>

        {/* --- TWO COLUMN EXECUTIVE DASHBOARD WIDGETS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8" id="dashboard-graphics-grid">
          
          {/* Chart 1: Evolution (Line Curve Mock SVG) */}
          <Card className="lg:col-span-2 flex flex-col justify-between p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-blue-900" />
                  Evolução Temporal de Relatórios
                </h4>
                <p className="text-[10px] text-slate-400">Total de dossiês gerados e exportações executadas nos últimos 6 meses.</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">2026</span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-48 w-full flex items-end relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                {/* Shading area beneath curve */}
                <path
                  d="M 10 110 L 10 80 Q 90 40 170 70 T 330 20 T 490 10 L 490 110 Z"
                  fill="url(#gradient-blue-shade)"
                  opacity="0.15"
                />

                {/* Curved line */}
                <path
                  d="M 10 80 Q 90 40 170 70 T 330 20 T 490 10"
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Spark dots */}
                <circle cx="10" cy="80" r="4" fill="#1e3a8a" />
                <circle cx="90" cy="55" r="4" fill="#3b82f6" />
                <circle cx="170" cy="70" r="4" fill="#1e3a8a" />
                <circle cx="250" cy="40" r="4" fill="#3b82f6" />
                <circle cx="330" cy="20" r="4" fill="#1e3a8a" />
                <circle cx="410" cy="15" r="4" fill="#3b82f6" />
                <circle cx="490" cy="10" r="4" fill="#1e3a8a" />

                <defs>
                  <linearGradient id="gradient-blue-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X axis descriptions */}
              <div className="absolute bottom-[-15px] inset-x-0 flex justify-between text-[8.5px] text-slate-400 font-bold uppercase px-1">
                <span>Fev</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>Mai</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </Card>

          {/* Chart 2: Pizza / Donut Breakdown */}
          <Card className="flex flex-col justify-between p-5 space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="h-4 w-4 text-emerald-600" />
                Análises por Segmentação
              </h4>
              <p className="text-[10px] text-slate-400">Distribuição dos perfis de culinária mapeados na plataforma.</p>
            </div>

            {/* Custom SVG Donut representation */}
            <div className="flex items-center justify-around gap-2 h-36">
              <div className="relative h-24 w-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
                  {/* Segment 1: Italiana (45%) */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e3a8a" strokeWidth="3.2" strokeDasharray="45 55" strokeDashoffset="100" />
                  {/* Segment 2: Pizzaria (30%) */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray="30 70" strokeDashoffset="55" />
                  {/* Segment 3: Outros (25%) */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray="25 75" strokeDashoffset="25" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-800">86</span>
                  <span className="text-[7.5px] text-slate-400 uppercase tracking-widest font-bold">Leads</span>
                </div>
              </div>

              {/* Labels list */}
              <div className="space-y-1.5 text-[9px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-900" />
                  <span>Italiana (45%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Pizzarias (30%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Bistrôs/Outros (25%)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* --- TEMPLATES SECTOR --- */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                Modelos de Relatórios e Templates Executivos
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Use modelos pré-estruturados para acelerar apresentações de campo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4" id="report-templates-grid">
            {reportTemplates.map((temp) => (
              <div
                key={temp.id}
                onClick={() => handleCreateFromTemplate(temp)}
                className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group text-left relative overflow-hidden"
              >
                <div className="space-y-2.5">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${temp.iconColor}`}>
                    {temp.category}
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                    {temp.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal line-clamp-3">
                    {temp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-50 mt-3 flex items-center justify-between text-[9px] text-blue-900 font-bold">
                  <span>Girar Dossiê</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- TWO COLUMN MAIN LAYOUT: LIST & FILTERS vs. HISTORIC TIMELINE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8" id="reports-main-layout">
          
          {/* Left / Middle: Reports List and Search Filters */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Filtros Globais */}
            <div className="space-y-4">
              
              {/* Local Type filter inside a neat sub-bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Tipo de Relatório:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueTypes.map(t => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterType === t
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex border-b border-slate-200 gap-6 mb-3">
              <button
                onClick={() => setActiveMainTab('dossies')}
                className={`py-2 text-xs font-bold transition-all border-b-2 px-1 ${
                  activeMainTab === 'dossies'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Dossiês de Inteligência ({filteredReports.length})
              </button>
              <button
                onClick={() => setActiveMainTab('rejeitados')}
                className={`py-2 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
                  activeMainTab === 'rejeitados'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>Registros Rejeitados ({rejectedRecords.length})</span>
                <span className="bg-rose-100 text-rose-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  Auditoria
                </span>
              </button>
            </div>

            {/* Reports DataTable */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              {activeMainTab === 'dossies' ? (
                <>
                  <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                      Lista de Documentos Disponíveis ({filteredReports.length})
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Dossiês de inteligência ativos</span>
                  </div>

                  {filteredReports.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <FileText className="h-8 w-8 text-slate-300 mb-2 animate-pulse" />
                      <h5 className="text-xs font-bold text-slate-800">Nenhum dossiê preenche os requisitos</h5>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Tente redefinir os filtros do painel superior para expandir a busca.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-5">Nome do Relatório</th>
                            <th className="py-3 px-4">Tipo</th>
                            <th className="py-3 px-4">Segmento / Cliente</th>
                            <th className="py-3 px-4 text-center">Score</th>
                            <th className="py-3 px-4 text-right">Potencial</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-5 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                          {filteredReports.map((rep) => (
                            <tr
                              key={rep.id}
                              className="hover:bg-slate-50/40 transition-colors group cursor-pointer"
                              onClick={() => setSelectedReport(rep)}
                            >
                              <td className="py-3.5 px-5">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                                    {rep.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <User className="h-3 w-3" />
                                    {rep.responsible} • {rep.date}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 text-[11px] font-semibold">
                                {rep.type}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex flex-col">
                                  <span className="text-slate-700 font-bold">{rep.client}</span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    {rep.city} - {rep.state}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex items-center justify-center rounded-full h-7 w-7 text-[10px] font-extrabold ${
                                  rep.score >= 90 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                                }`}>
                                  {rep.score}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-blue-950">{rep.potentialValue}</span>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                    rep.potential === 'Muito Alto' ? 'text-rose-500' : rep.potential === 'Alto' ? 'text-amber-500' : 'text-slate-400'
                                  }`}>
                                    {rep.potential}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <Badge
                                  variant={
                                    rep.status === 'Atualizado' ? 'info' : rep.status === 'Concluído' ? 'success' : 'secondary'
                                  }
                                >
                                  {rep.status}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="px-2 py-1 h-7 text-[10px] font-bold"
                                    onClick={() => setSelectedReport(rep)}
                                  >
                                    Visualizar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-2 py-1 h-7 text-[10px] font-bold hover:bg-slate-50"
                                    onClick={() => handleSimulateExport('PDF')}
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
                </>
              ) : (
                <>
                  <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      Relatório de Auditoria de Registros Rejeitados ({rejectedRecords.length})
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                      Auditoria de Descartes
                    </span>
                  </div>

                  {rejectedRecords.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <ShieldCheck className="h-10 w-10 text-emerald-500 mb-2" />
                      <h5 className="text-xs font-bold text-slate-800">Sem registros rejeitados na sessão</h5>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-sm">Excelente! Todos os cardápios de clientes e oportunidades comerciais estão ativos, qualificados ou em andamento.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-5">Cliente / Código</th>
                            <th className="py-3 px-4">Arquivo / Origem</th>
                            <th className="py-3 px-4">Data Rejeição</th>
                            <th className="py-3 px-4">Motivo da Rejeição</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-5 text-right">Responsável</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                          {rejectedRecords.map((rec: any, idx: number) => (
                            <tr key={rec.id || idx} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800">{rec.clientName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {rec.id}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                                {rec.file || 'manual_check'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">
                                {rec.date}
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                <div className="bg-rose-50/50 border border-rose-100/50 text-rose-800 px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed">
                                  {rec.reason}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <Badge variant="danger">Rejeitado</Badge>
                              </td>
                              <td className="py-3.5 px-5 text-right text-[10px] font-bold text-slate-700">
                                {rec.responsible || rec.user}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Recent Historic Timeline */}
          <div className="space-y-4">
            <Card className="p-4 bg-white border border-slate-100 space-y-4 shadow-2xs">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-900" />
                  Histórico Recente
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Operações de emissão executadas ultimamente.</p>
              </div>

              <div className="flow-root">
                <ul className="-mb-8">
                  {recentTimeline.map((evt, idx) => (
                    <li key={evt.id}>
                      <div className="relative pb-8">
                        {idx !== recentTimeline.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                              evt.status === 'export' ? 'bg-indigo-50 text-indigo-700' : evt.status === 'create' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              <FileText className="h-3.5 w-3.5" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                              <span className="font-bold text-slate-800">{evt.user}</span> {evt.action} <span className="font-semibold text-slate-500 italic block">{evt.reportName}</span>
                            </p>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">{evt.time}</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Quick Export formats */}
            <Card className="p-4 bg-slate-900 text-white space-y-4 shadow-sm overflow-hidden relative">
              {/* Mesh decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="h-20 w-20 rotate-12" />
              </div>

              <div className="relative z-10 space-y-2">
                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-white/20 text-white tracking-widest">
                  Formatos Disponíveis
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider">Exportações Executivas</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Prepare apresentações táticas unindo design comercial da CTrade e insights do Gemini.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 relative z-10" id="reports-formats-grid">
                <button
                  onClick={() => handleSimulateExport('PDF')}
                  className="bg-white/10 hover:bg-white/20 text-[10px] font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all outline-none"
                >
                  <FileText className="h-3.5 w-3.5 text-rose-400" />
                  PDF Comercial
                </button>
                <button
                  onClick={() => handleSimulateExport('Excel')}
                  className="bg-white/10 hover:bg-white/20 text-[10px] font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all outline-none"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  Excel Leads
                </button>
                <button
                  onClick={() => handleSimulateExport('CSV')}
                  className="bg-white/10 hover:bg-white/20 text-[10px] font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all outline-none"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
                  Matriz CSV
                </button>
                <button
                  onClick={() => handleSimulateExport('PPT')}
                  className="bg-white/10 hover:bg-white/20 text-[10px] font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all outline-none"
                >
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  PowerPoint PPT
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* --- EXECUTIVE PRESENTATION VIEW: DOSSIÊ COMERCIAL OVERLAY MODAL --- */}
        <AnimatePresence>
          {selectedReport && (
            <>
              {/* Modal Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedReport(null)}
                className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-xs"
              />

              {/* Modal Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-x-4 top-10 bottom-10 md:inset-x-24 md:top-14 md:bottom-14 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-100"
                id="executive-report-modal"
              >
                {/* Header Block of Presentation */}
                <div className="bg-slate-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 relative shrink-0">
                  <div className="space-y-1.5 z-10 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-900 text-white uppercase tracking-wider">
                        {selectedReport.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                        Fit Score: {selectedReport.score}%
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300">
                        {selectedReport.cuisine}
                      </span>
                    </div>

                    <h2 className="text-base md:text-lg font-black tracking-tight text-white leading-tight">
                      Dossiê Comercial Estratégico — {selectedReport.client}
                    </h2>
                    
                    <p className="text-[11px] text-slate-400 font-medium">
                      Emitido em: {selectedReport.date} por {selectedReport.responsible} • Período de Referência: {selectedReport.period}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0 z-10 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-white/10 px-2.5"
                      onClick={() => handleSimulateExport('PDF')}
                    >
                      <Download className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                      Baixar PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-white/10 px-2.5"
                      onClick={() => handleSimulateExport('Excel')}
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                      Excel
                    </Button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Mesh abstract logo in background */}
                  <div className="absolute right-10 top-0 bottom-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Sparkles className="h-28 w-28 text-white" />
                  </div>
                </div>

                {/* Tab selector */}
                <div className="bg-slate-50 border-b border-slate-100 flex px-6 shrink-0">
                  <button
                    onClick={() => setActiveReportTab('fit')}
                    className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                      activeReportTab === 'fit' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Identificação & Fit Comercial
                  </button>
                  <button
                    onClick={() => setActiveReportTab('abordagem')}
                    className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                      activeReportTab === 'abordagem' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Estratégia de Abordagem & Pitch
                  </button>
                  <button
                    onClick={() => setActiveReportTab('analise')}
                    className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeReportTab === 'analise' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Análise Preditiva Cognitiva
                  </button>
                </div>

                {/* Modal main content (scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/10">
                  
                  {activeReportTab === 'fit' ? (
                    // --- TAB 1: GENERAL FIT & SPECS ---
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left and Mid Column: Fit Details */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Profile Block */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            Perfil do Estabelecimento
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-light">
                            {selectedReport.gastronomicProfile}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Endereço Comprovado</span>
                              <strong className="text-slate-700 font-bold">{selectedReport.address}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Contato Direto</span>
                              <strong className="text-slate-700 font-bold">{selectedReport.contact}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Gaps de Insumos / Products found & recommended */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Products found */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3.5 shadow-3xs">
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              Produtos Identificados ({selectedReport.foundProducts.length})
                            </h4>
                            
                            {selectedReport.foundProducts.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Nenhum produto do portfólio oficial CTrade foi detectado no cardápio atualmente analisado.</p>
                            ) : (
                              <ul className="space-y-2">
                                {selectedReport.foundProducts.map((p, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Products recommended */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3.5 shadow-3xs">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-blue-900" />
                              Produtos Recomendados ({selectedReport.recommendedProducts.length})
                            </h4>
                            
                            <ul className="space-y-2">
                              {selectedReport.recommendedProducts.map((p, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-slate-700 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Competitors perceived */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Compass className="h-4 w-4 text-slate-400" />
                            Mapeamento de Concorrência Local
                          </h4>
                          <p className="text-[11px] text-slate-400">Restaurantes e operações similares competindo pelo mesmo perfil de faturamento.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            {selectedReport.competitors.map((comp, idx) => (
                              <div key={idx} className="bg-slate-50 p-3 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                                {comp}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Key Commercial Indices */}
                      <div className="space-y-4">
                        
                        {/* FIT SCORE BIG CARD */}
                        <Card className="p-5 text-center flex flex-col items-center justify-center space-y-3 border-2 border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Grau de Aderência</span>
                          
                          <div className="relative h-28 w-28 flex items-center justify-center">
                            {/* SVG gauge ring */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeDasharray={`${selectedReport.score} ${100 - selectedReport.score}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-slate-800">{selectedReport.score}%</span>
                              <span className="text-[8px] font-extrabold text-blue-900 uppercase tracking-widest">Aderência</span>
                            </div>
                          </div>

                          <span className="px-3 py-1 bg-blue-900 text-white font-bold rounded-full text-[10px] uppercase tracking-wide">
                            {selectedReport.potential} Potencial
                          </span>
                        </Card>

                        {/* Potencial Estimado Financeiro */}
                        <Card className="p-5 space-y-2 bg-slate-900 text-white">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Valor Estimado em Compra</span>
                          <h3 className="text-2xl font-black text-emerald-400">{selectedReport.potentialValue}</h3>
                          <p className="text-[10px] text-slate-300 leading-normal font-light">Estimativa com base no volume de assentos mapeados, ticket médio e gaps de massas/azeites identificados no cardápio público.</p>
                        </Card>

                        {/* Faturamento Tier */}
                        <Card className="p-4 bg-white border border-slate-100 space-y-1 shadow-3xs">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Faturamento Mensal Estimado</span>
                          <strong className="text-xs font-extrabold text-slate-700 block">{selectedReport.revenueTier}</strong>
                        </Card>

                        {/* Estado e Cidade */}
                        <Card className="p-4 bg-white border border-slate-100 space-y-1 shadow-3xs">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Território Comercial</span>
                          <strong className="text-xs font-extrabold text-slate-700 block">{selectedReport.city} - {selectedReport.state}</strong>
                        </Card>

                      </div>

                    </div>
                  ) : activeReportTab === 'abordagem' ? (
                    // --- TAB 2: APPROACH STRATEGIES & ARGUMENTS ---
                    <div className="space-y-6 max-w-4xl mx-auto">
                      
                      {/* Strategy Box */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Compass className="h-5 w-5 text-blue-900" />
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Diretriz Estratégica de Abordagem
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">
                          {selectedReport.approachStrategy}
                        </p>
                      </div>

                      {/* Pitch Box */}
                      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-2xl space-y-3.5 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-blue-800 pb-3">
                          <Sparkles className="h-5 w-5 text-amber-400" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">
                            Argumento de Alta Conversão (Sales Pitch)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-normal italic">
                          "{selectedReport.salesPitch}"
                        </p>
                      </div>

                      {/* Next steps list */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-3xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Próximos Passos Comerciais Sugeridos
                          </h4>
                        </div>

                        <div className="space-y-3.5">
                          {selectedReport.nextSteps.map((step, idx) => (
                            <div key={idx} className="flex gap-3 text-xs">
                              <span className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {idx + 1}
                              </span>
                              <p className="text-slate-600 font-light mt-0.5 leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    // --- TAB 3: COGNITIVE PREDICTIONS & MOCK AI GRAPH ---
                    <div className="space-y-6 max-w-4xl mx-auto">
                      
                      <InsightCard
                        title="Perspectiva de Penetração Regional"
                        content="Análise de regressão cognitiva indica que pizzarias de mesmo ticket no bairro de Pinheiros/Jardins aumentaram o consumo de Farinha Caputo e Tomate Pelado em 28% no último semestre. O Osteria Bella Italia possui uma lacuna tática que pode ser preenchida de forma assertiva com esses combos combinados."
                        category="Previsão do Gemini"
                      />

                      <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-3xs">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Curva Estimada de Economia Operacional (%)</h4>
                        <p className="text-[10px] text-slate-400">Comparativo simulando transição para o portfólio de importação direta CTrade.</p>
                        
                        {/* Micro visual graph representing mock progression */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Mês 01: Adaptação e Testes (Sem desperdício)</span>
                              <span className="font-bold">Economia: 5%</span>
                            </div>
                            <ProgressBar value={30} colorClass="bg-blue-900" />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Mês 03: Substituição Plena de Farinha Caputo</span>
                              <span className="font-bold">Economia: 12%</span>
                            </div>
                            <ProgressBar value={65} colorClass="bg-emerald-500" />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Mês 06: Compra Combinada de Azeites e Fatiados</span>
                              <span className="font-bold">Economia: 22%</span>
                            </div>
                            <ProgressBar value={95} colorClass="bg-blue-900" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 text-xs text-amber-950 flex gap-3">
                        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold">Nota de Homologação de Dados</h5>
                          <p className="mt-1 leading-normal font-light text-amber-900/80">Esta seção de inteligência utiliza algoritmos cognitivos avançados baseados na leitura automatizada de cardápios via OCR e LLMs. Os dados de potencial financeiro são estimativas ponderadas de mercado.</p>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Footer block of Presentation */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-900" />
                    Dossiê Comercial Consolidado • CTrade Distribuidora
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      Fechar Dossiê
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Printer className="h-3.5 w-3.5" />}
                      onClick={() => showNotification('Preparando folha de rosto e frentes para impressão física comercial...', 'success')}
                    >
                      Imprimir
                    </Button>
                  </div>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </PageContainer>
  );
}
