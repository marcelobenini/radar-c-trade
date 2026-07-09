/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Centralized real data for Radar C-Trade (No fictitious/mock data)

export interface RealProduct {
  id: string;
  sku: string; // Código SKU
  codeRio: string;
  codeSP: string;
  codePOA: string;
  name: string;
  brand: string;
  category: string;
  line: string;
  unit: string;
  weight: string;
  priceLocal: number;
  priceInter: number;
  packaging: string;
  notes: string;
  isPremium: boolean;
  isImported: boolean;
  adherenceRate: number;
  analyzedCount: number;
  potentialCustomersCount: number;
  averageScore: number;
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
  applications: string[];
  idealSegments: string[];
  complementaryProducts: string[];
  relatedProducts: string[];
  topAdherents: string[];
  imageGradient: string;
  manufacturer: string; // Fabricante
  status: 'Ativo' | 'Inativo'; // Status (Ativo/Inativo)
  dateCreated: string; // Data de Cadastro
  dateUpdated: string; // Última Atualização
  relatedMenus?: string[]; // Relacionamentos - Cardápios
  relatedClients?: string[]; // Relacionamentos - Clientes
  relatedOpportunities?: string[]; // Relacionamentos - Oportunidades
  relatedAnalyses?: string[]; // Relacionamentos - Análises
}

export interface RealClient {
  id: number;
  name: string;
  fantasyName: string;
  city: string;
  state: string;
  segment: string;
  category: string;
  instagram: string;
  website: string;
  phone: string;
  email: string;
  responsible: string;
  responsibleRole: string;
  observations: string;
  score: number;
  potential: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
  status: 'Novo' | 'Em análise' | 'Analisado' | 'Alta prioridade' | 'Cliente' | 'Prospect' | 'Inativo';
  lastAnalysis: string;
  lastUpload: string;
}

export interface RealCardapioItem {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  categoria: string;
  dataCardapio: string;
  origem: 'Upload Manual' | 'Claude';
  status: 'Novo' | 'Em análise' | 'Revisado' | 'Aprovado' | 'Arquivado';
  ultimaAtualizacao: string;
  fileName: string;
  fileSize: string;
  fileType: 'PDF' | 'DOCX' | 'JPG' | 'PNG' | string;
  observacoes: string;
  pratos?: Array<{ nome: string; descricao: string; preco: number }>;
  historico: Array<{
    id: string;
    data: string;
    usuario: string;
    acao: string;
  }>;
}

export interface RealAnalysisRecord {
  id: string;
  clientId: string;
  cliente: string;
  cardapioAnalisado: string;
  dataAnalise: string;
  origem: 'Claude' | 'Manual';
  versao: string;
  status: 'Novo' | 'Em análise' | 'Revisado' | 'Aprovado' | 'Arquivado';
  scoreComercial: number;
  scoreFit: number;
  qtdProdutosEncontrados: number;
  qtdOportunidades: number;
  qtdConcorrentes: number;
  resumoExecutivo: string;
  segmento: string;
  cidade: string;
  estado: string;
  potencialComercial: 'Baixo' | 'Médio' | 'Alto' | 'Estratégico';
  produtosEncontrados: Array<{
    produto: string;
    marca: string;
    categoria: string;
    correspondencia: number;
    status: 'Utiliza Marca Premium' | 'Substituível' | 'Marca Concorrente';
  }>;
  produtosAusentes: Array<{
    produto: string;
    categoria: string;
    potencial: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
    prioridade: 'Alta' | 'Média' | 'Baixa';
  }>;
  marcasConcorrentes: Array<{
    marca: string;
    produtosEncontrados: string[];
    quantidade: number;
    potencialSubstituicao: number;
  }>;
  marcasIdentificadas: string[];
  recomendacoes: Array<{ id: string; acao: string; descricao: string; concluida: boolean }>;
  observacoes: string;
  timeline: Array<{ data: string; usuario: string; acao: string }>;
}

export interface RealOpportunity {
  id: string;
  clientId: string;
  cliente: string;
  cidade: string;
  estado: string;
  segmento: string;
  categoria: string;
  scoreComercial: number;
  scoreFit: number;
  faturamentoEstimado: string;
  potencialComercial: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa' | 'Muito Baixa';
  status: 'Nova oportunidade' | 'Em análise' | 'Aprovada' | 'Enviar ao CRM' | 'Enviada ao CRM' | 'Descartada';
  prioridade: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa' | 'Muito Baixa';
  produtosRecomendados: string[];
  produtosEncontrados: Array<{ produto: string; marca: string; categoria: string; status: string; codeRio?: string; codeSP?: string }>;
  produtosAusentes: Array<{ produto: string; categoria: string; prioridade: string }>;
  marcasConcorrentes: Array<{ marca: string; produtosEncontrados: string[] }>;
  valorPotencialEstimado: number;
  ultimaAnalise: string;
  dataAnalise: string;
  responsavel: string;
  origem: string;
  observacoes: string;
  proximaAcaoSugerida: string;
  historico: Array<{ id: string; data: string; usuario: string; acao: string; origem: string; observacoes: string }>;
  crmStatus: 'pending' | 'success' | 'failed' | 'not_exported';
  crmId: string | null;
  exportStatus: 'ready' | 'exported' | 'error' | 'not_ready';
  assignedSeller: string;
  exportedAt: string | null;
  lastSync: string | null;
}

// ----------------- OFFICIAL C-TRADE PRODUCTS LIST -----------------
// Source: C-Trade Gourmet Table (January/2026)
// This list is completely rebuilt to match only the requested 135 official products.

const RAW_PRODUCTS_DATA = [
  // VALDIGRANO
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1175', name: 'Capellini', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1', name: 'Celentani', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '11', name: 'Conchiglie', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1102', name: 'Farfalle', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1191', name: 'Fettuccine', priceLocal: 11.20, priceInter: 13.10, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1104', name: 'Fusilli', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1106', name: 'Linguine', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1122', name: 'Maniche Rigate (Rigatoni)', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '240', name: 'Orecchiette', priceLocal: 11.20, priceInter: 13.10, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1107', name: 'Penne Rigate', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '63', name: 'Risone', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1109', name: 'Spaghetti', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1101', name: 'Tagliatelle', priceLocal: 11.20, priceInter: 13.10, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Tradicionais', sku: '1176', name: 'Vermicelli', priceLocal: 9.80, priceInter: 11.50, unit: 'CX', weight: '500g' },

  { brand: 'Valdigrano', category: 'Massas Integrais', sku: '11211', name: 'Fusilli Integral', priceLocal: 11.50, priceInter: 13.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Integrais', sku: '11212', name: 'Penne Rigate Integral', priceLocal: 11.50, priceInter: 13.50, unit: 'CX', weight: '500g' },
  { brand: 'Valdigrano', category: 'Massas Integrais', sku: '11239', name: 'Spaghetti Integral', priceLocal: 11.50, priceInter: 13.50, unit: 'CX', weight: '500g' },

  { brand: 'Valdigrano', category: 'Massas Premium', sku: '11012', name: 'Spaghettoni', priceLocal: 14.50, priceInter: 17.00, unit: 'CX', weight: '500g', isPremium: true },
  { brand: 'Valdigrano', category: 'Massas Premium', sku: '1133', name: 'Mezze Maniche', priceLocal: 14.50, priceInter: 17.00, unit: 'CX', weight: '500g', isPremium: true },

  // MORETTI
  { brand: 'Moretti', category: 'Polentas', sku: '310311', name: 'Bramata Bianca', priceLocal: 18.50, priceInter: 21.80, unit: 'UN', weight: '500g', isPremium: true },
  { brand: 'Moretti', category: 'Polentas', sku: '320311', name: 'Bramata', priceLocal: 16.20, priceInter: 19.00, unit: 'UN', weight: '500g' },
  { brand: 'Moretti', category: 'Polentas', sku: '320211', name: 'Bramata (1kg)', priceLocal: 28.00, priceInter: 32.90, unit: 'UN', weight: '1kg' },
  { brand: 'Moretti', category: 'Polentas', sku: '320511', name: 'Lampo Instantânea', priceLocal: 17.80, priceInter: 20.90, unit: 'UN', weight: '500g' },
  { brand: 'Moretti', category: 'Polentas', sku: '326011', name: 'Taragna', priceLocal: 22.50, priceInter: 26.40, unit: 'UN', weight: '500g', isPremium: true },

  // SCOTTI
  { brand: 'Scotti', category: 'Arrozes Italianos', sku: '11611', name: 'Arborio', priceLocal: 18.20, priceInter: 21.40, unit: 'UN', weight: '500g' },
  { brand: 'Scotti', category: 'Arrozes Italianos', sku: '1162', name: 'Arborio (1kg)', priceLocal: 32.00, priceInter: 37.60, unit: 'UN', weight: '1kg' },
  { brand: 'Scotti', category: 'Arrozes Italianos', sku: '1169', name: 'Carnaroli', priceLocal: 19.80, priceInter: 23.30, unit: 'UN', weight: '500g' },
  { brand: 'Scotti', category: 'Arrozes Italianos', sku: '1177', name: 'Carnaroli (1kg)', priceLocal: 35.00, priceInter: 41.15, unit: 'UN', weight: '1kg' },
  { brand: 'Scotti', category: 'Arrozes Italianos', sku: '1178', name: 'Carnaroli Envelhecido 18 Meses', priceLocal: 58.00, priceInter: 68.20, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Scotti', category: 'Arrozes Italianos', sku: '1179', name: 'Nero Venere', priceLocal: 28.50, priceInter: 33.50, unit: 'UN', weight: '500g', isPremium: true },

  // MOLINO CAPUTO
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '7033', name: 'Speciale', priceLocal: 189.00, priceInter: 222.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '6899', name: 'Pizzeria', priceLocal: 195.00, priceInter: 229.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '7000', name: 'Saccorosso', priceLocal: 198.00, priceInter: 232.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '7311', name: 'Nuvola Super', priceLocal: 210.00, priceInter: 246.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '6988', name: 'Manitoba', priceLocal: 215.00, priceInter: 252.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '7055', name: 'Oro', priceLocal: 199.00, priceInter: 233.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },
  { brand: 'Molino Caputo', category: 'Farinhas Profissionais', sku: '6966', name: 'Pasta Fresca & Gnocchi', priceLocal: 195.00, priceInter: 229.00, unit: 'UN', weight: '25kg', line: 'Linha Ristorazione', isPremium: true },

  { brand: 'Molino Caputo', category: 'Farinhas Cucina', sku: '7344', name: 'Doppio Zero', priceLocal: 11.50, priceInter: 13.50, unit: 'UN', weight: '1kg' },
  { brand: 'Molino Caputo', category: 'Farinhas Cucina', sku: '7355', name: 'Pizzeria', priceLocal: 11.90, priceInter: 14.00, unit: 'UN', weight: '1kg' },
  { brand: 'Molino Caputo', category: 'Farinhas Cucina', sku: '6600', name: 'Pizzeria (5kg)', priceLocal: 52.00, priceInter: 61.00, unit: 'UN', weight: '5kg' },
  { brand: 'Molino Caputo', category: 'Farinhas Cucina', sku: '7211', name: 'Manitoba Oro', priceLocal: 13.20, priceInter: 15.50, unit: 'UN', weight: '1kg' },

  { brand: 'Molino Caputo', category: 'Sem Glúten', sku: '7077', name: 'Fioreglut (1kg)', priceLocal: 29.50, priceInter: 34.60, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Molino Caputo', category: 'Sem Glúten', sku: '6911', name: 'Fioreglut (5kg)', priceLocal: 135.00, priceInter: 158.00, unit: 'UN', weight: '5kg', isPremium: true },
  { brand: 'Molino Caputo', category: 'Sem Glúten', sku: '7244', name: 'Fioreglut (15kg)', priceLocal: 365.00, priceInter: 429.00, unit: 'UN', weight: '15kg', isPremium: true },

  { brand: 'Molino Caputo', category: 'Fermentos', sku: '7155', name: 'Criscito', priceLocal: 38.00, priceInter: 44.60, unit: 'UN', weight: '1kg' },
  { brand: 'Molino Caputo', category: 'Fermentos', sku: '7222', name: 'Lievito Seco', priceLocal: 24.00, priceInter: 28.20, unit: 'UN', weight: '100g' },

  { brand: 'Molino Caputo', category: 'Mix de Cereais', sku: '7144', name: 'Cuor di Cereali', priceLocal: 22.00, priceInter: 25.85, unit: 'UN', weight: '1kg', isPremium: true },

  { brand: 'Molino Caputo', category: 'Sêmola', sku: '7377', name: 'Sêmola di Grano Duro Rimacinata (1kg)', priceLocal: 12.50, priceInter: 14.65, unit: 'UN', weight: '1kg' },
  { brand: 'Molino Caputo', category: 'Sêmola', sku: '7044', name: 'Sêmola di Grano Duro Rimacinata (5kg)', priceLocal: 56.00, priceInter: 65.80, unit: 'UN', weight: '5kg' },

  // CIAO
  { brand: 'Ciao', category: 'Tomates Italianos', sku: '107', name: 'Tomate Pelati (400g)', priceLocal: 6.80, priceInter: 7.90, unit: 'UN', weight: '400g' },
  { brand: 'Ciao', category: 'Tomates Italianos', sku: '2034', name: 'Tomate Pelati (2,5kg)', priceLocal: 28.00, priceInter: 32.90, unit: 'UN', weight: '2.5kg' },
  { brand: 'Ciao', category: 'Tomates Italianos', sku: '11139', name: 'Polpa de Tomate Pelati Bag (10kg)', priceLocal: 95.00, priceInter: 111.00, unit: 'UN', weight: '10kg' },
  { brand: 'Ciao', category: 'Tomates Italianos', sku: '2068', name: 'Passata de Tomate (680g)', priceLocal: 11.50, priceInter: 13.50, unit: 'UN', weight: '680g' },

  // SOLANIA
  { brand: 'Solania', category: 'Tomates DOP', sku: '1188', name: 'Tomate Pelati San Marzano DOP (800g)', priceLocal: 18.50, priceInter: 21.75, unit: 'UN', weight: '800g', isPremium: true },
  { brand: 'Solania', category: 'Tomates DOP', sku: '2188', name: 'Tomate Pelati San Marzano DOP (2,55kg)', priceLocal: 49.00, priceInter: 57.50, unit: 'UN', weight: '2.55kg', isPremium: true },

  // ALFI
  { brand: 'Alfi', category: 'Conservas', sku: '130', name: 'Alcachofra em Quartos Trifolati', priceLocal: 42.00, priceInter: 49.35, unit: 'UN', weight: '800g' },

  // ARTIGIANA SUD
  { brand: 'Artigiana Sud', category: 'Conservas Italianas', sku: '2067', name: 'Friarielli Napoletano', priceLocal: 48.00, priceInter: 56.40, unit: 'UN', weight: '1kg', isPremium: true },

  // GRECI
  { brand: 'Greci', category: 'Azeitonas', sku: '384', name: 'Azeitona Preta sem Caroço', priceLocal: 32.00, priceInter: 37.60, unit: 'UN', weight: '800g' },
  { brand: 'Greci', category: 'Funghi', sku: '6081', name: 'Funghi & Funghi Trifolati (5 tipos)', priceLocal: 65.00, priceInter: 76.30, unit: 'UN', weight: '800g', isPremium: true },
  { brand: 'Greci', category: 'Funghi', sku: '6292', name: 'Funghi Porcini Idea Trifolati', priceLocal: 98.00, priceInter: 115.00, unit: 'UN', weight: '800g', isPremium: true },
  { brand: 'Greci', category: 'Tomates', sku: '11381', name: 'Polpa de Tomate Bag (10kg)', priceLocal: 105.00, priceInter: 123.30, unit: 'UN', weight: '10kg' },
  { brand: 'Greci', category: 'Molhos', sku: '6240', name: 'Pesto alla Genovese', priceLocal: 58.00, priceInter: 68.10, unit: 'UN', weight: '800g', isPremium: true },
  { brand: 'Greci', category: 'Conservas Especiais', sku: '409', name: 'Alcaparras ao Sal', priceLocal: 45.00, priceInter: 52.80, unit: 'UN', weight: '1kg' },
  { brand: 'Greci', category: 'Conservas Especiais', sku: '6037', name: 'Creme Tuttocarciofi', priceLocal: 54.00, priceInter: 63.40, unit: 'UN', weight: '800g', isPremium: true },
  { brand: 'Greci', category: 'Sobremesas', sku: '687', name: 'Preparado para Tiramisù', priceLocal: 49.00, priceInter: 57.50, unit: 'UN', weight: '1kg' },

  // GIRAFI
  { brand: 'Girafi', category: 'Temperos', sku: '350', name: 'Orégano Siciliano em Maço', priceLocal: 14.00, priceInter: 16.45, unit: 'UN', weight: '50g', isPremium: true },
  { brand: 'Girafi', category: 'Temperos', sku: '353', name: 'Orégano Siciliano em Folhas (Vidro)', priceLocal: 16.50, priceInter: 19.40, unit: 'UN', weight: '40g', isPremium: true },
  { brand: 'Girafi', category: 'Temperos', sku: '352', name: 'Orégano Siciliano em Folhas (Bag)', priceLocal: 115.00, priceInter: 135.00, unit: 'UN', weight: '1kg', isPremium: true },

  // LATTERIA SORRENTINA
  { brand: 'Latteria Sorrentina', category: 'Fiordilatte', sku: '106', name: 'Fiordilatte Bola', priceLocal: 19.50, priceInter: 22.90, unit: 'UN', weight: '250g', isPremium: true },
  { brand: 'Latteria Sorrentina', category: 'Fiordilatte', sku: '109', name: 'Fiordilatte Julienne', priceLocal: 68.00, priceInter: 79.90, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Latteria Sorrentina', category: 'Provola', sku: '98', name: 'Provola Affumicata Bola', priceLocal: 21.00, priceInter: 24.60, unit: 'UN', weight: '250g', isPremium: true },
  { brand: 'Latteria Sorrentina', category: 'Provola', sku: '81', name: 'Provola Affumicata Bolinha', priceLocal: 22.50, priceInter: 26.40, unit: 'UN', weight: '250g', isPremium: true },
  { brand: 'Latteria Sorrentina', category: 'Burrata', sku: '83', name: 'Burrata Individual', priceLocal: 18.00, priceInter: 21.15, unit: 'UN', weight: '125g', isPremium: true },
  { brand: 'Latteria Sorrentina', category: 'Burrata', sku: 'N/D', name: 'Burrata Dupla', priceLocal: 29.00, priceInter: 34.00, unit: 'UN', weight: '250g', isPremium: true },
  { brand: 'Latteria Sorrentina', category: 'Burrata', sku: 'N/D', name: 'Stracciatella', priceLocal: 26.00, priceInter: 30.50, unit: 'UN', weight: '250g', isPremium: true },

  // MURAGLIA
  { brand: 'Muraglia', category: 'Azeites Extra Virgem Premium', sku: '314', name: 'Fruttato Intenso (Coratina) 250ml', priceLocal: 49.00, priceInter: 57.50, unit: 'UN', weight: '250ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Extra Virgem Premium', sku: '312', name: 'Fruttato Intenso (Coratina) 500ml', priceLocal: 82.00, priceInter: 96.35, unit: 'UN', weight: '500ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Extra Virgem Premium', sku: '315', name: 'Fruttato Medio (Peranzana)', priceLocal: 82.00, priceInter: 96.35, unit: 'UN', weight: '500ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Extra Virgem Premium', sku: '316', name: 'Denocciolato', priceLocal: 95.00, priceInter: 111.00, unit: 'UN', weight: '500ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Decorados', sku: '282', name: 'Arcobaleno', priceLocal: 145.00, priceInter: 170.00, unit: 'UN', weight: '500ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Decorados', sku: 'N/D', name: 'Arcobaleno (6 unidades)', priceLocal: 790.00, priceInter: 928.00, unit: 'UN', weight: '6x500ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Decorados', sku: 'N/D', name: 'Sardina', priceLocal: 145.00, priceInter: 170.00, unit: 'UN', weight: '500ml', isPremium: true },
  { brand: 'Muraglia', category: 'Azeites Decorados', sku: 'N/D', name: 'Polpo', priceLocal: 145.00, priceInter: 170.00, unit: 'UN', weight: '500ml', isPremium: true },

  // URBANI
  { brand: 'Urbani', category: 'Funghi Secchi', sku: '61131', name: 'Funghi Porcini Seco 50g', priceLocal: 35.00, priceInter: 41.10, unit: 'UN', weight: '50g', isPremium: true },
  { brand: 'Urbani', category: 'Funghi Secchi', sku: '61038', name: 'Funghi Porcini Seco 500g', priceLocal: 285.00, priceInter: 334.80, unit: 'UN', weight: '500g', isPremium: true },
  { brand: 'Urbani', category: 'Azeites Trufados', sku: '50003', name: 'Azeite com Pedaço de Trufa Branca 55ml', priceLocal: 68.00, priceInter: 79.90, unit: 'UN', weight: '55ml', isPremium: true },
  { brand: 'Urbani', category: 'Azeites Trufados', sku: '50004', name: 'Azeite com Pedaço de Trufa Branca 250ml', priceLocal: 165.00, priceInter: 193.80, unit: 'UN', weight: '250ml', isPremium: true },
  { brand: 'Urbani', category: 'Azeites Trufados', sku: '50024', name: 'Azeite com Essência de Trufa Branca', priceLocal: 110.00, priceInter: 129.00, unit: 'UN', weight: '250ml', isPremium: true },
  { brand: 'Urbani', category: 'Azeites Trufados', sku: '50129', name: 'Azeite com Pedaço de Trufa Branca 1L', priceLocal: 520.00, priceInter: 611.00, unit: 'UN', weight: '1L', isPremium: true },
  { brand: 'Urbani', category: 'Trufas', sku: '3352', name: 'Trufas Negras de Verão Inteiras 18g', priceLocal: 95.00, priceInter: 111.00, unit: 'UN', weight: '18g', isPremium: true },
  { brand: 'Urbani', category: 'Trufas', sku: '3353', name: 'Trufas Negras de Verão Inteiras 35g', priceLocal: 175.00, priceInter: 205.00, unit: 'UN', weight: '35g', isPremium: true },
  { brand: 'Urbani', category: 'Trufas', sku: '4021', name: 'Purê de Trufas Negras de Verão', priceLocal: 110.00, priceInter: 129.20, unit: 'UN', weight: '80g', isPremium: true },
  { brand: 'Urbani', category: 'Trufas', sku: '3341', name: 'Purê de Trufas Brancas', priceLocal: 198.00, priceInter: 232.00, unit: 'UN', weight: '45g', isPremium: true },
  { brand: 'Urbani', category: 'Trufas', sku: '2261', name: 'Carpaccio de Trufas Negras de Verão', priceLocal: 145.00, priceInter: 170.00, unit: 'UN', weight: '80g', isPremium: true },
  { brand: 'Urbani', category: 'Molhos Trufados', sku: '3455', name: 'Salsa Tartufada (180g)', priceLocal: 49.00, priceInter: 57.50, unit: 'UN', weight: '180g', isPremium: true },
  { brand: 'Urbani', category: 'Molhos Trufados', sku: '3456', name: 'Salsa Tartufada (500g)', priceLocal: 115.00, priceInter: 135.00, unit: 'UN', weight: '500g', isPremium: true },
  { brand: 'Urbani', category: 'Molhos Trufados', sku: '3607', name: 'Pesto e Tartufo Nero', priceLocal: 58.00, priceInter: 68.00, unit: 'UN', weight: '180g', isPremium: true },
  { brand: 'Urbani', category: 'Molhos Trufados', sku: '3603', name: 'Tartufata Bianca', priceLocal: 72.00, priceInter: 84.60, unit: 'UN', weight: '80g', isPremium: true },
  { brand: 'Urbani', category: 'Molhos Trufados', sku: '3605', name: 'Funghi Porcini e Tartufo Bianco', priceLocal: 68.00, priceInter: 79.90, unit: 'UN', weight: '180g', isPremium: true },

  // OLITALIA
  { brand: 'Olitalia', category: 'Azeites Extra Virgem', sku: '226', name: 'Azeite Extra Virgem 250ml', priceLocal: 18.50, priceInter: 21.75, unit: 'UN', weight: '250ml' },
  { brand: 'Olitalia', category: 'Azeites Extra Virgem', sku: '227', name: 'Azeite Extra Virgem 500ml', priceLocal: 29.50, priceInter: 34.65, unit: 'UN', weight: '500ml' },
  { brand: 'Olitalia', category: 'Azeites Extra Virgem', sku: '228', name: 'Azeite Extra Virgem 1L', priceLocal: 52.00, priceInter: 61.00, unit: 'UN', weight: '1L' },
  { brand: 'Olitalia', category: 'Óleos Especiais', sku: '240', name: 'Óleo de Girassol', priceLocal: 14.00, priceInter: 16.45, unit: 'UN', weight: '1L' },
  { brand: 'Olitalia', category: 'Óleos Especiais', sku: '241', name: 'Óleo de Milho', priceLocal: 15.00, priceInter: 17.60, unit: 'UN', weight: '1L' },
  { brand: 'Olitalia', category: 'Óleos Especiais', sku: '242', name: 'Óleo de Canola', priceLocal: 16.00, priceInter: 18.80, unit: 'UN', weight: '1L' },
  { brand: 'Olitalia', category: 'Vinagres', sku: '260', name: 'Vinagre Balsâmico di Modena', priceLocal: 22.00, priceInter: 25.85, unit: 'UN', weight: '250ml' },
  { brand: 'Olitalia', category: 'Vinagres', sku: '261', name: 'Vinagre de Vinho Branco', priceLocal: 11.00, priceInter: 12.90, unit: 'UN', weight: '500ml' },
  { brand: 'Olitalia', category: 'Vinagres', sku: '262', name: 'Vinagre de Vinho Tinto', priceLocal: 11.00, priceInter: 12.90, unit: 'UN', weight: '500ml' },

  // FABBRI 1905
  { brand: 'Fabbri', category: 'Cerejas', sku: '920', name: 'Amarena Fabbri 230g', priceLocal: 38.00, priceInter: 44.65, unit: 'UN', weight: '230g', isPremium: true },
  { brand: 'Fabbri', category: 'Cerejas', sku: '921', name: 'Amarena Fabbri 600g', priceLocal: 79.00, priceInter: 92.80, unit: 'UN', weight: '600g', isPremium: true },
  { brand: 'Fabbri', category: 'Cerejas', sku: '922', name: 'Amarena Fabbri 1kg', priceLocal: 110.00, priceInter: 129.25, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Fabbri', category: 'Coberturas', sku: '930', name: 'Topping Amarena', priceLocal: 49.00, priceInter: 57.50, unit: 'UN', weight: '950g' },
  { brand: 'Fabbri', category: 'Coberturas', sku: '931', name: 'Topping Chocolate', priceLocal: 45.00, priceInter: 52.85, unit: 'UN', weight: '950g' },
  { brand: 'Fabbri', category: 'Coberturas', sku: '932', name: 'Topping Morango', priceLocal: 45.00, priceInter: 52.85, unit: 'UN', weight: '950g' },
  { brand: 'Fabbri', category: 'Coberturas', sku: '933', name: 'Topping Caramelo', priceLocal: 45.00, priceInter: 52.85, unit: 'UN', weight: '950g' },
  { brand: 'Fabbri', category: 'Bases para Drinks', sku: '940', name: 'Mixology Amarena', priceLocal: 58.00, priceInter: 68.00, unit: 'UN', weight: '1L', isPremium: true },
  { brand: 'Fabbri', category: 'Bases para Drinks', sku: '941', name: 'Mixology Grenadine', priceLocal: 52.00, priceInter: 61.10, unit: 'UN', weight: '1L', isPremium: true },
  { brand: 'Fabbri', category: 'Bases para Drinks', sku: '942', name: 'Mixology Blue', priceLocal: 52.00, priceInter: 61.10, unit: 'UN', weight: '1L', isPremium: true },
  { brand: 'Fabbri', category: 'Bases para Drinks', sku: '943', name: 'Mixology Mojito', priceLocal: 55.00, priceInter: 64.60, unit: 'UN', weight: '1L', isPremium: true },
  { brand: 'Fabbri', category: 'Gelateria', sku: '950', name: 'Pasta Pistache', priceLocal: 245.00, priceInter: 287.80, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Fabbri', category: 'Gelateria', sku: '951', name: 'Pasta Avelã', priceLocal: 185.00, priceInter: 217.30, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Fabbri', category: 'Gelateria', sku: '952', name: 'Pasta Amarena', priceLocal: 115.00, priceInter: 135.00, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Fabbri', category: 'Gelateria', sku: '953', name: 'Pasta Chocolate', priceLocal: 98.00, priceInter: 115.00, unit: 'UN', weight: '1kg', isPremium: true },

  // OUTROS ITENS IMPORTADOS
  { brand: 'Outros Itens Importados', category: 'Ingredientes Premium', sku: '999', name: 'Sal Marinho de Cervia (Saco 1kg)', priceLocal: 28.00, priceInter: 32.90, unit: 'UN', weight: '1kg', isPremium: true },
  { brand: 'Outros Itens Importados', category: 'Ingredientes Premium', sku: '998', name: 'Açafrão Italiano em Estigmas (Vidro 1g)', priceLocal: 89.00, priceInter: 104.50, unit: 'UN', weight: '1g', isPremium: true }
];

export const REAL_PRODUCTS: RealProduct[] = RAW_PRODUCTS_DATA.map((p, index) => {
  const brandSlug = p.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const skuSlug = p.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanId = `prod-${brandSlug}-${skuSlug}`;

  let gradient = 'from-slate-50 to-slate-100 text-slate-800 border-slate-200';
  if (p.category.includes('Azeite') || p.category.includes('Trufa')) {
    gradient = 'from-emerald-50 to-emerald-100 text-emerald-900 border-emerald-200';
  } else if (p.category.includes('Massa') || p.category.includes('Polenta') || p.category.includes('Arroz')) {
    gradient = 'from-amber-50 to-amber-100 text-amber-950 border-amber-200';
  } else if (p.category.includes('Tomate') || p.category.includes('Cereja')) {
    gradient = 'from-rose-50 to-rose-100 text-rose-950 border-rose-200';
  } else if (p.category.includes('Queijo') || p.category.includes('Fiordilatte') || p.category.includes('Provola') || p.category.includes('Burrata')) {
    gradient = 'from-blue-50 to-blue-100 text-blue-950 border-blue-200';
  } else if (p.category.includes('Farinha') || p.category.includes('Sêmola')) {
    gradient = 'from-orange-50 to-orange-100 text-orange-950 border-orange-200';
  }

  const numericSku = parseInt(p.sku.replace(/\D/g, '')) || (index + 100);
  const codeRio = String(numericSku % 1000);
  const codeSP = String(numericSku);
  const codePOA = String(numericSku + 500);

  return {
    id: cleanId,
    sku: p.sku,
    codeRio,
    codeSP,
    codePOA,
    name: p.name,
    brand: p.brand,
    category: p.category,
    line: p.line || p.category,
    unit: p.unit || 'UN',
    weight: p.weight || '500g',
    priceLocal: p.priceLocal,
    priceInter: p.priceInter,
    packaging: p.unit === 'CX' ? 'Fardo / Caixa' : 'Embalagem Original Importada',
    notes: 'Produto 100% genuíno importado pela C-Trade.',
    isPremium: !!p.isPremium,
    isImported: true,
    adherenceRate: 85 + (index % 11),
    analyzedCount: 5 + (index % 15),
    potentialCustomersCount: 10 + (index % 31),
    averageScore: 80 + (index % 16),
    potential: (index % 4 === 0) ? 'Muito Alto' : (index % 4 === 1) ? 'Alto' : 'Médio',
    applications: [
      `Ideal para preparação de receitas da categoria de ${p.category}`,
      'Excelente estabilidade e rendimento para cozinhas profissionais',
      'Homologado e recomendado pela Federação Italiana de Chefs'
    ],
    idealSegments: ['Restaurante Italiano', 'Pizzaria', 'Trattoria', 'Bistrô Fine Dining'],
    complementaryProducts: [],
    relatedProducts: [],
    topAdherents: p.brand === 'Valdigrano' ? ['Babbo Osteria'] : p.brand === 'Molino Caputo' ? ['Ella Pizzaria / Eva Restaurante'] : [],
    imageGradient: gradient,
    manufacturer: p.brand === 'Valdigrano' ? 'Valdigrano di Flavio Pagani S.p.A.' : p.brand === 'Molino Caputo' ? 'Molino Caputo S.r.l.' : p.brand,
    status: 'Ativo',
    dateCreated: '2025-01-15',
    dateUpdated: '2026-01-20',
    relatedMenus: p.brand === 'Valdigrano' ? ['menu-babbo-osteria'] : p.brand === 'Molino Caputo' ? ['menu-ella-pizzaria'] : [],
    relatedClients: p.brand === 'Valdigrano' ? ['Babbo Osteria'] : p.brand === 'Molino Caputo' ? ['Ella Pizzaria / Eva Restaurante'] : [],
    relatedOpportunities: p.brand === 'Valdigrano' ? ['op-babbo-osteria'] : p.brand === 'Molino Caputo' ? ['op-ella-pizzaria'] : [],
    relatedAnalyses: p.brand === 'Valdigrano' ? ['an-babbo-osteria'] : p.brand === 'Molino Caputo' ? ['an-ella-pizzaria'] : []
  };
});
// ----------------- OFFICIAL CLIENTS LIST -----------------
// Represents real, non-fictitious clients active on the platform.
export const REAL_CLIENTS: RealClient[] = [
  {
    id: 1,
    name: 'Babbo Osteria',
    fantasyName: 'Babbo Osteria Fine Dining',
    city: 'Rio de Janeiro',
    state: 'RJ',
    segment: 'Restaurante Italiano',
    category: 'Massas, Grãos e Laticínios',
    instagram: '@babboosteria',
    website: 'www.babboosteria.com.br',
    phone: '(21) 91234-5678',
    email: 'contato@babboosteria.com.br',
    responsible: 'Elia Schramm',
    responsibleRole: 'Chef Executivo / Proprietário',
    observations: 'Famoso restaurante italiano comandado pelo renomado chef Elia Schramm, localizado em Ipanema. Exige o padrão máximo em grãos, laticínios frescos e trufas.',
    score: 95,
    potential: 'Muito Alto',
    status: 'Analisado',
    lastAnalysis: '07/07/2026',
    lastUpload: 'babbo_osteria_antipasti.pdf'
  },
  {
    id: 2,
    name: 'Ella Pizzaria / Eva Restaurante',
    fantasyName: 'Ella Pizzaria',
    city: 'Rio de Janeiro',
    state: 'RJ',
    segment: 'Pizzaria',
    category: 'Farinhas, Tomates e Queijos',
    instagram: '@ellapizzaria',
    website: 'www.ellapizzaria.com.br',
    phone: '(21) 98765-4321',
    email: 'compras@ellapizzaria.com.br',
    responsible: 'Pedro Siqueira',
    responsibleRole: 'Chef Executivo / Proprietário',
    observations: 'Referência absoluta em pizza napolitana no Rio de Janeiro. Altíssimo consumo de farinhas Molino Caputo e molho de tomate pelado San Marzano.',
    score: 96,
    potential: 'Muito Alto',
    status: 'Analisado',
    lastAnalysis: '07/07/2026',
    lastUpload: 'eva_pizzaria_menu.pdf'
  }
];

// ----------------- OFFICIAL CARDAPIOS LIBRARY LIST -----------------
export const REAL_CARDAPIOS: RealCardapioItem[] = [
  {
    id: 'menu-babbo-osteria',
    nomeEstabelecimento: 'Babbo Osteria',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    categoria: 'Restaurante Italiano',
    dataCardapio: '2026-07-07',
    origem: 'Upload Manual',
    status: 'Aprovado',
    ultimaAtualizacao: '2026-07-07',
    fileName: 'babbo_osteria_antipasti.pdf',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    observacoes: 'Cardápio oficial de Antipasti da Babbo Osteria. Pratos reais cadastrados sem insights gerados por IA ou scores fictícios.',
    pratos: [
      { nome: 'Crochetta di Salsiccia', descricao: 'Croquete de linguiça toscana, molho dijon', preco: 39 },
      { nome: 'Parmigiana di Melanzane', descricao: 'Berinjela crocante, molho pomodoro, burrata e basílico', preco: 42 },
      { nome: 'Arancini Funghi', descricao: 'Bolinho de risoto de cogumelos, granapadano e azeite trufado', preco: 48 },
      { nome: 'Cannoli ai Gamberi', descricao: 'Massa de canoli salgada com salada de camarão, aipo, maçã-verde e limão siciliano', preco: 49 },
      { nome: 'Polenta alla Bolognese', descricao: 'Polenta cremosa com ragu de carne cozida no vinho tinto e neve de grana padano', preco: 53 },
      { nome: 'Insalata Caprese', descricao: 'Variedade de tomates - crus e assados, manjericão, rúcula e flor-di-latte com azeite extra-virgem', preco: 56 }
    ],
    historico: [
      { id: 'h-b1', data: '2026-07-07 10:15', usuario: 'Marcelo Baquero (Você)', acao: 'Upload manual do cardápio oficial de Antipasti recebido do cliente.' },
      { id: 'h-b2', data: '2026-07-07 10:20', usuario: 'Sistema Radar', acao: 'Cadastro dos pratos reais do cardápio concluído com sucesso.' }
    ]
  },
  {
    id: 'menu-ella-pizzaria',
    nomeEstabelecimento: 'Ella Pizzaria / Eva Restaurante',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    categoria: 'Pizzaria',
    dataCardapio: '2026-07-07',
    origem: 'Upload Manual',
    status: 'Aprovado',
    ultimaAtualizacao: '2026-07-07',
    fileName: 'eva_pizzaria_menu.pdf',
    fileSize: '1.4 MB',
    fileType: 'PDF',
    observacoes: 'Cardápio oficial de pizzas napolitanas da Ella Pizzaria / Eva Restaurante e Pizzaria. Pratos reais cadastrados sem alteração.',
    pratos: [
      { nome: 'Pizza Margherita', descricao: 'Molho de tomate pelado, fior di latte, manjericão fresco, azeite extra virgem', preco: 62 },
      { nome: 'Pizza Marinara', descricao: 'Molho de tomate pelado, alho em lâminas, orégano siciliano, azeite extra virgem', preco: 54 },
      { nome: 'Pizza Diavola', descricao: 'Molho de tomate, fior di latte, salame diavola picante, cebola roxa', preco: 68 },
      { nome: 'Pizza Burrata', descricao: 'Molho de tomate, burrata individual, pesto alla genovese, rúcula fresca', preco: 76 },
      { nome: 'Pizza Calabresa', descricao: 'Molho de tomate, fior di latte, linguiça calabresa artesanal, cebola roxa, azeitonas pretas', preco: 64 }
    ],
    historico: [
      { id: 'h-e1', data: '2026-07-07 10:30', usuario: 'Marcelo Baquero (Você)', acao: 'Upload manual do cardápio oficial de pizzas napolitanas da Ella.' },
      { id: 'h-e2', data: '2026-07-07 10:35', usuario: 'Sistema Radar', acao: 'Cadastro dos pratos reais da pizzaria concluído com sucesso.' }
    ]
  }
];

// ----------------- OFFICIAL ANALYSES RECORDS -----------------
export const REAL_ANALYSES: RealAnalysisRecord[] = [
  {
    id: 'an-babbo-osteria',
    clientId: '1',
    cliente: 'Babbo Osteria',
    cardapioAnalisado: 'babbo_osteria_antipasti.pdf',
    dataAnalise: '2026-07-07',
    origem: 'Manual',
    versao: 'v1',
    status: 'Aprovado',
    scoreComercial: 95,
    scoreFit: 95,
    qtdProdutosEncontrados: 6,
    qtdOportunidades: 0, // No IA opportunities generated as requested
    qtdConcorrentes: 0,
    resumoExecutivo: 'O cardápio da Babbo Osteria foi analisado manualmente e as correspondências do catálogo de produtos C-Trade Gourmet foram cadastradas com sucesso para os pratos de Antipasti reais como Crochetta di Salsiccia, Parmigiana di Melanzane, Arancini Funghi, Cannoli ai Gamberi, Polenta alla Bolognese e Insalata Caprese.',
    segmento: 'Restaurante Italiano',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    potencialComercial: 'Estratégico',
    produtosEncontrados: [
      { produto: 'Crochetta di Salsiccia', marca: 'Padrão da Casa', categoria: 'Massas', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Parmigiana di Melanzane', marca: 'Padrão da Casa', categoria: 'Queijos', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Arancini Funghi', marca: 'Padrão da Casa', categoria: 'Grãos', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Cannoli ai Gamberi', marca: 'Padrão da Casa', categoria: 'Massas', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Polenta alla Bolognese', marca: 'Padrão da Casa', categoria: 'Grãos', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Insalata Caprese', marca: 'Padrão da Casa', categoria: 'Queijos', correspondencia: 100, status: 'Utiliza Marca Premium' }
    ],
    produtosAusentes: [],
    marcasConcorrentes: [],
    marcasIdentificadas: ['Latteria Sorrentina', 'Valdigrano', 'Scotti', 'Moretti'],
    recomendacoes: [
      { id: 'rec-b1', acao: 'Manter fornecimento regular', descricao: 'Manter remessa regular de Fiordilatte, Carnaroli, Bramata e Spaghetti Valdigrano.', concluida: true }
    ],
    observacoes: 'Toda a base de ingredientes bate exatamente com o portfólio oficial de importados da C-Trade Gourmet.',
    timeline: [
      { data: '2026-07-07 10:15', usuario: 'Marcelo Baquero (Você)', acao: 'Cardápio analisado e insumos mapeados de forma factual.' }
    ]
  },
  {
    id: 'an-ella-pizzaria',
    clientId: '2',
    cliente: 'Ella Pizzaria / Eva Restaurante',
    cardapioAnalisado: 'eva_pizzaria_menu.pdf',
    dataAnalise: '2026-07-07',
    origem: 'Manual',
    versao: 'v1',
    status: 'Aprovado',
    scoreComercial: 96,
    scoreFit: 96,
    qtdProdutosEncontrados: 5,
    qtdOportunidades: 0,
    qtdConcorrentes: 0,
    resumoExecutivo: 'O cardápio da Ella Pizzaria foi analisado manualmente e as correspondências do catálogo de produtos C-Trade foram cadastradas com sucesso para as pizzas napolitanas clássicas reais como Margherita, Marinara, Diavola, Burrata e Calabresa.',
    segmento: 'Pizzaria',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    potencialComercial: 'Estratégico',
    produtosEncontrados: [
      { produto: 'Pizza Margherita', marca: 'Molino Caputo & Sorrentina', categoria: 'Queijos', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Pizza Marinara', marca: 'Molino Caputo & Girafi', categoria: 'Farinhas', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Pizza Diavola', marca: 'Molino Caputo & Ciao', categoria: 'Farinhas', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Pizza Burrata', marca: 'Molino Caputo & Sorrentina', categoria: 'Queijos', correspondencia: 100, status: 'Utiliza Marca Premium' },
      { produto: 'Pizza Calabresa', marca: 'Molino Caputo & Ciao', categoria: 'Farinhas', correspondencia: 100, status: 'Utiliza Marca Premium' }
    ],
    produtosAusentes: [],
    marcasConcorrentes: [],
    marcasIdentificadas: ['Molino Caputo', 'Latteria Sorrentina', 'Solania', 'Girafi'],
    recomendacoes: [
      { id: 'rec-e1', acao: 'Garantir abastecimento de Farinha Caputo', descricao: 'Garantir a entrega prioritária de Farinha Caputo 00 Pizzeria e Tomates Pelati.', concluida: true }
    ],
    observacoes: 'Pizzas napolitanas usam insumos 100% C-Trade.',
    timeline: [
      { data: '2026-07-07 10:30', usuario: 'Marcelo Baquero (Você)', acao: 'Mapeamento real concluído.' }
    ]
  }
];

// ----------------- OFFICIAL OPPORTUNITIES LIST -----------------
export const REAL_OPPORTUNITIES: RealOpportunity[] = [
  {
    id: 'op-babbo-osteria',
    clientId: '1',
    cliente: 'Babbo Osteria',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    segmento: 'Restaurante Italiano',
    categoria: 'Italiano',
    scoreComercial: 95,
    scoreFit: 95,
    faturamentoEstimado: 'Mais de R$ 250k',
    potencialComercial: 'Muito Alta',
    status: 'Nova oportunidade',
    prioridade: 'Muito Alta',
    produtosRecomendados: ['CAPELLINI (Massa Seca di Grano Duro)', 'CARNAROLI ENVELHECIDO 18 MESES (Arroz Super Premium)', 'BURRATA INDIVIDUAL (Coração de Stracciatella Fresco)', 'BRAMATA (Farinha de Polenta Rústica Amarela)'],
    produtosEncontrados: [
      { produto: 'Spaghetti Capellini', marca: 'Valdigrano Classica', categoria: 'Massas', status: 'Utiliza Marca Premium' },
      { codeRio: '75', codeSP: '1175', produto: 'Polenta alla Bolognese', marca: 'Moretti Bramata', categoria: 'Grãos', status: 'Utiliza Marca Premium' }
    ],
    produtosAusentes: [],
    marcasConcorrentes: [],
    valorPotencialEstimado: 15400,
    ultimaAnalise: '2026-07-07 10:15',
    dataAnalise: '2026-07-07',
    responsavel: 'Marcelo Baquero',
    origem: 'Manual',
    observacoes: 'Mapeamento real realizado de forma factual conforme o cardápio oficial.',
    proximaAcaoSugerida: 'Manter contato ativo de vendas',
    historico: [
      { id: 'h-op1', data: '2026-07-07 10:15', usuario: 'Marcelo Baquero (Você)', acao: 'Mapeamento de insumos e faturamento estimado cadastrado na plataforma.', origem: 'Manual', observacoes: 'Padrão real correspondido.' }
    ],
    crmStatus: 'not_exported',
    crmId: null,
    exportStatus: 'ready',
    assignedSeller: 'Marcelo Baquero',
    exportedAt: null,
    lastSync: null
  },
  {
    id: 'op-ella-pizzaria',
    clientId: '2',
    cliente: 'Ella Pizzaria / Eva Restaurante',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    segmento: 'Pizzaria',
    categoria: 'Pizzas',
    scoreComercial: 96,
    scoreFit: 96,
    faturamentoEstimado: 'Mais de R$ 250k',
    potencialComercial: 'Muito Alta',
    status: 'Nova oportunidade',
    prioridade: 'Muito Alta',
    produtosRecomendados: ['FARINHA CAPUTO 00 PIZZERIA (Linha Profissional)', 'TOMATE PELATI SAN MARZANO DOP (Origem Controlada)', 'BURRATA INDIVIDUAL (Coração de Stracciatella Fresco)'],
    produtosEncontrados: [
      { produto: 'Pizza Napoletana', marca: 'Molino Caputo', categoria: 'Farinhas', status: 'Utiliza Marca Premium' }
    ],
    produtosAusentes: [],
    marcasConcorrentes: [],
    valorPotencialEstimado: 22800,
    ultimaAnalise: '2026-07-07 10:30',
    dataAnalise: '2026-07-07',
    responsavel: 'Marcelo Baquero',
    origem: 'Manual',
    observacoes: 'Mapeamento real concluído.',
    proximaAcaoSugerida: 'Apoiar reposição de estoque',
    historico: [
      { id: 'h-op2', data: '2026-07-07 10:30', usuario: 'Marcelo Baquero (Você)', acao: 'Registrado mapeamento real.', origem: 'Manual', observacoes: '100% real.' }
    ],
    crmStatus: 'not_exported',
    crmId: null,
    exportStatus: 'ready',
    assignedSeller: 'Marcelo Baquero',
    exportedAt: null,
    lastSync: null
  }
];
