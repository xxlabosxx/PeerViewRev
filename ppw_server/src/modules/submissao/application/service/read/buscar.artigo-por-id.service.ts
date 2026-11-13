import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';
import type { BuscarArtigoPorIdUseCase } from '../../use-case/read/buscar.artigo-por-id.use-case';
import type { ArtigoResponse } from '../../dto/submissao.dto.response';

@Injectable()
export class BuscarArtigoPorIdService implements BuscarArtigoPorIdUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly repository: ArtigoReadRepository,
  ) {}

  async execute(artigoId: string): Promise<ArtigoResponse> {
    const artigo = await this.repository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    return ArtigoMappers.toArtigoResponseFromEntity(artigo);
  }
}

