import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { RecomendacaoRevisao } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { AuditLogEntity } from '../../domain/entity/audit-log.entity';
import { RevisaoEntity } from '../../domain/entity/revisao.entity';
import { ArtigoReadRepository } from '../../domain/ports/artigo.read.repository';
import { ManuscritoValueObject } from '../../domain/value-objects/manuscrito.value.object';
import { StatusArtigoEnum, StatusArtigoValueObject } from '../../domain/value-objects/status.value.object';

@Injectable()
export class ArtigoPrismaReadRepository implements ArtigoReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapRecordToEntity(record: any): ArtigoEntity {
    const manuscrito = ManuscritoValueObject.create({
      nomeArquivo: path.basename(record.arquivoUrl || 'manuscrito.pdf'),
      url: record.arquivoUrl,
    });

    const manuscritoIdentificado = record.arquivoIdentificadoUrl
      ? ManuscritoValueObject.create({
          nomeArquivo: path.basename(record.arquivoIdentificadoUrl),
          url: record.arquivoIdentificadoUrl,
        })
      : undefined;

    const revisoes = (record.revisoes || []).map((rev: any) =>
      RevisaoEntity.create(
        {
          artigoId: rev.artigoId,
          revisorId: rev.revisorId,
          nota: rev.nota,
          comentarios: rev.parecer,
          estaAprovado: rev.recomendacao === RecomendacaoRevisao.ACEITAR,
        },
        rev.id,
      ),
    );

    const historicoAuditoria = (record.logs || []).map((log: any) =>
      AuditLogEntity.create(
        {
          artigoId: log.artigoId,
          estadoAnterior: (log.estadoAnterior as StatusArtigoEnum) ?? null,
          novoEstado: log.novoEstado as StatusArtigoEnum,
          autorId: log.autorId,
          justificativa: log.justificativa ?? undefined,
          timestamp: log.timestamp,
        },
        log.id,
      ),
    );

    return ArtigoEntity.restore(
      {
        titulo: record.titulo,
        resumo: record.resumo,
        autorId: record.autorId,
        editorId: record.editorId ?? undefined,
        manuscrito,
        manuscritoIdentificado,
        status: StatusArtigoValueObject.create(record.status),
        versao: record.versao,
        revisoresIds: (record.revisores || []).map((r: any) => r.revisorId),
        revisoes,
        historicoAuditoria,
      },
      record.id,
    );
  }

  async buscarPorId(id: string): Promise<ArtigoEntity | null> {
    const record = await this.prisma.artigo.findUnique({
      where: { id },
      include: {
        revisores: true,
        revisoes: true,
        logs: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!record) return null;
    return this.mapRecordToEntity(record);
  }

  async buscarTodos(): Promise<ArtigoEntity[]> {
    const records = await this.prisma.artigo.findMany({
      include: {
        revisores: true,
        revisoes: true,
        logs: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.mapRecordToEntity(r));
  }
}
