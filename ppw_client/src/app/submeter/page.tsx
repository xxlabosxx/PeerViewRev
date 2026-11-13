'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import Link from 'next/link';
import { useProfile } from '../../contexts/ProfileContext';
import PdfDropzone from '../../components/PdfDropzone';

export default function SubmeterArtigo() {
  const router = useRouter();
  const { role, userId } = useProfile();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dadosFormulario, setDadosFormulario] = useState({
    titulo: '',
    resumo: '',
  });
  const [arquivoAnonimizado, setArquivoAnonimizado] = useState<File | null>(null);
  const [arquivoIdentificado, setArquivoIdentificado] = useState<File | null>(null);

  useEffect(() => {
    if (role && role !== 'AUTOR') {
      router.push('/');
    }
  }, [role, router]);

  if (role !== 'AUTOR') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoAnonimizado) {
      setErro('Por favor, anexe o manuscrito anonimizado em PDF para os revisores.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const uploadAnon = await api.uploadPdf(arquivoAnonimizado, 'anonimizado');
      const uploadIdent = arquivoIdentificado
        ? await api.uploadPdf(arquivoIdentificado, 'identificado')
        : null;

      await api.submeterArtigo({
        titulo: dadosFormulario.titulo,
        resumo: dadosFormulario.resumo,
        autorId: userId,
        nomeArquivoManuscrito: uploadAnon.nomeArquivo,
        urlManuscrito: uploadAnon.url,
        nomeArquivoIdentificado: uploadIdent?.nomeArquivo,
        urlManuscritoIdentificado: uploadIdent?.url,
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
          <Link
            href="/"
            title="Voltar ao Dashboard"
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nova Submissão</h1>
            <p className="text-sm text-gray-500 mt-1">
              Submissão compatível com Double-Blind Review e limpeza automática de metadados PDF.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {erro && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm" role="alert">
              {erro}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Artigo <span aria-hidden="true">*</span>
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-black"
                value={dadosFormulario.titulo}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, titulo: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="resumo" className="block text-sm font-medium text-gray-700 mb-1">
                Resumo (Abstract) <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="resumo"
                name="resumo"
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none resize-y text-black"
                value={dadosFormulario.resumo}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, resumo: e.target.value })}
              />
            </div>

            <PdfDropzone
              id="pdf-anonimizado"
              label="Manuscrito Anonimizado (PDF Cego)"
              helperText="Versão sem nomes ou afiliações no texto. O servidor limpa automaticamente os metadados (Author/Creator) via pdf-lib antes de disponibilizar aos revisores."
              badgeText="Visível aos Revisores (Metadados Limpos)"
              badgeClassName="bg-emerald-50 text-emerald-700 border-emerald-200"
              file={arquivoAnonimizado}
              onFileChange={setArquivoAnonimizado}
              onError={setErro}
              required
            />

            <PdfDropzone
              id="pdf-identificado"
              label="Folha de Rosto / Versão Identificada (PDF)"
              helperText="Opcional: contém autores, afiliações e agradecimentos. Nunca é enviada aos revisores durante a avaliação."
              badgeText="Visível apenas ao Editor"
              badgeClassName="bg-purple-50 text-purple-700 border-purple-200"
              file={arquivoIdentificado}
              onFileChange={setArquivoIdentificado}
              onError={setErro}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={carregando}
              className={`bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${
                carregando ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
              }`}
            >
              {carregando ? 'Enviando e anonimizando PDF...' : 'Submeter Artigo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
