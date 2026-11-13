export class SubmeterArtigoResponse {
  mensagem: string;
  artigoId: string;
  status: string;
}

export class DecidirStatusResponse {
  mensagem: string;
  artigoId: string;
  status: string;
}

export class PublicarArtigoResponse {
  mensagem: string;
  artigoId: string;
  status: string;
}

export class MensagemResponse {
  mensagem: string;
}

export class UploadPdfResponse {
  nomeArquivo: string;
  url: string;
  tipo: 'anonimizado' | 'identificado';
  metadadosLimpos: boolean;
}

export interface RevisaoResponse {
  id: string;
  revisorId: string;
  revisorNome?: string;
  artigoId: string;
  nota: number;
  comentarios: string;
  estaAprovado: boolean;
}

export interface RevisorDetalheResponse {
  id: string;
  nome: string;
  instituicao?: string;
}

export class ArtigoResponse {
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
  revisoresDetalhes?: RevisorDetalheResponse[];
  revisoes: RevisaoResponse[];
  blindReviewAtivo?: boolean;
}
