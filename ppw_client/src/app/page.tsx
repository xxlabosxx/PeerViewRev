'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Artigo, RevisorDetalhe, UsuarioItem } from '../services/api';
import { useProfile } from '../contexts/ProfileContext';

function normalizarInstituicao(valor?: string): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function Dashboard() {
  const { role, userId } = useProfile();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [revisores, setRevisores] = useState<UsuarioItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedArtigoId, setSelectedArtigoId] = useState<string | null>(null);
  const [selectedRevisoresIds, setSelectedRevisoresIds] = useState<string[]>([]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ nota: 0, comentarios: '', estaAprovado: false });

  const [isDecideModalOpen, setIsDecideModalOpen] = useState(false);
  const [decideStatus, setDecideStatus] = useState<'ACEITO' | 'REJEITADO'>('ACEITO');
  const [decideJustificativa, setDecideJustificativa] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [artigoParaExcluir, setArtigoParaExcluir] = useState<Artigo | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const buscarRevisores = useCallback(async () => {
    try {
      const data = await api.getRevisores();
      setRevisores(data);
    } catch (error) {
      console.error('Erro ao buscar revisores:', error);
    }
  }, []);

  const buscarArtigos = useCallback(async () => {
    try {
      const data = await api.getArtigos({ userId, role });
      setArtigos(data);
    } catch (error: unknown) {
      console.error('Erro ao buscar artigos:', error);
      setArtigos([]);
    } finally {
      setCarregando(false);
    }
  }, [role, userId]);

  useEffect(() => {
    let ativo = true;
    const carregarDados = async () => {
      if (role === 'EDITOR') {
        await buscarRevisores();
      } else if (ativo) {
        setRevisores([]);
      }
      await buscarArtigos();
    };
    void carregarDados();
    return () => {
      ativo = false;
    };
  }, [role, buscarRevisores, buscarArtigos]);

  const showMessage = (msg: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleAssumirArtigo = async (artigoId: string) => {
    try {
      await api.assumirArtigo(artigoId, userId);
      showMessage('Artigo assumido com sucesso!', 'success');
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao assumir artigo'), 'error');
    }
  };

  const handleAbandonarArtigo = async (artigoId: string) => {
    try {
      await api.abandonarArtigo(artigoId);
      showMessage('Artigo abandonado!', 'success');
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao abandonar artigo'), 'error');
    }
  };

  const handleDesatribuirRevisor = async (artigoId: string, revisorId: string) => {
    try {
      await api.desatribuirRevisor(artigoId, revisorId);
      showMessage('Revisor desatribuído!', 'success');
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao desatribuir revisor'), 'error');
    }
  };

  const openAssignModal = (artigoId: string) => {
    setSelectedArtigoId(artigoId);
    setSelectedRevisoresIds([]);
    setIsAssignModalOpen(true);
  };

  const handleAssignReviewer = async () => {
    if (!selectedArtigoId || selectedRevisoresIds.length === 0) return;
    try {
      await Promise.all(selectedRevisoresIds.map(revisorId => 
        api.atribuirRevisor({ artigoId: selectedArtigoId, revisorId })
      ));
      showMessage('Revisores atribuídos com sucesso!', 'success');
      setIsAssignModalOpen(false);
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao atribuir'), 'error');
    }
  };

  const openDecideModal = (artigoId: string) => {
    setSelectedArtigoId(artigoId);
    setDecideStatus('ACEITO');
    setDecideJustificativa('');
    setIsDecideModalOpen(true);
  };

  const handleDecideStatus = async () => {
    if (!selectedArtigoId) return;
    try {
      await api.decidirStatus(
        selectedArtigoId,
        decideStatus,
        decideJustificativa.trim() || undefined,
      );
      showMessage('Status decidido e AuditLog gravado em transação ACID!', 'success');
      setIsDecideModalOpen(false);
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao decidir status'), 'error');
    }
  };

  const handlePublicarArtigo = async (artigoId: string) => {
    try {
      await api.publicarArtigo(artigoId);
      showMessage('Artigo publicado! Identidades reveladas.', 'success');
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao publicar artigo'), 'error');
    }
  };

  const openDeleteModal = (artigo: Artigo) => {
    setArtigoParaExcluir(artigo);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteArtigo = async () => {
    if (!artigoParaExcluir) return;
    try {
      await api.excluirArtigo(artigoParaExcluir.id);
      showMessage('Artigo excluído com sucesso!', 'success');
      setIsDeleteModalOpen(false);
      setArtigoParaExcluir(null);
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao excluir artigo'), 'error');
    }
  };

  const openReviewModal = (artigoId: string) => {
    setSelectedArtigoId(artigoId);
    const artigo = artigos.find(a => a.id === artigoId);
    const existingReview = artigo?.revisoes.find(r => r.revisorId === userId);
    
    if (existingReview) {
      setReviewData({ 
        nota: existingReview.nota, 
        comentarios: existingReview.comentarios, 
        estaAprovado: existingReview.estaAprovado 
      });
    } else {
      setReviewData({ nota: 5, comentarios: '', estaAprovado: true });
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedArtigoId) return;
    try {
      await api.submeterRevisao({
        artigoId: selectedArtigoId,
        revisorId: userId,
        nota: Number(reviewData.nota),
        comentarios: reviewData.comentarios,
        estaAprovado: reviewData.estaAprovado
      });
      showMessage('Revisão submetida com sucesso!', 'success');
      setIsReviewModalOpen(false);
      buscarArtigos();
    } catch (err: unknown) {
      showMessage(getErrorMessage(err, 'Erro ao submeter revisão'), 'error');
    }
  };

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium">Pendente</span>;
      case 'EM_REVISAO':
        return <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium">Em Revisão</span>;
      case 'ACEITO':
        return <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">Aceito</span>;
      case 'PUBLICADO':
        return <span className="px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">Publicado</span>;
      case 'REJEITADO':
        return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">Rejeitado</span>;
      default:
        return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {errorMsg && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-all">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-all">
          {successMsg}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard de Artigos</h1>
          </div>
          {role === 'AUTOR' && (
            <Link 
              href="/submeter" 
              className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-lg transition-colors inline-block shadow-sm"
            >
              Nova Submissão
            </Link>
          )}
        </header>

        {carregando ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
          </div>
        ) : !artigos || artigos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Não tem artigos disponíveis</h3>
            <p className="text-gray-500">
              {role === 'NEUTRO'
                ? 'Faça login para submeter ou avaliar artigos. Apenas artigos publicados aparecem na vitrine pública.'
                : 'Ainda não existem artigos disponíveis para o seu perfil.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {artigos.map((artigo) => {
              const jaRevisadoPorMim = role === 'REVISOR' && artigo.revisoes.some(r => r.revisorId === userId);
              const ehAutorDoArtigo = role === 'AUTOR' && artigo.autorId === userId;
              const statusFinalOuPublicado =
                artigo.status === 'ACEITO' ||
                artigo.status === 'REJEITADO' ||
                artigo.status === 'PUBLICADO';

              return (
              <div key={artigo.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{artigo.titulo}</h2>
                    {artigo.blindReviewAtivo && role === 'REVISOR' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Modo Blind Review
                      </span>
                    )}
                  </div>
                  {artigo.resumo && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{artigo.resumo}</p>
                  )}
                  <div className="flex flex-col gap-1.5 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p>
                      <span className="font-semibold text-gray-800">Autor:</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {artigo.autorNome || (artigo.autorId === 'ANONIMO' ? 'Autor Anônimo (Double-Blind)' : 'Autor')}
                      </span>
                      {artigo.autorInstituicao && (
                        <span className="text-xs text-gray-500 ml-1.5">({artigo.autorInstituicao})</span>
                      )}
                    </p>

                    {artigo.nomeArquivoManuscrito && (
                      <p>
                        <span className="font-semibold text-gray-800">Manuscrito Anonimizado:</span>{' '}
                        {artigo.urlManuscrito ? (
                          <a
                            href={artigo.urlManuscrito}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline font-medium"
                          >
                            {artigo.nomeArquivoManuscrito}
                          </a>
                        ) : (
                          <span className="text-gray-900 font-medium">{artigo.nomeArquivoManuscrito}</span>
                        )}
                      </p>
                    )}

                    {artigo.nomeArquivoIdentificado && (
                      <p>
                        <span className="font-semibold text-gray-800">Manuscrito Identificado:</span>{' '}
                        {artigo.urlManuscritoIdentificado ? (
                          <a
                            href={artigo.urlManuscritoIdentificado}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-700 hover:underline font-medium"
                          >
                            {artigo.nomeArquivoIdentificado}
                          </a>
                        ) : (
                          <span className="text-gray-900 font-medium">{artigo.nomeArquivoIdentificado}</span>
                        )}
                      </p>
                    )}

                    <p>
                      <span className="font-semibold text-gray-800">Editor(a):</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {artigo.editorNome || (artigo.editorId ? 'Editor Designado' : 'Nenhum (Pendente)')}
                      </span>
                    </p>

                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-gray-800 shrink-0">Revisor(es):</span>
                      {role === 'EDITOR' ? (
                        (artigo.revisoresDetalhes && artigo.revisoresDetalhes.length > 0) || artigo.revisoresIds.length > 0 ? (
                          <span className="inline-flex gap-2 flex-wrap text-gray-900 font-medium">
                            {(artigo.revisoresDetalhes || artigo.revisoresIds.map((id): RevisorDetalhe => ({ id, nome: id }))).map((rev) => {
                              const jaSubmeteu = artigo.revisoes.some((r) => r.revisorId === rev.id);
                              return (
                                <span key={rev.id} className="inline-flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded">
                                  {rev.nome}
                                  {rev.instituicao ? ` (${rev.instituicao})` : ''}
                                  {artigo.editorId === userId && artigo.status === 'EM_REVISAO' && !jaSubmeteu && (
                                    <button
                                      onClick={() => handleDesatribuirRevisor(artigo.id, rev.id)}
                                      className="text-red-500 hover:text-red-700 ml-1 font-bold text-lg leading-none"
                                      title="Remover Revisor"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </span>
                              );
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-900 font-medium">Nenhum atribuído</span>
                        )
                      ) : role === 'REVISOR' ? (
                        <span className="text-gray-700 font-medium">Você (avaliação cega ativa)</span>
                      ) : (
                        <span className="text-gray-600 italic">Ocultos (Double-Blind Review)</span>
                      )}
                    </div>

                    <p className="mt-1 pt-1 border-t border-gray-200 text-xs text-gray-500">
                      {role === 'AUTOR'
                        ? statusFinalOuPublicado
                          ? `${artigo.revisoes.length} parecer(es) disponível(is) (identidades dos revisores preservadas)`
                          : 'Pareceres ocultos até a decisão editorial (Double-Blind)'
                        : role === 'REVISOR'
                          ? jaRevisadoPorMim
                            ? 'Sua avaliação já foi registrada neste manuscrito'
                            : 'Aguardando sua avaliação'
                          : `Total de ${artigo.revisoes.length} revisão(ões) submetida(s)`}
                    </p>
                  </div>

                  {role === 'EDITOR' && artigo.revisoes.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">Avaliações:</h4>
                        <span className="text-sm font-bold text-gray-900 bg-gray-200 px-2 py-1 rounded">
                          Média: {(artigo.revisoes.reduce((acc, curr) => acc + curr.nota, 0) / artigo.revisoes.length).toFixed(1)}/5
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {artigo.revisoes.map((rev, idx) => (
                          <li key={idx} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-300">
                            <span className="font-bold text-black">Nota:</span> <span className="font-bold text-black">{rev.nota}/5</span> |
                            <span className="font-bold text-black ml-2">Revisor:</span> <span className="text-black">{rev.revisorNome || 'Revisor'}</span> |
                            <span className="font-bold text-black ml-2">Parecer:</span> {rev.estaAprovado ? <span className="text-green-600 font-bold ml-1">Aprovado</span> : <span className="text-red-600 font-bold ml-1">Reprovado</span>}
                            <p className="mt-2 text-black font-medium italic border-l-4 border-gray-400 pl-2 bg-gray-100 p-2 rounded">&ldquo;{rev.comentarios}&rdquo;</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {role === 'REVISOR' && artigo.revisoes.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Minha Avaliação:</h4>
                      <ul className="space-y-2">
                        {artigo.revisoes.map((rev, idx) => (
                          <li key={idx} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="font-bold text-gray-900">Nota: {rev.nota}/5</span> |{' '}
                            <span className="font-bold text-gray-900">Parecer:</span>{' '}
                            {rev.estaAprovado ? (
                              <span className="text-green-600 font-bold">Aprovado</span>
                            ) : (
                              <span className="text-red-600 font-bold">Reprovado</span>
                            )}
                            <p className="mt-2 text-gray-700 italic">&ldquo;{rev.comentarios}&rdquo;</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {role === 'AUTOR' && artigo.revisoes.length > 0 && statusFinalOuPublicado && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-800">Feedbacks Finais (Revisores Anônimos):</h4>
                      <ul className="space-y-2">
                        {artigo.revisoes.map((rev, idx) => (
                          <li key={idx} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-700">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-800 mb-1">
                              <span>{rev.revisorNome || `Revisor #${idx + 1}`}</span>
                              <span>• Nota {rev.nota}/5</span>
                              <span className={rev.estaAprovado ? 'text-green-700' : 'text-red-700'}>
                                • {rev.estaAprovado ? 'Aprovado' : 'Reprovado'}
                              </span>
                            </div>
                            <p className="italic text-gray-600">&ldquo;{rev.comentarios}&rdquo;</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {artigo.historicoAuditoria && artigo.historicoAuditoria.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Trilha de Auditoria Imutável (Audit Log • v{artigo.versao ?? 1})
                        </h4>
                      </div>
                      <ol className="space-y-1.5 text-xs text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {artigo.historicoAuditoria.map((log) => (
                          <li key={log.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b last:border-b-0 border-slate-200/70 pb-1.5 last:pb-0">
                            <div>
                              <span className="font-semibold text-slate-800">
                                {log.estadoAnterior ? `${log.estadoAnterior} → ${log.novoEstado}` : `SUBMETIDO → ${log.novoEstado}`}
                              </span>
                              {log.justificativa && (
                                <span className="text-slate-600 ml-1.5">— {log.justificativa}</span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 shrink-0">
                              {log.autorNome || 'Sistema'} • {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0 sm:min-w-[160px]">
                  {getBadgeStatus(artigo.status)}
                  
                  {role === 'EDITOR' && !artigo.editorId && (
                    <button 
                      onClick={() => handleAssumirArtigo(artigo.id)}
                      className="w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Assumir Artigo
                    </button>
                  )}

                  {role === 'EDITOR' && artigo.editorId === userId && (artigo.status === 'PENDENTE' || artigo.status === 'EM_REVISAO') && (
                    <button 
                      onClick={() => openAssignModal(artigo.id)}
                      className="w-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Atribuir Revisor
                    </button>
                  )}

                  {role === 'EDITOR' && artigo.editorId === userId && (artigo.status === 'EM_REVISAO' || artigo.status === 'ACEITO' || artigo.status === 'REJEITADO') && (
                    <button 
                      onClick={() => openDecideModal(artigo.id)}
                      disabled={artigo.status === 'EM_REVISAO' && artigo.revisoes.length < artigo.revisoresIds.length}
                      className={`w-full text-sm font-medium text-white px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm 
                        ${artigo.status === 'EM_REVISAO' && artigo.revisoes.length < artigo.revisoresIds.length ? 'bg-gray-400 cursor-not-allowed opacity-70' : 
                          artigo.status === 'EM_REVISAO' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                      title={artigo.status === 'EM_REVISAO' && artigo.revisoes.length < artigo.revisoresIds.length ? 'Aguarde todas as avaliações serem submetidas.' : ''}
                    >
                      {artigo.status === 'EM_REVISAO' ? 'Decidir Veredito' : 'Alterar Veredito'}
                    </button>
                  )}

                  {role === 'EDITOR' && artigo.editorId === userId && artigo.status === 'ACEITO' && (
                    <button
                      onClick={() => handlePublicarArtigo(artigo.id)}
                      className="w-full text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors mt-1 shadow-sm"
                    >
                      Publicar (Revelar Autor)
                    </button>
                  )}

                  {role === 'EDITOR' && artigo.editorId === userId && artigo.revisoresIds.length === 0 && artigo.status !== 'PUBLICADO' && (
                    <button 
                      onClick={() => handleAbandonarArtigo(artigo.id)}
                      className="w-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Abandonar Artigo
                    </button>
                  )}

                  {role === 'REVISOR' && artigo.status === 'EM_REVISAO' && !jaRevisadoPorMim && (
                    <button 
                      onClick={() => openReviewModal(artigo.id)}
                      className="w-full text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Avaliar Artigo
                    </button>
                  )}
                  {role === 'REVISOR' && jaRevisadoPorMim && artigo.status === 'EM_REVISAO' && (
                    <button 
                      onClick={() => openReviewModal(artigo.id)}
                      className="w-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Editar Avaliação
                    </button>
                  )}

                  {(ehAutorDoArtigo || role === 'EDITOR') && !statusFinalOuPublicado && (
                    <Link
                      href={`/artigo/${artigo.id}/editar`}
                      className="w-full text-center text-sm font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Alterar Artigo
                    </Link>
                  )}

                  {(ehAutorDoArtigo || role === 'EDITOR') && artigo.status !== 'PUBLICADO' && (
                    <button
                      onClick={() => openDeleteModal(artigo)}
                      className="w-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg transition-colors mt-1 shadow-sm"
                    >
                      Excluir Artigo
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Atribuir Revisor</h3>
              <p className="text-sm text-gray-500 mb-6">
                Selecione revisores sem conflito institucional com o autor.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Revisores Disponíveis</label>
                <div className="space-y-2 max-h-56 overflow-y-auto p-3 border border-gray-300 rounded-xl bg-gray-50">
                  {revisores.map(r => {
                    const artigoAtual = artigos.find(a => a.id === selectedArtigoId);
                    const jaAtribuido = Boolean(artigoAtual?.revisoresIds.includes(r.id));
                    const mesmoAutor = Boolean(artigoAtual && artigoAtual.autorId === r.id);
                    const instAutor = normalizarInstituicao(artigoAtual?.autorInstituicao);
                    const instRevisor = normalizarInstituicao(r.instituicao);
                    const mesmaInstituicao = Boolean(
                      instAutor &&
                        instRevisor &&
                        instAutor !== 'nao informada' &&
                        instRevisor !== 'nao informada' &&
                        instAutor === instRevisor,
                    );
                    const motivoBloqueio = jaAtribuido
                      ? 'Já atribuído'
                      : mesmoAutor
                        ? 'É o autor do artigo'
                        : mesmaInstituicao
                          ? 'Conflito institucional'
                          : null;

                    return (
                      <label key={r.id} className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${motivoBloqueio ? 'opacity-60 cursor-not-allowed bg-red-50/60' : 'hover:bg-gray-100 cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          disabled={Boolean(motivoBloqueio)}
                          checked={selectedRevisoresIds.includes(r.id) || jaAtribuido}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRevisoresIds([...selectedRevisoresIds, r.id]);
                            } else {
                              setSelectedRevisoresIds(selectedRevisoresIds.filter(id => id !== r.id));
                            }
                          }}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {r.nome}
                            {motivoBloqueio && (
                              <span className="ml-2 text-xs font-semibold text-red-700">
                                ({motivoBloqueio})
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {r.instituicao || 'Sem instituição'} {r.email ? `• ${r.email}` : ''}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                  {revisores.length === 0 && <p className="text-sm text-gray-500 italic">Nenhum revisor disponível.</p>}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAssignReviewer}
                disabled={selectedRevisoresIds.length === 0}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
              >
                Confirmar Atribuição
              </button>
            </div>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Avaliar Artigo</h3>
              <p className="text-sm text-gray-500 mb-6">Forneça seu parecer técnico para o manuscrito.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nota Geral (1 a 5)</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={reviewData.nota}
                    onChange={e => setReviewData({...reviewData, nota: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 outline-none transition-all bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comentários (Feedback ao Autor)</label>
                  <textarea 
                    rows={4}
                    value={reviewData.comentarios}
                    onChange={e => setReviewData({...reviewData, comentarios: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 outline-none transition-all bg-gray-50 resize-y"
                    placeholder="Quais os pontos fortes e fracos deste trabalho?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Parecer Final</label>
                  <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${reviewData.estaAprovado === true ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white group-hover:border-green-500'}`}>
                        {reviewData.estaAprovado === true && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="parecer"
                        checked={reviewData.estaAprovado === true}
                        onChange={() => setReviewData({...reviewData, estaAprovado: true})}
                        className="sr-only"
                      />
                      <span className="text-sm font-bold text-gray-900">Aprovar Artigo</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${reviewData.estaAprovado === false ? 'border-red-600 bg-red-600' : 'border-gray-400 bg-white group-hover:border-red-500'}`}>
                        {reviewData.estaAprovado === false && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="parecer"
                        checked={reviewData.estaAprovado === false}
                        onChange={() => setReviewData({...reviewData, estaAprovado: false})}
                        className="sr-only"
                      />
                      <span className="text-sm font-bold text-gray-900">Reprovar Artigo</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={!reviewData.comentarios.trim()}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
              >
                Submeter Revisão
              </button>
            </div>
          </div>
        </div>
      )}

      {isDecideModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Decidir Veredito Final</h3>
              <p className="text-sm text-gray-500 mb-6">Tome a decisão final para este artigo baseado nas revisões.</p>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="statusFinal"
                    checked={decideStatus === 'ACEITO'}
                    onChange={() => setDecideStatus('ACEITO')}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="font-bold text-gray-900">ACEITAR Artigo</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="statusFinal"
                    checked={decideStatus === 'REJEITADO'}
                    onChange={() => setDecideStatus('REJEITADO')}
                    className="w-5 h-5 text-red-600 focus:ring-red-500"
                  />
                  <span className="font-bold text-gray-900">REJEITAR Artigo</span>
                </label>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Justificativa Editorial (Audit Log Imutável)
                  </label>
                  <textarea
                    rows={3}
                    value={decideJustificativa}
                    onChange={(e) => setDecideJustificativa(e.target.value)}
                    placeholder="Descreva a justificativa desta transição de estado para a trilha de auditoria..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsDecideModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDecideStatus}
                className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm"
              >
                Confirmar Decisão
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && artigoParaExcluir && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Artigo</h3>
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o artigo <span className="font-semibold text-gray-900">&ldquo;{artigoParaExcluir.titulo}&rdquo;</span>? Esta ação não poderá ser desfeita.
              </p>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setArtigoParaExcluir(null);
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteArtigo}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
