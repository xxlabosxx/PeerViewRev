import { Module } from '@nestjs/common';
import { InMemoryUsuarioRepository } from './infrastructure/InMemoryUsuarioRepository';
import { UsuariosController } from './presentation/UsuariosController';
import { USUARIO_REPOSITORY } from './domain/ports/usuario.repository';
import { CADASTRAR_USUARIO_USE_CASE } from './application/use-case/cadastrar.usuario.use-case';
import { CadastrarUsuarioService } from './application/service/cadastrar.usuario.service';
import { LOGIN_USUARIO_USE_CASE } from './application/use-case/login.usuario.use-case';
import { LoginUsuarioService } from './application/service/login.usuario.service';
import { LISTAR_USUARIOS_USE_CASE } from './application/use-case/listar.usuarios.use-case';
import { ListarUsuariosService } from './application/service/listar.usuarios.service';

@Module({
  controllers: [UsuariosController],
  providers: [
    {
      provide: USUARIO_REPOSITORY,
      useClass: InMemoryUsuarioRepository,
    },
    {
      provide: CADASTRAR_USUARIO_USE_CASE,
      useClass: CadastrarUsuarioService,
    },
    {
      provide: LOGIN_USUARIO_USE_CASE,
      useClass: LoginUsuarioService,
    },
    {
      provide: LISTAR_USUARIOS_USE_CASE,
      useClass: ListarUsuariosService,
    },
  ],
  exports: [USUARIO_REPOSITORY],
})
export class UsuariosModule {}
