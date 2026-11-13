import { Inject, Injectable } from '@nestjs/common';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';
import type { BuscarArtigosUseCase } from '../../use-case/read/buscar.artigos.use-case';
import type { ArtigoResponse } from '../../dto/submissao.dto.response';

@Injectable()
export class BuscarArtigosService implements BuscarArtigosUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly repository: ArtigoReadRepository,
  ) {}

  async execute(): Promise<ArtigoResponse[]> {
    const artigos = await this.repository.buscarTodos();
    return artigos.map((artigo) => ArtigoMappers.toArtigoResponseFromEntity(artigo));
  }
}
