import { Injectable } from '@nestjs/common';
import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { ArtigoReadRepository } from '../../domain/ports/artigo.read.repository';
import { InMemoryArtigoStore } from './artigo.inmemory.store';

@Injectable()
export class ArtigoInMemoryReadRepository implements ArtigoReadRepository {
  async buscarPorId(id: string): Promise<ArtigoEntity | null> {
    const artigo = InMemoryArtigoStore.artigos.get(id);
    return artigo ? artigo : null;
  }

  async buscarTodos(): Promise<ArtigoEntity[]> {
    return Array.from(InMemoryArtigoStore.artigos.values());
  }
}
