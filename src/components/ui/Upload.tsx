/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import Button from './Button';

export type UploadState = 'idle' | 'dragging' | 'uploading' | 'completed' | 'error';

interface UploadProps {
  id?: string;
  onFileSelect?: (file: File) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export default function Upload({
  id,
  onFileSelect,
  acceptedTypes = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
}: UploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper size formatter
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Drag listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      setUploadState('dragging');
    } else if (e.type === "dragleave") {
      setDragActive(false);
      setUploadState('idle');
    }
  };

  // Drop listener
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    } else {
      setUploadState('idle');
    }
  };

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Process File and Simulate upload pipeline
  const processSelectedFile = (file: File) => {
    const isAccepted = acceptedTypes.split(',').some((type) => {
      const extension = type.trim().toLowerCase();
      return file.name.toLowerCase().endsWith(extension);
    });

    if (!isAccepted) {
      setErrorMessage(`Tipo de arquivo não permitido. Use: ${acceptedTypes}`);
      setUploadState('error');
      return;
    }

    const sizeLimit = maxSizeMB * 1024 * 1024;
    if (file.size > sizeLimit) {
      setErrorMessage(`O tamanho do arquivo excede o limite de ${maxSizeMB}MB.`);
      setUploadState('error');
      return;
    }

    setFileName(file.name);
    setFileSizeStr(formatBytes(file.size));
    setErrorMessage(null);
    setUploadState('uploading');

    // Simulate upload delay
    setTimeout(() => {
      setUploadState('completed');
      if (onFileSelect) onFileSelect(file);
    }, 2000);
  };

  // Reset upload
  const resetUpload = () => {
    setUploadState('idle');
    setFileName(null);
    setFileSizeStr(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Button triggers input
  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id={id} className="w-full font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full rounded-2xl border-2 border-dashed p-8 transition-all duration-300 flex flex-col items-center justify-center text-center select-none min-h-[220px] relative overflow-hidden
          ${
            uploadState === 'dragging'
              ? 'border-blue-600 bg-blue-50/20 scale-[1.01]'
              : uploadState === 'uploading'
              ? 'border-slate-200 bg-slate-50/50'
              : uploadState === 'completed'
              ? 'border-emerald-200 bg-emerald-50/10'
              : uploadState === 'error'
              ? 'border-rose-200 bg-rose-50/10'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }
        `}
      >
        {/* State Content Router */}
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm shadow-blue-500/5">
              <UploadCloud className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">
              Faça upload do cardápio do restaurante
            </h4>
            <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
              Arraste e solte o arquivo aqui, ou <span onClick={triggerInput} className="text-blue-600 font-semibold hover:underline cursor-pointer">procure no seu dispositivo</span>
            </p>
            <span className="mt-4 text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
              Aceitos: PDF, PNG, JPG (Max {maxSizeMB}MB)
            </span>
          </div>
        )}

        {uploadState === 'dragging' && (
          <div className="flex flex-col items-center animate-pulse pointer-events-none">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 scale-110 transition-transform">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-extrabold text-blue-900">
              Solte para enviar o arquivo
            </h4>
            <p className="mt-1 text-xs text-blue-500 font-medium">
              Detectamos o documento estrategicamente!
            </p>
          </div>
        )}

        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center w-full max-w-xs">
            <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-4 animate-spin">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Carregando documento...
            </h4>
            <p className="mt-1 text-xs text-slate-400 truncate w-full px-4">
              Preparando {fileName} ({fileSizeStr})
            </p>
            
            {/* Visual Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
            </div>
          </div>
        )}

        {uploadState === 'completed' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm shadow-emerald-500/5">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-900 tracking-tight">
              Cardápio carregado com sucesso!
            </h4>
            <div className="mt-1.5 flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[180px]">{fileName}</span>
              <span className="text-[10px] text-slate-400 font-normal">({fileSizeStr})</span>
            </div>
            
            <div className="mt-5 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={resetUpload} leftIcon={<RefreshCw className="h-3 w-3" />}>
                Substituir
              </Button>
            </div>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-rose-900">
              Falha ao carregar o arquivo
            </h4>
            <p className="mt-1 text-xs text-rose-500 font-semibold max-w-sm leading-relaxed px-4">
              {errorMessage || 'Ocorreu um erro inesperado durante a validação.'}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <Button size="sm" variant="danger" onClick={resetUpload} leftIcon={<RefreshCw className="h-3 w-3" />}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
