import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { DecidirStatusArtigoUseCase } from '../../use-case/write/decidir.status.artigo.use-case';
import type { DecidirStatusResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';
import { StatusArtigoEnum } from '../../../domain/value-objects/status.value.object';

@Injectable()
export class DecidirStatusArtigoService implements DecidirStatusArtigoUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
  ) {}

  async execute(artigoId: string, status: 'ACEITO' | 'REJEITADO'): Promise<DecidirStatusResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    try {
      artigo.decidirStatus(status as StatusArtigoEnum.ACEITO | StatusArtigoEnum.REJEITADO);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    await this.writeRepository.salvar(artigo);

    return {
      mensagem: 'Status do artigo decidido',
      artigoId: artigo.id,
      status: artigo.status.getValue(),
    };
  }
}
