export const API_URL = 'http://localhost:3000';

export interface RevisaoItem {
  id: string;
  revisorId: string;
  revisorNome?: string;
  artigoId: string;
  nota: number;
  comentarios: string;
  estaAprovado: boolean;
}

export interface RevisorDetalhe {
  id: string;
  nome: string;
  instituicao?: string;
}

export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  instituicao: string;
  papel: 'AUTOR' | 'EDITOR' | 'REVISOR';
}

export interface Artigo {
  id: string;
  titulo: string;
  resumo: string;
  nomeArquivoManuscrito: string;
  urlManuscrito: string;
  nomeArquivoIdentificado?: string;
  urlManuscritoIdentificado?: string;
  status: string;
  autorId: string;
  autorNome?: string;
  autorInstituicao?: string;
  editorId?: string;
  editorNome?: string;
  revisoresIds: string[];
  revisoresDetalhes?: RevisorDetalhe[];
  revisoes: RevisaoItem[];
  blindReviewAtivo?: boolean;
}

function getViewerHeaders(viewer?: { userId?: string; role?: string }): Record<string, string> {
  const headers: Record<string, string> = {};
  const userId =
    viewer?.userId ??
    (typeof window !== 'undefined' ? localStorage.getItem('@App:userId') || '' : '');
  const role =
    viewer?.role ??
    (typeof window !== 'undefined' ? localStorage.getItem('@App:role') || '' : '');

  if (userId) headers['x-user-id'] = userId;
  if (role) headers['x-user-role'] = role;
  return headers;
}

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  const errorData = await response.json().catch(() => ({}));
  if (Array.isArray(errorData.message)) {
    return errorData.message.join(', ');
  }
  return errorData.message || fallback;
}

export const api = {
  uploadPdf: async (
    file: File,
    tipo: 'anonimizado' | 'identificado',
  ): Promise<{ nomeArquivo: string; url: string; tipo: string; metadadosLimpos: boolean }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    const response = await fetch(`${API_URL}/submissoes/upload-pdf`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao enviar PDF'));
    }
    return response.json();
  },

  getArtigos: async (viewer?: { userId?: string; role?: string }): Promise<Artigo[]> => {
    const response = await fetch(`${API_URL}/submissoes/artigos`, {
      cache: 'no-store',
      headers: getViewerHeaders(viewer),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao buscar artigos'));
    }
    return response.json();
  },

  getArtigoPorId: async (
    id: string,
    viewer?: { userId?: string; role?: string },
  ): Promise<Artigo> => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${id}`, {
      cache: 'no-store',
      headers: getViewerHeaders(viewer),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao buscar artigo'));
    }
    return response.json();
  },

  submeterArtigo: async (data: {
    titulo: string;
    resumo: string;
    autorId: string;
    nomeArquivoManuscrito: string;
    urlManuscrito: string;
    nomeArquivoIdentificado?: string;
    urlManuscritoIdentificado?: string;
  }) => {
    const response = await fetch(`${API_URL}/submissoes/artigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getViewerHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao submeter artigo'));
    }
    return response.json();
  },

  alterarArtigo: async (
    id: string,
    data: {
      titulo: string;
      resumo: string;
      nomeArquivoManuscrito?: string;
      urlManuscrito?: string;
      nomeArquivoIdentificado?: string;
      urlManuscritoIdentificado?: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getViewerHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao alterar artigo'));
    }
    return response.json();
  },

  excluirArtigo: async (id: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${id}`, {
      method: 'DELETE',
      headers: getViewerHeaders(),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao excluir artigo'));
    }
    return response.json();
  },

  assumirArtigo: async (artigoId: string, editorId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/assumir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getViewerHeaders() },
      body: JSON.stringify({ editorId }),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao assumir artigo'));
    }
    return response.json();
  },

  abandonarArtigo: async (artigoId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/abandonar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getViewerHeaders() },
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao abandonar artigo'));
    }
    return response.json();
  },

  atribuirRevisor: async (data: { artigoId: string; revisorId: string }) => {
    const response = await fetch(`${API_URL}/submissoes/atribuir-revisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getViewerHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao atribuir revisor'));
    }
    return response.json();
  },

  desatribuirRevisor: async (artigoId: string, revisorId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/desatribuir-revisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getViewerHeaders() },
      body: JSON.stringify({ revisorId }),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao desatribuir revisor'));
    }
    return response.json();
  },

  submeterRevisao: async (data: {
    artigoId: string;
    revisorId: string;
    nota: number;
    comentarios: string;
    estaAprovado: boolean;
  }) => {
    const response = await fetch(`${API_URL}/submissoes/revisao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getViewerHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao submeter revisão'));
    }
    return response.json();
  },

  decidirStatus: async (artigoId: string, status: 'ACEITO' | 'REJEITADO') => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/decidir`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getViewerHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao decidir status do artigo'));
    }
    return response.json();
  },

  publicarArtigo: async (artigoId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/publicar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getViewerHeaders() },
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao publicar artigo'));
    }
    return response.json();
  },

  cadastrarUsuario: async (data: {
    nome: string;
    email: string;
    instituicao: string;
    senha: string;
    papel: string;
  }) => {
    const response = await fetch(`${API_URL}/usuarios/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao cadastrar'));
    }
    return response.json();
  },

  loginUsuario: async (data: { nome: string; senha: string }) => {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Usuário ou senha incorretos'));
    }
    return response.json();
  },

  getRevisores: async (): Promise<UsuarioItem[]> => {
    const response = await fetch(`${API_URL}/usuarios/revisores`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao buscar revisores'));
    }
    return response.json();
  },

  getUsuarios: async (): Promise<UsuarioItem[]> => {
    const response = await fetch(`${API_URL}/usuarios`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, 'Falha ao buscar usuários'));
    }
    return response.json();
  },
};
