import { PublicarArtigoResponse } from '../../dto/submissao.dto.response';

export const PUBLICAR_ARTIGO_USE_CASE = 'PUBLICAR_ARTIGO_USE_CASE';

export interface PublicarArtigoUseCase {
  execute(artigoId: string): Promise<PublicarArtigoResponse>;
}
