/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import PageContainer from '../components/shared/PageContainer';
import PageHeader from '../components/shared/PageHeader';
import Button from '../components/ui/Button';
import { Card, MetricCard, AlertCard } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge, Toast, EmptyState } from '../components/ui/Feedback';
import { Modal, LateralDrawer } from '../components/ui/Interactive';
import Breadcrumb, { BreadcrumbItem } from '../components/ui/Breadcrumb';

// Import newly created modular components
import RoleBadge, { UserRole } from '../components/shared/RoleBadge';
import PermissionMatrix from '../components/shared/PermissionMatrix';
import ActivityTimeline, { TimelineItem } from '../components/shared/ActivityTimeline';
import TeamCard, { Team, defaultTeams } from '../components/shared/TeamCard';
import UserCard from '../components/shared/UserCard';
import { useSecurity } from '../hooks/useSecurity';
import { SecurityService, UserDetail, AccessProfile } from '../services/securityService';

import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Clock,
  Activity,
  UserCheck,
  Smartphone,
  Mail,
  Building2,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Award,
  BookOpen,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

export default function Usuarios() {
  const { profiles, users: globalUsers, logs, addLog, realUser, activeRole } = useSecurity();

  // Navigation tabs for the dashboard sub-areas
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'equipes' | 'permissoes' | 'timeline'>('usuarios');

  // Dynamic profiles loaded from SecurityService
  const [dynamicProfiles, setDynamicProfiles] = useState<AccessProfile[]>([]);

  React.useEffect(() => {
    setDynamicProfiles(SecurityService.getProfiles());
  }, [profiles]);

  // Interactive state
  const [users, setUsers] = useState<UserDetail[]>(() => SecurityService.getUsers());
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [toast, setToast] = useState<{ message: string; description: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Sync users list with useSecurity reactive updates
  React.useEffect(() => {
    setUsers(globalUsers);
  }, [globalUsers]);

  // Modal & Drawer toggles
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterDept, setFilterDept] = useState<string>('todos');
  const [filterTeam, setFilterTeam] = useState<string>('todos');
  const [filterCreationDate, setFilterCreationDate] = useState<string>('todos');

  // Sorting state for DataTable
  const [sortField, setSortField] = useState<keyof UserDetail>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Form state for Modal Novo/Editar Usuário
  const [formName, setFormName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formRole, setFormRole] = useState<string>('RCA / Comercial');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo' | 'Bloqueado' | 'Suspenso' | 'Convite Pendente'>('Ativo');
  const [formTeam, setFormTeam] = useState('Equipe Comercial RJ');
  const [formObservations, setFormObservations] = useState('');

  // Toast Helper
  const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 4000);
  };

  // --- KPI CALCULATIONS ---
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'Administrador').length;
    const supervisors = users.filter(u => u.role === 'Supervisor').length;
    const comercials = users.filter(u => u.role === 'Comercial').length;
    const active = users.filter(u => u.status === 'Ativo').length;
    
    // Find last active access excluding 'Nunca acessou'
    const recentAccessUsers = users.filter(u => u.lastAccess !== 'Nunca acessou');
    const lastAccessTime = recentAccessUsers.length > 0 ? recentAccessUsers[0].lastAccess : 'Hoje, 11:20';

    return { total, admins, supervisors, comercials, active, lastAccessTime };
  }, [users]);

  // --- FILTERS & SEARCH APPLICATION ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query (Name, LastName, Email, Position/Cargo, Department)
      const matchesSearch = searchQuery.trim() === '' || 
        `${u.name} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Role filter
      const matchesRole = filterRole === 'todos' || u.role === filterRole;

      // 3. Status filter
      const matchesStatus = filterStatus === 'todos' || u.status === filterStatus;

      // 4. Department filter
      const matchesDept = filterDept === 'todos' || u.department === filterDept;

      // 5. Team filter
      const matchesTeam = filterTeam === 'todos' || u.team === filterTeam;

      // 6. Creation date filter (simple simulation)
      let matchesCreation = true;
      if (filterCreationDate === 'recentes') {
        matchesCreation = u.creationDate.startsWith('2026-07');
      } else if (filterCreationDate === 'antigos') {
        matchesCreation = !u.creationDate.startsWith('2026-07');
      }

      return matchesSearch && matchesRole && matchesStatus && matchesDept && matchesTeam && matchesCreation;
    });
  }, [users, searchQuery, filterRole, filterStatus, filterDept, filterTeam, filterCreationDate]);

  // --- SORTING ---
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortField, sortAsc]);

  // --- PAGINATION ---
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage) || 1;

  // Sorting handler
  const handleSort = (field: keyof UserDetail) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  // --- FORM HANDLERS ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formLastName.trim() || !formEmail.trim() || !formPosition.trim() || !formDept.trim()) {
      triggerToast('error', 'Campos Obrigatórios', 'Por favor, preencha todos os campos fundamentais.');
      return;
    }

    let updatedUsers: UserDetail[] = [];

    if (selectedUser && users.some(u => u.id === selectedUser.id)) {
      // Editing existing user
      updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            name: formName,
            lastName: formLastName,
            email: formEmail,
            phone: formPhone || '(11) 99999-9999',
            role: formRole,
            department: formDept,
            position: formPosition,
            team: formTeam,
            status: formStatus,
            observations: formObservations,
          };
        }
        return u;
      });
      triggerToast('success', 'Cadastro Atualizado', `${formName} foi atualizado com sucesso.`);
      SecurityService.logAction({
        module: 'Usuários',
        action: `Editar Usuário: ${formName} ${formLastName}`,
        result: 'Sucesso'
      });
    } else {
      // Creating new user
      const newUser: UserDetail = {
        id: `usr-${Date.now()}`,
        name: formName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone || '(11) 99999-9999',
        role: formRole,
        department: formDept,
        position: formPosition,
        team: formTeam,
        status: 'Convite Pendente', // Defaults to invitation pending as requested
        lastAccess: 'Nunca acessou',
        observations: formObservations,
        creationDate: new Date().toISOString().split('T')[0],
        createdBy: realUser ? `${realUser.name} ${realUser.lastName}` : 'Administrador',
      };
      updatedUsers = [newUser, ...users];
      triggerToast('success', 'Convite Enviado', `Um convite foi enviado para ${newUser.name} com perfil de ${newUser.role}.`);
      SecurityService.logAction({
        module: 'Usuários',
        action: `Criar Usuário: ${newUser.name} ${newUser.lastName}`,
        result: 'Sucesso'
      });
    }

    SecurityService.saveUsers(updatedUsers);
    setIsNewUserModalOpen(false);
    setSelectedUser(null);

    // Reset Form
    setFormName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormPosition('');
    setFormDept('');
    setFormRole('RCA / Comercial');
    setFormStatus('Ativo');
    setFormTeam('Equipe Comercial RJ');
    setFormObservations('');
  };

  // Delete handler
  const handleDeleteUser = (id: string, name: string) => {
    // Safeguard: do not let delete oneself
    if (id === 'usr-1') {
      triggerToast('error', 'Ação Proibida', 'Você não pode excluir a si mesmo.');
      return;
    }

    const updatedUsers = users.filter(u => u.id !== id);
    SecurityService.saveUsers(updatedUsers);
    
    triggerToast('warning', 'Usuário Removido', `O cadastro de ${name} foi removido com sucesso.`);
    SecurityService.logAction({
      module: 'Usuários',
      action: `Excluir Usuário: ${name}`,
      result: 'Sucesso'
    });

    if (selectedUser?.id === id) {
      setSelectedUser(null);
      setIsDetailDrawerOpen(false);
    }
  };

  // Status toggle handler cycling through Ativo, Inativo, Bloqueado, Suspenso, Convite Pendente
  const handleToggleStatus = (id: string) => {
    const statusCycle: UserDetail['status'][] = ['Ativo', 'Inativo', 'Bloqueado', 'Suspenso', 'Convite Pendente'];
    
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        const currentIndex = statusCycle.indexOf(u.status);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        
        triggerToast('info', 'Status Alterado', `O status de ${u.name} agora é "${nextStatus}".`);
        SecurityService.logAction({
          module: 'Usuários',
          action: `Alterar Status: ${u.name} para ${nextStatus}`,
          result: 'Sucesso'
        });
        return { ...u, status: nextStatus };
      }
      return u;
    });

    SecurityService.saveUsers(updatedUsers);
  };

  const handleOpenDetails = (user: UserDetail) => {
    setSelectedUser(user);
    setIsDetailDrawerOpen(true);
  };

  const mappedTimelineItems: TimelineItem[] = useMemo(() => {
    return logs.map(log => {
      const isError = log.result === 'Bloqueado';
      let type: TimelineItem['type'] = 'access';
      if (isError) {
        type = 'security';
      } else if (log.action.includes('Criar') || log.action.includes('Novo')) {
        type = 'create';
      } else if (log.action.includes('Editar') || log.action.includes('Alterar') || log.action.includes('Atualizar')) {
        type = 'edit';
      } else if (log.action.includes('Exportar')) {
        type = 'export';
      } else if (log.result === 'Sucesso') {
        type = 'success';
      }

      const formattedTime = new Date(log.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(log.date).toLocaleDateString('pt-BR');

      return {
        id: log.id,
        type,
        user: { name: log.user },
        description: `${log.action} [${log.module}]`,
        target: log.result,
        timestamp: formattedTime,
      };
    });
  }, [logs]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Usuários', active: true }
  ];

  return (
    <PageContainer id="page-usuarios-controle-acesso">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <Toast
            message={toast.message}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Breadcrumb path */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Usuários e Acessos"
        subtitle="Gerencie equipes comerciais, departamentos, papéis administrativos e suas respectivas matrizes cognitivas de permissão."
        badge="Fase 09"
        action={
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 max-w-full overflow-x-auto gap-0.5 shadow-2xs">
            <button
              onClick={() => setActiveSubTab('usuarios')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeSubTab === 'usuarios' ? 'bg-white text-slate-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-blue-900" />
              <span>Base de Usuários</span>
            </button>
            <button
              onClick={() => setActiveSubTab('equipes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeSubTab === 'equipes' ? 'bg-white text-slate-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="h-3.5 w-3.5 text-blue-900" />
              <span>Equipes ({defaultTeams.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('permissoes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeSubTab === 'permissoes' ? 'bg-white text-slate-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-blue-900" />
              <span>Matriz de Permissões</span>
            </button>
            <button
              onClick={() => setActiveSubTab('timeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeSubTab === 'timeline' ? 'bg-white text-slate-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-blue-900" />
              <span>Timeline de Atividades</span>
            </button>
          </div>
        }
      />

      {/* --- KPIs SECTION --- */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total de Usuários"
          value={stats.total.toString()}
          comparisonText="Cadastros na plataforma"
          icon={<Users className="h-5 w-5 text-blue-900" />}
        />
        <MetricCard
          title="Administradores"
          value={stats.admins.toString()}
          comparisonText="Controle integral"
          icon={<Lock className="h-5 w-5 text-blue-900" />}
        />
        <MetricCard
          title="Supervisores"
          value={stats.supervisors.toString()}
          comparisonText="Gestores regionais"
          icon={<Shield className="h-5 w-5 text-blue-900" />}
        />
        <MetricCard
          title="Comerciais"
          value={stats.comercials.toString()}
          comparisonText="Vendedores em campo"
          icon={<UserCheck className="h-5 w-5 text-blue-900" />}
        />
        <MetricCard
          title="Usuários Ativos"
          value={stats.active.toString()}
          comparisonText="Em operação regular"
          icon={<CheckCircle2 className="h-5 w-5 text-blue-900" />}
        />
        <MetricCard
          title="Último Acesso"
          value={stats.lastAccessTime}
          comparisonText="Histórico de logins"
          icon={<Clock className="h-5 w-5 text-blue-900" />}
        />
      </div>

      {/* --- RENDER TAB CONTENTS --- */}

      {/* 1. BASE DE USUÁRIOS TAB */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters & Control bar */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
              {/* General Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Pesquisar por nome, e-mail, cargo ou departamento..."
                  className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Reset & Add buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5 text-slate-400" />}
                  onClick={() => {
                    setFilterRole('todos');
                    setFilterStatus('todos');
                    setFilterDept('todos');
                    setFilterTeam('todos');
                    setFilterCreationDate('todos');
                    setSearchQuery('');
                    setCurrentPage(1);
                    triggerToast('info', 'Filtros Limpos', 'Todos os critérios de busca foram restaurados para o padrão.');
                  }}
                >
                  Limpar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 text-xs"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsNewUserModalOpen(true)}
                >
                  Novo Usuário
                </Button>
              </div>
            </div>

            <div className="h-px bg-slate-50" />

            {/* Advanced Filters dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perfil</label>
                <select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="todos">Todos Perfis</option>
                  {dynamicProfiles.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="todos">Todos Status</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Departamento</label>
                <select
                  value={filterDept}
                  onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="todos">Todos Deptos</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Operações">Operações</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Equipe</label>
                <select
                  value={filterTeam}
                  onChange={(e) => { setFilterTeam(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="todos">Todas Equipes</option>
                  <option value="Equipe Comercial RJ">Comercial RJ</option>
                  <option value="Equipe Comercial SP">Comercial SP</option>
                  <option value="Equipe Premium">Equipe Premium</option>
                  <option value="Equipe Food Service">Food Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data de Criação</label>
                <select
                  value={filterCreationDate}
                  onChange={(e) => { setFilterCreationDate(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="todos">Qualquer Data</option>
                  <option value="recentes">Este Mês (Julho/2026)</option>
                  <option value="antigos">Antes deste mês</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto w-full relative">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th
                      onClick={() => handleSort('name')}
                      className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nome</span>
                        {sortField === 'name' && (sortAsc ? <ChevronUp className="h-3.5 w-3.5 text-blue-900" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-900" />)}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('position')}
                      className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Cargo</span>
                        {sortField === 'position' && (sortAsc ? <ChevronUp className="h-3.5 w-3.5 text-blue-900" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-900" />)}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('role')}
                      className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Perfil</span>
                        {sortField === 'role' && (sortAsc ? <ChevronUp className="h-3.5 w-3.5 text-blue-900" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-900" />)}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('department')}
                      className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Departamento</span>
                        {sortField === 'department' && (sortAsc ? <ChevronUp className="h-3.5 w-3.5 text-blue-900" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-900" />)}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' && (sortAsc ? <ChevronUp className="h-3.5 w-3.5 text-blue-900" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-900" />)}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('lastAccess')}
                      className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Último Acesso</span>
                        {sortField === 'lastAccess' && (sortAsc ? <ChevronUp className="h-3.5 w-3.5 text-blue-900" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-900" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => handleOpenDetails(row)}
                      >
                        {/* Name Column with Avatar */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wide shadow-2xs shrink-0">
                              {row.name.charAt(0)}{row.lastName.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 truncate">{row.name} {row.lastName}</span>
                              <span className="text-[10px] text-slate-400 font-medium truncate">{row.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-700">{row.position}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{row.team}</span>
                          </div>
                        </td>

                        {/* Profile role */}
                        <td className="px-6 py-4.5">
                          <RoleBadge role={row.role} showIcon={false} />
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4.5 text-xs text-slate-500 font-bold">
                          {row.department}
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4.5">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(row.id);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              row.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' :
                              row.status === 'Inativo' ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' :
                              row.status === 'Bloqueado' ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' :
                              row.status === 'Suspenso' ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' :
                              'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              row.status === 'Ativo' ? 'bg-emerald-500' :
                              row.status === 'Inativo' ? 'bg-slate-400' :
                              row.status === 'Bloqueado' ? 'bg-rose-500' :
                              row.status === 'Suspenso' ? 'bg-amber-500' :
                              'bg-indigo-500 animate-pulse'
                            }`} />
                            {row.status}
                          </span>
                        </td>

                        {/* Last access */}
                        <td className="px-6 py-4.5 text-xs font-medium text-slate-500">
                          {row.lastAccess}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenDetails(row)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-slate-50 transition-all"
                              title="Visualizar detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(row);
                                setFormName(row.name);
                                setFormLastName(row.lastName);
                                setFormEmail(row.email);
                                setFormPhone(row.phone);
                                setFormPosition(row.position);
                                setFormDept(row.department);
                                setFormRole(row.role);
                                setFormTeam(row.team);
                                setFormStatus(row.status);
                                setFormObservations(row.observations || '');
                                setIsNewUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(row.id, `${row.name} ${row.lastName}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-all"
                              title="Remover usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState
                          title="Nenhum usuário correspondente"
                          description="Refine sua busca por nome, perfil ou status na barra superior."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {sortedUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4.5 border-t border-slate-100 bg-slate-50/10 gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Mostrando <span className="text-slate-800 font-black">{(currentPage - 1) * rowsPerPage + 1}</span> a{' '}
                  <span className="text-slate-800 font-black">{Math.min(currentPage * rowsPerPage, sortedUsers.length)}</span> de{' '}
                  <span className="text-slate-800 font-black">{sortedUsers.length}</span> usuários
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Rows per page selector */}
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-500 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors mr-2"
                  >
                    {[5, 10, 20].map((size) => (
                      <option key={size} value={size}>
                        {size} por pág.
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-700 px-2.5">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. EQUIPES TAB */}
      {activeSubTab === 'equipes' && (
        <div className="space-y-6 animate-fadeIn">
          <AlertCard
            type="info"
            title="Distribuição das Equipes Comerciais"
            content="A hierarquia de equipes permite isolar as carteiras de clientes e os leads capturados de acordo com o segmento ou região de atuação dos consultores. Cada equipe possui um Supervisor associado."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => triggerToast('info', team.name, `Filtrando base de dados para exibir apenas membros da ${team.name}...`)}
              />
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Composição de Membros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {defaultTeams.map((team, idx) => {
                const teamMembers = users.filter(u => u.team === team.name);
                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-800">{team.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{teamMembers.length} membros</Badge>
                    </div>
                    {teamMembers.length > 0 ? (
                      <div className="space-y-2">
                        {teamMembers.map((m) => (
                          <div key={m.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-100">
                            <span className="font-bold text-slate-700">{m.name} {m.lastName}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{m.position}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Nenhum membro cadastrado nesta equipe.</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. PERMISSÕES TAB */}
      {activeSubTab === 'permissoes' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Matriz de Níveis de Acesso</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">Selecione um perfil de acesso abaixo para inspecionar os privilégios cognitivos do motor de IA e as áreas habilitadas.</p>
              </div>
            </div>

            {/* Matrix Wrapper with interactive toggle */}
            <PermissionMatrix 
              initialRole="RCA / Comercial" 
              readOnly={false} 
              onProfilesUpdated={() => setDynamicProfiles(SecurityService.getProfiles())} 
            />
          </div>
        </div>
      )}

      {/* 4. TIMELINE TAB */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Linha do Tempo de Atividades</h3>
            <ActivityTimeline items={mappedTimelineItems} maxItems={15} />
          </div>
        </div>
      )}

      {/* --- MODAL NOVO USUÁRIO --- */}
      <Modal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        title={formName ? "Editar Usuário" : "Cadastrar Novo Usuário"}
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome *</label>
              <Input
                value={formName}
                onChange={(e: any) => setFormName(e.target.value)}
                placeholder="Ex: Arthur"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sobrenome *</label>
              <Input
                value={formLastName}
                onChange={(e: any) => setFormLastName(e.target.value)}
                placeholder="Ex: Mendes"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail Corporativo *</label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e: any) => setFormEmail(e.target.value)}
                placeholder="Ex: arthur.mendes@ctrade.com.br"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone de Contato</label>
              <Input
                value={formPhone}
                onChange={(e: any) => setFormPhone(e.target.value)}
                placeholder="Ex: (21) 98212-3456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo *</label>
              <Input
                value={formPosition}
                onChange={(e: any) => setFormPosition(e.target.value)}
                placeholder="Ex: Consultor de Vendas"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departamento *</label>
              <select
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:border-blue-600 focus:outline-hidden"
                required
              >
                <option value="">Selecione...</option>
                <option value="Diretoria">Diretoria</option>
                <option value="Vendas">Vendas</option>
                <option value="Operações">Operações</option>
                <option value="Financeiro">Financeiro</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil de Acesso *</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:border-blue-600 focus:outline-hidden"
                required
              >
                {dynamicProfiles.filter(p => p.active).map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equipe Alocada *</label>
              <select
                value={formTeam}
                onChange={(e) => setFormTeam(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:border-blue-600 focus:outline-hidden"
                required
              >
                <option value="Equipe Comercial RJ">Equipe Comercial RJ</option>
                <option value="Equipe Comercial SP">Equipe Comercial SP</option>
                <option value="Equipe Premium">Equipe Premium</option>
                <option value="Equipe Food Service">Equipe Food Service</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status do Cadastro *</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:border-blue-600 focus:outline-hidden"
                required
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Convite Pendente">Convite Pendente</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observações / Metas de Campo</label>
            <Textarea
              value={formObservations}
              onChange={(e: any) => setFormObservations(e.target.value)}
              placeholder="Indique as metas de prospecção do consultor ou observações gerais..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsNewUserModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              Salvar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- DETAIL DRAWER FOR USER PROFILE DETAILS --- */}
      <LateralDrawer
        isOpen={isDetailDrawerOpen && selectedUser !== null}
        onClose={() => setIsDetailDrawerOpen(false)}
        title="Perfil do Usuário"
      >
        {selectedUser && (
          <div className="space-y-6 font-sans">
            {/* Header Profile Info card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg tracking-wide shadow-md shadow-slate-900/10">
                {selectedUser.name.charAt(0)}{selectedUser.lastName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800">{selectedUser.name} {selectedUser.lastName}</h4>
                <p className="text-xs text-slate-500 font-semibold">{selectedUser.position}</p>
                <p className="text-[10px] text-slate-400">{selectedUser.email}</p>
              </div>
              <div className="flex gap-2 justify-center pt-1.5">
                <RoleBadge role={selectedUser.role} showIcon={true} />
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  selectedUser.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  selectedUser.status === 'Inativo' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            {/* Core details tab section */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-1.5">
                Dados Estruturais
              </h5>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs leading-normal">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Departamento</span>
                  <strong className="text-slate-800">{selectedUser.department}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Equipe de Vendas</span>
                  <strong className="text-slate-800">{selectedUser.team}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Telefone</span>
                  <span className="text-slate-700 font-medium">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Data de Cadastro</span>
                  <span className="text-slate-700 font-medium">{selectedUser.creationDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Último Acesso Conhecido</span>
                  <span className="text-slate-700 font-semibold">{selectedUser.lastAccess}</span>
                </div>
              </div>
            </div>

            {/* Observations text */}
            {selectedUser.observations && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-1.5">
                  Observações de Diretoria
                </h5>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                  "{selectedUser.observations}"
                </p>
              </div>
            )}

            {/* Access Matrix specific to selected role */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-1.5 flex justify-between items-center">
                <span>Módulos Autorizados</span>
                <span className="text-[9px] text-blue-900 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Perfil: {selectedUser.role}</span>
              </h5>
              <PermissionMatrix initialRole={selectedUser.role} readOnly={true} />
            </div>

            {/* Actions Footer inside drawer */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => setIsDetailDrawerOpen(false)}
              >
                Fechar Painel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-red-950 text-white hover:bg-slate-800"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDeleteUser(selectedUser.id, `${selectedUser.name} ${selectedUser.lastName}`)}
              >
                Remover Usuário
              </Button>
            </div>
          </div>
        )}
      </LateralDrawer>
    </PageContainer>
  );
}
