import { Module } from '@nestjs/common';
import { SubmissaoController } from './presentation/submissao.controller';
import { SUBMETER_ARTIGO_USE_CASE } from './application/use-case/write/submeter.artigo.use-case';
import { SubmeterArtigoService } from './application/service/write/submeter.artigo.service';
import { ALTERAR_ARTIGO_USE_CASE } from './application/use-case/write/alterar.artigo.use-case';
import { AlterarArtigoService } from './application/service/write/alterar.artigo.service';
import { EXCLUIR_ARTIGO_USE_CASE } from './application/use-case/write/excluir.artigo.use-case';
import { ExcluirArtigoService } from './application/service/write/excluir.artigo.service';
import { ASSUMIR_ARTIGO_USE_CASE } from './application/use-case/write/assumir.artigo.use-case';
import { AssumirArtigoService } from './application/service/write/assumir.artigo.service';
import { ABANDONAR_ARTIGO_USE_CASE } from './application/use-case/write/abandonar.artigo.use-case';
import { AbandonarArtigoService } from './application/service/write/abandonar.artigo.service';
import { ATRIBUIR_REVISOR_USE_CASE } from './application/use-case/write/atribuir.revisor.use-case';
import { AtribuirRevisorService } from './application/service/write/atribuir.revisor.service';
import { DESATRIBUIR_REVISOR_USE_CASE } from './application/use-case/write/desatribuir.revisor.use-case';
import { DesatribuirRevisorService } from './application/service/write/desatribuir.revisor.service';
import { SUBMETER_REVISAO_USE_CASE } from './application/use-case/write/submeter.revisao.use-case';
import { SubmeterRevisaoService } from './application/service/write/submeter.revisao.service';
import { DECIDIR_STATUS_ARTIGO_USE_CASE } from './application/use-case/write/decidir.status.artigo.use-case';
import { DecidirStatusArtigoService } from './application/service/write/decidir.status.artigo.service';
import { BUSCAR_ARTIGOS_USE_CASE } from './application/use-case/read/buscar.artigos.use-case';
import { BuscarArtigosService } from './application/service/read/buscar.artigos.service';
import { BUSCAR_ARTIGO_POR_ID_USE_CASE } from './application/use-case/read/buscar.artigo-por-id.use-case';
import { BuscarArtigoPorIdService } from './application/service/read/buscar.artigo-por-id.service';
import { ARTIGO_READ_REPOSITORY } from './domain/ports/artigo.read.repository';
import { ArtigoInMemoryReadRepository } from './infrastructure/adapters/artigo.inmemory.read.repository';
import { ARTIGO_WRITE_REPOSITORY } from './domain/ports/artigo.write.repository';
import { ArtigoInMemoryWriteRepository } from './infrastructure/adapters/artigo.inmemory.write.repository';

const submissaoControllers = [SubmissaoController];

const submissaoProviders = [
  {
    provide: ARTIGO_READ_REPOSITORY,
    useClass: ArtigoInMemoryReadRepository,
  },
  {
    provide: ARTIGO_WRITE_REPOSITORY,
    useClass: ArtigoInMemoryWriteRepository,
  },
  {
    provide: BUSCAR_ARTIGOS_USE_CASE,
    useClass: BuscarArtigosService,
  },
  {
    provide: BUSCAR_ARTIGO_POR_ID_USE_CASE,
    useClass: BuscarArtigoPorIdService,
  },
  {
    provide: SUBMETER_ARTIGO_USE_CASE,
    useClass: SubmeterArtigoService,
  },
  {
    provide: ALTERAR_ARTIGO_USE_CASE,
    useClass: AlterarArtigoService,
  },
  {
    provide: EXCLUIR_ARTIGO_USE_CASE,
    useClass: ExcluirArtigoService,
  },
  {
    provide: ASSUMIR_ARTIGO_USE_CASE,
    useClass: AssumirArtigoService,
  },
  {
    provide: ABANDONAR_ARTIGO_USE_CASE,
    useClass: AbandonarArtigoService,
  },
  {
    provide: ATRIBUIR_REVISOR_USE_CASE,
    useClass: AtribuirRevisorService,
  },
  {
    provide: DESATRIBUIR_REVISOR_USE_CASE,
    useClass: DesatribuirRevisorService,
  },
  {
    provide: SUBMETER_REVISAO_USE_CASE,
    useClass: SubmeterRevisaoService,
  },
  {
    provide: DECIDIR_STATUS_ARTIGO_USE_CASE,
    useClass: DecidirStatusArtigoService,
  },
];

@Module({
  imports: [],
  controllers: [...submissaoControllers],
  providers: [...submissaoProviders],
  exports: [ARTIGO_READ_REPOSITORY, ARTIGO_WRITE_REPOSITORY],
})
export class SubmissaoModule {}
