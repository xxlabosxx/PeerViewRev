import { SubmeterRevisaoRequest } from '../../dto/submissao.dto.request';
import { MensagemResponse } from '../../dto/submissao.dto.response';

export const SUBMETER_REVISAO_USE_CASE = 'SUBMETER_REVISAO_USE_CASE';

export interface SubmeterRevisaoUseCase {
  execute(request: SubmeterRevisaoRequest): Promise<MensagemResponse>;
}
