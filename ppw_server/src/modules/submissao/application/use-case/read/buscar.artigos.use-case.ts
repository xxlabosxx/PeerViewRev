import { ArtigoResponse } from '../../dto/submissao.dto.response';

export const BUSCAR_ARTIGOS_USE_CASE = 'BUSCAR_ARTIGOS_USE_CASE';

export interface ConsultaArtigoViewer {
  userId?: string;
  role?: string;
}

export interface BuscarArtigosUseCase {
  execute(viewer?: ConsultaArtigoViewer): Promise<ArtigoResponse[]>;
}
