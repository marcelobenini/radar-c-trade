/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit2, 
  ShieldAlert, 
  Check, 
  X, 
  Shield, 
  Plus, 
  Copy, 
  Trash2, 
  Power, 
  Save, 
  RotateCcw, 
  AlertCircle,
  AlertTriangle,
  Settings,
  HelpCircle
} from 'lucide-react';

export interface AccessProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  isSystem?: boolean;
  permissions: Record<string, 'Nenhum' | 'Visualizar' | 'Editar' | 'Administrar'>;
}

export const defaultProfiles: AccessProfile[] = [
  {
    id: 'profile-admin',
    name: 'Administrador',
    description: 'Acesso total irrestrito a todas as funcionalidades da plataforma, relatórios estratégicos e configurações de segurança e chaves de API.',
    active: true,
    isSystem: true,
    permissions: {
      'Visão Geral': 'Administrar',
      'Radar Comercial': 'Administrar',
      'Base Comercial': 'Administrar',
      'Inteligência Comercial': 'Administrar',
      'Portfólio CTrade': 'Administrar',
      'Relatórios': 'Administrar',
      'Central de Inteligência': 'Administrar',
    }
  },
  {
    id: 'profile-supervisor',
    name: 'Supervisor',
    description: 'Gestor regional responsável por analisar a performance de equipes comerciais, validar leads capturados, e exportar relatórios avançados de conversão.',
    active: true,
    isSystem: true,
    permissions: {
      'Visão Geral': 'Administrar',
      'Radar Comercial': 'Editar',
      'Base Comercial': 'Editar',
      'Inteligência Comercial': 'Editar',
      'Portfólio CTrade': 'Editar',
      'Relatórios': 'Administrar',
      'Central de Inteligência': 'Visualizar',
    }
  },
  {
    id: 'profile-inteligencia',
    name: 'Inteligência Comercial',
    description: 'Analista estratégico focado em calibrar equações de score, auditar enriquecimentos de cardápio via IA e alimentar os relatórios de conversão.',
    active: true,
    isSystem: true,
    permissions: {
      'Visão Geral': 'Editar',
      'Radar Comercial': 'Editar',
      'Base Comercial': 'Visualizar',
      'Inteligência Comercial': 'Administrar',
      'Portfólio CTrade': 'Editar',
      'Relatórios': 'Editar',
      'Central de Inteligência': 'Visualizar',
    }
  },
  {
    id: 'profile-comercial',
    name: 'Comercial',
    description: 'Executivo ou consultor de vendas em campo focado na prospecção, atualização de leads próprios, agendamento de visitas e fechamento de contratos.',
    active: true,
    isSystem: true,
    permissions: {
      'Visão Geral': 'Visualizar',
      'Radar Comercial': 'Visualizar',
      'Base Comercial': 'Editar',
      'Inteligência Comercial': 'Visualizar',
      'Portfólio CTrade': 'Visualizar',
      'Relatórios': 'Visualizar',
      'Central de Inteligência': 'Nenhum',
    }
  },
  {
    id: 'profile-consulta',
    name: 'Consulta',
    description: 'Perfil de leitura passiva para visualização de relatórios gerenciais e acompanhamento de metas, sem permissão de alteração.',
    active: true,
    isSystem: true,
    permissions: {
      'Visão Geral': 'Visualizar',
      'Radar Comercial': 'Visualizar',
      'Base Comercial': 'Visualizar',
      'Inteligência Comercial': 'Visualizar',
      'Portfólio CTrade': 'Visualizar',
      'Relatórios': 'Visualizar',
      'Central de Inteligência': 'Nenhum',
    }
  }
];

const MODULES = [
  { name: 'Visão Geral', description: 'Painel executivo com resumos de vendas e metas' },
  { name: 'Radar Comercial', description: 'Mapeamento geográfico e listas frias de restaurantes' },
  { name: 'Base Comercial', description: 'Visualização e gestão ativa de leads e carteira comercial' },
  { name: 'Inteligência Comercial', description: 'Análise avançada de cardápios e enriquecimento via Gemini IA' },
  { name: 'Portfólio CTrade', description: 'Gestão de catálogos e precificações de produtos' },
  { name: 'Relatórios', description: 'Exportação avançada de conversões, histórico e performance' },
  { name: 'Central de Inteligência', description: 'Calibração do score, prompts mestre e chaves de API' },
];

const STORAGE_KEY = 'ctrade_access_profiles';

export const getStoredProfiles = (): AccessProfile[] => {
  if (typeof window === 'undefined') return defaultProfiles;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultProfiles;
    }
  }
  return defaultProfiles;
};

export const saveStoredProfiles = (profiles: AccessProfile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }
};

interface PermissionMatrixProps {
  initialRole?: string;
  readOnly?: boolean;
  onProfilesUpdated?: () => void;
}

export default function PermissionMatrix({ initialRole, readOnly = false, onProfilesUpdated }: PermissionMatrixProps) {
  // Profiles in state
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('profile-comercial');
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPermissions, setEditPermissions] = useState<Record<string, 'Nenhum' | 'Visualizar' | 'Editar' | 'Administrar'>>({});

  // Create new profile modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplateId, setNewTemplateId] = useState('profile-comercial');

  // Success message feedback
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Load profiles from storage
  useEffect(() => {
    const loaded = getStoredProfiles();
    setProfiles(loaded);
    
    // Choose active profile
    if (initialRole) {
      const match = loaded.find(p => p.name.toLowerCase() === initialRole.toLowerCase() || p.id === initialRole);
      if (match) {
        setActiveProfileId(match.id);
      } else if (loaded.length > 0) {
        setActiveProfileId(loaded[0].id);
      }
    } else if (loaded.length > 0) {
      // Default to comercial
      const comercial = loaded.find(p => p.id === 'profile-comercial');
      setActiveProfileId(comercial ? comercial.id : loaded[0].id);
    }
  }, [initialRole]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Auto clear alerts
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const triggerAlert = (type: 'success' | 'warning' | 'info', message: string) => {
    setAlert({ type, message });
  };

  // Sync state when entering edit mode
  const handleStartEdit = () => {
    if (!activeProfile) return;
    setEditName(activeProfile.name);
    setEditDescription(activeProfile.description);
    setEditPermissions({ ...activeProfile.permissions });
    setIsEditing(true);
  };

  // Save changes
  const handleSaveProfile = () => {
    if (!activeProfile) return;
    if (!editName.trim()) {
      triggerAlert('warning', 'O nome do perfil é obrigatório.');
      return;
    }

    const updated = profiles.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          name: editName,
          description: editDescription,
          permissions: editPermissions
        };
      }
      return p;
    });

    setProfiles(updated);
    saveStoredProfiles(updated);
    setIsEditing(false);
    triggerAlert('success', `Perfil "${editName}" atualizado com sucesso.`);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Duplicate profile
  const handleDuplicateProfile = (id: string) => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;

    const newId = `profile-custom-${Date.now()}`;
    const name = `${target.name} (Cópia)`;
    const duplicated: AccessProfile = {
      id: newId,
      name,
      description: `Cópia do perfil ${target.name}. ${target.description}`,
      active: true,
      isSystem: false,
      permissions: { ...target.permissions }
    };

    const updated = [...profiles, duplicated];
    setProfiles(updated);
    saveStoredProfiles(updated);
    setActiveProfileId(newId);
    triggerAlert('success', `Perfil "${name}" criado por duplicação.`);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Toggle active/inactive
  const handleToggleActive = (id: string) => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;
    if (target.isSystem) {
      triggerAlert('warning', 'Perfis de sistema não podem ser desativados.');
      return;
    }

    const nextStatus = !target.active;
    const updated = profiles.map(p => {
      if (p.id === id) {
        return { ...p, active: nextStatus };
      }
      return p;
    });

    setProfiles(updated);
    saveStoredProfiles(updated);
    triggerAlert('info', `Perfil "${target.name}" foi ${nextStatus ? 'ativado' : 'desativado'}.`);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Delete profile
  const handleDeleteProfile = (id: string) => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;
    if (target.isSystem) {
      triggerAlert('warning', 'Perfis nativos do sistema não podem ser excluídos.');
      return;
    }

    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    saveStoredProfiles(updated);
    
    // Choose next active profile
    if (updated.length > 0) {
      setActiveProfileId(updated[0].id);
    }
    
    triggerAlert('warning', `Perfil "${target.name}" excluído.`);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Create new from modal
  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const template = profiles.find(p => p.id === newTemplateId) || defaultProfiles[3];
    const newId = `profile-custom-${Date.now()}`;
    const created: AccessProfile = {
      id: newId,
      name: newName,
      description: newDescription || 'Perfil de acesso personalizado criado pelo administrador.',
      active: true,
      isSystem: false,
      permissions: { ...template.permissions }
    };

    const updated = [...profiles, created];
    setProfiles(updated);
    saveStoredProfiles(updated);
    setActiveProfileId(newId);
    setIsCreateOpen(false);
    
    // Reset inputs
    setNewName('');
    setNewDescription('');
    
    triggerAlert('success', `Novo perfil "${newName}" criado com sucesso!`);
    if (onProfilesUpdated) onProfilesUpdated();
  };

  const getLevelBadge = (level: 'Nenhum' | 'Visualizar' | 'Editar' | 'Administrar') => {
    switch (level) {
      case 'Administrar':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-red-100">
            <ShieldAlert className="h-3 w-3" />
            <span>Administrar</span>
          </span>
        );
      case 'Editar':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-blue-100">
            <Edit2 className="h-3 w-3" />
            <span>Editar</span>
          </span>
        );
      case 'Visualizar':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-100">
            <Eye className="h-3 w-3" />
            <span>Visualizar</span>
          </span>
        );
      case 'Nenhum':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-slate-100">
            <X className="h-3 w-3" />
            <span>Sem Acesso</span>
          </span>
        );
    }
  };

  const getIndicatorCell = (level: string, expected: 'Visualizar' | 'Editar' | 'Administrar') => {
    const active = 
      (expected === 'Visualizar' && level !== 'Nenhum') ||
      (expected === 'Editar' && (level === 'Editar' || level === 'Administrar')) ||
      (expected === 'Administrar' && level === 'Administrar');

    return (
      <div className="flex items-center justify-center">
        {active ? (
          <div className="h-5 w-5 rounded-full bg-blue-950/10 flex items-center justify-center text-blue-900 font-bold border border-blue-950/20 shadow-2xs">
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-200/40">
            <X className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

  if (profiles.length === 0) return <div className="p-4 text-center text-xs text-slate-400">Carregando matriz de acesso...</div>;

  return (
    <div id="dynamic-permission-matrix-system" className="space-y-6 font-sans">
      {/* Alert Notification banner */}
      {alert && (
        <div className={`p-4.5 rounded-xl border flex items-center gap-3 animate-slideDown ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          alert.type === 'warning' ? 'bg-rose-50 text-rose-800 border-rose-100' :
          'bg-blue-50 text-blue-800 border-blue-100'
        }`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold">{alert.message}</span>
        </div>
      )}

      {/* Split layout: Profiles side navigation & permissions grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left column: List of access profiles */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Perfis Disponíveis</h4>
            {!readOnly && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Novo Perfil</span>
              </button>
            )}
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-200/60 space-y-1">
            {profiles.map((p) => {
              const isSelected = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isEditing) {
                      if (confirm('Você possui alterações não salvas. Deseja trocar de perfil assim mesmo?')) {
                        setIsEditing(false);
                        setActiveProfileId(p.id);
                      }
                    } else {
                      setActiveProfileId(p.id);
                    }
                  }}
                  className={`group relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950 text-white border-blue-950 shadow-md'
                      : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-tight truncate max-w-[150px]">{p.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.isSystem && (
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                        }`}>
                          Nativo
                        </span>
                      )}
                      {!p.active && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-[10px] mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {p.description}
                  </p>

                  {/* Desktop Quick Actions Layer (hidden on default view unless hovered) */}
                  {!readOnly && !isEditing && (
                    <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm transition-all text-slate-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateProfile(p.id);
                        }}
                        className="p-1 hover:text-blue-900 rounded-md hover:bg-slate-50"
                        title="Duplicar perfil de acesso"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {!p.isSystem && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(p.id);
                            }}
                            className={`p-1 rounded-md hover:bg-slate-50 ${p.active ? 'hover:text-rose-600' : 'hover:text-emerald-600'}`}
                            title={p.active ? "Desativar perfil comercial" : "Ativar perfil comercial"}
                          >
                            <Power className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Tem certeza que deseja excluir permanentemente o perfil "${p.name}"?`)) {
                                handleDeleteProfile(p.id);
                              }
                            }}
                            className="p-1 hover:text-red-700 rounded-md hover:bg-slate-50"
                            title="Excluir perfil"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected profile matrix details & edit mode */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Profile Header Block */}
          {activeProfile && (
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/50 space-y-3 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-sm font-black text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1 focus:outline-hidden focus:border-blue-600"
                      placeholder="Nome do Perfil"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">{activeProfile.name}</h3>
                      {activeProfile.isSystem && (
                        <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-900 border border-blue-100 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                          <Settings className="h-3 w-3" />
                          <span>Sistema</span>
                        </span>
                      )}
                      {!activeProfile.active && (
                        <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                          Inativo
                        </span>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-full max-w-xl focus:outline-hidden focus:border-blue-600 mt-1"
                      rows={2}
                      placeholder="Descrição do perfil de acesso..."
                    />
                  ) : (
                    <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{activeProfile.description}</p>
                  )}
                </div>

                {/* Profile Controls Header Action Buttons */}
                {!readOnly && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-xl border border-blue-950 shadow-xs transition-all cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          <span>Salvar Alterações</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleStartEdit}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                          <span>Editar Permissões</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateProfile(activeProfile.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer"
                        >
                          <Copy className="h-4 w-4 text-slate-500" />
                          <span>Duplicar</span>
                        </button>
                        {!activeProfile.isSystem && (
                          <button
                            onClick={() => handleToggleActive(activeProfile.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              activeProfile.active
                                ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50/50'
                                : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            <Power className="h-4 w-4" />
                            <span>{activeProfile.active ? 'Desativar' : 'Ativar'}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matrix table representation */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Módulo</th>
                  <th className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Visualizar</th>
                  <th className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Editar</th>
                  <th className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Administrar</th>
                  <th className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Nível de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MODULES.map((m, idx) => {
                  const currentLevel = isEditing 
                    ? editPermissions[m.name] || 'Nenhum'
                    : (activeProfile?.permissions[m.name] || 'Nenhum');

                  return (
                    <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-slate-800 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed">{m.description}</span>
                      </td>

                      {/* View Indicator cell */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={currentLevel !== 'Nenhum'}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditPermissions({
                                  ...editPermissions,
                                  [m.name]: checked 
                                    ? (currentLevel === 'Nenhum' ? 'Visualizar' : currentLevel) 
                                    : 'Nenhum'
                                });
                              }}
                              className="h-4.5 w-4.5 text-blue-900 border-slate-200 rounded-md cursor-pointer"
                            />
                          </div>
                        ) : (
                          getIndicatorCell(currentLevel, 'Visualizar')
                        )}
                      </td>

                      {/* Edit Indicator cell */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={currentLevel === 'Editar' || currentLevel === 'Administrar'}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditPermissions({
                                  ...editPermissions,
                                  [m.name]: checked ? 'Editar' : 'Visualizar'
                                });
                              }}
                              disabled={currentLevel === 'Nenhum'}
                              className="h-4.5 w-4.5 text-blue-900 border-slate-200 rounded-md cursor-pointer disabled:opacity-40"
                            />
                          </div>
                        ) : (
                          getIndicatorCell(currentLevel, 'Editar')
                        )}
                      </td>

                      {/* Admin Indicator cell */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={currentLevel === 'Administrar'}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditPermissions({
                                  ...editPermissions,
                                  [m.name]: checked ? 'Administrar' : 'Editar'
                                });
                              }}
                              disabled={currentLevel === 'Nenhum' || currentLevel === 'Visualizar'}
                              className="h-4.5 w-4.5 text-blue-900 border-slate-200 rounded-md cursor-pointer disabled:opacity-40"
                            />
                          </div>
                        ) : (
                          getIndicatorCell(currentLevel, 'Administrar')
                        )}
                      </td>

                      {/* Access level badge select */}
                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <select
                            value={currentLevel}
                            onChange={(e) => {
                              setEditPermissions({
                                ...editPermissions,
                                [m.name]: e.target.value as any
                              });
                            }}
                            className="text-[11px] font-bold rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-700 focus:outline-hidden"
                          >
                            <option value="Nenhum">Sem Acesso</option>
                            <option value="Visualizar">Visualizar</option>
                            <option value="Editar">Editar</option>
                            <option value="Administrar">Administrar</option>
                          </select>
                        ) : (
                          getLevelBadge(currentLevel)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alert Note Info card */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3 items-start">
            <HelpCircle className="h-4.5 w-4.5 text-blue-900 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-900 block">Arquitetura de Segurança Habilitada</span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                As alterações na matriz cognitiva de acessos de um perfil são propagadas em tempo real para todos os usuários que herdam o papel selecionado. Perfis marcados com a tag <strong className="font-bold text-slate-600">Nativo</strong> são estruturais do core business e possuem salvaguardas de exclusão.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL PARA CRIAR NOVO PERFIL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-blue-900" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Criar Perfil de Acesso</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateProfileSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do Perfil *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Consultor Externo, Auditor de IA"
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição / Objetivo *</label>
                <textarea
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades desse nível de acesso na plataforma..."
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden min-h-[70px]"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Herdar Permissões de (Template) *</label>
                <select
                  value={newTemplateId}
                  onChange={(e) => setNewTemplateId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isSystem ? '(Nativo)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 leading-normal">
                  O novo perfil começará com as mesmas permissões do template selecionado. Você poderá editá-las livremente após a criação.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-xl border border-blue-950 shadow-xs transition-all cursor-pointer"
                >
                  Criar Perfil
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
