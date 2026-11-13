import { ValueObject } from '../../../../core/domain/ValueObject';

export enum StatusArtigoEnum {
  PENDENTE = 'PENDENTE',
  EM_REVISAO = 'EM_REVISAO',
  ACEITO = 'ACEITO',
  REJEITADO = 'REJEITADO',
  PUBLICADO = 'PUBLICADO',
}

export interface StatusArtigoProps {
  value: StatusArtigoEnum;
}

export class StatusArtigoValueObject extends ValueObject<StatusArtigoProps> {
  private constructor(props: StatusArtigoProps) {
    super(props);
  }

  static pendente(): StatusArtigoValueObject {
    return new StatusArtigoValueObject({ value: StatusArtigoEnum.PENDENTE });
  }

  static emRevisao(): StatusArtigoValueObject {
    return new StatusArtigoValueObject({ value: StatusArtigoEnum.EM_REVISAO });
  }

  static aceito(): StatusArtigoValueObject {
    return new StatusArtigoValueObject({ value: StatusArtigoEnum.ACEITO });
  }

  static rejeitado(): StatusArtigoValueObject {
    return new StatusArtigoValueObject({ value: StatusArtigoEnum.REJEITADO });
  }

  static publicado(): StatusArtigoValueObject {
    return new StatusArtigoValueObject({ value: StatusArtigoEnum.PUBLICADO });
  }

  getValue(): StatusArtigoEnum {
    return this.props.value;
  }

  isPendente(): boolean {
    return this.props.value === StatusArtigoEnum.PENDENTE;
  }

  isEmRevisao(): boolean {
    return this.props.value === StatusArtigoEnum.EM_REVISAO;
  }

  isAceito(): boolean {
    return this.props.value === StatusArtigoEnum.ACEITO;
  }

  isRejeitado(): boolean {
    return this.props.value === StatusArtigoEnum.REJEITADO;
  }

  isPublicado(): boolean {
    return this.props.value === StatusArtigoEnum.PUBLICADO;
  }

  static create(value: unknown): StatusArtigoValueObject {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('O status deve ser um texto não vazio');
    }

    const normalized = value.trim().toUpperCase() as StatusArtigoEnum;

    if (!Object.values(StatusArtigoEnum).includes(normalized)) {
      throw new Error(`O status deve ser um dos seguintes: ${Object.values(StatusArtigoEnum).join(', ')}`);
    }

    return new StatusArtigoValueObject({ value: normalized });
  }
}
