import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { DesatribuirRevisorUseCase } from '../../use-case/write/desatribuir.revisor.use-case';
import type { MensagemResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';

@Injectable()
export class DesatribuirRevisorService implements DesatribuirRevisorUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
  ) {}

  async execute(artigoId: string, revisorId: string): Promise<MensagemResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    try {
      artigo.desatribuirRevisor(revisorId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    await this.writeRepository.salvar(artigo);

    return { mensagem: 'Revisor desatribuído com sucesso' };
  }
}
