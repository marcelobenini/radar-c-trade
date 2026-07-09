/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem } from '../types';

/**
 * Standard Navigation Menu Items mapped to their lucide-react icons
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'visao_geral',
    title: 'Visão Geral',
    subtitle: 'Painel geral e KPIs',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'radar',
    title: 'Radar Comercial',
    subtitle: 'Mapeamento geográfico de leads',
    iconName: 'MapPin',
  },
  {
    id: 'clientes',
    title: 'Estabelecimentos',
    subtitle: 'Gestão de leads e carteira',
    iconName: 'Store',
  },
  {
    id: 'inteligencia',
    title: 'Análise de Cardápio',
    subtitle: 'Extração de IA do cardápio',
    iconName: 'Sparkles',
  },
  {
    id: 'produtos',
    title: 'Portfólio CTrade',
    subtitle: 'Catálogo de produtos e preços',
    iconName: 'Package',
  },
  {
    id: 'relatorios',
    title: 'Relatórios Executivos',
    subtitle: 'Exportação e insights de vendas',
    iconName: 'BarChart3',
  },
  {
    id: 'usuarios',
    title: 'Gestão de Acessos',
    subtitle: 'Controle de times e permissões',
    iconName: 'Users',
  },
  {
    id: 'configuracoes',
    title: 'Central de IA',
    subtitle: 'Parâmetros e chaves de IA',
    iconName: 'Settings',
  },
];

/**
 * Business segments and categories for lead profiling
 */
export const RESTAURANT_SEGMENTS = [
  'Italiano',
  'Pizzaria',
  'Hamburgueria',
  'Asiático',
  'Contemporâneo',
  'Carnes & Grelhados',
  'Bistrô',
  'Cafeteria / Padaria',
  'Vegano / Vegetariano',
  'Outros',
];

/**
 * Culinary levels / gastronomical target tiers
 */
export const GASTRONOMIC_LEVELS = [
  { id: 'casual', name: 'Casual', color: 'bg-slate-100 text-slate-700' },
  { id: 'gourmet', name: 'Gourmet', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 'fine_dining', name: 'Fine Dining', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { id: 'tradicional', name: 'Tradicional', color: 'bg-amber-50 text-amber-700 border-amber-100' },
];

/**
 * Ticket size categories
 */
export const TICKET_CATEGORIES = [
  { id: 'Muito Alto', label: 'Muito Alto (R$ 150+)', icon: '💵💵💵' },
  { id: 'Alto', label: 'Alto (R$ 100 - R$ 150)', icon: '💵💵' },
  { id: 'Médio', label: 'Médio (R$ 50 - R$ 100)', icon: '💵' },
  { id: 'Baixo', label: 'Baixo (até R$ 50)', icon: '🪙' },
];
