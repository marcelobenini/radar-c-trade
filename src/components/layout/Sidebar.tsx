/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PageId } from '../../types';
import { useSecurity } from '../../hooks/useSecurity';
import {
  Home,
  Target,
  Building2,
  Brain,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Users,
  Library,
  Briefcase,
  RefreshCw,
  ShieldCheck,
  Database
} from 'lucide-react';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

// Maps PageId to its required module and action for RBAC validation
const pagePermissions: Record<PageId, { module: string; action: string }> = {
  visao_geral: { module: 'Dashboard', action: 'Visualizar' },
  relatorios: { module: 'Relatórios', action: 'Visualizar' },
  clientes: { module: 'Base de Clientes', action: 'Visualizar' },
  biblioteca: { module: 'Central de Cardápios', action: 'Visualizar' },
  produtos: { module: 'Catálogo de Produtos', action: 'Visualizar' },
  inteligencia: { module: 'Dashboard', action: 'Visualizar' },
  oportunidades: { module: 'Central de Oportunidades', action: 'Visualizar' },
  radar: { module: 'Radar Comercial', action: 'Visualizar' },
  integracoes: { module: 'Configurações', action: 'Visualizar' },
  usuarios: { module: 'Usuários', action: 'Visualizar' },
  configuracoes: { module: 'Configurações', action: 'Visualizar' },
  auditoria: { module: 'Auditoria', action: 'Visualizar Auditoria' },
  pipeline: { module: 'Central de Cardápios', action: 'Visualizar' }
};

export default function Sidebar({
  activePage,
  setActivePage,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const { hasPermission } = useSecurity();

  // Menu Definition structured by operational logic and data flow
  const menuGroups = [
    {
      title: 'Painel Executivo',
      items: [
        {
          id: 'visao_geral' as PageId,
          title: 'Visão Geral',
          subtitle: 'Dashboard Principal',
          icon: Home,
        },
        {
          id: 'relatorios' as PageId,
          title: 'Relatórios',
          subtitle: 'Resultados e Insights',
          icon: FileText,
        },
      ]
    },
    {
      title: 'Mapeamento & Cadastros',
      items: [
        {
          id: 'pipeline' as PageId,
          title: 'Pipeline de Entrada',
          subtitle: 'Ingestão e Validação',
          icon: Database,
        },
        {
          id: 'clientes' as PageId,
          title: 'Clientes',
          subtitle: 'Base Comercial',
          icon: Building2,
        },
        {
          id: 'biblioteca' as PageId,
          title: 'Cardápios',
          subtitle: 'Biblioteca de Cardápios',
          icon: Library,
        },
        {
          id: 'produtos' as PageId,
          title: 'Produtos',
          subtitle: 'Portfólio CTrade',
          icon: Package,
        },
      ]
    },
    {
      title: 'Inteligência Comercial',
      items: [
        {
          id: 'inteligencia' as PageId,
          title: 'Inteligência Comercial',
          subtitle: 'Motor de Cruzamento',
          icon: Brain,
        },
        {
          id: 'oportunidades' as PageId,
          title: 'Central de Oportunidades',
          subtitle: 'Opportunity Center',
          icon: Briefcase,
        },
        {
          id: 'radar' as PageId,
          title: 'Radar de Leads',
          subtitle: 'Filtro e Localização',
          icon: Target,
        },
      ]
    },
    {
      title: 'Administração',
      items: [
        {
          id: 'integracoes' as PageId,
          title: 'Integrações',
          subtitle: 'Conexão RD CRM',
          icon: RefreshCw,
        },
        {
          id: 'usuarios' as PageId,
          title: 'Usuários',
          subtitle: 'Controle de Acessos',
          icon: Users,
        },
        {
          id: 'auditoria' as PageId,
          title: 'Auditoria',
          subtitle: 'Histórico Operacional',
          icon: ShieldCheck,
        },
        {
          id: 'configuracoes' as PageId,
          title: 'Configurações',
          subtitle: 'Central de Parâmetros',
          icon: Settings,
        },
      ]
    }
  ];

  // Filter menu items by user permissions
  const filteredGroups = menuGroups.map(group => {
    const visibleItems = group.items.filter(item => {
      const perm = pagePermissions[item.id];
      if (!perm) return true;
      return hasPermission(perm.module, perm.action);
    });
    return { ...group, items: visibleItems };
  }).filter(group => group.items.length > 0);

  const handlePageSelect = (pageId: PageId) => {
    setActivePage(pageId);
    setIsMobileOpen(false); // Close drawer on mobile
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-100">
      <div className="flex-1 overflow-y-auto py-5 px-3">
        {/* Header Logo */}
        <div className="flex items-center justify-between mb-8 px-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white font-black text-lg">
              CT
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white tracking-wide">
                  CTrade
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Inteligência
                </span>
              </div>
            )}
          </div>

          {/* Close Mobile Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Box (Only if expanded) */}
        {!isSidebarCollapsed && (
          <div className="mb-6 px-3">
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/30 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Radar Comercial</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Mapeamento estratégico e insights gerados por inteligência artificial.
              </p>
            </div>
          </div>
        )}

        {/* Nav list with Sections */}
        <nav className="space-y-5">
          {filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!isSidebarCollapsed ? (
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                  {group.title}
                </span>
              ) : (
                <div className="h-px bg-slate-800/60 my-2 mx-3" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePageSelect(item.id)}
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-left relative group ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/10'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        <IconComponent className="h-5 w-5 stroke-[2]" />
                      </div>

                      {!isSidebarCollapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold leading-tight truncate">{item.title}</span>
                          <span className={`text-[9px] mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                            {item.subtitle}
                          </span>
                        </div>
                      )}

                      {/* Hover bubble helper for collapsed state */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                          {item.title}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Collapse Toggle Button footer-level */}
      <div className="border-t border-slate-800/80 p-3 hidden md:block">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800/50 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Ocultar Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:flex flex-col border-r border-slate-800 h-screen transition-all duration-300 bg-slate-900 sticky top-0 shrink-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {isMobileOpen && (
        <div id="mobile-sidebar-backdrop" className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs">
          <div className="w-72 h-full max-w-sm flex-col bg-slate-900">
            {renderSidebarContent()}
          </div>
          {/* Tap to close backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="flex-1"
          />
        </div>
      )}
    </>
  );
}
