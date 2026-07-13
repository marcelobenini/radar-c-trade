/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SchemaMetadata {
  name: 'raw' | 'staging' | 'config' | 'audit' | 'radar' | 'integration';
  label: string;
  description: string;
  owner: 'Claude' | 'Radar/Admin' | 'Compartilhado' | 'Radar' | 'Connectors';
  writableBy: 'Claude' | 'Radar' | 'Ambos' | 'Connectors';
  readableBy: 'Claude' | 'Claude + Radar' | 'Ambos' | 'Radar + Integrações' | 'Sistemas externos';
  tables: TableMetadata[];
}

export interface TableMetadata {
  name: string;
  description: string;
  columns: { name: string; type: string; nullable: boolean; isPrimaryKey?: boolean; isForeignKey?: boolean; notes?: string }[];
  sqlDdl: string;
}

export interface DatabaseLog {
  id: string;
  timestamp: string;
  schema: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'SELECT' | 'AUDIT';
  performedBy: 'Claude' | 'Radar' | 'System';
  payload: string;
}

export const OFFICIAL_SCHEMAS: SchemaMetadata[] = [
  {
    name: 'raw',
    label: 'Schema RAW (Ingestão Bruta)',
    description: 'Armazena os dados originais exatamente como coletados (Google Maps, Instagram, sites, PDFs, OCR), sem nenhuma alteração ou normalização, servindo como histórico imutável.',
    owner: 'Claude',
    writableBy: 'Claude',
    readableBy: 'Claude',
    tables: [
      {
        name: 'raw_collectors_payload',
        description: 'Dados brutos recebidos dos coletores e raspadores de canais públicos.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'source', type: 'varchar(50)', nullable: false, notes: 'Ex: "Google Maps", "Instagram", "iFood"' },
          { name: 'raw_data', type: 'jsonb', nullable: false, notes: 'JSON estruturado original' },
          { name: 'collector_version', type: 'varchar(15)', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE raw.raw_collectors_payload (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL,
    raw_data JSONB NOT NULL,
    collector_version VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      },
      {
        name: 'raw_ocr_documents',
        description: 'Imagens e PDFs originais submetidos para processamento óptico (OCR) antes de qualquer parsing.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'file_name', type: 'varchar(255)', nullable: false },
          { name: 'file_hash', type: 'varchar(64)', nullable: false, notes: 'MD5/SHA256 para prevenir reprocessamento duplo' },
          { name: 'binary_url', type: 'text', nullable: false, notes: 'Link seguro do Supabase Storage' },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE raw.raw_ocr_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE,
    binary_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      }
    ]
  },
  {
    name: 'staging',
    label: 'Schema STAGING (Processados e Pré-Avaliados)',
    description: 'Dados limpos, normalizados e enriquecidos, prontos para a curadoria humana no Radar Comercial. São registros transitórios, não consolidados.',
    owner: 'Claude',
    writableBy: 'Claude',
    readableBy: 'Claude + Radar',
    tables: [
      {
        name: 'stg_contas',
        description: 'Estabelecimentos normalizados pelo pipeline aguardando homologação.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'raw_id', type: 'uuid', nullable: true, isForeignKey: true, notes: 'Ref: raw.raw_collectors_payload.id' },
          { name: 'cnpj', type: 'varchar(14)', nullable: true },
          { name: 'razao_social', type: 'varchar(255)', nullable: true },
          { name: 'nome_fantasia', type: 'varchar(255)', nullable: false },
          { name: 'endereco_completo', type: 'text', nullable: true },
          { name: 'status_prospeccao', type: 'varchar(50)', nullable: false },
          { name: 'pipeline_version', type: 'varchar(20)', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE staging.stg_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_id UUID REFERENCES raw.raw_collectors_payload(id) ON DELETE SET NULL,
    cnpj VARCHAR(14),
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255) NOT NULL,
    endereco_completo TEXT,
    status_prospeccao VARCHAR(50) DEFAULT 'Prospect Radar',
    pipeline_version VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      },
      {
        name: 'stg_cardapio_itens',
        description: 'Linhas extraídas dos cardápios passadas pelas regras de taxonomia do catalogador.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'conta_id', type: 'uuid', nullable: false, isForeignKey: true, notes: 'Ref: staging.stg_contas.id' },
          { name: 'descricao_original', type: 'text', nullable: false },
          { name: 'categoria_detectada', type: 'varchar(100)', nullable: true },
          { name: 'marca_detectada', type: 'varchar(100)', nullable: true },
          { name: 'produto_detectado', type: 'varchar(200)', nullable: true },
          { name: 'quantidade', type: 'numeric(10,2)', nullable: true },
          { name: 'unidade', type: 'varchar(10)', nullable: true },
          { name: 'confidence_score', type: 'numeric(3,2)', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE staging.stg_cardapio_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_id UUID REFERENCES staging.stg_contas(id) ON DELETE CASCADE,
    descricao_original TEXT NOT NULL,
    categoria_detectada VARCHAR(100),
    marca_detectada VARCHAR(100),
    produto_detectado VARCHAR(200),
    quantidade NUMERIC(10,2) DEFAULT 1.00,
    unidade VARCHAR(10) DEFAULT 'UN',
    confidence_score NUMERIC(3,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      }
    ]
  },
  {
    name: 'config',
    label: 'Schema CONFIG (Parâmetros e Catálogos Mestres)',
    description: 'Catálogo global e unificado de dados imutáveis compartilhados por toda a plataforma. Garante que Claude e Radar usem exatamente o mesmo dicionário de SKUs e marcas.',
    owner: 'Radar/Admin',
    writableBy: 'Radar',
    readableBy: 'Ambos',
    tables: [
      {
        name: 'cfg_produtos_sku',
        description: 'Tabela mestre de SKUs oficiais permitidos no ecossistema.',
        columns: [
          { name: 'sku', type: 'varchar(100)', nullable: false, isPrimaryKey: true },
          { name: 'nome_produto', type: 'varchar(255)', nullable: false },
          { name: 'categoria_id', type: 'varchar(100)', nullable: false },
          { name: 'marca_id', type: 'varchar(100)', nullable: false },
          { name: 'unidade_padrao', type: 'varchar(10)', nullable: false }
        ],
        sqlDdl: `CREATE TABLE config.cfg_produtos_sku (
    sku VARCHAR(100) PRIMARY KEY,
    nome_produto VARCHAR(255) NOT NULL,
    categoria_id VARCHAR(100) NOT NULL,
    marca_id VARCHAR(100) NOT NULL,
    unidade_padrao VARCHAR(10) NOT NULL
);`
      },
      {
        name: 'cfg_regras_processamento',
        description: 'Regras de negócio e validação ativas consumidas pelo motor do pipeline.',
        columns: [
          { name: 'id', type: 'varchar(50)', nullable: false, isPrimaryKey: true },
          { name: 'modulo', type: 'varchar(50)', nullable: false },
          { name: 'descricao', type: 'text', nullable: false },
          { name: 'expressao_regra', type: 'text', nullable: false },
          { name: 'ativa', type: 'boolean', nullable: false }
        ],
        sqlDdl: `CREATE TABLE config.cfg_regras_processamento (
    id VARCHAR(50) PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    expressao_regra TEXT NOT NULL,
    ativa BOOLEAN DEFAULT TRUE
);`
      }
    ]
  },
  {
    name: 'audit',
    label: 'Schema AUDIT (Trilhas de Auditoria e Logs)',
    description: 'Registro cronológico inviolável de todas as ações importantes do sistema, essencial para conformidade regulatória e investigações de integridade.',
    owner: 'Compartilhado',
    writableBy: 'Ambos',
    readableBy: 'Ambos',
    tables: [
      {
        name: 'aud_pipeline_executions',
        description: 'Logs detalhados de execuções do pipeline do Claude, tempos de execução e contadores de erros.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'execution_id', type: 'varchar(100)', nullable: false },
          { name: 'elapsed_time_ms', type: 'integer', nullable: false },
          { name: 'records_processed', type: 'integer', nullable: false },
          { name: 'errors_count', type: 'integer', nullable: false },
          { name: 'warnings_count', type: 'integer', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE audit.aud_pipeline_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id VARCHAR(100) NOT NULL,
    elapsed_time_ms INTEGER NOT NULL,
    records_processed INTEGER NOT NULL,
    errors_count INTEGER DEFAULT 0,
    warnings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      },
      {
        name: 'aud_curator_actions',
        description: 'Histórico de homologação manual e alterações executadas pelo curador humano do Radar.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'user_email', type: 'varchar(150)', nullable: false },
          { name: 'target_table', type: 'varchar(100)', nullable: false },
          { name: 'record_id', type: 'uuid', nullable: false },
          { name: 'action_type', type: 'varchar(50)', nullable: false, notes: 'Ex: "APPROVE_CONTA", "EDIT_SKU"' },
          { name: 'change_log', type: 'jsonb', nullable: false, notes: 'Diff com valores anteriores e novos' },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE audit.aud_curator_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(150) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    change_log JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      }
    ]
  },
  {
    name: 'radar',
    label: 'Schema RADAR (Base Consolidada e Oficial)',
    description: 'A base oficial imutável de inteligência comercial do ecossistema C-Trade. Só recebe dados aprovados e homologados pela curadoria humana. É a única fonte para relatórios, BI e CRM.',
    owner: 'Radar',
    writableBy: 'Radar',
    readableBy: 'Radar + Integrações',
    tables: [
      {
        name: 'tb_contas_oficial',
        description: 'Ponto comercial homologado contendo dados higienizados de CNPJ e contatos.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'cnpj', type: 'varchar(14)', nullable: false },
          { name: 'razao_social', type: 'varchar(255)', nullable: false },
          { name: 'nome_fantasia', type: 'varchar(255)', nullable: false },
          { name: 'endereco_completo', type: 'text', nullable: false },
          { name: 'segmento_oficial', type: 'varchar(100)', nullable: false },
          { name: 'data_homologacao', type: 'timestamp', nullable: false },
          { name: 'user_homologador', type: 'varchar(150)', nullable: false }
        ],
        sqlDdl: `CREATE TABLE radar.tb_contas_oficial (
    id UUID PRIMARY KEY,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    endereco_completo TEXT NOT NULL,
    segmento_oficial VARCHAR(100) NOT NULL,
    data_homologacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_homologador VARCHAR(150) NOT NULL
);`
      },
      {
        name: 'tb_oportunidades_oficial',
        description: 'Oportunidades de vendas oficiais qualificadas com cruzamento de SKUs ausentes mapeados.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'conta_id', type: 'uuid', nullable: false, isForeignKey: true, notes: 'Ref: radar.tb_contas_oficial.id' },
          { name: 'sku_ausente', type: 'varchar(100)', nullable: false, notes: 'Ref: config.cfg_produtos_sku.sku' },
          { name: 'status_oportunidade', type: 'varchar(50)', nullable: false, notes: 'Ex: "Identificada", "Em Negociação"' },
          { name: 'valor_estimado', type: 'numeric(12,2)', nullable: false },
          { name: 'data_criacao', type: 'timestamp', nullable: false }
        ],
        sqlDdl: `CREATE TABLE radar.tb_oportunidades_oficial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_id UUID REFERENCES radar.tb_contas_oficial(id) ON DELETE CASCADE,
    sku_ausente VARCHAR(100) NOT NULL,
    status_oportunidade VARCHAR(50) DEFAULT 'Identificada',
    valor_estimado NUMERIC(12,2) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
      }
    ]
  },
  {
    name: 'integration',
    label: 'Schema INTEGRATION (Exportadores e Conectores Externos)',
    description: 'Camada de saídas e feeds assíncronos formatados para consumo por ferramentas externas (RD Station, Salesforce, Hubspot, Webhooks de terceiros).',
    owner: 'Connectors',
    writableBy: 'Connectors',
    readableBy: 'Sistemas externos',
    tables: [
      {
        name: 'int_crm_exports',
        description: 'Fila de oportunidades aprovadas prontas para exportação em lote para o CRM de vendas.',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
          { name: 'oportunidade_id', type: 'uuid', nullable: false, notes: 'Ref: radar.tb_oportunidades_oficial.id' },
          { name: 'crm_destino', type: 'varchar(50)', nullable: false, notes: 'Ex: "RD Station", "Hubspot"' },
          { name: 'status_sync', type: 'varchar(30)', nullable: false, notes: 'Ex: "Pendente", "Sucesso", "Erro"' },
          { name: 'last_attempt_at', type: 'timestamp', nullable: true },
          { name: 'error_message', type: 'text', nullable: true }
        ],
        sqlDdl: `CREATE TABLE integration.int_crm_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidade_id UUID NOT NULL,
    crm_destino VARCHAR(50) NOT NULL,
    status_sync VARCHAR(30) DEFAULT 'Pendente',
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);`
      }
    ]
  }
];
