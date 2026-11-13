import { Inject, Injectable } from '@nestjs/common';
import type { ListarUsuariosUseCase } from '../use-case/listar.usuarios.use-case';
import type { UsuarioResponseDto } from '../dtos/UsuarioDtos';
import { USUARIO_REPOSITORY } from '../../domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../domain/ports/usuario.repository';

@Injectable()
export class ListarUsuariosService implements ListarUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async listarTodos(): Promise<UsuarioResponseDto[]> {
    const todos = await this.usuarioRepository.listarTodos();
    return todos.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      instituicao: u.instituicao,
      papel: u.papel,
    }));
  }

  async listarPorPapel(papel: 'AUTOR' | 'EDITOR' | 'REVISOR'): Promise<UsuarioResponseDto[]> {
    const filtrados = await this.usuarioRepository.listarPorPapel(papel);
    return filtrados.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      instituicao: u.instituicao,
      papel: u.papel,
    }));
  }
}

