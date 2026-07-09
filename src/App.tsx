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

// Skeletons Imports
import {
  VisaoGeralSkeleton,
  ClientesSkeleton,
  ProdutosSkeleton,
  RelatoriosSkeleton,
  InteligenciaSkeleton,
} from './components/ui/Skeletons';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<PageId>('visao_geral');

  // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Transition / Skeleton Loading State
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

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
        return <ClientesSkeleton />;
      case 'produtos':
        return <ProdutosSkeleton />;
      case 'relatorios':
        return <RelatoriosSkeleton />;
      case 'inteligencia':
      case 'oportunidades':
      case 'integracoes':
      case 'configuracoes':
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
      default:
        return <VisaoGeral />;
    }
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
          {isPageLoading ? renderSkeleton() : renderPage()}
        </main>

        {/* Footer - minimal indicator */}
        <Footer />
      </ContentWrapper>
    </div>
  );
}
