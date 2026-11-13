import { ArtigoEntity } from '../../domain/entity/artigo.entity';
import { AuditLogEntity } from '../../domain/entity/audit-log.entity';

export class InMemoryArtigoStore {
  public static readonly artigos: Map<string, ArtigoEntity> = new Map();
  public static readonly auditLogs: Map<string, AuditLogEntity[]> = new Map();
  public static readonly versoes: Map<string, number> = new Map();

  public static clear(): void {
    this.artigos.clear();
    this.auditLogs.clear();
    this.versoes.clear();
  }
}
