import { Entity } from '../../../../core/domain/Entity';

export interface RevisaoProps {
  revisorId: string;
  artigoId: string;
  nota: number;
  comentarios: string;
  estaAprovado: boolean;
}

export class RevisaoEntity extends Entity<RevisaoProps> {
  private constructor(props: RevisaoProps, id?: string) {
    super(props, id);
  }

  public static create(props: RevisaoProps, id?: string): RevisaoEntity {
    if (props.nota < 1 || props.nota > 5) {
      throw new Error('A nota da revisão deve estar entre 1 e 5.');
    }
    if (!props.revisorId) {
      throw new Error('A revisão deve estar associada a um revisor.');
    }
    if (!props.artigoId) {
      throw new Error('A revisão deve estar associada a um artigo.');
    }

    return new RevisaoEntity(props, id);
  }

  get revisorId(): string {
    return this.props.revisorId;
  }

  get artigoId(): string {
    return this.props.artigoId;
  }

  get nota(): number {
    return this.props.nota;
  }

  get comentarios(): string {
    return this.props.comentarios;
  }

  get estaAprovado(): boolean {
    return this.props.estaAprovado;
  }
}
