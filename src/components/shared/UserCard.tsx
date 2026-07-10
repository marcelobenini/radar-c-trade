/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import RoleBadge, { UserRole } from './RoleBadge';
import { Mail, Phone, Calendar, Clock, MapPin, Building2 } from 'lucide-react';

export interface UserDetail {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  position: string; // Cargo
  team: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado' | 'Suspenso' | 'Convite Pendente';
  lastAccess: string;
  observations?: string;
  creationDate: string;
  createdBy?: string;
}

interface UserCardProps {
  user: UserDetail;
  onEdit?: () => void;
  onSelect?: () => void;
}

export default function UserCard({ user, onEdit, onSelect }: UserCardProps) {
  const getStatusBadge = (status: UserDetail['status']) => {
    switch (status) {
      case 'Ativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ativo
          </span>
        );
      case 'Inativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Inativo
          </span>
        );
      case 'Bloqueado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Bloqueado
          </span>
        );
      case 'Suspenso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Suspenso
          </span>
        );
      case 'Convite Pendente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-xs transition-all cursor-pointer font-sans space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex items-center justify-center font-bold text-sm tracking-wide">
            {user.name.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 hover:text-blue-900 transition-colors">
              {user.name} {user.lastName}
            </h4>
            <span className="text-[11px] text-slate-400 font-semibold">{user.position}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {getStatusBadge(user.status)}
          <RoleBadge role={user.role} showIcon={false} />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate max-w-[200px]">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          <span>{user.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span>{user.department} • <strong className="text-slate-600">{user.team}</strong></span>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          Último acesso: <strong className="text-slate-600">{user.lastAccess}</strong>
        </span>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-blue-900 font-bold hover:underline"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}
