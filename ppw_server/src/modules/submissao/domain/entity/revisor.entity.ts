import { Entity } from '../../../../core/domain/Entity';

export interface RevisorProps {
  nome: string;
  email: string;
}

export class RevisorEntity extends Entity<RevisorProps> {
  private constructor(props: RevisorProps, id?: string) {
    super(props, id);
  }

  public static create(props: RevisorProps, id?: string): RevisorEntity {
    if (!props.nome) {
      throw new Error('O revisor deve ter um nome.');
    }
    if (!props.email) {
      throw new Error('O revisor deve ter um email.');
    }
    return new RevisorEntity(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }
}
