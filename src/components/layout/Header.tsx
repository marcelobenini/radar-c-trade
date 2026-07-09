/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, Search, Bell, Shield } from 'lucide-react';

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

        {/* CTrade Logo / Badge on Header (especially visible when sidebar is collapsed or on mobile) */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-sm tracking-wide">
            CT
          </div>
          <span className="font-bold text-slate-800 tracking-tight hidden sm:inline-block">
            CTrade <span className="text-blue-600 font-medium text-xs bg-blue-50 px-1.5 py-0.5 rounded-md ml-1">Radar</span>
          </span>
        </div>
      </div>

      {/* Center/Search Section */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="global-search-input"
            type="text"
            placeholder="Pesquisar restaurantes, cardápios ou insights..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all duration-200"
            disabled
          />
        </div>
      </div>

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
            <span className="text-[11px] font-medium text-slate-400 mt-1 flex items-center justify-end gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              Diretor Comercial
            </span>
          </div>

          {/* Avatar Placeholder */}
          <div id="user-avatar-placeholder" className="relative h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-xs hover:border-slate-300 transition-colors">
            MB
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
