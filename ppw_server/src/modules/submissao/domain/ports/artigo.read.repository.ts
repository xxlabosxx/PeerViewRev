import { ArtigoEntity } from '../entity/artigo.entity';

export const ARTIGO_READ_REPOSITORY = 'ARTIGO_READ_REPOSITORY';

export interface ArtigoReadRepository {
  buscarPorId(id: string): Promise<ArtigoEntity | null>;
  buscarTodos(): Promise<ArtigoEntity[]>;
}
