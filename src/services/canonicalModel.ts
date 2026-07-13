/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- CANONICAL DATA MODEL ENTITIES ---

export interface CanonicalConta {
  id: string; // Internal unique ID
  id_radar: string | null;
  id_erp: string | null;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: string;
  cidade: string;
  estado: string;
  segmento: string;
  origem: string;
  status: 'Prospect Radar' | 'Cliente Convertido' | 'Cliente Base' | 'Lead Qualificado' | 'Inativo';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalContato {
  id: string;
  contaId: string; // Referential ID
  nome: string;
  cargo: 'Chef' | 'Comprador' | 'Sócio' | 'Gerente' | 'Proprietário' | 'Outro';
  telefone: string;
  email: string;
  linkedin: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalCardapio {
  id: string;
  contaId: string; // Referential ID
  origem: 'PDF' | 'Imagem' | 'Website' | 'Instagram' | 'iFood' | 'Rappi';
  data: string;
  formato: string; // PDF, PNG, JSON, HTML
  idioma: string; // PT-BR, etc.
  hash: string; // MD5/SHA256 for data duplication prevent
  versao: string; // e.g., "1.0", "2.0"
  version: number; // Internal record version
  created_at: string;
  updated_at: string;
}

export interface CanonicalItemCardapio {
  id: string;
  cardapioId: string; // Referential ID
  descricao_original: string;
  categoria_detectada: string;
  marca_detectada: string;
  produto_detectado: string;
  quantidade: number;
  unidade: string;
  confianca: number; // 0.0 to 1.0 (confidence score)
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalProduto {
  sku: string; // Official SKU (Unique key)
  categoria: string; // Reference to official categories
  marca: string; // Reference to official brands
  nome: string;
  unidade: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalCategoria {
  id: string; // Standardized ID
  nome: string;
  descricao: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalMarca {
  id: string; // Standardized ID
  nome: string;
  descricao: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalOportunidade {
  id: string;
  contaId: string; // Referential ID
  produtoSku: string; // Referential SKU
  categoriaId: string; // Referential Categoria
  status: 'Pendente' | 'Identificada' | 'Em Negociação' | 'Ganho' | 'Perdido';
  valorEstimado: number;
  dataFechamento: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CanonicalLote {
  id: string;
  origem: string;
  data: string;
  quantidade: number;
  versao: string; // Pipeline engine version
  status: 'Aguardando Curadoria' | 'Processado' | 'Rejeitado' | 'Erro Estrutural';
  version: number;
  created_at: string;
  updated_at: string;
}

// --- VERSIONING & HISTORIC COMPARISON UTILS ---

export interface EntityDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export class CanonicalVersioningManager {
  /**
   * Compares two versions of the same entity to produce an audit diff log.
   */
  static compareVersions<T extends Record<string, any>>(v1: T, v2: T): EntityDiff[] {
    const diffs: EntityDiff[] = [];
    const allKeys = Array.from(new Set([...Object.keys(v1), ...Object.keys(v2)]));

    for (const key of allKeys) {
      if (key === 'updated_at' || key === 'version') continue;
      if (JSON.stringify(v1[key]) !== JSON.stringify(v2[key])) {
        diffs.push({
          field: key,
          oldValue: v1[key],
          newValue: v2[key]
        });
      }
    }
    return diffs;
  }

  /**
   * Creates a new version increment of an entity, keeping historic tracing.
   */
  static incrementVersion<T extends { version: number; updated_at: string }>(entity: T): T {
    return {
      ...entity,
      version: entity.version + 1,
      updated_at: new Date().toISOString()
    };
  }
}

// --- CANONICAL DATA CONTRACT INTEGRITY CONVERTER ---

export class CanonicalModelConverter {
  /**
   * Translates incoming Google Maps/Instagram/Web raw metadata into a Canonical Account (Conta).
   * Enforces perfect schema alignment with zero leaks of uncanonical fields.
   */
  static toCanonicalConta(raw: any, origin: string): CanonicalConta {
    const id = raw.id || `ACC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString();

    // Map any possible field names to the canonical structure
    const nome_fantasia = (raw.fantasyName || raw.nome_fantasia || raw.name || raw.title || 'Sem Nome Fantasia').trim();
    const razao_social = (raw.socialName || raw.razao_social || raw.corporate_name || nome_fantasia).trim();
    const cnpj = String(raw.cnpj || '').replace(/\D/g, '');

    // Resolve address elements
    const endereco = raw.endereco || raw.address || raw.formatted_address || 'Endereço não informado';
    const cidade = raw.city || raw.cidade || 'Rio de Janeiro';
    const estado = (raw.state || raw.estado || 'RJ').toUpperCase();

    // Map Life Cycle Status
    let canonicalStatus: CanonicalConta['status'] = 'Prospect Radar';
    if (raw.status === 'Cliente Convertido' || raw.id_erp || raw.idErp) {
      canonicalStatus = 'Cliente Convertido';
    } else if (raw.status === 'Cliente Base') {
      canonicalStatus = 'Cliente Base';
    }

    return {
      id,
      id_radar: raw.id_radar || raw.idRadar || null,
      id_erp: raw.id_erp || raw.idErp || null,
      cnpj,
      razao_social,
      nome_fantasia,
      endereco,
      cidade,
      estado,
      segmento: raw.segment || raw.segmento || 'Restaurante',
      origem: origin,
      status: canonicalStatus,
      version: raw.version || 1,
      created_at: raw.created_at || raw.createdAt || nowStr,
      updated_at: nowStr
    };
  }

  /**
   * Converts contacts to the official Canonical Contato entity.
   */
  static toCanonicalContato(raw: any, contaId: string): CanonicalContato {
    const nowStr = new Date().toISOString();
    let canonicalCargo: CanonicalContato['cargo'] = 'Outro';
    const cargoLower = String(raw.cargo || raw.role || '').toLowerCase();

    if (cargoLower.includes('chef') || cargoLower.includes('cozinha')) {
      canonicalCargo = 'Chef';
    } else if (cargoLower.includes('comprador') || cargoLower.includes('compras') || cargoLower.includes('suprimentos')) {
      canonicalCargo = 'Comprador';
    } else if (cargoLower.includes('gerente') || cargoLower.includes('gerencia')) {
      canonicalCargo = 'Gerente';
    } else if (cargoLower.includes('socio') || cargoLower.includes('sócio') || cargoLower.includes('partner')) {
      canonicalCargo = 'Sócio';
    } else if (cargoLower.includes('proprietario') || cargoLower.includes('dono') || cargoLower.includes('proprietário')) {
      canonicalCargo = 'Proprietário';
    }

    return {
      id: raw.id || `CNT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      contaId,
      nome: raw.nome || raw.name || 'Contato Sem Nome',
      cargo: canonicalCargo,
      telefone: raw.telefone || raw.phone || '',
      email: raw.email || '',
      linkedin: raw.linkedin || '',
      version: raw.version || 1,
      created_at: raw.created_at || nowStr,
      updated_at: nowStr
    };
  }

  /**
   * Converts raw documents to standard Canonical Cardapio.
   */
  static toCanonicalCardapio(raw: any, contaId: string): CanonicalCardapio {
    const nowStr = new Date().toISOString();
    return {
      id: raw.id || `MNU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      contaId,
      origem: raw.origem || 'PDF',
      data: raw.data || new Date().toLocaleDateString('pt-BR'),
      formato: raw.formato || 'PDF',
      idioma: raw.idioma || 'PT-BR',
      hash: raw.hash || `MD5-${Math.random().toString(36).substring(7)}`,
      versao: raw.versao || '1.0',
      version: raw.version || 1,
      created_at: raw.created_at || nowStr,
      updated_at: nowStr
    };
  }

  /**
   * Converts item parsing output to Canonical Item de Cardápio.
   */
  static toCanonicalItemCardapio(raw: any, cardapioId: string): CanonicalItemCardapio {
    const nowStr = new Date().toISOString();
    return {
      id: raw.id || `ITM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      cardapioId,
      descricao_original: raw.descricao_original || raw.originalDescription || 'Item de Cardápio',
      categoria_detectada: raw.categoria_detectada || raw.detectedCategory || 'Não Categorizado',
      marca_detectada: raw.marca_detectada || raw.detectedBrand || 'Não Identificada',
      produto_detectado: raw.produto_detectado || raw.detectedProduct || 'Não Pareado',
      quantidade: parseFloat(raw.quantidade || raw.quantity || '1'),
      unidade: raw.unidade || raw.unit || 'UN',
      confianca: parseFloat(raw.confianca || raw.confidence || '1.0'),
      version: raw.version || 1,
      created_at: raw.created_at || nowStr,
      updated_at: nowStr
    };
  }
}

// --- REFERENTIAL INTEGRITY VERIFIER ---

export class CanonicalIntegrityVerifier {
  /**
   * Checks for referential integrity across lists of canonical entities.
   * Ensures that child elements do not exist without their respective parent elements.
   */
  static verifyIntegrity(data: {
    contas: CanonicalConta[];
    contatos: CanonicalContato[];
    cardapios: CanonicalCardapio[];
    itensCardapio: CanonicalItemCardapio[];
    oportunidades: CanonicalOportunidade[];
    produtos: CanonicalProduto[];
  }): {
    success: boolean;
    brokenReferences: { entity: string; id: string; parentEntity: string; missingId: string }[];
  } {
    const brokenReferences: { entity: string; id: string; parentEntity: string; missingId: string }[] = [];
    const contaIds = new Set(data.contas.map(c => c.id));
    const cardapioIds = new Set(data.cardapios.map(m => m.id));
    const productSkus = new Set(data.produtos.map(p => p.sku));

    // Verify Contatos -> Conta
    for (const contact of data.contatos) {
      if (!contaIds.has(contact.contaId)) {
        brokenReferences.push({
          entity: 'Contato',
          id: contact.id,
          parentEntity: 'Conta',
          missingId: contact.contaId
        });
      }
    }

    // Verify Cardapios -> Conta
    for (const menu of data.cardapios) {
      if (!contaIds.has(menu.contaId)) {
        brokenReferences.push({
          entity: 'Cardapio',
          id: menu.id,
          parentEntity: 'Conta',
          missingId: menu.contaId
        });
      }
    }

    // Verify ItensCardapio -> Cardapio
    for (const item of data.itensCardapio) {
      if (!cardapioIds.has(item.cardapioId)) {
        brokenReferences.push({
          entity: 'ItemCardapio',
          id: item.id,
          parentEntity: 'Cardapio',
          missingId: item.cardapioId
        });
      }
    }

    // Verify Oportunidades -> Conta, Produto
    for (const opp of data.oportunidades) {
      if (!contaIds.has(opp.contaId)) {
        brokenReferences.push({
          entity: 'Oportunidade',
          id: opp.id,
          parentEntity: 'Conta',
          missingId: opp.contaId
        });
      }
      if (!productSkus.has(opp.produtoSku)) {
        brokenReferences.push({
          entity: 'Oportunidade',
          id: opp.id,
          parentEntity: 'Produto',
          missingId: opp.produtoSku
        });
      }
    }

    return {
      success: brokenReferences.length === 0,
      brokenReferences
    };
  }
}
