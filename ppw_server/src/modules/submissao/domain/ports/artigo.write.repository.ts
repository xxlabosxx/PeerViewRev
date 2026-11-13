import { ArtigoEntity } from '../entity/artigo.entity';
import { RegistroAuditoriaTransicao } from '../entity/audit-log.entity';

export type { RegistroAuditoriaTransicao };

export const ARTIGO_WRITE_REPOSITORY = 'ARTIGO_WRITE_REPOSITORY';

export interface ArtigoWriteRepository {
  salvar(artigo: ArtigoEntity): Promise<void>;
  salvarComAuditoria(
    artigo: ArtigoEntity,
    auditoria: RegistroAuditoriaTransicao,
  ): Promise<void>;
  excluir(id: string): Promise<void>;
}
