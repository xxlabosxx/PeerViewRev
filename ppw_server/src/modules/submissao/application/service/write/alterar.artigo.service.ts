import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlterarArtigoUseCase } from '../../use-case/write/alterar.artigo.use-case';
import type { AlterarArtigoRequest } from '../../dto/submissao.dto.request';
import type { ArtigoResponse } from '../../dto/submissao.dto.response';
import type { ConsultaArtigoViewer } from '../../use-case/read/buscar.artigos.use-case';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';
import { ManuscritoValueObject } from '../../../domain/value-objects/manuscrito.value.object';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';
import { USUARIO_REPOSITORY } from '../../../../usuarios/domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../../../usuarios/domain/ports/usuario.repository';

@Injectable()
export class AlterarArtigoService implements AlterarArtigoUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(
    artigoId: string,
    request: AlterarArtigoRequest,
    viewer?: ConsultaArtigoViewer,
  ): Promise<ArtigoResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    const roleUpper = (viewer?.role || '').trim().toUpperCase();
    if (roleUpper === 'REVISOR') {
      throw new ForbiddenException('Revisores não podem alterar os dados do artigo.');
    }
    if (roleUpper === 'AUTOR' && viewer?.userId && artigo.autorId !== viewer.userId) {
      throw new ForbiddenException('Você não tem permissão para alterar o artigo de outro autor.');
    }

    try {
      let novoManuscrito: ManuscritoValueObject | undefined;
      if (request.nomeArquivoManuscrito && request.urlManuscrito) {
        novoManuscrito = ManuscritoValueObject.create({
          nomeArquivo: request.nomeArquivoManuscrito,
          url: request.urlManuscrito,
        });
      }

      let novoManuscritoIdentificado: ManuscritoValueObject | undefined;
      if (request.nomeArquivoIdentificado && request.urlManuscritoIdentificado) {
        novoManuscritoIdentificado = ManuscritoValueObject.create({
          nomeArquivo: request.nomeArquivoIdentificado,
          url: request.urlManuscritoIdentificado,
        });
      }

      artigo.alterarDados({
        titulo: request.titulo,
        resumo: request.resumo,
        manuscrito: novoManuscrito,
        manuscritoIdentificado: novoManuscritoIdentificado,
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Dados inválidos para alteração do artigo.');
    }

    await this.writeRepository.salvar(artigo);

    const usuarios = await this.usuarioRepository.listarTodos();
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u]));
    const viewerRole =
      roleUpper === 'EDITOR' ? 'EDITOR' : 'AUTOR';

    return ArtigoMappers.toArtigoResponseFromEntity(artigo, {
      userId: viewer?.userId ?? artigo.autorId,
      role: viewerRole,
      usuariosMap,
    });
  }
}

