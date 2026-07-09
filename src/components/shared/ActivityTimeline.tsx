/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogIn, UserPlus, Edit3, Download, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface TimelineItem {
  id: string;
  type: 'access' | 'create' | 'edit' | 'export' | 'security' | 'success';
  user: {
    name: string;
    avatar?: string;
  };
  description: string;
  target?: string;
  timestamp: string;
}

const defaultTimelineItems: TimelineItem[] = [
  {
    id: 'act-1',
    type: 'access',
    user: { name: 'Marcelo Baquero' },
    description: 'Login efetuado com sucesso via Web App',
    timestamp: 'Hoje, 11:20',
  },
  {
    id: 'act-2',
    type: 'export',
    user: { name: 'Marcelo Baquero' },
    description: 'Exportou base de leads ativos',
    target: 'leads_rio_capital_v2.xlsx',
    timestamp: 'Hoje, 10:45',
  },
  {
    id: 'act-3',
    type: 'edit',
    user: { name: 'Mariana Costa' },
    description: 'Atualizou as diretrizes do Prompt Mestre',
    target: 'Central de Inteligência',
    timestamp: 'Hoje, 09:12',
  },
  {
    id: 'act-4',
    type: 'create',
    user: { name: 'Roberto Alencar' },
    description: 'Cadastrou novo vendedor na equipe RJ',
    target: 'Arthur Mendes',
    timestamp: 'Ontem, 16:34',
  },
  {
    id: 'act-5',
    type: 'security',
    user: { name: 'Marcelo Baquero' },
    description: 'Alterou o perfil de acesso do usuário',
    target: 'Arthur Mendes para Comercial',
    timestamp: 'Ontem, 15:40',
  },
  {
    id: 'act-6',
    type: 'export',
    user: { name: 'Mariana Costa' },
    description: 'Gerou relatório de performance de IA',
    target: 'analise_mes_junho.pdf',
    timestamp: '05 Jul, 14:15',
  },
];

interface ActivityTimelineProps {
  items?: TimelineItem[];
  maxItems?: number;
}

export default function ActivityTimeline({ items = defaultTimelineItems, maxItems = 10 }: ActivityTimelineProps) {
  const visibleItems = items.slice(0, maxItems);

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'access':
        return <LogIn className="h-4 w-4 text-sky-600" />;
      case 'create':
        return <UserPlus className="h-4 w-4 text-emerald-600" />;
      case 'edit':
        return <Edit3 className="h-4 w-4 text-indigo-600" />;
      case 'export':
        return <Download className="h-4 w-4 text-blue-600" />;
      case 'security':
        return <Shield className="h-4 w-4 text-rose-600" />;
      case 'success':
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getBadgeBg = (type: TimelineItem['type']) => {
    switch (type) {
      case 'access':
        return 'bg-sky-50 border-sky-100';
      case 'create':
        return 'bg-emerald-50 border-emerald-100';
      case 'edit':
        return 'bg-indigo-50 border-indigo-100';
      case 'export':
        return 'bg-blue-50 border-blue-100';
      case 'security':
        return 'bg-rose-50 border-rose-100';
      case 'success':
      default:
        return 'bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div id="activity-timeline-container" className="flow-root font-sans">
      <ul className="-mb-8">
        {visibleItems.map((item, itemIdx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {/* Vertical Connector Line */}
              {itemIdx !== visibleItems.length - 1 ? (
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              
              <div className="relative flex space-x-3.5">
                {/* Timeline Icon */}
                <div>
                  <span className={`h-10 w-10 rounded-xl border flex items-center justify-center ring-8 ring-white ${getBadgeBg(item.type)}`}>
                    {getIcon(item.type)}
                  </span>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        <strong className="font-bold text-slate-800">{item.user.name}</strong>{' '}
                        {item.description}
                        {item.target && (
                          <span className="inline-flex items-center ml-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/50">
                            {item.target}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
