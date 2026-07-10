/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Define granular actions by module as requested in the specifications
export const MODULES_ACTIONS: Record<string, string[]> = {
  'Dashboard': ['Visualizar', 'Exportar PDF', 'Configurar Metas'],
  'Radar Comercial': ['Visualizar', 'Importar Leads', 'Exportar Leads', 'Filtrar Geográfico'],
  'Base de Clientes': ['Visualizar', 'Criar', 'Editar', 'Excluir', 'Exportar PDF', 'Exportar Excel', 'Adicionar Observação', 'Homologar', 'Rejeitar', 'Gerenciar'],
  'Central de Cardápios': ['Visualizar', 'Importar', 'Atualizar', 'Analisar IA'],
  'Catálogo de Produtos': ['Visualizar', 'Criar', 'Editar', 'Excluir', 'Alterar Catálogo Oficial', 'Corrigir Produtos', 'Corrigir Categorias', 'Corrigir Marcas'],
  'Central de Oportunidades': ['Visualizar', 'Criar', 'Editar', 'Excluir', 'Exportar', 'Gerenciar Oportunidades', 'Enviar para CRM'],
  'Relatórios': ['Visualizar', 'Exportar', 'Filtrar Avançado'],
  'Usuários': ['Visualizar', 'Criar', 'Editar', 'Excluir', 'Gerenciar Usuários', 'Gerenciar Perfis', 'Alterar Permissões', 'Simular Perfis'],
  'Configurações': ['Visualizar', 'Alterar Configurações', 'Alterar Parâmetros Críticos', 'Configurar APIs'],
  'Auditoria': ['Visualizar Auditoria', 'Exportar Logs', 'Limpar Histórico'],
};

export interface AccessProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  isSystem?: boolean;
  permissions: Record<string, Record<string, boolean>>; // maps moduleName -> { actionName -> boolean }
}

export interface UserDetail {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; // references AccessProfile.name
  department: string;
  position: string;
  team: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado' | 'Suspenso' | 'Convite Pendente';
  lastAccess: string;
  observations?: string;
  creationDate: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  user: string;
  profile: string;
  module: string;
  action: string;
  date: string;
  result: 'Sucesso' | 'Bloqueado';
  origin: string; // e.g. "Web App"
  description?: string;
  affectedRecord?: string;
  actionType?: string;
  clientName?: string;
  city?: string;
  state?: string;
  cnpj?: string;
  productName?: string;
  recordCount?: number;
}

// Generate full matrix with default true/false
const createPermissionSet = (allTrue: boolean): Record<string, Record<string, boolean>> => {
  const result: Record<string, Record<string, boolean>> = {};
  Object.keys(MODULES_ACTIONS).forEach(module => {
    result[module] = {};
    MODULES_ACTIONS[module].forEach(action => {
      result[module][action] = allTrue;
    });
  });
  return result;
};

// Initial profiles configuration based on official architecture
const getAdminPermissions = (): Record<string, Record<string, boolean>> => {
  return createPermissionSet(true);
};

const getSupervisorPermissions = (): Record<string, Record<string, boolean>> => {
  const p = createPermissionSet(false);
  // Dashboard
  p['Dashboard']['Visualizar'] = true;
  p['Dashboard']['Exportar PDF'] = true;

  // Radar
  p['Radar Comercial']['Visualizar'] = true;
  p['Radar Comercial']['Exportar Leads'] = true;
  p['Radar Comercial']['Filtrar Geográfico'] = true;

  // Base de Clientes
  p['Base de Clientes']['Visualizar'] = true;
  p['Base de Clientes']['Criar'] = true;
  p['Base de Clientes']['Editar'] = true;
  p['Base de Clientes']['Exportar PDF'] = true;
  p['Base de Clientes']['Exportar Excel'] = true;
  p['Base de Clientes']['Adicionar Observação'] = true;
  p['Base de Clientes']['Homologar'] = true;
  p['Base de Clientes']['Rejeitar'] = true;
  p['Base de Clientes']['Gerenciar'] = true;

  // Central de Cardápios
  p['Central de Cardápios']['Visualizar'] = true;
  p['Central de Cardápios']['Importar'] = true;
  p['Central de Cardápios']['Atualizar'] = true;
  p['Central de Cardápios']['Analisar IA'] = true;

  // Catálogo de Produtos
  p['Catálogo de Produtos']['Visualizar'] = true;
  p['Catálogo de Produtos']['Criar'] = true;
  p['Catálogo de Produtos']['Editar'] = true;

  // Central de Oportunidades
  p['Central de Oportunidades']['Visualizar'] = true;
  p['Central de Oportunidades']['Criar'] = true;
  p['Central de Oportunidades']['Editar'] = true;
  p['Central de Oportunidades']['Exportar'] = true;
  p['Central de Oportunidades']['Gerenciar Oportunidades'] = true;
  p['Central de Oportunidades']['Enviar para CRM'] = true;

  // Relatórios
  p['Relatórios']['Visualizar'] = true;
  p['Relatórios']['Exportar'] = true;
  p['Relatórios']['Filtrar Avançado'] = true;

  // Configurações
  p['Configurações']['Visualizar'] = true;
  p['Configurações']['Alterar Configurações'] = true;

  // Auditoria
  p['Auditoria']['Visualizar Auditoria'] = true;
  p['Auditoria']['Exportar Logs'] = true;

  return p;
};

const getCuradoriaPermissions = (): Record<string, Record<string, boolean>> => {
  const p = createPermissionSet(false);
  // Dashboard
  p['Dashboard']['Visualizar'] = true;

  // Radar
  p['Radar Comercial']['Visualizar'] = true;
  p['Radar Comercial']['Filtrar Geográfico'] = true;

  // Base de Clientes
  p['Base de Clientes']['Visualizar'] = true;
  p['Base de Clientes']['Editar'] = true;
  p['Base de Clientes']['Adicionar Observação'] = true;
  p['Base de Clientes']['Homologar'] = true;
  p['Base de Clientes']['Rejeitar'] = true;

  // Central de Cardápios
  p['Central de Cardápios']['Visualizar'] = true;
  p['Central de Cardápios']['Importar'] = true;
  p['Central de Cardápios']['Atualizar'] = true;
  p['Central de Cardápios']['Analisar IA'] = true;

  // Catálogo de Produtos
  p['Catálogo de Produtos']['Visualizar'] = true;
  p['Catálogo de Produtos']['Criar'] = true;
  p['Catálogo de Produtos']['Editar'] = true;
  p['Catálogo de Produtos']['Corrigir Produtos'] = true;
  p['Catálogo de Produtos']['Corrigir Categorias'] = true;
  p['Catálogo de Produtos']['Corrigir Marcas'] = true;

  // Central de Oportunidades
  p['Central de Oportunidades']['Visualizar'] = true;
  p['Central de Oportunidades']['Editar'] = true;

  // Relatórios
  p['Relatórios']['Visualizar'] = true;

  return p;
};

const getRcaComercialPermissions = (): Record<string, Record<string, boolean>> => {
  const p = createPermissionSet(false);
  // Dashboard
  p['Dashboard']['Visualizar'] = true;

  // Radar
  p['Radar Comercial']['Visualizar'] = true;
  p['Radar Comercial']['Filtrar Geográfico'] = true;

  // Base de Clientes
  p['Base de Clientes']['Visualizar'] = true;
  p['Base de Clientes']['Adicionar Observação'] = true;
  p['Base de Clientes']['Exportar PDF'] = true;

  // Central de Cardápios
  p['Central de Cardápios']['Visualizar'] = true;

  // Catálogo de Produtos
  p['Catálogo de Produtos']['Visualizar'] = true;

  // Central de Oportunidades
  p['Central de Oportunidades']['Visualizar'] = true;
  p['Central de Oportunidades']['Editar'] = true; // authorized changes

  return p;
};

const getSomenteLeituraPermissions = (): Record<string, Record<string, boolean>> => {
  const p = createPermissionSet(false);
  // Let them view all modules, and export reports
  Object.keys(MODULES_ACTIONS).forEach(module => {
    if (MODULES_ACTIONS[module].includes('Visualizar')) {
      p[module]['Visualizar'] = true;
    }
  });
  p['Relatórios']['Exportar'] = true;
  return p;
};

export const defaultProfiles: AccessProfile[] = [
  {
    id: 'profile-admin',
    name: 'Administrador',
    description: 'Acesso total irrestrito a todas as funcionalidades da plataforma, relatórios estratégicos e configurações de segurança.',
    active: true,
    isSystem: true,
    permissions: getAdminPermissions(),
  },
  {
    id: 'profile-supervisor',
    name: 'Supervisor',
    description: 'Gestor regional responsável por analisar a performance de equipes comerciais, gerenciar oportunidades e clientes sem privilégios administrativos.',
    active: true,
    isSystem: true,
    permissions: getSupervisorPermissions(),
  },
  {
    id: 'profile-curadoria',
    name: 'Curadoria',
    description: 'Profissional responsável por validar cardápios, catalogar produtos e enriquecer bases de dados com curadoria direta de categorias e marcas.',
    active: true,
    isSystem: true,
    permissions: getCuradoriaPermissions(),
  },
  {
    id: 'profile-comercial',
    name: 'RCA / Comercial',
    description: 'Consultor de campo com acesso à carteira de clientes, dossiês e central de oportunidades para conduzir negociações locais.',
    active: true,
    isSystem: true,
    permissions: getRcaComercialPermissions(),
  },
  {
    id: 'profile-leitura',
    name: 'Somente Leitura',
    description: 'Acesso passivo ideal para auditorias, parceiros ou diretoria acompanharem métricas sem poder de alteração de dados.',
    active: true,
    isSystem: true,
    permissions: getSomenteLeituraPermissions(),
  },
];

const initialUsers: UserDetail[] = [
  {
    id: 'usr-1',
    name: 'Marcelo',
    lastName: 'Baquero',
    email: 'marcelobbaquero@gmail.com',
    phone: '(11) 98765-4321',
    role: 'Administrador',
    department: 'Diretoria',
    position: 'Diretor Comercial',
    team: 'Equipe Premium',
    status: 'Ativo',
    lastAccess: 'Hoje, 11:20',
    observations: 'Responsável pela aprovação de budgets corporativos e calibração final do Radar CTrade.',
    creationDate: '2026-01-10',
    createdBy: 'Sistema',
  },
  {
    id: 'usr-2',
    name: 'Mariana',
    lastName: 'Costa',
    email: 'mariana.costa@ctrade.com.br',
    phone: '(21) 97120-1144',
    role: 'Supervisor',
    department: 'Vendas',
    position: 'Gerente Comercial RJ',
    team: 'Equipe Comercial RJ',
    status: 'Ativo',
    lastAccess: 'Hoje, 10:45',
    observations: 'Supervisora da operação comercial fluminense e validadora de táticas de objeção.',
    creationDate: '2026-02-15',
    createdBy: 'Marcelo Baquero',
  },
  {
    id: 'usr-3',
    name: 'Roberto',
    lastName: 'Alencar',
    email: 'roberto.alencar@ctrade.com.br',
    phone: '(11) 96412-2200',
    role: 'Curadoria',
    department: 'Operações',
    position: 'Curador Líder',
    team: 'Equipe Premium',
    status: 'Ativo',
    lastAccess: 'Ontem, 16:34',
    observations: 'Responsável pela integridade e normalização do cadastro nacional de SKUs.',
    creationDate: '2026-02-18',
    createdBy: 'Marcelo Baquero',
  },
  {
    id: 'usr-4',
    name: 'Arthur',
    lastName: 'Mendes',
    email: 'arthur.mendes@ctrade.com.br',
    phone: '(21) 98212-3456',
    role: 'RCA / Comercial',
    department: 'Vendas',
    position: 'Consultor Comercial',
    team: 'Equipe Comercial RJ',
    status: 'Ativo',
    lastAccess: 'Hoje, 09:12',
    observations: 'Foco em captação ativa de restaurantes no Leblon e Ipanema.',
    creationDate: '2026-07-06',
    createdBy: 'Mariana Costa',
  },
  {
    id: 'usr-5',
    name: 'Paula',
    lastName: 'Teixeira',
    email: 'paula.teixeira@ctrade.com.br',
    phone: '(11) 99123-4567',
    role: 'Somente Leitura',
    department: 'Operações',
    position: 'Auditor Externo',
    team: 'Equipe Premium',
    status: 'Ativo',
    lastAccess: 'Ontem, 11:15',
    observations: 'Auditoria de conformidade e integridade dos processos de inteligência de vendas.',
    creationDate: '2026-03-01',
    createdBy: 'Marcelo Baquero',
  },
];

const initialLogs: AuditLog[] = [
  {
    id: 'log-1',
    user: 'Marcelo Baquero',
    profile: 'Administrador',
    module: 'Usuários',
    action: 'Simular Perfis',
    date: '2026-07-10T12:15:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Simulação temporária do perfil de Supervisor ativada para validação de fluxos regionais.',
    affectedRecord: 'Supervisor',
    actionType: 'Acesso',
  },
  {
    id: 'log-2',
    user: 'Mariana Costa',
    profile: 'Supervisor',
    module: 'Base de Clientes',
    action: 'Homologar',
    date: '2026-07-10T11:45:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Cliente homologado com sucesso após verificação do cardápio e conformidade de cadastro.',
    affectedRecord: 'Restaurante Sabor & Arte',
    actionType: 'Homologação',
    clientName: 'Restaurante Sabor & Arte',
    city: 'Rio de Janeiro',
    state: 'RJ',
    cnpj: '12.345.678/0001-90',
  },
  {
    id: 'log-3',
    user: 'Roberto Alencar',
    profile: 'Curadoria',
    module: 'Catálogo de Produtos',
    action: 'Corrigir Produtos',
    date: '2026-07-10T10:30:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Marca corrigida de "Coca Cola" para "Coca-Cola" em 12 SKUs homologados no catálogo oficial.',
    affectedRecord: 'Refrigerante de Cola 350ml',
    actionType: 'Alteração',
    productName: 'Refrigerante de Cola 350ml',
  },
  {
    id: 'log-4',
    user: 'Arthur Mendes',
    profile: 'RCA / Comercial',
    module: 'Configurações',
    action: 'Alterar Configurações',
    date: '2026-07-10T09:15:00',
    result: 'Bloqueado',
    origin: 'Web App',
    description: 'Tentativa de alteração de regras de homologação automática rejeitada por falta de privilégios de administrador.',
    affectedRecord: 'Regras de Homologação',
    actionType: 'Alteração',
  },
  {
    id: 'log-5',
    user: 'Marcelo Baquero',
    profile: 'Administrador',
    module: 'Relatórios',
    action: 'Exportar PDF',
    date: '2026-07-10T08:45:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Exportação do relatório consolidado de inteligência comercial em formato PDF.',
    affectedRecord: 'Relatório Trimestral Q2',
    actionType: 'Exportação',
    recordCount: 450,
  },
  {
    id: 'log-6',
    user: 'Roberto Alencar',
    profile: 'Curadoria',
    module: 'Central de Cardápios',
    action: 'Importar',
    date: '2026-07-09T17:20:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Upload de arquivo PDF de cardápio realizado com processamento IA iniciado automaticamente.',
    affectedRecord: 'Cardapio_Lanchonete_Central.pdf',
    actionType: 'Importação',
    clientName: 'Lanchonete Central',
    city: 'São Paulo',
    state: 'SP',
  },
  {
    id: 'log-7',
    user: 'Mariana Costa',
    profile: 'Supervisor',
    module: 'Base de Clientes',
    action: 'Criar',
    date: '2026-07-09T15:10:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Novo cliente prospectado inserido na base comercial pendente de curadoria do cardápio.',
    affectedRecord: 'Churrascaria Pampas Grill',
    actionType: 'Criação',
    clientName: 'Churrascaria Pampas Grill',
    city: 'Niterói',
    state: 'RJ',
    cnpj: '98.765.432/0001-12',
  },
  {
    id: 'log-8',
    user: 'Arthur Mendes',
    profile: 'RCA / Comercial',
    module: 'Base de Clientes',
    action: 'Adicionar Observação',
    date: '2026-07-09T11:05:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Anotada observação de visita: Cliente prefere atendimento presencial às terças-feiras.',
    affectedRecord: 'Pizzaria Bella Italia',
    actionType: 'Alteração',
    clientName: 'Pizzaria Bella Italia',
    city: 'Rio de Janeiro',
    state: 'RJ',
    cnpj: '45.678.901/0001-23',
  },
  {
    id: 'log-9',
    user: 'Roberto Alencar',
    profile: 'Curadoria',
    module: 'Central de Cardápios',
    action: 'Analisar IA',
    date: '2026-07-09T09:45:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Curadoria de cardápio iniciada com extração de 24 itens de bebidas e sobremesas via Gemini API.',
    affectedRecord: 'Cardápio Sushi Prime',
    actionType: 'Curadoria',
    clientName: 'Sushi Prime',
    city: 'Campinas',
    state: 'SP',
  },
  {
    id: 'log-10',
    user: 'Marcelo Baquero',
    profile: 'Administrador',
    module: 'Configurações',
    action: 'Alterar Configurações',
    date: '2026-07-08T16:30:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Parâmetro de inteligência comercial de margem aceitável ajustado de 15% para 18%.',
    affectedRecord: 'Margem Comercial Aceitável',
    actionType: 'Alteração',
  },
  {
    id: 'log-11',
    user: 'Paula Teixeira',
    profile: 'Somente Leitura',
    module: 'Relatórios',
    action: 'Exportar Excel',
    date: '2026-07-08T11:15:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Exportação da planilha Excel contendo o histórico de oportunidades consolidadas por regional.',
    affectedRecord: 'Planilha de Oportunidades Consolidadas',
    actionType: 'Exportação',
    recordCount: 1240,
  },
  {
    id: 'log-12',
    user: 'Roberto Alencar',
    profile: 'Curadoria',
    module: 'Central de Cardápios',
    action: 'Atualizar',
    date: '2026-07-08T10:00:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Revisão e homologação de itens de cardápio concluída, liberando dados para cruzamento inteligente.',
    affectedRecord: 'Sushi Prime',
    actionType: 'Curadoria',
    clientName: 'Sushi Prime',
    city: 'Campinas',
    state: 'SP',
  },
  {
    id: 'log-13',
    user: 'Mariana Costa',
    profile: 'Supervisor',
    module: 'Base de Clientes',
    action: 'Rejeitar',
    date: '2026-07-07T14:50:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Cadastro de estabelecimento reprovado devido a CNPJ inapto ou baixado no cadastro da Receita Federal.',
    affectedRecord: 'Bar do Zé Ltda',
    actionType: 'Rejeição',
    clientName: 'Bar do Zé Ltda',
    city: 'Duque de Caxias',
    state: 'RJ',
    cnpj: '00.111.222/0001-33',
  },
  {
    id: 'log-14',
    user: 'Marcelo Baquero',
    profile: 'Administrador',
    module: 'Usuários',
    action: 'Alterar Permissões',
    date: '2026-07-07T10:30:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Permissão de simulação de perfil expandida e atualizada para o perfil de Supervisor.',
    affectedRecord: 'Perfil Supervisor',
    actionType: 'Alteração',
  },
  {
    id: 'log-15',
    user: 'Arthur Mendes',
    profile: 'RCA / Comercial',
    module: 'Central de Oportunidades',
    action: 'Enviar para CRM',
    date: '2026-07-07T09:15:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Oportunidade de venda qualificada exportada com sucesso para o funil do RD Station CRM.',
    affectedRecord: 'Restaurante Sabor & Arte - Oferta Bebidas Premium',
    actionType: 'Exportação',
    clientName: 'Restaurante Sabor & Arte',
  },
  {
    id: 'log-16',
    user: 'Roberto Alencar',
    profile: 'Curadoria',
    module: 'Catálogo de Produtos',
    action: 'Criar',
    date: '2026-07-06T15:40:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Novo SKU cadastrado no catálogo oficial nacional: Cerveja IPA Artesanal 500ml.',
    affectedRecord: 'Cerveja IPA Artesanal 500ml',
    actionType: 'Criação',
    productName: 'Cerveja IPA Artesanal 500ml',
  },
  {
    id: 'log-17',
    user: 'Paula Teixeira',
    profile: 'Somente Leitura',
    module: 'Usuários',
    action: 'Editar',
    date: '2026-07-06T11:30:00',
    result: 'Bloqueado',
    origin: 'Web App',
    description: 'Tentativa de edição de dados de perfil do usuário Marcelo Baquero rejeitada por falta de privilégios de gravação.',
    affectedRecord: 'usr-1',
    actionType: 'Alteração',
  },
  {
    id: 'log-18',
    user: 'Marcelo Baquero',
    profile: 'Administrador',
    module: 'Configurações',
    action: 'Alterar Configurações',
    date: '2026-07-06T09:00:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Adicionado novo motivo padrão de rejeição de homologação: "Inconsistência cadastral grave".',
    affectedRecord: 'Motivos de Rejeição',
    actionType: 'Alteração',
  },
  {
    id: 'log-19',
    user: 'Mariana Costa',
    profile: 'Supervisor',
    module: 'Base de Clientes',
    action: 'Editar',
    date: '2026-07-05T16:20:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Atualização de dados cadastrais e de contato do cliente homologado.',
    affectedRecord: 'Restaurante Sabor & Arte',
    actionType: 'Alteração',
    clientName: 'Restaurante Sabor & Arte',
    city: 'Rio de Janeiro',
    state: 'RJ',
    cnpj: '12.345.678/0001-90',
  },
  {
    id: 'log-20',
    user: 'Arthur Mendes',
    profile: 'RCA / Comercial',
    module: 'Relatórios',
    action: 'Exportar CSV',
    date: '2026-07-05T11:45:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Exportação da lista de clientes da carteira em formato CSV contendo dados consolidados.',
    affectedRecord: 'Exportação Carteira Clientes',
    actionType: 'Exportação',
    recordCount: 42,
  },
  {
    id: 'log-21',
    user: 'Roberto Alencar',
    profile: 'Curadoria',
    module: 'Catálogo de Produtos',
    action: 'Excluir',
    date: '2026-07-05T10:15:00',
    result: 'Sucesso',
    origin: 'Web App',
    description: 'Produto descontinuado removido do catálogo oficial de distribuição: Suco de Uva 1L Antigo.',
    affectedRecord: 'Suco de Uva 1L Antigo',
    actionType: 'Exclusão',
    productName: 'Suco de Uva 1L Antigo',
  }
];

const KEYS = {
  PROFILES: 'ctrade_rbac_profiles',
  USERS: 'ctrade_rbac_users',
  LOGS: 'ctrade_rbac_logs',
  REAL_USER: 'ctrade_rbac_real_user',
  SIMULATION_ROLE: 'ctrade_rbac_simulated_role',
};

// Pure functions for LocalStorage management
export const SecurityService = {
  getProfiles(): AccessProfile[] {
    if (typeof window === 'undefined') return defaultProfiles;
    const stored = localStorage.getItem(KEYS.PROFILES);
    if (!stored) {
      localStorage.setItem(KEYS.PROFILES, JSON.stringify(defaultProfiles));
      return defaultProfiles;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return defaultProfiles;
    }
  },

  saveProfiles(profiles: AccessProfile[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('rbac-profiles-updated'));
    }
  },

  getUsers(): UserDetail[] {
    if (typeof window === 'undefined') return initialUsers;
    const stored = localStorage.getItem(KEYS.USERS);
    if (!stored) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
      return initialUsers;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialUsers;
    }
  },

  saveUsers(users: UserDetail[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      window.dispatchEvent(new CustomEvent('rbac-users-updated'));
    }
  },

  getLogs(): AuditLog[] {
    if (typeof window === 'undefined') return initialLogs;
    const stored = localStorage.getItem(KEYS.LOGS);
    if (!stored) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialLogs;
    }
  },

  saveLogs(logs: AuditLog[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('rbac-logs-updated'));
    }
  },

  logAction(params: {
    module: string;
    action: string;
    result: 'Sucesso' | 'Bloqueado';
    userOverride?: string;
    profileOverride?: string;
    description?: string;
    affectedRecord?: string;
    actionType?: string;
    clientName?: string;
    city?: string;
    state?: string;
    cnpj?: string;
    productName?: string;
    recordCount?: number;
  }) {
    const logs = this.getLogs();
    const realUser = this.getRealUser();
    const simulatedRoleName = this.getSimulatedRole();
    
    const userName = params.userOverride || realUser.name + ' ' + realUser.lastName;
    const userProfile = params.profileOverride || (simulatedRoleName || realUser.role);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: userName,
      profile: userProfile,
      module: params.module,
      action: params.action,
      date: new Date().toISOString(),
      result: params.result,
      origin: 'Web App',
      description: params.description || `${params.action} no módulo ${params.module}`,
      affectedRecord: params.affectedRecord || 'N/A',
      actionType: params.actionType || params.action,
      clientName: params.clientName,
      city: params.city,
      state: params.state,
      cnpj: params.cnpj,
      productName: params.productName,
      recordCount: params.recordCount,
    };

    logs.unshift(newLog);
    this.saveLogs(logs);
  },

  getRealUser(): UserDetail {
    const users = this.getUsers();
    // Default logged user is Marcelo Baquero (usr-1)
    const admin = users.find(u => u.id === 'usr-1') || initialUsers[0];
    return admin;
  },

  getSimulatedRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEYS.SIMULATION_ROLE);
  },

  setSimulatedRole(roleName: string | null) {
    if (typeof window !== 'undefined') {
      if (roleName) {
        localStorage.setItem(KEYS.SIMULATION_ROLE, roleName);
        this.logAction({
          module: 'Usuários',
          action: 'Simular Perfis',
          result: 'Sucesso',
          userOverride: 'Marcelo Baquero',
          profileOverride: 'Administrador'
        });
      } else {
        localStorage.removeItem(KEYS.SIMULATION_ROLE);
      }
      window.dispatchEvent(new CustomEvent('rbac-simulation-updated'));
    }
  },

  // Core verification engine
  hasPermission(moduleName: string, actionName: string): boolean {
    const realUser = this.getRealUser();
    const simulatedRole = this.getSimulatedRole();
    const activeRoleName = simulatedRole || realUser.role;

    // Load active profiles
    const profiles = this.getProfiles();
    const activeProfile = profiles.find(p => p.name === activeRoleName && p.active);

    if (!activeProfile) {
      // If role is deactivated or doesn't exist, return false
      return false;
    }

    // Admins always have access
    if (activeProfile.name === 'Administrador') {
      return true;
    }

    // Check specific module and action
    const modulePerms = activeProfile.permissions[moduleName];
    if (!modulePerms) return false;

    const hasPerm = !!modulePerms[actionName];

    return hasPerm;
  }
};
