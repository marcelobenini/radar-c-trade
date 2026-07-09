/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, X, ArrowUpDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableMultiSelectProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function SearchableMultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Selecione...',
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'asc' | 'desc' | 'none'>('none');

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleSelectAll = () => {
    const allValues = options.map(o => o.value);
    onChange(allValues);
  };

  const filteredAndSortedOptions = useMemo(() => {
    let result = options.filter(o => 
      o.label.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'asc') {
      result = [...result].sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortBy === 'desc') {
      result = [...result].sort((a, b) => b.label.localeCompare(a.label));
    }

    return result;
  }, [options, search, sortBy]);

  const toggleSort = () => {
    setSortBy(current => {
      if (current === 'none') return 'asc';
      if (current === 'asc') return 'desc';
      return 'none';
    });
  };

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans relative">
      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
        {label}
      </span>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[38px] flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs cursor-pointer hover:border-slate-300 focus-within:border-blue-500 focus-within:bg-white transition-all"
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1 max-w-[90%]">
            {selectedValues.slice(0, 2).map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(val);
                  }}
                >
                  {opt?.label || val}
                  <X className="h-2.5 w-2.5 hover:text-blue-900 shrink-0" />
                </span>
              );
            })}
            {selectedValues.length > 2 && (
              <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                +{selectedValues.length - 2}
              </span>
            )}
          </div>
        )}
        <div className="ml-auto text-slate-400 pl-1 flex items-center gap-1 shrink-0">
          {selectedValues.length > 0 && (
            <X className="h-3 w-3 hover:text-rose-600" onClick={handleClear} />
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg flex flex-col">
            {/* Search and Sort bar */}
            <div className="p-2 border-b border-slate-100 flex items-center gap-1 bg-slate-50">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSort();
                }}
                className={`p-1.5 rounded border transition-colors shrink-0 ${
                  sortBy !== 'none' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title={sortBy === 'asc' ? 'Ordenando A-Z' : sortBy === 'desc' ? 'Ordenando Z-A' : 'Ordenar A-Z'}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-1.5 border-b border-slate-100 flex justify-between text-[10px] font-bold text-slate-500 bg-slate-50/50">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
                className="hover:text-blue-600 px-1"
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="hover:text-rose-600 px-1"
              >
                Limpar Seleção
              </button>
            </div>

            {/* Options list */}
            <div className="overflow-y-auto flex-1 max-h-40 p-1">
              {filteredAndSortedOptions.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs font-medium">
                  Nenhuma opção encontrada
                </div>
              ) : (
                filteredAndSortedOptions.map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(opt.value);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-blue-50/50 text-blue-900 font-bold' : 'text-slate-600'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
