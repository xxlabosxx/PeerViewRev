import { ArtigoResponse } from '../../dto/submissao.dto.response';

export const BUSCAR_ARTIGOS_USE_CASE = 'BUSCAR_ARTIGOS_USE_CASE';

export interface BuscarArtigosUseCase {
  execute(): Promise<ArtigoResponse[]>;
}
