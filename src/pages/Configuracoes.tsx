/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, AlertCard } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge, Toast, Tooltip } from '../components/ui/Feedback';
import { Modal, LateralDrawer, Accordion } from '../components/ui/Interactive';
import DataTable, { Column } from '../components/ui/Table';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import { useSecurity } from '../hooks/useSecurity';

import {
  Settings,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Sliders,
  ExternalLink,
  Plus,
  Compass,
  Lock,
  Shield,
  ShieldAlert,
  RefreshCw,
  Activity,
  BookOpen,
  Store,
  Check,
  Search,
  AlertTriangle,
  Workflow,
  X,
  MapPin,
  Clock,
  Building2,
  Users,
  Palette,
  FileText,
  Edit2,
  Power,
  ToggleLeft,
  ChevronRight,
  Database
} from 'lucide-react';

import {
  getPlatformConfig,
  savePlatformConfig,
  logAuditAction,
  PlatformConfig
} from '../utils/appearance';

// Constant list of preset primary colors
const PRESET_COLORS = [
  { name: 'CTrade Classic (Deep Blue)', value: '#1e3a8a', class: 'bg-[#1e3a8a]' },
  { name: 'Emerald Forest (Green)', value: '#059669', class: 'bg-[#059669]' },
  { name: 'Crimson Wine (Red)', value: '#dc2626', class: 'bg-[#dc2626]' },
  { name: 'Royal Violet (Purple)', value: '#7c3aed', class: 'bg-[#7c3aed]' },
  { name: 'Amber Gold (Orange/Gold)', value: '#d97706', class: 'bg-[#d97706]' },
  { name: 'Steel Slate (Slate)', value: '#475569', class: 'bg-[#475569]' }
];

export default function Configuracoes() {
  const { hasPermission, realUser } = useSecurity();
  const userName = realUser?.name || 'Marcelo Baquero (marcelobbaquero@gmail.com)';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'plataforma' | 'comercial' | 'catalogo' | 'curadoria' | 'usuarios' | 'aparencia' | 'auditoria' | 'integracoes'>('plataforma');

  // Load platform config state
  const [config, setConfig] = useState<PlatformConfig>(() => getPlatformConfig());

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; description: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // General Modal States for Confirmation and Critical Warnings
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [criticalData, setCriticalData] = useState<{
    title: string;
    description: string;
    impact: string;
    onConfirm: () => void;
  } | null>(null);

  // Commercial lists sub-tab selected
  const [selectedComercialList, setSelectedComercialList] = useState<'states' | 'regionals' | 'rcas' | 'segments' | 'statuses' | 'priorities' | 'fitRanges'>('states');

  // Catalog lists sub-tab selected
  const [selectedCatalogList, setSelectedCatalogList] = useState<'categories' | 'brands' | 'units' | 'catalogStatuses'>('categories');

  // Form modals for adding / editing items
  const [showFormModal, setShowFormModal] = useState(false);
  const [formModalData, setFormModalData] = useState<{
    mode: 'create' | 'edit';
    listType: 'comercial' | 'catalogo' | 'rejection' | 'message';
    listName: string;
    item?: any;
  } | null>(null);

  const [formInputName, setFormInputName] = useState('');
  const [formInputExtra, setFormInputExtra] = useState(''); // Used for range, or message text, etc.
  const [formInputTitle, setFormInputTitle] = useState(''); // Used for message title

  // Search keyword for logs
  const [auditSearch, setAuditSearch] = useState('');

  // Update list inside platform config
  const updateConfigList = (listKey: keyof PlatformConfig, newList: any[]) => {
    const updated = { ...config, [listKey]: newList };
    setConfig(updated);
    savePlatformConfig(updated);
  };

  // Trigger Toast Notification Helper
  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  // Confirmation trigger before saving
  const requestConfirmation = (title: string, description: string, onConfirm: () => void) => {
    setConfirmData({ title, description, onConfirm });
    setShowConfirmModal(true);
  };

  // Critical impact trigger
  const requestCriticalAction = (title: string, description: string, impact: string, onConfirm: () => void) => {
    setCriticalData({ title, description, impact, onConfirm });
    setShowCriticalModal(true);
  };

  // Audit event recorder
  const recordAudit = (setting: string, oldVal: string, newVal: string) => {
    logAuditAction(userName, setting, oldVal, newVal, 'Central de Configurações');
    // Refresh configuration state to load the new audit logs
    const updatedConfig = getPlatformConfig();
    setConfig(updatedConfig);
  };

  // --- SAVE PLATFORMA ---
  const [platformForm, setPlatformForm] = useState({
    companyName: config.companyName,
    logoUrl: config.logoUrl,
    timezone: config.timezone,
    language: config.language,
    theme: config.theme,
    institutionalInfo: config.institutionalInfo
  });

  useEffect(() => {
    setPlatformForm({
      companyName: config.companyName,
      logoUrl: config.logoUrl,
      timezone: config.timezone,
      language: config.language,
      theme: config.theme,
      institutionalInfo: config.institutionalInfo
    });
  }, [config]);

  const handleSavePlatform = () => {
    const oldName = config.companyName;
    const newName = platformForm.companyName;

    const performSave = () => {
      const updated = {
        ...config,
        companyName: platformForm.companyName,
        logoUrl: platformForm.logoUrl,
        timezone: platformForm.timezone,
        language: platformForm.language,
        theme: platformForm.theme,
        institutionalInfo: platformForm.institutionalInfo
      };
      setConfig(updated);
      savePlatformConfig(updated);
      
      // Audit
      recordAudit('Plataforma > Informações Gerais', `Nome: ${oldName}, Tema: ${config.theme}`, `Nome: ${newName}, Tema: ${platformForm.theme}`);
      triggerToast('success', 'Configurações Salvas', 'Os parâmetros institucionais da plataforma foram salvos e aplicados com sucesso.');
    };

    if (oldName !== newName) {
      requestCriticalAction(
        'Alterar Nome Institucional',
        `Você está alterando o nome oficial da empresa de "${oldName}" para "${newName}".`,
        'Isso afetará o cabeçalho, relatórios e todas as comunicações automáticas geradas pela plataforma.',
        performSave
      );
    } else {
      requestConfirmation(
        'Confirmar Alterações',
        'Deseja salvar as configurações da plataforma e fuso horário?',
        performSave
      );
    }
  };

  // --- SAVE APARÊNCIA ---
  const [selectedAccentColor, setSelectedAccentColor] = useState(config.accentColor || '#1e3a8a');

  const handleSaveAparencia = () => {
    const oldColor = config.accentColor;
    const newColor = selectedAccentColor;

    const performSave = () => {
      const updated = {
        ...config,
        accentColor: selectedAccentColor
      };
      setConfig(updated);
      savePlatformConfig(updated);
      recordAudit('Aparência > Cor Principal', oldColor, newColor);
      triggerToast('success', 'Identidade Visual Atualizada', 'A cor de destaque da plataforma foi alterada e aplicada imediatamente em todo o sistema.');
    };

    requestCriticalAction(
      'Confirmar Mudança de Cor',
      'Você está alterando a cor principal de destaque do Radar C-Trade.',
      'A identidade visual inteira da plataforma será redefinida imediatamente para a nova tonalidade (botões, badges, focos e links).',
      performSave
    );
  };

  // --- SAVE CURADORIA ---
  const [homologationRules, setHomologationRules] = useState(config.homologationRules || '');
  const [mandatoryFields, setMandatoryFields] = useState(config.mandatoryFields || []);

  useEffect(() => {
    setHomologationRules(config.homologationRules || '');
    setMandatoryFields(config.mandatoryFields || []);
  }, [config]);

  const handleSaveCuradoria = () => {
    requestConfirmation(
      'Salvar Parâmetros de Curadoria',
      'Deseja atualizar as regras de homologação e campos obrigatórios para curadoria?',
      () => {
        const updated = {
          ...config,
          homologationRules,
          mandatoryFields
        };
        setConfig(updated);
        savePlatformConfig(updated);
        recordAudit('Curadoria > Regras e Campos', 'Alteração nos formulários de curadoria', 'Configurações salvas');
        triggerToast('success', 'Parâmetros de Curadoria Salvos', 'Regras de validação de cardápios e mensagens atualizadas com sucesso.');
      }
    );
  };

  const toggleMandatoryField = (id: string) => {
    const updated = mandatoryFields.map(f => {
      if (f.id === id) {
        return { ...f, required: !f.required };
      }
      return f;
    });
    setMandatoryFields(updated);
  };

  // --- LIST OPERATION HANDLERS ---
  const handleToggleItemActive = (listKey: keyof PlatformConfig, id: string, name: string) => {
    const list = config[listKey] as any[];
    const item = list.find(i => i.id === id);
    if (!item) return;

    const oldStatus = item.active ? 'Ativo' : 'Inativo';
    const newStatus = !item.active ? 'Ativo' : 'Inativo';

    const performToggle = () => {
      const updatedList = list.map(i => (i.id === id ? { ...i, active: !i.active } : i));
      updateConfigList(listKey, updatedList);
      recordAudit(`Configurações Comerciais > Status do item [${name}]`, oldStatus, newStatus);
      triggerToast('success', 'Status Alterado', `O item "${name}" foi marcado como ${newStatus.toLowerCase()}.`);
    };

    if (item.active) {
      requestCriticalAction(
        'Desativar Registro Administrativo',
        `Você está desativando o registro "${name}".`,
        'Este item deixará de aparecer como opção ativa nos formulários e filtros de pesquisa de toda a plataforma.',
        performToggle
      );
    } else {
      performToggle();
    }
  };

  const handleOpenCreateModal = (listType: 'comercial' | 'catalogo' | 'rejection' | 'message', listName: string) => {
    setFormModalData({ mode: 'create', listType, listName });
    setFormInputName('');
    setFormInputExtra('');
    setFormInputTitle('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (listType: 'comercial' | 'catalogo' | 'rejection' | 'message', listName: string, item: any) => {
    setFormModalData({ mode: 'edit', listType, listName, item });
    setFormInputName(item.name || item.reason || item.title || '');
    setFormInputExtra(item.range || item.text || '');
    setFormInputTitle(item.title || '');
    setShowFormModal(true);
  };

  const handleSaveFormModal = () => {
    if (!formModalData) return;
    const { mode, listType, listName, item } = formModalData;

    // Determine config list key
    let configKey: keyof PlatformConfig = 'states';
    if (listType === 'comercial') {
      configKey = selectedComercialList as keyof PlatformConfig;
    } else if (listType === 'catalogo') {
      configKey = selectedCatalogList as keyof PlatformConfig;
    } else if (listType === 'rejection') {
      configKey = 'rejectionReasons';
    } else if (listType === 'message') {
      configKey = 'defaultMessages';
    }

    const currentList = (config[configKey] as any[]) || [];

    if (mode === 'create') {
      const newId = `${listKeyPrefix(configKey)}-${Date.now().toString().slice(-4)}`;
      let newItem: any = { id: newId, active: true };
      
      if (configKey === 'rejectionReasons') {
        newItem.reason = formInputName;
      } else if (configKey === 'defaultMessages') {
        newItem.title = formInputTitle;
        newItem.text = formInputExtra;
      } else if (configKey === 'fitRanges') {
        newItem.name = formInputName;
        newItem.range = formInputExtra;
      } else {
        newItem.name = formInputName;
      }

      const updatedList = [...currentList, newItem];
      updateConfigList(configKey, updatedList);
      recordAudit(`Cadastro > Novo item no módulo [${listName}]`, 'Nenhum', formInputName || formInputTitle);
      triggerToast('success', 'Item Cadastrado', `"${formInputName || formInputTitle}" adicionado com sucesso.`);
    } else if (mode === 'edit' && item) {
      const updatedList = currentList.map(i => {
        if (i.id === item.id) {
          if (configKey === 'rejectionReasons') {
            return { ...i, reason: formInputName };
          } else if (configKey === 'defaultMessages') {
            return { ...i, title: formInputTitle, text: formInputExtra };
          } else if (configKey === 'fitRanges') {
            return { ...i, name: formInputName, range: formInputExtra };
          } else {
            return { ...i, name: formInputName };
          }
        }
        return i;
      });
      updateConfigList(configKey, updatedList);
      recordAudit(`Cadastro > Edição de item [${item.name || item.reason || item.title}]`, item.name || item.reason || item.title, formInputName || formInputTitle);
      triggerToast('success', 'Item Atualizado', 'As alterações foram salvas administrativamente.');
    }

    setShowFormModal(false);
  };

  const listKeyPrefix = (key: keyof PlatformConfig): string => {
    switch (key) {
      case 'states': return 'est';
      case 'regionals': return 'reg';
      case 'rcas': return 'rca';
      case 'segments': return 'seg';
      case 'statuses': return 'stat';
      case 'priorities': return 'prio';
      case 'fitRanges': return 'fit';
      case 'categories': return 'cat';
      case 'brands': return 'brd';
      case 'units': return 'uni';
      case 'catalogStatuses': return 'cstat';
      case 'rejectionReasons': return 'rej';
      case 'defaultMessages': return 'msg';
      default: return 'item';
    }
  };

  // Filter logs based on search
  const filteredLogs = config.auditLogs.filter(log => {
    const searchLower = auditSearch.toLowerCase();
    return (
      log.id.toLowerCase().includes(searchLower) ||
      log.user.toLowerCase().includes(searchLower) ||
      log.settingChanged.toLowerCase().includes(searchLower) ||
      log.oldValue.toLowerCase().includes(searchLower) ||
      log.newValue.toLowerCase().includes(searchLower) ||
      log.origin.toLowerCase().includes(searchLower)
    );
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Central de Configurações', active: true }
  ];

  return (
    <PageContainer id="page-central-configuracoes">
      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <Toast
            message={toast.message}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={confirmData?.title || 'Confirmar Alteração'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (confirmData?.onConfirm) confirmData.onConfirm();
              setShowConfirmModal(false);
            }}>Confirmar</Button>
          </>
        }
      >
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {confirmData?.description}
        </p>
      </Modal>

      {/* Critical Action Warning Modal */}
      <Modal
        isOpen={showCriticalModal}
        onClose={() => setShowCriticalModal(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span>Alerta de Impacto Crítico</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCriticalModal(false)}>Cancelar Operação</Button>
            <Button variant="danger" size="sm" onClick={() => {
              if (criticalData?.onConfirm) criticalData.onConfirm();
              setShowCriticalModal(false);
            }}>Estou Ciente, Confirmar</Button>
          </>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-700 font-bold leading-normal">
            {criticalData?.description}
          </p>
          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-[11px] text-rose-700 font-medium">
            <span className="font-black uppercase tracking-wider block mb-1">Impacto Previsto:</span>
            {criticalData?.impact}
          </div>
        </div>
      </Modal>

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={formModalData?.mode === 'create' ? `Novo Item: ${formModalData.listName}` : `Editar Item: ${formModalData?.listName}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowFormModal(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSaveFormModal} disabled={!formInputName.trim() && !formInputTitle.trim()}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4 text-left">
          {formModalData?.listType === 'message' ? (
            <>
              <Input
                label="Título da Mensagem"
                placeholder="Ex: Confirmação de Aprovação"
                value={formInputTitle}
                onChange={(e) => setFormInputTitle(e.target.value)}
              />
              <Textarea
                label="Conteúdo da Mensagem Padrão"
                placeholder="Escreva a mensagem utilizando tags dinâmicas como {vendedor}, {score}, {cliente}..."
                value={formInputExtra}
                onChange={(e) => setFormInputExtra(e.target.value)}
              />
            </>
          ) : formModalData?.listKey === 'fitRanges' || (formModalData?.listType === 'comercial' && selectedComercialList === 'fitRanges') ? (
            <>
              <Input
                label="Nome da Faixa"
                placeholder="Ex: Muito Alto Fit"
                value={formInputName}
                onChange={(e) => setFormInputName(e.target.value)}
              />
              <Input
                label="Faixa de Pontuação"
                placeholder="Ex: 85 - 100"
                value={formInputExtra}
                onChange={(e) => setFormInputExtra(e.target.value)}
              />
            </>
          ) : (
            <Input
              label="Nome / Descrição"
              placeholder="Ex: São Paulo (SP) ou Italiano"
              value={formInputName}
              onChange={(e) => setFormInputName(e.target.value)}
            />
          )}
          <p className="text-[10px] text-slate-400">
            As alterações nos parâmetros serão registradas na trilha de auditoria e vinculadas ao perfil de administrador.
          </p>
        </div>
      </Modal>

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Central de Configurações"
        subtitle="Parametrização completa e controle administrativo de metadados, regras de curadoria, aparência e logs operacionais do Radar C-Trade."
        badge="Administrativo"
      />

      {/* 8 Sections Main Layout (Tabs) */}
      <div className="mt-6 flex flex-col xl:flex-row gap-6">
        
        {/* Left Vertical Navigation Menu */}
        <div className="xl:w-64 shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-2xs space-y-1">
            <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 block">Configurações Gerais</span>
            
            <button
              onClick={() => setActiveTab('plataforma')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'plataforma' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4.5 w-4.5" />
                <span>Plataforma</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('comercial')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'comercial' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="h-4.5 w-4.5" />
                <span>Comercial</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('catalogo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'catalogo' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="h-4.5 w-4.5" />
                <span>Catálogo</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('curadoria')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'curadoria' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4.5 w-4.5" />
                <span>Curadoria</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('usuarios')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'usuarios' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4.5 w-4.5" />
                <span>Usuários & Permissões</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('aparencia')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'aparencia' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="h-4.5 w-4.5" />
                <span>Aparência</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'auditoria' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="h-4.5 w-4.5" />
                <span>Logs & Auditoria</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('integracoes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'integracoes' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <Workflow className="h-4.5 w-4.5" />
                <span>Integrações (Stand By)</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          
          {/* TAB 1: PLATAFORMA */}
          {activeTab === 'plataforma' && (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5 text-left">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-blue-900" />
                    Parâmetros Institucionais
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Definições básicas de nomenclatura, idioma, fuso horário e dados institucionais do Radar C-Trade.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                  <Input
                    label="Nome da Empresa"
                    value={platformForm.companyName}
                    onChange={(e) => setPlatformForm({ ...platformForm, companyName: e.target.value })}
                    helperText="Nome oficial da empresa utilizado nas visualizações."
                  />
                  
                  <Select
                    label="Fuso Horário Principal"
                    value={platformForm.timezone}
                    onChange={(e) => setPlatformForm({ ...platformForm, timezone: e.target.value })}
                    options={[
                      { value: 'America/Sao_Paulo (GMT-3)', label: 'America/São Paulo (GMT-3)' },
                      { value: 'America/Manaus (GMT-4)', label: 'America/Manaus (GMT-4)' },
                      { value: 'America/Noronha (GMT-2)', label: 'America/Noronha (GMT-2)' }
                    ]}
                  />

                  <Select
                    label="Idioma do Sistema"
                    value={platformForm.language}
                    onChange={(e) => setPlatformForm({ ...platformForm, language: e.target.value })}
                    options={[
                      { value: 'pt-BR', label: 'Português (Brasil)' },
                      { value: 'en-US', label: 'English (US)' },
                      { value: 'es-ES', label: 'Español (España)' }
                    ]}
                  />

                  <Select
                    label="Tema Padrão"
                    value={platformForm.theme}
                    onChange={(e) => setPlatformForm({ ...platformForm, theme: e.target.value as 'claro' | 'escuro' })}
                    options={[
                      { value: 'claro', label: 'Claro (Light Theme)' },
                      { value: 'escuro', label: 'Escuro (Dark Theme)' }
                    ]}
                  />

                  <div className="col-span-1 md:col-span-2">
                    <Textarea
                      label="Informações Institucionais da Plataforma"
                      value={platformForm.institutionalInfo}
                      onChange={(e) => setPlatformForm({ ...platformForm, institutionalInfo: e.target.value })}
                      placeholder="Descrição institucional exibida nos canais..."
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-blue-900" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Informações de Build da Plataforma</span>
                        <p className="text-[10px] text-slate-400">Versão compilada: <strong className="text-slate-600">{config.version}</strong> | Último deploy estável: 2026-07-10</p>
                      </div>
                    </div>
                    <Badge variant="dark">Produção</Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={() => setConfig(getPlatformConfig())}>Descartar</Button>
                  <Button variant="primary" size="sm" onClick={handleSavePlatform}>Salvar Alterações</Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: COMERCIAL */}
          {activeTab === 'comercial' && (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Compass className="h-4.5 w-4.5 text-blue-900" />
                      Parâmetros Comerciais
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Gerencie as tabelas de referência de Localização, Canais, Segmentação e Status dos Leads Comerciais.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      const listLabels: Record<string, string> = {
                        states: 'Estados',
                        regionals: 'Regionais',
                        rcas: 'RCAs',
                        segments: 'Segmentos de Culinária',
                        statuses: 'Status Comercial',
                        priorities: 'Níveis de Prioridade',
                        fitRanges: 'Faixas de Score'
                      };
                      handleOpenCreateModal('comercial', listLabels[selectedComercialList]);
                    }}
                  >
                    Adicionar Registro
                  </Button>
                </div>

                {/* Sub tab select button grid */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 border border-slate-200/50 rounded-xl mb-5">
                  {(['states', 'regionals', 'rcas', 'segments', 'statuses', 'priorities', 'fitRanges'] as const).map((sub) => {
                    const labels = {
                      states: 'Estados',
                      regionals: 'Regionais',
                      rcas: 'RCAs',
                      segments: 'Segmentos',
                      statuses: 'Status dos Leads',
                      priorities: 'Prioridades',
                      fitRanges: 'Faixas de Fit'
                    };
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedComercialList(sub)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedComercialList === sub ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {labels[sub]}
                      </button>
                    );
                  })}
                </div>

                {/* List DataTable rendering dynamically */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <th className="py-3 px-4">Código / ID</th>
                        <th className="py-3 px-4">Descrição / Nome</th>
                        {selectedComercialList === 'fitRanges' && <th className="py-3 px-4">Limites do Score</th>}
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(config[selectedComercialList] as any[] || []).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{item.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                          {selectedComercialList === 'fitRanges' && (
                            <td className="py-3 px-4 font-mono text-[11px] text-blue-900 font-extrabold bg-blue-50/30 px-2 py-0.5 rounded max-w-max">
                              {item.range || 'N/A'}
                            </td>
                          )}
                          <td className="py-3 px-4 text-center">
                            <Badge variant={item.active ? 'success' : 'danger'}>
                              {item.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Edit2 className="h-3 w-3" />}
                                onClick={() => handleOpenEditModal('comercial', selectedComercialList, item)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant={item.active ? 'outline' : 'success'}
                                size="sm"
                                leftIcon={<Power className="h-3 w-3" />}
                                onClick={() => handleToggleItemActive(selectedComercialList, item.id, item.name)}
                              >
                                {item.active ? 'Inativar' : 'Ativar'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-start gap-2.5 text-left">
                  <ShieldAlert className="h-4.5 w-4.5 text-blue-900 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <strong>Aviso de Integridade Comercial:</strong> Os registros em uso na base de leads de clientes não devem ser excluídos. Eles podem ser desativados administrativamente, impedindo que novos cadastros utilizem o parâmetro inativado.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: CATÁLOGO */}
          {activeTab === 'catalogo' && (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Database className="h-4.5 w-4.5 text-blue-900" />
                      Parâmetros do Catálogo
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure as referências estruturais do portfólio de produtos, incluindo categorias de marcas, SKUs e unidades operacionais.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      const listLabels: Record<string, string> = {
                        categories: 'Categorias de Produtos',
                        brands: 'Marcas do Catálogo',
                        units: 'Unidades de Medida',
                        catalogStatuses: 'Status de Produto'
                      };
                      handleOpenCreateModal('catalogo', listLabels[selectedCatalogList]);
                    }}
                  >
                    Adicionar Registro
                  </Button>
                </div>

                {/* Catalog subtabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 border border-slate-200/50 rounded-xl mb-5">
                  {(['categories', 'brands', 'units', 'catalogStatuses'] as const).map((sub) => {
                    const labels = {
                      categories: 'Categorias de Produtos',
                      brands: 'Marcas',
                      units: 'Unidades de Medida',
                      catalogStatuses: 'Status de Catálogo'
                    };
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedCatalogList(sub)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCatalogList === sub ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {labels[sub]}
                      </button>
                    );
                  })}
                </div>

                {/* List DataTable rendering dynamically */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <th className="py-3 px-4">Código / ID</th>
                        <th className="py-3 px-4">Nome / Unidade</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(config[selectedCatalogList] as any[] || []).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{item.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={item.active ? 'success' : 'danger'}>
                              {item.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Edit2 className="h-3 w-3" />}
                                onClick={() => handleOpenEditModal('catalogo', selectedCatalogList, item)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant={item.active ? 'outline' : 'success'}
                                size="sm"
                                leftIcon={<Power className="h-3 w-3" />}
                                onClick={() => handleToggleItemActive(selectedCatalogList, item.id, item.name)}
                              >
                                {item.active ? 'Inativar' : 'Ativar'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: CURADORIA */}
          {activeTab === 'curadoria' && (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5 text-left">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-blue-900" />
                    Regras de Curadoria e Homologação
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure os critérios de validação dos cardápios curados, mensagens padrões e campos mínimos obrigatórios antes da exportação definitiva ao CRM.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  
                  {/* Mandatory fields card */}
                  <div className="p-5 border border-slate-100 rounded-2xl bg-white shadow-2xs space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campos de Preenchimento Obrigatório</span>
                    <p className="text-[11px] text-slate-400">Marque quais metadados estruturados de leads e cardápios são estritamente exigidos antes da aprovação de curadoria.</p>
                    
                    <div className="space-y-3">
                      {mandatoryFields.map((field: any) => (
                        <div key={field.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">{field.name}</span>
                            <span className="text-[10px] text-slate-400">{field.required ? 'Impede validação se em branco' : 'Alerta opcional'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleMandatoryField(field.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-1 focus:ring-blue-900 focus:ring-offset-1 ${
                              field.required ? 'bg-blue-900' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                field.required ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Homologation rules card */}
                  <div className="space-y-6">
                    <div className="p-5 border border-slate-100 rounded-2xl bg-white shadow-2xs space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diretrizes de Homologação</span>
                      <Textarea
                        label="Regra de Aprovação ou Escalabilidade"
                        value={homologationRules}
                        onChange={(e) => setHomologationRules(e.target.value)}
                        placeholder="Escreva as diretrizes comerciais..."
                      />
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-emerald-800 block">Sincronização de Homologação Ativa</span>
                        <p className="text-[10px] text-emerald-700 leading-normal mt-0.5">
                          Todas as alterações feitas nestes parâmetros afetarão instantaneamente os alertas exibidos aos curadores na aba de curadoria e auditoria pré-CRM.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Sub-section: Motivos de Rejeição */}
                <div className="mt-8 border-t border-slate-100 pt-6 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motivos de Rejeição para Curadoria</span>
                      <p className="text-xs text-slate-400 mt-0.5">Mapeie as razões pré-cadastradas para devolução de arquivos pelos curadores aos canais operacionais.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => handleOpenCreateModal('rejection', 'Motivo de Rejeição')}
                    >
                      Novo Motivo
                    </Button>
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Motivo de Devolução</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {config.rejectionReasons.map((rej) => (
                          <tr key={rej.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{rej.id}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{rej.reason}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={rej.active ? 'success' : 'danger'}>
                                {rej.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Edit2 className="h-3 w-3" />}
                                  onClick={() => handleOpenEditModal('rejection', 'Motivo de Rejeição', rej)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant={rej.active ? 'outline' : 'success'}
                                  size="sm"
                                  leftIcon={<Power className="h-3 w-3" />}
                                  onClick={() => handleToggleItemActive('rejectionReasons', rej.id, rej.reason)}
                                >
                                  {rej.active ? 'Inativar' : 'Ativar'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sub-section: Mensagens Padrão */}
                <div className="mt-8 border-t border-slate-100 pt-6 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Templates e Mensagens Padrões</span>
                      <p className="text-xs text-slate-400 mt-0.5">Gerencie os modelos de e-mails, alertas e notificações disparadas para as equipes de vendas e curadoria.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => handleOpenCreateModal('message', 'Mensagem Padrão')}
                    >
                      Novo Template
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.defaultMessages.map((msg) => (
                      <div key={msg.id} className="p-4 border border-slate-100 bg-white rounded-xl shadow-2xs relative hover:shadow-xs transition-all text-left flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant={msg.active ? 'success' : 'secondary'}>{msg.active ? 'Disponível' : 'Bloqueado'}</Badge>
                            <span className="font-mono text-[9px] text-slate-400">{msg.id}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800">{msg.title}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                            {msg.text}
                          </p>
                        </div>
                        <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100/50">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Edit2 className="h-3 w-3" />}
                            onClick={() => handleOpenEditModal('message', 'Mensagem Padrão', msg)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant={msg.active ? 'outline' : 'success'}
                            size="sm"
                            leftIcon={<Power className="h-3 w-3" />}
                            onClick={() => handleToggleItemActive('defaultMessages', msg.id, msg.title)}
                          >
                            {msg.active ? 'Desabilitar' : 'Habilitar'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={() => {
                    setHomologationRules(config.homologationRules);
                    setMandatoryFields(config.mandatoryFields);
                  }}>Descartar</Button>
                  <Button variant="primary" size="sm" onClick={handleSaveCuradoria}>Salvar Diretrizes de Curadoria</Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: USUÁRIOS E PERMISSÕES */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-blue-900" />
                    Gerenciamento de Usuários e Perfis (RBAC)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    A segurança das chaves de API e das configurações do Radar C-Trade é gerida pelo módulo de controle de perfis de usuários administrativos.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 space-y-3 col-span-1 md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu Perfil Atual</span>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-900 text-white font-black text-sm flex items-center justify-center">
                        MB
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{userName}</span>
                        <Badge variant="success">Administrador Master</Badge>
                      </div>
                    </div>
                    <div className="h-px bg-slate-200/60 my-3" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Seu perfil possui total acesso administrativo para alterar os parâmetros comerciais, atualizar o catálogo de marcas de produtos, parametrizar as faixas de score de fit de cardápios e redefinir a aparência global do sistema.
                    </p>
                  </div>

                  <div className="p-5 border border-slate-100 rounded-2xl bg-white shadow-2xs space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atalho Operacional</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">Módulo de Cadastro de Colaboradores</h4>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1 font-semibold">
                        Acesse a tela dedicada de gestão de perfis de usuários para adicionar novos vendedores, alterar permissões ou inativar contas.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full mt-4"
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'usuarios' }));
                      }}
                    >
                      Ir para Gestão de Usuários
                    </Button>
                  </div>

                </div>
              </Card>
            </div>
          )}

          {/* TAB 6: APARÊNCIA */}
          {activeTab === 'aparencia' && (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5 text-left">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="h-4.5 w-4.5 text-blue-900" />
                    Customização da Identidade Visual
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gerencie a cor principal, o tema padrão e os arquivos de logos do CTrade Radar. Mudanças de identidade visual afetam toda a plataforma.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  
                  {/* Accent Color Picker Panel */}
                  <div className="lg:col-span-2 space-y-5 p-5 border border-slate-100 rounded-2xl bg-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cor de Destaque Primária</span>
                    <p className="text-[11px] text-slate-400">Selecione uma tonalidade da nossa paleta corporativa testada para acessibilidade de contraste visual, ou digite uma cor hexadecimal personalizada.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setSelectedAccentColor(preset.value)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs font-bold transition-all ${
                            selectedAccentColor === preset.value ? 'border-blue-900 bg-blue-50/10 font-black shadow-2xs' : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`h-5 w-5 rounded-md ${preset.class} shrink-0 border border-slate-200`} />
                          <span className="truncate">{preset.name.split(' (')[0]}</span>
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                      <Input
                        label="Cor Hexadecimal Customizada"
                        value={selectedAccentColor}
                        onChange={(e) => setSelectedAccentColor(e.target.value)}
                        placeholder="Ex: #1e3a8a"
                      />
                      <div className="flex gap-2 items-center self-end pb-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">Visualização:</span>
                        <div
                          className="h-9 w-20 rounded-xl border border-slate-200 shadow-2xs"
                          style={{ backgroundColor: selectedAccentColor }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Placeholders and Preview Card */}
                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Prévia de Elemento com Estilo</span>
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Botão Primário</span>
                          <button
                            className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                            style={{ backgroundColor: selectedAccentColor }}
                          >
                            Exemplo de Ação
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Badge Ativo</span>
                          <span
                            className="text-[10px] font-black text-white px-2 py-0.5 rounded-md uppercase"
                            style={{ backgroundColor: selectedAccentColor }}
                          >
                            CTrade Fit
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Link Ativo</span>
                          <span className="text-xs font-bold underline cursor-pointer" style={{ color: selectedAccentColor }}>
                            Excluir Registro
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Arquivos do Sistema</span>
                      <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-slate-400" />
                          <span className="font-bold text-slate-600">favicon.ico</span>
                        </div>
                        <Badge variant="secondary">Padrão</Badge>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 text-left">
                  <Button variant="outline" size="sm" onClick={() => setSelectedAccentColor(config.accentColor || '#1e3a8a')}>Restaurar Paleta Oficial</Button>
                  <Button variant="primary" size="sm" onClick={handleSaveAparencia}>Aplicar Aparência Imediatamente</Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: LOGS E AUDITORIA */}
          {activeTab === 'auditoria' && (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-blue-900" />
                      Trilha de Auditoria e Logs Administrativos
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Registro histórico obrigatório e imutável de todas as alterações feitas nas parametrizações comerciais e configurações do Radar C-Trade.
                    </p>
                  </div>
                  <div className="w-full md:w-64">
                    <Input
                      placeholder="Pesquisar logs por palavra-chave..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>
                </div>

                {/* Audit Table */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">Data / Hora</th>
                        <th className="py-3 px-4">Usuário</th>
                        <th className="py-3 px-4">Configuração Alterada</th>
                        <th className="py-3 px-4">Valor Anterior</th>
                        <th className="py-3 px-4">Novo Valor</th>
                        <th className="py-3 px-4">Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{log.id}</td>
                            <td className="py-3 px-4 text-slate-500 font-bold text-[10px] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-700 max-w-[150px] truncate" title={log.user}>
                              {log.user.split(' (')[0]}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-bold">{log.settingChanged}</td>
                            <td className="py-3 px-4 font-mono text-[10px] max-w-[120px] truncate text-slate-400" title={log.oldValue}>
                              {log.oldValue}
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] max-w-[120px] truncate text-blue-900 font-bold" title={log.newValue}>
                              {log.newValue}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{log.origin}</Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            Nenhum registro de auditoria encontrado para o termo "{auditSearch}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-bold px-1">
                  <span>Trilha auditada em tempo real em conformidade com as regras de governança CTrade.</span>
                  <span>Registrados {filteredLogs.length} eventos</span>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 8: INTEGRAÇÕES */}
          {activeTab === 'integracoes' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <Card>
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Workflow className="h-4.5 w-4.5 text-blue-900" />
                    Central de Integrações da Plataforma (Stand By)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Espaço reservado para desenvolvimento e conexões de APIs de terceiros, CRM e provedores cognitivos de IA.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Card 1: Gemini */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-all">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                          <Settings className="h-5 w-5" />
                        </span>
                        <Badge variant="warning">Stand By</Badge>
                      </div>
                      <h4 className="text-xs font-black text-slate-800">Google Gemini API</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Conexão com a inteligência artificial generativa da Google para análise semântica de cardápios e preenchimento automático de leads e oportunidades.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Planejado para v1.5</span>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">Em desenvolvimento</span>
                    </div>
                  </div>

                  {/* Card 2: Claude */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-all">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl">
                          <Workflow className="h-5 w-5" />
                        </span>
                        <Badge variant="warning">Stand By</Badge>
                      </div>
                      <h4 className="text-xs font-black text-slate-800">Claude Anthropic Integration</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Integração nativa com os modelos de linguagem Claude para refinamento de curadoria tática e elaboração de relatórios comerciais aprofundados.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Planejado para v1.6</span>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">Em desenvolvimento</span>
                    </div>
                  </div>

                  {/* Card 3: RD Station */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-all">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="p-2.5 bg-purple-50 text-purple-900 rounded-xl">
                          <ExternalLink className="h-5 w-5" />
                        </span>
                        <Badge variant="warning">Stand By</Badge>
                      </div>
                      <h4 className="text-xs font-black text-slate-800">RD Station CRM</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Sincronização bidirecional de funil de vendas, movendo oportunidades táticas homologadas no CTrade diretamente para as contas dos RCAs no RD Station.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Planejado para v2.0</span>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">Em desenvolvimento</span>
                    </div>
                  </div>

                  {/* Card 4: ERP Integrador */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-all">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="p-2.5 bg-amber-50 text-amber-900 rounded-xl">
                          <Database className="h-5 w-5" />
                        </span>
                        <Badge variant="warning">Stand By</Badge>
                      </div>
                      <h4 className="text-xs font-black text-slate-800">ERP & Catálogo Integrado</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        API para conexão em tempo real com o banco de dados do faturamento para atualização automática de preços, estoques e disponibilidades de marcas importadas.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Planejado para v2.0</span>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">Em desenvolvimento</span>
                    </div>
                  </div>

                </div>

                <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100/40 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <strong>Aviso de Escopo do MVP:</strong> Nenhuma API de integração externa está ativa no momento para proteger as credenciais de segurança e evitar custos de processamento desnecessários durante a fase de prototipagem e validação comercial.
                  </p>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
