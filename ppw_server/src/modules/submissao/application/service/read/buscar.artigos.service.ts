import { Inject, Injectable } from '@nestjs/common';
import { ARTIGO_READ_REPOSITORY } from '../../../domain/ports/artigo.read.repository';
import type { ArtigoReadRepository } from '../../../domain/ports/artigo.read.repository';
import { ArtigoMappers } from '../../../infrastructure/mappers/artigo.mappers';
import type { BuscarArtigosUseCase, ConsultaArtigoViewer } from '../../use-case/read/buscar.artigos.use-case';
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
export class BuscarArtigosService implements BuscarArtigosUseCase {
  constructor(
    @Inject(ARTIGO_READ_REPOSITORY)
    private readonly repository: ArtigoReadRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(viewer?: ConsultaArtigoViewer): Promise<ArtigoResponse[]> {
    const [artigos, usuarios] = await Promise.all([
      this.repository.buscarTodos(),
      this.usuarioRepository.listarTodos(),
    ]);

    const usuariosMap = new Map(usuarios.map((u) => [u.id, u]));
    const role = normalizeRole(viewer?.role);
    const userId = viewer?.userId?.trim();

    const artigosFiltrados = artigos.filter((artigo) => {
      if (role === 'EDITOR') {
        return true;
      }
      if (role === 'AUTOR') {
        return !!userId && artigo.autorId === userId;
      }
      if (role === 'REVISOR') {
        return userId ? artigo.revisoresIds.includes(userId) : false;
      }
      return artigo.status.isPublicado();
    });

    return artigosFiltrados.map((artigo) =>
      ArtigoMappers.toArtigoResponseFromEntity(artigo, {
        userId,
        role,
        usuariosMap,
      }),
    );
  }
}
