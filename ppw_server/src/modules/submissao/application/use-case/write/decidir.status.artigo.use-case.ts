import { DecidirStatusResponse } from '../../dto/submissao.dto.response';

export const DECIDIR_STATUS_ARTIGO_USE_CASE = 'DECIDIR_STATUS_ARTIGO_USE_CASE';

export interface DecidirStatusArtigoUseCase {
  execute(artigoId: string, status: 'ACEITO' | 'REJEITADO'): Promise<DecidirStatusResponse>;
}
