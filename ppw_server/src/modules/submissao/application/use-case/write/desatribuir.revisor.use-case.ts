import { MensagemResponse } from '../../dto/submissao.dto.response';

export const DESATRIBUIR_REVISOR_USE_CASE = 'DESATRIBUIR_REVISOR_USE_CASE';

export interface DesatribuirRevisorUseCase {
  execute(artigoId: string, revisorId: string): Promise<MensagemResponse>;
}
