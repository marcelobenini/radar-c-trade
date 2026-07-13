/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PageId } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ContentWrapper from './components/layout/ContentWrapper';
import { useSecurity } from './hooks/useSecurity';
import { ShieldAlert } from 'lucide-react';
import { getPlatformConfig, applyPlatformAppearance } from './utils/appearance';

// Page Imports
import VisaoGeral from './pages/VisaoGeral';
import RadarComercial from './pages/RadarComercial';
import Clientes from './pages/Clientes';
import InteligenciaComercial from './pages/InteligenciaComercial';
import Oportunidades from './pages/Oportunidades';
import Integracoes from './pages/Integracoes';
import Produtos from './pages/Produtos';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import Biblioteca from './pages/Biblioteca';
import Auditoria from './pages/Auditoria';
import PipelineIntake from './pages/PipelineIntake';
import Cadastros from './pages/Cadastros';

// Skeletons Imports
import {
  VisaoGeralSkeleton,
  ClientesSkeleton,
  ProdutosSkeleton,
  RelatoriosSkeleton,
  InteligenciaSkeleton,
} from './components/ui/Skeletons';

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
  pipeline: { module: 'Central de Cardápios', action: 'Visualizar' },
  cadastros: { module: 'Configurações', action: 'Visualizar' }
};

function AccessDenied({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto my-12 animate-fade-in">
      <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100 shadow-2xs">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Acesso Restrito</h3>
      <p className="text-xs text-slate-400 font-bold mt-2 max-w-xs leading-relaxed">
        Seu perfil atual de acesso não possui privilégios de visualização para o módulo selecionado.
      </p>
      <div className="mt-6">
        <button
          onClick={onGoBack}
          className="bg-blue-900 text-white rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-blue-950 transition-colors cursor-pointer"
        >
          Voltar para Visão Geral
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<PageId>('visao_geral');

  // Load and apply platform configurations (theme, colors)
  useEffect(() => {
    // Initial apply
    const config = getPlatformConfig();
    applyPlatformAppearance(config);

    // Listener for live updates
    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        applyPlatformAppearance(customEvent.detail);
      }
    };

    window.addEventListener('ctrade-config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('ctrade-config-changed', handleConfigChange);
    };
  }, []);

  // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Transition / Skeleton Loading State
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // Security Context
  const { hasPermission } = useSecurity();
  const perm = pagePermissions[activePage];
  const hasAccess = perm ? hasPermission(perm.module, perm.action) : true;

  // Global event listener for cross-page navigation
  useEffect(() => {
    const handleNavigation = (e: Event) => {
      const customEvent = e as CustomEvent<PageId>;
      if (customEvent.detail) {
        setActivePage(customEvent.detail);
      }
    };
    window.addEventListener('navigate-to-page', handleNavigation);
    return () => {
      window.removeEventListener('navigate-to-page', handleNavigation);
    };
  }, []);

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, [activePage]);

  // Render Skeletons during transitions
  const renderSkeleton = () => {
    switch (activePage) {
      case 'visao_geral':
        return <VisaoGeralSkeleton />;
      case 'clientes':
      case 'radar':
      case 'usuarios':
      case 'biblioteca':
      case 'pipeline':
        return <ClientesSkeleton />;
      case 'produtos':
        return <ProdutosSkeleton />;
      case 'relatorios':
        return <RelatoriosSkeleton />;
      case 'inteligencia':
      case 'oportunidades':
      case 'integracoes':
      case 'configuracoes':
      case 'auditoria':
      case 'cadastros':
        return <InteligenciaSkeleton />;
      default:
        return <VisaoGeralSkeleton />;
    }
  };

  // Simple Router Switcher
  const renderPage = () => {
    switch (activePage) {
      case 'visao_geral':
        return <VisaoGeral />;
      case 'radar':
        return <RadarComercial />;
      case 'clientes':
        return <Clientes />;
      case 'inteligencia':
        return <InteligenciaComercial />;
      case 'oportunidades':
        return <Oportunidades />;
      case 'integracoes':
        return <Integracoes />;
      case 'produtos':
        return <Produtos />;
      case 'relatorios':
        return <Relatorios />;
      case 'usuarios':
        return <Usuarios />;
      case 'biblioteca':
        return <Biblioteca />;
      case 'configuracoes':
        return <Configuracoes />;
      case 'auditoria':
        return <Auditoria />;
      case 'pipeline':
        return <PipelineIntake />;
      case 'cadastros':
        return <Cadastros />;
      default:
        return <VisaoGeral />;
    }
  };

  const renderPageWithProtection = () => {
    if (!hasAccess) {
      return <AccessDenied onGoBack={() => setActivePage('visao_geral')} />;
    }
    return renderPage();
  };

  return (
    <div id="app-root-container" className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden font-sans antialiased text-slate-800">
      {/* Sidebar - left side (collapsible on desktop, drawer on mobile) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main viewport - right side */}
      <ContentWrapper>
        {/* Header - top bar with user profile, triggers, search */}
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic page container */}
        <main className="flex-1 py-6 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
          {isPageLoading ? renderSkeleton() : renderPageWithProtection()}
        </main>

        {/* Footer - minimal indicator */}
        <Footer />
      </ContentWrapper>
    </div>
  );
}
