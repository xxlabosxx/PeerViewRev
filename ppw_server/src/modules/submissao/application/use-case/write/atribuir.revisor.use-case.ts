import { AtribuirRevisorRequest } from '../../dto/submissao.dto.request';
import { MensagemResponse } from '../../dto/submissao.dto.response';

export const ATRIBUIR_REVISOR_USE_CASE = 'ATRIBUIR_REVISOR_USE_CASE';

export interface AtribuirRevisorUseCase {
  execute(request: AtribuirRevisorRequest): Promise<MensagemResponse>;
}
