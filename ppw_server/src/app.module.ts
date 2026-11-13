import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { SubmissaoModule } from './modules/submissao/submissao.module';
import { UsuariosModule } from './modules/usuarios/UsuariosModule';

@Module({
  imports: [PrismaModule, SubmissaoModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
