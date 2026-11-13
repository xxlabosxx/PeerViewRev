import { Injectable } from '@nestjs/common';
import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { ArtigoReadRepository } from '../../domain/ports/artigo.read.repository';
import { InMemoryArtigoStore } from './artigo.inmemory.store';

@Injectable()
export class ArtigoInMemoryReadRepository implements ArtigoReadRepository {
  private clonarSnapshot(artigo: ArtigoEntity): ArtigoEntity {
    const props = artigo.getProps();
    const logs = InMemoryArtigoStore.auditLogs.get(artigo.id) ?? props.historicoAuditoria ?? [];
    const versao = InMemoryArtigoStore.versoes.get(artigo.id) ?? artigo.versao;

    return ArtigoEntity.restore(
      {
        titulo: props.titulo,
        resumo: props.resumo,
        autorId: props.autorId,
        editorId: props.editorId,
        manuscrito: props.manuscrito,
        manuscritoIdentificado: props.manuscritoIdentificado,
        status: props.status,
        versao,
        revisoresIds: [...props.revisoresIds],
        revisoes: [...props.revisoes],
        historicoAuditoria: [...logs],
      },
      artigo.id,
    );
  }

  async buscarPorId(id: string): Promise<ArtigoEntity | null> {
    const artigo = InMemoryArtigoStore.artigos.get(id);
    return artigo ? this.clonarSnapshot(artigo) : null;
  }

  async buscarTodos(): Promise<ArtigoEntity[]> {
    return Array.from(InMemoryArtigoStore.artigos.values()).map((a) => this.clonarSnapshot(a));
  }
}
