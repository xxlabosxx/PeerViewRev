'use client';

import { useEffect, useMemo, useState } from 'react';

interface PdfDropzoneProps {
  id: string;
  label: string;
  helperText: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError: (message: string | null) => void;
  currentFileName?: string;
  currentFileUrl?: string;
  required?: boolean;
  badgeText?: string;
  badgeClassName?: string;
}

export default function PdfDropzone({
  id,
  label,
  helperText,
  file,
  onFileChange,
  onError,
  currentFileName,
  currentFileUrl,
  required = false,
  badgeText,
  badgeClassName = 'bg-blue-50 text-blue-700 border-blue-200',
}: PdfDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSetFile = (selected: File | undefined) => {
    if (!selected) return;
    const isPdf =
      selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      onError('Por favor, envie apenas arquivos PDF.');
      return;
    }
    onFileChange(selected);
    onError(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label} {required && <span aria-hidden="true">*</span>}
        </label>
        {badgeText && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeClassName}`}>
            {badgeText}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2">{helperText}</p>

      {currentFileName && !file && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-sm text-gray-700">
          <span>
            <strong className="text-gray-900">Arquivo atual:</strong> {currentFileName}
          </span>
          {currentFileUrl && (
            <a
              href={currentFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
            >
              Abrir PDF atual
            </a>
          )}
        </div>
      )}

      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        } border-dashed rounded-lg hover:border-gray-400 transition-colors`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          validateAndSetFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="space-y-1 text-center w-full">
          {!file ? (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor={id}
                  className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1"
                >
                  <span>Selecione um arquivo</span>
                  <input
                    id={id}
                    name={id}
                    type="file"
                    className="sr-only"
                    accept=".pdf,application/pdf"
                    onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                  />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500">PDF de até 10MB</p>
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-3 px-2">
                <p className="text-sm font-semibold text-green-600">Selecionado: {file.name}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFileChange(null);
                    const fileInput = document.getElementById(id) as HTMLInputElement | null;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 border border-red-200 rounded-full hover:bg-red-50 transition-colors shrink-0"
                  title="Remover PDF"
                  aria-label="Remover PDF"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[360px] border border-gray-300 rounded-md"
                  title={`Pré-visualização de ${label}`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
