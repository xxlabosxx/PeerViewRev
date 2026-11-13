# PeerViewRev — Plataforma de Submissão e Revisão de Artigos Científicos (Double-Blind Review)

**Disciplina:** Programação WEB 2  
**Projeto 13:** Submissão de Artigos Científicos para Conferências  
**Autor:** Gustavo Labos (BI304257X)

---

## 1. Visão Geral e Arquitetura

O **PeerViewRev** é uma plataforma web completa para gerenciamento do ciclo de submissão, avaliação por pares às cegas (*Double-Blind Peer Review*), decisão editorial e publicação de artigos científicos em conferências.

O backend (`ppw_server`) foi construído em **NestJS + TypeScript + Prisma ORM (PostgreSQL)** seguindo **Arquitetura Hexagonal (Ports & Adapters)**, **Domain-Driven Design (DDD)** e os princípios **SOLID**:

* **Camada de Domínio (`src/modules/*/domain`):** Entidades ricas (`ArtigoEntity`, `RevisaoEntity`, `AuditLogEntity`, `Usuario`) e *Value Objects* (`StatusArtigoValueObject`, `ManuscritoValueObject`) 100% puros, sem acoplamento ao Prisma ou ao framework HTTP.
* **Camada de Aplicação (`src/modules/*/application`):** Casos de Uso (*Use Cases*) e *Services* segregados em leitura (*Read*) e escrita (*Write* / CQRS leve), aplicando o **SRP** (*Single Responsibility Principle*) e o **OCP** (*Open/Closed Principle*).
* **Camada de Infraestrutura (`src/modules/*/infrastructure`):** Adaptadores intercambiáveis que implementam as portas do domínio (`ArtigoPrismaWriteRepository`, `ArtigoPrismaReadRepository`, `ArtigoInMemoryWriteRepository`, `ArtigoInMemoryReadRepository`), respeitando o **LSP** (*Liskov Substitution Principle*), além do sanitizador de PDFs (`PdfSanitizerService` com `pdf-lib`).
* **Frontend (`ppw_client`):** Aplicação **Next.js (App Router) + Tailwind CSS** integrada ao fluxo da máquina de estados, upload duplo de PDFs e visualização da trilha de auditoria.

---

## 2. Diagrama Entidade-Relacionamento (DER)

O modelo relacional abaixo reflete o schema definido em [`ppw_server/prisma/schema.prisma`](./ppw_server/prisma/schema.prisma):

```mermaid
erDiagram
    USUARIOS ||--o{ ARTIGOS : "submete (autor_id)"
    USUARIOS ||--o{ ARTIGOS : "coordena (editor_id)"
    USUARIOS ||--o{ ARTIGOS_REVISORES : "designado (revisor_id)"
    USUARIOS ||--o{ REVISOES : "avalia (revisor_id)"
    USUARIOS ||--o{ AUDIT_LOGS : "executa acao (autor_id)"

    ARTIGOS ||--o{ ARTIGOS_REVISORES : "possui revisores"
    ARTIGOS ||--o{ REVISOES : "recebe pareceres"
    ARTIGOS ||--o{ AUDIT_LOGS : "registra historico"

    USUARIOS {
        uuid id PK
        string nome
        string email UK
        string senha
        enum role "AUTOR | REVISOR | EDITOR"
        string instituicao
        datetime created_at
        datetime updated_at
    }

    ARTIGOS {
        uuid id PK
        string titulo
        string resumo
        uuid autor_id FK
        uuid editor_id FK "nullable"
        string arquivo_url "PDF anonimizado"
        string arquivo_identificado_url "PDF identificado (nullable)"
        int versao "Optimistic Locking (@default 1)"
        enum status "PENDENTE | EM_REVISAO | ACEITO | REJEITADO | PUBLICADO"
        datetime created_at
        datetime updated_at
    }

    ARTIGOS_REVISORES {
        uuid artigo_id PK, FK
        uuid revisor_id PK, FK
        datetime atribuido_em
    }

    REVISOES {
        uuid id PK
        uuid artigo_id FK
        uuid revisor_id FK
        string parecer
        int nota "1 a 5"
        enum recomendacao "ACEITAR | REJEITAR | RESSALVAS"
        datetime criado_em
    }

    AUDIT_LOGS {
        uuid id PK
        uuid artigo_id FK "onDelete: Restrict"
        enum estado_anterior "nullable"
        enum novo_estado
        uuid autor_id FK "onDelete: Restrict"
        string justificativa "nullable"
        datetime timestamp
    }
```

---

## 3. Máquina de Estados Finita (FSM) e Guardas de Transição

Toda alteração de status do artigo ocorre exclusivamente por métodos de negócio da entidade [`ArtigoEntity`](./ppw_server/src/modules/submissao/domain/entity/artigo.entity.ts), proibindo mutações arbitrárias via formulário:

```mermaid
stateDiagram-v2
    [*] --> PENDENTE : submeterArtigo() [Perfil: AUTOR]

    PENDENTE --> EM_REVISAO : atribuirRevisor() [Guarda: Editor assumiu + Sem Conflito Institucional]
    EM_REVISAO --> PENDENTE : desatribuirRevisor() [Guarda: Sem parecer enviado + 0 revisores restantes]
    EM_REVISAO --> EM_REVISAO : adicionarRevisao() [Guarda: Revisor atribuído ao artigo]

    EM_REVISAO --> ACEITO : decidirStatus(ACEITO) [Guarda: >= 1 revisão e todos os revisores avaliaram]
    EM_REVISAO --> REJEITADO : decidirStatus(REJEITADO) [Guarda: >= 1 revisão e todos os revisores avaliaram]

    ACEITO --> PUBLICADO : publicar() [Guarda: Status atual == ACEITO | Ação: Revela Autoria]
    REJEITADO --> [*]
    PUBLICADO --> [*]
```

### Matriz de Permissões (RBAC) e Guardas Principais

| Transição / Ação | Estado de Origem | Estado de Destino | Quem Pode Executar | Guarda de Transição (*Transition Guard*) |
| :--- | :--- | :--- | :--- | :--- |
| `submeterArtigo()` | — | `PENDENTE` | `AUTOR` | Título, resumo e PDF anonimizado obrigatórios. |
| `atribuirRevisor()` | `PENDENTE` / `EM_REVISAO` | `EM_REVISAO` | `EDITOR` | Revisor não pode ser o autor nem pertencer à mesma instituição/domínio acadêmico (*COI Check*). |
| `desatribuirRevisor()` | `EM_REVISAO` | `PENDENTE` (se 0 revisores) | `EDITOR` | Proibido remover revisor que já submeteu avaliação ou se o artigo estiver `PUBLICADO`. |
| `adicionarRevisao()` | `EM_REVISAO` | `EM_REVISAO` | `REVISOR` | Apenas revisores previamente atribuídos ao manuscrito; bloqueado após decisão final. |
| `decidirStatus()` | `EM_REVISAO` | `ACEITO` ou `REJEITADO` | `EDITOR` | Exige ao menos 1 revisão e que 100% dos revisores atribuídos tenham enviado parecer. |
| `publicar()` | `ACEITO` | `PUBLICADO` | `EDITOR` | Permitido apenas para artigos `ACEITO`; encerra o sigilo *Double-Blind* do autor. |

---

## 4. Mecanismos de Complexidade Implementados

1. **Double-Blind Review Completo no Backend (`ArtigoMappers` + `PdfSanitizerService`):**
   * **Sanitização de Payload HTTP por Perfil:** O backend filtra os dados antes de serializar o JSON — revisores recebem `autorId: "ANONIMO"` e não recebem o link do PDF identificado até que o artigo alcance o estado `PUBLICADO`; autores recebem os pareceres com revisores mascarados (`Revisor #1`, `Revisor #2`).
   * **Limpeza Automática de Metadados PDF (`pdf-lib`):** Durante o upload do manuscrito anonimizado, o backend remove `Author`, `Title`, `Subject`, `Keywords`, `Creator` e `Producer` dos metadados internos do binário PDF.
   * **Prevenção de Conflito de Interesse Institucional (*COI*):** Bloqueia a atribuição caso autor e revisor compartilhem a mesma instituição (normalizada sem acentos/caixa) ou o mesmo domínio de e-mail institucional (ex.: `@ifsp.edu.br`, `@usp.br`), ignorando provedores públicos (`gmail.com`, `outlook.com`, etc.).
2. **Transações ACID (`prisma.$transaction`) + Concorrência Otimista + `AuditLog` Imutável:**
   * No adaptador [`ArtigoPrismaWriteRepository`](./ppw_server/src/modules/submissao/infrastructure/adapters/artigo.prisma.write.repository.ts), toda mudança de estado executa dentro de `this.prisma.$transaction(async (tx) => { ... })`.
   * Utiliza o campo `versao` em `tx.artigo.updateMany({ where: { id, versao }, data: { ..., versao: { increment: 1 } } })` (*Optimistic Locking*). Caso outra requisição concorrente tenha alterado o artigo simultaneamente (`count === 0`), uma exceção é lançada, provocando **ROLLBACK** automático e retornando `HTTP 409 Conflict`.
   * O histórico em `audit_logs` opera em modo **Append-Only** (apenas `create`, sem `update`/`delete`) e possui `onDelete: Restrict` no `schema.prisma`.

---

## 5. Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** 20+ e **npm**
* *(Opcional)* **PostgreSQL 15+** ou **Docker** (o sistema possui modo *InMemory* ativo por padrão para execução imediata em laboratório sem depender de banco externo, e modo *Prisma/PostgreSQL* ativável via variável de ambiente).

### Passo 1 — Instalar dependências

```bash
# 1. Instalar dependências do Backend (NestJS)
cd ppw_server
npm install

# 2. Instalar dependências do Frontend (Next.js)
cd ../ppw_client
npm install
```

### Passo 2 — Rodar os Testes Automatizados (Backend)

```bash
cd ppw_server
npm test
```

### Passo 3 — Iniciar Backend e Frontend

#### Opção A: Execução Rápida em Laboratório (Repositório em Memória + Trilha de Auditoria Ativa)
```bash
# Terminal 1 — Backend NestJS (porta 3000)
cd ppw_server
npm run start:dev

# Terminal 2 — Frontend Next.js (porta 3001 ou 3000 conforme disponível)
cd ppw_client
npm run dev
```

#### Opção B: Execução com PostgreSQL + Prisma (`USE_PRISMA=true`)
1. Configure a variável `DATABASE_URL` no arquivo `ppw_server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/peerviewrev?schema=public"
   USE_PRISMA="true"
   ```
2. Aplique as migrações/schema e inicie o servidor:
   ```bash
   cd ppw_server
   npx prisma db push
   USE_PRISMA=true npm run start:dev
   ```

---

## 6. Documentação do Uso Pedagógico e Crítico da IA (AI-LOG)

O registro completo de todos os prompts consultados, respostas brutas da IA, trechos de código sugeridos e **reflexões críticas / refatorações realizadas pelo aluno** encontra-se em:

* 📄 **[`docs/ai.decisions.md`](./docs/ai.decisions.md)** (Documento consolidado)
* 📂 **[`docs/atividade/`](./docs/atividade/)** (Tópicos individuais enumerados de 01 a 05)
* 🖥️ **Catálogo Interativo (`DocsReferencia`):** Para abrir o gerador visual local na porta `3456`, execute `./DocsReferencia/start.sh` e acesse `http://localhost:3456`.
