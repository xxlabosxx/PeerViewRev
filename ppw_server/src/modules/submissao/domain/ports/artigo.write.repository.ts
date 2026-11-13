import { ArtigoEntity } from '../entity/artigo.entity';

export const ARTIGO_WRITE_REPOSITORY = 'ARTIGO_WRITE_REPOSITORY';

export interface ArtigoWriteRepository {
  salvar(artigo: ArtigoEntity): Promise<void>;
  excluir(id: string): Promise<void>;
}
