import { ValueObject } from '../../../../core/domain/ValueObject';

export interface ManuscritoProps {
  nomeArquivo: string;
  url: string;
}

export class ManuscritoValueObject extends ValueObject<ManuscritoProps> {
  private constructor(props: ManuscritoProps) {
    super(props);
  }

  public static create(props: ManuscritoProps): ManuscritoValueObject {
    if (!props.nomeArquivo || props.nomeArquivo.trim().length === 0) {
      throw new Error('O nome do arquivo do manuscrito não pode estar vazio.');
    }
    if (!props.url || props.url.trim().length === 0) {
      throw new Error('A url/caminho do manuscrito não pode estar vazia.');
    }
    if (!props.nomeArquivo.toLowerCase().endsWith('.pdf')) {
      throw new Error('O manuscrito deve ser um arquivo PDF.');
    }

    return new ManuscritoValueObject(props);
  }

  get nomeArquivo(): string {
    return this.props.nomeArquivo;
  }

  get url(): string {
    return this.props.url;
  }
}
