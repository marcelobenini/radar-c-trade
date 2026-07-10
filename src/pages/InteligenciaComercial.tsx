/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, ProgressBar, Spinner, Toast, EmptyState } from '../components/ui/Feedback';
import ScoreIndicator from '../components/ui/Score';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Interactive';
import { syncPlatformData } from '../utils/platformSync';
import { REAL_CLIENTS, REAL_CARDAPIOS, REAL_OPPORTUNITIES, REAL_PRODUCTS } from '../data/realData';

import {
  Brain,
  Search,
  Building2,
  ChevronRight,
  Eye,
  RefreshCw,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  X,
  Check,
  Layers,
  Settings,
  Award,
  ShieldCheck,
  Save,
  Share2,
  Download,
  Database,
  ArrowLeft,
  ChevronDown,
  AlertTriangle,
  PhoneOff,
  User,
  Map,
  Sparkle,
  Network,
  Users,
  Building,
  HelpCircle,
  FileQuestion,
  BookOpen,
  Trash2
} from 'lucide-react';

// --- DATA STRUCTURES ---
interface AnalysisRecord {
  id: string;
  clientId: string;
  cliente: string;
  cardapioAnalisado: string;
  dataAnalise: string;
  origem: 'Claude' | 'Manual';
  versao: string;
  status: 'Novo' | 'Em análise' | 'Revisado' | 'Aprovado' | 'Arquivado';
  scoreComercial: number; // 0-100
  scoreFit: number;       // 0-100
  qtdProdutosEncontrados: number;
  qtdOportunidades: number;
  qtdConcorrentes: number;
  resumoExecutivo: string;
  segmento: string;
  cidade: string;
  estado: string;
  potencialComercial: 'Baixo' | 'Médio' | 'Alto' | 'Estratégico';
  produtosEncontrados: Array<{
    produto: string;
    marca: string;
    categoria: string;
    correspondencia: number;
    status: 'Utiliza Marca Premium' | 'Substituível' | 'Marca Concorrente';
  }>;
  produtosAusentes: Array<{
    produto: string;
    categoria: string;
    potencial: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
    prioridade: 'Alta' | 'Média' | 'Baixa';
  }>;
  marcasConcorrentes: Array<{
    marca: string;
    produtosEncontrados: string[];
    quantidade: number;
    potencialSubstituicao: number;
  }>;
  marcasIdentificadas: string[];
  recomendacoes: Array<{ id: string; acao: string; descricao: string; concluida: boolean }>;
  observacoes: string;
  timeline: Array<{ data: string; usuario: string; acao: string }>;
  futureIntegration: {
    source: string;
    externalId: string;
    processingStatus: string;
    receivedAt: string;
    lastAnalysis: string;
    rdStationSynced: boolean;
    syncPipelineStage: string;
  };
}

const INITIAL_ANALYSES: AnalysisRecord[] = [
    {
      id: 'an-osteria-v2',
      clientId: 'c-osteria',
      cliente: 'Osteria Bella Italia',
      cardapioAnalisado: 'cardapio_osteria_v2_completo.pdf',
      dataAnalise: '2026-07-07',
      origem: 'Claude',
      versao: 'v2',
      status: 'Aprovado',
      scoreComercial: 94,
      scoreFit: 95,
      qtdProdutosEncontrados: 6,
      qtdOportunidades: 5,
      qtdConcorrentes: 3,
      resumoExecutivo: 'A Osteria Bella Italia possui excelente alinhamento com a linha premium da CTrade. Identificamos pratos italianos clássicos que demandam insumos sofisticados, com destaque para a produção de massas e pizzas de longa fermentação que atualmente usam farinhas de trigo comuns de menor valor agregado.',
      segmento: 'Italiano Clássico',
      cidade: 'São Paulo',
      estado: 'SP',
      potencialComercial: 'Estratégico',
      produtosEncontrados: [
        { produto: 'Pizza Napoletana DOC', marca: 'Farinha Dolar (Trigo Comum)', categoria: 'Farinhas', correspondencia: 65, status: 'Marca Concorrente' },
        { produto: 'Tagliatelle al Tartufo', marca: 'Grano Duro Generoso', categoria: 'Massas', correspondencia: 72, status: 'Substituível' },
        { produto: 'Burrata ao Pesto', marca: 'Laticínios Sabor do Campo', categoria: 'Queijos', correspondencia: 85, status: 'Substituível' },
        { produto: 'Tiramisù Tradicional', marca: 'Galbani Mascarpone', categoria: 'Laticínios', correspondencia: 98, status: 'Utiliza Marca Premium' },
        { produto: 'Risoto de Funghi Porcini', marca: 'Arroz Prato Fino', categoria: 'Arroz e Cereais', correspondencia: 50, status: 'Substituível' },
        { produto: 'Azeite de Oliva de Mesa', marca: 'Andorinha Extra Virgem', categoria: 'Óleos e Azeites', correspondencia: 75, status: 'Substituível' }
      ],
      produtosAusentes: [
        { produto: 'Farinha Caputo Italiana Sacco Rosso', categoria: 'Farinhas', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Queijo Grana Padano DOP Inteiro', categoria: 'Queijos', potencial: 'Alto', prioridade: 'Média' },
        { produto: 'Azeite Extra Virgem Premium Colheita Tardia', categoria: 'Óleos e Azeites', potencial: 'Alto', prioridade: 'Média' },
        { produto: 'Arroz Carnaroli Premium CTrade', categoria: 'Arroz e Cereais', potencial: 'Médio', prioridade: 'Baixa' }
      ],
      marcasConcorrentes: [
        { marca: 'Farinha Dolar', produtosEncontrados: ['Massa de Pizza', 'Pães da Casa'], quantidade: 2, potencialSubstituicao: 95 },
        { marca: 'Andorinha', produtosEncontrados: ['Azeite de Finalização'], quantidade: 1, potencialSubstituicao: 80 },
        { marca: 'Laticínios Sabor do Campo', produtosEncontrados: ['Burrata', 'Mozzarella de Búfala'], quantidade: 2, potencialSubstituicao: 75 }
      ],
      marcasIdentificadas: ['Galbani Mascarpone', 'Farinha Dolar', 'Andorinha', 'Grano Duro Generoso', 'Laticínios Sabor do Campo', 'Arroz Prato Fino'],
      recomendacoes: [
        { id: 'rec-1', acao: 'Apresentar Linha Premium', descricao: 'Apresentar o catálogo de farinhas Caputo e agendar testes de panificação.', concluida: false },
        { id: 'rec-2', acao: 'Oferecer substituição', descricao: 'Propor substituição do tomate comercial pelo legítimo Tomate Pelado San Marzano DOP CTrade.', concluida: false },
        { id: 'rec-3', acao: 'Apresentar produto complementar', descricao: 'Sugerir o Azeite Extra Virgem Premium de Colheita Tardia para servir na mesa.', concluida: false },
        { id: 'rec-4', acao: 'Agendar visita', descricao: 'Agendar visita comercial para demonstração técnica de fermentação de 48h.', concluida: false },
        { id: 'rec-5', acao: 'Enviar catálogo', descricao: 'Enviar catálogo focado em queijos especiais (Grana Padano, Pecorino Romano).', concluida: true }
      ],
      observacoes: 'Chef Giovanni Rossi demonstrou grande preocupação com o desperdício de massas que não inflavam bem. A Farinha Caputo resolverá este problema.',
      timeline: [
        { data: '2026-07-07 10:15', usuario: 'Claude (Auto)', acao: 'Análise automática realizada do novo cardápio v2' },
        { data: '2026-07-07 10:14', usuario: 'Francisco Alencar', acao: 'Upload automático via integração do cardápio v2' },
        { data: '2026-06-15 14:30', usuario: 'Carlos Silva (Comercial)', acao: 'Status da análise v1 alterado para Revisado' }
      ],
      futureIntegration: {
        source: 'Biblioteca de Cardápios (Ingestão Automática)',
        externalId: 'ext-ost-9921',
        processingStatus: 'COMPLETED',
        receivedAt: '2026-07-07T10:12:35Z',
        lastAnalysis: '2026-07-07T10:15:20Z',
        rdStationSynced: true,
        syncPipelineStage: 'Oportunidade - Envio de Amostra'
      }
    },
    {
      id: 'an-osteria-v1',
      clientId: 'c-osteria',
      cliente: 'Osteria Bella Italia',
      cardapioAnalisado: 'cardapio_osteria_v1_antigo.pdf',
      dataAnalise: '2026-06-15',
      origem: 'Manual',
      versao: 'v1',
      status: 'Revisado',
      scoreComercial: 85,
      scoreFit: 89,
      qtdProdutosEncontrados: 4,
      qtdOportunidades: 6,
      qtdConcorrentes: 2,
      resumoExecutivo: 'A análise preliminar do cardápio v1 da Osteria revelou dependência inicial de insumos nacionais básicos de mercearia e laticínios comuns, indicando alta margem para upgrades premium.',
      segmento: 'Italiano Clássico',
      cidade: 'São Paulo',
      estado: 'SP',
      potencialComercial: 'Alto',
      produtosEncontrados: [
        { produto: 'Pizza Margherita', marca: 'Farinha Dolar (Trigo Comum)', categoria: 'Farinhas', correspondencia: 65, status: 'Marca Concorrente' },
        { produto: 'Gnocchi Tradicional', marca: 'Grano Duro Generoso', categoria: 'Massas', correspondencia: 72, status: 'Substituível' },
        { produto: 'Burrata Clássica', marca: 'Laticínios Sabor do Campo', categoria: 'Queijos', correspondencia: 85, status: 'Substituível' },
        { produto: 'Azeite de Oliva', marca: 'Andorinha Extra Virgem', categoria: 'Óleos e Azeites', correspondencia: 75, status: 'Substituível' }
      ],
      produtosAusentes: [
        { produto: 'Farinha Caputo Italiana Sacco Rosso', categoria: 'Farinhas', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Muito Alto', prioridade: 'Alta' }
      ],
      marcasConcorrentes: [
        { marca: 'Farinha Dolar', produtosEncontrados: ['Massa de Pizza'], quantidade: 1, potencialSubstituicao: 90 },
        { marca: 'Andorinha', produtosEncontrados: ['Azeite de Oliva'], quantidade: 1, potencialSubstituicao: 80 }
      ],
      marcasIdentificadas: ['Farinha Dolar', 'Andorinha', 'Grano Duro Generoso', 'Laticínios Sabor do Campo'],
      recomendacoes: [
        { id: 'rec-v1-1', acao: 'Enviar catálogo', descricao: 'Enviar catálogo de massas secas importadas de grano duro.', concluida: true }
      ],
      observacoes: 'Proprietário planeja expandir o cardápio adicionando massas frescas trufadas e pizzas napolitanas autênticas certificadas.',
      timeline: [
        { data: '2026-06-15 11:20', usuario: 'Carlos Silva (Comercial)', acao: 'Upload manual e análise inicial do cardápio v1 concluída' }
      ],
      futureIntegration: {
        source: 'Upload Manual',
        externalId: 'man-ost-1102',
        processingStatus: 'COMPLETED',
        receivedAt: '2026-06-15T11:15:00Z',
        lastAnalysis: '2026-06-15T11:20:00Z',
        rdStationSynced: false,
        syncPipelineStage: 'Sem Sincronização'
      }
    },
    {
      id: 'an-bellanapoli-v1',
      clientId: 'c-bellanapoli',
      cliente: 'Pizzaria Bella Napoli',
      cardapioAnalisado: 'cardapio_bellanapoli.docx',
      dataAnalise: '2026-07-02',
      origem: 'Manual',
      versao: 'v1',
      status: 'Novo',
      scoreComercial: 82,
      scoreFit: 84,
      qtdProdutosEncontrados: 4,
      qtdOportunidades: 3,
      qtdConcorrentes: 2,
      resumoExecutivo: 'A Pizzaria Bella Napoli é uma tradicional pizzaria napolitana de delivery. Eles usam mozzarella de boa qualidade nacional, mas a farinha utilizada limita a digestibilidade das bordas.',
      segmento: 'Pizzaria',
      cidade: 'Campinas',
      estado: 'SP',
      potencialComercial: 'Alto',
      produtosEncontrados: [
        { produto: 'Pizza Margherita Verace', marca: 'Farinha Renata Tipo 1', categoria: 'Farinhas', correspondencia: 45, status: 'Marca Concorrente' },
        { produto: 'Pizza Calabresa Gourmet', marca: 'Laticínios Crioulo Mozzarella', categoria: 'Queijos', correspondencia: 60, status: 'Marca Concorrente' },
        { produto: 'Pizza de Funghi Premium', marca: 'Azeite Gallo Extra Virgem', categoria: 'Óleos e Azeites', correspondencia: 70, status: 'Substituível' },
        { produto: 'Crostini de Entrada', marca: 'Sêmola Comum de Trigo', categoria: 'Farinhas', correspondencia: 55, status: 'Substituível' }
      ],
      produtosAusentes: [
        { produto: 'Farinha Caputo Italiana Pizzeria (Tipo 00)', categoria: 'Farinhas', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Queijo Mozzarella Fior di Latte Premium', categoria: 'Queijos', potencial: 'Muito Alto', prioridade: 'Alta' },
        { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Alto', prioridade: 'Média' }
      ],
      marcasConcorrentes: [
        { marca: 'Farinha Renata', produtosEncontrados: ['Massa de Pizza'], quantidade: 1, potencialSubstituicao: 95 },
        { marca: 'Crioulo', produtosEncontrados: ['Queijo Mozzarella'], quantidade: 1, potencialSubstituicao: 85 }
      ],
      marcasIdentificadas: ['Farinha Renata', 'Crioulo', 'Gallo'],
      recomendacoes: [
        { id: 'rec-bn-1', acao: 'Oferecer substituição', descricao: 'Demonstrar Farinha Caputo Pizzeria comparando com a Farinha Renata.', concluida: false },
        { id: 'rec-bn-2', acao: 'Enviar catálogo', descricao: 'Enviar portfólio de laticínios premium especiais para pizza.', concluida: false }
      ],
      observacoes: 'Dono super focado em custo de saco, mas está perdendo clientes do delivery premium para concorrentes locais que usam farinha importada.',
      timeline: [
        { data: '2026-07-02 16:10', usuario: 'Pedro Costa (Comercial)', acao: 'Criação manual da análise para Pizzaria Bella Napoli v1' }
      ],
      futureIntegration: {
        source: 'Upload Manual',
        externalId: 'man-bn-4819',
        processingStatus: 'COMPLETED',
        receivedAt: '2026-07-02T16:00:00Z',
        lastAnalysis: '2026-07-02T16:10:00Z',
        rdStationSynced: false,
        syncPipelineStage: 'Sem Sincronização'
      }
    },
    {
      id: 'an-bentosushi-v1',
      clientId: 'c-bentosushi',
      cliente: 'Bento Sushi Lounge',
      cardapioAnalisado: 'menu_sushi_digital_v1.pdf',
      dataAnalise: '2026-07-05',
      origem: 'Claude',
      versao: 'v1',
      status: 'Em análise',
      scoreComercial: 58,
      scoreFit: 62,
      qtdProdutosEncontrados: 2,
      qtdOportunidades: 4,
      qtdConcorrentes: 1,
      resumoExecutivo: 'O Bento Sushi Lounge possui baixa aderência ao portfólio de farinhas e laticínios da CTrade por se tratar de culinária japonesa. Há oportunidade para azeites finos gourmet trufados e arroz especial para sushi.',
      segmento: 'Japonês',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      potencialComercial: 'Médio',
      produtosEncontrados: [
        { produto: 'Carpaccio de Salmão Trufado', marca: 'Azeite Trufado Tartufi', categoria: 'Óleos e Azeites', correspondencia: 90, status: 'Utiliza Marca Premium' },
        { produto: 'Shari (Arroz de Sushi)', marca: 'Arroz Shirozawa Comum', categoria: 'Arroz e Cereais', correspondencia: 60, status: 'Substituível' }
      ],
      produtosAusentes: [
        { produto: 'Azeite Extra Virgem Premium Colheita Tardia', categoria: 'Óleos e Azeites', potencial: 'Médio', prioridade: 'Média' },
        { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Baixo', prioridade: 'Baixa' }
      ],
      marcasConcorrentes: [
        { marca: 'Shirozawa', produtosEncontrados: ['Arroz para Sushi'], quantidade: 1, potencialSubstituicao: 60 }
      ],
      marcasIdentificadas: ['Tartufi', 'Shirozawa'],
      recomendacoes: [
        { id: 'rec-bs-1', acao: 'Apresentar produto complementar', descricao: 'Apresentar o Azeite Premium de Colheita Tardia para infusões de carpaccio.', concluida: false }
      ],
      observacoes: 'Segmento oriental focado em peixes frescos, mas o volume de consumo de azeite trufado gourmet é interessante.',
      timeline: [
        { data: '2026-07-05 09:40', usuario: 'Claude (Auto)', acao: 'Análise automática realizada do menu digital enviado por e-mail' }
      ],
      futureIntegration: {
        source: 'Biblioteca de Cardápios (Ingestão Automática)',
        externalId: 'ext-bs-2294',
        processingStatus: 'COMPLETED',
        receivedAt: '2026-07-05T09:35:00Z',
        lastAnalysis: '2026-07-05T09:40:00Z',
        rdStationSynced: true,
        syncPipelineStage: 'Prospecção Inicial'
      }
    },
    {
      id: 'an-burgercraft-v1',
      clientId: 'c-burgercraft',
      cliente: 'Gourmet Burger Craft',
      cardapioAnalisado: 'cardapio_burgers_2026.png',
      dataAnalise: '2026-06-20',
      origem: 'Manual',
      versao: 'v1',
      status: 'Revisado',
      scoreComercial: 74,
      scoreFit: 78,
      qtdProdutosEncontrados: 5,
      qtdOportunidades: 3,
      qtdConcorrentes: 2,
      resumoExecutivo: 'O Gourmet Burger Craft apresenta boa aderência para molhos especiais de tomate (base de ketchup artesanal) e queijos de alta fusão calórica para smash burgers.',
      segmento: 'Hambúrguer',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      potencialComercial: 'Alto',
      produtosEncontrados: [
        { produto: 'Burger Bacon Cheddar', marca: 'Cheddar Scala Fatiado', categoria: 'Queijos', correspondencia: 82, status: 'Utiliza Marca Premium' },
        { produto: 'Molho Barbecue Artesanal', marca: 'Ketchup Heinz Galão', categoria: 'Molhos', correspondencia: 90, status: 'Utiliza Marca Premium' },
        { produto: 'Fritas com Maionese Trufada', marca: 'Maionese Hellmanns Balde', categoria: 'Molhos', correspondencia: 88, status: 'Utiliza Marca Premium' },
        { produto: 'Pão de Brioche Grelhado', marca: 'Manteiga Itambé Profissional', categoria: 'Laticínios', correspondencia: 78, status: 'Substituível' },
        { produto: 'Geleia de Bacon', marca: 'Açúcar União Sachê', categoria: 'Mercearia', correspondencia: 95, status: 'Utiliza Marca Premium' }
      ],
      produtosAusentes: [
        { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Alto', prioridade: 'Alta' },
        { produto: 'Queijo Mozzarella Fior di Latte Premium', categoria: 'Queijos', potencial: 'Médio', prioridade: 'Média' }
      ],
      marcasConcorrentes: [
        { marca: 'Itambé', produtosEncontrados: ['Manteiga de Chapa'], quantidade: 1, potencialSubstituicao: 60 }
      ],
      marcasIdentificadas: ['Scala', 'Heinz', 'Hellmanns', 'Itambé', 'União'],
      recomendacoes: [
        { id: 'rec-gb-1', acao: 'Apresentar Linha Premium', descricao: 'Apresentar o Tomate Pelado San Marzano para a fabricação do barbecue e ketchup da casa.', concluida: false },
        { id: 'rec-gb-2', acao: 'Enviar catálogo', descricao: 'Enviar portfólio de molhos gourmet e condimentos CTrade.', concluida: true }
      ],
      observacoes: 'Hamburgueria premium consolidada de Belo Horizonte. Ótimo ticket médio.',
      timeline: [
        { data: '2026-06-20 15:30', usuario: 'Mariana Lima (Comercial)', acao: 'Upload manual e análise inicial efetuados' }
      ],
      futureIntegration: {
        source: 'Upload Manual',
        externalId: 'man-gb-7012',
        processingStatus: 'COMPLETED',
        receivedAt: '2026-06-20T15:20:00Z',
        lastAnalysis: '2026-06-20T15:30:00Z',
        rdStationSynced: false,
        syncPipelineStage: 'Sem Sincronização'
      }
    }
  ];

export default function InteligenciaComercial() {
  const [subTab, setSubTab] = useState<'painel' | 'motor'>('painel');

  // Persistent storage and cross-tab synchronization
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => {
    const saved = localStorage.getItem('ctrade_analyses_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ANALYSES;
  });

  // Load clients list with fallback
  const [clients, setClients] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return REAL_CLIENTS.map((c) => ({
      ...c,
      status: c.status === 'Novo' || c.status === 'Em análise' ? 'Entradas' : c.status === 'Inativo' ? 'Rejeitados' : 'Autorizados',
      responsibleCommercial: 'RCA Marcelo Baquero',
      dateCreated: '2026-01-15 08:30',
      dateUpdated: '2026-07-01 14:20'
    }));
  });

  // Load menus list with fallback
  const [menus, setMenus] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_menu_library');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return REAL_CARDAPIOS.map(rc => {
      let mappedStatus: 'Entradas' | 'Autorizados' | 'Rejeitados' = 'Entradas';
      if (rc.status === 'Novo' || rc.status === 'Em análise') {
        mappedStatus = 'Entradas';
      } else if (rc.status === 'Revisado' || rc.status === 'Aprovado') {
        mappedStatus = 'Autorizados';
      } else {
        mappedStatus = 'Rejeitados';
      }
      return {
        ...rc,
        status: mappedStatus,
        produtosIdentificados: [
          { id: 'id-b1', nomeNoCardapio: 'Crochetta di Salsiccia', productId: 'prod-valdigrano-1109', productName: 'Spaghetti', brand: 'Valdigrano', category: 'Massas Tradicionais', notInCatalog: false, status: 'Homologado' },
          { id: 'id-b2', nomeNoCardapio: 'Parmigiana di Melanzane', productId: 'prod-latteria-sorrentina-106', productName: 'Fiordilatte Bola', brand: 'Latteria Sorrentina', category: 'Fiordilatte', notInCatalog: false, status: 'Homologado' },
          { id: 'id-b3', nomeNoCardapio: 'Fettuccine ai Funghi', notInCatalog: true, brand: 'Concorrente Massas', category: 'Massas Tradicionais', status: 'Pendente' }
        ]
      };
    });
  });

  // Load opportunities with fallback
  const [opportunities, setOpportunities] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_opportunities_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return REAL_OPPORTUNITIES;
  });

  // Load rejected records with fallback
  const [rejectedRecords, setRejectedRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_rejected_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ctrade_analyses_data', JSON.stringify(analyses));
    syncPlatformData();
  }, [analyses]);

  useEffect(() => {
    const handleGlobalStorageChange = () => {
      const savedClients = localStorage.getItem('ctrade_clients_list_v2');
      if (savedClients) {
        try { setClients(JSON.parse(savedClients)); } catch (e) { console.error(e); }
      }
      const savedMenus = localStorage.getItem('ctrade_menu_library');
      if (savedMenus) {
        try { setMenus(JSON.parse(savedMenus)); } catch (e) { console.error(e); }
      }
      const savedOpps = localStorage.getItem('ctrade_opportunities_data');
      if (savedOpps) {
        try { setOpportunities(JSON.parse(savedOpps)); } catch (e) { console.error(e); }
      }
      const savedRejected = localStorage.getItem('ctrade_rejected_records');
      if (savedRejected) {
        try { setRejectedRecords(JSON.parse(savedRejected)); } catch (e) { console.error(e); }
      }
      const savedAnalyses = localStorage.getItem('ctrade_analyses_data');
      if (savedAnalyses) {
        try { setAnalyses(JSON.parse(savedAnalyses)); } catch (e) { console.error(e); }
      }
    };
    window.addEventListener('storage', handleGlobalStorageChange);
    window.addEventListener('focus', handleGlobalStorageChange);
    return () => {
      window.removeEventListener('storage', handleGlobalStorageChange);
      window.removeEventListener('focus', handleGlobalStorageChange);
    };
  }, []);

  // --- FILTERS & SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSegment, setFilterSegment] = useState('All');
  const [filterCidade, setFilterCidade] = useState('All');
  const [filterEstado, setFilterEstado] = useState('All');
  const [filterScore, setFilterScore] = useState('All');
  const [filterCategoria, setFilterCategoria] = useState('All');
  const [filterMarca, setFilterMarca] = useState('All');
  const [filterOrigem, setFilterOrigem] = useState('All');

  const handleClearLocalFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterSegment('All');
    setFilterCidade('All');
    setFilterEstado('All');
    setFilterScore('All');
    setFilterCategoria('All');
    setFilterMarca('All');
    setFilterOrigem('All');
  };

  // --- UI CONTROLLERS ---
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'encontrados' | 'ausentes' | 'concorrentes' | 'recomendacoes' | 'comparacao' | 'future'>('resumo');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [showRunEngineModal, setShowRunEngineModal] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareOriginId, setCompareOriginId] = useState('');
  const [compareDestId, setCompareDestId] = useState('');

  // --- RUN ENGINE MODAL STATES ---
  const [engineClientName, setEngineClientName] = useState('');
  const [engineSegment, setEngineSegment] = useState('Italiano Clássico');
  const [engineCidade, setEngineCidade] = useState('São Paulo');
  const [engineEstado, setEngineEstado] = useState('SP');
  const [engineCardapio, setEngineCardapio] = useState('cardapio_manual_v1.pdf');
  const [engineOrigem, setEngineOrigem] = useState<'Manual' | 'Claude'>('Manual');
  const [engineProgress, setEngineProgress] = useState(0);
  const [engineStage, setEngineStage] = useState<'idle' | 'reading' | 'mapping' | 'matching' | 'scoring' | 'done'>('idle');

  // Show dynamic toast helper
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper for cross-page navigation with state preservation
  const navigateToPage = (pageId: string, itemKey?: string, itemValue?: string) => {
    if (itemKey && itemValue) {
      localStorage.setItem(itemKey, itemValue);
    }
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: pageId }));
  };

  const isValidPhone = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      return false;
    }
    if (/^(.)\1+$/.test(digits)) {
      return false;
    }
    return true;
  };

  // Get active analysis of currently selected client
  const activeClientAnalyses = selectedClientId 
    ? analyses.filter(a => a.clientId === selectedClientId).sort((a, b) => b.versao.localeCompare(a.versao))
    : [];

  const currentAnalysis = selectedVersionId 
    ? analyses.find(a => a.id === selectedVersionId) 
    : activeClientAnalyses[0];

  // Group analyses by Client for the Main Table representation (showing the latest version)
  const clientLatestAnalyses = Object.values(
    analyses.reduce((acc, current) => {
      const existing = acc[current.clientId];
      if (!existing || current.versao.localeCompare(existing.versao) > 0) {
        acc[current.clientId] = current;
      }
      return acc;
    }, {} as Record<string, AnalysisRecord>)
  ) as AnalysisRecord[];

  // Search and Filter logic
  const filteredLatestAnalyses = clientLatestAnalyses.filter((item) => {
    // Search Term match
    const matchesSearch = 
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.segmento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produtosEncontrados.some(p => p.produto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.marcasIdentificadas.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

    // Advanced Select Filters
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSegment = filterSegment === 'All' || item.segmento === filterSegment;
    const matchesCidade = filterCidade === 'All' || item.cidade === filterCidade;
    const matchesEstado = filterEstado === 'All' || item.estado === filterEstado;
    const matchesOrigem = filterOrigem === 'All' || item.origem === filterOrigem;
    
    let matchesScore = true;
    if (filterScore !== 'All') {
      if (filterScore === 'Excelente') matchesScore = item.scoreComercial >= 86;
      else if (filterScore === 'Alto') matchesScore = item.scoreComercial >= 71 && item.scoreComercial <= 85;
      else if (filterScore === 'Médio') matchesScore = item.scoreComercial >= 51 && item.scoreComercial <= 70;
      else if (filterScore === 'Baixo') matchesScore = item.scoreComercial <= 50;
    }

    const matchesCategoria = filterCategoria === 'All' || 
      item.produtosEncontrados.some(p => p.categoria === filterCategoria) || 
      item.produtosAusentes.some(p => p.categoria === filterCategoria);

    const matchesMarca = filterMarca === 'All' || 
      item.marcasIdentificadas.some(m => m.toLowerCase().includes(filterMarca.toLowerCase()));

    return matchesSearch && matchesStatus && matchesSegment && matchesCidade && matchesEstado && matchesScore && matchesCategoria && matchesMarca && matchesOrigem;
  });

  // Calculate top visual metrics based on current filters
  const metrics = {
    totalAnalizados: analyses.length,
    totalEncontrados: analyses.reduce((acc, a) => acc + a.qtdProdutosEncontrados, 0),
    totalRecomendados: analyses.reduce((acc, a) => acc + a.produtosAusentes.length, 0),
    totalMarcasConcorrentes: analyses.reduce((acc, a) => acc + a.marcasConcorrentes.length, 0),
    scoreMedio: Math.round(analyses.reduce((acc, a) => acc + a.scoreComercial, 0) / (analyses.length || 1)),
    totalOportunidades: analyses.reduce((acc, a) => acc + a.qtdOportunidades, 0),
  };

  const filteredClients = React.useMemo(() => {
    return clients.filter(c => {
      const nameVal = c.name || '';
      const fantasyNameVal = c.fantasyName || '';
      const cityVal = c.city || '';
      const segmentVal = c.segment || '';
      const responsibleVal = c.responsible || '';

      const matchesSearch = !searchTerm.trim() || 
        nameVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fantasyNameVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cityVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segmentVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        responsibleVal.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Novo' && (c.status === 'Novo' || c.status === 'Entradas')) ||
        (filterStatus === 'Em análise' && (c.status === 'Em análise' || c.status === 'Entradas')) ||
        (filterStatus === 'Aprovado' && (c.status === 'Aprovado' || c.status === 'Autorizados' || c.status === 'Cliente')) ||
        (filterStatus === 'Revisado' && (c.status === 'Revisado' || c.status === 'Autorizados')) ||
        (filterStatus === 'Arquivado' && (c.status === 'Arquivado' || c.status === 'Rejeitados'));

      const matchesSegment = filterSegment === 'All' || c.segment === filterSegment;
      const matchesCidade = filterCidade === 'All' || c.city === filterCidade;
      const matchesEstado = filterEstado === 'All' || c.state === filterEstado;

      let matchesScore = true;
      if (filterScore !== 'All') {
        const sc = c.score || 0;
        if (filterScore === 'Excelente') matchesScore = sc >= 86;
        else if (filterScore === 'Alto') matchesScore = sc >= 71 && sc <= 85;
        else if (filterScore === 'Médio') matchesScore = sc >= 51 && sc <= 70;
        else if (filterScore === 'Baixo') matchesScore = sc <= 50;
      }

      return matchesSearch && matchesStatus && matchesSegment && matchesCidade && matchesEstado && matchesScore;
    });
  }, [clients, searchTerm, filterStatus, filterSegment, filterCidade, filterEstado, filterScore]);

  const resumoOperacional = React.useMemo(() => {
    const homologadosCount = clients.filter(c => c.status === 'Autorizados' || c.status === 'Cliente' || c.status === 'Analisado' || c.status === 'Alta prioridade').length;
    const curadoriaCount = clients.filter(c => c.status === 'Entradas' || c.status === 'Novo' || c.status === 'Em análise').length;
    const rejeitadosCount = clients.filter(c => c.status === 'Rejeitados' || c.status === 'Inativo').length + rejectedRecords.length;
    
    const cardapiosHomologados = menus.filter(m => m.status === 'Autorizados' || m.status === 'Aprovado' || m.status === 'Revisado').length;
    const cardapiosPendentes = menus.filter(m => m.status === 'Entradas' || m.status === 'Novo' || m.status === 'Em análise').length;
    
    const produtosHomologados = REAL_PRODUCTS.length;
    const produtosPendentes = menus.flatMap(m => m.produtosIdentificados || []).filter(p => p.status === 'Pendente').length;
    
    const totalOportunidades = opportunities.filter(o => o.status !== 'Descartada').length;
    
    return {
      homologadosCount,
      curadoriaCount,
      rejeitadosCount,
      cardapiosHomologados,
      cardapiosPendentes,
      produtosHomologados,
      produtosPendentes: produtosPendentes || 8,
      totalOportunidades
    };
  }, [clients, menus, opportunities, rejectedRecords]);

  const painelInsights = React.useMemo(() => {
    const topFit = [...filteredClients]
      .filter(c => (c.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    const bottomFit = [...filteredClients]
      .filter(c => (c.score || 0) > 0)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 3);

    const recentementeAtualizados = [...filteredClients]
      .sort((a, b) => {
        const dateA = a.dateUpdated || a.lastAnalysis || '';
        const dateB = b.dateUpdated || b.lastAnalysis || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 3);

    const semCardapioRecente = filteredClients
      .filter(c => {
        const clientMenus = menus.filter(m => m.nomeEstabelecimento.toLowerCase() === (c.fantasyName || '').toLowerCase() || m.nomeEstabelecimento.toLowerCase() === (c.name || '').toLowerCase());
        return clientMenus.length === 0;
      })
      .slice(0, 3);

    const comMaisCategorias = filteredClients
      .map(c => {
        const nameKey = (c.fantasyName || c.name || '').toLowerCase();
        const analysis = analyses.find(a => a.clientId === c.id.toString() || a.cliente.toLowerCase() === nameKey);
        const cats = analysis ? Array.from(new Set(analysis.produtosEncontrados.map(p => p.category))) : [];
        return { client: c, categoryCount: cats.length, categories: cats };
      })
      .filter(item => item.categoryCount > 0)
      .sort((a, b) => b.categoryCount - a.categoryCount)
      .slice(0, 3);

    const comMaisProdutosPortfolio = filteredClients
      .map(c => {
        const nameKey = (c.fantasyName || c.name || '').toLowerCase();
        const analysis = analyses.find(a => a.clientId === c.id.toString() || a.cliente.toLowerCase() === nameKey);
        const prodCount = analysis ? analysis.produtosEncontrados.length : 0;
        return { client: c, prodCount };
      })
      .filter(item => item.prodCount > 0)
      .sort((a, b) => b.prodCount - a.prodCount)
      .slice(0, 3);

    const comProdutosConcorrente = filteredClients
      .map(c => {
        const nameKey = (c.fantasyName || c.name || '').toLowerCase();
        const analysis = analyses.find(a => a.clientId === c.id.toString() || a.cliente.toLowerCase() === nameKey);
        const concCount = analysis ? analysis.marcasConcorrentes.length : 0;
        const concBrands = analysis ? analysis.marcasConcorrentes.map(m => m.marca) : [];
        return { client: c, concCount, concBrands };
      })
      .filter(item => item.concCount > 0)
      .sort((a, b) => b.concCount - a.concCount)
      .slice(0, 3);

    const topPotencial = [...filteredClients]
      .filter(c => c.potential === 'Muito Alto' || c.potential === 'Alto')
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    return {
      topFit,
      bottomFit,
      recentementeAtualizados,
      semCardapioRecente,
      comMaisCategorias,
      comMaisProdutosPortfolio,
      comProdutosConcorrente,
      topPotencial
    };
  }, [filteredClients, menus, analyses]);

  const alertasBase = React.useMemo(() => {
    const list: Array<{ id: string; tipo: string; titulo: string; descricao: string; cId?: number; mId?: string; acao: string }> = [];

    clients.forEach(c => {
      if (!isValidPhone(c.phone)) {
        list.push({
          id: `tel-${c.id}`,
          tipo: 'telefone',
          titulo: `${c.fantasyName || c.name}`,
          descricao: `Telefone inválido ou não informado: "${c.phone || 'Vazio'}"`,
          cId: c.id,
          acao: 'Editar Contato'
        });
      }
    });

    clients.forEach(c => {
      if (!c.linkedin || c.linkedin === '' || c.linkedin.includes('placeholder')) {
        list.push({
          id: `lin-${c.id}`,
          tipo: 'linkedin',
          titulo: `${c.fantasyName || c.name}`,
          descricao: `Decisor (${c.responsible || 'Sem decisor'}) sem link de LinkedIn cadastrado`,
          cId: c.id,
          acao: 'Cadastrar LinkedIn'
        });
      }
    });

    menus.forEach(m => {
      if (m.status === 'Entradas') {
        list.push({
          id: `cur-${m.id}`,
          tipo: 'curadoria',
          titulo: `${m.nomeEstabelecimento}`,
          descricao: `Cardápio "${m.fileName}" aguardando análise e curadoria técnica`,
          mId: m.id,
          acao: 'Ir para Curadoria'
        });
      }
    });

    clients.forEach(c => {
      if (!c.responsibleCommercial || c.responsibleCommercial === 'Não informado' || c.responsibleCommercial === '') {
        list.push({
          id: `resp-${c.id}`,
          tipo: 'responsavel',
          titulo: `${c.fantasyName || c.name}`,
          descricao: 'Sem responsável comercial (RCA) atribuído na carteira',
          cId: c.id,
          acao: 'Atribuir RCA'
        });
      }
    });

    clients.forEach(c => {
      if (!c.city || c.city === 'Não informada' || !c.state) {
        list.push({
          id: `loc-${c.id}`,
          tipo: 'localizacao',
          titulo: `${c.fantasyName || c.name}`,
          descricao: 'Cadastro de endereço incompleto (Cidade/Estado ausentes)',
          cId: c.id,
          acao: 'Corrigir Endereço'
        });
      }
    });

    menus.forEach((m) => {
      (m.produtosIdentificados || []).forEach((p, idx) => {
        if (p.status === 'Pendente') {
          list.push({
            id: `prod-pend-${m.id}-${p.id || idx}-${idx}`,
            tipo: 'produto_pendente',
            titulo: `Produto: ${p.nomeNoCardapio}`,
            descricao: `Ingrediente extraído em análise de curadoria técnica de cardápio do restaurante "${m.nomeEstabelecimento}"`,
            mId: m.id,
            acao: 'Homologar SKUs'
          });
        }
      });
    });

    return list;
  }, [clients, menus]);

  const destaquesCarteira = React.useMemo(() => {
    const top10Fit = [...filteredClients]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);

    const potWeight = { 'Muito Alto': 4, 'Alto': 3, 'Médio': 2, 'Baixo': 1 };
    const top10Potencial = [...filteredClients]
      .sort((a, b) => {
        const wA = potWeight[a.potential as keyof typeof potWeight] || 0;
        const wB = potWeight[b.potential as keyof typeof potWeight] || 0;
        if (wB !== wA) return wB - wA;
        return (b.score || 0) - (a.score || 0);
      })
      .slice(0, 10);

    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};

    const clientIdsFiltered = new Set(filteredClients.map(c => c.id.toString()));
    const relevantAnalyses = clientLatestAnalyses.filter(a => clientIdsFiltered.has(a.clientId));

    relevantAnalyses.forEach(an => {
      an.produtosEncontrados.forEach(p => {
        categoryCounts[p.categoria] = (categoryCounts[p.categoria] || 0) + 1;
        brandCounts[p.marca] = (brandCounts[p.marca] || 0) + 1;
        productCounts[p.produto] = (productCounts[p.produto] || 0) + 1;
      });
      an.produtosAusentes.forEach(p => {
        categoryCounts[p.categoria] = (categoryCounts[p.categoria] || 0) + 1;
        productCounts[p.produto] = (productCounts[p.produto] || 0) + 1;
      });
    });

    if (Object.keys(categoryCounts).length === 0) {
      REAL_PRODUCTS.slice(0, 8).forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + Math.floor(Math.random() * 5) + 3;
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + Math.floor(Math.random() * 4) + 2;
        productCounts[p.name] = (productCounts[p.name] || 0) + Math.floor(Math.random() * 3) + 1;
      });
    }

    const topCategorias = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topMarcas = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topProdutos = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const estadoCounts: Record<string, number> = {};
    filteredClients.forEach(c => {
      estadoCounts[c.state] = (estadoCounts[c.state] || 0) + 1;
    });
    const topEstados = Object.entries(estadoCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const cidadePotencial: Record<string, number> = {};
    filteredClients.forEach(c => {
      const weight = potWeight[c.potential as keyof typeof potWeight] || 0;
      cidadePotencial[c.city] = (cidadePotencial[c.city] || 0) + weight;
    });
    const topCidadesPotencial = Object.entries(cidadePotencial)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      top10Fit,
      top10Potencial,
      topCategorias,
      topMarcas,
      topProdutos,
      topEstados,
      topCidadesPotencial
    };
  }, [filteredClients, clientLatestAnalyses]);

  const listaPendencias = React.useMemo(() => {
    const cardapiosAguardando = menus.filter(m => m.status === 'Entradas');
    const clientesSemContato = clients.filter(c => !c.phone && !c.email);
    const produtosNaoHomologados = menus.flatMap(m => m.produtosIdentificados || []).filter(p => p.status === 'Pendente');
    const categoriasPendentes = Array.from(new Set(menus.flatMap(m => m.produtosIdentificados || []).filter(p => p.notInCatalog).map(p => p.category || 'Massas')));
    const registrosRejeitados = rejectedRecords;

    const seenNames = new Set<string>();
    const duplicateClients: any[] = [];
    clients.forEach(c => {
      const nameNorm = (c.fantasyName || c.name || '').toLowerCase();
      if (seenNames.has(nameNorm)) {
        duplicateClients.push(c);
      } else {
        seenNames.add(nameNorm);
      }
    });

    return {
      cardapiosAguardando,
      clientesSemContato,
      produtosNaoHomologados,
      categoriasPendentes,
      registrosRejeitados,
      duplicateClients
    };
  }, [clients, menus, rejectedRecords]);

  // Run intelligence simulation
  const handleRunSimulation = () => {
    if (!engineClientName.trim()) {
      showNotification('Digite o nome do estabelecimento!', 'warning');
      return;
    }

    setEngineStage('reading');
    setEngineProgress(10);

    const interval = setInterval(() => {
      setEngineProgress((prev) => {
        if (prev < 30) {
          setEngineStage('mapping');
          return prev + 10;
        } else if (prev < 60) {
          setEngineStage('matching');
          return prev + 15;
        } else if (prev < 90) {
          setEngineStage('scoring');
          return prev + 15;
        } else {
          clearInterval(interval);
          setEngineStage('done');
          return 100;
        }
      });
    }, 450);

    setTimeout(() => {
      // Find if client exists to determine version
      const existingClientAnalyses = analyses.filter(
        (a) => a.cliente.toLowerCase() === engineClientName.toLowerCase()
      );
      const isExisting = existingClientAnalyses.length > 0;
      const nextVersaoNum = isExisting ? existingClientAnalyses.length + 1 : 1;
      const nextVersao = `v${nextVersaoNum}`;
      const clientId = isExisting ? existingClientAnalyses[0].clientId : `c-${engineClientName.toLowerCase().replace(/\s+/g, '-')}`;

      // Create new independent record
      const newRecord: AnalysisRecord = {
        id: `an-${clientId}-${nextVersao}`,
        clientId: clientId,
        cliente: engineClientName,
        cardapioAnalisado: engineCardapio,
        dataAnalise: new Date().toISOString().split('T')[0],
        origem: engineOrigem,
        versao: nextVersao,
        status: 'Novo',
        scoreComercial: Math.floor(Math.random() * 25) + 70, // 70 - 95
        scoreFit: Math.floor(Math.random() * 20) + 75,       // 75 - 95
        qtdProdutosEncontrados: Math.floor(Math.random() * 4) + 3,
        qtdOportunidades: Math.floor(Math.random() * 4) + 2,
        qtdConcorrentes: Math.floor(Math.random() * 3) + 1,
        resumoExecutivo: `Análise gerada em tempo real para ${engineClientName}. O motor de inteligência identificou excelente receptividade à linha de produtos CTrade no segmento de ${engineSegment}, mapeando novas concorrências locais de mercearia e azeites comuns.`,
        segmento: engineSegment,
        cidade: engineCidade,
        estado: engineEstado,
        potencialComercial: Math.random() > 0.5 ? 'Estratégico' : 'Alto',
        produtosEncontrados: [
          { produto: 'Massa Artesanal Gourmet', marca: 'Farinha Trigo Comum', categoria: 'Farinhas', correspondencia: 60, status: 'Marca Concorrente' },
          { produto: 'Azeite Decorativo Salão', marca: 'Azeite Maria Comercial', categoria: 'Óleos e Azeites', correspondencia: 55, status: 'Substituível' },
          { produto: 'Molho de Tomate Pomodoro', marca: 'Tomate Pelado Comum', categoria: 'Molhos', correspondencia: 70, status: 'Substituível' }
        ],
        produtosAusentes: [
          { produto: 'Farinha Caputo Italiana Sacco Rosso', categoria: 'Farinhas', potencial: 'Muito Alto', prioridade: 'Alta' },
          { produto: 'Tomate Pelado San Marzano DOP CTrade', categoria: 'Molhos', potencial: 'Alto', prioridade: 'Alta' },
          { produto: 'Azeite Extra Virgem Premium Colheita Tardia', categoria: 'Óleos e Azeites', potencial: 'Alto', prioridade: 'Média' }
        ],
        marcasConcorrentes: [
          { marca: 'Azeite Maria', produtosEncontrados: ['Azeite de Finalização'], quantidade: 1, potencialSubstituicao: 80 },
          { marca: 'Tomate Pelado Comum', produtosEncontrados: ['Molho de Pizza'], quantidade: 1, potencialSubstituicao: 90 }
        ],
        marcasIdentificadas: ['Azeite Maria', 'Tomate Pelado Comum', 'Farinha Trigo Comum'],
        recomendacoes: [
          { id: 'rec-sim-1', acao: 'Apresentar Linha Premium', descricao: 'Apresentar produtos certificados DOP de imediato.', concluida: false },
          { id: 'rec-sim-2', acao: 'Enviar catálogo', descricao: 'Enviar portfólio completo por e-mail.', concluida: false }
        ],
        observacoes: 'Registro gerado automaticamente. Preparado para acompanhamento de visitas comerciais.',
        timeline: [
          { data: `${new Date().toISOString().split('T')[0]} 11:34`, usuario: 'Sistema', acao: `Nova análise versionada (${nextVersao}) criada via ${engineOrigem}` }
        ],
        futureIntegration: {
          source: engineOrigem === 'Claude' ? 'Claude Ingestão Automatizada' : 'Upload Manual',
          externalId: `ext-${Math.random().toString(36).substring(2, 8)}`,
          processingStatus: 'COMPLETED',
          receivedAt: new Date().toISOString(),
          lastAnalysis: new Date().toISOString(),
          rdStationSynced: false,
          syncPipelineStage: 'Sem Sincronização'
        }
      };

      setAnalyses((prev) => [newRecord, ...prev]);
      setShowRunEngineModal(false);
      setSelectedClientId(clientId);
      setSelectedVersionId(newRecord.id);
      setEngineStage('idle');
      setEngineProgress(0);
      setEngineClientName('');
      showNotification(`Análise ${nextVersao} gerada e versionada com sucesso!`, 'success');
    }, 2800);
  };

  // Helper for Score comercial colors and labels
  const getScoreInfo = (score: number) => {
    if (score <= 30) return { label: 'Muito Baixo', color: 'text-rose-600 bg-rose-50 border-rose-100 ring-rose-500/10' };
    if (score <= 50) return { label: 'Baixo', color: 'text-orange-600 bg-orange-50 border-orange-100 ring-orange-500/10' };
    if (score <= 70) return { label: 'Médio', color: 'text-yellow-600 bg-yellow-50 border-yellow-100 ring-yellow-500/10' };
    if (score <= 85) return { label: 'Alto', color: 'text-blue-700 bg-blue-50 border-blue-100 ring-blue-500/10' };
    return { label: 'Muito Alto', color: 'text-emerald-700 bg-emerald-50 border-emerald-100 ring-emerald-500/10' };
  };

  // Helper for Potential colors
  const getPotentialColor = (pot: string) => {
    switch (pot) {
      case 'Baixo': return 'bg-slate-50 text-slate-600 ring-slate-600/10';
      case 'Médio': return 'bg-amber-50 text-amber-700 ring-amber-600/10';
      case 'Alto': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
      case 'Estratégico': return 'bg-purple-50 text-purple-700 ring-purple-700/10';
      default: return 'bg-slate-50 text-slate-500 ring-slate-500/10';
    }
  };

  // Handle status update
  const handleUpdateStatus = (newStatus: AnalysisRecord['status']) => {
    if (!currentAnalysis) return;
    setAnalyses((prev) => prev.map(a => a.id === currentAnalysis.id ? { ...a, status: newStatus } : a));
    showNotification(`Status alterado para ${newStatus}`, 'success');
  };

  // Toggle recommendation checklist
  const handleToggleRec = (recId: string) => {
    if (!currentAnalysis) return;
    setAnalyses((prev) => prev.map(a => {
      if (a.id === currentAnalysis.id) {
        return {
          ...a,
          recomendacoes: a.recomendacoes.map(r => r.id === recId ? { ...r, concluida: !r.concluida } : r)
        };
      }
      return a;
    }));
    showNotification('Alteração persistida localmente', 'info');
  };

  // Save observations internally
  const [obsText, setObsText] = useState('');
  React.useEffect(() => {
    if (currentAnalysis) {
      setObsText(currentAnalysis.observacoes);
    }
  }, [currentAnalysis?.id]);

  const handleSaveObservations = () => {
    if (!currentAnalysis) return;
    setAnalyses((prev) => prev.map(a => a.id === currentAnalysis.id ? { ...a, observacoes: obsText } : a));
    showNotification('Observação interna atualizada!', 'success');
  };

  const breadcrumbItems: BreadcrumbItem[] = selectedClientId && currentAnalysis
    ? [
        { label: 'Motor de Inteligência', onClick: () => setSelectedClientId(null) },
        { label: currentAnalysis.cliente, active: true }
      ]
    : [
        { label: 'Motor de Inteligência', active: true }
      ];

  return (
    <PageContainer id="page-inteligencia-motor">
      <Breadcrumb items={breadcrumbItems} onHomeClick={selectedClientId ? () => setSelectedClientId(null) : undefined} />
      <div className="relative">
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        <PageHeader
          title={selectedClientId ? "Ficha do Cliente" : subTab === 'painel' ? "Inteligência Comercial" : "Motor de Cruzamento"}
          subtitle={selectedClientId ? "Detalhamento e cruzamento completo do cardápio." : subTab === 'painel' ? "Resumos de atenção da carteira, alertas de qualidade e destaques estratégicos baseados em dados homologados." : "Mapeamento e cruzamento automático de cardápios com o portfólio comercial CTrade."}
          badge={subTab === 'painel' ? "MVP Inteligência" : "Fase 14"}
        />

        {/* SubTab Navigation */}
        {!selectedClientId && (
          <div className="flex border-b border-slate-200 gap-6 mb-6">
            <button
              onClick={() => setSubTab('painel')}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                subTab === 'painel'
                  ? 'border-blue-900 text-blue-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Painel de Inteligência
            </button>
            <button
              onClick={() => setSubTab('motor')}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                subTab === 'motor'
                  ? 'border-blue-900 text-blue-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Motor de Cruzamento
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!selectedClientId ? (
            // --- VIEW 1: COCKPIT DASHBOARD (LISTA DE CLIENTES) ---
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 mt-6"
            >
              {/* Filtros e Pesquisa */}
              <Card className="p-5">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <Input
                      type="text"
                      id="search-motor-comercial"
                      placeholder="Pesquisar por Cliente, Cidade, Categoria, Produto, Marca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Brain className="h-4 w-4" />}
                      onClick={() => setShowRunEngineModal(true)}
                    >
                      Rodar Motor de Inteligência
                    </Button>
                  </div>
                </div>

                {/* Filtros rápidos bento */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-[11px]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todos</option>
                      <option value="Novo">Novo</option>
                      <option value="Em análise">Em análise</option>
                      <option value="Revisado">Revisado</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Arquivado">Arquivado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Segmento</label>
                    <select
                      value={filterSegment}
                      onChange={(e) => setFilterSegment(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todos</option>
                      <option value="Italiano Clássico">Italiano</option>
                      <option value="Pizzaria">Pizzaria</option>
                      <option value="Japonês">Japonês</option>
                      <option value="Hambúrguer">Hambúrguer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Cidade</label>
                    <select
                      value={filterCidade}
                      onChange={(e) => setFilterCidade(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todas</option>
                      <option value="São Paulo">São Paulo</option>
                      <option value="Campinas">Campinas</option>
                      <option value="Rio de Janeiro">Rio de Janeiro</option>
                      <option value="Belo Horizonte">Belo Horizonte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Estado</label>
                    <select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todos</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Score</label>
                    <select
                      value={filterScore}
                      onChange={(e) => setFilterScore(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todos</option>
                      <option value="Excelente">Excelente (&gt;85)</option>
                      <option value="Alto">Alto (71-85)</option>
                      <option value="Médio">Médio (51-70)</option>
                      <option value="Baixo">Baixo (&lt;=50)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Categoria</label>
                    <select
                      value={filterCategoria}
                      onChange={(e) => setFilterCategoria(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todas</option>
                      <option value="Farinhas">Farinhas</option>
                      <option value="Queijos">Queijos</option>
                      <option value="Molhos">Molhos</option>
                      <option value="Óleos e Azeites">Azeites</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Marca</label>
                    <select
                      value={filterMarca}
                      onChange={(e) => setFilterMarca(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todas</option>
                      <option value="Dolar">Farinha Dolar</option>
                      <option value="Andorinha">Andorinha</option>
                      <option value="Heinz">Heinz</option>
                      <option value="Crioulo">Crioulo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Origem</label>
                    <select
                      value={filterOrigem}
                      onChange={(e) => setFilterOrigem(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 bg-white text-xs"
                    >
                      <option value="All">Todas</option>
                      <option value="Claude">Claude (Auto)</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>
              </Card>

              {subTab === 'painel' ? (
                <>
                  {/* RESUMO OPERACIONAL */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-fadeIn" id="resumo-operacional-grid">
                    <button 
                      onClick={() => navigateToPage('clientes')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Clientes Homologados</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.homologadosCount}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('clientes')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Clientes em Curadoria</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.curadoriaCount}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('clientes')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Clientes Rejeitados</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.rejeitadosCount}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('biblioteca')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Cardápios Homologados</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.cardapiosHomologados}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('biblioteca')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Cardápios Pendentes</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.cardapiosPendentes}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('produtos')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Produtos Ativos</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.produtosHomologados}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('produtos')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">SKUs Pendentes</span>
                      <span className="text-lg font-black text-slate-800 mt-1">{resumoOperacional.produtosPendentes}</span>
                    </button>
                    <button 
                      onClick={() => navigateToPage('oportunidades')}
                      className="bg-white hover:bg-slate-50 transition-all p-3 rounded-lg border border-slate-200 text-left flex flex-col justify-between shadow-sm hover:shadow group"
                    >
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600">Oportunidades</span>
                      <span className="text-lg font-black text-slate-800 mt-1 text-blue-900 font-extrabold">{resumoOperacional.totalOportunidades}</span>
                    </button>
                  </div>

                  {/* BENTO GRID: INSIGHTS & ALERTAS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {/* INSIGHTS PANEL (Spans 2 columns) */}
                    <div className="lg:col-span-2">
                      <Card className="p-6">
                        <div className="border-b border-slate-100 pb-4 mb-5 flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <Sparkles className="h-4.5 w-4.5 text-blue-900" />
                            Painel de Insights Comerciais ({filteredClients.length} Filtrados)
                          </h3>
                          <span className="text-[10px] text-slate-400">Origens identificáveis na plataforma</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Card 1: Top Fit */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Award className="h-3.5 w-3.5 text-emerald-600" />
                              Top Fit Comercial
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.topFit.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum registro correspondente.</p>
                              ) : (
                                painelInsights.topFit.map((c) => (
                                  <div key={c.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[140px]">
                                      <p className="font-bold text-slate-800 truncate">{c.fantasyName || c.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{c.city} • {c.segment}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100">{c.score}% Fit</span>
                                      <button onClick={() => navigateToPage('clientes', 'ctrade_selected_client_id', c.id.toString())} className="text-slate-400 hover:text-slate-800">
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 2: Menores Fit */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                              Menor Fit Comercial
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.bottomFit.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum registro correspondente.</p>
                              ) : (
                                painelInsights.bottomFit.map((c) => (
                                  <div key={c.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[140px]">
                                      <p className="font-bold text-slate-800 truncate">{c.fantasyName || c.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{c.city} • {c.segment}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-extrabold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] border border-rose-100">{c.score}% Fit</span>
                                      <button onClick={() => navigateToPage('clientes', 'ctrade_selected_client_id', c.id.toString())} className="text-slate-400 hover:text-slate-800">
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 3: Recentemente Atualizados */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-600" />
                              Atualizações Recentes
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.recentementeAtualizados.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum registro correspondente.</p>
                              ) : (
                                painelInsights.recentementeAtualizados.map((c) => (
                                  <div key={c.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[150px]">
                                      <p className="font-bold text-slate-800 truncate">{c.fantasyName || c.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">Modificado: {c.dateUpdated || c.lastAnalysis || '2026-07-01'}</p>
                                    </div>
                                    <button onClick={() => navigateToPage('clientes', 'ctrade_selected_client_id', c.id.toString())} className="text-slate-400 hover:text-slate-800 flex-shrink-0">
                                      <ChevronRight className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 4: Sem Cardápio */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <FileQuestion className="h-3.5 w-3.5 text-amber-500" />
                              Sem Cardápio Recente
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.semCardapioRecente.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Todos possuem cardápio homologado.</p>
                              ) : (
                                painelInsights.semCardapioRecente.map((c) => (
                                  <div key={c.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[150px]">
                                      <p className="font-bold text-slate-800 truncate">{c.fantasyName || c.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{c.city} • Pendente envio</p>
                                    </div>
                                    <button onClick={() => navigateToPage('biblioteca')} className="text-slate-400 hover:text-slate-800 flex-shrink-0">
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 5: Mix de Categorias */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-indigo-600" />
                              Maior Mix de Categorias
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.comMaisCategorias.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum registro correspondente.</p>
                              ) : (
                                painelInsights.comMaisCategorias.map((item) => (
                                  <div key={item.client.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[140px]">
                                      <p className="font-bold text-slate-800 truncate">{item.client.fantasyName || item.client.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">Categorias: {item.categories.slice(0, 2).join(', ')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">{item.categoryCount} cats</span>
                                      <button onClick={() => navigateToPage('clientes', 'ctrade_selected_client_id', item.client.id.toString())} className="text-slate-400 hover:text-slate-800">
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 6: Portfólio CTrade */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-900" />
                              Maior Uso de Portfólio
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.comMaisProdutosPortfolio.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum registro correspondente.</p>
                              ) : (
                                painelInsights.comMaisProdutosPortfolio.map((item) => (
                                  <div key={item.client.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[140px]">
                                      <p className="font-bold text-slate-800 truncate">{item.client.fantasyName || item.client.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{item.client.city} • {item.client.segment}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">{item.prodCount} SKUs</span>
                                      <button onClick={() => navigateToPage('clientes', 'ctrade_selected_client_id', item.client.id.toString())} className="text-slate-400 hover:text-slate-800">
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 7: Concorrentes */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Network className="h-3.5 w-3.5 text-rose-500" />
                              Uso de Marcas Concorrentes
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.comProdutosConcorrente.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum concorrente identificado.</p>
                              ) : (
                                painelInsights.comProdutosConcorrente.map((item) => (
                                  <div key={item.client.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[140px]">
                                      <p className="font-bold text-slate-800 truncate">{item.client.fantasyName || item.client.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">Marcas: {item.concBrands.slice(0, 2).join(', ')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">{item.concCount} Marcas</span>
                                      <button onClick={() => navigateToPage('oportunidades')} className="text-slate-400 hover:text-slate-800">
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Card 8: Estratégicos */}
                          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Sparkle className="h-3.5 w-3.5 text-purple-600" />
                              Estratégicos por Potencial
                            </h4>
                            <div className="space-y-2">
                              {painelInsights.topPotencial.length === 0 ? (
                                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum registro correspondente.</p>
                              ) : (
                                painelInsights.topPotencial.map((c) => (
                                  <div key={c.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                                    <div className="truncate max-w-[150px]">
                                      <p className="font-bold text-slate-800 truncate">{c.fantasyName || c.name}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{c.city} • Potencial: {c.potential}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">Alto</span>
                                      <button onClick={() => navigateToPage('oportunidades')} className="text-slate-400 hover:text-slate-800">
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* ALERTAS DE QUALIDADE DA BASE */}
                    <div>
                      <Card className="p-6 h-full flex flex-col justify-between">
                        <div>
                          <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                              <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                              Alertas de Qualidade da Base ({alertasBase.length})
                            </h3>
                          </div>

                          <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                            {alertasBase.length === 0 ? (
                              <div className="text-center text-slate-400 py-12">
                                <p className="text-xs font-bold">Excelente!</p>
                                <p className="text-[10px]">Nenhum problema de dados.</p>
                              </div>
                            ) : (
                              alertasBase.slice(0, 8).map((alert) => (
                                <div key={alert.id} className="border border-slate-150 rounded-lg p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-start text-xs shadow-sm">
                                  <div className="space-y-1 truncate max-w-[170px]">
                                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                      alert.tipo === 'telefone' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                      alert.tipo === 'linkedin' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                      alert.tipo === 'curadoria' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                      alert.tipo === 'responsavel' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                      'bg-slate-50 text-slate-600 border border-slate-100'
                                    }`}>
                                      {alert.tipo === 'telefone' && 'Contato'}
                                      {alert.tipo === 'linkedin' && 'LinkedIn'}
                                      {alert.tipo === 'curadoria' && 'Curadoria'}
                                      {alert.tipo === 'responsavel' && 'RCA'}
                                      {alert.tipo === 'localizacao' && 'Localização'}
                                      {alert.tipo === 'produto_pendente' && 'Produto'}
                                    </span>
                                    <p className="font-bold text-slate-800 truncate">{alert.titulo}</p>
                                    <p className="text-[10px] text-slate-500 leading-normal truncate">{alert.descricao}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (alert.cId) {
                                        navigateToPage('clientes', 'ctrade_selected_client_id', alert.cId.toString());
                                      } else if (alert.mId) {
                                        navigateToPage('biblioteca', 'ctrade_selected_menu_id', alert.mId);
                                      } else {
                                        navigateToPage('biblioteca');
                                      }
                                    }}
                                    className="text-[9px] font-black text-blue-900 border border-blue-900 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ml-2 mt-0.5"
                                  >
                                    Corrigir
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        {alertasBase.length > 8 && (
                          <div className="text-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                            E mais {alertasBase.length - 8} pendências de dados...
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>

                  {/* DESTAQUES DA CARTEIRA */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="destaque-carteira-grid">
                    {/* TOP 10 CLIENTES POR FIT */}
                    <Card className="p-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                        <Award className="h-4.5 w-4.5 text-emerald-600" />
                        Top 10 Clientes por Fit
                      </h3>
                      <div className="space-y-3">
                        {destaquesCarteira.top10Fit.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center py-6">Nenhum registro correspondente.</p>
                        ) : (
                          destaquesCarteira.top10Fit.map((c, index) => (
                            <div key={c.id} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700 truncate max-w-[180px]">{index + 1}. {c.fantasyName || c.name}</span>
                                <span className="font-mono text-[10px] font-bold text-slate-500">{c.score || 0}% Fit</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${c.score || 0}%` }} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>

                    {/* TOP 10 CLIENTES POR POTENCIAL */}
                    <Card className="p-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-purple-600" />
                        Top 10 Clientes por Potencial
                      </h3>
                      <div className="space-y-2">
                        {destaquesCarteira.top10Potencial.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center py-6">Nenhum registro correspondente.</p>
                        ) : (
                          destaquesCarteira.top10Potencial.map((c, index) => (
                            <div key={c.id} className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                              <span className="font-bold text-slate-700 truncate max-w-[160px]">{index + 1}. {c.fantasyName || c.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] px-1 py-0.2 rounded border ${getPotentialColor(c.potential || 'Médio')}`}>
                                  {c.potential || 'Médio'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">{c.score || 0}%</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>

                    {/* DISTRIBUIÇÃO CATEGORIAS / PRODUTOS / ESTADOS */}
                    <Card className="p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4.5 w-4.5 text-blue-900" />
                          Destaques do Portfólio & Estados
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-wider">Categorias em Destaque</span>
                            <div className="flex flex-wrap gap-1.5">
                              {destaquesCarteira.topCategorias.map((cat, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-800 border border-blue-100 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                  {cat.name}
                                  <span className="bg-blue-100 text-blue-900 text-[9px] px-1 rounded-full font-black">{cat.count}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-wider">Produtos Mais Identificados</span>
                            <div className="space-y-2">
                              {destaquesCarteira.topProdutos.slice(0, 3).map((prod, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="text-slate-600 truncate">{prod.name}</span>
                                  <span className="font-bold text-slate-700 bg-slate-100 px-1.5 rounded text-[10px]">{prod.count} cardápios</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-wider">Concentração Geográfica (Estados)</span>
                            <div className="space-y-2">
                              {destaquesCarteira.topEstados.map((st, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-slate-600">{st.name}</span>
                                    <span className="font-mono text-slate-500">{st.count} clientes</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1 rounded-full">
                                    <div className="bg-blue-900 h-full rounded-full" style={{ width: `${(st.count / (filteredClients.length || 1)) * 100}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* FILA OPERACIONAL DE PENDÊNCIAS */}
                  <Card className="p-6 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-4 mb-5">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 text-blue-900" />
                        Fila Operacional de Curadoria (Pendências de Sistema)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Identificação proativa de inconsistências e registros que exigem revisão humana na plataforma.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Bloco 1: Cardápios aguardando análise */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cardápios Pendentes</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                            {listaPendencias.cardapiosAguardando.length}
                          </span>
                        </div>
                        <div className="space-y-2 min-h-[140px] max-h-[180px] overflow-y-auto pr-1">
                          {listaPendencias.cardapiosAguardando.length === 0 ? (
                            <p className="text-[10px] text-slate-400 py-6 text-center">Fila zerada. Todos os cardápios analisados.</p>
                          ) : (
                            listaPendencias.cardapiosAguardando.map((m) => (
                              <div key={m.id} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center text-xs">
                                <div className="truncate max-w-[130px]">
                                  <p className="font-bold text-slate-700 truncate">{m.nomeEstabelecimento}</p>
                                  <p className="text-[9px] text-slate-400 truncate">{m.fileName}</p>
                                </div>
                                <button onClick={() => navigateToPage('biblioteca', 'ctrade_selected_menu_id', m.id)} className="text-[9px] font-bold text-blue-900 hover:underline">
                                  Analisar
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Bloco 2: Clientes sem contato */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Contatos Ausentes</span>
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                            {listaPendencias.clientesSemContato.length}
                          </span>
                        </div>
                        <div className="space-y-2 min-h-[140px] max-h-[180px] overflow-y-auto pr-1">
                          {listaPendencias.clientesSemContato.length === 0 ? (
                            <p className="text-[10px] text-slate-400 py-6 text-center">Nenhum cliente sem contato cadastrado.</p>
                          ) : (
                            listaPendencias.clientesSemContato.slice(0, 8).map((c) => (
                              <div key={c.id} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700 truncate max-w-[140px]">{c.fantasyName || c.name}</span>
                                <button onClick={() => navigateToPage('clientes', 'ctrade_selected_client_id', c.id.toString())} className="text-[9px] font-bold text-blue-900 hover:underline">
                                  Preencher
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Bloco 3: Clientes duplicados */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Registros Duplicados</span>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                            {listaPendencias.duplicateClients.length}
                          </span>
                        </div>
                        <div className="space-y-2 min-h-[140px] max-h-[180px] overflow-y-auto pr-1">
                          {listaPendencias.duplicateClients.length === 0 ? (
                            <p className="text-[10px] text-slate-400 py-6 text-center">Nenhum registro duplicado identificado.</p>
                          ) : (
                            listaPendencias.duplicateClients.map((c, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center text-xs">
                                <div className="truncate max-w-[140px]">
                                  <p className="font-bold text-slate-700 truncate">{c.fantasyName || c.name}</p>
                                  <p className="text-[9px] text-slate-400 truncate">{c.city} - {c.state}</p>
                                </div>
                                <button onClick={() => navigateToPage('clientes')} className="text-[9px] font-bold text-blue-900 hover:underline">
                                  Rever
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  {/* KPIs Superior */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 animate-fadeIn" id="kpi-motor-grid">
                    <MetricCard
                      title="Cardápios Analisados"
                      value={metrics.totalAnalizados.toString()}
                      icon={<FileText className="h-4.5 w-4.5 text-blue-900" />}
                    />
                    <MetricCard
                      title="Produtos Encontrados"
                      value={metrics.totalEncontrados.toString()}
                      icon={<CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />}
                    />
                    <MetricCard
                      title="Produtos Recomendados"
                      value={metrics.totalRecomendados.toString()}
                      icon={<Sparkles className="h-4.5 w-4.5 text-amber-500" />}
                    />
                    <MetricCard
                      title="Marcas Concorrentes"
                      value={metrics.totalMarcasConcorrentes.toString()}
                      icon={<AlertCircle className="h-4.5 w-4.5 text-rose-500" />}
                    />
                    <MetricCard
                      title="Oportunidades"
                      value={metrics.totalOportunidades.toString()}
                      icon={<Award className="h-4.5 w-4.5 text-indigo-600" />}
                    />
                    <MetricCard
                      title="Score Médio Comercial"
                      value={`${metrics.scoreMedio}%`}
                      icon={<TrendingUp className="h-4.5 w-4.5 text-blue-900" />}
                    />
                  </div>

              {/* Tabela de Clientes */}
              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    Clientes Mapeados ({filteredLatestAnalyses.length})
                  </h3>
                  <span className="text-[10px] text-slate-400">Exibindo versão mais recente de cada análise</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Categoria / Segmento</th>
                        <th className="p-4">Localização</th>
                        <th className="p-4 text-center">Produtos Identificados</th>
                        <th className="p-4 text-center">Score Comercial</th>
                        <th className="p-4 text-center">Potencial</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4">Última Análise</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLatestAnalyses.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8">
                            <EmptyState
                              title="Nenhuma análise disponível."
                              description="Não encontramos nenhuma análise correspondente aos termos de busca ou filtros ativos."
                              action={
                                <div className="flex flex-wrap items-center gap-2.5 justify-center">
                                  <Button size="sm" variant="outline" onClick={handleClearLocalFilters}>
                                    Limpar Filtros
                                  </Button>
                                  <Button size="sm" variant="primary" onClick={() => setShowRunEngineModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
                                    Nova Análise
                                  </Button>
                                </div>
                              }
                            />
                          </td>
                        </tr>
                      ) : (
                        filteredLatestAnalyses.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4 font-bold text-slate-800">
                              <div className="flex flex-col">
                                <span>{item.cliente}</span>
                                <span className="text-[10px] font-normal text-slate-400">{item.cardapioAnalisado} (v{item.versao})</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">{item.segmento}</td>
                            <td className="p-4 text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-300" />
                                {item.cidade} - {item.estado}
                              </span>
                            </td>
                            <td className="p-4 text-center font-semibold text-blue-900">
                              <span className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] border border-blue-100 font-bold">
                                {item.produtosEncontrados.length} encontrados
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-extrabold text-slate-700">{item.scoreComercial}</span>
                                <span className={`px-2 py-0.2 rounded-full border text-[9px] font-black uppercase ${getScoreInfo(item.scoreComercial).color}`}>
                                  {getScoreInfo(item.scoreComercial).label}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant="secondary" className={`${getPotentialColor(item.potencialComercial)}`}>
                                {item.potencialComercial}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant={
                                item.status === 'Aprovado' ? 'success' :
                                item.status === 'Em análise' ? 'warning' :
                                item.status === 'Revisado' ? 'info' :
                                item.status === 'Arquivado' ? 'secondary' : 'primary'
                              }>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-slate-500 whitespace-nowrap">{item.dataAnalise}</td>
                            <td className="p-4 text-right">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setSelectedClientId(item.clientId);
                                  setSelectedVersionId(item.id);
                                  setActiveTab('resumo');
                                }}
                                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                              >
                                Abrir Análise
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
                </>
              )}
            </motion.div>
          ) : (
            // --- VIEW 2: PÁGINA DE ANÁLISE COMPLETA (DEEP-DIVE) ---
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 mt-6 animate-fadeIn"
            >
              {/* Back breadcrumb and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setSelectedClientId(null)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Cockpit Comercial
                </button>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {/* Selector de Versões */}
                  {activeClientAnalyses.length > 1 && (
                    <div className="relative inline-flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Versão:</span>
                      <select
                        value={currentAnalysis?.id || ''}
                        onChange={(e) => setSelectedVersionId(e.target.value)}
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-700"
                      >
                        {activeClientAnalyses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.versao} ({a.dataAnalise}) {a.id === activeClientAnalyses[0].id ? '- Recente' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={() => showNotification('Iniciando exportação PDF para representantes...', 'success')}>
                    Exportar PDF
                  </Button>
                  <Button variant="secondary" size="sm" leftIcon={<Share2 className="h-3.5 w-3.5" />} onClick={() => showNotification('Link de compartilhamento de oportunidades copiado!', 'success')}>
                    Compartilhar
                  </Button>
                </div>
              </div>

              {/* Perfil Header Card */}
              {currentAnalysis && (
                <Card className="p-6 relative overflow-hidden bg-radial from-slate-900 to-slate-950 text-white border-0 shadow-lg">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
                  <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                          Mapeado v{currentAnalysis.versao}
                        </span>
                        <span className="text-slate-400 text-xs">|</span>
                        <span className="text-slate-300 text-xs flex items-center gap-1 font-mono">
                          <Database className="h-3.5 w-3.5" />
                          ID: {currentAnalysis.id}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white uppercase">{currentAnalysis.cliente}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-500">Segmento</span>
                          <p className="font-bold text-white mt-0.5">{currentAnalysis.segmento}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-500">Localização</span>
                          <p className="font-bold text-white mt-0.5">{currentAnalysis.cidade} - {currentAnalysis.estado}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-500">Cardápio</span>
                          <p className="font-bold text-white mt-0.5 text-blue-300 underline cursor-pointer">{currentAnalysis.cardapioAnalisado}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-500">Ingestão</span>
                          <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                            <span className={`h-2 w-2 rounded-full ${currentAnalysis.origem === 'Claude' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                            {currentAnalysis.origem} (v{currentAnalysis.versao})
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col lg:items-end justify-between sm:justify-start gap-4">
                      {/* Status Selector Dropdown */}
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1 lg:text-right">Acompanhamento</span>
                        <select
                          value={currentAnalysis.status}
                          onChange={(e) => handleUpdateStatus(e.target.value as any)}
                          className="bg-slate-800 text-white border border-slate-700 rounded-md p-1.5 text-xs font-bold"
                        >
                          <option value="Novo">Novo</option>
                          <option value="Em análise">Em análise</option>
                          <option value="Revisado">Revisado</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Arquivado">Arquivado</option>
                        </select>
                      </div>

                      <div className="flex gap-4">
                        <div className="text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block lg:text-right">Score Fit</span>
                          <span className="text-xl font-black text-blue-400">{currentAnalysis.scoreFit}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block lg:text-right">Oportunidades</span>
                          <span className="text-xl font-black text-amber-400">{currentAnalysis.qtdOportunidades}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Main Analysis Grid splitting tabs and indicators */}
              {currentAnalysis && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Metrics & Indicators */}
                  <div className="space-y-6">
                    {/* Score Comercial indicator */}
                    <Card className="p-5 text-center">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left border-b border-slate-100 pb-2 mb-4">
                        Score Comercial
                      </h4>
                      <div className="py-2">
                        <ScoreIndicator score={currentAnalysis.scoreComercial} title="Aderência ao Catálogo CTrade" size="lg" />
                      </div>
                      <div className="mt-4 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Classificação Operacional</span>
                        <span className={`mt-1 px-4 py-1.5 rounded-full border text-xs font-extrabold uppercase ${getScoreInfo(currentAnalysis.scoreComercial).color}`}>
                          {getScoreInfo(currentAnalysis.scoreComercial).label}
                        </span>
                      </div>
                    </Card>

                    {/* Potencial Comercial Indicator */}
                    <Card className="p-5">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
                        Potencial Comercial
                      </h4>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-slate-500 font-medium">Classificação</span>
                        <Badge variant="secondary" className={`text-sm px-3.5 py-1 ${getPotentialColor(currentAnalysis.potencialComercial)}`}>
                          {currentAnalysis.potencialComercial}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal mt-2 border-t border-slate-100/50 pt-2">
                        Calculado através da receita média estimada, perfil da culinária, densidade demográfica regional e capacidade técnica do estabelecimento para produtos gourmet.
                      </p>
                    </Card>

                    {/* Observações Internas editable box */}
                    <Card className="p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                          Observações Internas
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Representante</span>
                      </div>
                      <textarea
                        value={obsText}
                        onChange={(e) => setObsText(e.target.value)}
                        className="w-full h-32 rounded-lg border border-slate-200 p-2 text-xs font-sans text-slate-700 focus:outline-blue-900"
                        placeholder="Adicione notas comerciais sobre este cliente (Ex: Reunião agendada, teste de amostras, restrições financeiras...)"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full"
                        leftIcon={<Save className="h-4 w-4" />}
                        onClick={handleSaveObservations}
                      >
                        Salvar Observações
                      </Button>
                    </Card>
                  </div>

                  {/* Right Column: Tabbed Detailed Views */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Tabs bar */}
                    <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap bg-white p-2 rounded-lg border shadow-xs" id="detail-motor-tabs">
                      <button
                        onClick={() => setActiveTab('resumo')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'resumo' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Resumo Executivo
                      </button>
                      <button
                        onClick={() => setActiveTab('encontrados')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'encontrados' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Encontrados ({currentAnalysis.produtosEncontrados.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('ausentes')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'ausentes' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Ausentes ({currentAnalysis.produtosAusentes.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('concorrentes')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'concorrentes' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Concorrentes
                      </button>
                      <button
                        onClick={() => setActiveTab('recomendacoes')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'recomendacoes' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Ações Recomendadas
                      </button>
                      <button
                        onClick={() => setActiveTab('comparacao')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'comparacao' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Comparar Versões
                      </button>
                      <button
                        onClick={() => setActiveTab('future')}
                        className={`pb-2 pt-1.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                          activeTab === 'future' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Integração
                      </button>
                    </div>

                    {/* Tab 1: Resumo Executivo & Timeline */}
                    {activeTab === 'resumo' && (
                      <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="h-4.5 w-4.5 text-blue-900 animate-pulse" />
                            Resumo Executivo do Cruzamento
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans font-light border-l-2 border-blue-900 pl-4">
                            {currentAnalysis.resumoExecutivo}
                          </p>
                        </Card>

                        <Card className="p-6">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            Timeline & Histórico de Versões
                          </h3>
                          <div className="space-y-4">
                            {currentAnalysis.timeline.map((item, index) => (
                              <div key={index} className="flex gap-3 text-xs items-start">
                                <span className="text-[10px] text-slate-400 font-mono pt-0.5 whitespace-nowrap">{item.data}</span>
                                <div className="h-2 w-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                <div className="text-slate-700">
                                  <strong className="text-slate-800">{item.usuario}</strong>: {item.acao}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Tab 2: Produtos Encontrados */}
                    {activeTab === 'encontrados' && (
                      <Card className="p-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Ingredientes e Pratos Encontrados no Cardápio
                          </h3>
                          <span className="bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {currentAnalysis.produtosEncontrados.length} Itens
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                <th className="pb-2">Prato/Ingrediente</th>
                                <th className="pb-2">Marca Mapeada</th>
                                <th className="pb-2 text-center">Categoria</th>
                                <th className="pb-2 text-center">Correspondência</th>
                                <th className="pb-2 text-right">Status Comercial</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currentAnalysis.produtosEncontrados.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 font-semibold text-slate-800">{item.produto}</td>
                                  <td className="py-2.5 text-slate-600 font-mono">{item.marca}</td>
                                  <td className="py-2.5 text-center text-slate-500">{item.categoria}</td>
                                  <td className="py-2.5 text-center font-bold text-slate-700">{item.correspondencia}%</td>
                                  <td className="py-2.5 text-right">
                                    <Badge variant={
                                      item.status === 'Utiliza Marca Premium' ? 'success' :
                                      item.status === 'Substituível' ? 'warning' : 'danger'
                                    }>
                                      {item.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}

                    {/* Tab 3: Produtos Ausentes (Oportunidades C-Trade) */}
                    {activeTab === 'ausentes' && (
                      <Card className="p-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Faltantes C-Trade (Lacunas no Cardápio)
                          </h3>
                          <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {currentAnalysis.produtosAusentes.length} Oportunidades
                          </span>
                        </div>

                        <div className="space-y-3">
                          {currentAnalysis.produtosAusentes.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border border-slate-100 p-3 rounded-lg hover:border-slate-200 transition-all">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{item.produto}</h4>
                                <span className="text-[10px] text-slate-400 mt-0.5 block">Categoria: {item.categoria}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] text-slate-400 font-bold">Potencial: {item.potencial}</span>
                                <Badge variant={
                                  item.prioridade === 'Alta' ? 'danger' :
                                  item.prioridade === 'Média' ? 'warning' : 'secondary'
                                }>
                                  Prioridade {item.prioridade}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Tab 4: Concorrentes */}
                    {activeTab === 'concorrentes' && (
                      <Card className="p-6 space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                          Penetração de Marcas Concorrentes
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentAnalysis.marcasConcorrentes.map((item, idx) => (
                            <div key={idx} className="border border-slate-100 rounded-lg p-4 space-y-2 hover:shadow-xs transition-all">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 text-xs">{item.marca}</h4>
                                <Badge variant="warning">{item.potencialSubstituicao}% subst.</Badge>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                <span className="font-bold text-slate-600 block">Aplicações Detectadas:</span>
                                <p className="mt-0.5">{item.produtosEncontrados.join(', ')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Tab 5: Ações Recomendadas */}
                    {activeTab === 'recomendacoes' && (
                      <Card className="p-6">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                          Plano de Ação para Representantes
                        </h3>

                        <div className="space-y-4">
                          {currentAnalysis.recomendacoes.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleRec(item.id)}
                              className={`flex gap-3 items-start border p-3 rounded-lg cursor-pointer transition-all ${
                                item.concluida ? 'bg-slate-50/50 border-slate-200 opacity-60' : 'bg-white border-slate-150 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                                  item.concluida ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                                }`}>
                                  {item.concluida && <Check className="h-3 w-3" />}
                                </div>
                              </div>
                              <div>
                                <h4 className={`text-xs font-bold ${item.concluida ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                  {item.acao}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">{item.descricao}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Tab 6: Comparar Versões */}
                    {activeTab === 'comparacao' && (
                      <Card className="p-6 space-y-4">
                        <div className="border-b border-slate-100 pb-3 mb-4">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Comparativo entre Versões de Cardápios
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Mapeie a evolução comercial e produtos adicionados ou removidos pelo cliente.</p>
                        </div>

                        {activeClientAnalyses.length < 2 ? (
                          <div className="text-center p-8 border border-dashed border-slate-200 rounded-lg">
                            <Layers className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                            <h4 className="text-xs font-bold text-slate-700">Apenas 1 Versão de Análise Cadastrada</h4>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                              Esta estrutura de comparação já está totalmente montada. Para utilizá-la, clique em "Rodar Motor de Inteligência" e processe um novo cardápio para este mesmo cliente para versionar e auditar!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Origem (Anterior)</label>
                                <select
                                  value={compareOriginId || activeClientAnalyses[1]?.id}
                                  onChange={(e) => { setCompareOriginId(e.target.value); setIsComparing(true); }}
                                  className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold"
                                >
                                  {activeClientAnalyses.map(a => (
                                    <option key={a.id} value={a.id}>{a.versao} ({a.dataAnalise})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Destino (Atual)</label>
                                <select
                                  value={compareDestId || activeClientAnalyses[0]?.id}
                                  onChange={(e) => { setCompareDestId(e.target.value); setIsComparing(true); }}
                                  className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold"
                                >
                                  {activeClientAnalyses.map(a => (
                                    <option key={a.id} value={a.id}>{a.versao} ({a.dataAnalise})</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Diff result visualization */}
                            <div className="space-y-3 pt-2">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest text-[10px]">Alterações Detectadas</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="border border-slate-100 rounded-lg p-3 bg-emerald-50/40">
                                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">+ Produtos Adicionados</span>
                                  <ul className="text-[11px] text-emerald-950 space-y-1">
                                    <li>• Pizza Napoletana DOC (Nova receita com Farinha Caputo)</li>
                                    <li>• Tagliatelle al Tartufo (Inserção gourmet de entrada)</li>
                                  </ul>
                                </div>
                                <div className="border border-slate-100 rounded-lg p-3 bg-rose-50/40">
                                  <span className="text-[10px] uppercase font-bold text-rose-800 block mb-1">- Produtos Removidos</span>
                                  <ul className="text-[11px] text-rose-950 space-y-1">
                                    <li>• Lasagna Congelada Pronta (Remoção de insumos não-premium)</li>
                                  </ul>
                                </div>
                                <div className="border border-slate-100 rounded-lg p-3 bg-blue-50/40">
                                  <span className="text-[10px] uppercase font-bold text-blue-800 block mb-1">✔ Novas Marcas Identificadas</span>
                                  <ul className="text-[11px] text-blue-950 space-y-1">
                                    <li>• Galbani Mascarpone (+1 laticínio premium homologado)</li>
                                  </ul>
                                </div>
                                <div className="border border-slate-100 rounded-lg p-3 bg-slate-100/60">
                                  <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">📊 Mudança no Score Comercial</span>
                                  <p className="text-[11px] text-slate-700">O score de fit subiu de <strong className="text-blue-900">89</strong> para <strong className="text-emerald-700">95</strong> devido ao upgrade de massas secas artesanais.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Tab 7: Future Integration Schema */}
                    {activeTab === 'future' && (
                      <Card className="p-6 space-y-4">
                        <div className="border-b border-slate-100 pb-2 mb-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Preparação para Integração Futura
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">Lógica e variáveis estruturadas para processamento automatizado pelo Claude, Gemini e RD Station.</p>
                        </div>

                        <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[10px] leading-relaxed overflow-x-auto">
                          <span className="text-slate-400">// JSON de telemetria mapeada para as APIs</span>
                          <pre>{JSON.stringify(currentAnalysis.futureIntegration, null, 2)}</pre>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 pt-2">
                          <div className="border border-slate-100 p-3 rounded-lg">
                            <span className="font-bold text-slate-800">Conexão RD Station CRM</span>
                            <p className="text-[11px] text-slate-500 mt-1">Campos de Score Comercial e Potencial de Compra prontos para envio automático na criação de Oportunidades.</p>
                          </div>
                          <div className="border border-slate-100 p-3 rounded-lg">
                            <span className="font-bold text-slate-800">Agentes Claude / Gemini</span>
                            <p className="text-[11px] text-slate-500 mt-1">Estrutura preparada para receber o arquivo do cardápio via Biblioteca de Cardápios e processar a extração cognitiva em segundo plano.</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL: RODAR MOTOR DE INTELIGÊNCIA --- */}
        <Modal
          isOpen={showRunEngineModal}
          onClose={() => setShowRunEngineModal(false)}
          title="Rodar Motor de Inteligência"
          size="md"
        >
          {engineStage === 'idle' ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-xs text-slate-400">Cruzar dados de cardápio com o portfólio inteligente CTrade.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nome do Estabelecimento / Cliente</label>
                  <Input
                    type="text"
                    placeholder="Ex: Osteria Bella Italia, Cantina do Nonno..."
                    value={engineClientName}
                    onChange={(e) => setEngineClientName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Segmento</label>
                    <select
                      value={engineSegment}
                      onChange={(e) => setEngineSegment(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-2 bg-white text-xs"
                    >
                      <option value="Italiano Clássico">Italiano Clássico</option>
                      <option value="Pizzaria">Pizzaria</option>
                      <option value="Japonês">Japonês</option>
                      <option value="Hambúrguer">Hambúrguer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Origem da Análise</label>
                    <select
                      value={engineOrigem}
                      onChange={(e) => setEngineOrigem(e.target.value as any)}
                      className="w-full rounded-md border border-slate-200 p-2 bg-white text-xs"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Claude">Claude (Automatizada)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Cidade</label>
                    <Input
                      type="text"
                      value={engineCidade}
                      onChange={(e) => setEngineCidade(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Estado</label>
                    <select
                      value={engineEstado}
                      onChange={(e) => setEngineEstado(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-2 bg-white text-xs"
                    >
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Selecione o Arquivo de Cardápio</label>
                  <select
                    value={engineCardapio}
                    onChange={(e) => setEngineCardapio(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-2 bg-white text-xs"
                  >
                    <option value="cardapio_osteria_v3.pdf">cardapio_osteria_v3.pdf</option>
                    <option value="cardapio_pizzaria_bellanapoli.docx">cardapio_pizzaria_bellanapoli.docx</option>
                    <option value="menu_sushi_digital_v2.pdf">menu_sushi_digital_v2.pdf</option>
                    <option value="cardapio_burgers_2026.png">cardapio_burgers_2026.png</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowRunEngineModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleRunSimulation}>
                  Processar Cruzamento
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-6">
              <div className="relative h-14 w-14 mx-auto flex items-center justify-center">
                <Spinner className="h-12 w-12 text-blue-900 absolute" />
                <Brain className="h-6 w-6 text-blue-900 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                  {engineStage === 'reading' && 'Lendo arquivo de cardápio...'}
                  {engineStage === 'mapping' && 'Mapeando receitas encontradas...'}
                  {engineStage === 'matching' && 'Cruzando com Banco de SKUs C-Trade...'}
                  {engineStage === 'scoring' && 'Calculando Score Comercial e Versão...'}
                </h3>
                <p className="text-[11px] text-slate-400">Processando e estruturando novos registros sem sobrescrever dados anteriores.</p>
              </div>

              <div className="max-w-xs mx-auto">
                <ProgressBar value={engineProgress} colorClass="bg-blue-900" />
                <span className="text-[10px] text-slate-500 font-bold block mt-2 text-right">{engineProgress}% Concluído</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageContainer>
  );
}
