'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import Link from 'next/link';
import { useProfile } from '../../contexts/ProfileContext';

export default function SubmeterArtigo() {
  const router = useRouter();
  const { role, userId } = useProfile();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dadosFormulario, setDadosFormulario] = useState({
    titulo: '',
    resumo: '',
  });
  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (role && role !== 'AUTOR') {
      router.push('/');
    }
  }, [role, router]);

  useEffect(() => {
    if (arquivoPdf) {
      const url = URL.createObjectURL(arquivoPdf);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [arquivoPdf]);

  if (role !== 'AUTOR') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoPdf) {
      setErro('Por favor, anexe o manuscrito em PDF.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const urlSimulada = `https://exemplo.com/uploads/manuscrito_simulado_${Date.now()}.pdf`;

      const idAutorFicticio = userId;

      await api.submeterArtigo({
        titulo: dadosFormulario.titulo,
        resumo: dadosFormulario.resumo,
        autorId: idAutorFicticio,
        nomeArquivoManuscrito: arquivoPdf.name,
        urlManuscrito: urlSimulada,
      });

      window.location.href = '/';
    } catch (err: any) {
      setErro(err.message || 'Erro ao submeter artigo. Tente novamente.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <Link href="/" title="Voltar ao Dashboard" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nova Submissão</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {erro && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Artigo *
              </label>
              <input
                id="titulo"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-black"
                value={dadosFormulario.titulo}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, titulo: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="resumo" className="block text-sm font-medium text-gray-700 mb-1">
                Resumo (Abstract) *
              </label>
              <textarea
                id="resumo"
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none resize-y text-black"
                value={dadosFormulario.resumo}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, resumo: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 mb-1">
                Manuscrito (Apenas PDF) *
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} border-dashed rounded-lg hover:border-gray-400 transition-colors`}
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
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type === 'application/pdf') {
                    setArquivoPdf(file);
                    setErro(null);
                  } else if (file) {
                    setErro('Por favor, envie apenas arquivos PDF.');
                  }
                }}
              >
                <div className="space-y-1 text-center">
                  {!arquivoPdf ? (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1">
                          <span>Selecione um arquivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setArquivoPdf(file);
                                setErro(null);
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF de até 10MB
                      </p>
                    </>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-3 px-2">
                        <p className="text-sm font-semibold text-green-600">
                          Selecionado: {arquivoPdf.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setArquivoPdf(null);
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 border border-red-200 rounded-full hover:bg-red-50 transition-colors shrink-0"
                          title="Remover PDF"
                          aria-label="Remover PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {previewUrl && (
                        <iframe
                          src={previewUrl}
                          className="w-full h-[500px] border border-gray-300 rounded-md"
                          title="Pré-visualização do PDF"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={carregando}
              className={`bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${carregando ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            >
              {carregando ? 'Submetendo...' : 'Submeter Artigo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
