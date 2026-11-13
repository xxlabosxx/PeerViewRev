import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  DecidirStatusArtigoUseCase,
  DecidirStatusOpcoes,
} from '../../use-case/write/decidir.status.artigo.use-case';
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

  async execute(
    artigoId: string,
    status: 'ACEITO' | 'REJEITADO',
    opcoes?: DecidirStatusOpcoes,
  ): Promise<DecidirStatusResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    const estadoAnterior = artigo.status.getValue();

    try {
      artigo.decidirStatus(status as StatusArtigoEnum.ACEITO | StatusArtigoEnum.REJEITADO);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    const atorId = opcoes?.atorId || artigo.editorId || artigo.autorId;
    const justificativa =
      opcoes?.justificativa?.trim() ||
      `Decisão editorial registrada: manuscrito ${artigo.status.getValue()}.`;

    try {
      await this.writeRepository.salvarComAuditoria(artigo, {
        estadoAnterior,
        novoEstado: artigo.status.getValue(),
        atorId,
        justificativa,
      });
    } catch (error: any) {
      if (error?.message?.includes('Conflito de concorrência')) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    return {
      mensagem: 'Status do artigo decidido',
      artigoId: artigo.id,
      status: artigo.status.getValue(),
    };
  }
}
