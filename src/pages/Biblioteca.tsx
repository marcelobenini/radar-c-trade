/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge, Tag, Toast, EmptyState, Tooltip } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Interactive';
import Upload from '../components/ui/Upload';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import { 
  Library, 
  FileText, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  Clock, 
  User, 
  ExternalLink, 
  Database, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  ChevronLeft,
  FileSpreadsheet,
  AlertCircle,
  FileCode,
  Tag as TagIcon,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Eraser,
  XCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { REAL_CARDAPIOS, REAL_PRODUCTS, REAL_CLIENTS } from '../data/realData';
import GlobalFilters from '../components/shared/GlobalFilters';
import { syncPlatformData } from '../utils/platformSync';

const rcas = [
  { id: 'rca-marcelo', name: 'RCA Marcelo Baquero' },
  { id: 'rca-amanda', name: 'RCA Amanda Souza' },
  { id: 'rca-pedro', name: 'RCA Pedro Santos' },
  { id: 'rca-lucas', name: 'RCA Lucas Oliveira' },
];

const clients = REAL_CLIENTS.map(rc => ({
  ...rc,
  regionalId: rc.state === 'RJ' ? 'reg-sudeste' : 'reg-sul',
  rcaId: rc.state === 'RJ' ? 'rca-marcelo' : 'rca-amanda'
}));

export interface IdentifiedProduct {
  id: string;
  nomeNoCardapio: string; // Dish/item name found in menu
  productId?: string;     // Links to REAL_PRODUCTS
  productName?: string;   // Name from catalog
  brand?: string;         // Brand from catalog
  category?: string;      // Category from catalog
  notInCatalog: boolean;  // True if it is not in portfolio
  status: 'Pendente' | 'Homologado' | 'Rejeitado';
  confidence?: number;    // Confidence of Claude AI analysis
  observacao?: string;    // Extra comments
}

// Type definitions for Menu items matching future integration fields
export interface CardapioItem {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  categoria: string;
  dataCardapio: string;
  origem: 'Upload Manual' | 'Claude';
  status: 'Entradas' | 'Autorizados' | 'Rejeitados';
  ultimaAtualizacao: string;
  rejectionReason?: string;
  
  // Future Claude and system integration fields
  source?: 'email' | 'whatsapp' | 'api' | 'manual';
  externalId?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'archived';
  receivedAt?: string;
  lastAnalysis?: string;
  
  // File details
  fileName: string;
  fileSize: string;
  fileType: 'PDF' | 'DOCX' | 'JPG' | 'PNG' | string;
  
  // Custom text notes
  observacoes: string;
  historico: Array<{
    id: string;
    data: string;
    usuario: string;
    acao: string;
  }>;

  // New fields for curated Menu Intelligence Center
  empresa?: string;
  responsavelAnalise?: string;
  produtosIdentificados?: IdentifiedProduct[];
  claudeConfidence?: number;
  claudeInsights?: string;
}

const STORAGE_KEY = 'ctrade_menu_library';

const INITIAL_DATA: CardapioItem[] = REAL_CARDAPIOS.map(rc => {
  let mappedStatus: 'Entradas' | 'Autorizados' | 'Rejeitados' = 'Entradas';
  if (rc.status === 'Novo' || rc.status === 'Em análise') {
    mappedStatus = 'Entradas';
  } else if (rc.status === 'Revisado' || rc.status === 'Aprovado') {
    mappedStatus = 'Autorizados';
  } else {
    mappedStatus = 'Rejeitados';
  }

  // Generate mock identified products
  let defaultIdentified: IdentifiedProduct[] = [];
  if (rc.id === 'menu-babbo-osteria') {
    defaultIdentified = [
      {
        id: 'id-b1',
        nomeNoCardapio: 'Crochetta di Salsiccia',
        productId: 'prod-valdigrano-1109',
        productName: 'Spaghetti',
        brand: 'Valdigrano',
        category: 'Massas Tradicionais',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.96,
        observacao: 'Utiliza Spaghetti tradicional para pratos de massa.'
      },
      {
        id: 'id-b2',
        nomeNoCardapio: 'Parmigiana di Melanzane',
        productId: 'prod-latteria-sorrentina-106',
        productName: 'Fiordilatte Bola',
        brand: 'Latteria Sorrentina',
        category: 'Fiordilatte',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.98,
        observacao: 'Cobertura de berinjela com queijo fiordilatte bola.'
      },
      {
        id: 'id-b3',
        nomeNoCardapio: 'Arancini Funghi',
        productId: 'prod-urbani-61131',
        productName: 'Funghi Porcini Seco 50g',
        brand: 'Urbani',
        category: 'Funghi Secchi',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.94,
        observacao: 'Saborizado com funghi porcini seco e azeite trufado.'
      },
      {
        id: 'id-b4',
        nomeNoCardapio: 'Polenta alla Bolognese',
        productId: 'prod-moretti-320311',
        productName: 'Bramata Bianca',
        brand: 'Moretti',
        category: 'Polentas',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.95,
        observacao: 'Base de polenta bramata branca artesanal.'
      },
      {
        id: 'id-b5',
        nomeNoCardapio: 'Gnocchi di Tartufo e Funghi',
        notInCatalog: true,
        status: 'Pendente',
        confidence: 0.85,
        observacao: 'Ingrediente Trufado de luxo. Sem correspondência exata de purê de trufas brancas de verão no catálogo local.'
      },
      {
        id: 'id-b6',
        nomeNoCardapio: 'Tiramisù della Casa',
        productId: 'prod-fabbri-920',
        productName: 'Amarena Fabbri 230g',
        brand: 'Fabbri',
        category: 'Cerejas',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.92,
        observacao: 'Decorado com cerejas amarena em caldas.'
      }
    ];
  } else if (rc.id === 'menu-ella-pizzaria') {
    defaultIdentified = [
      {
        id: 'id-e1',
        nomeNoCardapio: 'Pizza Margherita',
        productId: 'prod-latteria-sorrentina-109',
        productName: 'Fiordilatte Julienne',
        brand: 'Latteria Sorrentina',
        category: 'Fiordilatte',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.99,
        observacao: 'Utiliza Fiordilatte Julienne nas coberturas das pizzas.'
      },
      {
        id: 'id-e2',
        nomeNoCardapio: 'Pizza Marinara',
        productId: 'prod-girafi-353',
        productName: 'Orégano Siciliano em Folhas (Vidro)',
        brand: 'Girafi',
        category: 'Temperos',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.97,
        observacao: 'Orégano Siciliano importado nas marinara.'
      },
      {
        id: 'id-e3',
        nomeNoCardapio: 'Pizza Burrata',
        productId: 'prod-latteria-sorrentina-83',
        productName: 'Burrata Individual',
        brand: 'Latteria Sorrentina',
        category: 'Burrata',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.98,
        observacao: 'Burrata individual colocada fresca no centro da pizza.'
      },
      {
        id: 'id-e4',
        nomeNoCardapio: 'Pizza Diavola',
        productId: 'prod-ciao-2068',
        productName: 'Passata de Tomate (680g)',
        brand: 'Ciao',
        category: 'Tomates Italianos',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.94,
        observacao: 'Molho de tomate pelati ou passata.'
      },
      {
        id: 'id-e5',
        nomeNoCardapio: 'Pizza Pepperoni Suprema de Parma',
        notInCatalog: true,
        status: 'Pendente',
        confidence: 0.88,
        observacao: 'Ingrediente nobre. Não temos frios/embutidos no catálogo.'
      },
      {
        id: 'id-e6',
        nomeNoCardapio: 'Calzone Doce de Nutella',
        notInCatalog: true,
        status: 'Pendente',
        confidence: 0.90,
        observacao: 'Calzone de creme de avelã.'
      }
    ];
  } else {
    defaultIdentified = [
      {
        id: `id-gen-1`,
        nomeNoCardapio: 'Spaghetti Pomodoro',
        productId: 'prod-valdigrano-1109',
        productName: 'Spaghetti',
        brand: 'Valdigrano',
        category: 'Massas Tradicionais',
        notInCatalog: false,
        status: 'Homologado',
        confidence: 0.95
      },
      {
        id: `id-gen-2`,
        nomeNoCardapio: 'Pizza de Cogumelos',
        notInCatalog: true,
        status: 'Pendente',
        confidence: 0.82
      }
    ];
  }

  return {
    id: rc.id,
    nomeEstabelecimento: rc.nomeEstabelecimento,
    cidade: rc.cidade,
    estado: rc.estado,
    categoria: rc.categoria,
    dataCardapio: rc.dataCardapio,
    origem: rc.origem as any,
    status: mappedStatus,
    ultimaAtualizacao: rc.ultimaAtualizacao,
    fileName: rc.fileName,
    fileSize: rc.fileSize,
    fileType: rc.fileType,
    observacoes: rc.observacoes,
    historico: rc.historico,
    empresa: rc.nomeEstabelecimento + ' Gourmet S/A',
    responsavelAnalise: rc.origem === 'Claude' ? 'Claude AI (Automático)' : 'Marcelo Baquero (Você)',
    produtosIdentificados: defaultIdentified,
    claudeConfidence: rc.origem === 'Claude' ? 95 : 94,
    claudeInsights: rc.origem === 'Claude' ? 'Elevada aderência para queijos Latteria Sorrentina e massas Valdigrano.' : 'Aderência detectada de queijos premium Latteria Sorrentina e grãos Moretti.'
  };
});

export default function Biblioteca() {
  // Main state
  const [items, setItems] = useState<CardapioItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing menu library data', e);
      }
    }
    return INITIAL_DATA;
  });

  // Selected item for details page
  const [selectedItem, setSelectedItem] = useState<CardapioItem | null>(null);

  useEffect(() => {
    const targetMenuId = localStorage.getItem('ctrade_selected_menu_id');
    if (targetMenuId && items.length > 0) {
      const found = items.find(item => item.id.toString() === targetMenuId.toString() || (item.nomeEstabelecimento && item.nomeEstabelecimento.toLowerCase() === targetMenuId.toLowerCase()));
      if (found) {
        setSelectedItem(found);
        localStorage.removeItem('ctrade_selected_menu_id');
      }
    }
  }, [items]);

  // States for Curation, List/Grid toggles, and Modals
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingTargetProduct, setMappingTargetProduct] = useState<IdentifiedProduct | null>(null);
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCatalogId, setNewProductCatalogId] = useState('');

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
    // Dispatch a storage event to keep other tabs synchronized
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

  const [showFilters, setShowFilters] = useState(false);

  // Filtered Cities list based on selected states
  const cidadeOptions = useMemo(() => {
    const allCitiesFromData = Array.from(new Set(items.map(i => i.cidade).filter(Boolean)));
    if (sessionFilters.estados.length > 0) {
      return Array.from(new Set(
        items
          .filter(i => sessionFilters.estados.includes(i.estado))
          .map(i => i.cidade)
          .filter(Boolean)
      )).map(c => ({ value: c, label: c }));
    }
    return allCitiesFromData.map(c => ({ value: c, label: c }));
  }, [items, sessionFilters.estados]);

  // Modal Upload states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMenu, setNewMenu] = useState({
    nomeEstabelecimento: '',
    cidade: '',
    estado: 'SP',
    categoria: 'Italiano',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Details screen observation & status states
  const [detailObservations, setDetailObservations] = useState('');
  const [detailStatus, setDetailStatus] = useState<CardapioItem['status']>('Entradas');
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Save items helper
  const saveItemsToStorage = (updatedItems: CardapioItem[]) => {
    setItems(updatedItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    syncPlatformData();
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
    setToast({ message: 'Todos os critérios de busca foram redefinidos.', type: 'info' });
  };

  // Sync details observations and status if selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setDetailObservations(selectedItem.observacoes);
      setDetailStatus(selectedItem.status);
    }
  }, [selectedItem]);

  // Handle Toast notification AutoClose
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // List of states & categories for selectors
  const estadosBR = ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'DF', 'CE', 'GO'];
  const categoriasGourmet = [
    'Italiano',
    'Pizzaria',
    'Hamburgueria',
    'Asiático',
    'Contemporâneo',
    'Carnes & Grelhados',
    'Bistrô',
    'Cafeteria / Padaria',
    'Vegano / Vegetariano',
    'Outros'
  ];

  // Filters calculation using unified sessionFilters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 0. Período filter (global)
      if (sessionFilters.periodoOption !== 'all') {
        const itemDate = new Date(item.dataCardapio || item.ultimaAtualizacao || Date.now());
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
          if (itemDate < startDate || itemDate > endDate) {
            return false;
          }
        }
      }

      // 1. Estado filter (multiple)
      if (sessionFilters.estados.length > 0 && !sessionFilters.estados.includes(item.estado)) {
        return false;
      }

      // 2. Cidade filter (multiple)
      if (sessionFilters.cidades.length > 0 && !sessionFilters.cidades.includes(item.cidade)) {
        return false;
      }

      // 3. RCA filter (multiple)
      const clientOfItem = clients.find(c => c.name === item.nomeEstabelecimento);
      if (sessionFilters.rcas.length > 0) {
        if (!clientOfItem || !clientOfItem.rcaId || !sessionFilters.rcas.includes(clientOfItem.rcaId)) {
          return false;
        }
      }

      // 4. Categoria filter (multiple) - match either menu category or if it contains any product in the selected category
      if (sessionFilters.categorias.length > 0) {
        const matchesMenuCategory = sessionFilters.categorias.includes(item.categoria);
        const matchesProductCategory = item.produtosIdentificados?.some(p => p.category && sessionFilters.categorias.includes(p.category)) || false;
        if (!matchesMenuCategory && !matchesProductCategory) {
          return false;
        }
      }

      // 5. Marca filter (multiple) - match if menu contains products of that brand
      if (sessionFilters.marcas && sessionFilters.marcas.length > 0) {
        const matchesBrand = item.produtosIdentificados?.some(p => p.brand && sessionFilters.marcas.includes(p.brand)) || false;
        if (!matchesBrand) {
          return false;
        }
      }

      // 6. Produto filter (multiple) - match if menu contains that product name/id
      if (sessionFilters.produtos && sessionFilters.produtos.length > 0) {
        const matchesProduct = item.produtosIdentificados?.some(p => p.productName && sessionFilters.produtos.includes(p.productName)) || false;
        if (!matchesProduct) {
          return false;
        }
      }

      // 6. Segmento filter (multiple)
      if (sessionFilters.segmentos.length > 0 && !sessionFilters.segmentos.includes(item.categoria)) {
        return false;
      }

      // 7. Status filter (multiple)
      if (sessionFilters.statuses.length > 0 && !sessionFilters.statuses.includes(item.status)) {
        return false;
      }

      // 10. Cliente filter (text search) - Match client name, city, state, segment, and mapped product names, brands, or categories
      if (sessionFilters.cliente) {
        const q = sessionFilters.cliente.toLowerCase();
        const matchSearch = 
          item.nomeEstabelecimento.toLowerCase().includes(q) ||
          item.cidade.toLowerCase().includes(q) ||
          item.estado.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          (item.produtosIdentificados?.some(p => {
            const nameMatch = p.nomeNoCardapio.toLowerCase().includes(q) || (p.productName && p.productName.toLowerCase().includes(q));
            const brandMatch = p.brand && p.brand.toLowerCase().includes(q);
            const catMatch = p.category && p.category.toLowerCase().includes(q);
            return nameMatch || brandMatch || catMatch;
          }) || false);

        if (!matchSearch) {
          return false;
        }
      }

      return true;
    });
  }, [items, sessionFilters]);

  interface EnrichedCompanyData {
    cnpj: string;
    razaoSocial: string;
    fantasyName: string;
    situacaoCadastral: string;
    dataAbertura: string;
    endereco: string;
    city: string;
    state: string;
    cep: string;
    segment: string;
    phone: string;
    website: string;
    responsible: string;
    responsibleRole: string;
    linkedin: string;
    cnae: string;
  }

  const getFallbackEnrichedData = (name: string, city: string, state: string): EnrichedCompanyData => {
    let code = 0;
    for (let i = 0; i < name.length; i++) code += name.charCodeAt(i);
    
    const cnpjMid = String(100000 + (code * 123) % 900000);
    const cnpjLast = String(10 + (code * 7) % 90);
    const cnpj = `54.${cnpjMid.slice(0,3)}.${cnpjMid.slice(3)}/0001-${cnpjLast}`;
    
    const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const razaoSocial = `${cleanName} Alimentos e Gastronomia Ltda`;
    
    const isPizzaria = name.toLowerCase().includes('pizza') || name.toLowerCase().includes('forneria') || name.toLowerCase().includes('pizzaria');
    const segment = isPizzaria ? 'Pizzaria' : 'Restaurante Italiano';
    
    const ddd = state === 'RJ' ? '21' : state === 'SP' ? '11' : state === 'PR' ? '41' : state === 'SC' ? '48' : '11';
    const phonePref = '9' + String(8000 + (code % 2000));
    const phoneSuff = String(1000 + (code % 9000));
    const phone = `(${ddd}) ${phonePref}-${phoneSuff}`;
    
    const formattedName = cleanName.toLowerCase().replace(/\s+/g, '');
    const website = `www.${formattedName}.com.br`;
    
    const firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Otávio', 'Patrícia', 'Ricardo', 'Sofia', 'Thiago', 'Vanessa'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Gomes', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro', 'Costa'];
    
    const fName = firstNames[code % firstNames.length];
    const lName = lastNames[(code + 3) % lastNames.length];
    const responsible = `${fName} ${lName}`;
    const responsibleRole = code % 2 === 0 ? 'Sócio-Proprietário' : 'Chef de Cozinha';
    const linkedin = `https://www.linkedin.com/in/${fName.toLowerCase()}-${lName.toLowerCase()}-${code % 100}`;

    const cnae = isPizzaria 
      ? '56.11-2-03 - Lanchonetes, casas de chá, de sucos e similares (Pizzas)'
      : '56.11-2-01 - Restaurantes e similares (Gastronomia Italiana)';

    const cepPref = state === 'SP' ? '01310' : state === 'RJ' ? '22410' : '80010';
    const cepSuff = String(100 + (code % 900));
    const cep = `${cepPref}-${cepSuff}`;

    const enderecos = [
      'Av. Paulista, 1200 - Bela Vista',
      'Rua Augusta, 450 - Consolação',
      'Rua Oscar Freire, 800 - Jardins',
      'Av. Brigadeiro Faria Lima, 2300 - Pinheiros',
      'Rua Dias Ferreira, 242 - Leblon',
      'Av. Atlântica, 1020 - Copacabana',
      'Rua Visconde de Pirajá, 351 - Ipanema',
      'Rua XV de Novembro, 200 - Centro'
    ];
    const endereco = enderecos[code % enderecos.length];

    return {
      cnpj,
      razaoSocial,
      fantasyName: name,
      situacaoCadastral: 'ATIVA',
      dataAbertura: `18/10/${2010 + (code % 14)}`,
      endereco,
      city: city || 'São Paulo',
      state: state || 'SP',
      cep,
      segment,
      phone,
      website,
      responsible,
      responsibleRole,
      linkedin,
      cnae
    };
  };

  const getEnrichedCompanyData = (name: string, city: string, state: string): EnrichedCompanyData => {
    const norm = name.toLowerCase();
    if (norm.includes('babbo') || norm.includes('schramm')) {
      return {
        cnpj: '12.345.678/0001-90',
        razaoSocial: 'Schramm Gastronomia Ltda',
        fantasyName: 'Babbo Osteria Fine Dining',
        situacaoCadastral: 'ATIVA',
        dataAbertura: '10/11/2021',
        endereco: 'Rua Barão da Torre, 632 - Ipanema',
        city: 'Rio de Janeiro',
        state: 'RJ',
        cep: '22411-002',
        segment: 'Restaurante Italiano',
        phone: '(21) 91234-5678',
        website: 'www.babboosteria.com.br',
        responsible: 'Elia Schramm',
        responsibleRole: 'Chef Executivo / Proprietário',
        linkedin: 'https://www.linkedin.com/in/eliaschramm',
        cnae: '56.11-2-01 - Restaurantes e similares (Gastronomia Italiana)'
      };
    }
    if (norm.includes('ella') || norm.includes('siqueira')) {
      return {
        cnpj: '98.765.432/0001-21',
        razaoSocial: 'Siqueira Pizzas Artesanais Ltda',
        fantasyName: 'Ella Pizzaria',
        situacaoCadastral: 'ATIVA',
        dataAbertura: '15/03/2017',
        endereco: 'Rua Pacheco Leão, 102 - Jardim Botânico',
        city: 'Rio de Janeiro',
        state: 'RJ',
        cep: '22460-030',
        segment: 'Pizzaria',
        phone: '(21) 98765-4321',
        website: 'www.ellapizzaria.com.br',
        responsible: 'Pedro Siqueira',
        responsibleRole: 'Chef Executivo / Proprietário',
        linkedin: 'https://www.linkedin.com/in/pedrosiqueira',
        cnae: '56.11-2-03 - Lanchonetes, casas de chá, de sucos e similares (Pizzas)'
      };
    }
    if (norm.includes('gero') || norm.includes('fasano')) {
      return {
        cnpj: '45.890.123/0001-44',
        razaoSocial: 'Hotel Fasano e Gastronomia S.A.',
        fantasyName: 'Gero / Fasano',
        situacaoCadastral: 'ATIVA',
        dataAbertura: '05/05/2003',
        endereco: 'Rua Aníbal de Mendonça, 132 - Ipanema',
        city: city || 'Rio de Janeiro',
        state: state || 'RJ',
        cep: '22410-010',
        segment: 'Restaurante Italiano',
        phone: '(21) 2239-8158',
        website: 'www.fasano.com.br',
        responsible: 'Rogério Fasano',
        responsibleRole: 'Sócio-Diretor',
        linkedin: 'https://www.linkedin.com/in/rogeriofasano',
        cnae: '56.11-2-01 - Restaurantes e similares (Gastronomia Italiana)'
      };
    }
    if (norm.includes('cipriani')) {
      return {
        cnpj: '33.221.098/0001-55',
        razaoSocial: 'Cipriani Gastronomia do Brasil Ltda',
        fantasyName: 'Cipriani',
        situacaoCadastral: 'ATIVA',
        dataAbertura: '20/08/1994',
        endereco: 'Av. Atlântica, 1702 - Copacabana',
        city: city || 'Rio de Janeiro',
        state: state || 'RJ',
        cep: '22021-001',
        segment: 'Restaurante Italiano',
        phone: '(21) 2548-7070',
        website: 'www.belmond.com',
        responsible: 'Aniello Cassese',
        responsibleRole: 'Chef Executivo',
        linkedin: 'https://www.linkedin.com/in/aniellocassese',
        cnae: '56.11-2-01 - Restaurantes e similares (Gastronomia Italiana)'
      };
    }
    if (norm.includes('braz') || norm.includes('bráz')) {
      return {
        cnpj: '71.234.567/0002-33',
        razaoSocial: 'Pizzaria Bráz S.A.',
        fantasyName: 'Bráz Pizzaria',
        situacaoCadastral: 'ATIVA',
        dataAbertura: '12/10/1998',
        endereco: 'Rua Graúna, 125 - Moema',
        city: city || 'São Paulo',
        state: state || 'SP',
        cep: '04529-010',
        segment: 'Pizzaria',
        phone: '(11) 5561-1736',
        website: 'www.brazpizzaria.com.br',
        responsible: 'Claudio Santos',
        responsibleRole: 'Gerente Geral de Operações',
        linkedin: 'https://www.linkedin.com/in/claudiosantosc_braz',
        cnae: '56.11-2-03 - Lanchonetes, casas de chá, de sucos e similares (Pizzas)'
      };
    }
    return getFallbackEnrichedData(name, city, state);
  };

  // Handle simulation of manual upload
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMenu.nomeEstabelecimento.trim() || !newMenu.cidade.trim()) {
      setToast({ message: 'Por favor, preencha todos os campos obrigatórios.', type: 'error' });
      return;
    }

    if (!uploadedFile) {
      setToast({ message: 'Por favor, selecione um arquivo válido.', type: 'error' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newId = `menu-${Date.now()}`;
    const fileType = uploadedFile.name.split('.').pop()?.toUpperCase() || 'PDF';

    const newItem: CardapioItem = {
      id: newId,
      nomeEstabelecimento: newMenu.nomeEstabelecimento,
      cidade: newMenu.cidade,
      estado: newMenu.estado,
      categoria: newMenu.categoria,
      dataCardapio: todayStr,
      origem: 'Upload Manual',
      status: 'Entradas',
      ultimaAtualizacao: todayStr,
      source: 'manual',
      externalId: `ext-man-${Math.floor(100000 + Math.random() * 900000)}`,
      processingStatus: 'pending',
      receivedAt: new Date().toISOString(),
      fileName: uploadedFile.name,
      fileSize: (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
      fileType: fileType,
      observacoes: '',
      historico: [
        {
          id: `h-init-${Date.now()}`,
          data: `${todayStr} ${new Date().toTimeString().split(' ')[0].slice(0, 5)}`,
          usuario: 'Marcelo Baquero (Você)',
          acao: `Upload manual realizado do arquivo "${uploadedFile.name}".`
        }
      ],
      empresa: newMenu.nomeEstabelecimento + ' Gourmet S/A',
      responsavelAnalise: 'Marcelo Baquero (Você)',
      produtosIdentificados: [
        {
          id: `id-gen-${Date.now()}-1`,
          nomeNoCardapio: 'Spaghetti Pomodoro e Basilico',
          productId: 'prod-valdigrano-1109',
          productName: 'Spaghetti',
          brand: 'Valdigrano',
          category: 'Massas Tradicionais',
          notInCatalog: false,
          status: 'Homologado',
          confidence: 0.95
        },
        {
          id: `id-gen-${Date.now()}-2`,
          nomeNoCardapio: 'Insalata Caprese Premium',
          productId: 'prod-latteria-sorrentina-106',
          productName: 'Fiordilatte Bola',
          brand: 'Latteria Sorrentina',
          category: 'Fiordilatte',
          notInCatalog: false,
          status: 'Homologado',
          confidence: 0.98
        },
        {
          id: `id-gen-${Date.now()}-3`,
          nomeNoCardapio: 'Tiramisù Tradicional',
          notInCatalog: true,
          status: 'Pendente',
          confidence: 0.82,
          observacao: 'Produto não encontrado no portfólio.'
        }
      ]
    };

    const updated = [newItem, ...items];
    saveItemsToStorage(updated);

    // Synchronize with Client Base (ctrade_clients_list_v2)
    try {
      const savedClientsStr = localStorage.getItem('ctrade_clients_list_v2');
      if (savedClientsStr) {
        const localClients = JSON.parse(savedClientsStr);
        
        // 1 & 2: Identify Restaurant & Locate CNPJ
        const enriched = getEnrichedCompanyData(newMenu.nomeEstabelecimento, newMenu.cidade, newMenu.estado);
        const targetCnpj = enriched.cnpj.replace(/\D/g, '');
        
        // 3: Prevent Duplicates
        const existingClient = localClients.find((c: any) => 
          (c.cnpj && c.cnpj.replace(/\D/g, '') === targetCnpj) ||
          c.name.toLowerCase() === newMenu.nomeEstabelecimento.toLowerCase() ||
          c.fantasyName.toLowerCase() === newMenu.nomeEstabelecimento.toLowerCase()
        );
        
        if (existingClient) {
          // Merge to existing client (enrich if needed)
          const updatedClients = localClients.map((c: any) => {
            if (c.id === existingClient.id) {
              const needsEnrich = !c.endereco || !c.cnpj;
              const newHistory = [
                ...(c.historicoCompleto || []),
                {
                  id: 'h-bib-' + Date.now(),
                  data: todayStr + ' ' + new Date().toTimeString().slice(0, 5),
                  usuario: 'Biblioteca Digital',
                  acao: `Novo cardápio anexado via biblioteca de cardápios: ${uploadedFile.name}.`,
                  tipo: 'cardapio'
                }
              ];
              
              if (needsEnrich) {
                newHistory.push(
                  { id: 'h-enrich-1-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Iniciando enriquecimento automático em segundo plano pelo upload do cardápio.`, tipo: 'atualizacao' },
                  { id: 'h-enrich-2-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `CNPJ ${enriched.cnpj} localizado com Situação Cadastral: ${enriched.situacaoCadastral}.`, tipo: 'atualizacao' },
                  { id: 'h-enrich-3-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Ficha enriquecida com atividade CNAE: ${enriched.cnae} e endereço: ${enriched.endereco}.`, tipo: 'atualizacao' },
                  { id: 'h-enrich-4-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Responsável de compras identificado: ${enriched.responsible} (${enriched.responsibleRole}). LinkedIn cadastrado.`, tipo: 'atualizacao' }
                );
              }

              const isValidPhoneLocal = (ph: string) => {
                if (!ph) return false;
                const digits = ph.replace(/\D/g, '');
                return digits.length >= 10 && digits.length <= 11 && !/^(.)\1+$/.test(digits);
              };

              return {
                ...c,
                lastUpload: uploadedFile.name,
                dateUpdated: todayStr,
                cnpj: c.cnpj || enriched.cnpj,
                razaoSocial: c.razaoSocial || enriched.razaoSocial,
                fantasyName: c.fantasyName || enriched.fantasyName,
                situacaoCadastral: c.situacaoCadastral || enriched.situacaoCadastral,
                dataAbertura: c.dataAbertura || enriched.dataAbertura,
                endereco: c.endereco || enriched.endereco,
                cep: c.cep || enriched.cep,
                cnae: c.cnae || enriched.cnae,
                phone: isValidPhoneLocal(c.phone) ? c.phone : (isValidPhoneLocal(enriched.phone) ? enriched.phone : c.phone),
                website: c.website || enriched.website,
                responsible: c.responsible || enriched.responsible,
                responsibleRole: c.responsibleRole || enriched.responsibleRole,
                linkedin: c.linkedin || enriched.linkedin,
                historicoCompleto: newHistory
              };
            }
            return c;
          });
          localStorage.setItem('ctrade_clients_list_v2', JSON.stringify(updatedClients));
        } else {
          // Create new client record automatically
          const newClientId = localClients.length > 0 ? Math.max(...localClients.map((c: any) => c.id)) + 1 : 1;
          const newClient = {
            id: newClientId,
            name: enriched.razaoSocial,
            fantasyName: enriched.fantasyName,
            razaoSocial: enriched.razaoSocial,
            cnpj: enriched.cnpj,
            city: newMenu.cidade,
            state: newMenu.estado,
            segment: newMenu.categoria,
            category: 'Farinhas',
            instagram: '@' + enriched.fantasyName.toLowerCase().replace(/\s+/g, ''),
            website: enriched.website,
            phone: enriched.phone,
            linkedin: enriched.linkedin,
            email: 'contato@' + enriched.fantasyName.toLowerCase().replace(/\s+/g, '') + '.com.br',
            responsible: enriched.responsible,
            responsibleRole: enriched.responsibleRole,
            observations: 'Criado e enriquecido automaticamente via upload de cardápio na biblioteca.',
            score: Math.floor(Math.random() * 35) + 65,
            potential: 'Alto',
            status: 'Entradas',
            lastAnalysis: 'Aguardando envio',
            lastUpload: uploadedFile.name,
            responsibleCommercial: 'RCA Marcelo Baquero',
            dateCreated: todayStr,
            dateUpdated: todayStr,
            situacaoCadastral: enriched.situacaoCadastral,
            dataAbertura: enriched.dataAbertura,
            endereco: enriched.endereco,
            cep: enriched.cep,
            cnae: enriched.cnae,
            historicoCompleto: [
              { id: 'h-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Biblioteca Digital', acao: 'Cliente criado automaticamente a partir do upload de cardápio.', tipo: 'cadastro' },
              { id: 'h-e1-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Identificação do Restaurante concluída para "${enriched.fantasyName}".`, tipo: 'atualizacao' },
              { id: 'h-e2-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `CNPJ ${enriched.cnpj} localizado e dados públicos obtidos.`, tipo: 'atualizacao' },
              { id: 'h-e3-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Ficha enriquecida com Razão Social, CNAE, Endereço e Canais Digitais.`, tipo: 'atualizacao' },
              { id: 'h-e4-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Decisor de compras mapeado: ${enriched.responsible} (${enriched.responsibleRole}). LinkedIn vinculado.`, tipo: 'atualizacao' }
            ]
          };
          localStorage.setItem('ctrade_clients_list_v2', JSON.stringify([newClient, ...localClients]));
        }
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Error syncing uploaded cardapio to client list', err);
    }

    // Reset fields
    setNewMenu({
      nomeEstabelecimento: '',
      cidade: '',
      estado: 'SP',
      categoria: 'Italiano',
    });
    setUploadedFile(null);
    setIsUploadModalOpen(false);
    setToast({ message: 'Cardápio cadastrado na biblioteca com sucesso!', type: 'success' });
  };

  // Status Change handler in detail view
  const handleStatusChange = (newStatus: CardapioItem['status']) => {
    if (!selectedItem) return;

    setDetailStatus(newStatus);
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const updatedHistorico = [
      {
        id: `h-status-${Date.now()}`,
        data: `${todayStr} ${timeStr}`,
        usuario: 'Marcelo Baquero (Você)',
        acao: `Status alterado de "${selectedItem.status}" para "${newStatus}".`
      },
      ...selectedItem.historico
    ];

    const updatedItem: CardapioItem = {
      ...selectedItem,
      status: newStatus,
      ultimaAtualizacao: todayStr,
      historico: updatedHistorico
    };

    // Update in list
    const updatedList = items.map((it) => (it.id === selectedItem.id ? updatedItem : it));
    saveItemsToStorage(updatedList);
    setSelectedItem(updatedItem);
    setToast({ message: `Status atualizado para ${newStatus}`, type: 'success' });
  };

  // Add observation notes handler
  const handleSaveObservations = () => {
    if (!selectedItem) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const updatedHistorico = [
      {
        id: `h-obs-${Date.now()}`,
        data: `${todayStr} ${timeStr}`,
        usuario: 'Marcelo Baquero (Você)',
        acao: 'Observações internas atualizadas.'
      },
      ...selectedItem.historico
    ];

    const updatedItem: CardapioItem = {
      ...selectedItem,
      observacoes: detailObservations,
      ultimaAtualizacao: todayStr,
      historico: updatedHistorico
    };

    // Update in list
    const updatedList = items.map((it) => (it.id === selectedItem.id ? updatedItem : it));
    saveItemsToStorage(updatedList);
    setSelectedItem(updatedItem);
    setToast({ message: 'Observações internas salvas com sucesso!', type: 'success' });
  };

  // Badge render styling
  const getStatusBadge = (status: CardapioItem['status']) => {
    switch (status) {
      case 'Entradas':
        return <Badge variant="primary">Entradas</Badge>;
      case 'Autorizados':
        return <Badge variant="success">Autorizados</Badge>;
      case 'Rejeitados':
        return <Badge variant="warning">Rejeitados</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get File Type Icon
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') {
      return <FileText className="h-8 w-8 text-rose-500" />;
    } else if (type === 'docx' || type === 'doc') {
      return <FileSpreadsheet className="h-8 w-8 text-blue-500" />;
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(type)) {
      return <FileCode className="h-8 w-8 text-emerald-500" />;
    }
    return <FileText className="h-8 w-8 text-slate-400" />;
  };

  return (
    <PageContainer id="biblioteca-page-container">
      <Breadcrumb
        items={selectedItem
          ? [
              { label: 'Biblioteca de Cardápios', onClick: () => setSelectedItem(null) },
              { label: selectedItem.nomeEstabelecimento, active: true }
            ]
          : [
              { label: 'Biblioteca de Cardápios', active: true }
            ]
        }
        onHomeClick={selectedItem ? () => setSelectedItem(null) : undefined}
      />
      {/* Toast alert system */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn">
          <Toast
            message={toast.message}
            description={toast.type === 'success' ? 'Operação realizada com sucesso.' : 'Verifique os detalhes inseridos.'}
            type={toast.type === 'success' ? 'success' : toast.type === 'error' ? 'error' : 'info'}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* RENDER VIEW SWITCH: LIST VS DETAILS */}
      {!selectedItem ? (
        <>
          {/* Main List view */}
          <PageHeader
            title="Biblioteca de Cardápios"
            subtitle="Centralize, cadastre e gerencie os cardápios (PDF e Imagens) capturados em campo ou recebidos pelo Claude."
            badge="Fase 12"
            action={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border border-slate-200 bg-white p-1 rounded-xl shadow-2xs">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-slate-100 text-slate-800 font-bold'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Visualização em Lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-slate-100 text-slate-800 font-bold'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Visualização em Grade"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  variant="primary"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Novo Cardápio
                </Button>
              </div>
            }
          />
          {/* Filtros Globais */}
          <div className="mb-6">
            <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
          </div>

          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-900">Central de Inteligência de Cardápios</h4>
                <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                  Realize curadoria de produtos, valide correspondências e aprove cardápios para alimentar o funil comercial e as exportações do Radar C-Trade.
                </p>
              </div>
            </div>
            <div className="text-[10px] bg-blue-900 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 select-none">
              Mapeamento de SKUs Ativo
            </div>
          </div>

          {viewMode === 'list' ? (
            /* MAIN DATATABLE */
            <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100">
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nome do Estabelecimento</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Localização</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Data do Cardápio</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Origem</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Última Atualização</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                          {/* Nome do estabelecimento */}
                          <td className="px-5 py-4 font-bold text-slate-800 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-extrabold text-[11px] shrink-0">
                                {item.nomeEstabelecimento.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="hover:text-blue-900 transition-colors">{item.nomeEstabelecimento}</span>
                                <span className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">{item.fileName}</span>
                              </div>
                            </div>
                          </td>

                          {/* Localização */}
                          <td className="px-5 py-4 text-xs font-medium text-slate-600">
                            {item.cidade} - {item.estado}
                          </td>

                          {/* Categoria */}
                          <td className="px-5 py-4 text-xs">
                            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-bold">
                              {item.categoria}
                            </span>
                          </td>

                          {/* Data cardapio */}
                          <td className="px-5 py-4 text-xs text-slate-500 font-semibold">
                            {formatDate(item.dataCardapio)}
                          </td>

                          {/* Origem */}
                          <td className="px-5 py-4 text-xs">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              item.origem === 'Claude' 
                                ? 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md' 
                                : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md'
                            }`}>
                              {item.origem}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-xs text-center">
                            {getStatusBadge(item.status)}
                          </td>

                          {/* Última atualização */}
                          <td className="px-5 py-4 text-xs text-slate-500 font-semibold">
                            {formatDate(item.ultimaAtualizacao)}
                          </td>

                          {/* Ações */}
                          <td className="px-5 py-4 text-xs text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedItem(item)}
                              rightIcon={<ArrowRight className="h-3 w-3" />}
                            >
                              Ver Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12">
                          <EmptyState
                            title="Nenhum cardápio corresponde"
                            description="Não encontramos registros que correspondam aos termos de busca ou filtros ativos."
                            action={
                              <Button size="sm" variant="secondary" onClick={handleClearFilters}>
                                Limpar Todos os Filtros
                              </Button>
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination simulator */}
              <div className="flex items-center justify-between p-4 bg-slate-50/40 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                <span>
                  Mostrando <span className="text-slate-700 font-bold">{filteredItems.length}</span> de <span className="text-slate-700 font-bold">{items.length}</span> cardápios cadastrados
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  Acesso aos metadados do repositório
                </span>
              </div>
            </div>
          ) : (
            /* GRID VIEW (GRADE) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" id="biblioteca-grid-view">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const totalProducts = item.produtosIdentificados?.length || 0;
                  const portfolioProducts = item.produtosIdentificados?.filter(p => !p.notInCatalog).length || 0;
                  const coverage = totalProducts > 0 ? Math.round((portfolioProducts / totalProducts) * 100) : 0;
                  
                  return (
                    <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full group">
                      <div className="space-y-4">
                        {/* Top Row: Icon + Badges */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center text-blue-700 font-extrabold text-sm shrink-0">
                              {item.nomeEstabelecimento.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-900 transition-colors line-clamp-1">{item.nomeEstabelecimento}</h3>
                              <p className="text-[10px] text-slate-400 font-medium">{item.cidade} - {item.estado}</p>
                            </div>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>

                        {/* File Details */}
                        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100/50">
                          <div className="flex items-center gap-2 truncate">
                            {getFileIcon(item.fileType)}
                            <div className="truncate">
                              <p className="text-[11px] font-bold text-slate-700 truncate">{item.fileName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{item.fileType} • {item.fileSize}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.origem === 'Claude' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.origem}
                          </span>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                          <div className="bg-slate-50/40 p-2 rounded-lg border border-slate-100/30">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cobertura</span>
                            <span className="text-xs font-bold text-slate-800 block mt-0.5">{coverage}% do Portfólio</span>
                          </div>
                          <div className="bg-slate-50/40 p-2 rounded-lg border border-slate-100/30">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Qtd Produtos</span>
                            <span className="text-xs font-bold text-slate-800 block mt-0.5">{totalProducts} identificados</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Atualizado {formatDate(item.ultimaAtualizacao)}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedItem(item)}
                          rightIcon={<ArrowRight className="h-3 w-3" />}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12">
                  <EmptyState
                    title="Nenhum cardápio corresponde"
                    description="Não encontramos registros que correspondam aos termos de busca ou filtros ativos."
                    action={
                      <Button size="sm" variant="secondary" onClick={handleClearFilters}>
                        Limpar Todos os Filtros
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* DETAIL VIEW SCREEN */
        <div className="animate-fadeIn">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  {selectedItem.nomeEstabelecimento}
                </h1>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {selectedItem.origem}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-sans pl-8">
                Ficha detalhada do cardápio e metadados de auditoria.
              </p>
            </div>
            
            {/* Quick action button to trigger mock file download */}
            <div className="mt-4 md:mt-0 flex items-center gap-2 pl-8 md:pl-0">
              <span className="text-xs text-slate-400 font-bold uppercase mr-1">Status Atual:</span>
              <div>
                <select
                  value={detailStatus}
                  onChange={(e) => {
                    const nextVal = e.target.value as CardapioItem['status'];
                    if (nextVal === 'Rejeitados') {
                      setRejectionTargetId(selectedItem.id);
                      setIsRejectionModalOpen(true);
                    } else {
                      handleStatusChange(nextVal);
                    }
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer hover:bg-slate-50 shadow-2xs transition-colors"
                >
                  <option value="Entradas">Entradas</option>
                  <option value="Autorizados">Autorizados</option>
                  <option value="Rejeitados">Rejeitados</option>
                </select>
              </div>
            </div>
          </div>

          {/* RESUMO COMERCIAL (KPIs) EXECUTIVE PANEL */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="p-4 flex flex-col justify-between shadow-2xs border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Categorias</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-extrabold text-slate-800">
                  {Array.from(new Set(selectedItem.produtosIdentificados?.map(p => p.category).filter(Boolean))).length}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">identificadas</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between shadow-2xs border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Produtos Totais</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-extrabold text-slate-800">
                  {selectedItem.produtosIdentificados?.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">identificados</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between shadow-2xs border-slate-100">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">No Portfólio</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-extrabold text-emerald-600">
                  {selectedItem.produtosIdentificados?.filter(p => !p.notInCatalog).length || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">mapeados</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between shadow-2xs border-slate-100">
              <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Fora do Portfólio</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-extrabold text-orange-600">
                  {selectedItem.produtosIdentificados?.filter(p => p.notInCatalog).length || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">pendentes</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between shadow-2xs border-slate-100">
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Cobertura</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-extrabold text-blue-600">
                  {selectedItem.produtosIdentificados && selectedItem.produtosIdentificados.length > 0
                    ? Math.round((selectedItem.produtosIdentificados.filter(p => !p.notInCatalog).length / selectedItem.produtosIdentificados.length) * 100)
                    : 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">do catálogo</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between shadow-2xs border-slate-100">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Potencial</span>
              <div className="mt-2">
                <span className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  (() => {
                    const total = selectedItem.produtosIdentificados?.length || 0;
                    const match = selectedItem.produtosIdentificados?.filter(p => !p.notInCatalog).length || 0;
                    const cov = total > 0 ? (match / total) * 100 : 0;
                    if (cov >= 75) return 'bg-emerald-50 text-emerald-800';
                    if (cov >= 50) return 'bg-blue-50 text-blue-800';
                    return 'bg-amber-50 text-amber-800';
                  })()
                }`}>
                  {(() => {
                    const total = selectedItem.produtosIdentificados?.length || 0;
                    const match = selectedItem.produtosIdentificados?.filter(p => !p.notInCatalog).length || 0;
                    const cov = total > 0 ? (match / total) * 100 : 0;
                    if (cov >= 75) return 'Estratégico';
                    if (cov >= 50) return 'Alto';
                    return 'Médio';
                  })()}
                </span>
              </div>
            </Card>
          </div>

          {/* TWO COLUMNS LAYOUT FOR DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: CURATION OF SKUS, PENDING PRODUCTS, GENERAL DATA (Span 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SECTION: SKUs CURATION ZONE (PRODUTOS ENCONTRADOS NO PORTFÓLIO) */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-800">Produtos Identificados no Portfólio C-Trade</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold">Organização oficial de correspondência: Categoria ↓ Marca ↓ Produto.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => setIsAddProductModalOpen(true)}
                  >
                    Adicionar Item Manual
                  </Button>
                </div>

                <div className="space-y-6">
                  {(() => {
                    const homologated = selectedItem.produtosIdentificados?.filter(p => !p.notInCatalog) || [];
                    const groups: Record<string, Record<string, IdentifiedProduct[]>> = {};
                    homologated.forEach(p => {
                      const cat = p.category || 'Outras Categorias';
                      const b = p.brand || 'Sem Marca';
                      if (!groups[cat]) groups[cat] = {};
                      if (!groups[cat][b]) groups[cat][b] = [];
                      groups[cat][b].push(p);
                    });

                    if (homologated.length === 0) {
                      return (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <p className="text-xs text-slate-400 italic">Nenhum SKU do catálogo homologado neste cardápio ainda.</p>
                        </div>
                      );
                    }

                    return Object.entries(groups).map(([cat, brands]) => (
                      <div key={cat} className="space-y-3.5 border-l-2 border-slate-100 pl-4 py-1">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Categoria: {cat}
                        </h4>
                        
                        {Object.entries(brands).map(([brand, products]) => (
                          <div key={brand} className="pl-4 space-y-2">
                            <h5 className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-extrabold mr-1">MARCA</span>
                              {brand}
                            </h5>
                            
                            <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {products.map(p => (
                                <div key={p.id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between group/prod relative">
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="text-xs font-semibold text-slate-800">{p.nomeNoCardapio}</span>
                                      <Badge variant="success">Homologado</Badge>
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-400 font-medium">
                                      Mapeado para: <span className="text-slate-600 font-bold">{p.productName}</span>
                                    </div>
                                    {p.observacao && (
                                      <p className="text-[10px] text-slate-500 mt-1.5 italic bg-white p-1.5 rounded-md border border-slate-100/50">
                                        "{p.observacao}"
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="mt-3 pt-2 border-t border-slate-100/50 flex items-center justify-between">
                                    <span className="text-[9px] text-slate-400 font-bold">Confiança: {p.confidence ? `${Math.round(p.confidence * 100)}%` : 'Manual'}</span>
                                    <button
                                      onClick={() => {
                                        const updatedProducts = selectedItem.produtosIdentificados?.map(prod => {
                                          if (prod.id === p.id) {
                                            return {
                                              ...prod,
                                              notInCatalog: true,
                                              status: 'Pendente' as const,
                                              productId: undefined,
                                              productName: undefined,
                                              brand: undefined,
                                              category: undefined,
                                              confidence: 1.0,
                                              observacao: 'Mapeamento removido pelo curador.'
                                            };
                                          }
                                          return prod;
                                        }) || [];
                                        
                                        const todayStr = new Date().toISOString().split('T')[0];
                                        const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);
                                        
                                        const updatedItem = {
                                          ...selectedItem,
                                          produtosIdentificados: updatedProducts,
                                          ultimaAtualizacao: todayStr,
                                          historico: [
                                            {
                                              id: `h-unmap-${Date.now()}`,
                                              data: `${todayStr} ${timeStr}`,
                                              usuario: 'Marcelo Baquero (Você)',
                                              acao: `Removido mapeamento de catálogo do prato "${p.nomeNoCardapio}".`
                                            },
                                            ...selectedItem.historico
                                          ]
                                        };
                                        
                                        const updatedList = items.map(it => it.id === selectedItem.id ? updatedItem : it);
                                        saveItemsToStorage(updatedList);
                                        setSelectedItem(updatedItem);
                                        setToast({ message: `Mapeamento de ${p.nomeNoCardapio} revertido.`, type: 'info' });
                                      }}
                                      className="text-[10px] text-rose-600 font-bold hover:underline"
                                    >
                                      Desvincular
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </Card>

              {/* SECTION: PRODUTOS NÃO ENCONTRADOS / PENDENTES DE HOMOLOGAÇÃO */}
              <Card>
                <div className="flex flex-col gap-0.5 border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <h3 className="text-sm font-bold text-slate-800">Produtos Não Encontrados no Catálogo</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold">Ingredientes do cardápio sem SKU correspondente. Mapeie para um SKU oficial ou descarte para continuar.</p>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const pending = selectedItem.produtosIdentificados?.filter(p => p.notInCatalog) || [];
                    if (pending.length > 0) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pending.map(p => (
                            <div key={p.id} className="bg-orange-50/20 border border-orange-100 rounded-xl p-4 flex flex-col justify-between h-full">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-800">{p.nomeNoCardapio}</span>
                                  <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-extrabold text-orange-800 ring-1 ring-inset ring-orange-800/20 uppercase tracking-wider">
                                    Pendente
                                  </span>
                                </div>
                                <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 bg-rose-50/50 p-1.5 rounded border border-rose-100/50">
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  Produto não encontrado no portfólio.
                                </p>
                                {p.observacao && (
                                  <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
                                    "{p.observacao}"
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between gap-2">
                                <span className="text-[9px] text-slate-400 font-bold">Confiança: {p.confidence ? `${Math.round(p.confidence * 100)}%` : 'Manual'}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setMappingTargetProduct(p);
                                      setSelectedCatalogProductId('');
                                      setIsMappingModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 transition-colors shadow-2xs"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Homologar Manual
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updatedProducts = selectedItem.produtosIdentificados?.filter(prod => prod.id !== p.id) || [];
                                      const todayStr = new Date().toISOString().split('T')[0];
                                      const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);
                                      
                                      const updatedItem = {
                                        ...selectedItem,
                                        produtosIdentificados: updatedProducts,
                                        ultimaAtualizacao: todayStr,
                                        historico: [
                                          {
                                            id: `h-del-${Date.now()}`,
                                            data: `${todayStr} ${timeStr}`,
                                            usuario: 'Marcelo Baquero (Você)',
                                            acao: `Removido item não encontrado "${p.nomeNoCardapio}" do cardápio.`
                                          },
                                          ...selectedItem.historico
                                        ]
                                      };
                                      
                                      const updatedList = items.map(it => it.id === selectedItem.id ? updatedItem : it);
                                      saveItemsToStorage(updatedList);
                                      setSelectedItem(updatedItem);
                                      setToast({ message: `Item ${p.nomeNoCardapio} removido com sucesso.`, type: 'info' });
                                    }}
                                    className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px] hover:bg-slate-200 transition-colors border border-slate-200"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-5 text-center">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                          <h4 className="text-xs font-bold text-emerald-900">Nenhum produto pendente de homologação</h4>
                          <p className="text-[11px] text-emerald-700 mt-1">Todos os produtos identificados neste cardápio estão devidamente vinculados ao portfólio oficial.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </Card>

              {/* SECTION: FICHA TÉCNICA DETALHADA */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Ficha Técnica do Estabelecimento</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider select-none">
                    Metadados Oficiais
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Nome Fantasia:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{selectedItem.nomeEstabelecimento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Razão Social / Empresa:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{selectedItem.empresa || `${selectedItem.nomeEstabelecimento} Ltda.`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Cidade / Estado:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{selectedItem.cidade} - {selectedItem.estado}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Segmento:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{selectedItem.categoria}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Data de Transmissão / Envio:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{formatDate(selectedItem.dataCardapio)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Origem de Importação:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${selectedItem.origem === 'Claude' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                      {selectedItem.origem} {selectedItem.source ? `(Via ${selectedItem.source})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Responsável pela Análise:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{selectedItem.responsavelAnalise || 'Marcelo Baquero (Você)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Última Atualização:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block text-sm">{formatDate(selectedItem.ultimaAtualizacao)}</span>
                  </div>
                </div>

                {/* Technical hidden integration fields simulation display */}
                <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                    Parâmetros para Integrações Futuras (Claude / ERP)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-semibold block">externalId:</span>
                      <code className="text-slate-700 font-mono block mt-0.5">{selectedItem.externalId || `ext-uid-${selectedItem.id}`}</code>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">processingStatus:</span>
                      <span className="inline-flex items-center gap-1 font-mono text-slate-700 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {selectedItem.processingStatus || 'completed'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">receivedAt:</span>
                      <code className="text-slate-700 font-mono block mt-0.5">{selectedItem.receivedAt ? formatDate(selectedItem.receivedAt) : formatDate(selectedItem.dataCardapio)}</code>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card: Arquivo Anexado */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Arquivo Anexado</h3>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                      {getFileIcon(selectedItem.fileType)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 truncate max-w-sm">{selectedItem.fileName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {selectedItem.fileType} • {selectedItem.fileSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white flex-1 sm:flex-initial"
                      onClick={() => setToast({ message: `Simulando download do arquivo ${selectedItem.fileName}`, type: 'info' })}
                    >
                      Baixar Arquivo
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 sm:flex-initial"
                      onClick={() => setToast({ message: 'Visualização do anexo indisponível no momento.', type: 'info' })}
                    >
                      Visualizar
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Card: Observações Internas */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Observações Internas</h3>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <textarea
                    rows={4}
                    value={detailObservations}
                    onChange={(e) => setDetailObservations(e.target.value)}
                    placeholder="Adicione anotações sobre os produtos encontrados, anotações de ligações comerciais ou detalhes que ajudem na prospecção..."
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors resize-y leading-relaxed"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 italic font-semibold">
                      Última atualização em: {formatDate(selectedItem.ultimaAtualizacao)}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSaveObservations}
                    >
                      Salvar Observações
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* COLUMN 2: TIMELINE, CLAUDE CONFIG, AND HISTORY AUDIT */}
            <div className="space-y-6">
              
              {/* TIMELINE DE PROCESSAMENTO WIZARD */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-800">Timeline de Processamento</h3>
                  </div>
                </div>

                <div className="relative pl-6 space-y-6">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-full w-0.5 bg-indigo-500" />
                    <span className="absolute -left-[33px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div>
                      <span className="text-[11px] font-bold text-indigo-900 block">1. Cardápio Enviado</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{formatDate(selectedItem.dataCardapio)}</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-full w-0.5 bg-indigo-500" />
                    <span className="absolute -left-[33px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div>
                      <span className="text-[11px] font-bold text-indigo-900 block">2. Processado</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{formatDate(selectedItem.dataCardapio)}</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-full w-0.5 bg-indigo-500" />
                    <span className="absolute -left-[33px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div>
                      <span className="text-[11px] font-bold text-indigo-900 block">3. Produtos Identificados</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Via Catálogo C-Trade</span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className={`absolute -left-[29px] top-1 h-full w-0.5 ${
                      selectedItem.status !== 'Entradas' ? 'bg-indigo-500' : 'bg-slate-200'
                    }`} />
                    <span className={`absolute -left-[33px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4 ring-white ${
                      selectedItem.status !== 'Entradas' ? 'bg-indigo-600' : 'bg-slate-300'
                    }`} />
                    <div>
                      <span className={`text-[11px] font-bold block ${
                        selectedItem.status !== 'Entradas' ? 'text-indigo-900' : 'text-slate-400'
                      }`}>4. Curadoria Comercial</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Validação Humana</span>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <span className={`absolute -left-[33px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4 ring-white ${
                      selectedItem.status === 'Autorizados'
                        ? 'bg-emerald-500'
                        : selectedItem.status === 'Rejeitados'
                        ? 'bg-rose-500'
                        : 'bg-slate-200'
                    }`} />
                    <div>
                      <span className={`text-[11px] font-bold block ${
                        selectedItem.status === 'Autorizados'
                          ? 'text-emerald-700'
                          : selectedItem.status === 'Rejeitados'
                          ? 'text-rose-700'
                          : 'text-slate-400'
                      }`}>5. Status: {selectedItem.status}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Finalização de Homologação</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* CARD PREPARAÇÃO CLAUDE API INTEGRATION PARAMETERS */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-800">Preparação Claude API</h3>
                  </div>
                  <Badge variant="primary">Pronto</Badge>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Esta seção estrutura as chaves e o payload prontos para serem integrados à API oficial do Claude AI.
                  </p>

                  <div className="bg-slate-900 p-3 rounded-xl text-[10px] font-mono text-indigo-300 overflow-x-auto space-y-2">
                    <div>
                      <span className="text-slate-400">// Configuração de Prompt</span>
                    </div>
                    <div>
                      <span className="text-amber-300">model</span>: "claude-3-5-sonnet-v2"
                    </div>
                    <div>
                      <span className="text-amber-300">temperature</span>: 0.1
                    </div>
                    <div>
                      <span className="text-amber-300">extractionConfidence</span>: {selectedItem.claudeConfidence || 94}%
                    </div>
                    <div>
                      <span className="text-amber-300">aiInsights</span>: "{selectedItem.claudeInsights || 'Análise de portfólio disponível.'}"
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mb-1">Payload JSON de Envio</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Quando ativo, o arquivo PDF do cardápio será enviado como Base64 no bloco de conteúdo multimodal do Claude para identificação e classificação de categorias.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Card: Histórico de Alterações */}
              <Card>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Histórico de Alterações</h3>
                  </div>
                </div>

                {/* Timeline vertical list */}
                <div className="relative border-l border-slate-100 ml-2.5 pl-5 space-y-5 py-2">
                  {selectedItem.historico && selectedItem.historico.length > 0 ? (
                    selectedItem.historico.map((log) => (
                      <div key={log.id} className="relative animate-fadeIn">
                        {/* Dot */}
                        <span className="absolute -left-[25.5px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white" />
                        
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-800">{log.usuario}</span>
                            <span className="text-[10px] text-slate-400 font-semibold shrink-0">{log.data}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                            {log.acao}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400 italic">Sem registros no histórico.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CARDÁPIO UPLOAD */}
      {isUploadModalOpen && (
        <Modal
          title="Cadastrar Novo Cardápio na Biblioteca"
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadedFile(null);
          }}
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-3">
              
              {/* Nome do estabelecimento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nome do Estabelecimento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMenu.nomeEstabelecimento}
                  onChange={(e) => setNewMenu({ ...newMenu, nomeEstabelecimento: e.target.value })}
                  placeholder="Ex: Trattoria Siciliana"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Cidade & Estado row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cidade <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMenu.cidade}
                    onChange={(e) => setNewMenu({ ...newMenu, cidade: e.target.value })}
                    placeholder="Ex: Campinas"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newMenu.estado}
                    onChange={(e) => setNewMenu({ ...newMenu, estado: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {estadosBR.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categoria select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Categoria de Gastronomia <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newMenu.categoria}
                  onChange={(e) => setNewMenu({ ...newMenu, categoria: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {categoriasGourmet.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Upload area */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Arquivo do Cardápio (PDF, PNG ou JPG) <span className="text-rose-500">*</span>
                </label>
                <Upload
                  onFileSelect={(file) => setUploadedFile(file)}
                  acceptedTypes=".pdf,.png,.jpg,.jpeg,.docx"
                  maxSizeMB={8}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!uploadedFile}
              >
                Salvar Cardápio
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Justificativa de Rejeição */}
      <Modal
        isOpen={isRejectionModalOpen}
        onClose={() => {
          setIsRejectionModalOpen(false);
          setRejectionTargetId(null);
          setRejectionReasonInput('');
        }}
        title="Justificativa de Rejeição"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => {
              setIsRejectionModalOpen(false);
              setRejectionTargetId(null);
              setRejectionReasonInput('');
            }}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectionReasonInput.trim()}
              onClick={() => {
                if (!rejectionReasonInput.trim()) return;

                const targetId = rejectionTargetId;
                const reason = rejectionReasonInput.trim();

                const itemToReject = items.find(it => it.id === targetId);
                if (itemToReject) {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

                  const updatedHistorico = [
                    {
                      id: `h-status-${Date.now()}`,
                      data: `${todayStr} ${timeStr}`,
                      usuario: 'Marcelo Baquero (Você)',
                      acao: `Registro REJEITADO. Motivo: ${reason}`
                    },
                    ...itemToReject.historico
                  ];

                  const updatedItem: CardapioItem = {
                    ...itemToReject,
                    status: 'Rejeitados',
                    rejectionReason: reason,
                    ultimaAtualizacao: todayStr,
                    historico: updatedHistorico
                  };

                  const updatedList = items.map((it) => (it.id === targetId ? updatedItem : it));
                  saveItemsToStorage(updatedList);

                  if (selectedItem && selectedItem.id === targetId) {
                    setSelectedItem(updatedItem);
                    setDetailStatus('Rejeitados');
                  }

                  // Push to ctrade_rejected_records for reports
                  try {
                    const existing = localStorage.getItem('ctrade_rejected_records');
                    const records = existing ? JSON.parse(existing) : [];
                    const isDuplicate = records.some((r: any) => r.id === targetId);
                    if (!isDuplicate) {
                      records.push({
                        id: targetId,
                        clientName: itemToReject.nomeEstabelecimento,
                        file: itemToReject.fileName || 'Sem arquivo',
                        date: new Date().toLocaleDateString('pt-BR'),
                        user: 'Marcelo Baquero (Você)',
                        reason: reason,
                        status: 'Rejeitados',
                        responsible: 'Marcelo Baquero (Você)'
                      });
                      localStorage.setItem('ctrade_rejected_records', JSON.stringify(records));
                    }
                  } catch (e) {
                    console.error(e);
                  }

                  setToast({ message: 'Cardápio rejeitado com justificativa gravada.', type: 'success' });
                }

                setIsRejectionModalOpen(false);
                setRejectionTargetId(null);
                setRejectionReasonInput('');
              }}
            >
              Confirmar Rejeição
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans">
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            A rejeição de um cardápio/registro de estabelecimento exige obrigatoriamente um motivo claro. Esse motivo alimentará os relatórios e a auditoria do Radar C-Trade.
          </p>
          <div className="mt-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motivo da Rejeição <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="Descreva detalhadamente a razão pela qual este cardápio foi rejeitado (ex: ilegível, estabelecimento fechado, cardápio incompleto, etc)..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: MAPEAR PRODUTO AO PORTFÓLIO */}
      {isMappingModalOpen && mappingTargetProduct && (
        <Modal
          title={`Mapear "${mappingTargetProduct.nomeNoCardapio}" ao Catálogo`}
          isOpen={isMappingModalOpen}
          onClose={() => {
            setIsMappingModalOpen(false);
            setMappingTargetProduct(null);
            setSelectedCatalogProductId('');
          }}
        >
          <div className="space-y-4 font-sans text-slate-800">
            <p className="text-xs text-slate-500 leading-relaxed">
              Selecione o produto correspondente do catálogo oficial de importados C-Trade para homologar este item do cardápio.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Item do Cardápio Selecionado:
              </label>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                {mappingTargetProduct.nomeNoCardapio}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Produto Oficial C-Trade <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCatalogProductId}
                onChange={(e) => setSelectedCatalogProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                <option value="">-- Selecionar Produto do Portfólio --</option>
                {REAL_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    [{prod.brand}] {prod.name} ({prod.category}) - SKU: {prod.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsMappingModalOpen(false);
                  setMappingTargetProduct(null);
                  setSelectedCatalogProductId('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedCatalogProductId}
                onClick={() => {
                  const catalogProduct = REAL_PRODUCTS.find(p => p.id === selectedCatalogProductId);
                  if (!catalogProduct || !selectedItem) return;

                  const updatedProducts = selectedItem.produtosIdentificados?.map((prod) => {
                    if (prod.id === mappingTargetProduct.id) {
                      return {
                        ...prod,
                        notInCatalog: false,
                        status: 'Homologado' as const,
                        productId: catalogProduct.id,
                        productName: catalogProduct.name,
                        brand: catalogProduct.brand,
                        category: catalogProduct.category,
                        confidence: 1.0, // Manual human validation is 100%
                        observacao: `Mapeado manualmente para o SKU ${catalogProduct.sku}.`
                      };
                    }
                    return prod;
                  }) || [];

                  const todayStr = new Date().toISOString().split('T')[0];
                  const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

                  const updatedItem = {
                    ...selectedItem,
                    produtosIdentificados: updatedProducts,
                    ultimaAtualizacao: todayStr,
                    historico: [
                      {
                        id: `h-map-${Date.now()}`,
                        data: `${todayStr} ${timeStr}`,
                        usuario: 'Marcelo Baquero (Você)',
                        acao: `Homologado o prato "${mappingTargetProduct.nomeNoCardapio}" para o SKU "${catalogProduct.sku}" - ${catalogProduct.name}.`
                      },
                      ...selectedItem.historico
                    ]
                  };

                  const updatedList = items.map(it => it.id === selectedItem.id ? updatedItem : it);
                  saveItemsToStorage(updatedList);
                  setSelectedItem(updatedItem);
                  
                  setIsMappingModalOpen(false);
                  setMappingTargetProduct(null);
                  setSelectedCatalogProductId('');
                  setToast({ message: `Prato ${mappingTargetProduct.nomeNoCardapio} homologado com sucesso!`, type: 'success' });
                }}
              >
                Confirmar Homologação
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ADICIONAR PRODUTO MANUALMENTE */}
      {isAddProductModalOpen && (
        <Modal
          title="Adicionar Novo Item ao Cardápio"
          isOpen={isAddProductModalOpen}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setNewProductName('');
            setNewProductCatalogId('');
          }}
        >
          <div className="space-y-4 font-sans text-slate-800">
            <p className="text-xs text-slate-500 leading-relaxed">
              Adicione um novo ingrediente ou prato encontrado no cardápio do cliente e vincule-o opcionalmente ao catálogo C-Trade.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome do Item no Cardápio <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Ex: Risoto de Funghi Seco"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mapear ao Catálogo C-Trade (Opcional):
              </label>
              <select
                value={newProductCatalogId}
                onChange={(e) => setNewProductCatalogId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                <option value="">-- Não mapear agora (Fica pendente de homologação) --</option>
                {REAL_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    [{prod.brand}] {prod.name} ({prod.category}) - SKU: {prod.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddProductModalOpen(false);
                  setNewProductName('');
                  setNewProductCatalogId('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!newProductName.trim()}
                onClick={() => {
                  if (!newProductName.trim() || !selectedItem) return;

                  let addedProduct: IdentifiedProduct;

                  if (newProductCatalogId) {
                    const catalogProduct = REAL_PRODUCTS.find(p => p.id === newProductCatalogId);
                    if (!catalogProduct) return;
                    
                    addedProduct = {
                      id: `id-man-${Date.now()}`,
                      nomeNoCardapio: newProductName.trim(),
                      productId: catalogProduct.id,
                      productName: catalogProduct.name,
                      brand: catalogProduct.brand,
                      category: catalogProduct.category,
                      notInCatalog: false,
                      status: 'Homologado',
                      confidence: 1.0,
                      observacao: `Adicionado e mapeado manualmente para o SKU ${catalogProduct.sku}.`
                    };
                  } else {
                    addedProduct = {
                      id: `id-man-${Date.now()}`,
                      nomeNoCardapio: newProductName.trim(),
                      notInCatalog: true,
                      status: 'Pendente',
                      confidence: 1.0,
                      observacao: 'Adicionado manualmente como pendente de homologação.'
                    };
                  }

                  const updatedProducts = [
                    ...(selectedItem.produtosIdentificados || []),
                    addedProduct
                  ];

                  const todayStr = new Date().toISOString().split('T')[0];
                  const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

                  const updatedItem = {
                    ...selectedItem,
                    produtosIdentificados: updatedProducts,
                    ultimaAtualizacao: todayStr,
                    historico: [
                      {
                        id: `h-add-${Date.now()}`,
                        data: `${todayStr} ${timeStr}`,
                        usuario: 'Marcelo Baquero (Você)',
                        acao: addedProduct.notInCatalog
                          ? `Adicionado o prato "${addedProduct.nomeNoCardapio}" como pendente de homologação.`
                          : `Adicionado e homologado o prato "${addedProduct.nomeNoCardapio}" para o SKU "${newProductCatalogId}".`
                      },
                      ...selectedItem.historico
                    ]
                  };

                  const updatedList = items.map(it => it.id === selectedItem.id ? updatedItem : it);
                  saveItemsToStorage(updatedList);
                  setSelectedItem(updatedItem);

                  setIsAddProductModalOpen(false);
                  setNewProductName('');
                  setNewProductCatalogId('');
                  setToast({ message: `Prato "${addedProduct.nomeNoCardapio}" adicionado com sucesso!`, type: 'success' });
                }}
              >
                Adicionar Item
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
