import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { ManuscritoValueObject } from '../../domain/value-objects/manuscrito.value.object';
import { SubmeterArtigoRequest } from '../../application/dto/submissao.dto.request';
import {
  ArtigoResponse,
  AuditLogResponse,
  RevisaoResponse,
} from '../../application/dto/submissao.dto.response';
import { Usuario } from '../../../usuarios/domain/Usuario';

export interface BlindReviewViewerContext {
  userId?: string;
  role?: 'AUTOR' | 'REVISOR' | 'EDITOR' | 'NEUTRO';
  usuariosMap?: Map<string, Usuario>;
}

export class ArtigoMappers {
  static toArtigoEntityFromRequest(request: SubmeterArtigoRequest): ArtigoEntity {
    const manuscrito = ManuscritoValueObject.create({
      nomeArquivo: request.nomeArquivoManuscrito,
      url: request.urlManuscrito,
    });

    const manuscritoIdentificado =
      request.nomeArquivoIdentificado && request.urlManuscritoIdentificado
        ? ManuscritoValueObject.create({
            nomeArquivo: request.nomeArquivoIdentificado,
            url: request.urlManuscritoIdentificado,
          })
        : undefined;

    return ArtigoEntity.create({
      titulo: request.titulo,
      resumo: request.resumo,
      autorId: request.autorId,
      manuscrito,
      manuscritoIdentificado,
    });
  }

  /**
   * Converte e sanitiza o ArtigoEntity para ArtigoResponse de acordo com o papel
   * do usuário logado (Double-Blind Review no backend).
   */
  static toArtigoResponseFromEntity(
    entity: ArtigoEntity,
    viewer?: BlindReviewViewerContext,
  ): ArtigoResponse {
    const usuariosMap = viewer?.usuariosMap;
    const role = viewer?.role ?? 'NEUTRO';
    const userId = viewer?.userId;
    const status = entity.status.getValue();
    const estaPublicado = entity.status.isPublicado();
    const foiDecidido =
      entity.status.isAceito() || entity.status.isRejeitado() || estaPublicado;

    const getNomeUsuario = (id?: string): string | undefined => {
      if (!id) return undefined;
      return usuariosMap?.get(id)?.nome;
    };

    const editorNome = entity.editorId ? (getNomeUsuario(entity.editorId) ?? 'Editor') : undefined;

    const mapearHistoricoAuditoria = (ocultarAutorManuscrito: boolean): AuditLogResponse[] =>
      entity.historicoAuditoria.map((log) => {
        const ehAcaoDoAutorDoArtigo = log.autorId === entity.autorId;
        const deveMascararAtor = ocultarAutorManuscrito && ehAcaoDoAutorDoArtigo;

        return {
          id: log.id,
          artigoId: log.artigoId,
          estadoAnterior: log.estadoAnterior,
          novoEstado: log.novoEstado,
          autorId: deveMascararAtor ? 'ANONIMO' : log.autorId,
          autorNome: deveMascararAtor
            ? 'Autor Anônimo (Double-Blind)'
            : (getNomeUsuario(log.autorId) ??
              (ehAcaoDoAutorDoArtigo ? 'Autor' : 'Editor')),
          justificativa: log.justificativa,
          timestamp: log.timestamp.toISOString(),
        };
      });

    // 1. EDITOR: visão editorial completa (Double-Blind)
    if (role === 'EDITOR') {
      return {
        id: entity.id,
        titulo: entity.titulo,
        resumo: entity.resumo,
        nomeArquivoManuscrito: entity.manuscrito.nomeArquivo,
        urlManuscrito: entity.manuscrito.url,
        nomeArquivoIdentificado: entity.manuscritoIdentificado?.nomeArquivo,
        urlManuscritoIdentificado: entity.manuscritoIdentificado?.url,
        status,
        versao: entity.versao,
        autorId: entity.autorId,
        autorNome: getNomeUsuario(entity.autorId) ?? 'Autor',
        autorInstituicao: usuariosMap?.get(entity.autorId)?.instituicao,
        editorId: entity.editorId,
        editorNome,
        revisoresIds: entity.revisoresIds,
        revisoresDetalhes: entity.revisoresIds.map((revId) => {
          const revUser = usuariosMap?.get(revId);
          return {
            id: revId,
            nome: revUser?.nome ?? 'Revisor',
            instituicao: revUser?.instituicao,
          };
        }),
        revisoes: entity.revisoes.map((r) => ({
          id: r.id,
          revisorId: r.revisorId,
          revisorNome: getNomeUsuario(r.revisorId) ?? 'Revisor',
          artigoId: r.artigoId,
          nota: r.nota,
          comentarios: r.comentarios,
          estaAprovado: r.estaAprovado,
        })),
        historicoAuditoria: mapearHistoricoAuditoria(false),
        blindReviewAtivo: false,
      };
    }

    // 2. REVISOR: oculta autor e versão identificada até o status PUBLICADO; oculta outros revisores
    if (role === 'REVISOR') {
      const autorRevelado = estaPublicado;
      const minhasRevisoes: RevisaoResponse[] = entity.revisoes
        .filter((r) => Boolean(userId) && r.revisorId === userId)
        .map((r) => ({
          id: r.id,
          revisorId: r.revisorId,
          revisorNome: 'Minha Avaliação',
          artigoId: r.artigoId,
          nota: r.nota,
          comentarios: r.comentarios,
          estaAprovado: r.estaAprovado,
        }));

      return {
        id: entity.id,
        titulo: entity.titulo,
        resumo: entity.resumo,
        nomeArquivoManuscrito: entity.manuscrito.nomeArquivo,
        urlManuscrito: entity.manuscrito.url,
        nomeArquivoIdentificado: autorRevelado
          ? entity.manuscritoIdentificado?.nomeArquivo
          : undefined,
        urlManuscritoIdentificado: autorRevelado
          ? entity.manuscritoIdentificado?.url
          : undefined,
        status,
        versao: entity.versao,
        autorId: autorRevelado ? entity.autorId : 'ANONIMO',
        autorNome: autorRevelado
          ? (getNomeUsuario(entity.autorId) ?? 'Autor')
          : 'Autor Anônimo (Double-Blind)',
        autorInstituicao: autorRevelado
          ? usuariosMap?.get(entity.autorId)?.instituicao
          : undefined,
        editorId: entity.editorId,
        editorNome,
        revisoresIds: userId && entity.revisoresIds.includes(userId) ? [userId] : [],
        revisoes: minhasRevisoes,
        historicoAuditoria: mapearHistoricoAuditoria(!autorRevelado),
        blindReviewAtivo: !autorRevelado,
      };
    }

    // 3. AUTOR: vê seu próprio artigo, mas NUNCA vê IDs ou nomes reais dos revisores
    if (role === 'AUTOR') {
      const ehProprioAutor = Boolean(userId) && entity.autorId === userId;
      const revisoesMascaradas: RevisaoResponse[] =
        ehProprioAutor && foiDecidido
          ? entity.revisoes.map((r, index) => ({
              id: r.id,
              revisorId: `REVISOR_${index + 1}`,
              revisorNome: `Revisor #${index + 1}`,
              artigoId: r.artigoId,
              nota: r.nota,
              comentarios: r.comentarios,
              estaAprovado: r.estaAprovado,
            }))
          : [];

      return {
        id: entity.id,
        titulo: entity.titulo,
        resumo: entity.resumo,
        nomeArquivoManuscrito: entity.manuscrito.nomeArquivo,
        urlManuscrito: entity.manuscrito.url,
        nomeArquivoIdentificado: ehProprioAutor
          ? entity.manuscritoIdentificado?.nomeArquivo
          : undefined,
        urlManuscritoIdentificado: ehProprioAutor
          ? entity.manuscritoIdentificado?.url
          : undefined,
        status,
        versao: entity.versao,
        autorId: entity.autorId,
        autorNome: getNomeUsuario(entity.autorId) ?? 'Autor',
        autorInstituicao: usuariosMap?.get(entity.autorId)?.instituicao,
        editorId: entity.editorId,
        editorNome,
        revisoresIds: [],
        revisoes: revisoesMascaradas,
        historicoAuditoria: mapearHistoricoAuditoria(false),
        blindReviewAtivo: true,
      };
    }

    // 4. NEUTRO / Público: apenas dados seguros de artigos publicados (revisores seguem anônimos)
    return {
      id: entity.id,
      titulo: entity.titulo,
      resumo: entity.resumo,
      nomeArquivoManuscrito: entity.manuscrito.nomeArquivo,
      urlManuscrito: entity.manuscrito.url,
      status,
      versao: entity.versao,
      autorId: estaPublicado ? entity.autorId : 'ANONIMO',
      autorNome: estaPublicado
        ? (getNomeUsuario(entity.autorId) ?? 'Autor')
        : 'Autor Anônimo (Double-Blind)',
      autorInstituicao: estaPublicado ? usuariosMap?.get(entity.autorId)?.instituicao : undefined,
      editorId: entity.editorId,
      editorNome,
      revisoresIds: [],
      revisoes: [],
      historicoAuditoria: mapearHistoricoAuditoria(!estaPublicado),
      blindReviewAtivo: !estaPublicado,
    };
  }
}
