import { ArtigoResponse } from '../../dto/submissao.dto.response';
import type { ConsultaArtigoViewer } from './buscar.artigos.use-case';

export const BUSCAR_ARTIGO_POR_ID_USE_CASE = 'BUSCAR_ARTIGO_POR_ID_USE_CASE';

export interface BuscarArtigoPorIdUseCase {
  execute(artigoId: string, viewer?: ConsultaArtigoViewer): Promise<ArtigoResponse>;
}

