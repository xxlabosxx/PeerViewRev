import { ArtigoResponse } from '../../dto/submissao.dto.response';

export const BUSCAR_ARTIGO_POR_ID_USE_CASE = 'BUSCAR_ARTIGO_POR_ID_USE_CASE';

export interface BuscarArtigoPorIdUseCase {
  execute(artigoId: string): Promise<ArtigoResponse>;
}

