/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, AlertCard, MetricCard } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge, Toast, EmptyState, ProgressBar } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Interactive';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';
import { useSecurity } from '../hooks/useSecurity';

import {
  FolderTree,
  Award,
  Package,
  Compass,
  MapPin,
  UserCheck,
  CheckCircle2,
  UploadCloud,
  FileSpreadsheet,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  X,
  FileText,
  RefreshCw,
  Check,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';

import {
  getPlatformConfig,
  savePlatformConfig,
  logAuditAction,
  PlatformConfig
} from '../utils/appearance';

import { REAL_PRODUCTS } from '../data/realData';

// Types for Custom Product
interface CustomProduct {
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
  priceLocal?: number;
  unit?: string;
  adherenceRate: number;
  analyzedCount: number;
  potentialCustomersCount: number;
  averageScore: number;
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
}

// Sub-Tab types
type CadastroTab = 'categorias' | 'marcas' | 'produtos' | 'segmentos' | 'regionais' | 'rcas' | 'status' | 'importacoes';

export default function Cadastros() {
  const { realUser } = useSecurity();
  const userName = realUser?.name || 'Marcelo Baquero (marcelobbaquero@gmail.com)';

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState<CadastroTab>('categorias');

  // Load configuration state
  const [config, setConfig] = useState<PlatformConfig>(() => getPlatformConfig());

  // Toast State
  const [toast, setToast] = useState<{ message: string; description: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Products State
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>(() => {
    const saved = localStorage.getItem('ctrade_custom_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing custom products', e);
      }
    }
    // Fallback to mapped real products
    return REAL_PRODUCTS.map(p => ({
      id: p.id,
      sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: p.name,
      brand: p.brand,
      category: p.category,
      origin: p.isImported ? 'Itália' : 'Brasil',
      description: p.notes || 'Insumo homologado de alta performance comercial.',
      isPremium: p.isPremium || false,
      isImported: p.isImported || false,
      status: (p.status as 'Ativo' | 'Inativo') || 'Ativo',
      priceLocal: p.priceLocal || 0,
      unit: p.unit || 'kg',
      adherenceRate: p.adherenceRate || 0,
      analyzedCount: p.analyzedCount || 0,
      potentialCustomersCount: p.potentialCustomersCount || 0,
      averageScore: p.averageScore || 0,
      potential: p.potential || 'Médio'
    }));
  });

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editItem, setEditItem] = useState<any>(null);

  // Form Inputs for Config lists
  const [inputName, setInputName] = useState('');

  // Form Inputs for Products
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    brand: '',
    category: '',
    origin: 'Brasil',
    isPremium: false,
    isImported: false,
    price: 0,
    unit: 'kg',
    description: ''
  });

  // --- IMPORTAÇÕES STATES ---
  const [importLogs, setImportLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('ctrade_import_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'imp-001', date: '2026-07-10 09:30', fileName: 'clientes_rj_v3.xlsx', type: 'Clientes', count: 18, status: 'Processado', user: 'Marcelo Baquero' },
      { id: 'imp-002', date: '2026-07-08 14:15', fileName: 'produtos_novos.csv', type: 'Produtos', count: 5, status: 'Processado', user: 'Aline Santos' }
    ];
  });
  
  const [importType, setImportType] = useState<'Clientes' | 'Produtos' | 'Oportunidades'>('Clientes');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Mapping, 3: Success
  const [importProgress, setImportProgress] = useState(0);
  const [importCount, setImportCount] = useState(10);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    'CNPJ': 'cnpj',
    'Nome Fantasia': 'fantasyName',
    'Razão Social': 'companyName',
    'Cidade': 'city',
    'Estado': 'state',
    'Segmento': 'segment',
    'Regional': 'regional'
  });

  // Save changes to localStorage / config helper
  const updateConfigList = (listKey: keyof PlatformConfig, newList: any[]) => {
    const updated = { ...config, [listKey]: newList };
    setConfig(updated);
    savePlatformConfig(updated);
  };

  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  const recordAudit = (setting: string, oldVal: string, newVal: string) => {
    logAuditAction(userName, setting, oldVal, newVal, 'Central de Cadastros');
    const updatedConfig = getPlatformConfig();
    setConfig(updatedConfig);
  };

  // Sync products in localStorage
  useEffect(() => {
    localStorage.setItem('ctrade_custom_products', JSON.stringify(customProducts));
    window.dispatchEvent(new Event('storage'));
  }, [customProducts]);

  // Sync import logs
  useEffect(() => {
    localStorage.setItem('ctrade_import_logs', JSON.stringify(importLogs));
  }, [importLogs]);

  // Filter current items based on search and tab
  const filteredList = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (activeTab === 'importacoes') return [];

    if (activeTab === 'produtos') {
      return customProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }

    // Config lists mapping
    let configKey: keyof PlatformConfig = 'categories';
    if (activeTab === 'categorias') configKey = 'categories';
    else if (activeTab === 'marcas') configKey = 'brands';
    else if (activeTab === 'segmentos') configKey = 'segments';
    else if (activeTab === 'regionais') configKey = 'regionals';
    else if (activeTab === 'rcas') configKey = 'rcas';
    else if (activeTab === 'status') configKey = 'statuses';

    const items = config[configKey] as any[] || [];
    if (!q) return items;
    return items.filter(item => item.name.toLowerCase().includes(q));
  }, [activeTab, config, customProducts, searchQuery]);

  // --- ACTIONS ---
  const handleToggleActive = (item: any) => {
    if (activeTab === 'produtos') {
      const updated = customProducts.map(p => 
        p.id === item.id ? { ...p, status: p.status === 'Ativo' ? 'Inativo' : 'Ativo' as const } : p
      );
      setCustomProducts(updated);
      recordAudit(`Produtos > Status do produto [${item.name}]`, item.status, item.status === 'Ativo' ? 'Inativo' : 'Ativo');
      triggerToast('success', 'Status Alterado', `O produto "${item.name}" foi alterado com sucesso.`);
      return;
    }

    let configKey: keyof PlatformConfig = 'categories';
    if (activeTab === 'categorias') configKey = 'categories';
    else if (activeTab === 'marcas') configKey = 'brands';
    else if (activeTab === 'segmentos') configKey = 'segments';
    else if (activeTab === 'regionais') configKey = 'regionals';
    else if (activeTab === 'rcas') configKey = 'rcas';
    else if (activeTab === 'status') configKey = 'statuses';

    const list = config[configKey] as any[];
    const updatedList = list.map(i => i.id === item.id ? { ...i, active: !i.active } : i);
    updateConfigList(configKey, updatedList);
    recordAudit(`Cadastros > Status de [${item.name}]`, item.active ? 'Ativo' : 'Inativo', !item.active ? 'Ativo' : 'Inativo');
    triggerToast('success', 'Status Alterado', `O item "${item.name}" foi atualizado.`);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditItem(null);
    setInputName('');
    setProductForm({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      brand: config.brands[0]?.name || '',
      category: config.categories[0]?.name || '',
      origin: 'Brasil',
      isPremium: false,
      isImported: false,
      price: 0,
      unit: 'kg',
      description: ''
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setEditItem(item);
    if (activeTab === 'produtos') {
      setProductForm({
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        category: item.category,
        origin: item.origin || 'Brasil',
        isPremium: item.isPremium || false,
        isImported: item.isImported || false,
        price: item.priceLocal || 0,
        unit: item.unit || 'kg',
        description: item.description || ''
      });
    } else {
      setInputName(item.name);
    }
    setShowFormModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'produtos') {
      if (!productForm.name.trim()) {
        triggerToast('error', 'Nome Obrigatório', 'Por favor, informe o nome do produto.');
        return;
      }

      if (modalMode === 'create') {
        const newProduct: CustomProduct = {
          id: `prod-${Date.now()}`,
          sku: productForm.sku,
          name: productForm.name,
          brand: productForm.brand,
          category: productForm.category,
          origin: productForm.origin,
          description: productForm.description,
          isPremium: productForm.isPremium,
          isImported: productForm.isImported,
          status: 'Ativo',
          priceLocal: Number(productForm.price),
          unit: productForm.unit,
          adherenceRate: 70, // Simulated default
          analyzedCount: 0,
          potentialCustomersCount: 0,
          averageScore: 70,
          potential: 'Alto'
        };
        setCustomProducts([newProduct, ...customProducts]);
        recordAudit('Produtos > Cadastrar Produto', 'Nenhum', newProduct.name);
        triggerToast('success', 'Produto Criado', `"${newProduct.name}" cadastrado com sucesso.`);
      } else {
        const updated = customProducts.map(p => 
          p.id === editItem.id ? {
            ...p,
            sku: productForm.sku,
            name: productForm.name,
            brand: productForm.brand,
            category: productForm.category,
            origin: productForm.origin,
            description: productForm.description,
            isPremium: productForm.isPremium,
            isImported: productForm.isImported,
            priceLocal: Number(productForm.price),
            unit: productForm.unit
          } : p
        );
        setCustomProducts(updated);
        recordAudit(`Produtos > Editar Produto [${editItem.name}]`, editItem.name, productForm.name);
        triggerToast('success', 'Produto Atualizado', 'As alterações foram salvas com sucesso.');
      }
    } else {
      if (!inputName.trim()) {
        triggerToast('error', 'Campo Obrigatório', 'Por favor, informe uma descrição/nome.');
        return;
      }

      let configKey: keyof PlatformConfig = 'categories';
      let prefix = 'cat';
      if (activeTab === 'categorias') { configKey = 'categories'; prefix = 'cat'; }
      else if (activeTab === 'marcas') { configKey = 'brands'; prefix = 'brd'; }
      else if (activeTab === 'segmentos') { configKey = 'segments'; prefix = 'seg'; }
      else if (activeTab === 'regionais') { configKey = 'regionals'; prefix = 'reg'; }
      else if (activeTab === 'rcas') { configKey = 'rcas'; prefix = 'rca'; }
      else if (activeTab === 'status') { configKey = 'statuses'; prefix = 'stat'; }

      const list = config[configKey] as any[] || [];

      if (modalMode === 'create') {
        const newItem = {
          id: `${prefix}-${Date.now().toString().slice(-4)}`,
          name: inputName,
          active: true
        };
        updateConfigList(configKey, [...list, newItem]);
        recordAudit(`Cadastros > Adicionar em [${activeTab}]`, 'Nenhum', newItem.name);
        triggerToast('success', 'Cadastro Realizado', `"${newItem.name}" adicionado com sucesso.`);
      } else {
        const updatedList = list.map(i => i.id === editItem.id ? { ...i, name: inputName } : i);
        updateConfigList(configKey, updatedList);
        recordAudit(`Cadastros > Editar em [${activeTab}]`, editItem.name, inputName);
        triggerToast('success', 'Cadastro Atualizado', 'Modificado com sucesso.');
      }
    }

    setShowFormModal(false);
  };

  const handleDeleteItem = (item: any) => {
    if (activeTab === 'produtos') {
      const updated = customProducts.filter(p => p.id !== item.id);
      setCustomProducts(updated);
      recordAudit(`Produtos > Remover Produto [${item.name}]`, item.name, 'Removido');
      triggerToast('warning', 'Produto Removido', `O produto "${item.name}" foi excluído.`);
      return;
    }

    let configKey: keyof PlatformConfig = 'categories';
    if (activeTab === 'categorias') configKey = 'categories';
    else if (activeTab === 'marcas') configKey = 'brands';
    else if (activeTab === 'segmentos') configKey = 'segments';
    else if (activeTab === 'regionais') configKey = 'regionals';
    else if (activeTab === 'rcas') configKey = 'rcas';
    else if (activeTab === 'status') configKey = 'statuses';

    const list = config[configKey] as any[];
    const updatedList = list.filter(i => i.id !== item.id);
    updateConfigList(configKey, updatedList);
    recordAudit(`Cadastros > Excluir de [${activeTab}]`, item.name, 'Excluído');
    triggerToast('warning', 'Registro Excluído', `"${item.name}" foi removido do sistema.`);
  };

  // --- DRAG & DROP FOR IMPORTAÇÕES ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setImportStep(2);
      } else {
        triggerToast('error', 'Formato Inválido', 'Por favor, submeta apenas arquivos Excel (.xlsx, .xls), CSV ou JSON.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImportStep(2);
    }
  };

  const handleSimulateImport = () => {
    setImportStep(2);
    // Auto map simulated mapping
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          handleCompleteImport();
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleCompleteImport = () => {
    // Generate new record and append
    const recordCount = importCount;
    if (importType === 'Clientes') {
      // Import clients simulator
      const savedClients = localStorage.getItem('ctrade_clients_list_v2');
      let clients = savedClients ? JSON.parse(savedClients) : [];
      
      const newClients = Array.from({ length: recordCount }).map((_, idx) => {
        const id = clients.length + idx + 1;
        return {
          id,
          cnpj: `XX.XXX.XXX/0001-${Math.floor(10 + Math.random() * 89)}`,
          fantasyName: `Restaurante Importado #${id}`,
          companyName: `Razão Social Importada #${id}`,
          city: 'São Paulo',
          state: 'SP',
          phone: '(11) 98765-4321',
          email: 'contato@restauranteimportado.com.br',
          segment: 'Italiano / Trattoria',
          regionalId: 'reg-sudeste',
          rcaId: 'rca-marcelo',
          status: 'Novo',
          score: 82,
          notes: 'Cliente importado via lote em planilha administrativa.',
          dateCreated: new Date().toISOString().split('T')[0]
        };
      });

      localStorage.setItem('ctrade_clients_list_v2', JSON.stringify([...newClients, ...clients]));
      window.dispatchEvent(new Event('storage'));
    } else if (importType === 'Produtos') {
      // Import products simulator
      const newProducts = Array.from({ length: recordCount }).map((_, idx) => {
        const id = customProducts.length + idx + 1;
        return {
          id: `prod-imp-${id}`,
          sku: `SKU-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
          name: `Insumo Lote #${id}`,
          brand: config.brands[0]?.name || 'Importada',
          category: config.categories[0]?.name || 'Insumos',
          origin: 'Itália',
          description: 'Produto importado via carga de metadados em lote.',
          isPremium: true,
          isImported: true,
          status: 'Ativo' as const,
          priceLocal: 89.90,
          unit: 'kg',
          adherenceRate: 85,
          analyzedCount: 0,
          potentialCustomersCount: 0,
          averageScore: 85,
          potential: 'Muito Alto' as const
        };
      });
      setCustomProducts([...newProducts, ...customProducts]);
    }

    // Add import log
    const newLog = {
      id: `imp-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      fileName: selectedFile?.name || 'dados_importados_lote.xlsx',
      type: importType,
      count: recordCount,
      status: 'Processado',
      user: userName.split(' ')[0]
    };

    setImportLogs([newLog, ...importLogs]);
    recordAudit(`Importações > Planilha de [${importType}]`, 'Nenhuma', `${newLog.fileName} (${recordCount} registros)`);
    setImportStep(3);
    triggerToast('success', 'Planilha Importada', `${recordCount} registros foram inseridos na base operacional com sucesso.`);
  };

  const handleResetImport = () => {
    setSelectedFile(null);
    setImportStep(1);
    setImportProgress(0);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Administração', active: false },
    { label: 'Cadastros e Metadados', active: true }
  ];

  // Map subtab definitions for visual headers
  const getTabTitle = () => {
    switch (activeTab) {
      case 'categorias': return 'Categorias de Produtos';
      case 'marcas': return 'Marcas do Catálogo';
      case 'produtos': return 'Catálogo Base de Produtos';
      case 'segmentos': return 'Segmentos de Culinária / Atuação';
      case 'regionais': return 'Canais Regionais de Venda';
      case 'rcas': return 'Representantes Comerciais (RCAs)';
      case 'status': return 'Status Operacionais do Funil';
      case 'importacoes': return 'Lote de Importações de Planilhas';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'categorias': return 'Defina as divisões de categorias de mercadorias oferecidas (ex: Farinhas, Tomates, Molhos, Massas, Azeites).';
      case 'marcas': return 'Cadastre as marcas de parceiros industriais ou importações representadas no portfólio de comercialização.';
      case 'produtos': return 'Configure os SKUs individuais de insumos, pesos, unidades de medida e códigos de barramento internos.';
      case 'segmentos': return 'Gerencie os nichos gastronômicos mapeados pelo Radar de inteligência comercial para classificar os estabelecimentos.';
      case 'regionais': return 'Delimite as macro-regiões de atendimento comercial para roteirização e consolidação das metas.';
      case 'rcas': return 'Representantes com acesso direto aos leads, controle de carteira regional e funis de oportunidade.';
      case 'status': return 'Customize as fases do fluxo de vendas dos leads curados de Inteligência Comercial ao CRM de conversão.';
      case 'importacoes': return 'Central administrativa para carregar planilhas completas de restaurantes prospectados de fontes externas.';
    }
  };

  return (
    <PageContainer id="page-central-cadastros">
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

      {/* Breadcrumb path */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Gestão de Cadastros"
        subtitle="Centralize todas as referências estruturadas, parametrizações de produtos e cargas de planilhas de forma integrada."
        badge="Administração"
      />

      {/* Main Grid: Navigation Sidebar + Content */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-2xs space-y-1">
            <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 block">Cadastros Comerciais</span>
            
            {(['categorias', 'marcas', 'produtos', 'segmentos'] as const).map((tab) => {
              const icons = { categorias: FolderTree, marcas: Award, produtos: Package, segmentos: Compass };
              const Icon = icons[tab];
              const labels = { categorias: 'Categorias', marcas: 'Marcas', produtos: 'Catálogo de Produtos', segmentos: 'Segmentos / Nichos' };
              
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === tab ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{labels[tab]}</span>
                </button>
              );
            })}

            <div className="h-px bg-slate-100 my-2" />
            <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 block">Metadados e Distribuição</span>

            {(['regionais', 'rcas', 'status', 'importacoes'] as const).map((tab) => {
              const icons = { regionais: MapPin, rcas: UserCheck, status: CheckCircle2, importacoes: UploadCloud };
              const Icon = icons[tab];
              const labels = { regionais: 'Regionais / Canais', rcas: 'Representantes / RCAs', status: 'Status do Funil', importacoes: 'Importação de Dados' };
              
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === tab ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{labels[tab]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          
          {/* Main Card */}
          <Card className="p-6">
            <div className="border-b border-slate-100 pb-5 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <span>{getTabTitle()}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {getTabDescription()}
                </p>
              </div>

              {activeTab !== 'importacoes' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={handleOpenCreate}
                >
                  Adicionar {activeTab === 'produtos' ? 'Produto SKU' : 'Registro'}
                </Button>
              )}
            </div>

            {/* Render Tab Contents */}
            {activeTab !== 'importacoes' ? (
              <div className="space-y-4">
                {/* Search Bar inside registries tab */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar registros..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/20 py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Table list */}
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-3xs">
                  {filteredList.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                          <th className="py-3 px-5">ID / SKU</th>
                          <th className="py-3 px-5">Nome / Descrição</th>
                          {activeTab === 'produtos' && (
                            <>
                              <th className="py-3 px-5">Marca</th>
                              <th className="py-3 px-5">Categoria</th>
                              <th className="py-3 px-5">Origem</th>
                              <th className="py-3 px-5 text-right">Preço</th>
                            </>
                          )}
                          <th className="py-3 px-5 text-center">Status</th>
                          <th className="py-3 px-5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredList.map((item) => {
                          const isActive = activeTab === 'produtos' ? item.status === 'Ativo' : item.active;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400">
                                {activeTab === 'produtos' ? item.sku : item.id}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="font-bold text-slate-800 block text-xs">{item.name}</span>
                                {item.description && (
                                  <span className="text-[10px] text-slate-400 line-clamp-1">{item.description}</span>
                                )}
                              </td>
                              {activeTab === 'produtos' && (
                                <>
                                  <td className="py-3.5 px-5 font-semibold text-slate-500">{item.brand}</td>
                                  <td className="py-3.5 px-5 text-slate-500">{item.category}</td>
                                  <td className="py-3.5 px-5">
                                    <Badge variant={item.isImported ? 'dark' : 'secondary'}>
                                      {item.isImported ? 'Importado' : 'Nacional'}
                                    </Badge>
                                  </td>
                                  <td className="py-3.5 px-5 text-right font-bold text-slate-900 font-mono">
                                    R$ {item.priceLocal ? item.priceLocal.toFixed(2) : '0,00'}
                                    <span className="text-[10px] text-slate-400 font-normal block">por {item.unit || 'kg'}</span>
                                  </td>
                                </>
                              )}
                              <td className="py-3.5 px-5 text-center">
                                <Badge variant={isActive ? 'success' : 'danger'}>
                                  {isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<Edit2 className="h-3 w-3" />}
                                    onClick={() => handleOpenEdit(item)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant={isActive ? 'outline' : 'success'}
                                    size="sm"
                                    leftIcon={<Power className="h-3 w-3" />}
                                    onClick={() => handleToggleActive(item)}
                                  >
                                    {isActive ? 'Desativar' : 'Reativar'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-rose-100 hover:bg-rose-50 text-rose-600"
                                    leftIcon={<Trash2 className="h-3 w-3" />}
                                    onClick={() => handleDeleteItem(item)}
                                  >
                                    Excluir
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12">
                      <EmptyState
                        title="Nenhum registro encontrado"
                        description="Experimente buscar por outros termos ou crie um registro novo."
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- IMPORTAÇÕES COMPONENT ---
              <div className="space-y-6">
                
                {/* Simulator Controls & DragZone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Controls: Settings */}
                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/40 text-left space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tipo do Lote</span>
                    <Select
                      label="Destinatário da Carga"
                      value={importType}
                      onChange={(e) => setImportType(e.target.value as any)}
                      options={[
                        { value: 'Clientes', label: 'Clientes (Prospects / Leads)' },
                        { value: 'Produtos', label: 'Produtos (Catálogo SKUs)' },
                        { value: 'Oportunidades', label: 'Oportunidades Comerciais' }
                      ]}
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registros Estimados</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={importCount}
                        onChange={(e) => setImportCount(Number(e.target.value))}
                        className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-1.5 px-3 focus:outline-hidden text-slate-700"
                      />
                      <span className="text-[9px] text-slate-400 block leading-tight">Define a quantidade de linhas que serão importadas ficticiamente para alimentar os testes.</span>
                    </div>

                    <div className="h-px bg-slate-100" />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      leftIcon={<Sparkles className="h-3.5 w-3.5 text-blue-900" />}
                      onClick={handleSimulateImport}
                    >
                      Carga de Teste Rápida
                    </Button>
                  </div>

                  {/* Right Drag & Drop */}
                  <div className="md:col-span-2">
                    {importStep === 1 ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] transition-all duration-200 ${isDragging ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50/20'}`}
                      >
                        <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 mb-3.5 border border-blue-100 shadow-3xs">
                          <UploadCloud className="h-7 w-7" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 block">Arraste a Planilha Comercial</span>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-sm leading-relaxed">Suporta extensões do Excel (.xlsx, .xls), CSV com delimitador vírgula ou JSON.</p>
                        
                        <label className="mt-4 inline-flex items-center gap-1.5 bg-blue-900 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-950 transition-colors cursor-pointer">
                          <span>Selecionar Arquivo</span>
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls, .json"
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </div>
                    ) : importStep === 2 ? (
                      <div className="border border-slate-100 rounded-2xl p-5 bg-white text-left space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Mapeamento de Colunas</span>
                            <p className="text-[10px] text-slate-400">Origem: <strong className="text-slate-600">{selectedFile?.name || 'Carga Lote'}</strong> ({importCount} linhas estimadas)</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleResetImport}>
                            Alterar Arquivo
                          </Button>
                        </div>

                        {importProgress > 0 ? (
                          <div className="py-6 space-y-3">
                            <span className="text-[10px] font-black uppercase text-blue-900 tracking-widest block animate-pulse">Lendo Planilha e Validando CNPJs...</span>
                            <ProgressBar value={importProgress} colorClass="bg-blue-600" />
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] text-slate-400 leading-normal">
                              Correlacione as colunas detectadas na planilha enviada com os campos mínimos de importação do banco de dados do Radar C-Trade:
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                              {Object.keys(columnMapping).map((key) => (
                                <div key={key} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
                                  <span className="text-[11px] font-bold text-slate-600">{key}</span>
                                  <ArrowRight className="h-3 w-3 text-slate-400" />
                                  <span className="text-[10px] font-mono font-black text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded">
                                    {columnMapping[key]}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={handleResetImport}>
                                Cancelar
                              </Button>
                              <Button variant="primary" size="sm" onClick={handleCompleteImport}>
                                Executar Importação
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border border-emerald-100 rounded-2xl p-6 bg-emerald-50/20 text-center flex flex-col items-center justify-center min-h-[220px]">
                        <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100 shadow-3xs">
                          <Check className="h-7 w-7" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-slate-800">Carga Processada com Sucesso</span>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-normal">
                          Foram inseridos <strong className="text-emerald-700">{importCount} novos registros</strong> na base operacional de {importType}. O painel foi atualizado instantaneamente.
                        </p>
                        <Button variant="outline" size="sm" onClick={handleResetImport}>
                          Importar Nova Planilha
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import logs table */}
                <div className="pt-4 border-t border-slate-100 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Histórico de Cargas e Atualizações em Lote
                  </span>

                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                          <th className="py-3 px-5">Data / Hora</th>
                          <th className="py-3 px-5">Arquivo</th>
                          <th className="py-3 px-5">Destinatário</th>
                          <th className="py-3 px-5 text-right">Registros</th>
                          <th className="py-3 px-5 text-center">Status</th>
                          <th className="py-3 px-5 text-right">Operador</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {importLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/20 transition-colors">
                            <td className="py-3 px-5 font-mono text-[10px] text-slate-400">{log.date}</td>
                            <td className="py-3 px-5 font-bold text-slate-700 flex items-center gap-1.5">
                              <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{log.fileName}</span>
                            </td>
                            <td className="py-3 px-5">
                              <Badge variant="secondary">{log.type}</Badge>
                            </td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 font-mono">{log.count}</td>
                            <td className="py-3 px-5 text-center">
                              <Badge variant="success">{log.status}</Badge>
                            </td>
                            <td className="py-3 px-5 text-right text-slate-500 font-semibold">{log.user}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>
      </div>

      {/* --- CRETATE / EDIT FORM MODAL --- */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={modalMode === 'create' ? `Criar em [${activeTab}]` : `Editar em [${activeTab}]`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowFormModal(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSaveItem}>Confirmar e Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveItem} className="text-left space-y-4">
          {activeTab === 'produtos' ? (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SKU do Produto"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="Ex: SKU-9081"
                />
                <Input
                  label="Nome Comercial *"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Farinha de Trigo Caputo Tipo 00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Marca do Portfólio"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  options={config.brands.map(b => ({ value: b.name, label: b.name }))}
                />
                <Select
                  label="Categoria de Enquadramento"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  options={config.categories.map(c => ({ value: c.name, label: c.name }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Origem Física"
                  value={productForm.origin}
                  onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                  options={[
                    { value: 'Brasil', label: 'Nacional (Brasil)' },
                    { value: 'Itália', label: 'Importado (Itália)' },
                    { value: 'Espanha', label: 'Importado (Espanha)' }
                  ]}
                />
                <Select
                  label="Unidade de Consumo"
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  options={[
                    { value: 'kg', label: 'Quilograma (kg)' },
                    { value: 'cx', label: 'Caixa (cx)' },
                    { value: 'L', label: 'Litro (L)' },
                    { value: 'un', label: 'Unidade (un)' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Preço Comercial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      placeholder="0.00"
                      className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 focus:outline-hidden text-slate-700 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-4 pt-6 text-left">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isPremium}
                      onChange={(e) => setProductForm({ ...productForm, isPremium: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Atributo Premium</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isImported}
                      onChange={(e) => setProductForm({ ...productForm, isImported: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Atributo Importado</span>
                  </label>
                </div>
              </div>

              <Textarea
                label="Notas e Aplicações do Insumo"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Ex: Recomendado para pizzas de longa fermentação e fermentação natural..."
              />
            </div>
          ) : (
            <Input
              label="Descrição / Descritivo *"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Ex: Novo Registro Administrativo"
            />
          )}
        </form>
      </Modal>
    </PageContainer>
  );
}
