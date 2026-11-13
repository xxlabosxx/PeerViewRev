import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AtribuirRevisorUseCase } from '../../use-case/write/atribuir.revisor.use-case';
import type { AtribuirRevisorRequest } from '../../dto/submissao.dto.request';
import type { MensagemResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';
import { USUARIO_REPOSITORY } from '../../../../usuarios/domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../../../usuarios/domain/ports/usuario.repository';

@Injectable()
export class AtribuirRevisorService implements AtribuirRevisorUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(request: AtribuirRevisorRequest): Promise<MensagemResponse> {
    const artigo = await this.readRepository.buscarPorId(request.artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    const revisor = await this.usuarioRepository.buscarPorId(request.revisorId);
    if (!revisor) {
      throw new NotFoundException('Revisor não encontrado.');
    }

    if (revisor.papel !== 'REVISOR') {
      throw new BadRequestException('O usuário informado não possui o papel de REVISOR.');
    }

    const autor = await this.usuarioRepository.buscarPorId(artigo.autorId);
    if (autor) {
      const verificacaoCoi = autor.possuiConflitoInstitucionalCom(revisor);
      if (verificacaoCoi.conflito) {
        throw new BadRequestException(
          `Conflito de interesse (Blind Review): ${verificacaoCoi.motivo}`,
        );
      }
    }

    const estadoAnterior = artigo.status.getValue();

    try {
      artigo.atribuirRevisor(request.revisorId);
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
          justificativa: 'Revisor atribuído; manuscrito entrou em revisão por pares.',
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

    return { mensagem: 'Revisor atribuído com sucesso' };
  }
}
