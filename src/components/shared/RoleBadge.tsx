/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, ShieldAlert, Cpu, UserCheck, Eye, Award } from 'lucide-react';

export type UserRole = string;

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export default function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const configs: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    'Administrador': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200/60',
      label: 'Administrador',
      icon: ShieldAlert,
    },
    'Supervisor': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/60',
      label: 'Supervisor',
      icon: Shield,
    },
    'Inteligência Comercial': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200/60',
      label: 'Intel. Comercial',
      icon: Cpu,
    },
    'Comercial': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/60',
      label: 'Comercial',
      icon: UserCheck,
    },
    'Consulta': {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200/60',
      label: 'Consulta',
      icon: Eye,
    },
  };

  // Helper to generate dynamic styles for user-created custom profiles
  const getDynamicConfig = (name: string) => {
    if (configs[name]) return configs[name];

    // Simple hash function to map any string to a stable style
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndexes = [
      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60' },
      { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60' },
      { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200/60' },
      { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200/60' },
      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/60' },
      { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200/60' },
    ];
    const style = colorIndexes[Math.abs(hash) % colorIndexes.length];
    return {
      ...style,
      label: name,
      icon: Award,
    };
  };

  const config = getDynamicConfig(role);
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border} transition-all`}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5 stroke-[2]" />}
      <span>{config.label}</span>
    </span>
  );
}

