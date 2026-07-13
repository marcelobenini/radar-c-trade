/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidationEngine, RuleExecutionLog, RuleEntity } from './validationEngine';
import { SecurityService } from './securityService';

// --- TYPES & CONTRACTS ---

export interface TransformationLog {
  field: string;
  originalValue: any;
  transformedValue: any;
  ruleApplied: string;
  timestamp: string; // DD/MM/YYYY HH:mm:ss
  module: 'Parser' | 'Normalizer' | 'Validator' | 'Enricher' | 'Classifier';
  responsible: string;
}

export interface ProcessingContext {
  processing_id: string;
  pipeline_version: string;
  rules_version: string;
  normalizer_version: string;
  enricher_version: string;
  started_at: string;
  finished_at: string;
  processing_time_ms: number;
  records: number;
  errors: number;
  warnings: number;
}

export interface ProcessingResult {
  context: ProcessingContext;
  rawInput: { fileType: string; fileName: string; dataSize: number };
  parsedRecords: any[];
  normalizedRecords: any[];
  validatedRecords: {
    record: any;
    success: boolean;
    errors: string[];
    warnings: string[];
    logs: Omit<RuleExecutionLog, 'id' | 'date' | 'time'>[];
  }[];
  enrichedRecords: any[];
  transformationLogs: TransformationLog[];
  finalClassification: 'Processado' | 'Necessita Curadoria' | 'Necessita Revisão' | 'Dados Insuficientes' | 'Erro Estrutural' | 'Rejeitado';
  classificationReasons: string[];
}

// --- MODULE 1: PARSER ---
export class ParserModule {
  static parse(fileType: string, rawData: string): any[] {
    const records: any[] = [];
    const normalizedType = fileType.toLowerCase();

    if (normalizedType === 'json') {
      try {
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        throw new Error('Erro ao fazer o parse de JSON: Estrutura inválida ou corrompida.');
      }
    }

    if (normalizedType === 'csv') {
      const lines = rawData.split('\n');
      if (lines.length === 0 || !lines[0].trim()) return [];
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] !== undefined ? values[index] : '';
        });
        records.push(obj);
      }
      return records;
    }

    if (normalizedType === 'xml') {
      // Simple custom parser for XML mock representations
      const matches = rawData.match(/<record>([\s\S]*?)<\/record>/g);
      if (matches) {
        matches.forEach(match => {
          const obj: Record<string, any> = {};
          const fields = match.match(/<(\w+)>([\s\S]*?)<\/\1>/g);
          if (fields) {
            fields.forEach(field => {
              const tagMatch = field.match(/<(\w+)>([\s\S]*?)<\/\1>/);
              if (tagMatch) {
                obj[tagMatch[1]] = tagMatch[2].trim();
              }
            });
          }
          records.push(obj);
        });
      }
      return records;
    }

    if (normalizedType === 'html') {
      // OCR / HTML simple regex parse
      const trMatches = rawData.match(/<tr>([\s\S]*?)<\/tr>/g);
      if (trMatches) {
        let headers: string[] = [];
        trMatches.forEach((tr, idx) => {
          const cells = tr.match(/<(td|th)>([\s\S]*?)<\/\1>/g);
          if (cells) {
            const values = cells.map(c => c.replace(/<\/?(td|th)>/g, '').trim());
            if (idx === 0) {
              headers = values;
            } else {
              const obj: Record<string, any> = {};
              headers.forEach((header, cellIdx) => {
                obj[header] = values[cellIdx] || '';
              });
              records.push(obj);
            }
          }
        });
      }
      return records;
    }

    // Default Fallback: Raw string splits as simple list of lines / words
    const lines = rawData.split('\n');
    lines.forEach((line, index) => {
      if (line.trim()) {
        records.push({
          id_index: index + 1,
          raw_text: line.trim()
        });
      }
    });

    return records;
  }
}

// --- MODULE 2: NORMALIZER ---
export class NormalizerModule {
  static normalize(records: any[], addLog: (log: TransformationLog) => void): any[] {
    const timestampStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toTimeString().slice(0, 8);
    const responsible = 'System: Normalizer Engine v1.2';

    return records.map(record => {
      const normalized = { ...record };

      // Helper function to update and log changes
      const updateAndLog = (field: string, original: any, newVal: any, ruleApplied: string) => {
        if (original !== newVal) {
          normalized[field] = newVal;
          addLog({
            field,
            originalValue: original,
            transformedValue: newVal,
            ruleApplied,
            timestamp: timestampStr,
            module: 'Normalizer',
            responsible
          });
        }
      };

      // 1. Text Trim & Standard Spacing
      Object.keys(normalized).forEach(key => {
        const val = normalized[key];
        if (typeof val === 'string') {
          const trimmed = val.replace(/\s+/g, ' ').trim();
          updateAndLog(key, val, trimmed, 'Standard Space & Trim');
        }
      });

      // 2. CNPJ Normalization
      if (normalized.cnpj) {
        const cleanCnpj = String(normalized.cnpj).replace(/\D/g, '');
        if (cleanCnpj.length === 14) {
          const formattedCnpj = `${cleanCnpj.substring(0, 2)}.${cleanCnpj.substring(2, 5)}.${cleanCnpj.substring(5, 8)}/${cleanCnpj.substring(8, 12)}-${cleanCnpj.substring(12, 14)}`;
          updateAndLog('cnpj', normalized.cnpj, formattedCnpj, 'CNPJ Standard Formatting');
        }
      }

      // 3. Phone Normalization
      if (normalized.phone) {
        const cleanPhone = String(normalized.phone).replace(/\D/g, '');
        if (cleanPhone.length === 11) {
          const formatted = `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7, 11)}`;
          updateAndLog('phone', normalized.phone, formatted, 'Mobile Phone Standard Formatting');
        } else if (cleanPhone.length === 10) {
          const formatted = `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6, 10)}`;
          updateAndLog('phone', normalized.phone, formatted, 'Landline Phone Standard Formatting');
        }
      }

      // 4. URL Website Normalization
      if (normalized.website) {
        let web = String(normalized.website).toLowerCase();
        if (web && !web.startsWith('http://') && !web.startsWith('https://')) {
          const transformed = `https://${web}`;
          updateAndLog('website', normalized.website, transformed, 'Add Standard HTTPS Protocol');
        }
      }

      // 5. LinkedIn standard URL Normalization
      if (normalized.linkedin && !String(normalized.linkedin).startsWith('http')) {
        let rawIn = String(normalized.linkedin).replace(/^@/, '');
        const transformed = `https://linkedin.com/in/${rawIn}`;
        updateAndLog('linkedin', normalized.linkedin, transformed, 'LinkedIn Profile URL Format');
      }

      // 6. States (UF) normalization
      if (normalized.state) {
        const originalState = String(normalized.state).trim();
        let stateVal = originalState.toUpperCase();
        if (stateVal.length > 2) {
          // Map popular full names to UFs
          const stateMap: Record<string, string> = {
            'SÃO PAULO': 'SP', 'SAO PAULO': 'SP', 'RIO DE JANEIRO': 'RJ', 'SANTA CATARINA': 'SC',
            'PARANÁ': 'PR', 'PARANA': 'PR', 'RIO GRANDE DO SUL': 'RS', 'MINAS GERAIS': 'MG'
          };
          if (stateMap[stateVal]) {
            stateVal = stateMap[stateVal];
          } else {
            stateVal = stateVal.slice(0, 2);
          }
        }
        updateAndLog('state', originalState, stateVal, 'State Code Capitalization & Mapping');
      }

      // 7. Cities capitalization (Title Case)
      if (normalized.city) {
        const originalCity = String(normalized.city).trim();
        const titleCased = originalCity.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        updateAndLog('city', originalCity, titleCased, 'City Name Title Case');
      }

      // 8. Categories standard mapping
      if (normalized.category) {
        const catLower = String(normalized.category).toLowerCase();
        if (catLower.includes('azeite') || catLower.includes('tomate') || catLower.includes('grão') || catLower.includes('grao')) {
          updateAndLog('category', normalized.category, 'Azeites, Tomates e Grãos', 'Official Category Taxonomy Alignment');
        } else if (catLower.includes('massa') || catLower.includes('farinha') || catLower.includes('molho')) {
          updateAndLog('category', normalized.category, 'Massas, Farinhas e Molhos', 'Official Category Taxonomy Alignment');
        }
      }

      // 9. Brands alignment
      if (normalized.brand) {
        const bUpper = String(normalized.brand).toUpperCase();
        if (bUpper === 'VALDIGRANO' || bUpper === 'VALDI GRANO') {
          updateAndLog('brand', normalized.brand, 'Valdigrano', 'Brand Name Normalization');
        } else if (bUpper === 'PAGANINI' || bUpper === 'PAGANINNI') {
          updateAndLog('brand', normalized.brand, 'Paganini', 'Brand Name Normalization');
        }
      }

      return normalized;
    });
  }
}

// --- MODULE 3: VALIDATOR ---
export class ValidatorModule {
  static validate(records: any[], entity: RuleEntity): any[] {
    return records.map(record => {
      const identifier = record.cnpj || record.name || record.fantasyName || `REC-${Math.floor(Math.random() * 1000)}`;
      const result = ValidationEngine.validateRecord(entity, record, identifier);

      return {
        record: result.correctedRecord,
        success: result.success,
        errors: result.logs.filter(l => l.result === 'Reprovado' && l.actionPerformed === 'Bloquear processamento').map(l => l.details),
        warnings: result.logs.filter(l => l.result === 'Reprovado' && l.actionPerformed !== 'Bloquear processamento').map(l => l.details),
        logs: result.logs
      };
    });
  }
}

// --- MODULE 4: ENRICHER ---
export class EnricherModule {
  static enrich(validatedRecords: any[], addLog: (log: TransformationLog) => void): any[] {
    const timestampStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toTimeString().slice(0, 8);
    const responsible = 'System: Enricher Core Engine v1.1';

    return validatedRecords.map(item => {
      const enriched = { ...item.record };

      const updateAndLog = (field: string, original: any, newVal: any, ruleApplied: string) => {
        enriched[field] = newVal;
        if (original !== undefined) {
          enriched[`_original_${field}`] = original;
        }
        addLog({
          field,
          originalValue: original ?? 'NULO',
          transformedValue: newVal,
          ruleApplied,
          timestamp: timestampStr,
          module: 'Enricher',
          responsible
        });
      };

      // 1. Enrich City, State, UF and Regional based on Phone DDD prefix if missing
      if ((!enriched.city || !enriched.state) && enriched.phone) {
        const ddd = String(enriched.phone).replace(/\D/g, '').substring(0, 2);
        if (ddd === '21' || ddd === '22' || ddd === '24') {
          if (!enriched.city) updateAndLog('city', enriched.city, 'Rio de Janeiro', 'DDD Phone Match: City Enrichment');
          if (!enriched.state) updateAndLog('state', enriched.state, 'RJ', 'DDD Phone Match: State Enrichment');
        } else if (ddd === '11' || ddd === '12' || ddd === '19') {
          if (!enriched.city) updateAndLog('city', enriched.city, 'São Paulo', 'DDD Phone Match: City Enrichment');
          if (!enriched.state) updateAndLog('state', enriched.state, 'SP', 'DDD Phone Match: State Enrichment');
        } else if (ddd === '48' || ddd === '47') {
          if (!enriched.city) updateAndLog('city', enriched.city, 'Florianópolis', 'DDD Phone Match: City Enrichment');
          if (!enriched.state) updateAndLog('state', enriched.state, 'SC', 'DDD Phone Match: State Enrichment');
        }
      }

      // 2. Enrich Regional & RCA based on State/Region mapping
      if (!enriched.responsibleCommercial && enriched.state) {
        const uf = String(enriched.state).toUpperCase();
        if (uf === 'RJ') {
          updateAndLog('responsibleCommercial', enriched.responsibleCommercial, 'RCA Marcelo Baquero', 'Geographic Territory RCA Mapping');
        } else if (uf === 'SP') {
          updateAndLog('responsibleCommercial', enriched.responsibleCommercial, 'RCA Regional São Paulo', 'Geographic Territory RCA Mapping');
        } else if (uf === 'SC' || uf === 'PR' || uf === 'RS') {
          updateAndLog('responsibleCommercial', enriched.responsibleCommercial, 'RCA Regional Sul', 'Geographic Territory RCA Mapping');
        } else {
          updateAndLog('responsibleCommercial', enriched.responsibleCommercial, 'RCA Canais Indiretos', 'Fallback RCA Mapping');
        }
      }

      // 3. Enrich Segment & Category based on Keyword patterns
      if (!enriched.segment && (enriched.fantasyName || enriched.name)) {
        const text = String(enriched.fantasyName || enriched.name).toLowerCase();
        if (text.includes('pizzaria') || text.includes('pizza')) {
          updateAndLog('segment', enriched.segment, 'Pizzaria', 'Establishment Name Keyword Match');
          if (!enriched.category) {
            updateAndLog('category', enriched.category, 'Massas, Farinhas e Molhos', 'Segment Category Enrichment');
          }
        } else if (text.includes('ristorante') || text.includes('trattoria') || text.includes('pasta') || text.includes('cantina')) {
          updateAndLog('segment', enriched.segment, 'Restaurante Italiano', 'Establishment Name Keyword Match');
          if (!enriched.category) {
            updateAndLog('category', enriched.category, 'Azeites, Tomates e Grãos', 'Segment Category Enrichment');
          }
        } else if (text.includes('hamburguer') || text.includes('burger') || text.includes('snack')) {
          updateAndLog('segment', enriched.segment, 'Hamburgueria', 'Establishment Name Keyword Match');
        }
      }

      // 4. Enrich standard Website/Instagram matching
      if (!enriched.website && enriched.fantasyName) {
        const slug = String(enriched.fantasyName).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        if (slug) {
          updateAndLog('website', enriched.website, `https://www.${slug}.com.br`, 'Domain Generation Enrichment');
        }
      }
      if (!enriched.instagram && enriched.fantasyName) {
        const slug = String(enriched.fantasyName).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        if (slug) {
          updateAndLog('instagram', enriched.instagram, `@${slug}`, 'Instagram Handle Generation Enrichment');
        }
      }

      // 5. Enrich Geolocation based on City/State mapping (Mock/Standard coordinates)
      if (!enriched.latitude || !enriched.longitude) {
        const uf = String(enriched.state || 'RJ').toUpperCase();
        let lat = -22.9068;
        let lng = -43.1729; // RJ default
        if (uf === 'SP') {
          lat = -23.5505;
          lng = -46.6333;
        } else if (uf === 'SC') {
          lat = -27.5954;
          lng = -48.5480;
        }
        updateAndLog('latitude', enriched.latitude, lat, 'Latitude Geo-enrichment');
        updateAndLog('longitude', enriched.longitude, lng, 'Longitude Geo-enrichment');
      }

      return enriched;
    });
  }
}

// --- MODULE 5: CLASSIFIER ---
export class ClassifierModule {
  static classify(
    validatedResults: any[],
    enrichedRecords: any[]
  ): {
    status: ProcessingResult['finalClassification'];
    reasons: string[];
  } {
    const reasons: string[] = [];

    // 1. Total records check
    if (enrichedRecords.length === 0) {
      reasons.push('Lote não contém registros ou a estrutura de parsing falhou.');
      return { status: 'Erro Estrutural', reasons };
    }

    // 2. Count failures
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalRecords = validatedResults.length;

    validatedResults.forEach(res => {
      totalErrors += res.errors.length;
      totalWarnings += res.warnings.length;
    });

    // 3. Evaluate criteria
    if (totalErrors > 0) {
      reasons.push(`Lote reprovou em regras críticas de integridade (${totalErrors} erros detectados).`);
      return { status: 'Rejeitado', reasons };
    }

    // Checking if there are incomplete but non-critical missing fields
    const missingCrucial = enrichedRecords.some(r => !r.cnpj || !r.name || !r.city);
    if (missingCrucial) {
      reasons.push('Informações comerciais cruciais ausentes (CNPJ, Razão Social ou Cidade). Necessita de intervenção.');
      return { status: 'Dados Insuficientes', reasons };
    }

    if (totalWarnings > 10) {
      reasons.push(`Quantidade de advertências anormalmente alta (${totalWarnings} avisos). Direcionado para revisão rigorosa.`);
      return { status: 'Necessita Revisão', reasons };
    }

    if (totalWarnings > 0) {
      reasons.push(`Lote aprovado com ressalvas. Contém ${totalWarnings} avisos/ajustes automáticos tolerados.`);
      return { status: 'Necessita Curadoria', reasons };
    }

    // Perfect match
    reasons.push('Lote processado, normalizado, validado e enriquecido com 100% de conformidade com as regras de negócio.');
    return { status: 'Processado', reasons };
  }
}

// --- CENTRAL DATA PROCESSING ENGINE ---
export class DataProcessingEngine {
  static pipelineVersion = '1.0.0';
  static rulesVersion = '2.3';
  static normalizerVersion = '1.2';
  static enricherVersion = '1.1';

  /**
   * Main execute engine that coordinates independent modules sequentially.
   * Ensures that no data goes to the curation queue without passing this engine.
   */
  static processBatch(
    fileType: string,
    fileName: string,
    rawData: string,
    entity: RuleEntity = 'Cliente'
  ): ProcessingResult {
    const startTime = performance.now();
    const processing_id = `PRC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transformationLogs: TransformationLog[] = [];

    // Helper to collect transformation logs
    const addLog = (log: TransformationLog) => {
      transformationLogs.push(log);
    };

    // Stage 1: Parser
    const parsedRecords = ParserModule.parse(fileType, rawData);

    // Stage 2: Normalizer
    const normalizedRecords = NormalizerModule.normalize(parsedRecords, addLog);

    // Stage 3: Validator (evaluates using Catálogo Central de Regras)
    const validatedRecords = ValidatorModule.validate(normalizedRecords, entity);

    // Stage 4: Enricher (preserves original fields, adds automated metadata)
    const enrichedRecords = EnricherModule.enrich(validatedRecords, addLog);

    // Stage 5: Classifier
    const classification = ClassifierModule.classify(validatedRecords, enrichedRecords);

    const endTime = performance.now();
    const processing_time_ms = parseFloat((endTime - startTime).toFixed(2));

    // Calculate metrics
    let errors = 0;
    let warnings = 0;
    validatedRecords.forEach(res => {
      errors += res.errors.length;
      warnings += res.warnings.length;
    });

    const context: ProcessingContext = {
      processing_id,
      pipeline_version: this.pipelineVersion,
      rules_version: this.rulesVersion,
      normalizer_version: this.normalizerVersion,
      enricher_version: this.enricherVersion,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      processing_time_ms,
      records: enrichedRecords.length,
      errors,
      warnings
    };

    // Log the transaction in Central Audit Log
    SecurityService.logAction({
      module: 'Processamento',
      action: 'Motor de Ingestão e Processamento',
      result: errors > 0 ? 'Bloqueado' : 'Sucesso',
      description: `Lote [${fileName}] processado pelo Data Processing Engine v${this.pipelineVersion}. Status: ${classification.status}. Tempo de processamento: ${processing_time_ms}ms.`,
      affectedRecord: processing_id,
      recordCount: enrichedRecords.length
    });

    return {
      context,
      rawInput: { fileType, fileName, dataSize: rawData.length },
      parsedRecords,
      normalizedRecords,
      validatedRecords,
      enrichedRecords,
      transformationLogs,
      finalClassification: classification.status,
      classificationReasons: classification.reasons
    };
  }
}
