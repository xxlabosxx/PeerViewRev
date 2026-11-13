import { MensagemResponse } from '../../dto/submissao.dto.response';

export const ABANDONAR_ARTIGO_USE_CASE = 'ABANDONAR_ARTIGO_USE_CASE';

export interface AbandonarArtigoUseCase {
  execute(artigoId: string): Promise<MensagemResponse>;
}
