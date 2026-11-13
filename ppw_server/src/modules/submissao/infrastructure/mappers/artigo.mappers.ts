import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { ManuscritoValueObject } from '../../domain/value-objects/manuscrito.value.object';
import { SubmeterArtigoRequest } from '../../application/dto/submissao.dto.request';
import { ArtigoResponse } from '../../application/dto/submissao.dto.response';

export class ArtigoMappers {
  static toArtigoEntityFromRequest(request: SubmeterArtigoRequest): ArtigoEntity {
    const manuscrito = ManuscritoValueObject.create({
      nomeArquivo: request.nomeArquivoManuscrito,
      url: request.urlManuscrito,
    });

    return ArtigoEntity.create({
      titulo: request.titulo,
      resumo: request.resumo,
      autorId: request.autorId,
      manuscrito,
    });
  }

  static toArtigoResponseFromEntity(entity: ArtigoEntity): ArtigoResponse {
    return {
      id: entity.id,
      titulo: entity.titulo,
      resumo: entity.resumo,
      nomeArquivoManuscrito: entity.manuscrito.nomeArquivo,
      urlManuscrito: entity.manuscrito.url,
      status: entity.status.getValue(),
      autorId: entity.autorId,
      editorId: entity.editorId,
      revisoresIds: entity.revisoresIds,
      revisoes: entity.revisoes.map((r) => ({
        id: r.id,
        revisorId: r.revisorId,
        artigoId: r.artigoId,
        nota: r.nota,
        comentarios: r.comentarios,
        estaAprovado: r.estaAprovado,
      })),
    };
  }
}
