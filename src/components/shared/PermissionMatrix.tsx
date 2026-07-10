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
  HelpCircle,
  Settings,
  Users,
  Briefcase,
  Target,
  Brain,
  Library,
  Package,
  FileText,
  Home,
  RefreshCw,
  Clock,
  Play
} from 'lucide-react';
import { SecurityService, AccessProfile, MODULES_ACTIONS } from '../../services/securityService';
import { useSecurity } from '../../hooks/useSecurity';

interface PermissionMatrixProps {
  initialRole?: string;
  readOnly?: boolean;
  onProfilesUpdated?: () => void;
}

export default function PermissionMatrix({ initialRole, readOnly = false, onProfilesUpdated }: PermissionMatrixProps) {
  const { profiles, users, activeRole, startSimulation, simulatedRole, stopSimulation } = useSecurity();
  const [activeProfileId, setActiveProfileId] = useState<string>('profile-comercial');
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPermissions, setEditPermissions] = useState<Record<string, Record<string, boolean>>>({});

  // Create new profile modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplateId, setNewTemplateId] = useState('profile-comercial');

  // Success message feedback
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Choose initial profile
  useEffect(() => {
    if (profiles.length > 0) {
      if (initialRole) {
        const match = profiles.find(p => p.name.toLowerCase() === initialRole.toLowerCase() || p.id === initialRole);
        if (match) {
          setActiveProfileId(match.id);
        } else {
          setActiveProfileId(profiles[0].id);
        }
      } else {
        const comercial = profiles.find(p => p.id === 'profile-comercial');
        setActiveProfileId(comercial ? comercial.id : profiles[0].id);
      }
    }
  }, [profiles, initialRole]);

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
    
    // Deep clone permissions
    const clonedPerms: Record<string, Record<string, boolean>> = {};
    Object.keys(MODULES_ACTIONS).forEach(module => {
      clonedPerms[module] = { ...(activeProfile.permissions[module] || {}) };
    });
    setEditPermissions(clonedPerms);
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

    SecurityService.saveProfiles(updated);
    setIsEditing(false);
    triggerAlert('success', `Perfil "${editName}" atualizado com sucesso.`);
    SecurityService.logAction({
      module: 'Usuários',
      action: 'Alterar Permissões',
      result: 'Sucesso',
    });
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Duplicate profile
  const handleDuplicateProfile = (id: string) => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;

    const newId = `profile-custom-${Date.now()}`;
    const name = `${target.name} (Cópia)`;
    
    // Deep copy permissions
    const clonedPerms: Record<string, Record<string, boolean>> = {};
    Object.keys(MODULES_ACTIONS).forEach(module => {
      clonedPerms[module] = { ...(target.permissions[module] || {}) };
    });

    const duplicated: AccessProfile = {
      id: newId,
      name,
      description: `Cópia do perfil ${target.name}. ${target.description}`,
      active: true,
      isSystem: false,
      permissions: clonedPerms
    };

    const updated = [...profiles, duplicated];
    SecurityService.saveProfiles(updated);
    setActiveProfileId(newId);
    triggerAlert('success', `Perfil "${name}" criado por duplicação.`);
    SecurityService.logAction({
      module: 'Usuários',
      action: 'Gerenciar Perfis',
      result: 'Sucesso',
    });
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

    // Safeguard: Check if in use before deactivating
    const inUse = users.some(u => u.role === target.name && u.status === 'Ativo');
    if (inUse) {
      triggerAlert('warning', `Não é possível desativar o perfil "${target.name}" porque há usuários ativos associados a ele.`);
      return;
    }

    const nextStatus = !target.active;
    const updated = profiles.map(p => {
      if (p.id === id) {
        return { ...p, active: nextStatus };
      }
      return p;
    });

    SecurityService.saveProfiles(updated);
    triggerAlert('info', `Perfil "${target.name}" foi ${nextStatus ? 'ativado' : 'desativado'}.`);
    SecurityService.logAction({
      module: 'Usuários',
      action: 'Gerenciar Perfis',
      result: 'Sucesso',
    });
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

    // Safeguard check: do not delete profiles in use
    const inUse = users.some(u => u.role === target.name);
    if (inUse) {
      triggerAlert('warning', `Não é possível excluir o perfil "${target.name}" porque ele possui usuários cadastrados.`);
      return;
    }

    const updated = profiles.filter(p => p.id !== id);
    SecurityService.saveProfiles(updated);
    
    // Choose next active profile
    if (updated.length > 0) {
      setActiveProfileId(updated[0].id);
    }
    
    triggerAlert('warning', `Perfil "${target.name}" excluído.`);
    SecurityService.logAction({
      module: 'Usuários',
      action: 'Gerenciar Perfis',
      result: 'Sucesso',
    });
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Create new from modal
  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const template = profiles.find(p => p.id === newTemplateId) || profiles[0];
    
    // Deep clone template permissions
    const clonedPerms: Record<string, Record<string, boolean>> = {};
    Object.keys(MODULES_ACTIONS).forEach(module => {
      clonedPerms[module] = { ...(template.permissions[module] || {}) };
    });

    const newId = `profile-custom-${Date.now()}`;
    const created: AccessProfile = {
      id: newId,
      name: newName,
      description: newDescription || 'Perfil de acesso personalizado criado pelo administrador.',
      active: true,
      isSystem: false,
      permissions: clonedPerms
    };

    const updated = [...profiles, created];
    SecurityService.saveProfiles(updated);
    setActiveProfileId(newId);
    setIsCreateOpen(false);
    
    // Reset inputs
    setNewName('');
    setNewDescription('');
    
    triggerAlert('success', `Novo perfil "${newName}" criado com sucesso!`);
    SecurityService.logAction({
      module: 'Usuários',
      action: 'Gerenciar Perfis',
      result: 'Sucesso',
    });
    if (onProfilesUpdated) onProfilesUpdated();
  };

  // Helper icons for modules
  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case 'Dashboard': return <Home className="h-4 w-4 text-blue-900" />;
      case 'Radar Comercial': return <Target className="h-4 w-4 text-purple-700" />;
      case 'Base de Clientes': return <Users className="h-4 w-4 text-emerald-700" />;
      case 'Central de Cardápios': return <Library className="h-4 w-4 text-indigo-700" />;
      case 'Catálogo de Produtos': return <Package className="h-4 w-4 text-amber-700" />;
      case 'Central de Oportunidades': return <Briefcase className="h-4 w-4 text-blue-700" />;
      case 'Relatórios': return <FileText className="h-4 w-4 text-slate-700" />;
      case 'Usuários': return <Settings className="h-4 w-4 text-rose-700" />;
      case 'Configurações': return <Settings className="h-4 w-4 text-indigo-900" />;
      case 'Auditoria': return <Clock className="h-4 w-4 text-rose-900" />;
      default: return <Shield className="h-4 w-4 text-slate-500" />;
    }
  };

  const getProfileUsersCount = (profileName: string) => {
    return users.filter(u => u.role === profileName).length;
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
              const isSimulated = simulatedRole === p.name;
              const count = getProfileUsersCount(p.name);

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isEditing) {
                      if (window.confirm('Você possui alterações não salvas. Deseja trocar de perfil assim mesmo?')) {
                        setIsEditing(false);
                        setActiveProfileId(p.id);
                      }
                    } else {
                      setActiveProfileId(p.id);
                    }
                  }}
                  className={`group relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
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
                      {isSimulated && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950">
                          Simulado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-[10px] mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {p.description}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${isSelected ? 'text-blue-300' : 'text-blue-600'}`}>
                      {count} {count === 1 ? 'usuário' : 'usuários'}
                    </span>
                  </div>

                  {/* Desktop Quick Actions Layer (hidden on default view unless hovered) */}
                  {!readOnly && !isEditing && (
                    <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm transition-all text-slate-600 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateProfile(p.id);
                        }}
                        className="p-1 hover:text-blue-900 rounded-md hover:bg-slate-50"
                        title="Duplicar perfil de acesso"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {!p.isSystem && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(p.id);
                            }}
                            className={`p-1 rounded-md hover:bg-slate-50 ${p.active ? 'hover:text-rose-600' : 'hover:text-emerald-600'}`}
                            title={p.active ? "Desativar perfil" : "Ativar perfil"}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Tem certeza que deseja excluir permanentemente o perfil "${p.name}"?`)) {
                                handleDeleteProfile(p.id);
                              }
                            }}
                            className="p-1 hover:text-red-700 rounded-md hover:bg-slate-50"
                            title="Excluir perfil"
                            disabled={count > 0}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
                      className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1 focus:outline-hidden focus:border-blue-600"
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
                    {/* SIMULATE PROFILE BUTTON - Administrators only */}
                    {activeRole === 'Administrador' && !isEditing && (
                      simulatedRole === activeProfile.name ? (
                        <button
                          onClick={stopSimulation}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Parar Simulação</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            startSimulation(activeProfile.name);
                            triggerAlert('success', `Simulação ativada! Agora você está visualizando o sistema como "${activeProfile.name}".`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl border border-amber-600 transition-all cursor-pointer shadow-2xs"
                          title="Visualizar a plataforma com este perfil"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>Visualizar como...</span>
                        </button>
                      )
                    )}

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
                          <span>Salvar</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleStartEdit}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                          <span>Editar</span>
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

          {/* Granular Matrix of Actions by Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(MODULES_ACTIONS).map((moduleName) => {
              const actions = MODULES_ACTIONS[moduleName];
              
              return (
                <div key={moduleName} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
                    {getModuleIcon(moduleName)}
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{moduleName}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {actions.map((actionName) => {
                      const isAllowed = isEditing
                        ? !!(editPermissions[moduleName] && editPermissions[moduleName][actionName])
                        : !!(activeProfile?.permissions[moduleName] && activeProfile?.permissions[moduleName][actionName]);

                      return (
                        <div key={actionName} className="flex items-center gap-2 py-1">
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              id={`chk-${moduleName}-${actionName}`}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditPermissions({
                                  ...editPermissions,
                                  [moduleName]: {
                                    ...(editPermissions[moduleName] || {}),
                                    [actionName]: checked
                                  }
                                });
                              }}
                              className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
                            />
                          ) : (
                            <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                              isAllowed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-slate-50 border-slate-200 text-slate-300'
                            }`}>
                              {isAllowed ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-2.5 w-2.5" />}
                            </div>
                          )}
                          <label 
                            htmlFor={`chk-${moduleName}-${actionName}`}
                            className={`text-xs select-none cursor-pointer ${
                              isAllowed ? 'font-bold text-slate-800' : 'text-slate-400 font-medium'
                            }`}
                          >
                            {actionName}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alert Note Info card */}
          <div className="p-4.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3.5 items-start">
            <HelpCircle className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-900 block">Arquitetura de Segurança Habilitada</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                As alterações na matriz de ações deste perfil são herdadas automaticamente por todos os usuários atribuídos a ele. Perfis marcados com a tag <strong className="font-bold text-slate-600">Nativo</strong> são estruturais e possuem salvaguardas de exclusão.
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
                  placeholder="Ex: Gestor Regional, Representante"
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
