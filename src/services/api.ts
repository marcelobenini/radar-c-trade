/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ENV_CONFIG } from '../config/env';

export interface GeminiAnalysisResult {
  resumoExecutivo: string;
  tipoEstabelecimento: string;
  segmento: string;
  cidade: string;
  perfilRestaurante: string;
  publicoPredominante: string;
  nivelGastronomico: 'Casual' | 'Gourmet' | 'Fine Dining' | 'Tradicional' | string;
  scoreFit: number;
  ticketPotencial: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo' | string;
  categoriaPredominante: string;
  produtosEncontrados: Array<{
    produto: string;
    categoria: string;
    frequencia: 'Alta' | 'Média' | 'Baixa' | string;
    observacao: string;
  }>;
  produtosCTradeSugeridos: Array<{
    produto: string;
    compatibilidade: 'Alta' | 'Média' | 'Baixa' | string;
    potencial: 'Alto' | 'Médio' | 'Baixo' | string;
    prioridade: 'Alta' | 'Média' | 'Baixa' | string;
  }>;
  produtosAusentes: string[];
  insightsEstrategicos: string[];
  recomendacoesComerciais: string[];
  proximosPassos: string[];
}

/**
 * Service to encapsulate API integration calls to the full-stack server endpoints
 */
export const GeminiApiService = {
  /**
   * Tests connection with the backend Gemini configuration
   */
  async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(ENV_CONFIG.GEMINI_ENDPOINTS.TEST_CONNECTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro HTTP ao testar conexão.');
      }

      return await response.json();
    } catch (error: any) {
      console.error('GeminiApiService.testConnection failed:', error);
      return {
        success: false,
        message: error.message || 'Sem conexão com o servidor local.',
      };
    }
  },

  /**
   * Submits a base64 encoded menu file (PDF, Image, etc) to be analyzed by Gemini
   */
  async analyzeMenu(params: {
    apiKey?: string;
    fileData?: string; // base64 encoded
    mimeType?: string;
    fileName: string;
  }): Promise<{ success: boolean; result?: GeminiAnalysisResult; message?: string }> {
    try {
      const response = await fetch(ENV_CONFIG.GEMINI_ENDPOINTS.ANALYZE_MENU, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha na resposta do servidor.');
      }

      return await response.json();
    } catch (error: any) {
      console.error('GeminiApiService.analyzeMenu failed:', error);
      return {
        success: false,
        message: error.message || 'Falha ao processar cardápio via inteligência artificial.',
      };
    }
  },
};
