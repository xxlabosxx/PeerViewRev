import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  PublicarArtigoOpcoes,
  PublicarArtigoUseCase,
} from '../../use-case/write/publicar.artigo.use-case';
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

  async execute(
    artigoId: string,
    opcoes?: PublicarArtigoOpcoes,
  ): Promise<PublicarArtigoResponse> {
    const artigo = await this.readRepository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    const estadoAnterior = artigo.status.getValue();

    try {
      artigo.publicar();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    const atorId = opcoes?.atorId || artigo.editorId || artigo.autorId;
    const justificativa =
      opcoes?.justificativa?.trim() ||
      'Publicação oficial do artigo e abertura de autoria (encerramento do ciclo Double-Blind).';

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
      mensagem: 'Artigo publicado com sucesso! Autoria revelada.',
      artigoId: artigo.id,
      status: artigo.status.getValue(),
    };
  }
}
