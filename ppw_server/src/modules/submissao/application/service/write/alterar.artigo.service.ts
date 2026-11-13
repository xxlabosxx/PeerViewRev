import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlterarArtigoUseCase } from '../../use-case/write/alterar.artigo.use-case';
import type { AlterarArtigoRequest } from '../../dto/submissao.dto.request';
import type { ArtigoResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';
import { ManuscritoValueObject } from '../../../domain/value-objects/manuscrito.value.object';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';

@Injectable()
export class AlterarArtigoService implements AlterarArtigoUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
  ) {}

  async execute(artigoId: string, request: AlterarArtigoRequest): Promise<ArtigoResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    try {
      let novoManuscrito: ManuscritoValueObject | undefined;
      if (request.nomeArquivoManuscrito && request.urlManuscrito) {
        novoManuscrito = ManuscritoValueObject.create({
          nomeArquivo: request.nomeArquivoManuscrito,
          url: request.urlManuscrito,
        });
      }

      artigo.alterarDados({
        titulo: request.titulo,
        resumo: request.resumo,
        manuscrito: novoManuscrito,
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Dados inválidos para alteração do artigo.');
    }

    await this.writeRepository.salvar(artigo);
    return ArtigoMappers.toArtigoResponseFromEntity(artigo);
  }
}

