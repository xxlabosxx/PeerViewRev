import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SubmeterRevisaoUseCase } from '../../use-case/write/submeter.revisao.use-case';
import type { SubmeterRevisaoRequest } from '../../dto/submissao.dto.request';
import type { MensagemResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';
import { RevisaoEntity } from '../../../domain/entity/revisao.entity';
import { USUARIO_REPOSITORY } from '../../../../usuarios/domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../../../usuarios/domain/ports/usuario.repository';

@Injectable()
export class SubmeterRevisaoService implements SubmeterRevisaoUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly readRepository: ArtigoReadRepository,
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly writeRepository: ArtigoWriteRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(request: SubmeterRevisaoRequest): Promise<MensagemResponse> {
    const artigo = await this.readRepository.buscarPorId(request.artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    const revisor = await this.usuarioRepository.buscarPorId(request.revisorId);
    if (!revisor) {
      throw new NotFoundException('Revisor não encontrado.');
    }
    if (revisor.papel !== 'REVISOR') {
      throw new ForbiddenException('Apenas usuários com papel REVISOR podem submeter parecer.');
    }

    const autor = await this.usuarioRepository.buscarPorId(artigo.autorId);
    if (autor) {
      const verificacaoCoi = autor.possuiConflitoInstitucionalCom(revisor);
      if (verificacaoCoi.conflito) {
        throw new ForbiddenException(
          `Conflito de interesse (Blind Review): ${verificacaoCoi.motivo}`,
        );
      }
    }

    try {
      const revisao = RevisaoEntity.create({
        artigoId: request.artigoId,
        revisorId: request.revisorId,
        nota: request.nota,
        comentarios: request.comentarios,
        estaAprovado: request.estaAprovado,
      });

      artigo.adicionarRevisao(revisao);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    await this.writeRepository.salvar(artigo);

    return { mensagem: 'Revisão submetida com sucesso' };
  }
}
