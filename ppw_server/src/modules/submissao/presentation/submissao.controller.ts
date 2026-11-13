import { Controller, Post, Body, Param, Get, Patch, Put, Delete, Inject } from '@nestjs/common';
import { SUBMETER_ARTIGO_USE_CASE } from '../application/use-case/write/submeter.artigo.use-case';
import type { SubmeterArtigoUseCase } from '../application/use-case/write/submeter.artigo.use-case';
import { ALTERAR_ARTIGO_USE_CASE } from '../application/use-case/write/alterar.artigo.use-case';
import type { AlterarArtigoUseCase } from '../application/use-case/write/alterar.artigo.use-case';
import { EXCLUIR_ARTIGO_USE_CASE } from '../application/use-case/write/excluir.artigo.use-case';
import type { ExcluirArtigoUseCase } from '../application/use-case/write/excluir.artigo.use-case';
import { ASSUMIR_ARTIGO_USE_CASE } from '../application/use-case/write/assumir.artigo.use-case';
import type { AssumirArtigoUseCase } from '../application/use-case/write/assumir.artigo.use-case';
import { ABANDONAR_ARTIGO_USE_CASE } from '../application/use-case/write/abandonar.artigo.use-case';
import type { AbandonarArtigoUseCase } from '../application/use-case/write/abandonar.artigo.use-case';
import { ATRIBUIR_REVISOR_USE_CASE } from '../application/use-case/write/atribuir.revisor.use-case';
import type { AtribuirRevisorUseCase } from '../application/use-case/write/atribuir.revisor.use-case';
import { DESATRIBUIR_REVISOR_USE_CASE } from '../application/use-case/write/desatribuir.revisor.use-case';
import type { DesatribuirRevisorUseCase } from '../application/use-case/write/desatribuir.revisor.use-case';
import { SUBMETER_REVISAO_USE_CASE } from '../application/use-case/write/submeter.revisao.use-case';
import type { SubmeterRevisaoUseCase } from '../application/use-case/write/submeter.revisao.use-case';
import { DECIDIR_STATUS_ARTIGO_USE_CASE } from '../application/use-case/write/decidir.status.artigo.use-case';
import type { DecidirStatusArtigoUseCase } from '../application/use-case/write/decidir.status.artigo.use-case';
import { BUSCAR_ARTIGOS_USE_CASE } from '../application/use-case/read/buscar.artigos.use-case';
import type { BuscarArtigosUseCase } from '../application/use-case/read/buscar.artigos.use-case';
import { BUSCAR_ARTIGO_POR_ID_USE_CASE } from '../application/use-case/read/buscar.artigo-por-id.use-case';
import type { BuscarArtigoPorIdUseCase } from '../application/use-case/read/buscar.artigo-por-id.use-case';
import {
  SubmeterArtigoRequest,
  AlterarArtigoRequest,
  AtribuirRevisorRequest,
  SubmeterRevisaoRequest,
  AssumirArtigoRequest,
  DesatribuirRevisorRequest,
  DecidirStatusRequest,
} from '../application/dto/submissao.dto.request';

@Controller('submissoes')
export class SubmissaoController {
  constructor(
    @Inject(SUBMETER_ARTIGO_USE_CASE)
    private readonly submeterArtigoUseCase: SubmeterArtigoUseCase,
    @Inject(ALTERAR_ARTIGO_USE_CASE)
    private readonly alterarArtigoUseCase: AlterarArtigoUseCase,
    @Inject(EXCLUIR_ARTIGO_USE_CASE)
    private readonly excluirArtigoUseCase: ExcluirArtigoUseCase,
    @Inject(ASSUMIR_ARTIGO_USE_CASE)
    private readonly assumirArtigoUseCase: AssumirArtigoUseCase,
    @Inject(ABANDONAR_ARTIGO_USE_CASE)
    private readonly abandonarArtigoUseCase: AbandonarArtigoUseCase,
    @Inject(ATRIBUIR_REVISOR_USE_CASE)
    private readonly atribuirRevisorUseCase: AtribuirRevisorUseCase,
    @Inject(DESATRIBUIR_REVISOR_USE_CASE)
    private readonly desatribuirRevisorUseCase: DesatribuirRevisorUseCase,
    @Inject(SUBMETER_REVISAO_USE_CASE)
    private readonly submeterRevisaoUseCase: SubmeterRevisaoUseCase,
    @Inject(DECIDIR_STATUS_ARTIGO_USE_CASE)
    private readonly decidirStatusArtigoUseCase: DecidirStatusArtigoUseCase,
    @Inject(BUSCAR_ARTIGOS_USE_CASE)
    private readonly buscarArtigosUseCase: BuscarArtigosUseCase,
    @Inject(BUSCAR_ARTIGO_POR_ID_USE_CASE)
    private readonly buscarArtigoPorIdUseCase: BuscarArtigoPorIdUseCase,
  ) {}

  @Post('artigo')
  async submeterArtigo(@Body() dto: SubmeterArtigoRequest) {
    return await this.submeterArtigoUseCase.execute(dto);
  }

  @Get('artigo/:id')
  async getArtigoPorId(@Param('id') artigoId: string) {
    return await this.buscarArtigoPorIdUseCase.execute(artigoId);
  }

  @Put('artigo/:id')
  async alterarArtigo(@Param('id') artigoId: string, @Body() dto: AlterarArtigoRequest) {
    return await this.alterarArtigoUseCase.execute(artigoId, dto);
  }

  @Delete('artigo/:id')
  async excluirArtigo(@Param('id') artigoId: string) {
    return await this.excluirArtigoUseCase.execute(artigoId);
  }

  @Post('artigo/:id/assumir')
  async assumirArtigo(@Param('id') artigoId: string, @Body() body: AssumirArtigoRequest) {
    return await this.assumirArtigoUseCase.execute(artigoId, body.editorId);
  }

  @Post('artigo/:id/abandonar')
  async abandonarArtigo(@Param('id') artigoId: string) {
    return await this.abandonarArtigoUseCase.execute(artigoId);
  }

  @Post('atribuir-revisor')
  async atribuirRevisor(@Body() dto: AtribuirRevisorRequest) {
    return await this.atribuirRevisorUseCase.execute(dto);
  }

  @Post('artigo/:id/desatribuir-revisor')
  async desatribuirRevisor(@Param('id') artigoId: string, @Body() body: DesatribuirRevisorRequest) {
    return await this.desatribuirRevisorUseCase.execute(artigoId, body.revisorId);
  }

  @Post('revisao')
  async submeterRevisao(@Body() dto: SubmeterRevisaoRequest) {
    return await this.submeterRevisaoUseCase.execute(dto);
  }

  @Patch('artigo/:id/decidir')
  async decidirStatus(@Param('id') artigoId: string, @Body() body: DecidirStatusRequest) {
    return await this.decidirStatusArtigoUseCase.execute(artigoId, body.status);
  }

  @Get('artigos')
  async getTodosArtigos() {
    return await this.buscarArtigosUseCase.execute();
  }
}
