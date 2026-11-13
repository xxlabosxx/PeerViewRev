import { Injectable } from '@nestjs/common';
import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { AuditLogEntity, RegistroAuditoriaTransicao } from '../../domain/entity/audit-log.entity';
import { ArtigoWriteRepository } from '../../domain/ports/artigo.write.repository';
import { InMemoryArtigoStore } from './artigo.inmemory.store';

@Injectable()
export class ArtigoInMemoryWriteRepository implements ArtigoWriteRepository {
  async salvar(artigo: ArtigoEntity): Promise<void> {
    if (!InMemoryArtigoStore.versoes.has(artigo.id)) {
      InMemoryArtigoStore.versoes.set(artigo.id, artigo.versao);
    }
    InMemoryArtigoStore.artigos.set(artigo.id, artigo);
  }

  async salvarComAuditoria(
    artigo: ArtigoEntity,
    auditoria: RegistroAuditoriaTransicao,
  ): Promise<void> {
    const logEntity = AuditLogEntity.create({
      artigoId: artigo.id,
      estadoAnterior: auditoria.estadoAnterior,
      novoEstado: auditoria.novoEstado,
      autorId: auditoria.atorId,
      justificativa: auditoria.justificativa,
    });

    if (auditoria.estadoAnterior !== null && InMemoryArtigoStore.versoes.has(artigo.id)) {
      const versaoNoBanco = InMemoryArtigoStore.versoes.get(artigo.id)!;
      if (artigo.versao !== versaoNoBanco) {
        throw new Error(
          'Conflito de concorrência: o artigo foi modificado por outra operação simultânea.',
        );
      }
      artigo.incrementarVersao();
    }

    InMemoryArtigoStore.versoes.set(artigo.id, artigo.versao);
    artigo.adicionarLogAuditoria(logEntity);
    InMemoryArtigoStore.artigos.set(artigo.id, artigo);

    // Append-Only: apenas adiciona na trilha imutável de auditoria
    const logsAtuais = InMemoryArtigoStore.auditLogs.get(artigo.id) ?? [];
    InMemoryArtigoStore.auditLogs.set(artigo.id, [...logsAtuais, logEntity]);
  }

  async excluir(id: string): Promise<void> {
    InMemoryArtigoStore.artigos.delete(id);
    InMemoryArtigoStore.versoes.delete(id);
    // Observação: auditLogs NÃO é deletado para preservar a trilha imutável (Append-Only)
  }
}
