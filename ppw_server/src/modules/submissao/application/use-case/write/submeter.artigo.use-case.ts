import { SubmeterArtigoRequest } from '../../dto/submissao.dto.request';
import { SubmeterArtigoResponse } from '../../dto/submissao.dto.response';

export const SUBMETER_ARTIGO_USE_CASE = 'SUBMETER_ARTIGO_USE_CASE';

export interface SubmeterArtigoUseCase {
  execute(request: SubmeterArtigoRequest): Promise<SubmeterArtigoResponse>;
}
