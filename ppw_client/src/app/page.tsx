'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Artigo } from '../services/api';
import { useProfile } from '../contexts/ProfileContext';

export default function Dashboard() {
  const { role, userId } = useProfile();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [revisores, setRevisores] = useState<{id: string, nome: string}[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [usuarios, setUsuarios] = useState<{id: string, nome: string, papel: string}[]>([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedArtigoId, setSelectedArtigoId] = useState<string | null>(null);
  const [selectedRevisoresIds, setSelectedRevisoresIds] = useState<string[]>([]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ nota: 0, comentarios: '', estaAprovado: false });

  const [isDecideModalOpen, setIsDecideModalOpen] = useState(false);
  const [decideStatus, setDecideStatus] = useState<'ACEITO' | 'REJEITADO'>('ACEITO');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [artigoParaExcluir, setArtigoParaExcluir] = useState<Artigo | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    buscarUsuarios().then(() => {
      buscarArtigos();
    });
  }, [role, userId]);

  const buscarUsuarios = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
      setRevisores(data.filter((u: any) => u.papel === 'REVISOR'));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const buscarArtigos = async () => {
    try {
      let data = await api.getArtigos();
      
      if (role === 'AUTOR') {
        data = data.filter(a => a.autorId === userId);
      } else if (role === 'REVISOR') {
        data = data.filter(a => a.revisoresIds && a.revisoresIds.includes(userId));
      } else if (role === 'EDITOR') {
        data = data;
      } else {
        data = [];
      }
      
      setArtigos(data);
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const getNomeUsuario = (id: string) => {
    const user = usuarios.find(u => u.id === id);
    return user ? user.nome : 'Desconhecido';
  };

  const getEditorArtigo = (editorId?: string) => {
    if (!editorId) return 'Nenhum (Pendente)';
    return getNomeUsuario(editorId);
  };

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
    } catch (err: any) {
      showMessage(err.message || 'Erro ao assumir artigo', 'error');
    }
  };

  const handleAbandonarArtigo = async (artigoId: string) => {
    try {
      await api.abandonarArtigo(artigoId);
      showMessage('Artigo abandonado!', 'success');
      buscarArtigos();
    } catch (err: any) {
      showMessage(err.message || 'Erro ao abandonar artigo', 'error');
    }
  };

  const handleDesatribuirRevisor = async (artigoId: string, revisorId: string) => {
    try {
      await api.desatribuirRevisor(artigoId, revisorId);
      showMessage('Revisor desatribuído!', 'success');
      buscarArtigos();
    } catch (err: any) {
      showMessage(err.message || 'Erro ao desatribuir revisor', 'error');
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
    } catch (err: any) {
      showMessage(err.message || 'Erro ao atribuir', 'error');
    }
  };

  const openDecideModal = (artigoId: string) => {
    setSelectedArtigoId(artigoId);
    setDecideStatus('ACEITO');
    setIsDecideModalOpen(true);
  };

  const handleDecideStatus = async () => {
    if (!selectedArtigoId) return;
    try {
      await api.decidirStatus(selectedArtigoId, decideStatus);
      showMessage('Status decidido com sucesso!', 'success');
      setIsDecideModalOpen(false);
      buscarArtigos();
    } catch (err: any) {
      showMessage(err.message || 'Erro ao decidir status', 'error');
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
    } catch (err: any) {
      showMessage(err.message || 'Erro ao excluir artigo', 'error');
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
    } catch (err: any) {
      showMessage(err.message || 'Erro ao submeter revisão', 'error');
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
            <p className="text-gray-500">Ainda não existem artigos submetidos no sistema.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {artigos.map((artigo) => {
              const jaRevisadoPorMim = role === 'REVISOR' && artigo.revisoes.some(r => r.revisorId === userId);

              return (
              <div key={artigo.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{artigo.titulo}</h2>
                  {artigo.resumo && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{artigo.resumo}</p>
                  )}
                  <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p><span className="font-semibold text-gray-800">Autor:</span> <span className="text-gray-900 font-medium">{getNomeUsuario(artigo.autorId)}</span></p>
                    {artigo.nomeArquivoManuscrito && (
                      <p><span className="font-semibold text-gray-800">Manuscrito:</span> <span className="text-gray-900 font-medium">{artigo.nomeArquivoManuscrito}</span></p>
                    )}
                    <p><span className="font-semibold text-gray-800">Editor(es):</span> <span className="text-gray-900 font-medium">{getEditorArtigo(artigo.editorId)}</span></p>
                    <div className="flex items-start gap-1"><span className="font-semibold text-gray-800 shrink-0">Revisor(es):</span> 
                      {artigo.revisoresIds.length > 0 ? (
                        <span className="inline-flex gap-2 flex-wrap text-gray-900 font-medium">
                          {artigo.revisoresIds.map(id => {
                            const jaSubmeteu = artigo.revisoes.some((r) => r.revisorId === id);
                            return (
                              <span key={id} className="inline-flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded">
                                {getNomeUsuario(id)}
                                {role === 'EDITOR' && artigo.editorId === userId && artigo.status === 'EM_REVISAO' && !jaSubmeteu && (
                                  <button 
                                    onClick={() => handleDesatribuirRevisor(artigo.id, id)}
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
                      ) : <span className="text-gray-900 font-medium">Nenhum atribuído</span>}
                    </div>
                    <p className="mt-1 pt-1 border-t border-gray-200 text-xs text-gray-500">
                      Total de {artigo.revisoes.length} revisão(ões) submetida(s)
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
                            <span className="font-bold text-black ml-2">Revisor:</span> <span className="text-black">{getNomeUsuario(rev.revisorId)}</span> | 
                            <span className="font-bold text-black ml-2">Parecer:</span> {rev.estaAprovado ? <span className="text-green-600 font-bold ml-1">Aprovado</span> : <span className="text-red-600 font-bold ml-1">Reprovado</span>}
                            <p className="mt-2 text-black font-medium italic border-l-4 border-gray-400 pl-2 bg-gray-100 p-2 rounded">"{rev.comentarios}"</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {role === 'AUTOR' && artigo.revisoes.length > 0 && (artigo.status === 'ACEITO' || artigo.status === 'REJEITADO') && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-800">Feedbacks Finais:</h4>
                      <ul className="space-y-2">
                        {artigo.revisoes.map((rev, idx) => (
                          <li key={idx} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600 italic">
                            "{rev.comentarios}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0 sm:min-w-[140px]">
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

                  {role === 'EDITOR' && artigo.editorId === userId && artigo.revisoresIds.length === 0 && (
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

                  {(role === 'AUTOR' || role === 'EDITOR') && artigo.status !== 'ACEITO' && artigo.status !== 'REJEITADO' && (
                    <Link
                      href={`/artigo/${artigo.id}/editar`}
                      className="w-full text-center text-sm font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-2 rounded-lg transition-colors mt-2 shadow-sm"
                    >
                      Alterar Artigo
                    </Link>
                  )}

                  {(role === 'AUTOR' || role === 'EDITOR') && (
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
              <p className="text-sm text-gray-500 mb-6">Selecione o revisor para avaliar este manuscrito.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Revisores Disponíveis</label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-xl bg-gray-50">
                  {revisores.map(r => {
                    const artigoAtual = artigos.find(a => a.id === selectedArtigoId);
                    const jaAtribuido = artigoAtual?.revisoresIds.includes(r.id);
                    return (
                      <label key={r.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${jaAtribuido ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          disabled={jaAtribuido}
                          checked={selectedRevisoresIds.includes(r.id) || !!jaAtribuido}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRevisoresIds([...selectedRevisoresIds, r.id]);
                            } else {
                              setSelectedRevisoresIds(selectedRevisoresIds.filter(id => id !== r.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">{r.nome} {jaAtribuido && '(Já atribuído)'}</span>
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
