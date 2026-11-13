# Tópico 05: ACID no prisma

## 5. ACID no prisma

### 1. Pergunta / Prompt Enviado para a IA

Como funcionam transações ACID no Prisma ($transaction) e como eu aplico isso em um backend NestJS de revisão de artigos científicos para atualizar o status do artigo e gravar um histórico imutável (AuditLog) na mesma operação, sem acoplar minha entidade de domínio ao Prisma?

### 2. Resposta da IA

1. Como funcionam transações ACID no Prisma ($transaction)

Quando você executa queries dentro de uma transação no Prisma com PostgreSQL, o motor do banco garante as 4 propriedades:

Atomicidade (Atomicity): Todas as queries executadas dentro da transação formam um bloco "tudo ou nada" (BEGIN ... COMMIT). Se atualizar artigos funcionar, mas o INSERT em audit_logs falhar (por erro de chave estrangeira, validação ou queda de conexão), o PostgreSQL executa ROLLBACK e o status do artigo permanece inalterado.
Consistência (Consistency): O banco só confirma a transação se todas as constraints (FKs, NOT NULL, UNIQUE, enums como StatusArtigo) forem satisfeitas ao final do bloco.
Isolamento (Isolation): Outras requisições simultâneas não enxergam a atualização do Artigo sem o respectivo AuditLog antes do COMMIT. No PostgreSQL, o padrão é Read Committed, mas o Prisma permite elevar para RepeatableRead ou Serializable quando há risco de conflito de leitura/escrita.
Durabilidade (Durability): Após o COMMIT, o registro é persistido no WAL (Write-Ahead Log) do PostgreSQL e não se perde mesmo se o servidor reiniciar logo em seguida.
Os dois modos do Prisma e qual usar aqui
Sequencial / Batch ($transaction([p1, p2])): recebe um array de PrismaPromise e executa em sequência numa mesma conexão. É simples, mas limitado: você não consegue fazer leituras no meio, aplicar condicionais em TypeScript ou checar count de linhas afetadas entre uma query e outra.
Interativa ($transaction(async (tx) => { ... }, options)): recebe uma função assíncrona com o cliente transacional tx. É a recomendada para máquina de estados + auditoria porque permite:
ler/validar estado ou checar Optimistic Locking dentro da transação;
atualizar tx.artigo e gravar tx.auditLog com dados derivados da própria operação;
abortar e disparar ROLLBACK automático ao lançar qualquer Error dentro da callback.
Regras críticas ao usar $transaction interativo
Use sempre tx, nunca this.prisma, dentro da callback: se você chamar this.prisma.auditLog.create(...) dentro de this.prisma.$transaction(async (tx) => ...), a query roda em outra conexão fora da transação — quebrando a atomicidade e podendo causar deadlock se tentar acessar a mesma linha travada por tx.
Não engula exceções dentro da callback: um try/catch sem throw faz a callback resolver normalmente e o Prisma envia COMMIT mesmo que parte da operação tenha falhado.
Não faça I/O externo dentro da transação: chamadas de rede, geração/sanitização de PDF (PdfSanitizerService) ou envio de e-mail devem ocorrer fora do $transaction, pois transações interativas têm timeout padrão de 5 segundos e seguram conexões do pool e locks no banco.
2. Como aplicar no NestJS sem acoplar a entidade de domínio ao Prisma

Analisando seu projeto atual:

A entidade artigo.entity.ts e a porta artigo.write.repository.ts são 100% livres de Prisma e NestJS.
O schema.prisma já possui o model Artigo (com status e versao Int @default(1)) e o model AuditLog (artigoId, estadoAnterior, novoEstado, autorId, justificativa, timestamp), além do prisma.service.ts.
Porém, em package.json, @prisma/client e @prisma/adapter-pg ainda não estão instalados em node_modules, e submissao.module.ts ainda usa ArtigoInMemoryWriteRepository.

Para integrar o Prisma sem vazar infraestrutura para o domínio, o padrão mais limpo para esse caso é Persistência Orientada a Agregado com Registro de Auditoria (ou Domain Events):

Passo 1 — O Domínio continua puro (e registra a transição)

Em vez de a ArtigoEntity saber que existe uma tabela audit_logs, ela apenas executa a regra da máquina de estados e pode retornar (ou acumular internamente como evento de domínio) um objeto puro descrevendo a mudança de estado:

(TRECHO DE CÓDIGO 1*)

Na ArtigoEntity (ou no serviço de aplicação capturando o estado antes de artigo.decidirStatus(...)), você preserva a invariante de negócio antes da persistência. Se quiser ir além com Domain Events, a própria ArtigoEntity pode guardar um array privado eventosAuditoria: RegistroAuditoriaTransicao[] preenchido dentro de decidirStatus(), publicar(), atribuirRevisor(), etc., e expor um método consumirEventosAuditoria() para o repositório persistir e limpar.

Além disso, vale adicionar versao: number em ArtigoProps (espelhando versao Int @default(1) do seu schema.prisma) para permitir Optimistic Locking e evitar que duas decisões concorrentes sobrescrevam o status uma da outra.

Passo 2 — A Porta (ArtigoWriteRepository) define o contrato atômico sem mencionar Prisma

Em artigo.write.repository.ts, você declara que salvar uma transição + auditoria é uma operação única do repositório:

(TRECHO DE CÓDIGO 2)

Repare que:

Nem PrismaClient nem Prisma.TransactionClient aparecem na interface.
O ArtigoInMemoryWriteRepository continua funcionando nos testes unitários (gravando em memória o artigo e, se quiser, um array de logs em InMemoryArtigoStore).
Passo 3 — A Aplicação (Service) orquestra o caso de uso

No decidir.status.artigo.service.ts, o serviço não sabe que existe $transaction:

(TRECHO DE CÓDIGO 3)

Passo 4 — A Infraestrutura (ArtigoPrismaWriteRepository) executa o $transaction

É aqui (na camada infrastructure/adapters/) que o Prisma aparece, usando o PrismaService e o Mapper:

(TRECHO DE CÓDIGO 4)

Por que o updateMany com versao dentro do $transaction é tão importante? Imagine dois editores clicando em "Aceitar" e "Rejeitar" no mesmo milissegundo. Sem checar versao (ou sem SELECT ... FOR UPDATE), ambos leriam EM_REVISAO, ambos atualizariam a mesma linha por id e gravariam dois AuditLog dizendo estadoAnterior: EM_REVISAO. Com where: { id, versao }, o segundo recebe count === 0, lança erro, a transação sofre ROLLBACK automático e nenhum AuditLog falso é gravado.

E quando mais de um repositório separado precisa compartilhar a mesma transação?

Se um caso de uso precisar coordenar vários repositórios distintos na mesma transação (ex.: ArtigoWriteRepository + UsuarioRepository + AuditLogRepository), você evita acoplar os repositórios ao Prisma usando o padrão Unit of Work (UoW):

Porta UnitOfWork (no domínio/aplicação): runInTransaction<T>(fn: () => Promise<T>): Promise<T>.
Implementação PrismaUnitOfWork (na infraestrutura): usa AsyncLocalStorage (nativo do Node.js) + this.prisma.$transaction(async (tx) => storage.run(tx, fn)).
Repositórios Prisma: usam um helper this.prisma.getClient() que lê o tx ativo do AsyncLocalStorage se houver uma transação em curso, ou retorna this.prisma caso contrário. Assim, a assinatura dos repositórios nunca recebe tx por parâmetro.

Para o seu caso atual (Artigo + AuditLog), porém, o salvarComAuditoria no ArtigoPrismaWriteRepository (ou UnitOfWork se você quiser separar AuditLogRepository) já resolve sem complexidade desnecessária.

3. Pontos de atenção específicos que já existem no seu código/schema

Ao integrar isso no PeerViewRev, vale corrigir três detalhes importantes já visíveis nos arquivos atuais:

onDelete: Cascade em AuditLog contradiz a imutabilidade: Em schema.prisma, AuditLog tem onDelete: Cascade tanto para artigo quanto para autor. Se um artigo ou usuário for deletado com DELETE, o PostgreSQL apagará os logs de auditoria em cascata. Para histórico imutável, o recomendado é usar onDelete: Restrict (bloqueando exclusão física e usando soft delete como deletedAt), além de não criar métodos update/delete no repositório para AuditLog.
Falta o atorId nos casos de uso de decisão e publicação: O model AuditLog exige autorId (o ID do usuário que disparou a transição), mas hoje DecidirStatusArtigoUseCase recebe apenas (artigoId, status) e PublicarArtigoUseCase recebe apenas (artigoId). No SubmissaoController, será preciso extrair o ID do usuário autenticado (ou do header/token usado pelo projeto) e passá-lo ao caso de uso para preencher AuditLog.autorId.
Dependências e troca de adaptador no módulo: Como prisma.service.ts usa @prisma/client e @prisma/adapter-pg (Prisma 7) mas ambos ainda não constam em package.json, será necessário instalá-los, gerar o client (prisma generate) e trocar os providers em submissao.module.ts de ArtigoInMemory*Repository para os adaptadores Prisma quando for ativar o PostgreSQL.

Se quiser, posso implementar agora o adaptador ArtigoPrismaWriteRepository (com salvarComAuditoria e Optimistic Locking) ou estruturar o padrão UnitOfWork com AsyncLocalStorage no ppw_server.

### 3. Código Gerado pela IA

```typescript
//----------------------------------TRECHO DE CÓDIGO 1----------------------------------------------
// domain/types/registro-auditoria.ts (100% TypeScript puro, sem Prisma)
import { StatusArtigoEnum } from '../value-objects/status.value.object';

export interface RegistroAuditoriaTransicao {
  estadoAnterior: StatusArtigoEnum | null;
  novoEstado: StatusArtigoEnum;
  atorId: string;
  justificativa?: string;
}


//----------------------------------TRECHO DE CÓDIGO 2----------------------------------------------
export interface ArtigoWriteRepository {
  salvar(artigo: ArtigoEntity): Promise<void>;
  salvarComAuditoria(
    artigo: ArtigoEntity,
    auditoria: RegistroAuditoriaTransicao,
  ): Promise<void>;
  excluir(id: string): Promise<void>;
}

//----------------------------------TRECHO DE CÓDIGO 3----------------------------------------------
async execute(
  artigoId: string,
  status: 'ACEITO' | 'REJEITADO',
  atorId: string,
  justificativa?: string,
): Promise<DecidirStatusResponse> {
  const artigo = await this.readRepository.buscarPorId(artigoId);
  if (!artigo) {
    throw new NotFoundException('Artigo não encontrado.');
  }

  const estadoAnterior = artigo.status.getValue();

  try {
    artigo.decidirStatus(status as StatusArtigoEnum.ACEITO | StatusArtigoEnum.REJEITADO);
  } catch (error: any) {
    throw new BadRequestException(error.message);
  }

  await this.writeRepository.salvarComAuditoria(artigo, {
    estadoAnterior,
    novoEstado: artigo.status.getValue(),
    atorId,
    justificativa,
  });

  return {
    mensagem: 'Status do artigo decidido',
    artigoId: artigo.id,
    status: artigo.status.getValue(),
  };
}

//----------------------------------TRECHO DE CÓDIGO 4----------------------------------------------
@Injectable()
export class ArtigoPrismaWriteRepository implements ArtigoWriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvarComAuditoria(
    artigo: ArtigoEntity,
    auditoria: RegistroAuditoriaTransicao,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Atualiza com Optimistic Locking usando o campo `versao` do schema.prisma
      const resultado = await tx.artigo.updateMany({
        where: {
          id: artigo.id,
          versao: artigo.versao,
        },
        data: {
          status: artigo.status.getValue(), // mapeado para enum do Prisma
          editorId: artigo.editorId ?? null,
          versao: { increment: 1 },
        },
      });

      if (resultado.count === 0) {
        throw new Error(
          'Conflito de concorrência: o artigo foi modificado por outra operação.',
        );
      }

      // 2. Grava o histórico imutável na mesma transação
      await tx.auditLog.create({
        data: {
          artigoId: artigo.id,
          estadoAnterior: auditoria.estadoAnterior,
          novoEstado: auditoria.novoEstado,
          autorId: auditoria.atorId,
          justificativa: auditoria.justificativa ?? null,
        },
      });
    });
  }

  // salvar() e excluir()...
}


```

### 4. Reflexão e Crítica do Aluno

Analisando a resposta da IA, eu compreendi que a transação ACID com o $transaction do Prisma funciona como uma trava de segurança do tipo "tudo ou nada" no banco de dados. Isso é fundamental no meu projeto porque toda vez que o artigo muda de estado na Máquina de Estados (por exemplo, de PENDENTE para EM_REVISAO, ou de EM_REVISAO para ACEITO/REJEITADO), eu sou obrigado a gravar um AuditLog. Se o update do artigo funcionasse mas a gravação do log desse erro, o sistema ficaria inconsistente e sem rastreabilidade. Com o $transaction, se qualquer etapa falhar, o banco dá rollback automático e desfaz a mudança de status.

Sobre a arquitetura, ficou muito claro como manter o padrão que vimos em aula sem sujar a minha ArtigoEntity com coisas do Prisma:
1) A ArtigoEntity continua 100% pura no domínio, cuidando só das regras da máquina de estados.
2) A interface ArtigoWriteRepository (porta do domínio) só define o contrato salvarComHistorico recebendo a entidade e os dados básicos do log.
3) O Prisma ($transaction) fica isolado apenas lá na camada de infrastructure, dentro do repositório do Prisma, usando o cliente transacional "tx" para garantir que o update do artigo e o create do AuditLog rodem na mesma conexão.

Porém, analisando o código sugerido pela IA e comparando com os arquivos atuais do meu projeto (ppw_server), identifiquei três pontos importantes que preciso ajustar e refatorar:

1) Problema de concorrência no update simples da IA: No código da IA, ela fez apenas tx.artigo.update({ where: { id: artigo.id } }). Se dois editores tentarem decidir o mesmo artigo ao mesmo tempo, o segundo vai sobrescrever a decisão do primeiro. Como no meu schema.prisma eu já tenho o campo "versao", o mais seguro é validar a versão atual na cláusula where (controle de concorrência otimista) junto com o incremento de versão, abortando a transação se outro usuário já tiver alterado aquele artigo.

2) Cuidado com a imutabilidade real no schema.prisma: A IA explicou que o AuditLog é imutável porque só fazemos create (Append-Only) no repositório. Porém, olhando meu schema.prisma atual, percebi que a relação do AuditLog estava com "onDelete: Cascade". Isso significa que se alguém apagasse um artigo ou usuário, o banco apagaria todo o histórico de auditoria junto. Para garantir imutabilidade de verdade, preciso trocar para "onDelete: Restrict" (ou impedir exclusão física de artigos que já entraram no fluxo de revisão).

3) Adaptação nos meus Cases/Controllers atuais: Hoje o meu endpoint e o DecidirStatusArtigoUseCase recebem apenas o artigoId e o status, mas a tabela AuditLog exige o autorId (quem executou a ação) e permite uma justificativa. Portanto, para integrar isso de fato no projeto, preciso passar o ID do usuário logado (ex: via header x-user-id / contexto de autenticação) e a justificativa no DTO da requisição até o Service.

---
