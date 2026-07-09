/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

export interface DashboardFilters {
  periodo: string;
  segmento: string;
  cidade: string;
}

/**
 * Custom hook to encapsulate filter states and global dashboard loading flags
 */
export function useDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: '30_dias',
    segmento: 'todos',
    cidade: 'todas',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFilter = (newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      periodo: '30_dias',
      segmento: 'todos',
      cidade: 'todas',
    });
  };

  return {
    filters,
    isLoading,
    setIsLoading,
    updateFilter,
    resetFilters,
  };
}
