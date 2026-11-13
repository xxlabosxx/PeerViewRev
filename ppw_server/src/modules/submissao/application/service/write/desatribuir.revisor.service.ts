import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    const estadoAnterior = artigo.status.getValue();

    try {
      artigo.desatribuirRevisor(revisorId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    const novoEstado = artigo.status.getValue();
    try {
      if (estadoAnterior !== novoEstado) {
        await this.writeRepository.salvarComAuditoria(artigo, {
          estadoAnterior,
          novoEstado,
          atorId: artigo.editorId || artigo.autorId,
          justificativa: 'Todos os revisores foram desatribuídos; manuscrito retornou ao estado PENDENTE.',
        });
      } else {
        await this.writeRepository.salvar(artigo);
      }
    } catch (error: any) {
      if (error?.message?.includes('Conflito de concorrência')) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    return { mensagem: 'Revisor desatribuído com sucesso' };
  }
}
