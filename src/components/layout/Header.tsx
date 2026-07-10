/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Menu, Search, Bell, Shield, ShieldAlert, RotateCcw, UserX,
  Building2, Tag, BookOpen, TrendingUp, ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';
import { useSecurity } from '../../hooks/useSecurity';
import { REAL_PRODUCTS, REAL_CLIENTS, REAL_CARDAPIOS, REAL_OPPORTUNITIES } from '../../data/realData';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Header({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: HeaderProps) {
  const { isSimulating, activeRole, stopSimulation, hasPermission } = useSecurity();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Data states
  const [clients, setClients] = useState<any[]>(REAL_CLIENTS);
  const [menus, setMenus] = useState<any[]>(REAL_CARDAPIOS);
  const [opportunities, setOpportunities] = useState<any[]>(REAL_OPPORTUNITIES);

  // Load from local storage
  const loadData = () => {
    try {
      const savedClients = localStorage.getItem('ctrade_clients_list_v2');
      if (savedClients) setClients(JSON.parse(savedClients));

      const savedMenus = localStorage.getItem('ctrade_menu_library');
      if (savedMenus) setMenus(JSON.parse(savedMenus));

      const savedOpps = localStorage.getItem('ctrade_opportunities_data');
      if (savedOpps) setOpportunities(JSON.parse(savedOpps));
    } catch (err) {
      console.error("Error loading search data: ", err);
    }
  };

  useEffect(() => {
    loadData();
    // Re-load data on focus or storage change to keep search fully synchronized
    window.addEventListener('focus', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('focus', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Permissions checks
  const canViewClients = hasPermission('Base de Clientes', 'Visualizar');
  const canViewProducts = hasPermission('Catálogo de Produtos', 'Visualizar');
  const canViewMenus = hasPermission('Central de Cardápios', 'Visualizar');
  const canViewOpportunities = hasPermission('Central de Oportunidades', 'Visualizar');

  // Text matching helper
  const matchText = (text: string | undefined | null, query: string): boolean => {
    if (!text) return false;
    const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedText.includes(normalizedQuery);
  };

  // Clientes matching
  const matchClient = (client: any, query: string) => {
    const cleanQuery = query.replace(/\D/g, '');
    const cleanCnpj = (client.cnpj || '').replace(/\D/g, '');
    if (cleanQuery && cleanCnpj && cleanCnpj.includes(cleanQuery)) {
      return true;
    }
    
    return (
      matchText(client.name, query) ||
      matchText(client.fantasyName, query) ||
      matchText(client.responsible, query) ||
      matchText(client.responsibleRole, query) ||
      matchText(client.email, query) ||
      matchText(client.linkedin, query) ||
      matchText(client.city, query) ||
      matchText(client.state, query) ||
      matchText(client.responsibleCommercial, query) ||
      matchText(client.regionalId, query) ||
      (client.regionalId === 'reg-sudeste' && matchText('Sudeste', query)) ||
      (client.regionalId === 'reg-sul' && matchText('Sul', query)) ||
      (client.regionalId === 'reg-nordeste' && matchText('Nordeste', query)) ||
      (client.regionalId === 'reg-centro-oeste' && matchText('Centro-Oeste', query))
    );
  };

  // Produtos matching
  const matchProduct = (product: any, query: string) => {
    if (matchText(product.sku, query)) return true;
    return (
      matchText(product.name, query) ||
      matchText(product.brand, query) ||
      matchText(product.category, query) ||
      matchText(product.manufacturer, query)
    );
  };

  // Cardápios matching
  const matchMenu = (menu: any, query: string) => {
    return (
      matchText(menu.nomeEstabelecimento, query) ||
      matchText(menu.responsavelAnalise, query) ||
      matchText(menu.status, query) ||
      matchText(menu.dataCardapio, query) ||
      matchText(menu.cidade, query) ||
      matchText(menu.estado, query)
    );
  };

  // Oportunidades matching
  const matchOpportunity = (opp: any, query: string) => {
    const productsMatch = opp.produtosRecomendados?.some((p: string) => matchText(p, query));
    return (
      matchText(opp.cliente, query) ||
      matchText(opp.categoria, query) ||
      matchText(opp.status, query) ||
      matchText(opp.prioridade, query) ||
      productsMatch
    );
  };

  // Filtered Lists (limited to 5 results per module)
  const filteredClients = useMemo(() => {
    if (!searchQuery || !canViewClients) return [];
    return clients.filter(c => matchClient(c, searchQuery)).slice(0, 5);
  }, [searchQuery, clients, canViewClients]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery || !canViewProducts) return [];
    return REAL_PRODUCTS.filter(p => matchProduct(p, searchQuery)).slice(0, 5);
  }, [searchQuery, canViewProducts]);

  const filteredMenus = useMemo(() => {
    if (!searchQuery || !canViewMenus) return [];
    return menus.filter(m => matchMenu(m, searchQuery)).slice(0, 5);
  }, [searchQuery, menus, canViewMenus]);

  const filteredOpps = useMemo(() => {
    if (!searchQuery || !canViewOpportunities) return [];
    return opportunities.filter(o => matchOpportunity(o, searchQuery)).slice(0, 5);
  }, [searchQuery, opportunities, canViewOpportunities]);

  // Flattened results for easy keyboard navigation
  const flatResultsList = useMemo(() => {
    const list: { type: 'client' | 'product' | 'menu' | 'opportunity'; data: any }[] = [];
    filteredClients.forEach(c => list.push({ type: 'client', data: c }));
    filteredProducts.forEach(p => list.push({ type: 'product', data: p }));
    filteredMenus.forEach(m => list.push({ type: 'menu', data: m }));
    filteredOpps.forEach(o => list.push({ type: 'opportunity', data: o }));
    return list;
  }, [filteredClients, filteredProducts, filteredMenus, filteredOpps]);

  const totalResultsCount = flatResultsList.length;

  const getItemGlobalIndex = (type: 'client' | 'product' | 'menu' | 'opportunity', localIndex: number) => {
    let offset = 0;
    if (type === 'client') return localIndex;
    offset += filteredClients.length;
    if (type === 'product') return offset + localIndex;
    offset += filteredProducts.length;
    if (type === 'menu') return offset + localIndex;
    offset += filteredMenus.length;
    if (type === 'opportunity') return offset + localIndex;
    return -1;
  };

  const handleSelect = (type: 'client' | 'product' | 'menu' | 'opportunity', item: any) => {
    setIsOpen(false);
    setSearchQuery('');
    
    if (type === 'client') {
      localStorage.setItem('ctrade_selected_client_id', item.id.toString());
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'clientes' }));
      window.dispatchEvent(new CustomEvent('open-client-dossier', { detail: { clientId: item.id } }));
    } else if (type === 'product') {
      localStorage.setItem('ctrade_selected_product_id', item.id);
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'produtos' }));
      window.dispatchEvent(new CustomEvent('open-product', { detail: { productId: item.id } }));
    } else if (type === 'menu') {
      localStorage.setItem('ctrade_selected_menu_id', item.id.toString());
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'biblioteca' }));
      window.dispatchEvent(new CustomEvent('open-menu', { detail: { menuId: item.id } }));
    } else if (type === 'opportunity') {
      localStorage.setItem('ctrade_selected_opportunity_id', item.id);
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'oportunidades' }));
      window.dispatchEvent(new CustomEvent('open-opportunity', { detail: { opportunityId: item.id } }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResultsList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResultsList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatResultsList.length) {
        const selectedItem = flatResultsList[selectedIndex];
        handleSelect(selectedItem.type, selectedItem.data);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'Administrador': return 'Diretor Comercial';
      case 'Supervisor': return 'Supervisor Regional';
      case 'Curadoria': return 'Curador Líder';
      case 'RCA / Comercial': return 'RCA Comercial';
      case 'Somente Leitura': return 'Auditor (Leitura)';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'Administrador') {
      return <ShieldAlert className="h-3.5 w-3.5 text-rose-600 animate-pulse" />;
    }
    return <Shield className="h-3.5 w-3.5 text-blue-500" />;
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button (Desktop) */}
        <button
          id="desktop-toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Toggle Sidebar Button (Mobile Drawer) */}
        <button
          id="mobile-toggle-btn"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          title="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* CTrade Logo / Badge on Header */}
        <div className="flex items-center gap-2 mr-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-sm tracking-wide shrink-0">
            CT
          </div>
          <span className="font-bold text-slate-800 tracking-tight hidden lg:inline-block">
            CTrade <span className="text-blue-600 font-medium text-xs bg-blue-50 px-1.5 py-0.5 rounded-md ml-1">Radar</span>
          </span>
        </div>
      </div>

      {/* Profile Simulation Warning Banner */}
      {isSimulating && (
        <div id="simulation-active-banner" className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-950 px-3.5 py-1.5 rounded-xl shadow-2xs animate-fadeIn max-w-full overflow-hidden shrink-0">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
          <span className="text-xs font-bold leading-none tracking-tight whitespace-nowrap">
            Modo Simulação: <span className="font-black text-amber-800 underline">{activeRole}</span>
          </span>
          <button
            onClick={stopSimulation}
            className="flex items-center gap-1 bg-amber-950 hover:bg-amber-900 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-950 hover:scale-102 hover:shadow-xs transition-all cursor-pointer shrink-0 ml-1.5"
            title="Finalizar simulação de perfil"
          >
            <RotateCcw className="h-3 w-3 stroke-[2.5]" />
            <span>Sair</span>
          </button>
        </div>
      )}

      {/* Center/Search Section */}
      {!isSimulating && (
        <div ref={searchRef} className="flex-1 max-w-sm sm:max-w-md md:max-w-lg mx-2 sm:mx-6 relative">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="global-search-input"
              type="text"
              placeholder="Pesquisar clientes, SKUs, marcas, cidades..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndex(-1);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown Overlay */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 mt-1.5 w-full max-h-[480px] overflow-y-auto rounded-xl border border-slate-150 bg-white shadow-lg animate-fadeIn text-slate-800">
              {!searchQuery ? (
                <div className="p-4 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Sugestões de Pesquisa</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-medium">
                    <button onClick={() => setSearchQuery('Babbo')} className="text-left bg-slate-50 hover:bg-slate-100/80 p-2 rounded-lg border border-slate-100 transition-colors flex items-center justify-between group">
                      <span>Restaurante: "Babbo"</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button onClick={() => setSearchQuery('106')} className="text-left bg-slate-50 hover:bg-slate-100/80 p-2 rounded-lg border border-slate-100 transition-colors flex items-center justify-between group">
                      <span>SKU Fiordilatte: "106"</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button onClick={() => setSearchQuery('Rio de Janeiro')} className="text-left bg-slate-50 hover:bg-slate-100/80 p-2 rounded-lg border border-slate-100 transition-colors flex items-center justify-between group">
                      <span>Cidade: "Rio de Janeiro"</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button onClick={() => setSearchQuery('Caputo')} className="text-left bg-slate-50 hover:bg-slate-100/80 p-2 rounded-lg border border-slate-100 transition-colors flex items-center justify-between group">
                      <span>Marca: "Caputo"</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Navegue com ↑ ↓ Enter para selecionar</span>
                    <span>ESC para fechar</span>
                  </div>
                </div>
              ) : (
                <div>
                  {totalResultsCount === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">Nenhum resultado encontrado</p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">Tente buscar por termos parciais, cidades, marcas, SKUs ou categorias.</p>
                    </div>
                  ) : (
                    <div className="py-2 divide-y divide-slate-100">
                      {/* Clientes Group */}
                      {canViewClients && filteredClients.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center">
                            <span>Clientes</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px]">{filteredClients.length}</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filteredClients.map((c, idx) => {
                              const itemIndex = getItemGlobalIndex('client', idx);
                              const isSelected = selectedIndex === itemIndex;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => handleSelect('client', c)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                                    isSelected ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="truncate pr-4">
                                    <span className="text-xs font-bold text-slate-800 block truncate">{c.fantasyName || c.name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                                      <Building2 className="h-3 w-3 inline mr-1 text-slate-400" /> {c.name} • {c.city}, {c.state} • CNPJ: {c.cnpj}
                                    </span>
                                  </div>
                                  <ChevronRight className={`h-3.5 w-3.5 text-slate-300 shrink-0 ${isSelected ? 'text-blue-500 translate-x-0.5' : ''} transition-all`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Produtos Group */}
                      {canViewProducts && filteredProducts.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center">
                            <span>Catálogo de Produtos</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px]">{filteredProducts.length}</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filteredProducts.map((p, idx) => {
                              const itemIndex = getItemGlobalIndex('product', idx);
                              const isSelected = selectedIndex === itemIndex;
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => handleSelect('product', p)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                                    isSelected ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="truncate pr-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                                      <span className="bg-blue-50 text-blue-800 border border-blue-100 rounded px-1.5 py-0.2 text-[9px] font-bold">SKU {p.sku}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                                      <Tag className="h-3 w-3 inline mr-1 text-slate-400" /> {p.brand} • {p.category}
                                    </span>
                                  </div>
                                  <ChevronRight className={`h-3.5 w-3.5 text-slate-300 shrink-0 ${isSelected ? 'text-blue-500 translate-x-0.5' : ''} transition-all`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Cardápios Group */}
                      {canViewMenus && filteredMenus.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center">
                            <span>Cardápios / Análises</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px]">{filteredMenus.length}</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filteredMenus.map((m, idx) => {
                              const itemIndex = getItemGlobalIndex('menu', idx);
                              const isSelected = selectedIndex === itemIndex;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => handleSelect('menu', m)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                                    isSelected ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="truncate pr-4">
                                    <span className="text-xs font-bold text-slate-800 block truncate">Cardápio: {m.nomeEstabelecimento}</span>
                                    <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                                      <BookOpen className="h-3 w-3 inline mr-1 text-slate-400" /> {m.responsavelAnalise || 'Marcelo Baquero (Você)'} • Status: {m.status} • {m.dataCardapio || m.data}
                                    </span>
                                  </div>
                                  <ChevronRight className={`h-3.5 w-3.5 text-slate-300 shrink-0 ${isSelected ? 'text-blue-500 translate-x-0.5' : ''} transition-all`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Oportunidades Group */}
                      {canViewOpportunities && filteredOpps.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center">
                            <span>Oportunidades</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px]">{filteredOpps.length}</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filteredOpps.map((o, idx) => {
                              const itemIndex = getItemGlobalIndex('opportunity', idx);
                              const isSelected = selectedIndex === itemIndex;
                              return (
                                <button
                                  key={o.id}
                                  onClick={() => handleSelect('opportunity', o)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                                    isSelected ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="truncate pr-4">
                                    <span className="text-xs font-bold text-slate-800 block truncate">Oportunidade: {o.cliente}</span>
                                    <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                                      <TrendingUp className="h-3 w-3 inline mr-1 text-slate-400" /> Prioridade: {o.prioridade} • Status: {o.status} • Categoria: {o.categoria}
                                    </span>
                                  </div>
                                  <ChevronRight className={`h-3.5 w-3.5 text-slate-300 shrink-0 ${isSelected ? 'text-blue-500 translate-x-0.5' : ''} transition-all`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex items-center justify-between text-[10px] text-slate-400 font-bold px-4">
                    <span>Use ↑ ↓ Enter para navegar</span>
                    <span>ESC para fechar</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right User Controls Section */}
      <div className="flex items-center gap-4">
        {/* Mock Notifications Button */}
        <button
          id="notifications-btn"
          className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          title="Notificações"
          disabled
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
        </button>

        <div className="h-8 w-px bg-slate-100"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800 leading-none">Marcelo Baquero</span>
            <span className={`text-[11px] font-medium mt-1 flex items-center justify-end gap-1 ${isSimulating ? 'text-amber-700 font-extrabold' : 'text-slate-400'}`}>
              {getRoleIcon(activeRole)}
              {getRoleTitle(activeRole)}
              {isSimulating && <span className="text-[9px] font-black uppercase text-amber-500 border border-amber-200 bg-amber-50/50 px-1 rounded-sm ml-0.5">Simulado</span>}
            </span>
          </div>

          {/* Avatar Placeholder */}
          <div id="user-avatar-placeholder" className={`relative h-9 w-9 rounded-lg border flex items-center justify-center font-bold text-xs shadow-xs hover:border-slate-300 transition-colors ${
            isSimulating 
              ? 'bg-amber-500 border-amber-600 text-white font-black' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            {isSimulating ? <UserX className="h-4.5 w-4.5" /> : 'MB'}
            <span className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white ${isSimulating ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></span>
          </div>
        </div>
      </div>
    </header>
  );
}
