import { Injectable } from '@nestjs/common';
import { RecomendacaoRevisao, StatusArtigo } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { AuditLogEntity, RegistroAuditoriaTransicao } from '../../domain/entity/audit-log.entity';
import { ArtigoWriteRepository } from '../../domain/ports/artigo.write.repository';

@Injectable()
export class ArtigoPrismaWriteRepository implements ArtigoWriteRepository {
  constructor(private readonly prisma: PrismaService) {}

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

    await this.prisma.$transaction(async (tx) => {
      if (auditoria.estadoAnterior === null) {
        // Submissão inicial: cria o Artigo e o primeiro AuditLog na mesma transação ACID
        await tx.artigo.create({
          data: {
            id: artigo.id,
            titulo: artigo.titulo,
            resumo: artigo.resumo,
            autorId: artigo.autorId,
            editorId: artigo.editorId ?? null,
            arquivoUrl: artigo.manuscrito.url,
            ...(artigo.manuscritoIdentificado?.url
              ? ({ arquivoIdentificadoUrl: artigo.manuscritoIdentificado.url } as Record<string, unknown>)
              : {}),
            status: artigo.status.getValue() as unknown as StatusArtigo,
            versao: artigo.versao,
          },
        });
      } else {
        // Transição de estado: aplica Optimistic Locking validando a versão atual
        const resultado = await tx.artigo.updateMany({
          where: {
            id: artigo.id,
            versao: artigo.versao,
          },
          data: {
            titulo: artigo.titulo,
            resumo: artigo.resumo,
            editorId: artigo.editorId ?? null,
            arquivoUrl: artigo.manuscrito.url,
            ...(artigo.manuscritoIdentificado?.url
              ? ({ arquivoIdentificadoUrl: artigo.manuscritoIdentificado.url } as Record<string, unknown>)
              : {}),
            status: artigo.status.getValue() as unknown as StatusArtigo,
            versao: { increment: 1 },
          },
        });

        if (resultado.count === 0) {
          throw new Error(
            'Conflito de concorrência: o artigo foi modificado por outra operação simultânea.',
          );
        }

        // Sincroniza revisores atribuídos dentro da mesma transação
        await tx.artigosRevisores.deleteMany({
          where: {
            artigoId: artigo.id,
            revisorId: { notIn: artigo.revisoresIds },
          },
        });

        for (const revisorId of artigo.revisoresIds) {
          await tx.artigosRevisores.upsert({
            where: {
              artigoId_revisorId: {
                artigoId: artigo.id,
                revisorId,
              },
            },
            create: {
              artigoId: artigo.id,
              revisorId,
            },
            update: {},
          });
        }
      }

      // Grava o histórico imutável (Append-Only: apenas INSERT, nunca UPDATE ou DELETE)
      await tx.auditLog.create({
        data: {
          id: logEntity.id,
          artigoId: logEntity.artigoId,
          estadoAnterior: (logEntity.estadoAnterior as unknown as StatusArtigo) ?? null,
          novoEstado: logEntity.novoEstado as unknown as StatusArtigo,
          autorId: logEntity.autorId,
          justificativa: logEntity.justificativa ?? null,
          timestamp: logEntity.timestamp,
        },
      });
    });

    if (auditoria.estadoAnterior !== null) {
      artigo.incrementarVersao();
    }
    artigo.adicionarLogAuditoria(logEntity);
  }

  async salvar(artigo: ArtigoEntity): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.artigo.upsert({
        where: { id: artigo.id },
        create: {
          id: artigo.id,
          titulo: artigo.titulo,
          resumo: artigo.resumo,
          autorId: artigo.autorId,
          editorId: artigo.editorId ?? null,
          arquivoUrl: artigo.manuscrito.url,
          ...(artigo.manuscritoIdentificado?.url
            ? ({ arquivoIdentificadoUrl: artigo.manuscritoIdentificado.url } as Record<string, unknown>)
            : {}),
          status: artigo.status.getValue() as unknown as StatusArtigo,
          versao: artigo.versao,
        },
        update: {
          titulo: artigo.titulo,
          resumo: artigo.resumo,
          editorId: artigo.editorId ?? null,
          arquivoUrl: artigo.manuscrito.url,
          ...(artigo.manuscritoIdentificado?.url
            ? ({ arquivoIdentificadoUrl: artigo.manuscritoIdentificado.url } as Record<string, unknown>)
            : {}),
          status: artigo.status.getValue() as unknown as StatusArtigo,
        },
      });

      await tx.artigosRevisores.deleteMany({
        where: {
          artigoId: artigo.id,
          revisorId: { notIn: artigo.revisoresIds },
        },
      });

      for (const revisorId of artigo.revisoresIds) {
        await tx.artigosRevisores.upsert({
          where: {
            artigoId_revisorId: {
              artigoId: artigo.id,
              revisorId,
            },
          },
          create: {
            artigoId: artigo.id,
            revisorId,
          },
          update: {},
        });
      }

      for (const revisao of artigo.revisoes) {
        const recomendacao: RecomendacaoRevisao = revisao.estaAprovado
          ? RecomendacaoRevisao.ACEITAR
          : RecomendacaoRevisao.REJEITAR;

        await tx.revisao.upsert({
          where: {
            artigoId_revisorId: {
              artigoId: artigo.id,
              revisorId: revisao.revisorId,
            },
          },
          create: {
            id: revisao.id,
            artigoId: artigo.id,
            revisorId: revisao.revisorId,
            nota: revisao.nota,
            parecer: revisao.comentarios,
            recomendacao,
          },
          update: {
            nota: revisao.nota,
            parecer: revisao.comentarios,
            recomendacao,
          },
        });
      }
    });
  }

  async excluir(id: string): Promise<void> {
    await this.prisma.artigo.delete({
      where: { id },
    });
  }
}
