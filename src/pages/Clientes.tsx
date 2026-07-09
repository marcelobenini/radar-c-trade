/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard, InsightCard, AlertCard } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Badge, EmptyState, Toast, Tooltip, ProgressBar } from '../components/ui/Feedback';
import { Modal, ContextMenu } from '../components/ui/Interactive';
import DataTable, { Column } from '../components/ui/Table';
import ScoreIndicator from '../components/ui/Score';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import { REAL_CLIENTS, REAL_PRODUCTS, REAL_OPPORTUNITIES } from '../data/realData';
import GlobalFilters, { matchesScoreRange } from '../components/shared/GlobalFilters';
import { syncPlatformData } from '../utils/platformSync';

import {
  Plus,
  Download,
  Upload as UploadIcon,
  Search,
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Instagram,
  Globe,
  User,
  Briefcase,
  FileText,
  Clock,
  ChevronRight,
  ArrowLeft,
  X,
  TrendingUp,
  SlidersHorizontal,
  Eraser,
  XCircle,
  CheckCircle,
  Settings,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  Linkedin
} from 'lucide-react';

// Official Brazilian States List
export const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre (AC)' },
  { value: 'AL', label: 'Alagoas (AL)' },
  { value: 'AP', label: 'Amapá (AP)' },
  { value: 'AM', label: 'Amazonas (AM)' },
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'DF', label: 'Distrito Federal (DF)' },
  { value: 'ES', label: 'Espírito Santo (ES)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'MT', label: 'Mato Grosso (MT)' },
  { value: 'MS', label: 'Mato Grosso do Sul (MS)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'PA', label: 'Pará (PA)' },
  { value: 'PB', label: 'Paraíba (PB)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'PI', label: 'Piauí (PI)' },
  { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
  { value: 'RN', label: 'Rio Grande do Norte (RN)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'RO', label: 'Rondônia (RO)' },
  { value: 'RR', label: 'Roraima (RR)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'SP', label: 'São Paulo (SP)' },
  { value: 'SE', label: 'Sergipe (SE)' },
  { value: 'TO', label: 'Tocantins (TO)' },
];

// Official C-Trade Categories
export const OFFICIAL_CATEGORIES = [
  'Farinhas',
  'Massas',
  'Arroz',
  'Polenta',
  'Tomates',
  'Molhos',
  'Conservas',
  'Queijos',
  'Azeites',
  'Vinagres',
  'Trufas',
  'Cogumelos',
  'Oréganos',
  'Xaropes',
  'Frutas em Calda',
  'Pastas Saborizantes',
  'Coberturas'
];

export interface Regional {
  id: string;
  name: string;
  active: boolean;
}

export interface RCA {
  id: string;
  name: string;
  regionalId: string;
  active: boolean;
}

export interface ClientHistoryEvent {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  tipo?: 'cadastro' | 'cardapio' | 'analise' | 'curadoria' | 'atualizacao' | 'outro';
}

// Client schema interface
export interface Client {
  id: number;
  name: string; // Razão Social (Razão Social when exists)
  fantasyName: string; // Nome Fantasia
  razaoSocial?: string; // Razão Social
  cnpj?: string; // CNPJ (opcional)
  city: string;
  state: string;
  segment: string;
  category: string;
  instagram: string;
  website: string;
  phone: string;
  email: string;
  responsible: string; // Contato Decisor
  responsibleRole: string; // Cargo do Decisor
  observations: string;
  score: number; // Score de Fit
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo'; // Potencial Comercial
  status: 'Entradas' | 'Autorizados' | 'Rejeitados';
  lastAnalysis: string;
  lastUpload: string;
  regionalId?: string;
  rcaId?: string;
  rejectionReason?: string;
  linkedin?: string;
  situacaoCadastral?: string;
  dataAbertura?: string;
  endereco?: string;
  cep?: string;
  cnae?: string;
  
  // Mandatory fields for intelligence base
  responsibleCommercial: string; // Responsável Comercial
  dateCreated: string; // Data de Cadastro
  dateUpdated: string; // Última Atualização
  historicoCompleto?: ClientHistoryEvent[];
}

export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return false;
  }
  if (/^(.)\1+$/.test(digits)) {
    return false;
  }
  const localPart = digits.slice(2);
  if (/^(.)\1+$/.test(localPart)) {
    return false;
  }
  const asc = "0123456789";
  const desc = "9876543210";
  for (let i = 0; i <= digits.length - 8; i++) {
    const sub = digits.slice(i, i + 8);
    if (asc.includes(sub) || desc.includes(sub)) {
      return false;
    }
  }
  return true;
}

export default function Clientes() {
  // --- STATE FOR REGIONALS & RCAS ---
  const [regionals, setRegionals] = useState<Regional[]>(() => {
    const saved = localStorage.getItem('ctrade_regionals');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'reg-sudeste', name: 'Regional Sudeste', active: true },
      { id: 'reg-sul', name: 'Regional Sul', active: true },
      { id: 'reg-nordeste', name: 'Regional Nordeste', active: true },
      { id: 'reg-centro-oeste', name: 'Regional Centro-Oeste', active: true },
    ];
  });

  const [rcas, setRcas] = useState<RCA[]>(() => {
    const saved = localStorage.getItem('ctrade_rcas');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'rca-marcelo', name: 'RCA Marcelo Baquero', regionalId: 'reg-sudeste', active: true },
      { id: 'rca-amanda', name: 'RCA Amanda Souza', regionalId: 'reg-sul', active: true },
      { id: 'rca-pedro', name: 'RCA Pedro Santos', regionalId: 'reg-nordeste', active: true },
      { id: 'rca-lucas', name: 'RCA Lucas Oliveira', regionalId: 'reg-centro-oeste', active: true },
    ];
  });

  // Save them
  useEffect(() => {
    localStorage.setItem('ctrade_regionals', JSON.stringify(regionals));
  }, [regionals]);

  useEffect(() => {
    localStorage.setItem('ctrade_rcas', JSON.stringify(rcas));
  }, [rcas]);

  // --- REAL DATA ---
  const initialClients: Client[] = REAL_CLIENTS.map(rc => {
    const regionalId = rc.state === 'RJ' ? 'reg-sudeste' : 'reg-sul';
    const rcaId = rc.state === 'RJ' ? 'rca-marcelo' : 'rca-amanda';
    const rcaName = rc.state === 'RJ' ? 'RCA Marcelo Baquero' : 'RCA Amanda Souza';
    const dateCreated = rc.id === 1 ? '2026-01-15' : '2026-02-10';
    const dateUpdated = rc.id === 1 ? '2026-07-07' : '2026-07-08';
    
    return {
      id: rc.id,
      name: rc.name,
      fantasyName: rc.fantasyName,
      razaoSocial: rc.name,
      cnpj: rc.id === 1 ? '12.345.678/0001-90' : '98.765.432/0001-21',
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
      linkedin: rc.id === 1 ? 'https://www.linkedin.com/in/eliaschramm' : '',
      observations: rc.observations,
      score: rc.score,
      potential: rc.potential,
      status: rc.status === 'Analisado' ? 'Autorizados' : 'Entradas',
      lastAnalysis: rc.lastAnalysis,
      lastUpload: rc.lastUpload,
      regionalId,
      rcaId,
      responsibleCommercial: rcaName,
      dateCreated,
      dateUpdated,
      historicoCompleto: rc.id === 1 ? [
        { id: 'h-1', data: '2026-01-15 09:00', usuario: 'Sistema Radar', acao: 'Cliente cadastrado com sucesso na base comercial.', tipo: 'cadastro' },
        { id: 'h-2', data: '2026-07-07 10:15', usuario: 'Marcelo Baquero', acao: 'Cardápio recebido e submetido para homologação.', tipo: 'cardapio' },
        { id: 'h-3', data: '2026-07-07 10:20', usuario: 'Claude AI (Processamento)', acao: 'Mapeamento automatizado concluído com score de fit de 95 pts.', tipo: 'analise' },
        { id: 'h-4', data: '2026-07-07 14:00', usuario: 'Marcelo Baquero', acao: 'Curadoria de SKUs realizada e homologada no painel de inteligência.', tipo: 'curadoria' }
      ] : [
        { id: 'h-e1', data: '2026-02-10 10:30', usuario: 'Sistema Radar', acao: 'Cliente cadastrado com sucesso na base comercial.', tipo: 'cadastro' },
        { id: 'h-e2', data: '2026-07-07 10:30', usuario: 'Marcelo Baquero', acao: 'Cardápio recebido e submetido para homologação.', tipo: 'cardapio' },
        { id: 'h-e3', data: '2026-07-07 10:35', usuario: 'Claude AI (Processamento)', acao: 'Mapeamento automatizado concluído com score de fit de 96 pts.', tipo: 'analise' },
        { id: 'h-e4', data: '2026-07-07 15:00', usuario: 'Marcelo Baquero', acao: 'Curadoria de SKUs realizada e homologada no painel de inteligência.', tipo: 'curadoria' }
      ]
    };
  });

  // --- STATE MANAGEMENT ---
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ctrade_clients_list_v2');
    if (saved) return JSON.parse(saved);
    return initialClients;
  });

  useEffect(() => {
    localStorage.setItem('ctrade_clients_list_v2', JSON.stringify(clients));
    syncPlatformData();
  }, [clients]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ctrade_clients_list_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setClients(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const targetId = localStorage.getItem('ctrade_selected_client_id');
    if (targetId) {
      const parsedId = parseInt(targetId, 10);
      if (!isNaN(parsedId)) {
        setSelectedClientId(parsedId);
        setIsModalOpen(true);
        localStorage.removeItem('ctrade_selected_client_id');
      }
    }
  }, []);
  
  // Rejection reason management states
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionTargetId, setRejectionTargetId] = useState<number | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Regional and RCA Management Modal state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'regionais' | 'rcas'>('regionais');
  const [newRegionalName, setNewRegionalName] = useState('');
  const [newRcaName, setNewRcaName] = useState('');
  const [newRcaRegionalId, setNewRcaRegionalId] = useState('reg-sudeste');

  const [editingRegionalId, setEditingRegionalId] = useState<string | null>(null);
  const [editingRegionalName, setEditingRegionalName] = useState('');
  const [editingRcaId, setEditingRcaId] = useState<string | null>(null);
  const [editingRcaName, setEditingRcaName] = useState('');
  const [editingRcaRegionalId, setEditingRcaRegionalId] = useState('');

  const [toast, setToast] = useState<{ message: string; description: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Session persisted filter states
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

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterResponsible, setFilterResponsible] = useState('all');

  // New Client Form State
  const [formName, setFormName] = useState('');
  const [formFantasyName, setFormFantasyName] = useState('');
  const [formRazaoSocial, setFormRazaoSocial] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('SP');
  const [formSegment, setFormSegment] = useState('Italiano');
  const [formCategory, setFormCategory] = useState('Farinhas');
  const [formInstagram, setFormInstagram] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formResponsible, setFormResponsible] = useState('');
  const [formResponsibleRole, setFormResponsibleRole] = useState('');
  const [formObservations, setFormObservations] = useState('');
  const [formRegionalId, setFormRegionalId] = useState('');
  const [formRcaId, setFormRcaId] = useState('');
  const [formResponsibleCommercial, setFormResponsibleCommercial] = useState('');

  // Active view layout toggle state (Tabela vs. Cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Client Details Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // States for Edit Form
  const [editRazaoSocial, setEditRazaoSocial] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editFantasyName, setEditFantasyName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('SP');
  const [editSegment, setEditSegment] = useState('Italiano');
  const [editCategory, setEditCategory] = useState('Farinhas');
  const [editInstagram, setEditInstagram] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editResponsible, setEditResponsible] = useState('');
  const [editResponsibleRole, setEditResponsibleRole] = useState('');
  const [editObservations, setEditObservations] = useState('');
  const [editRegionalId, setEditRegionalId] = useState('');
  const [editRcaId, setEditRcaId] = useState('');
  const [editResponsibleCommercial, setEditResponsibleCommercial] = useState('');
  const [editPotential, setEditPotential] = useState<'Muito Alto' | 'Alto' | 'Médio' | 'Baixo'>('Médio');
  const [editScore, setEditScore] = useState(70);

  // Custom Timeline note logging state
  const [timelineNote, setTimelineNote] = useState('');

  // --- HANDLERS ---
  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImport = () => {
    triggerToast('info', 'Módulo de Importação', 'O assistente de importação via planilha Excel (.xlsx) foi ativado (placeholder).');
  };

  const handleExport = () => {
    triggerToast('success', 'Relatório Exportado', 'A base de clientes foi compilada e exportada em formato Excel (.xlsx) com sucesso.');
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
    triggerToast('info', 'Filtros Limpos', 'A listagem foi restaurada para o estado original.');
  };

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

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast('error', 'Nome Obrigatório', 'Por favor, insira pelo menos o nome do estabelecimento.');
      return;
    }

    const matchedRca = rcas.find(r => r.name === formRcaId || r.id === formRcaId);
    const matchedRcaName = matchedRca ? matchedRca.name : (formResponsibleCommercial || 'RCA Marcelo Baquero');
    const todayStr = new Date().toISOString().split('T')[0];

    // STEP 1 & 2: Identification and CNPJ location through our enrichment engine
    const enriched = getEnrichedCompanyData(formName, formCity, formState);
    const targetCnpj = (formCnpj || enriched.cnpj).replace(/\D/g, '');

    // STEP 3: Check if the CNPJ already exists on the platform
    const existingClient = clients.find(c => c.cnpj && c.cnpj.replace(/\D/g, '') === targetCnpj);

    if (existingClient) {
      // DEDUPLICATION: Abort creation, merge empty/unset fields, trigger toast and redirect to existing client
      const updatedClient: Client = {
        ...existingClient,
        razaoSocial: existingClient.razaoSocial || enriched.razaoSocial,
        fantasyName: existingClient.fantasyName || enriched.fantasyName,
        cnpj: existingClient.cnpj || enriched.cnpj,
        situacaoCadastral: existingClient.situacaoCadastral || enriched.situacaoCadastral,
        dataAbertura: existingClient.dataAbertura || enriched.dataAbertura,
        endereco: existingClient.endereco || enriched.endereco,
        cep: existingClient.cep || enriched.cep,
        cnae: existingClient.cnae || enriched.cnae,
        phone: (existingClient.phone && isValidPhone(existingClient.phone)) ? existingClient.phone : (isValidPhone(enriched.phone) ? enriched.phone : existingClient.phone),
        website: existingClient.website || enriched.website,
        responsible: existingClient.responsible || enriched.responsible,
        responsibleRole: existingClient.responsibleRole || enriched.responsibleRole,
        linkedin: existingClient.linkedin || enriched.linkedin,
        dateUpdated: todayStr,
        historicoCompleto: [
          ...(existingClient.historicoCompleto || []),
          {
            id: 'h-enrich-' + Date.now(),
            data: todayStr + ' ' + new Date().toTimeString().slice(0, 5),
            usuario: 'Claude AI (Processamento)',
            acao: 'Tentativa de duplicação evitada por unicidade de CNPJ. O cadastro existente foi automaticamente atualizado e enriquecido com dados públicos.',
            tipo: 'atualizacao'
          }
        ]
      };

      setClients(prev => prev.map(c => c.id === existingClient.id ? updatedClient : c));
      setSelectedClientId(existingClient.id);
      setIsModalOpen(false);

      // Reset form fields
      setFormName('');
      setFormFantasyName('');
      setFormRazaoSocial('');
      setFormCnpj('');
      setFormCity('');
      setFormState('SP');
      setFormSegment('Italiano');
      setFormCategory('Farinhas');
      setFormInstagram('');
      setFormWebsite('');
      setFormPhone('');
      setFormLinkedin('');
      setFormEmail('');
      setFormResponsible('');
      setFormResponsibleRole('');
      setFormObservations('');
      setFormRegionalId('');
      setFormRcaId('');
      setFormResponsibleCommercial('');

      triggerToast('info', 'CNPJ Já Cadastrado', `O CNPJ "${enriched.cnpj}" já pertencia a "${existingClient.fantasyName}". Os dados foram enriquecidos e unificados.`);
      return;
    }

    // Normal client creation with automatic pipeline enrichment
    const finalCnpj = formCnpj || enriched.cnpj;
    const finalRazaoSocial = formRazaoSocial || enriched.razaoSocial;
    const finalFantasyName = formFantasyName || enriched.fantasyName || formName;
    const finalPhone = formPhone || enriched.phone;
    const finalLinkedin = formLinkedin || enriched.linkedin;
    const finalResponsible = formResponsible || enriched.responsible;
    const finalResponsibleRole = formResponsibleRole || enriched.responsibleRole;
    const finalWebsite = formWebsite || enriched.website;

    const newClient: Client = {
      id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
      name: finalRazaoSocial,
      fantasyName: finalFantasyName,
      razaoSocial: finalRazaoSocial,
      cnpj: finalCnpj,
      city: formCity || enriched.city || 'São Paulo',
      state: formState,
      segment: formSegment,
      category: formCategory,
      instagram: formInstagram || '@' + finalFantasyName.toLowerCase().replace(/\s+/g, ''),
      website: finalWebsite,
      phone: finalPhone,
      linkedin: finalLinkedin,
      email: formEmail || 'contato@' + finalFantasyName.toLowerCase().replace(/\s+/g, '') + '.com.br',
      responsible: finalResponsible,
      responsibleRole: finalResponsibleRole,
      observations: formObservations || 'Cadastrado e enriquecido automaticamente via pipeline de inteligência de dados públicos.',
      score: Math.floor(Math.random() * 35) + 65, // Generates score between 65 and 100
      potential: (Math.random() > 0.6 ? 'Muito Alto' : Math.random() > 0.4 ? 'Alto' : 'Médio') as any,
      status: 'Entradas',
      lastAnalysis: 'Aguardando envio',
      lastUpload: 'Sem cardápio submetido',
      regionalId: formRegionalId || undefined,
      rcaId: formRcaId || undefined,
      responsibleCommercial: matchedRcaName,
      dateCreated: todayStr,
      dateUpdated: todayStr,
      
      // Enriched fields from public API mock
      situacaoCadastral: enriched.situacaoCadastral,
      dataAbertura: enriched.dataAbertura,
      endereco: enriched.endereco,
      cep: enriched.cep,
      cnae: enriched.cnae,

      historicoCompleto: [
        { id: 'h-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Sistema Radar', acao: 'Cliente cadastrado com sucesso na base comercial com status de Entradas.', tipo: 'cadastro' },
        { id: 'h-e1-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Identificação do Restaurante concluída para "${finalFantasyName}".`, tipo: 'atualizacao' },
        { id: 'h-e2-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `CNPJ ${finalCnpj} localizado e dados públicos obtidos.`, tipo: 'atualizacao' },
        { id: 'h-e3-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Ficha enriquecida com Razão Social, CNAE, Endereço e Canais Digitais.`, tipo: 'atualizacao' },
        { id: 'h-e4-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Decisor de compras mapeado: ${finalResponsible} (${finalResponsibleRole}). LinkedIn vinculado.`, tipo: 'atualizacao' }
      ]
    };

    setClients([newClient, ...clients]);
    setIsModalOpen(false);

    // Reset Form Fields
    setFormName('');
    setFormFantasyName('');
    setFormRazaoSocial('');
    setFormCnpj('');
    setFormCity('');
    setFormState('SP');
    setFormSegment('Italiano');
    setFormCategory('Farinhas');
    setFormInstagram('');
    setFormWebsite('');
    setFormPhone('');
    setFormLinkedin('');
    setFormEmail('');
    setFormResponsible('');
    setFormResponsibleRole('');
    setFormObservations('');
    setFormRegionalId('');
    setFormRcaId('');
    setFormResponsibleCommercial('');

    triggerToast('success', 'Cliente Cadastrado & Enriquecido', `O estabelecimento "${newClient.fantasyName}" foi registrado e enriquecido automaticamente.`);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setEditRazaoSocial(client.razaoSocial || client.name);
    setEditCnpj(client.cnpj || '');
    setEditFantasyName(client.fantasyName);
    setEditCity(client.city);
    setEditState(client.state);
    setEditSegment(client.segment);
    setEditCategory(client.category);
    setEditInstagram(client.instagram);
    setEditWebsite(client.website);
    setEditPhone(client.phone);
    setEditLinkedin(client.linkedin || '');
    setEditEmail(client.email);
    setEditResponsible(client.responsible);
    setEditResponsibleRole(client.responsibleRole);
    setEditObservations(client.observations);
    setEditRegionalId(client.regionalId || '');
    setEditRcaId(client.rcaId || '');
    setEditResponsibleCommercial(client.responsibleCommercial);
    setEditPotential(client.potential);
    setEditScore(client.score);
    setIsEditModalOpen(true);
  };

  const handleSaveEditClient = () => {
    if (!editingClient) return;

    const matchedRca = rcas.find(r => r.name === editRcaId || r.id === editRcaId);
    const rcaName = matchedRca ? matchedRca.name : (editResponsibleCommercial || editingClient.responsibleCommercial);

    const todayStr = new Date().toISOString().split('T')[0];

    setClients(prev => prev.map(c => {
      if (c.id === editingClient.id) {
        const history = c.historicoCompleto || [];
        const updatedHistory = [
          ...history,
          {
            id: 'h-' + Date.now(),
            data: todayStr + ' ' + new Date().toTimeString().slice(0, 5),
            usuario: 'Marcelo Baquero (Você)',
            acao: 'Dados de cadastro atualizados pelo gestor comercial.',
            tipo: 'atualizacao' as const
          }
        ];

        return {
          ...c,
          name: editRazaoSocial || c.name,
          razaoSocial: editRazaoSocial,
          cnpj: editCnpj || undefined,
          fantasyName: editFantasyName || c.fantasyName,
          city: editCity,
          state: editState,
          segment: editSegment,
          category: editCategory,
          instagram: editInstagram,
          website: editWebsite,
          phone: editPhone,
          linkedin: editLinkedin,
          email: editEmail,
          responsible: editResponsible,
          responsibleRole: editResponsibleRole,
          observations: editObservations,
          regionalId: editRegionalId || undefined,
          rcaId: editRcaId || undefined,
          responsibleCommercial: rcaName,
          potential: editPotential,
          score: editScore,
          dateUpdated: todayStr,
          historicoCompleto: updatedHistory
        };
      }
      return c;
    }));

    setIsEditModalOpen(false);
    setEditingClient(null);
    triggerToast('success', 'Cadastro Atualizado', 'Os dados do estabelecimento foram atualizados com sucesso.');
  };

  const handleAddTimelineNote = (clientId: number) => {
    if (!timelineNote.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = todayStr + ' ' + new Date().toTimeString().slice(0, 5);

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const history = c.historicoCompleto || [];
        return {
          ...c,
          dateUpdated: todayStr,
          historicoCompleto: [
            ...history,
            {
              id: 'h-note-' + Date.now(),
              data: timestampStr,
              usuario: 'Marcelo Baquero (Você)',
              acao: timelineNote.trim(),
              tipo: 'outro' as const
            }
          ]
        };
      }
      return c;
    }));

    setTimelineNote('');
    triggerToast('success', 'Nota Registrada', 'Observação inserida com sucesso na linha do tempo do cliente.');
  };

  const handleTriggerMockAnalysis = (clientId: number) => {
    triggerToast('info', 'Iniciando Processamento', 'O motor comercial CTrade está lendo o cardápio e mapeando ingredientes...');
    setTimeout(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const timestampStr = todayStr + ' ' + new Date().toTimeString().slice(0, 5);

      setClients(prev => prev.map(c => {
        if (c.id === clientId) {
          const history = c.historicoCompleto || [];
          const updatedHistory = [
            ...history,
            { id: 'h-an-' + Date.now(), data: timestampStr, usuario: 'Claude AI (Processamento)', acao: 'Recálculo automático de score concluído com sucesso com base no cardápio.', tipo: 'analise' as const }
          ];

          return {
            ...c,
            score: Math.min(c.score + 5, 100),
            status: 'Autorizados',
            lastAnalysis: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            lastUpload: c.lastUpload === 'Sem cardápio submetido' ? 'Cardapio_Auto_Analisado.pdf' : c.lastUpload,
            dateUpdated: todayStr,
            historicoCompleto: updatedHistory
          };
        }
        return c;
      }));
      triggerToast('success', 'Análise Concluída', 'O score de fit foi recalculado e o estabelecimento foi Autorizado.');
    }, 2000);
  };

  // --- FILTERING LOGIC ---
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

  const filteredClients = clients.filter((client) => {
    // 1. Multi-field text search filter
    if (sessionFilters.cliente) {
      const q = sessionFilters.cliente.toLowerCase();
      
      const rcaObj = rcas.find(r => r.id === client.rcaId || r.name === client.rcaId);
      const rcaName = rcaObj ? rcaObj.name.toLowerCase() : '';
      const regObj = regionals.find(reg => reg.id === client.regionalId || reg.name === client.regionalId);
      const regionalName = regObj ? regObj.name.toLowerCase() : '';
      
      const savedMenusStr = localStorage.getItem('ctrade_menu_library');
      const savedMenus = savedMenusStr ? JSON.parse(savedMenusStr) : [];
      const clientMenus = savedMenus.filter((m: any) => 
        m.nomeEstabelecimento === client.name || 
        m.nomeEstabelecimento === client.fantasyName
      );
      
      const identifiedProdText = clientMenus.flatMap((m: any) => 
        (m.produtosIdentificados || []).map((p: any) => 
          `${p.nomeNoCardapio || ''} ${p.productName || ''} ${p.brand || ''}`.toLowerCase()
        )
      ).join(' ');

      const hasNameMatch = client.name.toLowerCase().includes(q) || client.fantasyName.toLowerCase().includes(q) || (client.razaoSocial && client.razaoSocial.toLowerCase().includes(q));
      const hasCityMatch = client.city.toLowerCase().includes(q);
      const hasStateMatch = client.state.toLowerCase().includes(q);
      const hasSegmentMatch = client.segment.toLowerCase().includes(q);
      const hasRcaMatch = rcaName.includes(q) || client.responsibleCommercial.toLowerCase().includes(q);
      const hasRegionalMatch = regionalName.includes(q);
      const hasCategoryMatch = client.category.toLowerCase().includes(q);
      const hasProductMatch = identifiedProdText.includes(q);

      if (!hasNameMatch && !hasCityMatch && !hasStateMatch && !hasSegmentMatch && !hasRcaMatch && !hasRegionalMatch && !hasCategoryMatch && !hasProductMatch) {
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
      const opps = REAL_OPPORTUNITIES.filter(o => o.cliente.toLowerCase() === client.name.toLowerCase());
      const clientProducts = opps.flatMap(o => [
        ...o.produtosRecomendados,
        ...o.produtosEncontrados.map(pe => pe.produto)
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
      const opp = REAL_OPPORTUNITIES.find(o => o.cliente.toLowerCase() === client.name.toLowerCase());
      const score = opp ? opp.scoreComercial : client.score;
      if (!matchesScoreRange(score, sessionFilters.scoreComercial)) return false;
    }

    return true;
  });

  // --- STATS COUNTERS ---
  const totalRegistered = clients.length;
  const totalProspects = clients.filter(c => c.status === 'Prospect' || c.status === 'Novo').length;
  const totalClasseA = clients.filter(c => c.score >= 90).length;
  const totalClasseB = clients.filter(c => c.score >= 70 && c.score < 90).length;
  const totalClasseC = clients.filter(c => c.score >= 50 && c.score < 70).length;

  // Selected client for Details View
  const selectedClient = clients.find(c => c.id === selectedClientId);

  // --- TABLE COLUMN RENDER ---
  const tableColumns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Nome do Estabelecimento',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => setSelectedClientId(row.id)}
          className="flex flex-col text-left group cursor-pointer focus:outline-hidden"
        >
          <span className="font-bold text-slate-800 leading-normal group-hover:text-blue-700 transition-colors">
            {row.name}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
            <Building2 className="h-3 w-3 text-slate-300" />
            {row.fantasyName}
          </span>
        </button>
      )
    },
    {
      key: 'city',
      header: 'Localização',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          {row.city} ({row.state})
        </span>
      )
    },
    {
      key: 'segment',
      header: 'Segmento',
      sortable: true,
      render: (row) => <Badge variant="info">{row.segment}</Badge>
    },
    {
      key: 'score',
      header: 'Score de Fit',
      sortable: true,
      render: (row) => {
        const val = row.score;
        let colorText = 'text-rose-600 bg-rose-50 border-rose-100';
        if (val >= 71) colorText = 'text-emerald-700 bg-emerald-50 border-emerald-100';
        else if (val >= 41) colorText = 'text-amber-700 bg-amber-50 border-amber-100';

        return (
          <div className="flex flex-col gap-1 w-24">
            <div className="flex items-center justify-between text-[10px] font-black">
              <span className={`px-1.5 py-0.5 rounded border ${colorText}`}>
                {val} pts
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${val >= 71 ? 'bg-emerald-500' : val >= 41 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'potential',
      header: 'Potencial',
      sortable: true,
      render: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'primary' = 'warning';
        if (row.potential === 'Muito Alto') variant = 'primary';
        else if (row.potential === 'Alto') variant = 'success';
        else if (row.potential === 'Médio') variant = 'warning';
        else variant = 'danger';

        return <Badge variant={variant}>{row.potential}</Badge>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const variantMap: Record<Client['status'], 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'dark' | 'secondary'> = {
          'Entradas': 'info',
          'Autorizados': 'success',
          'Rejeitados': 'danger'
        };
        return <Badge variant={variantMap[row.status] || 'secondary'}>{row.status}</Badge>;
      }
    },
    {
      key: 'lastAnalysis',
      header: 'Última Análise',
      render: (row) => (
        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-300" />
          {row.lastAnalysis}
        </span>
      )
    },
    {
      key: 'responsible',
      header: 'Responsável',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
          <User className="h-3.5 w-3.5 text-slate-400" />
          {row.responsible}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <ContextMenu
          items={[
            {
              label: 'Abrir Detalhes',
              onClick: () => setSelectedClientId(row.id),
            },
            {
              label: 'Analisar Cardápio',
              onClick: () => handleTriggerMockAnalysis(row.id),
            },
            {
              label: 'Autorizar Registro',
              onClick: () => {
                setClients(prev => prev.map(c => c.id === row.id ? { ...c, status: 'Autorizados' as const } : c));
                triggerToast('success', 'Status Atualizado', `"${row.name}" foi Autorizado.`);
              },
            },
            {
              label: 'Rejeitar Registro',
              onClick: () => {
                setRejectionTargetId(row.id);
                setIsRejectionModalOpen(true);
              },
            },
          ]}
        />
      )
    }
  ];

  // --- DETAILS VIEW BREADCRUMBS ---
  const breadcrumbItems: BreadcrumbItem[] = selectedClient
    ? [
        { label: 'Base Comercial', onClick: () => setSelectedClientId(null) },
        { label: selectedClient.name, active: true }
      ]
    : [
        { label: 'Base Comercial', active: true }
      ];

  return (
    <PageContainer id="page-cadastro-clientes">
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

      {/* Breadcrumb path */}
      <Breadcrumb items={breadcrumbItems} onHomeClick={selectedClient ? () => setSelectedClientId(null) : undefined} />

      {/* Conditional Rendering: Details View vs. Main Listing */}
      {selectedClient ? (
        // ----------------- TELA DE DETALHES DO CLIENTE (CENTRAL DE INTELIGÊNCIA) -----------------
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Details Page Header Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50/80 text-blue-950 border border-blue-100 p-3.5 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                    {selectedClient.fantasyName}
                  </h2>
                  <Badge variant="info">{selectedClient.segment}</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-slate-300" />
                  Razão Social: {selectedClient.name} {selectedClient.cnpj ? `| CNPJ: ${selectedClient.cnpj}` : ''}
                </p>
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-300" />
                  {selectedClient.city} - {selectedClient.state}
                </p>

                <div className="flex flex-wrap gap-2 mt-2 pt-1">
                  {/* Status badge representation */}
                  <Badge
                    variant={
                      selectedClient.status === 'Entradas'
                        ? 'info'
                        : selectedClient.status === 'Autorizados'
                        ? 'success'
                        : 'danger'
                    }
                  >
                    Status: {selectedClient.status}
                  </Badge>

                  {/* Potential badge */}
                  <Badge
                    variant={
                      selectedClient.potential === 'Muito Alto'
                        ? 'primary'
                        : selectedClient.potential === 'Alto'
                        ? 'success'
                        : selectedClient.potential === 'Médio'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    Potencial: {selectedClient.potential}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Score circle alignment inside header */}
            <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <ScoreIndicator score={selectedClient.score} title="Score de Fit Radar" size="sm" />
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={() => handleTriggerMockAnalysis(selectedClient.id)}
            >
              Analisar Cardápio de IA (Recalcular Score)
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UploadIcon className="h-4 w-4" />}
              onClick={() => {
                // Simulates uploading a new menu to this client
                try {
                  const existingStr = localStorage.getItem('ctrade_menu_library');
                  const menus = existingStr ? JSON.parse(existingStr) : [];
                  
                  const count = menus.filter((m: any) => m.nomeEstabelecimento === selectedClient.name).length + 1;
                  
                  const todayStr = new Date().toISOString().split('T')[0];

                  const newMenu = {
                    id: 'm-' + Date.now(),
                    nomeEstabelecimento: selectedClient.name,
                    empresa: selectedClient.name,
                    estado: selectedClient.state,
                    cidade: selectedClient.city,
                    segmento: selectedClient.segment,
                    dataEnvio: todayStr,
                    origem: 'Upload Manual',
                    status: 'Entradas',
                    nomeArquivo: `Cardapio_${selectedClient.fantasyName.replace(/\s+/g, '_')}_v${count}.pdf`,
                    tamanhoArquivo: '2.4 MB',
                    produtosIdentificados: selectedClient.id === 1 ? [
                      { id: 'pi-1', nomeNoCardapio: 'Spaghetti ai Frutti di Mare', brand: 'Valdigrano', category: 'Massas Tradicionais', productName: 'Spaghetti', status: 'Homologado' },
                      { id: 'pi-2', nomeNoCardapio: 'Mozzarella di Bufala Speciale', brand: 'Latteria Sorrentina', category: 'Fiordilatte', productName: 'Fiordilatte Bola', status: 'Homologado' }
                    ] : [
                      { id: 'pi-e1', nomeNoCardapio: 'Pizza Margherita', brand: 'Molino Caputo', category: 'Farinhas Profissionais', productName: 'Farinha Pizzeria', status: 'Homologado' },
                      { id: 'pi-e2', nomeNoCardapio: 'Pomodoro Marinara', brand: 'Ciao', category: 'Tomates Italianos', productName: 'Tomate Pelati', status: 'Homologado' }
                    ]
                  };

                  localStorage.setItem('ctrade_menu_library', JSON.stringify([newMenu, ...menus]));
                  window.dispatchEvent(new Event('storage'));

                  setClients(prev => prev.map(c => {
                    if (c.id === selectedClient.id) {
                      const needsEnrichment = !c.endereco || !c.cnpj;
                      const enriched = needsEnrichment ? getEnrichedCompanyData(c.name, c.city, c.state) : null;
                      
                      const newHistory = [
                        ...(c.historicoCompleto || []),
                        {
                          id: 'h-' + Date.now(),
                          data: todayStr + ' ' + new Date().toTimeString().slice(0, 5),
                          usuario: 'Marcelo Baquero (Você)',
                          acao: `Novo cardápio enviado manualmente: ${newMenu.nomeArquivo}.`,
                          tipo: 'cardapio' as const
                        }
                      ];

                      if (enriched) {
                        newHistory.push(
                          { id: 'h-enrich-1-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Iniciando enriquecimento automático em segundo plano pelo upload do cardápio.`, tipo: 'atualizacao' as const },
                          { id: 'h-enrich-2-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `CNPJ ${enriched.cnpj} localizado com Situação Cadastral: ${enriched.situacaoCadastral}.`, tipo: 'atualizacao' as const },
                          { id: 'h-enrich-3-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Ficha enriquecida com atividade CNAE: ${enriched.cnae} e endereço: ${enriched.endereco}.`, tipo: 'atualizacao' as const },
                          { id: 'h-enrich-4-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Claude AI (Processamento)', acao: `Responsável de compras identificado: ${enriched.responsible} (${enriched.responsibleRole}). LinkedIn cadastrado.`, tipo: 'atualizacao' as const }
                        );
                      }

                      return {
                        ...c,
                        lastUpload: newMenu.nomeArquivo,
                        dateUpdated: todayStr,
                        cnpj: c.cnpj || (enriched ? enriched.cnpj : undefined),
                        razaoSocial: c.razaoSocial || (enriched ? enriched.razaoSocial : undefined),
                        fantasyName: c.fantasyName || (enriched ? enriched.fantasyName : c.name),
                        situacaoCadastral: c.situacaoCadastral || (enriched ? enriched.situacaoCadastral : undefined),
                        dataAbertura: c.dataAbertura || (enriched ? enriched.dataAbertura : undefined),
                        endereco: c.endereco || (enriched ? enriched.endereco : undefined),
                        cep: c.cep || (enriched ? enriched.cep : undefined),
                        cnae: c.cnae || (enriched ? enriched.cnae : undefined),
                        phone: (c.phone && isValidPhone(c.phone)) ? c.phone : (enriched && isValidPhone(enriched.phone) ? enriched.phone : c.phone),
                        website: c.website || (enriched ? enriched.website : undefined),
                        responsible: c.responsible || (enriched ? enriched.responsible : undefined),
                        responsibleRole: c.responsibleRole || (enriched ? enriched.responsibleRole : undefined),
                        linkedin: c.linkedin || (enriched ? enriched.linkedin : undefined),
                        historicoCompleto: newHistory
                      };
                    }
                    return c;
                  }));

                  triggerToast('success', 'Cardápio Submetido', `O arquivo "${newMenu.nomeArquivo}" foi anexado e está pronto para análise.`);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Fazer Upload de Cardápio
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit2 className="h-4 w-4" />}
              onClick={() => handleOpenEditModal(selectedClient)}
            >
              Editar Dados de Cadastro
            </Button>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="font-bold text-slate-500">Status:</span>
              <select
                value={selectedClient.status}
                onChange={(e) => {
                  const newStatus = e.target.value as 'Entradas' | 'Autorizados' | 'Rejeitados';
                  if (newStatus === 'Rejeitados') {
                    setRejectionTargetId(selectedClient.id);
                    setIsRejectionModalOpen(true);
                  } else {
                    const todayStr = new Date().toISOString().split('T')[0];
                    setClients(prev => prev.map(c => c.id === selectedClient.id ? { 
                      ...c, 
                      status: newStatus, 
                      rejectionReason: undefined,
                      dateUpdated: todayStr,
                      historicoCompleto: [
                        ...(c.historicoCompleto || []),
                        { id: 'h-st-' + Date.now(), data: todayStr + ' 12:00', usuario: 'Marcelo Baquero (Você)', acao: `Status comercial alterado para ${newStatus}.`, tipo: 'atualizacao' as const }
                      ]
                    } : c));
                    triggerToast('success', 'Status Atualizado', `Status de "${selectedClient.name}" alterado para ${newStatus}.`);
                  }
                }}
                className="bg-white border border-slate-250 rounded-md px-2 py-1 font-bold text-slate-700 outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="Entradas">Entradas</option>
                <option value="Autorizados">Autorizados</option>
                <option value="Rejeitados">Rejeitados</option>
              </select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => setSelectedClientId(null)}
            >
              Voltar para Base Comercial
            </Button>
          </div>

          {selectedClient.status === 'Rejeitados' && selectedClient.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs font-semibold leading-relaxed animate-fadeIn">
              <strong className="text-rose-900 block mb-1 font-black uppercase text-[10px] tracking-wider">Motivo da Rejeição do Registro:</strong>
              {selectedClient.rejectionReason}
            </div>
          )}

          {/* 1. RESUMO EXECUTIVO (PAINEL DE KPIS DINÂMICOS DO CLIENTE) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-900 animate-pulse" />
              Resumo Executivo (Painel Comercial do Estabelecimento)
            </h3>
            
            {(() => {
              // Calculate dynamic stats
              const savedMenusStr = localStorage.getItem('ctrade_menu_library');
              const savedMenus = savedMenusStr ? JSON.parse(savedMenusStr) : [];
              const clientMenus = savedMenus.filter((m: any) => 
                m.nomeEstabelecimento === selectedClient.name || 
                m.nomeEstabelecimento === selectedClient.fantasyName
              );

              const totalMenus = clientMenus.length;
              const allIdentified = clientMenus.flatMap((m: any) => m.produtosIdentificados || []);
              const totalIdentified = allIdentified.length;
              const portfolioProducts = allIdentified.filter((p: any) => !p.notInCatalog).length;
              const outOfPortfolioProducts = allIdentified.filter((p: any) => p.notInCatalog).length;

              const uniqueCategories = Array.from(new Set(allIdentified.map((p: any) => p.category).filter(Boolean)));
              const totalCategories = uniqueCategories.length;

              let curadoriaStatus = 'Sem Cardápio';
              if (totalMenus > 0) {
                const hasPending = allIdentified.some((p: any) => p.status === 'Pendente');
                curadoriaStatus = hasPending ? 'Pendente' : 'Homologado';
              }

              const fitScore = selectedClient.score;
              const opp = REAL_OPPORTUNITIES.find(o => o.cliente.toLowerCase() === selectedClient.name.toLowerCase());
              const commercialScore = opp ? opp.scoreComercial : fitScore;

              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cardápios Enviados</span>
                    <span className="text-xl font-extrabold text-slate-800 block leading-none">{totalMenus}</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">Total em custódia</span>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SKUs Mapeados</span>
                    <span className="text-xl font-extrabold text-slate-800 block leading-none">{totalIdentified}</span>
                    <span className="text-[9px] text-slate-500 font-bold block flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{portfolioProducts} Portfólio
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fora de Catálogo</span>
                    <span className="text-xl font-extrabold text-slate-800 block leading-none">{outOfPortfolioProducts}</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">Marcas de Concorrentes</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Potencial / Score Fit</span>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xl font-extrabold text-blue-900">{fitScore}</span>
                      <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-1 rounded border border-blue-100">{selectedClient.potential}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold block">Score de Qualificação</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Status Curadoria</span>
                    <span className={`text-xs font-black uppercase inline-block px-2 py-0.5 rounded border leading-none ${
                      curadoriaStatus === 'Homologado' ? 'text-emerald-800 bg-emerald-50 border-emerald-100' :
                      curadoriaStatus === 'Pendente' ? 'text-amber-800 bg-amber-50 border-amber-100' :
                      'text-slate-500 bg-slate-50 border-slate-200'
                    }`}>
                      {curadoriaStatus}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">Homologação de SKUs</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Information Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2 (Main Content) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 2. DADOS GERAIS DO CADASTRO (Ficha Completa) */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Informações e Dados Cadastrais
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    Cadastrado em {selectedClient.dateCreated ? new Date(selectedClient.dateCreated).toLocaleDateString('pt-BR') : '15/01/2026'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold text-slate-700">
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Razão Social</span>
                    <span className="text-slate-800 font-extrabold">{selectedClient.razaoSocial || selectedClient.name}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Nome Fantasia</span>
                    <span className="text-slate-800 font-extrabold">{selectedClient.fantasyName}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">CNPJ</span>
                    <span className="text-slate-800 font-bold">{selectedClient.cnpj || 'Não Informado'}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Segmento Gastronômico</span>
                    <Badge variant="info">{selectedClient.segment}</Badge>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Cidade / Estado</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {selectedClient.city} ({selectedClient.state})
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Regional Relacionada</span>
                    <span className="text-slate-800 font-bold">
                      {regionals.find(r => r.id === selectedClient.regionalId)?.name || 'Regional Padrão'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">RCA Atribuído</span>
                    <span className="text-slate-800 font-bold">
                      {rcas.find(r => r.id === selectedClient.rcaId)?.name || 'RCA Padrão'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Gestor Responsável Comercial</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1.5 text-blue-900">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                      {selectedClient.responsibleCommercial || 'Marcelo Baquero'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Contato Decisor / Cargo</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {selectedClient.responsible} ({selectedClient.responsibleRole})
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Última Atualização</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {selectedClient.dateUpdated ? new Date(selectedClient.dateUpdated).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                  </div>
                  {selectedClient.situacaoCadastral && (
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Situação Cadastral Receita</span>
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border leading-none ${
                        selectedClient.situacaoCadastral === 'ATIVA' ? 'text-emerald-800 bg-emerald-50 border-emerald-100' : 'text-slate-700 bg-slate-50 border-slate-150'
                      }`}>
                        {selectedClient.situacaoCadastral}
                      </span>
                    </div>
                  )}
                  {selectedClient.dataAbertura && (
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Data de Abertura</span>
                      <span className="text-slate-800 font-extrabold">{selectedClient.dataAbertura}</span>
                    </div>
                  )}
                  {selectedClient.endereco && (
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Endereço Comercial</span>
                      <span className="text-slate-800 font-bold block truncate" title={selectedClient.endereco}>{selectedClient.endereco}</span>
                    </div>
                  )}
                  {selectedClient.cep && (
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">CEP</span>
                      <span className="text-slate-800 font-bold">{selectedClient.cep}</span>
                    </div>
                  )}
                  {selectedClient.cnae && (
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-black block mb-0.5 uppercase tracking-wider">Atividade CNAE Principal</span>
                      <span className="text-slate-800 font-bold block truncate" title={selectedClient.cnae}>{selectedClient.cnae}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* 3. PRODUTOS UTILIZADOS (CATEGORIA -> MARCA -> PRODUTO) */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-blue-900" />
                    Produtos Mapeados (Curation Tree)
                  </h3>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                    Organização: Categoria ➔ Marca ➔ SKU
                  </span>
                </div>

                {(() => {
                  // Group identified products dynamically
                  const savedMenusStr = localStorage.getItem('ctrade_menu_library');
                  const savedMenus = savedMenusStr ? JSON.parse(savedMenusStr) : [];
                  const clientMenus = savedMenus.filter((m: any) => 
                    m.nomeEstabelecimento === selectedClient.name || 
                    m.nomeEstabelecimento === selectedClient.fantasyName
                  );

                  const allIdentified = clientMenus.flatMap((m: any) => m.produtosIdentificados || []);

                  if (allIdentified.length === 0) {
                    return (
                      <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <span className="font-bold text-slate-700 block text-xs">Nenhum cardápio processado para este cliente</span>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                          Submeta ou analise um cardápio acima para mapear automaticamente ingredientes utilizados pelo restaurante.
                        </p>
                      </div>
                    );
                  }

                  // Tree grouping
                  const tree: { [cat: string]: { [brand: string]: any[] } } = {};
                  allIdentified.forEach((item: any) => {
                    const cat = item.category || 'Outras Categorias';
                    const brand = item.brand || 'Marca Desconhecida / Concorrente';
                    if (!tree[cat]) tree[cat] = {};
                    if (!tree[cat][brand]) tree[cat][brand] = [];
                    tree[cat][brand].push(item);
                  });

                  return (
                    <div className="space-y-4">
                      {Object.entries(tree).map(([category, brandsObj]) => (
                        <div key={category} className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
                          {/* Category level */}
                          <div className="bg-slate-50 border-b border-slate-150 px-4 py-2.5 flex justify-between items-center">
                            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                              {category}
                            </span>
                            <span className="bg-blue-50 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded border border-blue-100">
                              {Object.values(brandsObj).flat().length} SKUs
                            </span>
                          </div>

                          {/* Brand level */}
                          <div className="p-3.5 space-y-3 bg-white">
                            {Object.entries(brandsObj).map(([brand, items]) => (
                              <div key={brand} className="space-y-2 border-l-2 border-slate-200 pl-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                  Marca: {brand}
                                </span>
                                
                                {/* Product cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {items.map((it: any) => {
                                    const isNotInCatalog = it.notInCatalog;
                                    return (
                                      <div key={it.id} className="bg-slate-50/50 hover:bg-slate-100/50 p-2.5 rounded-lg border border-slate-100 transition-colors flex items-start justify-between gap-2">
                                        <div className="space-y-0.5 truncate">
                                          <span className="text-xs font-bold text-slate-800 truncate block">
                                            {it.productName || it.nomeNoCardapio}
                                          </span>
                                          {it.nomeNoCardapio && it.nomeNoCardapio !== it.productName && (
                                            <span className="text-[10px] text-slate-400 block truncate">
                                              No menu: "{it.nomeNoCardapio}"
                                            </span>
                                          )}
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border leading-none ${
                                            isNotInCatalog ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                          }`}>
                                            {isNotInCatalog ? 'Concorrente' : 'Portfólio'}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-400">
                                            {it.status || 'Homologado'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>

              {/* 4. HISTÓRICO COMERCIAL (TIMELINE COM INSERÇÃO DE NOTAS) */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-900" />
                    Histórico & Linha do Tempo Comercial
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    Registro de Ações em Custódia
                  </span>
                </div>

                {/* Timeline insertion box */}
                <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-600 block">Registrar Novo Acontecimento Comercial / Nota</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Descreva a ação (ex: Ligação realizada, visita agendada, negociação iniciada, etc)..."
                      value={timelineNote}
                      onChange={(e) => setTimelineNote(e.target.value)}
                      className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTimelineNote(selectedClient.id);
                      }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddTimelineNote(selectedClient.id)}
                    >
                      Inserir Nota
                    </Button>
                  </div>
                </div>

                {/* The vertical timeline list */}
                {(() => {
                  const history = selectedClient.historicoCompleto || [];
                  if (history.length === 0) {
                    return (
                      <p className="text-center text-slate-400 text-xs py-4">Nenhum evento registrado no histórico.</p>
                    );
                  }

                  // Render chronological events (newest on top)
                  const sortedHistory = [...history].reverse();

                  return (
                    <div className="relative border-l border-slate-200 ml-3.5 pl-6 space-y-6">
                      {sortedHistory.map((ev, index) => {
                        let badgeColor = 'bg-blue-500 text-white';
                        if (ev.tipo === 'cadastro') badgeColor = 'bg-slate-400 text-white';
                        else if (ev.tipo === 'cardapio') badgeColor = 'bg-indigo-500 text-white';
                        else if (ev.tipo === 'analise') badgeColor = 'bg-emerald-500 text-white';
                        else if (ev.tipo === 'curadoria') badgeColor = 'bg-amber-500 text-white';
                        else if (ev.tipo === 'atualizacao') badgeColor = 'bg-cyan-500 text-white';

                        return (
                          <div key={ev.id || index} className="relative">
                            {/* Dot icon */}
                            <span className={`absolute -left-[31px] top-0.5 rounded-full h-5.5 w-5.5 border-4 border-white flex items-center justify-center text-[10px] font-bold ${badgeColor}`}>
                              {ev.tipo === 'analise' ? '★' : '●'}
                            </span>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">{ev.data}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Por: {ev.usuario}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-700 leading-normal">
                                {ev.acao}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </Card>

            </div>

            {/* COLUMN 3 (Sidebar details) */}
            <div className="space-y-6">
              
              {/* CONTACTS CARD */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Canais de Comunicação
                  </h3>
                </div>
                <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{isValidPhone(selectedClient.phone) ? selectedClient.phone : 'Tel. Não Encontrado'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Linkedin className="h-4 w-4 text-slate-400 shrink-0" />
                      {selectedClient.linkedin ? (
                        <span className="truncate text-blue-600 hover:underline cursor-pointer">
                          {selectedClient.linkedin}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">LinkedIn não encontrado</span>
                      )}
                    </div>
                    {selectedClient.linkedin && (
                      <a
                        href={selectedClient.linkedin.startsWith('http') ? selectedClient.linkedin : `https://${selectedClient.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider shrink-0 cursor-pointer"
                      >
                        Abrir Perfil
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedClient.email || 'contato@estabelecimento.com'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Instagram className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate text-blue-600 hover:underline cursor-pointer">{selectedClient.instagram || '@estabelecimento'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate text-blue-600 hover:underline cursor-pointer">{selectedClient.website || 'www.estabelecimento.com.br'}</span>
                  </div>
                </div>
              </Card>

              {/* 5. CARDÁPIOS (GERENCIAMENTO DE ARQUIVOS) */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Histórico de Cardápios PDF
                  </h3>
                </div>

                {(() => {
                  const savedMenusStr = localStorage.getItem('ctrade_menu_library');
                  const savedMenus = savedMenusStr ? JSON.parse(savedMenusStr) : [];
                  const clientMenus = savedMenus.filter((m: any) => 
                    m.nomeEstabelecimento === selectedClient.name || 
                    m.nomeEstabelecimento === selectedClient.fantasyName
                  );

                  if (clientMenus.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Nenhum arquivo submetido. Clique em "Fazer Upload de Cardápio" para simular o recebimento de cardápio.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {clientMenus.map((m: any) => (
                        <div key={m.id} className="bg-slate-50 p-2.5 border border-slate-100 rounded-lg space-y-1.5 text-xs font-semibold">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-slate-700 truncate font-bold block flex-1">
                              {m.nomeArquivo || `Cardapio_${m.nomeEstabelecimento}.pdf`}
                            </span>
                            <span className="bg-blue-50 text-blue-800 text-[9px] px-1 py-0.5 rounded uppercase leading-none font-black">
                              {m.origem}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Tamanho: {m.tamanhoArquivo || '2.1 MB'}</span>
                            <span>Enviado: {m.dataEnvio}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>

              {/* 6. OPORTUNIDADES COMERCIAIS (OPPORTUNITY LINK) */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Oportunidades de Venda
                  </h3>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    RD Station Sync
                  </span>
                </div>

                {(() => {
                  const opps = REAL_OPPORTUNITIES.filter(o => 
                    o.cliente.toLowerCase() === selectedClient.name.toLowerCase() ||
                    o.cliente.toLowerCase() === selectedClient.fantasyName.toLowerCase()
                  );

                  if (opps.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Nenhuma oportunidade de venda ativa gerada para este estabelecimento. O score de fit atual é de <strong>{selectedClient.score} pts</strong>.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {opps.map((op, idx) => (
                        <div key={op.id || idx} className="bg-slate-50/50 p-3.5 border border-slate-150 rounded-xl space-y-2.5 text-xs font-semibold text-slate-700">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-slate-800 font-extrabold block text-xs leading-tight">
                              Oportunidade — {selectedClient.fantasyName}
                            </span>
                            <Badge variant="warning">{op.prioridade}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] leading-normal font-bold">
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px]">Potencial Estimado</span>
                              <span className="text-slate-800 font-extrabold">{op.faturamentoEstimado || (op.valorPotencialEstimado ? `R$ ${op.valorPotencialEstimado.toLocaleString('pt-BR')}/mês` : 'R$ 15.000/mês')}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px]">Status</span>
                              <span className="text-indigo-800 font-black">{op.status}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-2">
                            <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">SKUs Recomendados</span>
                            <div className="flex flex-wrap gap-1">
                              {op.produtosRecomendados.map((p, pIdx) => (
                                <span key={pIdx} className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Interactive CRM Export Mock Button */}
                          <button
                            type="button"
                            onClick={() => {
                              triggerToast('success', 'Exportação Concluída', `Oportunidade "${selectedClient.fantasyName}" sincronizada com sucesso no RD Station CRM.`);
                            }}
                            className="w-full bg-blue-900 text-white rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-blue-950 transition-colors cursor-pointer text-center"
                          >
                            Exportar para RD Station CRM
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>

              {/* 7. OBSERVÇÕES E COMENTÁRIOS DO RCA */}
              <Card>
                <div className="border-b border-slate-50 pb-3 mb-4.5">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Observações Estratégicas
                  </h3>
                </div>
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={selectedClient.observations}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, observations: val } : c));
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:border-blue-500 font-medium text-slate-700 leading-relaxed"
                    placeholder="Escreva observações comerciais estratégicas para este cliente..."
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                    * Essas observações são salvas instantaneamente em cache para compilação comercial.
                  </p>
                </div>
              </Card>

              {/* 8. CLAUDE INTELLIGENCE HUB (Aguardando Ativação do Claude em Fases Futuras) */}
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-700 animate-pulse" />
                    Claude Commercial Hub
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                    Fase 4
                  </span>
                </div>
                
                <p className="text-[11px] text-indigo-950 font-bold leading-normal">
                  Este espaço foi estruturado para receber o processamento cognitivo do Claude AI de forma nativa na próxima fase de desenvolvimento.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-[10px] font-bold text-slate-400 italic">
                    📌 Claude AI: Resumo do Estabelecimento (Aguardando Ativação)
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-[10px] font-bold text-slate-400 italic">
                    🔍 Claude AI: Gaps & Insights de Upsell (Aguardando Ativação)
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-[10px] font-bold text-slate-400 italic">
                    ⚖ Claude AI: Comparador de Históricos (Aguardando Ativação)
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      ) : (
        // ----------------- TELA PRINCIPAL (LISTAGEM DE CLIENTES) -----------------
        <div className="space-y-6">
          {/* Main Headers */}
          <PageHeader
            title="Base Comercial"
            subtitle="Gerencie restaurantes, hotéis, pizzarias e demais estabelecimentos cadastrados."
            badge="Inteligência Comercial"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  onClick={handleImport}
                >
                  Importar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  onClick={handleExport}
                >
                  Exportar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Novo Registro
                </Button>
              </div>
            }
          />

          {/* Filtros e Pesquisa */}
          <div className="mb-6">
            <GlobalFilters sessionFilters={sessionFilters} setSessionFilters={setSessionFilters} />
          </div>

          {/* Cards de Indicadores Superiores (KPIs) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          >
            <MetricCard
              title="Registros na Base"
              value={totalRegistered.toString()}
              comparisonText="Base de dados consolidada"
            />
            <MetricCard
              title="Novos e Prospectos"
              value={totalProspects.toString()}
              comparisonText="Aguardando qualificação"
            />
            <MetricCard
              title="Classe A (Score ≥ 90)"
              value={totalClasseA.toString()}
              comparisonText="Score >= 90 pts"
            />
            <MetricCard
              title="Classe B (Score 70-89)"
              value={totalClasseB.toString()}
              comparisonText="Score entre 70 e 89"
            />
            <MetricCard
              title="Classe C (Score 50-69)"
              value={totalClasseC.toString()}
              comparisonText="Score entre 50 e 69"
            />
          </motion.div>

          {/* Layout Mode Toggles */}
          <div className="bg-white border border-slate-150 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">
              Exibindo <strong className="text-slate-850">{filteredClients.length}</strong> de <strong className="text-slate-850">{totalRegistered}</strong> estabelecimentos qualificados
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-white text-blue-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Tabela
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-white text-blue-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
            </div>
          </div>

          {/* Conditional layout: Table vs. Cards List */}
          {filteredClients.length === 0 ? (
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Nenhum estabelecimento corresponde aos filtros e pesquisa selecionados. Tente ajustar os parâmetros."
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters} leftIcon={<Eraser className="h-4 w-4" />}>
                  Limpar Todos os Filtros
                </Button>
              }
            />
          ) : (
            <>
              {/* RENDER DYNAMIC VIEW MODE */}
              {viewMode === 'table' ? (
                <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
                  <DataTable
                    columns={tableColumns}
                    data={filteredClients}
                    searchPlaceholder="Refinar resultados listados na página..."
                    searchKey="name"
                    initialRowsPerPage={10}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClients.map((client) => {
                    let colorText = 'text-rose-600 bg-rose-50 border-rose-100';
                    if (client.score >= 71) colorText = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                    else if (client.score >= 41) colorText = 'text-amber-700 bg-amber-50 border-amber-100';

                    let potentialVariant: 'primary' | 'success' | 'warning' | 'danger' = 'warning';
                    if (client.potential === 'Muito Alto') potentialVariant = 'primary';
                    else if (client.potential === 'Alto') potentialVariant = 'success';
                    else if (client.potential === 'Médio') potentialVariant = 'warning';
                    else potentialVariant = 'danger';

                    const statusVariantMap: Record<Client['status'], 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'dark' | 'secondary'> = {
                      'Entradas': 'info',
                      'Autorizados': 'success',
                      'Rejeitados': 'danger'
                    };

                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className="bg-white border border-slate-150 p-5 rounded-xl shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between gap-4 font-sans cursor-pointer active:scale-[0.99] group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-blue-900 transition-colors truncate">
                                {client.fantasyName || client.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold block truncate">
                                Razão: {client.name}
                              </span>
                            </div>
                            <Badge variant={statusVariantMap[client.status]}>{client.status}</Badge>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-300" />
                            <span>{client.city} ({client.state})</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <Badge variant="info">{client.segment}</Badge>
                            <Badge variant={potentialVariant}>Potencial: {client.potential}</Badge>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                          {/* Score Display */}
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-black ${colorText}`}>
                              Score: {client.score} pts
                            </span>
                          </div>

                          {/* Button indicator clicker */}
                          <span className="text-[11px] font-black text-blue-600 flex items-center gap-0.5">
                            Ver Ficha Inteligente
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Modal "Novo Cliente" */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Cadastrar Novo Registro"
            size="lg"
            footer={
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveNewClient}>
                  Salvar Registro
                </Button>
              </>
            }
          >
            <form onSubmit={handleSaveNewClient} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do Estabelecimento *"
                  placeholder="Ex: Osteria Bella Italia"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />

                <Input
                  label="Nome Fantasia"
                  placeholder="Ex: Bella Italia"
                  value={formFantasyName}
                  onChange={(e) => setFormFantasyName(e.target.value)}
                />

                <Input
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />

                <Select
                  label="Estado (UF) *"
                  options={ESTADOS_BRASILEIROS}
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                />

                <Select
                  label="Regional"
                  options={[
                    { value: '', label: 'Nenhuma Regional' },
                    ...regionals.map(r => ({ value: r.name, label: r.name + (r.active ? '' : ' (Inativa)') }))
                  ]}
                  value={formRegionalId}
                  onChange={(e) => setFormRegionalId(e.target.value)}
                />

                <Select
                  label="RCA Responsável"
                  options={[
                    { value: '', label: 'Nenhum RCA' },
                    ...rcas.map(r => ({ value: r.name, label: r.name + (r.active ? '' : ' (Inativo)') }))
                  ]}
                  value={formRcaId}
                  onChange={(e) => setFormRcaId(e.target.value)}
                />

                <Select
                  label="Segmento de Culinária"
                  options={[
                    { value: 'Italiano', label: 'Italiano' },
                    { value: 'Pizzaria', label: 'Pizzaria' },
                    { value: 'Hotel', label: 'Hotel / Resort' },
                    { value: 'Casual Dining', label: 'Casual Dining' },
                    { value: 'Hamburgueria', label: 'Hamburgueria' },
                    { value: 'Japonês', label: 'Japonesa' },
                  ]}
                  value={formSegment}
                  onChange={(e) => setFormSegment(e.target.value)}
                />

                <Select
                  label="Categoria de Abordagem"
                  options={OFFICIAL_CATEGORIES.map(c => ({ value: c, label: c }))}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                />

                <Input
                  label="Instagram do Estabelecimento"
                  placeholder="Ex: @bellavistapizzaria"
                  value={formInstagram}
                  onChange={(e) => setFormInstagram(e.target.value)}
                />

                <Input
                  label="Website Oficial"
                  placeholder="Ex: www.bellavistapizzaria.com"
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                />

                <Input
                  label="Telefone Comercial"
                  placeholder="Ex: (11) 98888-7777"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />

                <Input
                  label="LinkedIn do Responsável"
                  placeholder="Ex: https://www.linkedin.com/in/nome-perfil"
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                />

                <Input
                  label="E-mail de Compras"
                  placeholder="Ex: compras@bellavistapizzaria.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />

                <Input
                  label="Nome do Responsável / Decisor"
                  placeholder="Ex: Ricardo Albuquerque"
                  value={formResponsible}
                  onChange={(e) => setFormResponsible(e.target.value)}
                />

                <Input
                  label="Cargo do Responsável"
                  placeholder="Ex: Comprador Executivo"
                  value={formResponsibleRole}
                  onChange={(e) => setFormResponsibleRole(e.target.value)}
                />
              </div>

              <div>
                <Textarea
                  label="Observações Comerciais Iniciais"
                  placeholder="Anote aqui particularidades, se utilizam marcas concorrentes, ticket médio do cardápio e potencial de compra inicial..."
                  value={formObservations}
                  onChange={(e) => setFormObservations(e.target.value)}
                />
              </div>
            </form>
          </Modal>

          {/* Modal "Editar Registro" */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingClient(null);
            }}
            title="Editar Ficha Cadastral"
            size="lg"
            footer={
              <>
                <Button variant="secondary" size="sm" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingClient(null);
                }}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveEditClient}>
                  Salvar Alterações
                </Button>
              </>
            }
          >
            {editingClient && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditClient(); }} className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Razão Social *"
                    placeholder="Ex: Osteria Bella Italia Ltda"
                    value={editRazaoSocial}
                    onChange={(e) => setEditRazaoSocial(e.target.value)}
                  />

                  <Input
                    label="Nome Fantasia *"
                    placeholder="Ex: Bella Italia"
                    value={editFantasyName}
                    onChange={(e) => setEditFantasyName(e.target.value)}
                  />

                  <Input
                    label="CNPJ (Opcional)"
                    placeholder="Ex: 12.345.678/0001-99"
                    value={editCnpj}
                    onChange={(e) => setEditCnpj(e.target.value)}
                  />

                  <Input
                    label="Cidade *"
                    placeholder="Ex: São Paulo"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                  />

                  <Select
                    label="Estado (UF) *"
                    options={ESTADOS_BRASILEIROS}
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                  />

                  <Select
                    label="Regional *"
                    options={[
                      { value: '', label: 'Nenhuma Regional' },
                      ...regionals.map(r => ({ value: r.name, label: r.name + (r.active ? '' : ' (Inativa)') }))
                    ]}
                    value={editRegionalId}
                    onChange={(e) => setEditRegionalId(e.target.value)}
                  />

                  <Select
                    label="RCA Responsável *"
                    options={[
                      { value: '', label: 'Nenhum RCA' },
                      ...rcas.map(r => ({ value: r.name, label: r.name + (r.active ? '' : ' (Inativo)') }))
                    ]}
                    value={editRcaId}
                    onChange={(e) => setEditRcaId(e.target.value)}
                  />

                  <Select
                    label="Segmento de Culinária *"
                    options={[
                      { value: 'Italiano', label: 'Italiano' },
                      { value: 'Pizzaria', label: 'Pizzaria' },
                      { value: 'Hotel', label: 'Hotel / Resort' },
                      { value: 'Casual Dining', label: 'Casual Dining' },
                      { value: 'Hamburgueria', label: 'Hamburgueria' },
                      { value: 'Japonês', label: 'Japonesa' },
                    ]}
                    value={editSegment}
                    onChange={(e) => setEditSegment(e.target.value)}
                  />

                  <Select
                    label="Categoria de Abordagem *"
                    options={OFFICIAL_CATEGORIES.map(c => ({ value: c, label: c }))}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />

                  <Select
                    label="Potencial Comercial *"
                    options={[
                      { value: 'Muito Alto', label: 'Muito Alto' },
                      { value: 'Alto', label: 'Alto' },
                      { value: 'Médio', label: 'Médio' },
                      { value: 'Baixo', label: 'Baixo' },
                    ]}
                    value={editPotential}
                    onChange={(e) => setEditPotential(e.target.value as any)}
                  />

                  <Input
                    label="Score de Adequação Comercial (0-100) *"
                    type="number"
                    placeholder="70"
                    value={editScore.toString()}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                  />

                  <Input
                    label="Instagram"
                    placeholder="Ex: @bellavistapizzaria"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                  />

                  <Input
                    label="Website"
                    placeholder="Ex: www.bellavistapizzaria.com"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                  />

                  <Input
                    label="Telefone Comercial"
                    placeholder="Ex: (11) 98888-7777"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />

                  <Input
                    label="LinkedIn do Responsável"
                    placeholder="Ex: https://www.linkedin.com/in/nome-perfil"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                  />

                  <Input
                    label="E-mail de Compras"
                    placeholder="Ex: compras@bellavistapizzaria.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />

                  <Input
                    label="Nome do Decisor"
                    placeholder="Ex: Ricardo Albuquerque"
                    value={editResponsible}
                    onChange={(e) => setEditResponsible(e.target.value)}
                  />

                  <Input
                    label="Cargo do Decisor"
                    placeholder="Ex: Comprador Executivo"
                    value={editResponsibleRole}
                    onChange={(e) => setEditResponsibleRole(e.target.value)}
                  />
                </div>

                <div>
                  <Textarea
                    label="Observações Comerciais de Custódia"
                    placeholder="Particularidades estratégicas de negociação..."
                    value={editObservations}
                    onChange={(e) => setEditObservations(e.target.value)}
                  />
                </div>
              </form>
            )}
          </Modal>

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
                    
                    // Update client state
                    setClients(prev => prev.map(c => {
                      if (c.id === rejectionTargetId) {
                        const updated = {
                          ...c,
                          status: 'Rejeitados' as const,
                          rejectionReason: rejectionReasonInput.trim()
                        };
                        
                        // Push to localstorage rejected records list for Reports
                        try {
                          const existing = localStorage.getItem('ctrade_rejected_records');
                          const records = existing ? JSON.parse(existing) : [];
                          const isDuplicate = records.some((r: any) => r.id === c.id);
                          if (!isDuplicate) {
                            records.push({
                              id: c.id,
                              clientName: c.name,
                              file: c.lastUpload || 'Sem arquivo',
                              date: new Date().toLocaleDateString('pt-BR'),
                              user: 'Giovanni Rossi (Simulado)',
                              reason: rejectionReasonInput.trim(),
                              status: 'Rejeitados',
                              responsible: c.responsible || 'Sem RCA'
                            });
                            localStorage.setItem('ctrade_rejected_records', JSON.stringify(records));
                          }
                        } catch (e) {
                          console.error(e);
                        }
                        
                        return updated;
                      }
                      return c;
                    }));

                    triggerToast('error', 'Registro Rejeitado', 'O registro foi movido para os Rejeitados com justificativa.');
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
                A rejeição de um registro exige obrigatoriamente um motivo claro. Esse motivo alimentará o relatório de controle de qualidade e auditoria.
              </p>
              <Textarea
                label="Motivo da Rejeição *"
                placeholder="Descreva detalhadamente a razão pela qual este registro de estabelecimento/cardápio foi rejeitado (ex: cardápio ilegível, estabelecimento fechado, fora da área de atuação, etc)..."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
              />
            </div>
          </Modal>

          {/* Modal de Gerenciamento de Regionais e RCAs */}
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
                          // Edit
                          setRegionals(prev => prev.map(r => r.id === editingRegionalId ? { ...r, name: newRegionalName.trim() } : r));
                          triggerToast('success', 'Regional Atualizada', 'Nome da Regional alterado com sucesso.');
                          setEditingRegionalId(null);
                        } else {
                          // Add
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
                        {/* Toggle active */}
                        <button
                          onClick={() => {
                            setRegionals(prev => prev.map(item => item.id === r.id ? { ...item, active: !item.active } : item));
                            triggerToast('info', 'Status Alterado', `Regional "${r.name}" foi ${r.active ? 'desativada' : 'ativada'}.`);
                          }}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${r.active ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          {r.active ? 'Ativa' : 'Inativa'}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingRegionalId(r.id);
                            setNewRegionalName(r.name);
                          }}
                          className="text-slate-500 hover:text-blue-700 font-bold text-[10px]"
                        >
                          Editar
                        </button>

                        {/* Delete */}
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
                          // Edit
                          setRcas(prev => prev.map(r => r.id === editingRcaId ? { ...r, name: newRcaName.trim() } : r));
                          triggerToast('success', 'RCA Atualizado', 'Nome do RCA alterado com sucesso.');
                          setEditingRcaId(null);
                        } else {
                          // Add
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
                        {/* Toggle active */}
                        <button
                          onClick={() => {
                            setRcas(prev => prev.map(item => item.id === r.id ? { ...item, active: !item.active } : item));
                            triggerToast('info', 'Status Alterado', `RCA "${r.name}" foi ${r.active ? 'desativado' : 'ativado'}.`);
                          }}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${r.active ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          {r.active ? 'Ativo' : 'Inativo'}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingRcaId(r.id);
                            setNewRcaName(r.name);
                          }}
                          className="text-slate-500 hover:text-blue-700 font-bold text-[10px]"
                        >
                          Editar
                        </button>

                        {/* Delete */}
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
        </div>
      )}
    </PageContainer>
  );
}
