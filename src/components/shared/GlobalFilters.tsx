/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Search, Eraser, Filter, MapPin, Users, Tag, Briefcase, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import SearchableMultiSelect from './SearchableMultiSelect';
import { REAL_CLIENTS, REAL_PRODUCTS } from '../../data/realData';

export interface SessionFilters {
  estados: string[];
  cidades: string[];
  regionais: string[];
  rcas: string[];
  categorias: string[];
  produtos: string[];
  marcas: string[];
  segmentos: string[];
  statuses: string[];
  scoreComercial: string;
  scoreFit: string;
  cidade: string;
  cliente: string;
  periodoOption: string;
  dataInicio: string;
  dataFim: string;
}

interface GlobalFiltersProps {
  sessionFilters: SessionFilters;
  setSessionFilters: React.Dispatch<React.SetStateAction<SessionFilters>>;
}

export const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre (AC)' },
  { value: 'AL', label: 'Alagoas (AL)' },
  { value: 'AP', label: 'Amapá (AP)' },
  { value: 'AM', label: 'Amazonas (AM)' },
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'DF', label: 'Distrito Federal (DF)' },
  { value: 'ES', label: 'Espírito Santo (ES)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'MT', label: 'Mato Grosso (MT)' },
  { value: 'MS', label: 'Mato Grosso do Sul (MS)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'PA', label: 'Pará (PA)' },
  { value: 'PB', label: 'Paraíba (PB)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'PI', label: 'Piauí (PI)' },
  { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
  { value: 'RN', label: 'Rio Grande do Norte (RN)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'RO', label: 'Rondônia (RO)' },
  { value: 'RR', label: 'Roraima (RR)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'SP', label: 'São Paulo (SP)' },
  { value: 'SE', label: 'Sergipe (SE)' },
  { value: 'TO', label: 'Tocantins (TO)' },
];

export const INITIAL_FILTERS: SessionFilters = {
  estados: [],
  cidades: [],
  regionais: [],
  rcas: [],
  categorias: [],
  produtos: [],
  marcas: [],
  segmentos: [],
  statuses: [],
  scoreComercial: 'all',
  scoreFit: 'all',
  cidade: '',
  cliente: '',
  periodoOption: '30',
  dataInicio: '',
  dataFim: ''
};

// Global helper to check score ranges in filtering logic
export function matchesScoreRange(score: number, filterValue: string): boolean {
  if (!filterValue || filterValue === 'all') return true;
  if (filterValue === '0-20') return score >= 0 && score <= 20;
  if (filterValue === '21-40') return score >= 21 && score <= 40;
  if (filterValue === '41-60') return score >= 41 && score <= 60;
  if (filterValue === '61-80') return score >= 61 && score <= 80;
  if (filterValue === '81-100') return score >= 81 && score <= 100;
  return true;
}

export default function GlobalFilters({ sessionFilters, setSessionFilters }: GlobalFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Load RCAs dynamically from localStorage (fallback is the same across the application)
  const rcas = useMemo(() => {
    const saved = localStorage.getItem('ctrade_rcas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'rca-marcelo', name: 'RCA Marcelo Baquero', regionalId: 'reg-sudeste', active: true },
      { id: 'rca-amanda', name: 'RCA Amanda Souza', regionalId: 'reg-sul', active: true },
      { id: 'rca-pedro', name: 'RCA Pedro Santos', regionalId: 'reg-nordeste', active: true },
      { id: 'rca-lucas', name: 'RCA Lucas Oliveira', regionalId: 'reg-centro-oeste', active: true },
    ];
  }, []);

  // Compute dynamic state-city relationship
  const availableCitiesAndStates = useMemo(() => {
    const list = REAL_CLIENTS.map(c => ({ city: c.city, state: c.state }));
    const defaults = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Campinas', state: 'SP' },
      { city: 'Santos', state: 'SP' },
      { city: 'Ribeirão Preto', state: 'SP' },
      { city: 'Sorocaba', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Niterói', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Uberlândia', state: 'MG' },
      { city: 'Curitiba', state: 'PR' },
      { city: 'Porto Alegre', state: 'RS' },
      { city: 'Florianópolis', state: 'SC' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Recife', state: 'PE' },
      { city: 'Fortaleza', state: 'CE' },
      { city: 'Goiânia', state: 'GO' },
      { city: 'Brasília', state: 'DF' }
    ];
    const combined = [...list, ...defaults];
    const unique: { [key: string]: string } = {};
    combined.forEach(item => {
      if (item.city && item.state) {
        unique[item.city.trim()] = item.state.trim().toUpperCase();
      }
    });
    return Object.entries(unique).map(([city, state]) => ({ city, state }));
  }, []);

  const cidadeOptions = useMemo(() => {
    let filtered = availableCitiesAndStates;
    if (sessionFilters.estados && sessionFilters.estados.length > 0) {
      filtered = availableCitiesAndStates.filter(item => 
        sessionFilters.estados.includes(item.state)
      );
    }
    return filtered
      .map(item => ({ value: item.city, label: `${item.city} (${item.state})` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [availableCitiesAndStates, sessionFilters.estados]);

  // Load official C-Trade categories from product database
  const categoriesOptions = useMemo(() => {
    const fromProducts = Array.from(new Set(REAL_PRODUCTS.map(p => p.category))).filter(Boolean).sort();
    return fromProducts.map(c => ({ value: c, label: c }));
  }, []);

  // Dependente: Ao escolher uma Categoria, listar apenas as Marcas que possuem produtos naquela categoria.
  const marcasOptions = useMemo(() => {
    let filteredProducts = REAL_PRODUCTS;
    if (sessionFilters.categorias && sessionFilters.categorias.length > 0) {
      filteredProducts = REAL_PRODUCTS.filter(p => sessionFilters.categorias.includes(p.category));
    }
    const brands = Array.from(new Set(filteredProducts.map(p => p.brand))).filter(Boolean).sort();
    return brands.map(b => ({ value: b, label: b }));
  }, [sessionFilters.categorias]);

  // Dependente: Ao escolher uma Marca, listar apenas os Produtos pertencentes àquela Marca e Categoria.
  const productsOptions = useMemo(() => {
    let filteredProducts = REAL_PRODUCTS;
    if (sessionFilters.categorias && sessionFilters.categorias.length > 0) {
      filteredProducts = filteredProducts.filter(p => sessionFilters.categorias.includes(p.category));
    }
    if (sessionFilters.marcas && sessionFilters.marcas.length > 0) {
      filteredProducts = filteredProducts.filter(p => sessionFilters.marcas.includes(p.brand));
    }
    const names = Array.from(new Set(filteredProducts.map(p => p.name))).filter(Boolean).sort();
    return names.map(p => ({ value: p, label: p }));
  }, [sessionFilters.categorias, sessionFilters.marcas]);

  // Segment options
  const segmentsOptions = useMemo(() => {
    const fromClients = Array.from(new Set(REAL_CLIENTS.map(c => c.segment))).filter(Boolean);
    const defaults = ['Italiano', 'Pizzaria', 'Hotel', 'Resort', 'Casual Dining', 'Fino', 'Bistrô', 'Trattoria'];
    const combined = Array.from(new Set([...fromClients, ...defaults])).sort();
    return combined.map(s => ({ value: s, label: s }));
  }, []);

  // Check if any filter is currently applied
  const hasActiveFilters = useMemo(() => {
    return (
      sessionFilters.estados.length > 0 ||
      sessionFilters.cidades.length > 0 ||
      sessionFilters.rcas.length > 0 ||
      sessionFilters.categorias.length > 0 ||
      sessionFilters.marcas.length > 0 ||
      sessionFilters.produtos.length > 0 ||
      sessionFilters.segmentos.length > 0 ||
      sessionFilters.statuses.length > 0 ||
      sessionFilters.scoreComercial !== 'all' ||
      sessionFilters.scoreFit !== 'all' ||
      sessionFilters.cliente !== '' ||
      sessionFilters.periodoOption !== '30' ||
      sessionFilters.dataInicio !== '' ||
      sessionFilters.dataFim !== ''
    );
  }, [sessionFilters]);

  const handleClearFilters = () => {
    setSessionFilters(INITIAL_FILTERS);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 mb-6 overflow-hidden transition-all duration-200" id="global-filters-container">
      {/* Header section */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-900/10 text-blue-900 rounded-lg">
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sistema Global de Filtros</h3>
            <p className="text-[11px] text-slate-500 font-medium">Configure e filtre dados de toda a plataforma instantaneamente</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Eraser className="h-3.5 w-3.5" />
              Limpar Filtros
            </button>
          )}
          <span className="text-slate-400 hover:text-slate-600">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </div>

      {/* Filter items */}
      {isOpen && (
        <div className="p-5 space-y-5 animate-fadeIn">
          {/* 1. PERÍODO */}
          <div className="pb-4 border-b border-slate-100" id="filter-group-periodo">
            <div className="flex items-center gap-1.5 mb-2 text-slate-700">
              <Calendar className="h-4 w-4 text-blue-900 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                1. Período de Análise
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex bg-slate-100/80 border border-slate-200 rounded-lg p-1 shrink-0 self-start sm:self-auto">
                {(['7', '15', '30', 'custom'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSessionFilters(prev => ({ 
                      ...prev, 
                      periodoOption: opt, 
                      dataInicio: opt === 'custom' ? prev.dataInicio : '', 
                      dataFim: opt === 'custom' ? prev.dataFim : '' 
                    }))}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      sessionFilters.periodoOption === opt
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {opt === '7' && 'Últimos 7 dias'}
                    {opt === '15' && 'Últimos 15 dias'}
                    {opt === '30' && 'Últimos 30 dias'}
                    {opt === 'custom' && 'Personalizado'}
                  </button>
                ))}
              </div>

              {sessionFilters.periodoOption === 'custom' && (
                <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">De:</span>
                    <input
                      type="date"
                      value={sessionFilters.dataInicio || ''}
                      onChange={(e) => setSessionFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden hover:bg-slate-50 transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Até:</span>
                    <input
                      type="date"
                      value={sessionFilters.dataFim || ''}
                      onChange={(e) => setSessionFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden hover:bg-slate-50 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form grid for the remaining 11 filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4" id="filters-main-grid">
            
            {/* 2. ESTADO */}
            <SearchableMultiSelect
              label="2. Estado (UF)"
              options={ESTADOS_BRASILEIROS}
              selectedValues={sessionFilters.estados}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, estados: vals, cidades: [] }))}
              placeholder="Todos os Estados..."
            />

            {/* 3. CIDADE */}
            <SearchableMultiSelect
              label="3. Cidade"
              options={cidadeOptions}
              selectedValues={sessionFilters.cidades}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, cidades: vals }))}
              placeholder="Selecionar Cidades..."
            />

            {/* 4. RCA */}
            <SearchableMultiSelect
              label="4. RCA"
              options={rcas.map((r: any) => ({ value: r.id, label: r.name + (r.active ? '' : ' (Inativo)') }))}
              selectedValues={sessionFilters.rcas}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, rcas: vals }))}
              placeholder="Selecionar RCAs..."
            />

            {/* 5. CATEGORIA */}
            <SearchableMultiSelect
              label="5. Categoria"
              options={categoriesOptions}
              selectedValues={sessionFilters.categorias}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, categorias: vals, marcas: [], produtos: [] }))}
              placeholder="Selecionar Categorias..."
            />

            {/* 6. MARCA */}
            <SearchableMultiSelect
              label="6. Marca"
              options={marcasOptions}
              selectedValues={sessionFilters.marcas}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, marcas: vals, produtos: [] }))}
              placeholder="Selecionar Marcas..."
            />

            {/* 7. PRODUTO */}
            <SearchableMultiSelect
              label="7. Produto (SKU)"
              options={productsOptions}
              selectedValues={sessionFilters.produtos}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, produtos: vals }))}
              placeholder="Selecionar SKUs..."
            />

            {/* 8. SEGMENTO */}
            <SearchableMultiSelect
              label="8. Segmento"
              options={segmentsOptions}
              selectedValues={sessionFilters.segmentos}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, segmentos: vals }))}
              placeholder="Selecionar Segmentos..."
            />

            {/* 9. STATUS */}
            <SearchableMultiSelect
              label="9. Status"
              options={[
                { value: 'Entradas', label: 'Entradas' },
                { value: 'Autorizados', label: 'Autorizados' },
                { value: 'Rejeitados', label: 'Rejeitados' }
              ]}
              selectedValues={sessionFilters.statuses}
              onChange={(vals) => setSessionFilters(prev => ({ ...prev, statuses: vals }))}
              placeholder="Selecionar Status..."
            />

            {/* 10. SCORE COMERCIAL */}
            <div className="flex flex-col gap-1.5" id="filter-score-comercial">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">10. Score Comercial</span>
              <select
                value={sessionFilters.scoreComercial}
                onChange={(e) => setSessionFilters(prev => ({ ...prev, scoreComercial: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="all">Todos os Scores</option>
                <option value="0-20">0 – 20</option>
                <option value="21-40">21 – 40</option>
                <option value="41-60">41 – 60</option>
                <option value="61-80">61 – 80</option>
                <option value="81-100">81 – 100</option>
              </select>
            </div>

            {/* 11. SCORE DE FIT */}
            <div className="flex flex-col gap-1.5" id="filter-score-fit">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">11. Score de Fit</span>
              <select
                value={sessionFilters.scoreFit}
                onChange={(e) => setSessionFilters(prev => ({ ...prev, scoreFit: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="all">Todos os Scores</option>
                <option value="0-20">0 – 20</option>
                <option value="21-40">21 – 40</option>
                <option value="41-60">41 – 60</option>
                <option value="61-80">61 – 80</option>
                <option value="81-100">81 – 100</option>
              </select>
            </div>

            {/* 12. CLIENTE */}
            <div className="flex flex-col gap-1.5" id="filter-cliente">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">12. Cliente</span>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar cliente por nome..."
                  value={sessionFilters.cliente}
                  onChange={(e) => setSessionFilters(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
