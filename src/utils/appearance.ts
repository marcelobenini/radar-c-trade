/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlatformConfig {
  // Plataforma
  companyName: string;
  logoUrl: string;
  timezone: string;
  language: string;
  theme: 'claro' | 'escuro';
  version: string;
  institutionalInfo: string;
  
  // Comercial Lists
  states: { id: string; name: string; active: boolean }[];
  regionals: { id: string; name: string; active: boolean }[];
  rcas: { id: string; name: string; active: boolean }[];
  segments: { id: string; name: string; active: boolean }[];
  statuses: { id: string; name: string; active: boolean }[];
  priorities: { id: string; name: string; active: boolean }[];
  fitRanges: { id: string; name: string; range: string; active: boolean }[];

  // Catálogo Lists
  categories: { id: string; name: string; active: boolean }[];
  brands: { id: string; name: string; active: boolean }[];
  units: { id: string; name: string; active: boolean }[];
  catalogStatuses: { id: string; name: string; active: boolean }[];

  // Curadoria
  rejectionReasons: { id: string; reason: string; active: boolean }[];
  curatorStatuses: { id: string; name: string; active: boolean }[];
  mandatoryFields: { id: string; name: string; required: boolean }[];
  homologationRules: string;
  defaultMessages: { id: string; title: string; text: string; active: boolean }[];

  // Aparência
  accentColor: string; // hex color e.g. '#1e3a8a'
  accentHoverColor: string; // hex color e.g. '#172554'

  // Auditoria
  auditLogs: {
    id: string;
    timestamp: string;
    user: string;
    settingChanged: string;
    oldValue: string;
    newValue: string;
    origin: string;
  }[];
}

export const DEFAULT_CONFIG: PlatformConfig = {
  companyName: 'CTrade',
  logoUrl: '',
  timezone: 'America/Sao_Paulo (GMT-3)',
  language: 'pt-BR',
  theme: 'claro',
  version: 'v1.4.2-MVP',
  institutionalInfo: 'CTrade Radar - Inteligência Comercial e Qualificação de Oportunidades baseada em análise semântica de cardápios.',
  
  states: [
    { id: 'est-sp', name: 'São Paulo (SP)', active: true },
    { id: 'est-rj', name: 'Rio de Janeiro (RJ)', active: true },
    { id: 'est-mg', name: 'Minas Gerais (MG)', active: true },
    { id: 'est-rs', name: 'Rio Grande do Sul (RS)', active: true },
    { id: 'est-sc', name: 'Santa Catarina (SC)', active: true }
  ],
  regionals: [
    { id: 'reg-sudeste', name: 'Sudeste', active: true },
    { id: 'reg-sul', name: 'Sul', active: true },
    { id: 'reg-nordeste', name: 'Nordeste', active: true },
    { id: 'reg-centro-oeste', name: 'Centro-Oeste', active: true }
  ],
  rcas: [
    { id: 'rca-marcelo', name: 'Marcelo Baquero (RCA Principal)', active: true },
    { id: 'rca-aline', name: 'Aline Santos (RCA Sul)', active: true },
    { id: 'rca-roberto', name: 'Roberto Lima (RCA Sudeste)', active: true },
    { id: 'rca-juliana', name: 'Juliana Castro (RCA Nordeste)', active: true }
  ],
  segments: [
    { id: 'seg-italiano', name: 'Italiano / Trattoria', active: true },
    { id: 'seg-pizzaria', name: 'Pizzaria', active: true },
    { id: 'seg-hamburgueria', name: 'Hamburgueria', active: true },
    { id: 'seg-churrascaria', name: 'Churrascaria', active: true },
    { id: 'seg-hotel', name: 'Hotel / Pousada', active: true },
    { id: 'seg-japones', name: 'Japonês', active: true }
  ],
  statuses: [
    { id: 'stat-novo', name: 'Novo', active: true },
    { id: 'stat-analise', name: 'Em análise', active: true },
    { id: 'stat-analisado', name: 'Analisado', active: true },
    { id: 'stat-alta', name: 'Alta prioridade', active: true },
    { id: 'stat-cliente', name: 'Cliente', active: true },
    { id: 'stat-prospect', name: 'Prospect', active: true },
    { id: 'stat-inativo', name: 'Inativo', active: true }
  ],
  priorities: [
    { id: 'prio-critica', name: 'Crítica', active: true },
    { id: 'prio-alta', name: 'Alta', active: true },
    { id: 'prio-media', name: 'Média', active: true },
    { id: 'prio-baixa', name: 'Baixa', active: true }
  ],
  fitRanges: [
    { id: 'fit-alto', name: 'Muito Alto Fit', range: '85 - 100', active: true },
    { id: 'fit-bom', name: 'Alto Fit', range: '70 - 84', active: true },
    { id: 'fit-medio', name: 'Médio Fit', range: '40 - 69', active: true },
    { id: 'fit-baixo', name: 'Baixo Fit', range: '0 - 39', active: true }
  ],

  categories: [
    { id: 'cat-farinha', name: 'Farinhas Especiais', active: true },
    { id: 'cat-tomate', name: 'Tomates Pelados', active: true },
    { id: 'cat-azeite', name: 'Azeites de Oliva', active: true },
    { id: 'cat-queijo', name: 'Queijos Especiais', active: true },
    { id: 'cat-embutidos', name: 'Embutidos Finos', active: true }
  ],
  brands: [
    { id: 'brd-caputo', name: 'Caputo Tipo 00', active: true },
    { id: 'brd-mutti', name: 'Mutti', active: true },
    { id: 'brd-monini', name: 'Monini', active: true },
    { id: 'brd-grana', name: 'Grana Padano DOP', active: true },
    { id: 'brd-negroni', name: 'Negroni fatiados', active: true }
  ],
  units: [
    { id: 'uni-kg', name: 'Quilograma (kg)', active: true },
    { id: 'uni-cx', name: 'Caixa (cx)', active: true },
    { id: 'uni-lt', name: 'Litro (L)', active: true },
    { id: 'uni-un', name: 'Unidade (un)', active: true }
  ],
  catalogStatuses: [
    { id: 'cat-stat-ativo', name: 'Ativo', active: true },
    { id: 'cat-stat-inativo', name: 'Inativo', active: true }
  ],

  rejectionReasons: [
    { id: 'rej-baixa-qualidade', reason: 'Qualidade do arquivo PDF/Imagem corrompida', active: true },
    { id: 'rej-cardapio-incompleto', reason: 'Cardápio sem preços ou sem ingredientes descritos', active: true },
    { id: 'rej-segmento-inadequado', reason: 'Estilo culinário fora do fit comercial da CTrade', active: true },
    { id: 'rej-marca-sem-fit', reason: 'Sem produtos correspondentes no portfólio', active: true }
  ],
  curatorStatuses: [
    { id: 'cur-stat-novo', name: 'Novo', active: true },
    { id: 'cur-stat-analise', name: 'Em análise', active: true },
    { id: 'cur-stat-revisado', name: 'Revisado', active: true },
    { id: 'cur-stat-aprovado', name: 'Aprovado', active: true },
    { id: 'cur-stat-arquivado', name: 'Arquivado', active: true }
  ],
  mandatoryFields: [
    { id: 'fld-cnpj', name: 'CNPJ do Cliente', required: true },
    { id: 'fld-fantasy', name: 'Nome Fantasia', required: true },
    { id: 'fld-city', name: 'Cidade e Estado', required: true },
    { id: 'fld-phone', name: 'Telefone de Contato', required: false },
    { id: 'fld-email', name: 'E-mail do Responsável', required: false }
  ],
  homologationRules: 'Toda análise gerada pelo motor IA que possuir score de fit acima de 75 pontos deve ser homologada pelo Diretor Comercial antes de ser enviada ao CRM.',
  defaultMessages: [
    { id: 'msg-aprovado', title: 'Notificação de Fit Aprovado', text: 'Olá {vendedor}! Identificamos um excelente fit de {score} pontos para o cliente {cliente}. O portfólio de produtos foi anexado à sua central de oportunidades.', active: true },
    { id: 'msg-rejeitado', title: 'Cardápio Rejeitado para Curation', text: 'Prezado {vendedor}, o cardápio submetido para {cliente} foi rejeitado pelo seguinte motivo: {motivo}. Por favor, realize um novo upload com os dados corrigidos.', active: true }
  ],

  accentColor: '#1e3a8a', // Deep Blue (CTrade Blue)
  accentHoverColor: '#172554',

  auditLogs: [
    {
      id: 'aud-001',
      timestamp: '2026-07-09T10:00:00-03:00',
      user: 'Marcelo Baquero (marcelobbaquero@gmail.com)',
      settingChanged: 'Aparência > Cor Principal',
      oldValue: '#2563eb',
      newValue: '#1e3a8a',
      origin: 'Central de Configurações'
    },
    {
      id: 'aud-002',
      timestamp: '2026-07-09T10:05:00-03:00',
      user: 'Marcelo Baquero (marcelobbaquero@gmail.com)',
      settingChanged: 'Curadoria > Regras de Homologação',
      oldValue: 'Nenhuma regra configurada.',
      newValue: 'Toda análise gerada pelo motor IA que possuir score de fit acima de 75 pontos deve ser homologada pelo Diretor Comercial antes de ser enviada ao CRM.',
      origin: 'Central de Configurações'
    }
  ]
};

export function getPlatformConfig(): PlatformConfig {
  try {
    const saved = localStorage.getItem('ctrade_platform_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default config to ensure compatibility with newly added fields
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Error loading platform config', err);
  }
  return DEFAULT_CONFIG;
}

export function savePlatformConfig(config: PlatformConfig): void {
  try {
    localStorage.setItem('ctrade_platform_config', JSON.stringify(config));
    // Trigger custom event so other components can react
    window.dispatchEvent(new CustomEvent('ctrade-config-changed', { detail: config }));
  } catch (err) {
    console.error('Error saving platform config', err);
  }
}

export function applyPlatformAppearance(config: PlatformConfig): void {
  let styleEl = document.getElementById('ctrade-appearance-overrides');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'ctrade-appearance-overrides';
    document.head.appendChild(styleEl);
  }

  const { theme, accentColor } = config;

  // Let's compute a secondary darker color for hover states
  let hoverColor = '#172554'; // default slate dark blue
  if (accentColor) {
    // If we have a hex color, let's make a darker version
    // Simple hex darken:
    try {
      if (accentColor.startsWith('#') && accentColor.length === 7) {
        const r = parseInt(accentColor.substring(1, 3), 16);
        const g = parseInt(accentColor.substring(3, 5), 16);
        const b = parseInt(accentColor.substring(5, 7), 16);
        const dr = Math.max(0, Math.floor(r * 0.8));
        const dg = Math.max(0, Math.floor(g * 0.8));
        const db = Math.max(0, Math.floor(b * 0.8));
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        hoverColor = `#${toHex(dr)}${toHex(dg)}${toHex(db)}`;
      }
    } catch (e) {
      console.error('Failed to parse hex color', e);
    }
  }

  let css = `
    :root {
      --primary-color: ${accentColor};
      --primary-hover: ${hoverColor};
    }
    
    /* Override primary background colors */
    .bg-blue-900,
    [class*="bg-blue-900"] {
      background-color: var(--primary-color) !important;
    }
    
    /* Override hover states of primary background */
    .hover\\:bg-blue-950:hover,
    [class*="hover:bg-blue-950"]:hover {
      background-color: var(--primary-hover) !important;
    }
    
    /* Override text colors of primary elements */
    .text-blue-900,
    [class*="text-blue-900"] {
      color: var(--primary-color) !important;
    }
    
    .text-blue-600,
    [class*="text-blue-600"] {
      color: var(--primary-color) !important;
    }
    
    /* Border colors */
    .border-blue-900,
    [class*="border-blue-900"] {
      border-color: var(--primary-color) !important;
    }
    
    .focus\\:border-blue-500:focus,
    [class*="focus:border-blue-500"]:focus {
      border-color: var(--primary-color) !important;
    }
    
    .bg-blue-50 {
      background-color: ${accentColor}15 !important; /* adding opacity */
    }
    
    .text-blue-800 {
      color: var(--primary-color) !important;
    }
  `;

  if (theme === 'escuro') {
    css += `
      body, html {
        background-color: #0b0f19 !important;
      }
      
      #app-root-container {
        background-color: #0b0f19 !important;
        color: #cbd5e1 !important;
      }
      
      #app-root-container .bg-slate-50 {
        background-color: #0b0f19 !important;
      }
      
      #app-root-container .bg-white {
        background-color: #111827 !important;
        border-color: #1f2937 !important;
      }
      
      #app-root-container .border-slate-100, 
      #app-root-container .border-slate-200,
      #app-root-container .border-slate-150,
      #app-root-container .border-slate-200\\/80 {
        border-color: #1f2937 !important;
      }
      
      #app-root-container .text-slate-800,
      #app-root-container .text-slate-900 {
        color: #f3f4f6 !important;
      }
      
      #app-root-container .text-slate-500,
      #app-root-container .text-slate-600,
      #app-root-container .text-slate-700 {
        color: #9ca3af !important;
      }
      
      #app-root-container .text-slate-400 {
        color: #6b7280 !important;
      }
      
      #app-root-container .bg-slate-100 {
        background-color: #1f2937 !important;
      }
      
      #app-root-container .hover\\:bg-slate-50:hover,
      #app-root-container .hover\\:bg-slate-50\\/50:hover {
        background-color: #1f2937 !important;
      }
      
      #app-root-container input,
      #app-root-container select,
      #app-root-container textarea {
        background-color: #111827 !important;
        border-color: #374151 !important;
        color: #f3f4f6 !important;
      }
      
      #app-root-container .bg-slate-50\\/50 {
        background-color: #111827 !important;
      }
      
      #app-root-container .divide-slate-100 > * + * {
        border-color: #1f2937 !important;
      }
    `;
  }

  styleEl.innerHTML = css;
}

export function logAuditAction(
  user: string,
  settingChanged: string,
  oldValue: string,
  newValue: string,
  origin: string = 'Central de Configurações'
): void {
  const config = getPlatformConfig();
  const newLog = {
    id: `aud-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user,
    settingChanged,
    oldValue: oldValue || 'Nenhum',
    newValue: newValue || 'Nenhum',
    origin
  };
  
  config.auditLogs = [newLog, ...config.auditLogs];
  savePlatformConfig(config);
}
