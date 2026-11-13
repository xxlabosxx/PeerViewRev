import { Injectable } from '@nestjs/common';
import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { ArtigoWriteRepository } from '../../domain/ports/artigo.write.repository';
import { InMemoryArtigoStore } from './artigo.inmemory.store';

@Injectable()
export class ArtigoInMemoryWriteRepository implements ArtigoWriteRepository {
  async salvar(artigo: ArtigoEntity): Promise<void> {
    InMemoryArtigoStore.artigos.set(artigo.id, artigo);
  }

  async excluir(id: string): Promise<void> {
    InMemoryArtigoStore.artigos.delete(id);
  }
}
