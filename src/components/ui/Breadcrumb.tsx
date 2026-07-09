/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbProps {
  id?: string;
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
}

export default function Breadcrumb({ id, items, onHomeClick }: BreadcrumbProps) {
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'visao_geral' }));
    }
  };

  return (
    <nav id={id} className="flex font-sans mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <button
            onClick={handleHomeClick}
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer gap-1"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Radar Comercial</span>
          </button>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center">
            <ChevronRight className="h-3 w-3 text-slate-300 mx-1 md:mx-2 shrink-0" />
            {item.active ? (
              <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-none"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
