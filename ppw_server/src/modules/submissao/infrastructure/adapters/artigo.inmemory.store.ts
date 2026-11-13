import { ArtigoEntity } from '../../domain/entity/artigo.entity';

export class InMemoryArtigoStore {
  public static readonly artigos: Map<string, ArtigoEntity> = new Map();
}
