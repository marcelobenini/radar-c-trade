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
import FitComercial, { FitHistoryItem } from '../components/ui/FitComercial';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import WorkspaceComercial from '../components/WorkspaceComercial';
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

// Client schema interface (internally treated as Conta / Account model)
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
  fitHistory?: FitHistoryItem[];

  // --- MODELO DE CONTA (ACCOUNT MODEL) ---
  id_radar?: string; // ID Radar (Auto-generated, immutable)
  id_erp?: string; // ID ERP (Proveniente do ERP, mutable)
  id_ctrade?: string; // ID C-Trade (Alias for id_erp in downstream integrations)
  statusConta?: 'Prospect Radar' | 'Cliente Convertido' | 'Cliente Base'; // Status da Conta (Ciclo de Vida)
}

export type Conta = Client; // Name alias to preserve internal architecture as Conta
export const ERP_ID_FIELD_NAME = 'id_erp'; // Configurable constant for potential ERP field renames

export function deriveStatusConta(id_radar?: string, id_erp?: string): 'Prospect Radar' | 'Cliente Convertido' | 'Cliente Base' {
  if (id_radar && id_erp) return 'Cliente Convertido';
  if (id_erp) return 'Cliente Base';
  return 'Prospect Radar';
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
    
    let dateCreated = '2026-02-10';
    if (rc.id === 1) dateCreated = '2026-01-15';
    if (rc.id === 3) dateCreated = '2026-07-08';

    let dateUpdated = '2026-07-08';
    if (rc.id === 1) dateUpdated = '2026-07-07';
    if (rc.id === 3) dateUpdated = '2026-07-08';
    
    let fallbackCnpj = '45.890.123/0001-44';
    if (rc.id === 1) fallbackCnpj = '12.345.678/0001-90';
    if (rc.id === 2) fallbackCnpj = '98.765.432/0001-21';

    let fallbackLinkedin = '';
    if (rc.id === 1) fallbackLinkedin = 'https://www.linkedin.com/in/eliaschramm';
    if (rc.id === 3) fallbackLinkedin = 'https://www.linkedin.com/in/rogeriofasano';

    let defaultHistory: ClientHistoryEvent[] = [
      { id: 'h-e1', data: '2026-02-10 10:30', usuario: 'Sistema Radar', acao: 'Cliente cadastrado com sucesso na base comercial.', tipo: 'cadastro' },
      { id: 'h-e2', data: '2026-07-07 10:30', usuario: 'Marcelo Baquero', acao: 'Cardápio recebido e submetido para homologação.', tipo: 'cardapio' },
      { id: 'h-e3', data: '2026-07-07 10:35', usuario: 'Claude AI (Processamento)', acao: 'Mapeamento automatizado concluído com score de fit de 96 pts.', tipo: 'analise' },
      { id: 'h-e4', data: '2026-07-07 15:00', usuario: 'Marcelo Baquero', acao: 'Curadoria de SKUs realizada e homologada no painel de inteligência.', tipo: 'curadoria' }
    ];

    if (rc.id === 1) {
      defaultHistory = [
        { id: 'h-1', data: '2026-01-15 09:00', usuario: 'Sistema Radar', acao: 'Cliente cadastrado com sucesso na base comercial.', tipo: 'cadastro' },
        { id: 'h-2', data: '2026-07-07 10:15', usuario: 'Marcelo Baquero', acao: 'Cardápio recebido e submetido para homologação.', tipo: 'cardapio' },
        { id: 'h-3', data: '2026-07-07 10:20', usuario: 'Claude AI (Processamento)', acao: 'Mapeamento automatizado concluído com score de fit de 95 pts.', tipo: 'analise' },
        { id: 'h-4', data: '2026-07-07 14:00', usuario: 'Marcelo Baquero', acao: 'Curadoria de SKUs realizada e homologada no painel de inteligência.', tipo: 'curadoria' }
      ];
    } else if (rc.id === 3) {
      defaultHistory = [
        { id: 'h-3-1', data: '2026-07-08 09:30', usuario: 'Sistema Radar', acao: 'Estabelecimento identificado pelo Radar como prospect comercial em potencial.', tipo: 'cadastro' },
        { id: 'h-3-2', data: '2026-07-08 11:15', usuario: 'Claude AI (Processamento)', acao: 'Identificação de oportunidades no cardápio de Gero concluída. ID Radar gerado.', tipo: 'analise' }
      ];
    }

    return {
      id: rc.id,
      name: rc.name,
      fantasyName: rc.fantasyName,
      razaoSocial: rc.name,
      cnpj: fallbackCnpj,
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
      linkedin: fallbackLinkedin,
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
      historicoCompleto: defaultHistory,
      id_radar: rc.id_radar,
      id_erp: rc.id_erp,
      id_ctrade: rc.id_erp,
      statusConta: rc.statusConta || deriveStatusConta(rc.id_radar, rc.id_erp)
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
    const checkTargetId = () => {
      const targetId = localStorage.getItem('ctrade_selected_client_id');
      if (targetId) {
        const parsedId = parseInt(targetId, 10);
        if (!isNaN(parsedId)) {
          setSelectedClientId(parsedId);
          localStorage.removeItem('ctrade_selected_client_id');
        }
      }
    };
    checkTargetId();

    const handleOpenDossier = (e: Event) => {
      const customEvent = e as CustomEvent<{ clientId: number }>;
      if (customEvent.detail && customEvent.detail.clientId) {
        setSelectedClientId(customEvent.detail.clientId);
      }
    };
    window.addEventListener('open-client-dossier', handleOpenDossier);
    window.addEventListener('storage', checkTargetId);
    window.addEventListener('focus', checkTargetId);

    return () => {
      window.removeEventListener('open-client-dossier', handleOpenDossier);
      window.removeEventListener('storage', checkTargetId);
      window.removeEventListener('focus', checkTargetId);
    };
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

  // Account model states for New Client Form
  const [formStatusConta, setFormStatusConta] = useState<'Prospect Radar' | 'Cliente Convertido' | 'Cliente Base'>('Prospect Radar');
  const [formIdErp, setFormIdErp] = useState('');

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

  // Account model states for Edit Client Form
  const [editIdRadar, setEditIdRadar] = useState('');
  const [editIdErp, setEditIdErp] = useState('');

  // Custom Timeline note logging state
  const [timelineNote, setTimelineNote] = useState('');

  // Workspace filter and form states
  const [wsCategoryFilter, setWsCategoryFilter] = useState('all');
  const [wsBrandFilter, setWsBrandFilter] = useState('all');
  const [wsPriorityFilter, setWsPriorityFilter] = useState('all');
  const [wsIsAddingContact, setWsIsAddingContact] = useState(false);
  
  // New contact fields
  const [wsContactName, setWsContactName] = useState('');
  const [wsContactRole, setWsContactRole] = useState('');
  const [wsContactType, setWsContactType] = useState<'Decisor' | 'Influenciador' | 'Operacional'>('Decisor');
  const [wsContactPhone, setWsContactPhone] = useState('');
  const [wsContactEmail, setWsContactEmail] = useState('');
  const [wsContactLinkedin, setWsContactLinkedin] = useState('');
  const [wsContactInstagram, setWsContactInstagram] = useState('');
  const [wsContactNotes, setWsContactNotes] = useState('');

  // Commercial Interaction Logger states
  const [wsHistoryType, setWsHistoryType] = useState<'Ligação' | 'Visita' | 'E-mail' | 'Proposta' | 'Outro'>('Ligação');
  const [wsHistoryNotes, setWsHistoryNotes] = useState('');
  const [wsIsRegisteringHistory, setWsIsRegisteringHistory] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Account model conversion and import modals states
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [conversionIdErp, setConversionIdErp] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- HANDLERS ---
  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
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

    // Generate id_radar if required
    let finalIdRadar: string | undefined = undefined;
    if (formStatusConta === 'Prospect Radar' || formStatusConta === 'Cliente Convertido') {
      const randomDigits = String(100 + Math.floor(Math.random() * 900));
      finalIdRadar = `RAD-${randomDigits}`;
    }

    const finalIdErp = (formStatusConta === 'Cliente Base' || formStatusConta === 'Cliente Convertido') ? (formIdErp.trim() || `ERP-${Math.floor(1000 + Math.random() * 9000)}`) : undefined;
    const finalStatusConta = deriveStatusConta(finalIdRadar, finalIdErp);

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

      id_radar: finalIdRadar,
      id_erp: finalIdErp,
      statusConta: finalStatusConta,

      historicoCompleto: [
        { id: 'h-' + Date.now(), data: todayStr + ' ' + new Date().toTimeString().slice(0, 5), usuario: 'Sistema Radar', acao: `Cliente cadastrado com sucesso como ${finalStatusConta} na base comercial.`, tipo: 'cadastro' },
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
    setFormStatusConta('Prospect Radar');
    setFormIdErp('');

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
    setEditIdRadar(client.id_radar || '');
    setEditIdErp(client.id_erp || '');
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

        const finalStatusConta = deriveStatusConta(editIdRadar ? editIdRadar : undefined, editIdErp ? editIdErp : undefined);
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
          id_radar: editIdRadar || undefined,
          id_erp: editIdErp || undefined,
          id_ctrade: editIdErp || undefined,
          statusConta: finalStatusConta,
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

  const handleConvertProspect = (clientId: number, insertedIdErp: string) => {
    if (!insertedIdErp.trim()) {
      triggerToast('error', 'Conversão Rejeitada', 'Por favor, insira o ID ERP de destino.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = todayStr + ' ' + new Date().toTimeString().slice(0, 5);

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const history = c.historicoCompleto || [];
        const updatedHistory = [
          ...history,
          {
            id: 'h-conv-' + Date.now(),
            data: timestampStr,
            usuario: 'Marcelo Baquero (Você)',
            acao: `Conta convertida com sucesso para o ERP. Associado ID ERP: ${insertedIdErp.trim()}. Status do Ciclo de Vida: Cliente Convertido.`,
            tipo: 'atualizacao' as const
          }
        ];
        return {
          ...c,
          id_erp: insertedIdErp.trim(),
          id_ctrade: insertedIdErp.trim(),
          statusConta: 'Cliente Convertido' as const,
          dateUpdated: todayStr,
          historicoCompleto: updatedHistory
        };
      }
      return c;
    }));

    setIsConversionModalOpen(false);
    setConversionIdErp('');
    triggerToast('success', 'Conversão Concluída', `O prospect foi associado ao ID ERP "${insertedIdErp.trim()}" e evoluído no seu ciclo de vida.`);
  };

  const handleSimulateImport = (scenario: 'gero' | 'cipriani' | 'babbo') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = todayStr + ' ' + new Date().toTimeString().slice(0, 5);

    if (scenario === 'gero') {
      const gero = clients.find(c => c.id === 3 || c.cnpj === '45.890.123/0001-44');
      if (gero) {
        setClients(prev => prev.map(c => {
          if (c.id === gero.id) {
            const updatedHistory = [
              ...(c.historicoCompleto || []),
              {
                id: 'h-import-' + Date.now(),
                data: timestampStr,
                usuario: 'Importador C-Trade ERP',
                acao: 'Conta associada com ID ERP (ERP-4455) via sincronização automática da planilha. Status de ciclo de vida evoluído de "Prospect Radar" para "Cliente Convertido".',
                tipo: 'atualizacao' as const
              }
            ];
            return {
              ...c,
              id_erp: 'ERP-4455',
              id_ctrade: 'ERP-4455',
              statusConta: 'Cliente Convertido' as const,
              dateUpdated: todayStr,
              historicoCompleto: updatedHistory
            };
          }
          return c;
        }));
        triggerToast('success', 'Importação Concluída', 'O Prospect "Gero Ipanema" foi correspondido pelo CNPJ, atualizado e evoluído para Cliente Convertido no mesmo registro.');
      } else {
        triggerToast('warning', 'Erro na Simulação', 'Gero Ipanema não localizado na base.');
      }
    } else if (scenario === 'cipriani') {
      const hasCipriani = clients.some(c => c.cnpj === '33.221.098/0001-55');
      if (hasCipriani) {
        triggerToast('info', 'Cipriani Já Cadastrado', 'O restaurante Cipriani já foi importado anteriormente.');
      } else {
        const newClient: Client = {
          id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
          name: 'Cipriani Gastronomia do Brasil Ltda',
          fantasyName: 'Cipriani',
          razaoSocial: 'Cipriani Gastronomia do Brasil Ltda',
          cnpj: '33.221.098/0001-55',
          city: 'Rio de Janeiro',
          state: 'RJ',
          segment: 'Restaurante Italiano',
          category: 'Azeites, Tomates e Grãos',
          instagram: '@ciprianicopacabana',
          website: 'www.belmond.com',
          phone: '(21) 2548-7070',
          email: 'cipriani@belmond.com',
          responsible: 'Aniello Cassese',
          responsibleRole: 'Chef Executivo',
          observations: 'Cliente Base importado do ERP comercial C-Trade. Pronto para análises do Radar.',
          score: 85,
          potential: 'Alto',
          status: 'Entradas',
          lastAnalysis: 'Aguardando envio',
          lastUpload: 'Sem cardápio submetido',
          dateCreated: todayStr,
          dateUpdated: todayStr,
          id_erp: 'ERP-5566',
          id_ctrade: 'ERP-5566',
          statusConta: 'Cliente Base',
          responsibleCommercial: 'RCA Marcelo Baquero',
          historicoCompleto: [
            {
              id: 'h-import-new-' + Date.now(),
              data: timestampStr,
              usuario: 'Importador C-Trade ERP',
              acao: 'Cliente Base importado com sucesso do ERP C-Trade (ID ERP: ERP-5566). Cadastro limpo criado.',
              tipo: 'cadastro' as const
            }
          ]
        };
        setClients(prev => [newClient, ...prev]);
        triggerToast('success', 'Importação Concluída', 'Cipriani importado como "Cliente Base" (ID ERP: ERP-5566). Nenhum ID Radar atribuído.');
      }
    } else if (scenario === 'babbo') {
      const babbo = clients.find(c => c.id === 1 || c.cnpj === '12.345.678/0001-90');
      if (babbo) {
        setClients(prev => prev.map(c => {
          if (c.id === babbo.id) {
            const updatedHistory = [
              ...(c.historicoCompleto || []),
              {
                id: 'h-import-update-' + Date.now(),
                data: timestampStr,
                usuario: 'Importador C-Trade ERP',
                acao: 'Atualização cadastral realizada via importador de dados (Telefone atualizado para (21) 99999-8888). Sem duplicação de registro.',
                tipo: 'atualizacao' as const
              }
            ];
            return {
              ...c,
              phone: '(21) 99999-8888',
              dateUpdated: todayStr,
              historicoCompleto: updatedHistory
            };
          }
          return c;
        }));
        triggerToast('success', 'Importação Concluída', 'Cadastro do Babbo Osteria localizado pelo CNPJ e atualizado (Telefone). Duplicidade evitada.');
      }
    }

    setIsImportModalOpen(false);
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
          <span className="font-bold text-slate-800 leading-normal group-hover:text-blue-700 transition-colors flex flex-wrap items-center gap-1.5">
            {row.name}
            {row.statusConta && (
              <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded border leading-none ${
                row.statusConta === 'Prospect Radar' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                row.statusConta === 'Cliente Convertido' ? 'text-emerald-800 bg-emerald-50 border-emerald-200' :
                'text-blue-800 bg-blue-50 border-blue-200'
              }`}>
                {row.statusConta}
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
            <Building2 className="h-3 w-3 text-slate-300" />
            {row.fantasyName} {row.id_radar ? `| ID Radar: ${row.id_radar}` : ''} {row.id_erp ? `| ID ERP: ${row.id_erp}` : ''}
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
      render: (row) => (
        <div className="w-32 py-1">
          <FitComercial score={row.score} variant="bar" history={row.fitHistory} />
        </div>
      )
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

       {/* Conditional Rendering: Details View vs. Main Listing */}
      {selectedClient ? (
        <WorkspaceComercial
          client={selectedClient}
          onBack={() => setSelectedClientId(null)}
          setClients={setClients}
          rcas={rcas}
          triggerToast={triggerToast}
          handleTriggerMockAnalysis={handleTriggerMockAnalysis}
          handleOpenEditModal={handleOpenEditModal}
          setIsConversionModalOpen={setIsConversionModalOpen}
        />
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
              title="Nenhum cliente encontrado."
              description="Nenhum estabelecimento corresponde aos filtros e pesquisa selecionados. Ajuste os filtros ou crie um novo registro."
              action={
                <div className="flex flex-wrap items-center gap-2.5 justify-center">
                  <Button variant="outline" size="sm" onClick={handleClearFilters} leftIcon={<Eraser className="h-4 w-4" />}>
                    Limpar Filtros
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                    Cadastrar Cliente
                  </Button>
                </div>
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
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-blue-900 transition-colors flex flex-wrap items-center gap-1.5">
                                {client.fantasyName || client.name}
                                {client.statusConta && (
                                  <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded border leading-none shrink-0 ${
                                    client.statusConta === 'Prospect Radar' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                                    client.statusConta === 'Cliente Convertido' ? 'text-emerald-800 bg-emerald-50 border-emerald-200' :
                                    'text-blue-800 bg-blue-50 border-blue-200'
                                  }`}>
                                    {client.statusConta}
                                  </span>
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold block truncate">
                                Razão: {client.name}
                              </span>
                              {(client.id_radar || client.id_erp) && (
                                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                                  {client.id_radar ? `RAD: ${client.id_radar}` : ''} {client.id_erp ? `| ERP: ${client.id_erp}` : ''}
                                </span>
                              )}
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

              {/* Seção Modelo de Conta e Ciclo de Vida */}
              <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-150 space-y-4">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">Ciclo de Vida Comercial (Configuração de Conta)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Status da Conta (Lifecycle)"
                    options={[
                      { value: 'Prospect Radar', label: 'Prospect Radar (Origem Radar, Sem ID ERP)' },
                      { value: 'Cliente Convertido', label: 'Cliente Convertido (Origem Radar, Com ID ERP)' },
                      { value: 'Cliente Base', label: 'Cliente Base (Origem Direta ERP, Sem ID Radar)' },
                    ]}
                    value={formStatusConta}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFormStatusConta(val);
                    }}
                  />
                  {(formStatusConta === 'Cliente Base' || formStatusConta === 'Cliente Convertido') && (
                    <Input
                      label="Código ID ERP Oficial"
                      placeholder="Ex: ERP-4455"
                      value={formIdErp}
                      onChange={(e) => setFormIdErp(e.target.value)}
                    />
                  )}
                </div>
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

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-3">
                    <div>
                      <Select
                        label="Potencial Comercial (Calculado)"
                        options={[
                          { value: 'Muito Alto', label: 'Muito Alto' },
                          { value: 'Alto', label: 'Alto' },
                          { value: 'Médio', label: 'Médio' },
                          { value: 'Baixo', label: 'Baixo' },
                        ]}
                        value={editPotential}
                        onChange={() => {}}
                        disabled
                      />
                    </div>

                    <div>
                      <Input
                        label="Score de Adequação Comercial (Calculado)"
                        type="number"
                        placeholder="70"
                        value={editScore.toString()}
                        onChange={() => {}}
                        disabled
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block leading-normal">
                      ℹ️ O Fit Comercial e Potencial são calculados dinamicamente com base em cardápios e SKUs homologados.
                    </span>
                  </div>

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

                  {/* Seção IDs Operacionais da Conta */}
                  <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-150 col-span-1 sm:col-span-2 space-y-3">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">Identificadores Oficiais (Modelo de Conta)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="ID Radar (Identificador de Origem)"
                        placeholder="Ex: RAD-123"
                        value={editIdRadar}
                        onChange={(e) => setEditIdRadar(e.target.value)}
                      />
                      <Input
                        label="ID ERP C-Trade"
                        placeholder="Ex: ERP-4455"
                        value={editIdErp}
                        onChange={(e) => setEditIdErp(e.target.value)}
                      />
                    </div>
                  </div>
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

          {/* Modal de Conversão de Prospect em Cliente ERP */}
          {selectedClient && (
            <Modal
              isOpen={isConversionModalOpen}
              onClose={() => {
                setIsConversionModalOpen(false);
                setConversionIdErp('');
              }}
              title={`Evoluir Conta: ${selectedClient.fantasyName}`}
              size="md"
              footer={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsConversionModalOpen(false);
                      setConversionIdErp('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConvertProspect(selectedClient.id, conversionIdErp || `ERP-${Math.floor(1000 + Math.random() * 9000)}`)}
                  >
                    Confirmar Conversão & Vincular ERP
                  </Button>
                </>
              }
            >
              <div className="space-y-4 font-sans text-xs">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 space-y-1.5 font-sans">
                  <h4 className="font-black text-xs uppercase flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-700" />
                    Fluxo de Homologação de Contas
                  </h4>
                  <p className="leading-normal font-medium text-[11px]">
                    Este prospect comercial foi identificado pelo Radar C-Trade (ID Radar: <strong>{selectedClient.id_radar || 'Não Gerado'}</strong>).
                    Ao vinculá-lo a um ID ERP, seu ciclo de vida comercial é atualizado para <strong>Cliente Convertido</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <Input
                    label="Código ID ERP Oficial *"
                    placeholder="Ex: ERP-4455, ERP-1200, etc."
                    value={conversionIdErp}
                    onChange={(e) => setConversionIdErp(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 font-bold italic">
                    * Caso deixe em branco, um ID ERP oficial simulado será gerado automaticamente pelo motor comercial.
                  </p>
                </div>
              </div>
            </Modal>
          )}

          {/* Modal do Simulador de Entrada de Dados (Planilhas & ERP) */}
          <Modal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            title="Assistente do Pipeline de Entrada de Dados (Data Intake Simulator)"
            size="lg"
          >
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Mecanismo de Validação & Sincronização</span>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Para auditar o <strong>Modelo de Contas e Ciclo de Vida</strong> sem a necessidade de conexões externas reais, este assistente executa o pipeline oficial de importação contra nossa base local. Selecione um cenário para verificar como as regras de negócio tratam os dados:
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {/* Cenário 1 */}
                <div className="border border-slate-200 hover:border-blue-200 rounded-xl p-4 bg-white shadow-3xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                        Cenário 1: Evolução por CNPJ Match
                      </span>
                    </div>
                    <h5 className="font-black text-slate-800 text-xs mt-1">Planilha de Vendas Gero Ipanema</h5>
                    <p className="text-slate-500 font-medium leading-normal text-[11px]">
                      Gero Ipanema já existe como <strong>Prospect Radar</strong>. A planilha possui correspondência exata de CNPJ. O pipeline atualizará o registro existente e vinculará o ID ERP <strong>ERP-4455</strong>, evoluindo o status para <strong>Cliente Convertido</strong>. <strong className="text-emerald-700">Evita duplicação de contas.</strong>
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSimulateImport('gero')}
                    className="shrink-0"
                  >
                    Simular Importação (.xlsx)
                  </Button>
                </div>

                {/* Cenário 2 */}
                <div className="border border-slate-200 hover:border-blue-200 rounded-xl p-4 bg-white shadow-3xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                        Cenário 2: Cliente Base Puro (Sem Radar)
                      </span>
                    </div>
                    <h5 className="font-black text-slate-800 text-xs mt-1">Planilha de Clientes ERP - Restaurante Cipriani</h5>
                    <p className="text-slate-500 font-medium leading-normal text-[11px]">
                      Importa o renomado restaurante Cipriani (Copacabana Palace). Ele não possui ID Radar prévio. O pipeline registrará a conta diretamente como <strong>Cliente Base</strong> com ID ERP <strong>ERP-5566</strong>.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSimulateImport('cipriani')}
                    className="shrink-0"
                  >
                    Simular Importação (.xlsx)
                  </Button>
                </div>

                {/* Cenário 3 */}
                <div className="border border-slate-200 hover:border-blue-200 rounded-xl p-4 bg-white shadow-3xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                        Cenário 3: Sincronização de Ficha (Sem Duplicar)
                      </span>
                    </div>
                    <h5 className="font-black text-slate-800 text-xs mt-1">Sincronização de Cadastro - Babbo Osteria</h5>
                    <p className="text-slate-500 font-medium leading-normal text-[11px]">
                      Babbo Osteria é o principal cliente na base. A planilha traz o telefone atualizado para <strong>(21) 99999-8888</strong>. O pipeline identifica o CNPJ idêntico, atualiza a ficha e gera um log auditável em seu histórico sem duplicar o cadastro.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSimulateImport('babbo')}
                    className="shrink-0"
                  >
                    Simular Sincronização (.xlsx)
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setIsImportModalOpen(false)}>
                  Fechar Simulador
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </PageContainer>
  );
}
