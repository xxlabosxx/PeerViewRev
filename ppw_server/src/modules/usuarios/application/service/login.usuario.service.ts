import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { LoginUsuarioUseCase } from '../use-case/login.usuario.use-case';
import type { LoginUsuarioDto, UsuarioResponseDto } from '../dtos/UsuarioDtos';
import { USUARIO_REPOSITORY } from '../../domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../domain/ports/usuario.repository';

@Injectable()
export class LoginUsuarioService implements LoginUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(dto: LoginUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.buscarPorNome(dto.nome);
    if (!usuario || usuario.senha !== dto.senha) {
      throw new HttpException('Usuário ou senha incorretos. Tente novamente.', HttpStatus.UNAUTHORIZED);
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
    };
  }
}

