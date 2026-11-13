import { AlterarArtigoRequest } from '../../dto/submissao.dto.request';
import { ArtigoResponse } from '../../dto/submissao.dto.response';
import type { ConsultaArtigoViewer } from '../read/buscar.artigos.use-case';

export const ALTERAR_ARTIGO_USE_CASE = 'ALTERAR_ARTIGO_USE_CASE';

export interface AlterarArtigoUseCase {
  execute(
    artigoId: string,
    request: AlterarArtigoRequest,
    viewer?: ConsultaArtigoViewer,
  ): Promise<ArtigoResponse>;
}

