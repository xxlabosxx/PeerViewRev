import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';
import type { BuscarArtigoPorIdUseCase } from '../../use-case/read/buscar.artigo-por-id.use-case';
import type { ConsultaArtigoViewer } from '../../use-case/read/buscar.artigos.use-case';
import type { ArtigoResponse } from '../../dto/submissao.dto.response';
import { USUARIO_REPOSITORY } from '../../../../usuarios/domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../../../usuarios/domain/ports/usuario.repository';

type ViewerRole = 'AUTOR' | 'REVISOR' | 'EDITOR' | 'NEUTRO';

function normalizeRole(role?: string): ViewerRole {
  const upper = (role || '').trim().toUpperCase();
  if (upper === 'AUTOR' || upper === 'REVISOR' || upper === 'EDITOR') {
    return upper;
  }
  return 'NEUTRO';
}

@Injectable()
export class BuscarArtigoPorIdService implements BuscarArtigoPorIdUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly repository: ArtigoReadRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(artigoId: string, viewer?: ConsultaArtigoViewer): Promise<ArtigoResponse> {
    const artigo = await this.repository.buscarPorId(artigoId);
    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado.');
    }

    const role = normalizeRole(viewer?.role);
    const userId = viewer?.userId?.trim();

    if (role === 'REVISOR') {
      if (!userId || !artigo.revisoresIds.includes(userId)) {
        throw new ForbiddenException(
          'Acesso negado (Blind Review): você não foi atribuído como revisor deste artigo.',
        );
      }
    } else if (role === 'AUTOR') {
      if (!userId || (artigo.autorId !== userId && !artigo.status.isPublicado())) {
        throw new ForbiddenException(
          'Acesso negado: você só pode visualizar seus próprios artigos submetidos.',
        );
      }
    } else if (role === 'NEUTRO') {
      if (!artigo.status.isPublicado()) {
        throw new ForbiddenException(
          'Autenticação necessária para visualizar artigos antes da publicação.',
        );
      }
    }

    const usuarios = await this.usuarioRepository.listarTodos();
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u]));

    return ArtigoMappers.toArtigoResponseFromEntity(artigo, {
      userId,
      role,
      usuariosMap,
    });
  }
}

