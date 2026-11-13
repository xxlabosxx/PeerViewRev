import { MensagemResponse } from '../../dto/submissao.dto.response';

export const ASSUMIR_ARTIGO_USE_CASE = 'ASSUMIR_ARTIGO_USE_CASE';

export interface AssumirArtigoUseCase {
  execute(artigoId: string, editorId: string): Promise<MensagemResponse>;
}
