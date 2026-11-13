import { Entity } from '../../../../core/domain/Entity';
import { StatusArtigoEnum } from '../value-objects/status.value.object';

export interface RegistroAuditoriaTransicao {
  estadoAnterior: StatusArtigoEnum | null;
  novoEstado: StatusArtigoEnum;
  atorId: string;
  justificativa?: string;
}

export interface AuditLogProps {
  artigoId: string;
  estadoAnterior: StatusArtigoEnum | null;
  novoEstado: StatusArtigoEnum;
  autorId: string;
  justificativa?: string;
  timestamp: Date;
}

export class AuditLogEntity extends Entity<AuditLogProps> {
  private constructor(props: AuditLogProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: {
      artigoId: string;
      estadoAnterior: StatusArtigoEnum | null;
      novoEstado: StatusArtigoEnum;
      autorId: string;
      justificativa?: string;
      timestamp?: Date;
    },
    id?: string,
  ): AuditLogEntity {
    if (!props.artigoId) {
      throw new Error('O registro de auditoria deve estar vinculado a um artigo.');
    }
    if (!props.autorId) {
      throw new Error('O registro de auditoria deve identificar o autor da ação.');
    }

    return new AuditLogEntity(
      {
        artigoId: props.artigoId,
        estadoAnterior: props.estadoAnterior ?? null,
        novoEstado: props.novoEstado,
        autorId: props.autorId,
        justificativa: props.justificativa?.trim() || undefined,
        timestamp: props.timestamp ?? new Date(),
      },
      id,
    );
  }

  get artigoId(): string {
    return this.props.artigoId;
  }

  get estadoAnterior(): StatusArtigoEnum | null {
    return this.props.estadoAnterior;
  }

  get novoEstado(): StatusArtigoEnum {
    return this.props.novoEstado;
  }

  get autorId(): string {
    return this.props.autorId;
  }

  get justificativa(): string | undefined {
    return this.props.justificativa;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }
}
