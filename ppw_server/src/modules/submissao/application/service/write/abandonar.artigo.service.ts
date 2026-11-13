import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AbandonarArtigoUseCase } from '../../use-case/write/abandonar.artigo.use-case';
import type { MensagemResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';

@Injectable()
export class AbandonarArtigoService implements AbandonarArtigoUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
  ) {}

  async execute(artigoId: string): Promise<MensagemResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    try {
      artigo.abandonarArtigo();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    await this.writeRepository.salvar(artigo);

    return { mensagem: 'Artigo abandonado com sucesso' };
  }
}
