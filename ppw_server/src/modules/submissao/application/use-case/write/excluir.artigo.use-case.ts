import { MensagemResponse } from '../../dto/submissao.dto.response';

export const EXCLUIR_ARTIGO_USE_CASE = 'EXCLUIR_ARTIGO_USE_CASE';

export interface ExcluirArtigoUseCase {
  execute(artigoId: string): Promise<MensagemResponse>;
}

