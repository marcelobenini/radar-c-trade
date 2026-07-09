/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Eye, EyeOff, Calendar, ChevronDown, Check, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  disabled,
  id,
  type = 'text',
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full rounded-lg border bg-slate-50/50 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none
            ${leftIcon ? 'pl-9' : 'pl-3.5'} pr-3.5
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500'}
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-400">{helperText}</span>}
    </div>
  );
}

// 2. Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  disabled,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        disabled={disabled}
        className={`w-full rounded-lg border bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none min-h-[100px] resize-y
          ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500'}
          disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-400">{helperText}</span>}
    </div>
  );
}

// 3. Search Input
export function SearchInput({ className = '', ...props }: Omit<InputProps, 'leftIcon'>) {
  return (
    <Input
      leftIcon={<Search className="h-4 w-4" />}
      className={className}
      {...props}
    />
  );
}

// 4. Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
  id?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  disabled,
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none rounded-lg border bg-slate-50/50 py-2 pl-3.5 pr-10 text-sm text-slate-900 transition-all duration-200 outline-none cursor-pointer
            ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500 focus:bg-white'}
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-400">{helperText}</span>}
    </div>
  );
}

// 5. MultiSelect (Mock visually with selections)
interface MultiSelectProps {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  id?: string;
}

export function MultiSelect({
  label,
  options,
  placeholder = 'Selecione as opções...',
  selectedValues,
  onChange,
  id,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = id || `multiselect-${Math.random().toString(36).substr(2, 9)}`;

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans relative">
      {label && (
        <span className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </span>
      )}
      <div
        id={selectId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[38px] flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm cursor-pointer hover:border-slate-300 focus-within:border-blue-500 focus-within:bg-white"
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          selectedValues.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(val);
                }}
              >
                {opt?.label || val}
                <X className="h-3 w-3 hover:text-blue-900 shrink-0" />
              </span>
            );
          })
        )}
        <div className="ml-auto text-slate-400 pl-1">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          {/* Menu */}
          <div className="absolute top-full left-0 z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-100 bg-white p-1 shadow-lg">
            {options.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-slate-50 ${
                    isChecked ? 'bg-blue-50/50 text-blue-900 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isChecked && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// 6. Autocomplete (Mock list based on input state)
interface AutocompleteProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
}

export function Autocomplete({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans relative">
      <Input
        label={label}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-100 bg-white p-1 shadow-lg">
          {filtered.map((item) => (
            <div
              key={item}
              onClick={() => {
                onChange(item);
                setIsOpen(false);
              }}
              className="px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-slate-50 text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 7. Password
export function PasswordInput({ label, error, helperText, ...props }: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex flex-col gap-1.5 w-full font-sans">
      <Input
        label={label}
        error={error}
        helperText={helperText}
        type={show ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-[32px] text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    </div>
  );
}

// 8. Date Picker visual
export function DatePicker({ label, ...props }: InputProps) {
  return (
    <Input
      label={label}
      type="date"
      leftIcon={<Calendar className="h-4 w-4" />}
      {...props}
    />
  );
}
