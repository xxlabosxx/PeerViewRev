# Tópico 03: Como aplicar Máquina de estado no meu projeto?

## 3. Como aplicar Máquina de estado no meu projeto?

### 1. Pergunta / Prompt Enviado para a IA

Como eu aplico maquina de estado no meu projeto de atribuição de artigos científicos?

### 2. Resposta da IA

A aplicação de uma Máquina de Estados Finita (FSM - Finite State Machine) em um sistema de submissão e atribuição de artigos científicos (como um sistema de Peer Review) é ideal para modelar com segurança o ciclo de vida do manuscrito, garantindo que regras acadêmicas estritas sejam respeitadas e transições ilegais sejam impedidas por design.

1. Modelagem dos Estados e Eventos do Artigo Científico

Em um fluxo de revisão por pares, um artigo científico percorre um ciclo de vida bem delimitado:

Estados Finitos (𝑆 S):

PENDENTE / SUBMETIDO: Artigo recém-enviado pelo autor, aguardando um editor assumir e designar revisores.
EM_REVISAO: Artigo possui revisores designados e está em período de avaliação.
REVISADO: Todos os pareceres foram entregues; pronto para decisão editorial.
ACEITO: Estado terminal; artigo aprovado para publicação (bloqueado para edições).
REJEITADO: Estado terminal; artigo recusado (bloqueado para edições).

Eventos / Gatilhos (𝐸 E):

ATRIBUIR_REVISOR: Editor associa um revisor ao manuscrito.
DESATRIBUIR_REVISOR: Revisor é removido do manuscrito antes de emitir parecer.
ENVIAR_PARECER: Revisor submete sua avaliação.
DECIDIR_STATUS: Editor emite o veredito final (Aceitar ou Rejeitar).

2. Tabela de Transições e Regras de Guarda (Guards)

| Estado Atual    | Evento                                     | Próximo Estado                        | Guardas / Regras de Negócio |
| ---                     | ---                                          | ---                                               | ---                                                                   |
| PENDENTE     | `ATRIBUIR_REVISOR`        | `EM_REVISAO`                          | Pelo menos um revisor associado.                      |
| EM_REVISAO | `DESATRIBUIR_REVISOR` | `PENDENTE`                             | Disparado se todos os revisores forem desatribuídos. |
| EM_REVISAO | `ENVIAR_PARECER`           | `EM_REVISAO` / `REVISADO` | Só é aceito de revisores previamente convidados. |
| EM_REVISAO | `DECIDIR_STATUS`             | `ACEITO` ou `REJEITADO`       | Guarda: Proibido se houver revisões pendentes. |
| ACEITO           | Qualquer evento                    | Bloqueado                                 | Estado imutável (rejeita novas edições ou revisões). |
| REJEITADO    | Qualquer evento                    | Bloqueado                                  | Estado imutável.                                                         |

### 3. Código Gerado pela IA

```typescript
// 1. Definição formal dos estados e eventos
export enum StatusArtigo {
  PENDENTE = 'PENDENTE',
  EM_REVISAO = 'EM_REVISAO',
  ACEITO = 'ACEITO',
  REJEITADO = 'REJEITADO',
}

export type EventoArtigo = 
  | { tipo: 'ATRIBUIR_REVISOR'; revisorId: string }
  | { tipo: 'DESATRIBUIR_REVISOR'; revisorId: string }
  | { tipo: 'SUBMETER_REVISAO'; revisorId: string; parecer: string }
  | { tipo: 'DECIDIR_VEREDITO'; veredito: StatusArtigo.ACEITO | StatusArtigo.REJEITADO };

// 2. Máquina de Estados / Entidade de Domínio
export class ArtigoStateMachine {
  private _status: StatusArtigo = StatusArtigo.PENDENTE;
  private _revisoresIds: Set<string> = new Set();
  private _revisoesRecebidas: Map<string, string> = new Map();

  get status(): StatusArtigo {
    return this._status;
  }

  public dispatch(evento: EventoArtigo): void {
    // Regra Global: Estados terminais rejeitam qualquer ação
    if (this._status === StatusArtigo.ACEITO || this._status === StatusArtigo.REJEITADO) {
      throw new Error(`Transição inválida: artigo já finalizado com status ${this._status}.`);
    }

    switch (evento.tipo) {
      case 'ATRIBUIR_REVISOR':
        this._revisoresIds.add(evento.revisorId);
        // Transição: PENDENTE -> EM_REVISAO
        if (this._status === StatusArtigo.PENDENTE) {
          this._status = StatusArtigo.EM_REVISAO;
        }
        break;

      case 'DESATRIBUIR_REVISOR':
        if (this._revisoesRecebidas.has(evento.revisorId)) {
          throw new Error('Não é permitido desatribuir revisor que já emitiu parecer.');
        }
        this._revisoresIds.delete(evento.revisorId);
        // Transição de Retorno: Se não restarem revisores, volta para PENDENTE
        if (this._revisoresIds.size === 0 && this._status === StatusArtigo.EM_REVISAO) {
          this._status = StatusArtigo.PENDENTE;
        }
        break;

      case 'SUBMETER_REVISAO':
        if (!this._revisoresIds.has(evento.revisorId)) {
          throw new Error('Apenas revisores atribuídos podem submeter parecer.');
        }
        this._revisoesRecebidas.set(evento.revisorId, evento.parecer);
        break;

      case 'DECIDIR_VEREDITO':
        // Guarda de consistência acadêmica
        if (this._revisoesRecebidas.size === 0) {
          throw new Error('Artigo não pode ser julgado sem ao menos um parecer.');
        }
        if (this._revisoesRecebidas.size < this._revisoresIds.size) {
          throw new Error('Aguarde o parecer de todos os revisores antes do veredito final.');
        }

        // Transição para Estado Terminal
        this._status = evento.veredito;
        break;

      default:
        throw new Error('Evento não reconhecido na máquina de estados.');
    }
  }
}
```

### 4. Reflexão e Crítica do Aluno

Desta forma o sistema fica mais organizado e reconhecível, assim como fizemos em sala de aula. É tranquilo perceber como a máquina de estado age e orquestra suas mudanças, já que criando os valores PENDENTE, EM_REVISAO etc, permite que não se use booleanos de forma incorreta e a todo momento. Dessa forma, eu compreendi que a máquina de estado garante consistência a lógica do projeto

---
