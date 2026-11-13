import { Entity } from '../../../../core/domain/Entity';
import { StatusArtigoValueObject, StatusArtigoEnum } from '../value-objects/status.value.object';
import { ManuscritoValueObject } from '../value-objects/manuscrito.value.object';
import { RevisaoEntity } from './revisao.entity';

export interface ArtigoProps {
  id?: string;
  titulo: string;
  resumo: string;
  autorId: string;
  editorId?: string;
  manuscrito: ManuscritoValueObject;
  manuscritoIdentificado?: ManuscritoValueObject;
  status: StatusArtigoValueObject;
  revisoresIds: string[];
  revisoes: RevisaoEntity[];
}

export class ArtigoEntity extends Entity<ArtigoProps> {
  private constructor(props: ArtigoProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: {
      titulo: string;
      resumo: string;
      autorId: string;
      manuscrito: ManuscritoValueObject;
      manuscritoIdentificado?: ManuscritoValueObject;
    },
    id?: string,
  ): ArtigoEntity {
    if (!props.titulo) {
      throw new Error('O artigo deve ter um título.');
    }
    if (!props.resumo) {
      throw new Error('O artigo deve ter um resumo.');
    }
    if (!props.autorId) {
      throw new Error('O artigo deve ter um autor.');
    }
    if (!props.manuscrito) {
      throw new Error('O artigo deve ter um manuscrito anonimizado.');
    }

    return new ArtigoEntity(
      {
        ...props,
        editorId: undefined,
        status: StatusArtigoValueObject.pendente(),
        revisoresIds: [],
        revisoes: [],
      },
      id,
    );
  }

  public static restore(props: ArtigoProps, id: string): ArtigoEntity {
    return new ArtigoEntity(props, id);
  }

  public getProps(): ArtigoProps {
    return this.props;
  }

  get titulo(): string {
    return this.props.titulo;
  }

  get resumo(): string {
    return this.props.resumo;
  }

  get autorId(): string {
    return this.props.autorId;
  }

  get editorId(): string | undefined {
    return this.props.editorId;
  }

  get manuscrito(): ManuscritoValueObject {
    return this.props.manuscrito;
  }

  get manuscritoIdentificado(): ManuscritoValueObject | undefined {
    return this.props.manuscritoIdentificado;
  }

  get status(): StatusArtigoValueObject {
    return this.props.status;
  }

  get revisoresIds(): string[] {
    return [...this.props.revisoresIds];
  }

  get revisoes(): RevisaoEntity[] {
    return [...this.props.revisoes];
  }

  public alterarDados(props: {
    titulo: string;
    resumo: string;
    manuscrito?: ManuscritoValueObject;
    manuscritoIdentificado?: ManuscritoValueObject;
  }): void {
    if (this.props.status.isAceito() || this.props.status.isRejeitado() || this.props.status.isPublicado()) {
      throw new Error('Não é possível alterar um artigo já decidido ou publicado.');
    }
    if (!props.titulo || props.titulo.trim().length === 0) {
      throw new Error('O artigo deve ter um título.');
    }
    if (!props.resumo || props.resumo.trim().length === 0) {
      throw new Error('O artigo deve ter um resumo.');
    }

    this.props.titulo = props.titulo;
    this.props.resumo = props.resumo;
    if (props.manuscrito) {
      this.props.manuscrito = props.manuscrito;
    }
    if (props.manuscritoIdentificado) {
      this.props.manuscritoIdentificado = props.manuscritoIdentificado;
    }
  }

  public assumirArtigo(editorId: string): void {
    if (this.props.editorId) {
      if (this.props.editorId === editorId) {
        throw new Error('Você já assumiu este artigo.');
      }
      throw new Error('Este artigo já foi assumido por outro editor.');
    }
    this.props.editorId = editorId;
  }

  public abandonarArtigo(): void {
    if (this.props.revisoresIds.length > 0) {
      throw new Error('Não é possível abandonar um artigo que possui revisores atribuídos. Desatribua-os primeiro.');
    }
    this.props.editorId = undefined;
  }

  public atribuirRevisor(revisorId: string): void {
    if (this.props.status.isAceito() || this.props.status.isRejeitado() || this.props.status.isPublicado()) {
      throw new Error('Não é possível atribuir revisores a um artigo já decidido ou publicado.');
    }
    if (revisorId === this.props.autorId) {
      throw new Error('Conflito de interesse: o autor não pode ser atribuído como revisor.');
    }
    if (!this.props.revisoresIds.includes(revisorId)) {
      this.props.revisoresIds.push(revisorId);
      if (this.props.status.isPendente()) {
        this.props.status = StatusArtigoValueObject.emRevisao();
      }
    }
  }

  public desatribuirRevisor(revisorId: string): void {
    if (this.props.status.isPublicado()) {
      throw new Error('Não é possível desatribuir revisor de um artigo já publicado.');
    }
    const temRevisaoSubmetida = this.props.revisoes.some((r) => r.revisorId === revisorId);
    if (temRevisaoSubmetida) {
      throw new Error('Não é possível desatribuir um revisor que já submeteu uma avaliação.');
    }

    this.props.revisoresIds = this.props.revisoresIds.filter((id) => id !== revisorId);

    if (this.props.revisoresIds.length === 0 && this.props.status.isEmRevisao()) {
      this.props.status = StatusArtigoValueObject.pendente();
    }
  }

  public adicionarRevisao(revisao: RevisaoEntity): void {
    if (this.props.status.isAceito() || this.props.status.isRejeitado() || this.props.status.isPublicado()) {
      throw new Error('Não é possível adicionar ou alterar revisões de um artigo já decidido ou publicado.');
    }
    if (!this.props.revisoresIds.includes(revisao.revisorId)) {
      throw new Error('O revisor deve ser atribuído ao artigo antes de revisar.');
    }
    const index = this.props.revisoes.findIndex((r) => r.revisorId === revisao.revisorId);
    if (index !== -1) {
      this.props.revisoes[index] = revisao;
    } else {
      this.props.revisoes.push(revisao);
    }
  }

  public decidirStatus(statusFinal: StatusArtigoEnum.ACEITO | StatusArtigoEnum.REJEITADO): void {
    if (this.props.status.isPublicado()) {
      throw new Error('Não é possível alterar o veredito de um artigo já publicado.');
    }
    if (this.props.revisoes.length === 0) {
      throw new Error('Não é possível decidir o status sem nenhuma revisão.');
    }
    if (this.props.revisoes.length < this.props.revisoresIds.length) {
      throw new Error('Aguarde todos os revisores atribuídos submeterem suas avaliações antes de decidir.');
    }

    this.props.status =
      statusFinal === StatusArtigoEnum.ACEITO
        ? StatusArtigoValueObject.aceito()
        : StatusArtigoValueObject.rejeitado();
  }

  /**
   * Transiciona o artigo ACEITO para PUBLICADO, habilitando o Reveal da autoria
   * após o encerramento do ciclo de Double-Blind Review.
   */
  public publicar(): void {
    if (!this.props.status.isAceito()) {
      throw new Error('Apenas artigos com status ACEITO podem ser publicados.');
    }
    this.props.status = StatusArtigoValueObject.publicado();
  }
}
