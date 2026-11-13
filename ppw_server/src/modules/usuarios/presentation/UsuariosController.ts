import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { CadastrarUsuarioDto, LoginUsuarioDto } from '../application/dtos/UsuarioDtos';
import { CADASTRAR_USUARIO_USE_CASE } from '../application/use-case/cadastrar.usuario.use-case';
import type { CadastrarUsuarioUseCase } from '../application/use-case/cadastrar.usuario.use-case';
import { LOGIN_USUARIO_USE_CASE } from '../application/use-case/login.usuario.use-case';
import type { LoginUsuarioUseCase } from '../application/use-case/login.usuario.use-case';
import { LISTAR_USUARIOS_USE_CASE } from '../application/use-case/listar.usuarios.use-case';
import type { ListarUsuariosUseCase } from '../application/use-case/listar.usuarios.use-case';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    @Inject(CADASTRAR_USUARIO_USE_CASE)
    private readonly cadastrarUsuarioUseCase: CadastrarUsuarioUseCase,
    @Inject(LOGIN_USUARIO_USE_CASE)
    private readonly loginUsuarioUseCase: LoginUsuarioUseCase,
    @Inject(LISTAR_USUARIOS_USE_CASE)
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
  ) {}

  @Post('cadastro')
  async cadastrar(@Body() dto: CadastrarUsuarioDto) {
    return await this.cadastrarUsuarioUseCase.execute(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUsuarioDto) {
    return await this.loginUsuarioUseCase.execute(dto);
  }

  @Get('revisores')
  async listarRevisores() {
    return await this.listarUsuariosUseCase.listarPorPapel('REVISOR');
  }

  @Get()
  async listarTodos() {
    return await this.listarUsuariosUseCase.listarTodos();
  }
}

