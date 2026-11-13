import { CadastrarUsuarioDto, UsuarioResponseDto } from '../dtos/UsuarioDtos';

export const CADASTRAR_USUARIO_USE_CASE = 'CADASTRAR_USUARIO_USE_CASE';

export interface CadastrarUsuarioUseCase {
  execute(dto: CadastrarUsuarioDto): Promise<UsuarioResponseDto>;
}

