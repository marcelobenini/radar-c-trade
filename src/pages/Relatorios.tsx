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
import { Badge, Spinner, Toast, EmptyState } from '../components/ui/Feedback';
import ScoreIndicator from '../components/ui/Score';
import GlobalFilters from '../components/shared/GlobalFilters';
import Breadcrumb from '../components/ui/Breadcrumb';
import { syncPlatformData } from '../utils/platformSync';
import { SecurityService } from '../services/securityService';

// Import raw data and helper
import { REAL_CLIENTS, REAL_PRODUCTS, REAL_CARDAPIOS, REAL_OPPORTUNITIES, REAL_ANALYSES } from '../data/realData';
import { REPORT_CATEGORIES, REPORTS_REGISTRY, ReportItem } from '../data/reportsMetadata';

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
  X,
  Plus,
  Award,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Activity,
  PieChart
} from 'lucide-react';

// Interfaces for retroactive compatibility
interface Report {
  id: string;
  name: string;
  type: string;
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

const initialReports: Report[] = [
  {
    id: 'rep-1',
    name: 'Dossiê de Penetração de Insumos - Osteria Bella Italia',
    type: 'Resumo Executivo',
    client: 'Babbo Osteria',
    period: 'Julho 2026',
    date: '07/07/2026',
    status: 'Atualizado',
    responsible: 'Marcelo Baquero',
    city: 'Rio de Janeiro',
    state: 'RJ',
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
  }
];

export default function Relatorios() {
  // Load and sync existing reports for backwards compatibility
  const [reports, setReports] = useState<Report[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ctrade_reports_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialReports;
  });

  useEffect(() => {
    localStorage.setItem('ctrade_reports_data', JSON.stringify(reports));
    syncPlatformData();
  }, [reports]);

  // Handle deep-links to client dossiers
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

  // Local state for Global Filters
  const [sessionFilters, setSessionFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('ctrade_session_filters_base');
      if (saved) {
        try {
          return JSON.parse(saved);
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

  // Categories & Detail navigation
  const [activeCategory, setActiveCategory] = useState<string>('comercial');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Individual dossier retro modal states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'fit' | 'abordagem' | 'analise'>('fit');

  // Interactive controls
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [localSearch, setLocalSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
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

  // 100% reactive filter engine for all base data arrays
  const filteredClients = useMemo(() => {
    return REAL_CLIENTS.filter(item => {
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(item.state)) return false;
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(item.city)) return false;
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(item.segment)) return false;
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(item.status)) return false;
      if (sessionFilters.cliente) {
        const query = sessionFilters.cliente.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && !item.fantasyName.toLowerCase().includes(query)) return false;
      }

      // Period Date filter
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

  const filteredProducts = useMemo(() => {
    return REAL_PRODUCTS.filter(item => {
      if (sessionFilters.marcas.length > 0 && !sessionFilters.marcas.includes(item.brand)) return false;
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(item.category)) return false;
      if (sessionFilters.produtos.length > 0 && !sessionFilters.produtos.includes(item.name)) return false;
      return true;
    });
  }, [sessionFilters]);

  const filteredCardapios = useMemo(() => {
    return REAL_CARDAPIOS.filter(item => {
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(item.estado)) return false;
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(item.cidade)) return false;
      if (sessionFilters.categorias.length > 0 && !sessionFilters.categorias.includes(item.categoria)) return false;
      
      // Period
      if (item.dataCardapio) {
        const itemDate = parseDateString(item.dataCardapio);
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

  const filteredOpportunities = useMemo(() => {
    return REAL_OPPORTUNITIES.filter(item => {
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(item.estado)) return false;
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(item.cidade)) return false;
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(item.segmento)) return false;
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(item.status)) return false;
      
      // Period
      if (item.dataAnalise) {
        const itemDate = parseDateString(item.dataAnalise);
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

  const filteredAnalyses = useMemo(() => {
    return REAL_ANALYSES.filter(item => {
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(item.estado)) return false;
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(item.cidade)) return false;
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(item.segmento)) return false;
      return true;
    });
  }, [sessionFilters]);

  const filteredLogs = useMemo(() => {
    const rawLogs = SecurityService.getLogs();
    return rawLogs.filter(item => {
      // Filter logs by period
      if (item.date) {
        const itemDate = parseDateString(item.date);
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

  // Shared dataset package passed to the calculators
  const datasetBundle = useMemo(() => ({
    clients: filteredClients,
    products: filteredProducts,
    cardapios: filteredCardapios,
    opportunities: filteredOpportunities,
    analyses: filteredAnalyses,
    logs: filteredLogs
  }), [filteredClients, filteredProducts, filteredCardapios, filteredOpportunities, filteredAnalyses, filteredLogs]);

  // All reports list sorted by active category
  const activeCategoryReports = useMemo(() => {
    return Object.values(REPORTS_REGISTRY).filter(r => r.category === activeCategory);
  }, [activeCategory]);

  // Selected active report calculations
  const activeReport = useMemo(() => {
    if (!activeReportId) return null;
    const def = REPORTS_REGISTRY[activeReportId];
    if (!def) return null;
    return {
      definition: def,
      calculated: def.calculateData(datasetBundle)
    };
  }, [activeReportId, datasetBundle]);

  // Filter & paginate the rows of the active report
  const tableRows = useMemo(() => {
    if (!activeReport) return [];
    let rows = activeReport.calculated.rows;
    if (localSearch) {
      const q = localSearch.toLowerCase();
      rows = rows.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        );
      });
    }
    return rows;
  }, [activeReport, localSearch]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return tableRows.slice(startIndex, startIndex + rowsPerPage);
  }, [tableRows, currentPage]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / rowsPerPage));

  // Secure Export Flow with RBAC Verification
  const handleExportReport = (format: 'PDF' | 'Excel' | 'CSV' | 'Print') => {
    if (!activeReport) return;
    const reportName = activeReport.definition.name;
    const count = activeReport.calculated.rows.length;

    // RBAC Security Check
    const allowed = SecurityService.hasPermission('Relatórios', 'Exportar');
    
    if (!allowed) {
      // Log blocked attempt to Auditoria
      SecurityService.logAction({
        module: 'Relatórios',
        action: `Exportar ${format}`,
        result: 'Bloqueado',
        description: `Tentativa não autorizada de exportar o relatório "${reportName}" em formato ${format}.`,
        affectedRecord: reportName
      });
      
      showNotification('Acesso Negado: Seu perfil não possui permissão para exportar relatórios táticos.', 'error');
      return;
    }

    // Success flow - log to Auditoria
    SecurityService.logAction({
      module: 'Relatórios',
      action: `Exportar ${format}`,
      result: 'Sucesso',
      description: `Exportação do relatório "${reportName}" em formato ${format}.`,
      affectedRecord: reportName,
      clientName: reportName,
      actionType: `Exportação ${format}`
    });

    if (format === 'Print' || format === 'PDF') {
      window.print();
      showNotification('Iniciando diálogo de impressão/salvamento do documento...', 'success');
      return;
    }

    // Generate and download actual physical CSV file
    const cols = activeReport.definition.getColumns();
    const headerLine = cols.map(c => c.header).join(';');
    const bodyLines = activeReport.calculated.rows.map(row => 
      cols.map(c => String(row[c.key] || '')).join(';')
    );
    const content = '\uFEFF' + [headerLine, ...bodyLines].join('\n'); // UTF-8 BOM
    
    const fileType = format === 'Excel' ? 'application/vnd.ms-excel' : 'text/csv';
    const extension = format === 'Excel' ? 'xls' : 'csv';
    const blob = new Blob([content], { type: `${fileType};charset=utf-8;` });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `radar_ctrade_${activeReport.definition.id}_export.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Sucesso! Relatório "${reportName}" (${count} registros) exportado com sucesso.`, 'success');
  };

  // Reset page pagination when switching reports or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [activeReportId, localSearch]);

  return (
    <PageContainer id="page-reports-central">
      <Breadcrumb items={[{ label: 'Relatórios', active: true }]} />

      {/* Print-only CSS block */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #print-area-report, #print-area-report * {
            visibility: visible;
          }
          #print-area-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 print:hidden">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className="relative">
        
        {/* Page Header (Hidden on print) */}
        <div className="print:hidden">
          <PageHeader
            title="Central de Relatórios"
            subtitle="Explore relatórios operacionais, gerenciais e consolidados respondendo aos filtros globais da distribuidora."
            badge="Módulo 4.5"
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="h-3.5 w-3.5" />}
                  onClick={() => {
                    if (activeReportId) {
                      handleExportReport('Print');
                    } else {
                      showNotification('Selecione um relatório específico para imprimir.', 'warning');
                    }
                  }}
                >
                  Imprimir Tela
                </Button>
              </div>
            }
          />
        </div>

        {/* Global Filters Integration */}
        <div className="mt-6 print:hidden">
          <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
        </div>

        {/* --- REPORT VIEW WORKSPACE --- */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Category Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2 print:hidden">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-2">Categorias</h3>
            <div className="space-y-1">
              {REPORT_CATEGORIES.map(cat => {
                const isSelected = activeCategory === cat.id && !activeReportId;
                const reportsCount = Object.values(REPORTS_REGISTRY).filter(r => r.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setActiveReportId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group cursor-pointer ${
                      isSelected && !activeReportId
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-900'}`} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {reportsCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Info className="h-4 w-4 text-blue-900" />
                <span>Rastreabilidade</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                Todos os downloads de planilhas são auditados conforme diretrizes rígidas de segurança (RBAC).
              </p>
            </div>
          </div>

          {/* Main Workspace Area */}
          <div className="lg:col-span-3 space-y-6">

            {/* CASE 1: REPORT IS SELECTED & ACTIVE */}
            {activeReportId && activeReport ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="print-area-report">
                
                {/* Back to list & secure export bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 print:hidden">
                  <button
                    onClick={() => setActiveReportId(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar para {REPORT_CATEGORIES.find(c => c.id === activeCategory)?.name}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white hover:bg-slate-100 border border-slate-200"
                      leftIcon={<Printer className="h-3.5 w-3.5" />}
                      onClick={() => handleExportReport('Print')}
                    >
                      Imprimir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white hover:bg-slate-100 border border-slate-200"
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                      onClick={() => handleExportReport('PDF')}
                    >
                      Exportar PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white hover:bg-slate-100 border border-slate-200"
                      leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}
                      onClick={() => handleExportReport('Excel')}
                    >
                      Excel (XLS)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white hover:bg-slate-100 border border-slate-200"
                      leftIcon={<FileText className="h-3.5 w-3.5 text-blue-600" />}
                      onClick={() => handleExportReport('CSV')}
                    >
                      CSV
                    </Button>
                  </div>
                </div>

                {/* Report Core Sheet Content */}
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Branding / Institution Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="info">{REPORT_CATEGORIES.find(c => c.id === activeCategory)?.name}</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activeReport.definition.lastUpdate}
                        </span>
                      </div>
                      <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">
                        {activeReport.definition.name}
                      </h2>
                      <p className="text-xs text-slate-400 max-w-2xl font-light">
                        {activeReport.definition.description}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-semibold space-y-1 shrink-0">
                      <div>Emissão: <strong className="text-slate-800 font-bold">Hoje ({new Date().toLocaleDateString('pt-BR')})</strong></div>
                      <div>Responsável: <strong className="text-slate-800 font-bold">Marcelo Baquero</strong></div>
                      <div>Registros: <strong className="text-blue-900 font-bold">{activeReport.calculated.rows.length} itens</strong></div>
                    </div>
                  </div>

                  {/* Resumo Executivo Narrative */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                    <h4 className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Resumo Executivo da Rodada
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {activeReport.calculated.summary}
                    </p>
                  </div>

                  {/* Metrics Row (KPIs) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeReport.calculated.indicators.map((ind, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white flex flex-col justify-between space-y-2 shadow-3xs">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{ind.label}</span>
                        <div className="text-xl font-black text-slate-800 tracking-tight">{ind.value}</div>
                        {ind.description && (
                          <span className="text-[9px] text-slate-400 font-light">{ind.description}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Custom Chart Render */}
                  {activeReport.calculated.chartType && activeReport.calculated.chartType !== 'none' && activeReport.calculated.chartData && (
                    <Card className="p-5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <PieChart className="h-4 w-4 text-blue-900" />
                        Distribuição e Comparação de Registros
                      </h4>

                      {activeReport.calculated.chartType === 'bar' && (
                        <div className="space-y-2.5">
                          {activeReport.calculated.chartData.slice(0, 5).map((bar: any, idx: number) => {
                            const maxValue = Math.max(...activeReport.calculated.chartData!.map((c: any) => Number(c.value) || 0));
                            const percent = maxValue > 0 ? (Number(bar.value) / maxValue) * 100 : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                  <span>{bar.label}</span>
                                  <span>{bar.value}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <motion.div
                                    className="bg-blue-900 h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {activeReport.calculated.chartType === 'progress' && (
                        <div className="space-y-3">
                          {activeReport.calculated.chartData.slice(0, 4).map((prog: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                <span>{prog.label}</span>
                                <span>{prog.value}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                  className="bg-emerald-500 h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prog.value}%` }}
                                  transition={{ duration: 0.8 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeReport.calculated.chartType === 'pie' && (
                        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                          <div className="relative h-24 w-24">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeDasharray="60 40" strokeDashoffset="100" />
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="40" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">
                              Concentração
                            </div>
                          </div>
                          <div className="space-y-1.5 text-[9px] font-bold text-slate-500">
                            {activeReport.calculated.chartData.map((lbl: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-blue-900' : 'bg-emerald-500'}`} />
                                <span>{lbl.label}: {lbl.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Data Table of Results */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 print:hidden">
                      <h4 className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-blue-900" />
                        Resultados Granulares Mapeados
                      </h4>

                      <div className="relative max-w-xs w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar nesta tabela..."
                          value={localSearch}
                          onChange={(e) => setLocalSearch(e.target.value)}
                          className="w-full bg-slate-50 text-xs border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-slate-700 focus:outline-hidden focus:border-blue-950 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Clean Simple responsive Table */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              {activeReport.definition.getColumns().map((col, idx) => (
                                <th key={idx} className={`p-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                  {col.header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paginatedRows.length === 0 ? (
                              <tr>
                                <td colSpan={activeReport.definition.getColumns().length} className="p-8">
                                  <EmptyState
                                    title="Nenhum registro encontrado."
                                    description="Não encontramos dados que correspondam aos termos de busca ou filtros ativos."
                                    action={
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSessionFilters({
                                          estados: [], cidades: [], regionais: [], rcas: [], categorias: [], produtos: [], marcas: [], segmentos: [], statuses: [], scoreComercial: 'all', scoreFit: 'all', cidade: '', cliente: '', periodoOption: '30', dataInicio: '', dataFim: ''
                                        })}
                                      >
                                        Limpar Filtros
                                      </Button>
                                    }
                                  />
                                </td>
                              </tr>
                            ) : (
                              paginatedRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                  {activeReport.definition.getColumns().map((col, colIdx) => (
                                    <td key={colIdx} className={`p-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} font-medium`}>
                                      {row[col.key] === 'Aprovado' || row[col.key] === 'Concluído' || row[col.key] === 'Sucesso' || row[col.key] === 'Ativo' ? (
                                        <Badge variant="success">{row[col.key]}</Badge>
                                      ) : row[col.key] === 'Pendente' || row[col.key] === 'Bloqueado' || row[col.key] === 'NEGADO (403)' || row[col.key] === 'Inativo/Descartado' ? (
                                        <Badge variant="danger">{row[col.key]}</Badge>
                                      ) : col.key === 'score' || col.key === 'avgScore' ? (
                                        <strong className="text-slate-800 font-extrabold">{row[col.key]}</strong>
                                      ) : (
                                        row[col.key]
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 print:hidden">
                          <span>
                            Página <strong className="text-slate-700 font-bold">{currentPage}</strong> de {totalPages} ({tableRows.length} resultados)
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-white border border-slate-200"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              Anterior
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-white border border-slate-200"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                              Próximo
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              
              // CASE 2: BENTO CATEGORY DIRECTORY GRID (Show all report cards in selected category)
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    {REPORT_CATEGORIES.find(c => c.id === activeCategory)?.name} — Relatórios Estruturados
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {REPORT_CATEGORIES.find(c => c.id === activeCategory)?.description}
                  </p>
                </div>

                {activeCategoryReports.length === 0 ? (
                  <EmptyState
                    title="Nenhum relatório encontrado para os filtros selecionados."
                    description="Não encontramos registros que correspondam aos termos de busca ou filtros ativos."
                    action={
                      <Button size="sm" variant="outline" onClick={() => setSessionFilters({
                        estados: [], cidades: [], regionais: [], rcas: [], categorias: [], produtos: [], marcas: [], segmentos: [], statuses: [], scoreComercial: 'all', scoreFit: 'all', cidade: '', cliente: '', periodoOption: '30', dataInicio: '', dataFim: ''
                      })}>
                        Limpar Filtros
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCategoryReports.map(item => {
                      // Compute dynamic count based on current filters on load
                      let count = 0;
                      try {
                        const data = item.calculateData(datasetBundle);
                        count = data.rows.length;
                      } catch (e) {
                        console.error(e);
                      }

                      return (
                        <div
                          key={item.id}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between hover:shadow-xs hover:border-slate-200 transition-all group"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-900 font-black text-[8px] uppercase tracking-wider">
                                {count} registros mapeados
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">{item.lastUpdate}</span>
                            </div>
                            
                            <h4 className="text-xs font-black text-slate-800 group-hover:text-blue-900 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-light">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-4">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 text-[10px]"
                              rightIcon={<ChevronRight className="h-3 w-3" />}
                              onClick={() => setActiveReportId(item.id)}
                            >
                              Visualizar
                            </Button>
                            <button
                              onClick={() => {
                                // Fast secure Excel export from dashboard
                                setActiveReportId(item.id);
                                setTimeout(() => handleExportReport('Excel'), 100);
                              }}
                              title="Exportar Planilha Excel"
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dossier presentation shortcut for backward compatibility */}
                <Card className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-dashed border-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Dossiês de Inteligência de Clientes
                    </h4>
                    <p className="text-[10px] text-slate-400">Acesse relatórios e pitches individuais para abordagem direta em campo.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {reports.map((rep) => (
                      <span key={rep.id}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] bg-white border border-slate-100 shadow-3xs"
                          onClick={() => setSelectedReport(rep)}
                        >
                          {rep.client}
                        </Button>
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* --- RETRO-COMPATIBLE INDIVIDUAL CLIENT DOSSIER MODAL --- */}
        <AnimatePresence>
          {selectedReport && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-100 w-full max-w-4xl max-h-[85vh]"
                id="executive-report-modal"
              >
                {/* Header */}
                <div className="bg-slate-950 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 relative shrink-0">
                  <div className="space-y-1 z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-blue-900 text-white uppercase tracking-wider">
                        {selectedReport.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                        Fit Score: {selectedReport.score}%
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                      Dossiê Comercial Estratégico — {selectedReport.client}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Emitido em: {selectedReport.date} por {selectedReport.responsible}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors absolute top-4 right-4 sm:static shrink-0"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="bg-slate-50 border-b border-slate-150 flex px-4 shrink-0 overflow-x-auto">
                  <button
                    onClick={() => setActiveReportTab('fit')}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                      activeReportTab === 'fit' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Identificação & Fit
                  </button>
                  <button
                    onClick={() => setActiveReportTab('abordagem')}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                      activeReportTab === 'abordagem' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Estratégia & Pitch
                  </button>
                  <button
                    onClick={() => setActiveReportTab('analise')}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeReportTab === 'analise' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Análise IA
                  </button>
                </div>

                {/* Modal Body scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                  {activeReportTab === 'fit' ? (
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          Perfil do Estabelecimento
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">
                          {selectedReport.gastronomicProfile}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                          <div>
                            <span className="text-slate-400 block text-[8.5px] uppercase tracking-wider font-bold">Endereço Comprovado</span>
                            <strong className="text-slate-700 font-bold">{selectedReport.address}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8.5px] uppercase tracking-wider font-bold">Contato Direto</span>
                            <strong className="text-slate-700 font-bold">{selectedReport.contact}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                          <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                            Insumos Encontrados ({selectedReport.foundProducts.length})
                          </h4>
                          <ul className="space-y-1.5">
                            {selectedReport.foundProducts.map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                          <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                            Substitutos Recomendados ({selectedReport.recommendedProducts.length})
                          </h4>
                          <ul className="space-y-1.5">
                            {selectedReport.recommendedProducts.map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : activeReportTab === 'abordagem' ? (
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Estratégia de Abordagem</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">{selectedReport.approachStrategy}</p>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-3 shadow-3xs">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Commercial Pitch Especialista</h4>
                        <p className="text-xs text-blue-950 font-medium italic">"{selectedReport.salesPitch}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-3xs">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ações e Próximos Passos</h4>
                        <ul className="space-y-2.5">
                          {selectedReport.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs text-slate-600">
                              <span className="h-5 w-5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-black text-[9px] flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer and dynamic export */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white border border-slate-200"
                    onClick={() => {
                      // Fast simulate export from retro modal
                      const allowed = SecurityService.hasPermission('Relatórios', 'Exportar');
                      if (allowed) {
                        SecurityService.logAction({
                          module: 'Relatórios',
                          action: 'Exportar PDF',
                          result: 'Sucesso',
                          description: `Exportação do dossiê individual do cliente "${selectedReport.client}" em formato PDF.`,
                          affectedRecord: selectedReport.client
                        });
                        showNotification(`Dossiê de ${selectedReport.client} exportado com sucesso.`, 'success');
                      } else {
                        showNotification('Acesso Negado para exportação.', 'error');
                      }
                    }}
                  >
                    Exportar Dossiê
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedReport(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PageContainer>
  );
}
