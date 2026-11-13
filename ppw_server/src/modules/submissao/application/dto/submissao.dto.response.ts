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

export class MensagemResponse {
  mensagem: string;
}

export interface RevisaoResponse {
  id: string;
  revisorId: string;
  artigoId: string;
  nota: number;
  comentarios: string;
  estaAprovado: boolean;
}

export class ArtigoResponse {
  id: string;
  titulo: string;
  resumo: string;
  nomeArquivoManuscrito: string;
  urlManuscrito: string;
  status: string;
  autorId: string;
  editorId?: string;
  revisoresIds: string[];
  revisoes: RevisaoResponse[];
}
