export const API_URL = 'http://localhost:3000';

export interface Artigo {
  id: string;
  titulo: string;
  resumo: string;
  nomeArquivoManuscrito: string;
  urlManuscrito: string;
  status: string;
  autorId: string;
  editorId?: string;
  revisoresIds: string[];
  revisoes: any[];
}

export const api = {
  getArtigos: async (): Promise<Artigo[]> => {
    const response = await fetch(`${API_URL}/submissoes/artigos`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Falha ao buscar artigos');
    }
    return response.json();
  },

  getArtigoPorId: async (id: string): Promise<Artigo> => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao buscar artigo');
    }
    return response.json();
  },

  submeterArtigo: async (data: {
    titulo: string;
    resumo: string;
    autorId: string;
    nomeArquivoManuscrito: string;
    urlManuscrito: string;
  }) => {
    const response = await fetch(`${API_URL}/submissoes/artigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      throw new Error(msg || 'Falha ao submeter artigo');
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
    },
  ) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      throw new Error(msg || 'Falha ao alterar artigo');
    }
    return response.json();
  },

  excluirArtigo: async (id: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao excluir artigo');
    }
    return response.json();
  },

  assumirArtigo: async (artigoId: string, editorId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/assumir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editorId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao assumir artigo');
    }
    return response.json();
  },

  abandonarArtigo: async (artigoId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/abandonar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao abandonar artigo');
    }
    return response.json();
  },

  atribuirRevisor: async (data: { artigoId: string; revisorId: string }) => {
    const response = await fetch(`${API_URL}/submissoes/atribuir-revisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Falha ao atribuir revisor');
    }
    return response.json();
  },

  desatribuirRevisor: async (artigoId: string, revisorId: string) => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/desatribuir-revisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisorId }),
    });
    if (!response.ok) {
      throw new Error('Falha ao desatribuir revisor');
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
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Falha ao submeter revisão');
    }
    return response.json();
  },

  decidirStatus: async (artigoId: string, status: 'ACEITO' | 'REJEITADO') => {
    const response = await fetch(`${API_URL}/submissoes/artigo/${artigoId}/decidir`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      throw new Error('Falha ao decidir status do artigo');
    }
    return response.json();
  },

  cadastrarUsuario: async (data: any) => {
    const response = await fetch(`${API_URL}/usuarios/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao cadastrar');
    }
    return response.json();
  },

  loginUsuario: async (data: any) => {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Usuário ou senha incorretos');
    }
    return response.json();
  },

  getRevisores: async () => {
    const response = await fetch(`${API_URL}/usuarios/revisores`);
    if (!response.ok) {
      throw new Error('Falha ao buscar revisores');
    }
    return response.json();
  },

  getUsuarios: async () => {
    const response = await fetch(`${API_URL}/usuarios`);
    if (!response.ok) {
      throw new Error('Falha ao buscar usuários');
    }
    return response.json();
  },
};
