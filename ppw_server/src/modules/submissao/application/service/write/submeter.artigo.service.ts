import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SubmeterArtigoUseCase } from '../../use-case/write/submeter.artigo.use-case';
import type { SubmeterArtigoRequest } from '../../dto/submissao.dto.request';
import type { SubmeterArtigoResponse } from '../../dto/submissao.dto.response';
import { ARTIGO_WRITE_REPOSITORY } from '../../../domain/ports/artigo.write.repository';
import type { ArtigoWriteRepository } from '../../../domain/ports/artigo.write.repository';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';
import { USUARIO_REPOSITORY } from '../../../../usuarios/domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../../../usuarios/domain/ports/usuario.repository';

@Injectable()
export class SubmeterArtigoService implements SubmeterArtigoUseCase {
  constructor(
    @Inject(ARTIGO_WRITE_REPOSITORY)
    private readonly repository: ArtigoWriteRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(request: SubmeterArtigoRequest): Promise<SubmeterArtigoResponse> {
    const autor = await this.usuarioRepository.buscarPorId(request.autorId);
    if (!autor) {
      throw new NotFoundException('Autor informado não encontrado.');
    }
    if (autor.papel !== 'AUTOR') {
      throw new ForbiddenException('Apenas usuários com perfil AUTOR podem submeter artigos.');
    }

    try {
      const artigoEntity = ArtigoMappers.toArtigoEntityFromRequest(request);
      await this.repository.salvar(artigoEntity);

      return {
        mensagem: 'Artigo submetido com sucesso',
        artigoId: artigoEntity.id,
        status: artigoEntity.status.getValue(),
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Erro ao submeter artigo.');
    }
  }
}
