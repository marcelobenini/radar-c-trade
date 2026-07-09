/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, Target, BarChart2, Shield } from 'lucide-react';

export interface Team {
  id: string;
  name: string;
  region: string;
  membersCount: number;
  leadsCount: number;
  conversionRate: number;
  color: string;
  supervisor: string;
}

export const defaultTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Equipe Comercial RJ',
    region: 'Rio de Janeiro',
    membersCount: 5,
    leadsCount: 142,
    conversionRate: 64,
    color: 'from-blue-500 to-indigo-600',
    supervisor: 'Mariana Costa',
  },
  {
    id: 'team-2',
    name: 'Equipe Comercial SP',
    region: 'São Paulo',
    membersCount: 8,
    leadsCount: 284,
    conversionRate: 71,
    color: 'from-emerald-500 to-teal-600',
    supervisor: 'Roberto Alencar',
  },
  {
    id: 'team-3',
    name: 'Equipe Premium',
    region: 'Nacional - Fine Dining',
    membersCount: 3,
    leadsCount: 58,
    conversionRate: 85,
    color: 'from-amber-500 to-orange-600',
    supervisor: 'Marcelo Baquero',
  },
  {
    id: 'team-4',
    name: 'Equipe Food Service',
    region: 'Sudeste - Redes',
    membersCount: 4,
    leadsCount: 96,
    conversionRate: 58,
    color: 'from-pink-500 to-rose-600',
    supervisor: 'Camila Peixoto',
  },
];

interface TeamCardProps {
  key?: React.Key;
  team: Team;
  onClick?: () => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-48 font-sans"
    >
      {/* Visual Indicator Line top */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${team.color}`} />

      <div className="space-y-1.5">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-blue-900 transition-colors">
            {team.name}
          </h4>
          <span className="text-[10px] font-black uppercase bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-md">
            {team.region}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Supervisor: <strong className="font-bold text-slate-600">{team.supervisor}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4 mt-2">
        <div className="text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Membros</span>
          </div>
          <span className="text-sm font-black text-slate-800">{team.membersCount}</span>
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            <Target className="h-3.5 w-3.5 text-slate-400" />
            <span>Carteira</span>
          </div>
          <span className="text-sm font-black text-slate-800">{team.leadsCount} leads</span>
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Conversão</span>
          </div>
          <span className="text-sm font-black text-emerald-600">{team.conversionRate}%</span>
        </div>
      </div>
    </div>
  );
}
