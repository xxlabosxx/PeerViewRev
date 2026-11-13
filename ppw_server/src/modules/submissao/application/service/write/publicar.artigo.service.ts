import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PublicarArtigoUseCase } from '../../use-case/write/publicar.artigo.use-case';
import type { PublicarArtigoResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';

@Injectable()
export class PublicarArtigoService implements PublicarArtigoUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
  ) {}

  async execute(artigoId: string): Promise<PublicarArtigoResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    try {
      artigo.publicar();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    await this.writeRepository.salvar(artigo);

    return {
      mensagem: 'Artigo publicado com sucesso! Autoria revelada.',
      artigoId: artigo.id,
      status: artigo.status.getValue(),
    };
  }
}
