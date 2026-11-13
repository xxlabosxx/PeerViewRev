import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { CadastrarUsuarioUseCase } from '../use-case/cadastrar.usuario.use-case';
import type { CadastrarUsuarioDto, UsuarioResponseDto } from '../dtos/UsuarioDtos';
import { USUARIO_REPOSITORY } from '../../domain/ports/usuario.repository';
import type { UsuarioRepository } from '../../domain/ports/usuario.repository';

@Injectable()
export class CadastrarUsuarioService implements CadastrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(dto: CadastrarUsuarioDto): Promise<UsuarioResponseDto> {
    const usuarioExistente = await this.usuarioRepository.buscarPorNome(dto.nome);
    if (usuarioExistente) {
      throw new HttpException('Nome de usuário já existe.', HttpStatus.BAD_REQUEST);
    }

    const usuario = await this.usuarioRepository.criar(dto.nome, dto.senha, dto.papel);
    return {
      id: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
    };
  }
}

