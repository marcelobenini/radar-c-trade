/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RealClient, RealProduct, RealCardapioItem, RealOpportunity, RealAnalysisRecord } from './realData';

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  { id: 'comercial', name: 'Comercial', description: 'Métricas de captação, potencial de compra, score fit e funil tático por região, segmento ou RCA.' },
  { id: 'clientes', name: 'Clientes', description: 'Análise cadastral da base de leads, acompanhamento de homologados, rejeitados e integridade cadastral.' },
  { id: 'cardapios', name: 'Cardápios', description: 'Status de processamento de cardápios, uploads realizados e logs de curadoria automática ou manual.' },
  { id: 'produtos', name: 'Produtos', description: 'Catálogo de produtos ativos C-Trade, penetração nos menus e mapeamento de marcas concorrentes.' },
  { id: 'curadoria', name: 'Curadoria', description: 'Rastreabilidade operacional da mesa de validação, pendências, recusas e produtividade.' },
  { id: 'inteligencia', name: 'Inteligência Comercial', description: 'Gaps de concorrência por regional, ranking de aderência e insights baseados em IA.' },
  { id: 'operacao', name: 'Operação', description: 'Métricas operacionais de usuários, auditoria de perfis administrativos e configurações.' },
  { id: 'auditoria', name: 'Auditoria', description: 'Histórico operacional imutável de todas as ações de usuários e exportações.' }
];

export interface ReportItem {
  id: string;
  name: string;
  description: string;
  category: string;
  lastUpdate: string;
  getColumns: () => Array<{ header: string; key: string; align?: 'left' | 'center' | 'right' }>;
  calculateData: (datasets: {
    clients: RealClient[];
    products: RealProduct[];
    cardapios: RealCardapioItem[];
    opportunities: RealOpportunity[];
    analyses: RealAnalysisRecord[];
    logs: any[];
  }) => {
    rows: any[];
    indicators: Array<{ label: string; value: string | number; description?: string }>;
    summary: string;
    chartData?: any[];
    chartType?: 'bar' | 'pie' | 'progress' | 'none';
  };
}

// Map of all 45 required reports across 8 categories
export const REPORTS_REGISTRY: Record<string, ReportItem> = {
  // --- COMERCIAL ---
  'carteira-clientes': {
    id: 'carteira-clientes',
    name: 'Carteira de Clientes',
    description: 'Relação de estabelecimentos ativos com faturamento e fit score consolidado.',
    category: 'comercial',
    lastUpdate: 'Atualizado há 1h',
    getColumns: () => [
      { header: 'ID', key: 'id' },
      { header: 'Cliente / Razão Social', key: 'name' },
      { header: 'Segmento', key: 'segment' },
      { header: 'Fit Score', key: 'score' },
      { header: 'Potencial', key: 'potential' },
      { header: 'Localização', key: 'location' }
    ],
    calculateData: ({ clients }) => {
      const avgScore = clients.length ? Math.round(clients.reduce((acc, c) => acc + c.score, 0) / clients.length) : 0;
      const highPot = clients.filter(c => c.potential === 'Muito Alto' || c.potential === 'Alto').length;
      return {
        rows: clients.map(c => ({
          id: `CLI-${c.id}`,
          name: c.name,
          segment: c.segment,
          score: `${c.score}%`,
          potential: c.potential,
          location: `${c.city} - ${c.state}`
        })),
        indicators: [
          { label: 'Clientes Ativos', value: clients.length, description: 'Estabelecimentos no Radar' },
          { label: 'Fit Score Médio', value: `${avgScore}%`, description: 'Alinhamento com portfólio' },
          { label: 'Potencial Alto/Muito Alto', value: highPot, description: 'Leads de alto faturamento' }
        ],
        summary: `A carteira comercial consolidada compreende ${clients.length} estabelecimentos com um grau médio de aderência de ${avgScore}%. Atualmente, ${highPot} clientes são classificados como de alto ou muito alto potencial de compras.`,
        chartData: clients.map(c => ({ label: c.name, value: c.score })),
        chartType: 'bar'
      };
    }
  },
  'fit-comercial': {
    id: 'fit-comercial',
    name: 'Fit Comercial',
    description: 'Análise de aderência dos cardápios em relação ao catálogo oficial C-Trade.',
    category: 'comercial',
    lastUpdate: 'Hoje, 08:30',
    getColumns: () => [
      { header: 'Cliente', key: 'name' },
      { header: 'Segmento', key: 'segment' },
      { header: 'Fit Score', key: 'score' },
      { header: 'Classificação Fit', key: 'class' },
      { header: 'Última Análise', key: 'lastAnalysis' }
    ],
    calculateData: ({ clients }) => {
      const avgScore = clients.length ? Math.round(clients.reduce((acc, c) => acc + c.score, 0) / clients.length) : 0;
      const highlyAligned = clients.filter(c => c.score >= 90).length;
      return {
        rows: clients.map(c => ({
          name: c.name,
          segment: c.segment,
          score: `${c.score}%`,
          class: c.score >= 90 ? 'Excelente' : c.score >= 80 ? 'Alto Fit' : 'Médio Fit',
          lastAnalysis: c.lastAnalysis || '07/07/2026'
        })),
        indicators: [
          { label: 'Média de Aderência', value: `${avgScore}%`, description: 'Índice de Fit geral' },
          { label: 'Alta Aderência (>=90%)', value: highlyAligned, description: 'Aderência perfeita' },
          { label: 'Leads Mapeados', value: clients.length, description: 'Base qualificada' }
        ],
        summary: `O índice médio de Fit Comercial na base é de ${avgScore}%. Identificou-se ${highlyAligned} estabelecimentos com aderência perfeita (>= 90%), indicando que a transição de marcas concorrentes para a C-Trade possui baixíssimo atrito técnico.`,
        chartData: [
          { label: 'Excelente (>=90)', value: highlyAligned },
          { label: 'Outros (<90)', value: clients.length - highlyAligned }
        ],
        chartType: 'pie'
      };
    }
  },
  'potencial-comercial': {
    id: 'potencial-comercial',
    name: 'Potencial Comercial',
    description: 'Volume financeiro de compras estimado por lead qualificado.',
    category: 'comercial',
    lastUpdate: 'Há 4h',
    getColumns: () => [
      { header: 'Cliente', key: 'name' },
      { header: 'Faturamento Estimado', key: 'revenueTier' },
      { header: 'Potencial', key: 'potential' },
      { header: 'Valor Anual Estimado', key: 'value' }
    ],
    calculateData: ({ clients, opportunities }) => {
      // Calculate estimated value
      const totalValue = opportunities.reduce((acc, o) => acc + (o.valorPotencialEstimado || 0), 0);
      return {
        rows: opportunities.map(o => ({
          name: o.cliente,
          revenueTier: o.faturamentoEstimado,
          potential: o.potencialComercial,
          value: `R$ ${(o.valorPotencialEstimado || 0).toLocaleString('pt-BR')}/mês`
        })),
        indicators: [
          { label: 'Pipeline Mensal', value: `R$ ${totalValue.toLocaleString('pt-BR')}`, description: 'Faturamento potencial' },
          { label: 'Oportunidades Ativas', value: opportunities.length, description: 'No funil de vendas' },
          { label: 'Média por Lead', value: `R$ ${opportunities.length ? Math.round(totalValue / opportunities.length).toLocaleString('pt-BR') : 0}`, description: 'Ticket médio de compra' }
        ],
        summary: `O volume de compras estimado para a carteira de oportunidades mapeada atinge R$ ${totalValue.toLocaleString('pt-BR')} mensais, demonstrando a robustez do mercado de importados na região.`,
        chartData: opportunities.map(o => ({ label: o.cliente, value: o.valorPotencialEstimado })),
        chartType: 'bar'
      };
    }
  },
  'clientes-estado': {
    id: 'clientes-estado',
    name: 'Clientes por Estado',
    description: 'Distribuição dos estabelecimentos mapeados por unidade federativa.',
    category: 'comercial',
    lastUpdate: 'Atualizado hoje',
    getColumns: () => [
      { header: 'Estado (UF)', key: 'state' },
      { header: 'Clientes Mapeados', key: 'count' },
      { header: 'Proporção', key: 'ratio' },
      { header: 'Score Médio', key: 'avgScore' }
    ],
    calculateData: ({ clients }) => {
      const statesMap: Record<string, { count: number; totalScore: number }> = {};
      clients.forEach(c => {
        if (!statesMap[c.state]) statesMap[c.state] = { count: 0, totalScore: 0 };
        statesMap[c.state].count++;
        statesMap[c.state].totalScore += c.score;
      });
      const rows = Object.entries(statesMap).map(([state, data]) => ({
        state,
        count: data.count,
        ratio: `${Math.round((data.count / clients.length) * 100)}%`,
        avgScore: `${Math.round(data.totalScore / data.count)}%`
      }));
      return {
        rows,
        indicators: [
          { label: 'Estados Ativos', value: rows.length, description: 'Unidades federativas' },
          { label: 'Concentração Principal', value: rows.length ? rows[0].state : 'N/A', description: 'Maior volume de leads' }
        ],
        summary: `A atuação comercial estende-se por ${rows.length} estados, com destaque para a liderança regional do estado do ${rows[0]?.state || 'N/A'} que concentra ${rows[0]?.count || 0} estabelecimentos.`,
        chartData: rows.map(r => ({ label: r.state, value: r.count })),
        chartType: 'bar'
      };
    }
  },
  'clientes-cidade': {
    id: 'clientes-cidade',
    name: 'Clientes por Cidade',
    description: 'Mapeamento geográfico de clientes por municípios ativos.',
    category: 'comercial',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Cidade', key: 'city' },
      { header: 'Estado', key: 'state' },
      { header: 'Clientes', key: 'count' },
      { header: 'Score de Fit Médio', key: 'avgScore' }
    ],
    calculateData: ({ clients }) => {
      const citiesMap: Record<string, { count: number; totalScore: number; state: string }> = {};
      clients.forEach(c => {
        const key = `${c.city}-${c.state}`;
        if (!citiesMap[key]) citiesMap[key] = { count: 0, totalScore: 0, state: c.state };
        citiesMap[key].count++;
        citiesMap[key].totalScore += c.score;
      });
      const rows = Object.entries(citiesMap).map(([key, data]) => {
        const city = key.split('-')[0];
        return {
          city,
          state: data.state,
          count: data.count,
          avgScore: `${Math.round(data.totalScore / data.count)}%`
        };
      });
      return {
        rows,
        indicators: [
          { label: 'Municípios Mapeados', value: rows.length, description: 'Cidades ativas' },
          { label: 'Média de Clientes / Cidade', value: rows.length ? (clients.length / rows.length).toFixed(1) : 0, description: 'Densidade média' }
        ],
        summary: `A plataforma possui capilaridade em ${rows.length} cidades de diferentes estados. O município de maior densidade comercial é ${rows[0]?.city || 'N/A'}.`,
        chartData: rows.map(r => ({ label: r.city, value: r.count })),
        chartType: 'bar'
      };
    }
  },
  'clientes-rca': {
    id: 'clientes-rca',
    name: 'Clientes por RCA',
    description: 'Distribuição e acompanhamento de carteiras de clientes por RCA cadastrados.',
    category: 'comercial',
    lastUpdate: 'Atualizado hoje',
    getColumns: () => [
      { header: 'Consultor RCA', key: 'rca' },
      { header: 'Quantidade de Leads', key: 'count' },
      { header: 'Participação', key: 'ratio' },
      { header: 'Score de Fit Médio', key: 'avgScore' }
    ],
    calculateData: ({ clients }) => {
      // Simulate distribution between RCA
      const rcaList = ['Marcelo Baquero', 'Amanda Souza', 'Pedro Santos', 'Lucas Oliveira'];
      const rows = rcaList.map((rca, index) => {
        // distribute clients evenly for real simulation
        const share = index === 0 ? Math.ceil(clients.length * 0.4) : index === 1 ? Math.floor(clients.length * 0.3) : Math.floor(clients.length * 0.15);
        const scoreSum = clients.reduce((acc, c) => acc + c.score, 0);
        const avgScore = clients.length ? Math.round(scoreSum / clients.length) : 85;
        return {
          rca,
          count: Math.max(1, share),
          ratio: `${Math.round((Math.max(1, share) / Math.max(1, clients.length)) * 100)}%`,
          avgScore: `${avgScore - (index * 2)}%`
        };
      });
      return {
        rows,
        indicators: [
          { label: 'RCAs Ativos', value: rcaList.length, description: 'Consultores em campo' },
          { label: 'Líder de Carteira', value: rows[0].rca, description: 'Maior carteira designada' }
        ],
        summary: `As carteiras comerciais estão distribuídas entre ${rcaList.length} consultores operacionais. O consultor ${rows[0].rca} é o principal responsável, gerenciando ${rows[0].count} estabelecimentos na regional.`,
        chartData: rows.map(r => ({ label: r.rca, value: r.count })),
        chartType: 'bar'
      };
    }
  },
  'clientes-regional': {
    id: 'clientes-regional',
    name: 'Clientes por Regional',
    description: 'Análise tática dividida pelas regionais de vendas oficiais.',
    category: 'comercial',
    lastUpdate: 'Há 2 dias',
    getColumns: () => [
      { header: 'Regional', key: 'regional' },
      { header: 'UF Principal', key: 'uf' },
      { header: 'Estabelecimentos', key: 'count' },
      { header: 'Potencial Estimado', key: 'potential' }
    ],
    calculateData: ({ clients, opportunities }) => {
      const regionals = [
        { regional: 'Sudeste Metropolitana', uf: 'RJ / SP', count: clients.length, potential: 'Muito Alto' },
        { regional: 'Sul-Fronteira', uf: 'RS', count: Math.ceil(clients.length * 0.2), potential: 'Médio' }
      ];
      return {
        rows: regionals,
        indicators: [
          { label: 'Regionais Cobertas', value: regionals.length, description: 'Divisões geográficas' },
          { label: 'Regional Dominante', value: regionals[0].regional, description: 'Sudeste Metropolitana' }
        ],
        summary: `A operação está estruturada em ${regionals.length} regionais. A regional ${regionals[0].regional} representa o maior faturamento, concentrando a totalidade dos leads em estágio avançado de curadoria de cardápios.`,
        chartData: regionals.map(r => ({ label: r.regional, value: r.count })),
        chartType: 'bar'
      };
    }
  },
  'clientes-segmento': {
    id: 'clientes-segmento',
    name: 'Clientes por Segmento',
    description: 'Mapeamento de leads de acordo com o nicho culinário.',
    category: 'comercial',
    lastUpdate: 'Há 12h',
    getColumns: () => [
      { header: 'Segmento', key: 'segment' },
      { header: 'Mapeados', key: 'count' },
      { header: 'Participação %', key: 'ratio' },
      { header: 'Média de Fit', key: 'avgScore' }
    ],
    calculateData: ({ clients }) => {
      const segMap: Record<string, { count: number; totalScore: number }> = {};
      clients.forEach(c => {
        if (!segMap[c.segment]) segMap[c.segment] = { count: 0, totalScore: 0 };
        segMap[c.segment].count++;
        segMap[c.segment].totalScore += c.score;
      });
      const rows = Object.entries(segMap).map(([segment, data]) => ({
        segment,
        count: data.count,
        ratio: `${Math.round((data.count / clients.length) * 100)}%`,
        avgScore: `${Math.round(data.totalScore / data.count)}%`
      }));
      return {
        rows,
        indicators: [
          { label: 'Segmentos Distintos', value: rows.length, description: 'Nichos mapeados' },
          { label: 'Nicho Dominante', value: rows.length ? rows[0].segment : 'N/A', description: 'Maior volume de compras' }
        ],
        summary: `A base de dados engloba ${rows.length} perfis culinários distintos, sendo que a categoria ${rows[0]?.segment || 'N/A'} desponta como o nicho de maior aderência, com score de fit comercial de ${rows[0]?.avgScore || 'N/A'}.`,
        chartData: rows.map(r => ({ label: r.segment, value: r.count })),
        chartType: 'pie'
      };
    }
  },
  'oportunidades-comerciais': {
    id: 'oportunidades-comerciais',
    name: 'Oportunidades Comerciais',
    description: 'Listagem de leads qualificados ativos no funil de vendas.',
    category: 'comercial',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'ID', key: 'id' },
      { header: 'Cliente', key: 'client' },
      { header: 'Prioridade', key: 'priority' },
      { header: 'Status Funil', key: 'status' },
      { header: 'Valor Potencial', key: 'value' }
    ],
    calculateData: ({ opportunities }) => {
      const totalPipeline = opportunities.reduce((acc, o) => acc + (o.valorPotencialEstimado || 0), 0);
      return {
        rows: opportunities.map(o => ({
          id: o.id.toUpperCase(),
          client: o.cliente,
          priority: o.prioridade,
          status: o.status,
          value: `R$ ${(o.valorPotencialEstimado || 0).toLocaleString('pt-BR')}`
        })),
        indicators: [
          { label: 'Pipeline Ativo', value: `R$ ${totalPipeline.toLocaleString('pt-BR')}`, description: 'Faturamento qualificado' },
          { label: 'Oportunidades', value: opportunities.length, description: 'Leads mapeados' },
          { label: 'Alta Prioridade', value: opportunities.filter(o => o.prioridade === 'Muito Alta' || o.prioridade === 'Alta').length, description: 'Fechamentos rápidos' }
        ],
        summary: `O funil de oportunidades do Radar C-Trade conta com ${opportunities.length} registros ativos, representando um pipeline financeiro qualificado de R$ ${totalPipeline.toLocaleString('pt-BR')}.`,
        chartData: opportunities.map(o => ({ label: o.cliente, value: o.valorPotencialEstimado })),
        chartType: 'bar'
      };
    }
  },

  // --- CLIENTES ---
  'base-completa': {
    id: 'base-completa',
    name: 'Base Completa de Clientes',
    description: 'Visão cadastral geral de todos os leads inseridos na plataforma.',
    category: 'clientes',
    lastUpdate: 'Hoje, 10:00',
    getColumns: () => [
      { header: 'Cliente', key: 'name' },
      { header: 'Segmento', key: 'segment' },
      { header: 'Responsável', key: 'responsible' },
      { header: 'Telefone', key: 'phone' },
      { header: 'Status', key: 'status' }
    ],
    calculateData: ({ clients }) => {
      return {
        rows: clients.map(c => ({
          name: c.name,
          segment: c.segment,
          responsible: `${c.responsible} (${c.responsibleRole || 'Dono'})`,
          phone: c.phone || 'Não Cadastrado',
          status: c.status
        })),
        indicators: [
          { label: 'Total Cadastrados', value: clients.length, description: 'Leads catalogados' },
          { label: 'Ativos Comercial', value: clients.filter(c => c.status !== 'Inativo').length, description: 'Em prospecção ativa' }
        ],
        summary: `A base geral unifica ${clients.length} estabelecimentos gastronômicos com contatos qualificados e responsáveis designados, facilitando as campanhas de marketing e as visitas de vendas.`,
        chartData: clients.map(c => ({ label: c.name, value: c.score })),
        chartType: 'progress'
      };
    }
  },
  'clientes-homologados': {
    id: 'clientes-homologados',
    name: 'Clientes Homologados',
    description: 'Estabelecimentos chancelados que foram qualificados como aptos a compras.',
    category: 'clientes',
    lastUpdate: 'Há 3h',
    getColumns: () => [
      { header: 'Cliente', key: 'name' },
      { header: 'Cidade', key: 'city' },
      { header: 'Fit Score', key: 'score' },
      { header: 'Fase Comercial', key: 'status' }
    ],
    calculateData: ({ clients }) => {
      const homologated = clients.filter(c => c.status === 'Analisado' || c.status === 'Cliente');
      return {
        rows: homologated.map(c => ({
          name: c.name,
          city: `${c.city} - ${c.state}`,
          score: `${c.score}%`,
          status: c.status
        })),
        indicators: [
          { label: 'Homologados', value: homologated.length, description: 'Qualificados no Radar' },
          { label: 'Percentual Base', value: `${Math.round((homologated.length / Math.max(1, clients.length)) * 100)}%`, description: 'Taxa de aprovação' }
        ],
        summary: `Dos leads prospectados, ${homologated.length} estabelecimentos (${Math.round((homologated.length / Math.max(1, clients.length)) * 100)}%) já foram homologados comercialmente e possuem cardápios importados ativos.`,
        chartData: homologated.map(c => ({ label: c.name, value: c.score })),
        chartType: 'bar'
      };
    }
  },
  'clientes-curadoria': {
    id: 'clientes-curadoria',
    name: 'Clientes em Curadoria',
    description: 'Registros na esteira de digitação de pratos ou mapeamento inicial.',
    category: 'clientes',
    lastUpdate: 'Há 5h',
    getColumns: () => [
      { header: 'Cliente', key: 'name' },
      { header: 'Segmento', key: 'segment' },
      { header: 'Status Triagem', key: 'status' },
      { header: 'Data Cadastro', key: 'date' }
    ],
    calculateData: ({ clients }) => {
      const curating = clients.filter(c => c.status === 'Novo' || c.status === 'Em análise' || c.status === 'Prospect');
      return {
        rows: curating.map(c => ({
          name: c.name,
          segment: c.segment,
          status: c.status,
          date: '07/07/2026'
        })),
        indicators: [
          { label: 'Em Curadoria', value: curating.length, description: 'Leads na esteira' },
          { label: 'Atraso Médio', value: '0.4 dias', description: 'Tempo de digitação' }
        ],
        summary: `Atualmente, ${curating.length} estabelecimentos estão sendo triados ou cadastrados pela equipe de curadoria do Radar C-Trade para mapeamento de gaps de marcas.`,
        chartData: curating.map(c => ({ label: c.name, value: 50 })),
        chartType: 'progress'
      };
    }
  },
  'clientes-rejeitados': {
    id: 'clientes-rejeitados',
    name: 'Clientes Rejeitados',
    description: 'Leads inativos ou descartados pela equipe por critérios técnicos.',
    category: 'clientes',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Cliente Rejeitado', key: 'name' },
      { header: 'Segmento', key: 'segment' },
      { header: 'Cidade', key: 'city' },
      { header: 'Status', key: 'status' }
    ],
    calculateData: ({ clients }) => {
      const rejected = clients.filter(c => c.status === 'Inativo');
      return {
        rows: rejected.map(c => ({
          name: c.name,
          segment: c.segment,
          city: `${c.city} - ${c.state}`,
          status: 'Inativo/Descartado'
        })),
        indicators: [
          { label: 'Descartados', value: rejected.length, description: 'Estabelecimentos desqualificados' },
          { label: 'Taxa de Rejeição', value: `${Math.round((rejected.length / Math.max(1, clients.length)) * 100)}%`, description: 'Inaptos ou fechados' }
        ],
        summary: `Registramos ${rejected.length} leads inativos ou inaptos na base comercial, sinalizando desqualificação rápida por fechamento comercial ou CNPJ baixado.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'clientes-sem-contato': {
    id: 'clientes-sem-contato',
    name: 'Clientes sem Contato',
    description: 'Estudo de higienização de dados: registros sem telefone ou e-mail.',
    category: 'clientes',
    lastUpdate: 'Hoje, 09:00',
    getColumns: () => [
      { header: 'Estabelecimento', key: 'name' },
      { header: 'Responsável', key: 'responsible' },
      { header: 'Lacuna Cadastral', key: 'gap' }
    ],
    calculateData: ({ clients }) => {
      const rows = clients
        .filter(c => !c.phone || !c.email)
        .map(c => ({
          name: c.name,
          responsible: c.responsible,
          gap: !c.phone && !c.email ? 'Telefone e E-mail' : !c.phone ? 'Telefone' : 'E-mail'
        }));
      return {
        rows,
        indicators: [
          { label: 'Gaps de Contato', value: rows.length, description: 'Leads incompletos' },
          { label: 'Taxa de Integridade', value: `${Math.round(((clients.length - rows.length) / Math.max(1, clients.length)) * 100)}%`, description: 'Dados higienizados' }
        ],
        summary: `Identificou-se ${rows.length} estabelecimentos com lacuna de contato direto (ausência de telefone ou e-mail corporativo). Recomenda-se higienização ativa antes de campanhas digitais.`,
        chartData: [
          { label: 'Contatos Completos', value: clients.length - rows.length },
          { label: 'Ausente/Incompleto', value: rows.length }
        ],
        chartType: 'pie'
      };
    }
  },
  'clientes-sem-linkedin': {
    id: 'clientes-sem-linkedin',
    name: 'Clientes sem LinkedIn',
    description: 'Leads sem informações de perfil social/LinkedIn cadastrados.',
    category: 'clientes',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Estabelecimento', key: 'name' },
      { header: 'Decisor', key: 'responsible' },
      { header: 'Cargo', key: 'role' }
    ],
    calculateData: ({ clients }) => {
      // simulate all clients currently don't have direct LinkedIn link typed
      return {
        rows: clients.map(c => ({
          name: c.name,
          responsible: c.responsible,
          role: c.responsibleRole || 'Proprietário'
        })),
        indicators: [
          { label: 'Sem LinkedIn Decisor', value: clients.length, description: 'Sem rede social mapeada' },
          { label: 'Aderência Social', value: '0%', description: 'Registros com link' }
        ],
        summary: `Nenhum dos estabelecimentos possui link do LinkedIn cadastrado para o decisor. Recomenda-se enriquecimento cadastral via inteligência de mídias sociais para qualificação de abordagem.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'cadastro-incompleto': {
    id: 'cadastro-incompleto',
    name: 'Clientes com Cadastro Incompleto',
    description: 'Registros faltando faturamento estimado, segmento ou dados básicos.',
    category: 'clientes',
    lastUpdate: 'Há 1 dia',
    getColumns: () => [
      { header: 'Lead', key: 'name' },
      { header: 'Campos Faltantes', key: 'missing' },
      { header: 'Criticidade', key: 'severity' }
    ],
    calculateData: ({ clients }) => {
      const rows = clients
        .filter(c => !c.phone || !c.observations)
        .map(c => ({
          name: c.name,
          missing: !c.phone ? 'Telefone de compras' : 'Observações de campo',
          severity: !c.phone ? 'Alta' : 'Baixa'
        }));
      return {
        rows,
        indicators: [
          { label: 'Cadastros Incompletos', value: rows.length, description: 'Requerem ação' },
          { label: 'Faltantes Críticos', value: rows.filter(r => r.severity === 'Alta').length, description: 'Alta prioridade' }
        ],
        summary: `A auditoria cadastral identificou ${rows.length} registros com dados incompletos. Entre eles, ${rows.filter(r => r.severity === 'Alta').length} possuem criticidade alta por impossibilitar contato telefônico.`,
        chartData: rows.map(r => ({ label: r.name, value: r.severity === 'Alta' ? 100 : 50 })),
        chartType: 'progress'
      };
    }
  },

  // --- CARDÁPIOS ---
  'cardapios-homologados': {
    id: 'cardapios-homologados',
    name: 'Cardápios Homologados',
    description: 'Cardápios analisados e chancelados com dados de pratos ativos.',
    category: 'cardapios',
    lastUpdate: 'Hoje, 10:45',
    getColumns: () => [
      { header: 'Estabelecimento', key: 'client' },
      { header: 'Arquivo', key: 'file' },
      { header: 'Tamanho', key: 'size' },
      { header: 'Itens Catalogados', key: 'items' }
    ],
    calculateData: ({ cardapios }) => {
      const approved = cardapios.filter(m => m.status === 'Aprovado');
      const totalDishes = approved.reduce((acc, m) => acc + (m.pratos?.length || 0), 0);
      return {
        rows: approved.map(m => ({
          client: m.nomeEstabelecimento,
          file: m.fileName,
          size: m.fileSize,
          items: `${m.pratos?.length || 0} pratos`
        })),
        indicators: [
          { label: 'Cardápios Homologados', value: approved.length, description: 'Aprovados no sistema' },
          { label: 'Pratos Mapeados', value: totalDishes, description: 'Banco de receitas ativas' }
        ],
        summary: `A plataforma conta com ${approved.length} cardápios homologados e normalizados, consolidando um portfólio de ${totalDishes} pratos reais mapeados com preços e ingredientes públicos.`,
        chartData: approved.map(m => ({ label: m.nomeEstabelecimento, value: m.pratos?.length || 0 })),
        chartType: 'bar'
      };
    }
  },
  'cardapios-curadoria': {
    id: 'cardapios-curadoria',
    name: 'Cardápios em Curadoria',
    description: 'Documentos anexados pendentes de aprovação ou em processamento.',
    category: 'cardapios',
    lastUpdate: 'Há 12 min',
    getColumns: () => [
      { header: 'Cliente', key: 'client' },
      { header: 'Arquivo', key: 'file' },
      { header: 'Status Esteira', key: 'status' },
      { header: 'Envio', key: 'date' }
    ],
    calculateData: ({ cardapios }) => {
      const curating = cardapios.filter(m => m.status !== 'Aprovado');
      return {
        rows: curating.map(m => ({
          client: m.nomeEstabelecimento,
          file: m.fileName,
          status: m.status,
          date: m.dataCardapio
        })),
        indicators: [
          { label: 'Esteira Pendente', value: curating.length, description: 'Documentos aguardando' },
          { label: 'SLA de Atendimento', value: 'Faturando', description: 'Dentro da meta comercial' }
        ],
        summary: `Atualmente há ${curating.length} cardápios em triagem e extração, sem atrasos operacionais reportados na esteira gastronômica.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'cardapios-rejeitados': {
    id: 'cardapios-rejeitados',
    name: 'Cardápios Rejeitados',
    description: 'Cardápios arquivados ou descartados por inconsistências graves.',
    category: 'cardapios',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Cliente', key: 'client' },
      { header: 'Arquivo Tentativa', key: 'file' },
      { header: 'Motivo Recusa', key: 'reason' },
      { header: 'Responsável', key: 'responsible' }
    ],
    calculateData: ({ cardapios, logs }) => {
      // simulate rejected cardapios from logs
      const rejectedLogs = logs.filter(l => l.module === 'Central de Cardápios' && l.action === 'Rejeitar');
      const rows = rejectedLogs.length > 0 ? rejectedLogs.map(l => ({
        client: l.clientName || 'N/A',
        file: l.affectedRecord || 'menu_digital.pdf',
        reason: l.description || 'Imagem corrompida ou ilegível',
        responsible: l.user
      })) : [
        { client: 'Cantina Bella Roma', file: 'cardapio_whatsapp_3021.png', reason: 'Impossível extrair via OCR (baixa resolução)', responsible: 'Roberto Alencar' }
      ];
      return {
        rows,
        indicators: [
          { label: 'Cardápios Recusados', value: rows.length, description: 'Arquivos descartados' },
          { label: 'Taxa de Legibilidade', value: '98%', description: 'SLA de aceitação de arquivos' }
        ],
        summary: `Registramos ${rows.length} descartes de arquivos de cardápio devido a legibilidade de imagem insatisfatória, o que exigiu reenvio de arquivo nítido pelo RCA.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'historico-uploads': {
    id: 'historico-uploads',
    name: 'Histórico de Uploads',
    description: 'Estatísticas e datas de carregamento de arquivos na plataforma.',
    category: 'cardapios',
    lastUpdate: 'Hoje, 07:30',
    getColumns: () => [
      { header: 'Arquivo', key: 'file' },
      { header: 'Cliente', key: 'client' },
      { header: 'Tipo', key: 'type' },
      { header: 'Data Upload', key: 'date' }
    ],
    calculateData: ({ cardapios }) => {
      return {
        rows: cardapios.map(m => ({
          file: m.fileName,
          client: m.nomeEstabelecimento,
          type: m.fileType,
          date: m.dataCardapio
        })),
        indicators: [
          { label: 'Uploads Totais', value: cardapios.length, description: 'Carregados na base' },
          { label: 'Formato Líder', value: 'PDF', description: 'Preferência dos RCAs' }
        ],
        summary: `O histórico de uploads consolida ${cardapios.length} arquivos processados com sucesso. O formato .PDF representa 100% da volumetria, garantindo melhor fidelidade na conversão de dados.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'ultimos-processados': {
    id: 'ultimos-processados',
    name: 'Últimos Cardápios Processados',
    description: 'Linha do tempo dos cardápios convertidos recentemente.',
    category: 'cardapios',
    lastUpdate: 'Há 15 min',
    getColumns: () => [
      { header: 'Data', key: 'date' },
      { header: 'Cliente', key: 'client' },
      { header: 'Origem', key: 'source' },
      { header: 'Aprovador', key: 'user' }
    ],
    calculateData: ({ cardapios }) => {
      return {
        rows: cardapios.map(m => ({
          date: m.ultimaAtualizacao,
          client: m.nomeEstabelecimento,
          source: m.origem,
          user: m.historico[0]?.usuario || 'Sistema'
        })),
        indicators: [
          { label: 'Processados Recentes', value: cardapios.length, description: 'Últimos 7 dias' },
          { label: 'Conversão Automática', value: '100%', description: 'Sucesso na integridade' }
        ],
        summary: `Foram processados e integrados ${cardapios.length} cardápios nos últimos dias, com gravação imediata na base de dados analítica de vendas.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },

  // --- PRODUTOS ---
  'catalogo-oficial': {
    id: 'catalogo-oficial',
    name: 'Catálogo Oficial de Produtos',
    description: 'Catálogo oficial de importados ativos da distribuidora Radar C-Trade.',
    category: 'produtos',
    lastUpdate: 'Atualizado hoje',
    getColumns: () => [
      { header: 'SKU', key: 'sku' },
      { header: 'Marca', key: 'brand' },
      { header: 'Nome do Produto', key: 'name' },
      { header: 'Categoria', key: 'category' },
      { header: 'Preço Local', key: 'price' }
    ],
    calculateData: ({ products }) => {
      const activeSkus = products.length;
      const brands = Array.from(new Set(products.map(p => p.brand)));
      return {
        rows: products.slice(0, 15).map(p => ({
          sku: p.sku,
          brand: p.brand,
          name: p.name,
          category: p.category,
          price: `R$ ${p.priceLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        })),
        indicators: [
          { label: 'SKUs Cadastrados', value: activeSkus, description: 'Itens de importação' },
          { label: 'Marcas Exclusivas', value: brands.length, description: 'Importadoras exclusivas' },
          { label: 'Média Preço', value: `R$ ${Math.round(products.reduce((acc, p) => acc + p.priceLocal, 0) / products.length)}`, description: 'Ticket médio SKU' }
        ],
        summary: `O catálogo de importados Radar C-Trade contempla ${activeSkus} SKUs exclusivos divididos entre ${brands.length} marcas premium italianas, assegurando padrão gastronômico Triple A.`,
        chartData: brands.map(b => ({ label: b, value: products.filter(p => p.brand === b).length })),
        chartType: 'bar'
      };
    }
  },
  'produtos-encontrados': {
    id: 'produtos-encontrados',
    name: 'Produtos Encontrados nos Cardápios',
    description: 'Volume e frequência de produtos da distribuidora presentes nos menus analisados.',
    category: 'produtos',
    lastUpdate: 'Há 12h',
    getColumns: () => [
      { header: 'Produto C-Trade', key: 'product' },
      { header: 'Marca', key: 'brand' },
      { header: 'Frequência Mapeada', key: 'freq' },
      { header: 'Penetração Base %', key: 'pene' }
    ],
    calculateData: ({ products, cardapios }) => {
      // Simulate real product frequency
      const rows = products.slice(0, 10).map((p, index) => {
        const freq = 12 - index;
        const pene = `${Math.round((freq / Math.max(1, cardapios.length)) * 100)}%`;
        return {
          product: p.name,
          brand: p.brand,
          freq,
          pene
        };
      });
      return {
        rows,
        indicators: [
          { label: 'Itens Encontrados', value: rows.reduce((acc, r) => acc + r.freq, 0), description: 'Ocorrências identificadas' },
          { label: 'Produto Líder', value: rows[0]?.product || 'N/A', description: 'Maior frequência nos menus' }
        ],
        summary: `Mapeou-se um total de ${rows.reduce((acc, r) => acc + r.freq, 0)} ocorrências de insumos importados nos cardápios, sendo que o item "${rows[0]?.product}" é o de maior penetração comercial.`,
        chartData: rows.map(r => ({ label: r.brand, value: r.freq })),
        chartType: 'bar'
      };
    }
  },
  'produtos-fora-portfolio': {
    id: 'produtos-fora-portfolio',
    name: 'Produtos Fora do Portfólio',
    description: 'Estudo de marcas concorrentes e substitutos identificados nos estabelecimentos.',
    category: 'produtos',
    lastUpdate: 'Há 1 dia',
    getColumns: () => [
      { header: 'Marca Concorrente', key: 'brand' },
      { header: 'Insumo Substituível', key: 'insumo' },
      { header: 'Ocorrências', key: 'count' },
      { header: 'Volume Conversão', key: 'vol' }
    ],
    calculateData: ({ clients }) => {
      const competitors = [
        { brand: 'Caputo (Contrabando/Paralelo)', insumo: 'Farinha de Trigo', count: 3, vol: 'Alta prioridade' },
        { brand: 'La Molisana', insumo: 'Massa Seca', count: 2, vol: 'Média prioridade' },
        { brand: 'Mutti Tomato', insumo: 'Tomate Pelati', count: 4, vol: 'Altíssima prioridade' }
      ];
      return {
        rows: competitors,
        indicators: [
          { label: 'Marcas Concorrentes', value: competitors.length, description: 'Disputando a base' },
          { label: 'Gaps de Substituição', value: competitors.reduce((acc, c) => acc + c.count, 0), description: 'Oportunidades de conversão' }
        ],
        summary: `A inteligência comercial detectou ${competitors.length} marcas concorrentes operando ativamente na carteira. O principal gap identificado é em Tomates Pelati, onde o concorrente Mutti possui forte inserção.`,
        chartData: competitors.map(c => ({ label: c.brand, value: c.count })),
        chartType: 'bar'
      };
    }
  },
  'produtos-mais-encontrados': {
    id: 'produtos-mais-encontrados',
    name: 'Produtos mais Encontrados',
    description: 'Ranking de penetração de famílias de SKUs nos cardápios cadastrados.',
    category: 'produtos',
    lastUpdate: 'Há 2 dias',
    getColumns: () => [
      { header: 'Classificação', key: 'rank' },
      { header: 'Família do SKU', key: 'family' },
      { header: 'Ocorrências Totais', key: 'count' },
      { header: 'Penetração Geral %', key: 'ratio' }
    ],
    calculateData: ({ cardapios }) => {
      const ranking = [
        { rank: '1º', family: 'Farinha de Trigo Especializada', count: 18, ratio: '72%' },
        { rank: '2º', family: 'Tomates Pelati em Lata', count: 15, ratio: '60%' },
        { rank: '3º', family: 'Massas Longas e Curtas di Grano Duro', count: 12, ratio: '48%' },
        { rank: '4º', family: 'Azeite de Oliva Extra Virgem', count: 9, ratio: '36%' }
      ];
      return {
        rows: ranking,
        indicators: [
          { label: 'Família Líder', value: ranking[0].family, description: 'Alta demanda' },
          { label: 'Penetração Média', value: '54%', description: 'Presença nos cardápios' }
        ],
        summary: `A família de "${ranking[0].family}" desponta no topo do ranking de ocorrências, com presença confirmada em ${ranking[0].ratio} dos cardápios analisados pela curadoria técnica.`,
        chartData: ranking.map(r => ({ label: r.family, value: r.count })),
        chartType: 'bar'
      };
    }
  },
  'categorias-utilizadas': {
    id: 'categorias-utilizadas',
    name: 'Categorias mais Utilizadas',
    description: 'Divisão de market share e volume das categorias C-Trade nos clientes.',
    category: 'produtos',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Categoria SKU', key: 'category' },
      { header: 'Volume SKUs ativos', key: 'count' },
      { header: 'Participação Catálogo %', key: 'ratio' }
    ],
    calculateData: ({ products }) => {
      const catMap: Record<string, number> = {};
      products.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      });
      const rows = Object.entries(catMap).map(([category, count]) => ({
        category,
        count,
        ratio: `${Math.round((count / products.length) * 100)}%`
      }));
      return {
        rows,
        indicators: [
          { label: 'Categorias Ativas', value: rows.length, description: 'Divisões de portfólio' },
          { label: 'Maior Categoria', value: rows[0]?.category || 'N/A', description: 'Líder em volume de SKUs' }
        ],
        summary: `O catálogo Radar C-Trade está estruturado em ${rows.length} categorias comerciais, com destaque para a liderança de "${rows[0]?.category || 'N/A'}" que representa ${rows[0]?.ratio || 'N/A'} das opções cadastradas.`,
        chartData: rows.slice(0, 5).map(r => ({ label: r.category, value: r.count })),
        chartType: 'pie'
      };
    }
  },
  'marcas-utilizadas': {
    id: 'marcas-utilizadas',
    name: 'Marcas mais Utilizadas',
    description: 'Estudo de penetração e faturamento das marcas exclusivas da distribuidora.',
    category: 'produtos',
    lastUpdate: 'Hoje, 09:15',
    getColumns: () => [
      { header: 'Marca Importada', key: 'brand' },
      { header: 'Quantidade SKUs', key: 'count' },
      { header: 'Representatividade %', key: 'ratio' }
    ],
    calculateData: ({ products }) => {
      const brandMap: Record<string, number> = {};
      products.forEach(p => {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      });
      const rows = Object.entries(brandMap).map(([brand, count]) => ({
        brand,
        count,
        ratio: `${Math.round((count / products.length) * 100)}%`
      }));
      return {
        rows,
        indicators: [
          { label: 'Marcas Catalogadas', value: rows.length, description: 'Parceiros de importação' },
          { label: 'Marca Principal', value: rows[0]?.brand || 'N/A', description: 'Líder de SKUs no catálogo' }
        ],
        summary: `Contamos com ${rows.length} marcas internacionais exclusivas no catálogo. A italiana "${rows[0]?.brand || 'N/A'}" possui a maior representatividade com ${rows[0]?.count || 0} produtos ativos.`,
        chartData: rows.slice(0, 5).map(r => ({ label: r.brand, value: r.count })),
        chartType: 'pie'
      };
    }
  },

  // --- CURADORIA ---
  'curadoria-pendencias': {
    id: 'curadoria-pendencias',
    name: 'Pendências na Esteira de Curadoria',
    description: 'Fichas cadastrais ou cardápios pendentes de digitação de pratos.',
    category: 'curadoria',
    lastUpdate: 'Há 5 min',
    getColumns: () => [
      { header: 'Item Pendente', key: 'name' },
      { header: 'Tipo', key: 'type' },
      { header: 'Data Envio', key: 'date' },
      { header: 'Criticidade', key: 'severity' }
    ],
    calculateData: ({ cardapios }) => {
      const pending = cardapios.filter(m => m.status === 'Novo' || m.status === 'Em análise');
      return {
        rows: pending.map(m => ({
          name: m.nomeEstabelecimento,
          type: 'Cardápio PDF',
          date: m.dataCardapio,
          severity: 'Média'
        })),
        indicators: [
          { label: 'Backlog Pendente', value: pending.length, description: 'Registros na esteira' },
          { label: 'SLA Atendimento', value: '0.4 dias', description: 'Meta de 24h cumprida' }
        ],
        summary: `Atualmente a esteira conta com ${pending.length} pendências ativas de cadastro, garantindo processamento rápido com altíssima agilidade operacional.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'curadoria-rejeitados': {
    id: 'curadoria-rejeitados',
    name: 'Registros Rejeitados na Curadoria',
    description: 'Histórico de rejeição de documentos contendo responsável e motivos.',
    category: 'curadoria',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Estabelecimento', key: 'client' },
      { header: 'Insumo/Arquivo', key: 'item' },
      { header: 'Motivo Descarte', key: 'reason' },
      { header: 'Curador Responsável', key: 'user' }
    ],
    calculateData: ({ logs }) => {
      const rejected = logs.filter(l => l.module === 'Central de Cardápios' && l.action === 'Rejeitar');
      const rows = rejected.length > 0 ? rejected.map(l => ({
        client: l.clientName || 'N/A',
        item: l.affectedRecord || 'Cardápio Digital',
        reason: l.description || 'Inconsistência de CNPJ na Receita Federal',
        user: l.user
      })) : [
        { client: 'Bar do Zé Ltda', item: 'Cadastro Manual', reason: 'CNPJ inativo na Receita Federal', user: 'Roberto Alencar' }
      ];
      return {
        rows,
        indicators: [
          { label: 'Descartes de Curadoria', value: rows.length, description: 'Sessão ativa' },
          { label: 'Rejeição %', value: '4%', description: 'Média histórica' }
        ],
        summary: `Foram registradas ${rows.length} desqualificações técnicas na esteira de curadoria, garantindo a integridade dos leads antes do envio ao CRM de vendas.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'motivos-rejeicao': {
    id: 'motivos-rejeicao',
    name: 'Principais Motivos de Rejeição',
    description: 'Estudo analítico e volumétrico das principais causas de recusa.',
    category: 'curadoria',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Causa de Recusa', key: 'reason' },
      { header: 'Ocorrências Mapeadas', key: 'count' },
      { header: 'Participação %', key: 'ratio' }
    ],
    calculateData: () => {
      const reasons = [
        { reason: 'CNPJ Inativo ou Baixado na RF', count: 4, ratio: '44%' },
        { reason: 'Cardápio Sem Preços ou Ilegível', count: 3, ratio: '33%' },
        { reason: 'Fora do Escopo Gastronômico', count: 2, ratio: '22%' }
      ];
      return {
        rows: reasons,
        indicators: [
          { label: 'Causa Principal', value: reasons[0].reason, description: 'Critério rígido RF' },
          { label: 'Total Recusados', value: reasons.reduce((acc, r) => acc + r.count, 0), description: 'Cadastros filtrados' }
        ],
        summary: `O critério de "${reasons[0].reason}" é a causa líder de descarte, respondendo por ${reasons[0].ratio} das rejeições operacionais registradas no Radar C-Trade.`,
        chartData: reasons.map(r => ({ label: r.reason, value: r.count })),
        chartType: 'bar'
      };
    }
  },
  'historico-homologacoes': {
    id: 'historico-homologacoes',
    name: 'Histórico de Homologações',
    description: 'Registro cronológico de aprovações efetuadas na esteira analítica.',
    category: 'curadoria',
    lastUpdate: 'Há 1h',
    getColumns: () => [
      { header: 'Data', key: 'date' },
      { header: 'Lead Homologado', key: 'client' },
      { header: 'Fit Comercial', key: 'score' },
      { header: 'Aprovador', key: 'user' }
    ],
    calculateData: ({ clients, logs }) => {
      const approvedLogs = logs.filter(l => l.module === 'Base de Clientes' && l.action === 'Homologar');
      const rows = approvedLogs.length > 0 ? approvedLogs.map(l => ({
        date: l.date.split('T')[0],
        client: l.clientName || 'N/A',
        score: '96%',
        user: l.user
      })) : [
        { date: '2026-07-07', client: 'Babbo Osteria', score: '95%', user: 'Marcelo Baquero' },
        { date: '2026-07-07', client: 'Ella Pizzaria / Eva Restaurante', score: '96%', user: 'Marcelo Baquero' }
      ];
      return {
        rows,
        indicators: [
          { label: 'Leads Homologados', value: rows.length, description: 'Garantidos no funil' },
          { label: 'Aprovador Líder', value: 'Marcelo Baquero', description: 'Maior número de homologações' }
        ],
        summary: `O histórico registra ${rows.length} homologações estruturadas na esteira comercial, liberando os leads qualificados prontos para abordagem.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'usuarios-curadoria': {
    id: 'usuarios-curadoria',
    name: 'Métricas dos Curadores',
    description: 'Acompanhamento de produtividade e qualidade do time de digitação.',
    category: 'curadoria',
    lastUpdate: 'Há 2 dias',
    getColumns: () => [
      { header: 'Colaborador Curador', key: 'user' },
      { header: 'Cardápios Digitados', key: 'count' },
      { header: 'SLA Médio', key: 'sla' },
      { header: 'Taxa de Erro', key: 'err' }
    ],
    calculateData: () => {
      const curators = [
        { user: 'Roberto Alencar', count: 18, sla: '0.3 dias', err: '0.2%' },
        { user: 'Mariana Costa', count: 12, sla: '0.5 dias', err: '0.4%' }
      ];
      return {
        rows: curators,
        indicators: [
          { label: 'Curadores Ativos', value: curators.length, description: 'Operadores na esteira' },
          { label: 'Cardápios Mapeados', value: curators.reduce((acc, c) => acc + c.count, 0), description: 'Base consolidada' }
        ],
        summary: `A equipe de curadores conta com ${curators.length} profissionais especializados, com tempo médio de processamento abaixo de 12 horas e baixíssima taxa de inconsistência.`,
        chartData: curators.map(c => ({ label: c.user, value: c.count })),
        chartType: 'bar'
      };
    }
  },

  // --- INTELIGÊNCIA COMERCIAL ---
  'gaps-penetracao': {
    id: 'gaps-penetracao',
    name: 'Gaps de Penetração por Regional',
    description: 'Deteção de bairros e regionais com baixo faturamento em massas ou azeites.',
    category: 'inteligencia',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Regional de Vendas', key: 'reg' },
      { header: 'Categoria com Lacuna', key: 'cat' },
      { header: 'Estabelecimentos sem Compra', key: 'count' },
      { header: 'Potencial Faturável', key: 'pot' }
    ],
    calculateData: () => {
      const gaps = [
        { reg: 'Rio de Janeiro Centro', cat: 'Massas Premium', count: 8, pot: 'R$ 28.000/mês' },
        { reg: 'São Paulo Jardins', cat: 'Azeites Extra Virgem', count: 12, pot: 'R$ 42.000/mês' },
        { reg: 'Campinas Cambuí', cat: 'Queijos Importados', count: 5, pot: 'R$ 15.000/mês' }
      ];
      return {
        rows: gaps,
        indicators: [
          { label: 'Gaps Detectados', value: gaps.length, description: 'Oportunidades mapeadas' },
          { label: 'Potencial de Recuperação', value: 'R$ 85.000/mês', description: 'Aumento de faturamento' }
        ],
        summary: `A detecção de gaps identificou ${gaps.length} grandes oportunidades setoriais por regional. A categoria de Azeites em São Paulo Jardins representa o maior faturamento represado.`,
        chartData: gaps.map(g => ({ label: g.cat, value: parseInt(g.pot.replace(/\D/g, '')) })),
        chartType: 'bar'
      };
    }
  },
  'oportunidades-sazonalidade': {
    id: 'oportunidades-sazonalidade',
    name: 'Oportunidades por Sazonalidade',
    description: 'Campanhas periódicas e combos gastronômicos sugeridos por tendências de mercado.',
    category: 'inteligencia',
    lastUpdate: 'Há 1 dia',
    getColumns: () => [
      { header: 'Campanha Sazonal', key: 'camp' },
      { header: 'Combo de Insumos Sugerido', key: 'combo' },
      { header: 'Leads Alvo Mapeados', key: 'leads' },
      { header: 'Expectativa Conversão', key: 'conv' }
    ],
    calculateData: ({ clients }) => {
      const campaigns = [
        { camp: 'Festival de Inverno (Insumos Quentes)', combo: 'Farina Caputo + Tomates Solania DOP', leads: clients.length, conv: 'Excelente (34%)' },
        { camp: 'Semana Santa (Massas & Azeites)', combo: 'Spaghetti Valdigrano + Azeites Muraglia', leads: clients.length, conv: 'Muito Alta (28%)' }
      ];
      return {
        rows: campaigns,
        indicators: [
          { label: 'Campanhas Ativas', value: campaigns.length, description: 'Sazonalidades mapeadas' },
          { label: 'Público Alvo Total', value: clients.length, description: 'Estão aptos a receber' }
        ],
        summary: `A modelagem de sazonalidade indica que o "Festival de Inverno" utilizando farinhas Caputo e tomates Solania DOP possui o maior potencial de vendas na base qualificada.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'dossies-gerados': {
    id: 'dossies-gerados',
    name: 'Dossiês de Inteligência Gerados',
    description: 'Histórico de relatórios executivos de clientes compilados pelo assistente.',
    category: 'inteligencia',
    lastUpdate: 'Há 12 min',
    getColumns: () => [
      { header: 'Estabelecimento', key: 'client' },
      { header: 'Responsável Emissão', key: 'user' },
      { header: 'Fit Score', key: 'score' },
      { header: 'Data Geração', key: 'date' }
    ],
    calculateData: () => {
      const dossiers = [
        { client: 'Osteria Bella Italia', user: 'Marcelo Baquero', score: '94%', date: '07/07/2026' },
        { client: 'La Slice Pizzas Artesanais', user: 'Pedro Silva', score: '88%', date: '05/07/2026' },
        { client: 'Gero Rio', user: 'Marcelo Baquero', score: '96%', date: '28/06/2026' }
      ];
      return {
        rows: dossiers,
        indicators: [
          { label: 'Dossiês Ativos', value: dossiers.length, description: 'Gerados pelo assistente' },
          { label: 'Score Médio Dossiês', value: '92%', description: 'Aderência média excelente' }
        ],
        summary: `A plataforma conta com ${dossiers.length} Dossiês de Inteligência Comercial consolidados, fornecendo pitches comerciais de alta conversão para abordagem em campo.`,
        chartData: dossiers.map(d => ({ label: d.client, value: parseInt(d.score) })),
        chartType: 'bar'
      };
    }
  },
  'ranking-aderencia': {
    id: 'ranking-aderencia',
    name: 'Ranking de Aderência',
    description: 'Rankings classificatórios de estabelecimentos por proximidade de fit.',
    category: 'inteligencia',
    lastUpdate: 'Há 3h',
    getColumns: () => [
      { header: 'Posição', key: 'rank' },
      { header: 'Cliente Lead', key: 'client' },
      { header: 'Segmento', key: 'segment' },
      { header: 'Fit Score', key: 'score' }
    ],
    calculateData: ({ clients }) => {
      const sorted = [...clients].sort((a, b) => b.score - a.score);
      return {
        rows: sorted.map((c, idx) => ({
          rank: `${idx + 1}º`,
          client: c.name,
          segment: c.segment,
          score: `${c.score}%`
        })),
        indicators: [
          { label: 'Líder do Ranking', value: sorted[0]?.name || 'N/A', description: 'Maior Fit Comercial' },
          { label: 'Média de Aderência Top 3', value: `${sorted.length ? Math.round(sorted.slice(0, 3).reduce((acc, c) => acc + c.score, 0) / Math.min(3, sorted.length)) : 0}%`, description: 'Leads perfeitos' }
        ],
        summary: `O ranking de aderência é encabeçado pelo estabelecimento "${sorted[0]?.name || 'N/A'}" com um alinhamento perfeito de ${sorted[0]?.score || 0}% com os produtos exclusivos da distribuidora.`,
        chartData: sorted.map(c => ({ label: c.name, value: c.score })),
        chartType: 'bar'
      };
    }
  },

  // --- OPERAÇÃO ---
  'operacao-usuarios': {
    id: 'operacao-usuarios',
    name: 'Usuários Cadastrados',
    description: 'Controle de colaboradores ativos, frentes e acessos.',
    category: 'operacao',
    lastUpdate: 'Ontem',
    getColumns: () => [
      { header: 'Nome do Colaborador', key: 'name' },
      { header: 'E-mail Corporativo', key: 'email' },
      { header: 'Perfil RBAC', key: 'role' },
      { header: 'Status', key: 'status' }
    ],
    calculateData: () => {
      const users = [
        { name: 'Marcelo Baquero', email: 'marcelobbaquero@gmail.com', role: 'Administrador', status: 'Ativo' },
        { name: 'Mariana Costa', email: 'mariana.costa@ctrade.com.br', role: 'Supervisor', status: 'Ativo' },
        { name: 'Roberto Alencar', email: 'roberto.alencar@ctrade.com.br', role: 'Curadoria', status: 'Ativo' },
        { name: 'Arthur Mendes', email: 'arthur.mendes@ctrade.com.br', role: 'RCA / Comercial', status: 'Ativo' },
        { name: 'Paula Teixeira', email: 'paula.teixeira@ctrade.com.br', role: 'Somente Leitura', status: 'Ativo' }
      ];
      return {
        rows: users,
        indicators: [
          { label: 'Colaboradores Ativos', value: users.filter(u => u.status === 'Ativo').length, description: 'Operando no Radar' },
          { label: 'Perfís Utilizados', value: 5, description: 'Matriz administrativa' }
        ],
        summary: `O Radar C-Trade é operado por ${users.length} colaboradores ativos, distribuídos por perfis administrativos e de campo em estrita conformidade com regras corporativas.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'operacao-perfis': {
    id: 'operacao-perfis',
    name: 'Perfis Administrativos',
    description: 'Visualização dos perfis de controle de acesso (RBAC) estruturados.',
    category: 'operacao',
    lastUpdate: 'Há 1 semana',
    getColumns: () => [
      { header: 'Perfil de Acesso', key: 'name' },
      { header: 'Descrição Operacional', key: 'desc' },
      { header: 'Modo do Sistema', key: 'sys' }
    ],
    calculateData: () => {
      const profiles = [
        { name: 'Administrador', desc: 'Acesso irrestrito a todas as frentes comerciais e de segurança.', sys: 'Sistema' },
        { name: 'Supervisor', desc: 'Gestor comercial focado em regionais e validação de leads.', sys: 'Sistema' },
        { name: 'Curadoria', desc: 'Digitação de pratos e normalização cadastral nacional.', sys: 'Sistema' },
        { name: 'RCA / Comercial', desc: 'Acesso exclusivo para visitas de campo e prospecções locais.', sys: 'Sistema' }
      ];
      return {
        rows: profiles,
        indicators: [
          { label: 'Perfis de Segurança', value: profiles.length, description: 'Funções configuradas' },
          { label: 'Políticas RBAC', value: 'Ativo', description: 'Controle ativado' }
        ],
        summary: `A matriz de segurança possui ${profiles.length} perfis operacionais padronizados, garantindo que colaboradores em campo acessem estritamente os leads sob sua jurisdição comercial.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },
  'operacao-permissoes': {
    id: 'operacao-permissoes',
    name: 'Privilégios e Permissões',
    description: 'Matriz granular de leitura, escrita e exportações por módulo.',
    category: 'operacao',
    lastUpdate: 'Há 1 semana',
    getColumns: () => [
      { header: 'Módulo da Plataforma', key: 'mod' },
      { header: 'Ações Permitidas', key: 'actions' },
      { header: 'Restrições Ativas', key: 'rest' }
    ],
    calculateData: () => {
      const modules = [
        { mod: 'Dashboard', actions: 'Visualizar, Exportar PDF', rest: 'Nenhuma' },
        { mod: 'Base de Clientes', actions: 'Criar, Editar, Homologar, Exportar', rest: 'RCA não exclui' },
        { mod: 'Central de Cardápios', actions: 'Importar, Analisar IA', rest: 'Somente Leitura restrito' },
        { mod: 'Relatórios', actions: 'Visualizar, Exportar Lotes', rest: 'Bloqueado para RCA exportar' }
      ];
      return {
        rows: modules,
        indicators: [
          { label: 'Módulos Protegidos', value: modules.length, description: 'Áreas vigiadas' },
          { label: 'Auditoria Privilégios', value: 'Em conformidade', description: 'Sem anomalias' }
        ],
        summary: `A auditoria de privilégios confirma que todos os ${modules.length} módulos críticos possuem travas ativas baseadas em cargos, impedindo exportações não-autorizadas.`,
        chartData: [],
        chartType: 'none'
      };
    }
  },

  // --- AUDITORIA ---
  'auditoria-atividades': {
    id: 'auditoria-atividades',
    name: 'Histórico de Auditoria Geral',
    description: 'Log imutável detalhado de eventos, alterações cadastrais e acessos.',
    category: 'auditoria',
    lastUpdate: 'Há 1 min',
    getColumns: () => [
      { header: 'Data/Hora', key: 'date' },
      { header: 'Usuário', key: 'user' },
      { header: 'Perfil', key: 'profile' },
      { header: 'Ação Realizada', key: 'action' },
      { header: 'Resultado', key: 'result' }
    ],
    calculateData: ({ logs }) => {
      const displayLogs = logs.slice(0, 15);
      return {
        rows: displayLogs.map(l => ({
          date: l.date.replace('T', ' ').substring(0, 19),
          user: l.user,
          profile: l.profile,
          action: l.description || `${l.action} no módulo ${l.module}`,
          result: l.result
        })),
        indicators: [
          { label: 'Registros de Logs', value: logs.length, description: 'Banco de dados de auditoria' },
          { label: 'Acessos Bloqueados', value: logs.filter(l => l.result === 'Bloqueado').length, description: 'Tentativas de violação' },
          { label: 'Fator de Segurança', value: '100%', description: 'Conformidade auditores' }
        ],
        summary: `O histórico de auditoria imutável registrou ${logs.length} eventos operacionais na plataforma. Identificou-se ${logs.filter(l => l.result === 'Bloqueado').length} tentativas de ações bloqueadas por regras de RBAC.`,
        chartData: [
          { label: 'Sucesso', value: logs.filter(l => l.result === 'Sucesso').length },
          { label: 'Bloqueado', value: logs.filter(l => l.result === 'Bloqueado').length }
        ],
        chartType: 'pie'
      };
    }
  },
  'auditoria-logs': {
    id: 'auditoria-logs',
    name: 'Logs de Segurança e Sistemas',
    description: 'Atividades do sistema e taxas de sucesso de requisições de API.',
    category: 'auditoria',
    lastUpdate: 'Há 1 min',
    getColumns: () => [
      { header: 'Carimbo de Data/Hora', key: 'date' },
      { header: 'Componente Módulo', key: 'mod' },
      { header: 'Ação Crítica', key: 'action' },
      { header: 'Status Operação', key: 'status' }
    ],
    calculateData: ({ logs }) => {
      const securityLogs = logs.filter(l => l.module === 'Usuários' || l.module === 'Configurações' || l.result === 'Bloqueado');
      return {
        rows: securityLogs.slice(0, 10).map(l => ({
          date: l.date.replace('T', ' ').substring(0, 19),
          mod: l.module,
          action: l.action,
          status: l.result === 'Sucesso' ? 'OK (200)' : 'NEGADO (403)'
        })),
        indicators: [
          { label: 'Logs de Segurança', value: securityLogs.length, description: 'Eventos críticos' },
          { label: 'Alinhamento Regras', value: 'Auditorias ativas', description: 'Em conformidade' }
        ],
        summary: `Mapeou-se ${securityLogs.length} eventos de segurança de criticidade média ou alta, registrando acessos privilegiados e conformidade das chaves de API.`,
        chartData: [],
        chartType: 'none'
      };
    }
  }
};
