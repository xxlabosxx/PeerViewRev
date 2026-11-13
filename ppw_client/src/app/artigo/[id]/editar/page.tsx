'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../services/api';
import Link from 'next/link';
import { useProfile } from '../../../../contexts/ProfileContext';
import PdfDropzone from '../../../../components/PdfDropzone';

export default function EditarArtigo() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const artigoId = params?.id;
  const { role, userId } = useProfile();

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dadosFormulario, setDadosFormulario] = useState({
    titulo: '',
    resumo: '',
    nomeArquivoAtual: '',
    urlManuscritoAtual: '',
    nomeIdentificadoAtual: '',
    urlIdentificadoAtual: '',
  });

  const [novoArquivoAnonimizado, setNovoArquivoAnonimizado] = useState<File | null>(null);
  const [novoArquivoIdentificado, setNovoArquivoIdentificado] = useState<File | null>(null);

  useEffect(() => {
    if (role && role !== 'AUTOR' && role !== 'EDITOR') {
      router.push('/');
    }
  }, [role, router]);

  useEffect(() => {
    if (!artigoId || !role) return;

    const carregarArtigo = async () => {
      try {
        setCarregandoDados(true);
        const artigo = await api.getArtigoPorId(artigoId, { userId, role });
        setDadosFormulario({
          titulo: artigo.titulo || '',
          resumo: artigo.resumo || '',
          nomeArquivoAtual: artigo.nomeArquivoManuscrito || '',
          urlManuscritoAtual: artigo.urlManuscrito || '',
          nomeIdentificadoAtual: artigo.nomeArquivoIdentificado || '',
          urlIdentificadoAtual: artigo.urlManuscritoIdentificado || '',
        });
      } catch (err: any) {
        setErro(err.message || 'Não foi possível carregar os dados do artigo.');
      } finally {
        setCarregandoDados(false);
      }
    };

    carregarArtigo();
  }, [artigoId, userId, role]);

  if (role !== 'AUTOR' && role !== 'EDITOR') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artigoId) return;

    setSalvando(true);
    setErro(null);

    try {
      const payload: {
        titulo: string;
        resumo: string;
        nomeArquivoManuscrito?: string;
        urlManuscrito?: string;
        nomeArquivoIdentificado?: string;
        urlManuscritoIdentificado?: string;
      } = {
        titulo: dadosFormulario.titulo,
        resumo: dadosFormulario.resumo,
      };

      if (novoArquivoAnonimizado) {
        const uploadAnon = await api.uploadPdf(novoArquivoAnonimizado, 'anonimizado');
        payload.nomeArquivoManuscrito = uploadAnon.nomeArquivo;
        payload.urlManuscrito = uploadAnon.url;
      }

      if (novoArquivoIdentificado) {
        const uploadIdent = await api.uploadPdf(novoArquivoIdentificado, 'identificado');
        payload.nomeArquivoIdentificado = uploadIdent.nomeArquivo;
        payload.urlManuscritoIdentificado = uploadIdent.url;
      }

      await api.alterarArtigo(artigoId, payload);
      router.push('/');
    } catch (err: any) {
      setErro(err.message || 'Erro ao alterar artigo. Tente novamente.');
      setSalvando(false);
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Alterar Artigo</h1>
            <p className="text-sm text-gray-500 mt-1">
              Atualize as informações ou substitua as versões do manuscrito em PDF.
            </p>
          </div>
        </header>

        {carregandoDados ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 flex justify-center items-center shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
          </div>
        ) : (
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
                id="file-upload-anonimizado"
                label="Manuscrito Anonimizado (PDF Cego)"
                helperText="Envie outro arquivo apenas se desejar substituir a versão anonimizada enviada aos revisores."
                badgeText="Metadados Limpos"
                badgeClassName="bg-emerald-50 text-emerald-700 border-emerald-200"
                file={novoArquivoAnonimizado}
                onFileChange={setNovoArquivoAnonimizado}
                onError={setErro}
                currentFileName={dadosFormulario.nomeArquivoAtual}
                currentFileUrl={dadosFormulario.urlManuscritoAtual}
              />

              <PdfDropzone
                id="file-upload-identificado"
                label="Folha de Rosto / Versão Identificada (PDF)"
                helperText="Envie ou substitua o PDF identificado (acessível apenas ao Editor)."
                badgeText="Visível apenas ao Editor"
                badgeClassName="bg-purple-50 text-purple-700 border-purple-200"
                file={novoArquivoIdentificado}
                onFileChange={setNovoArquivoIdentificado}
                onError={setErro}
                currentFileName={dadosFormulario.nomeIdentificadoAtual}
                currentFileUrl={dadosFormulario.urlIdentificadoAtual}
              />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando}
                className={`bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  salvando ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

