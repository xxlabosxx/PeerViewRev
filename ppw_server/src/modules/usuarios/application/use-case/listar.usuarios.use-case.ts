import { UsuarioResponseDto } from '../dtos/UsuarioDtos';

export const LISTAR_USUARIOS_USE_CASE = 'LISTAR_USUARIOS_USE_CASE';

export interface ListarUsuariosUseCase {
  listarTodos(): Promise<UsuarioResponseDto[]>;
  listarPorPapel(papel: 'AUTOR' | 'EDITOR' | 'REVISOR'): Promise<UsuarioResponseDto[]>;
}

