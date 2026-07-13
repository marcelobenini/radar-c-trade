/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageId =
  | 'visao_geral'
  | 'radar'
  | 'clientes'
  | 'inteligencia'
  | 'oportunidades'
  | 'integracoes'
  | 'produtos'
  | 'relatorios'
  | 'configuracoes'
  | 'usuarios'
  | 'biblioteca'
  | 'auditoria'
  | 'pipeline'
  | 'cadastros';

export interface MenuItem {
  id: PageId;
  title: string;
  subtitle: string;
  iconName: string; // Will map to a Lucide icon
}
