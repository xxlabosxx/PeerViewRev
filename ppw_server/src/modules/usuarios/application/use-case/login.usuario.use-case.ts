import { LoginUsuarioDto, UsuarioResponseDto } from '../dtos/UsuarioDtos';

export const LOGIN_USUARIO_USE_CASE = 'LOGIN_USUARIO_USE_CASE';

export interface LoginUsuarioUseCase {
  execute(dto: LoginUsuarioDto): Promise<UsuarioResponseDto>;
}

