import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AtribuirRevisorUseCase } from '../../use-case/write/atribuir.revisor.use-case';
import type { AtribuirRevisorRequest } from '../../dto/submissao.dto.request';
import type { MensagemResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';

@Injectable()
export class AtribuirRevisorService implements AtribuirRevisorUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
  ) {}

  async execute(request: AtribuirRevisorRequest): Promise<MensagemResponse> {
    const artigo = await this.readRepository.buscarPorId(request.artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    try {
      artigo.atribuirRevisor(request.revisorId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    await this.writeRepository.salvar(artigo);

    return { mensagem: 'Revisor atribuído com sucesso' };
  }
}
