# Tópico 04: Blind Review

## 4. Blind Review

### 1. Pergunta / Prompt Enviado para a IA

Considere que você é uma IA me respondendo a respeito do meu projeto.

O que é Blind Review? E como eu faço para aplicar isto em um projeto de peer review de artigos cientificos em Next, NestJS.

### 2. Resposta da IA

O que é Blind Review (Revisão às Cegas)?

O Blind Review é o método usado na academia para garantir imparcialidade na avaliação de artigos científicos, ocultando identidades para evitar vieses (de prestígio da instituição, gênero, nacionalidade ou conflitos pessoais). Existem três modelos principais:

Single-Blind (Simples-Cego): O avaliador (revisor) sabe quem é o autor, mas o autor não sabe quem o avaliou.
Double-Blind (Duplo-Cego): Nem o autor sabe quem é o revisor, nem o revisor sabe quem escreveu o artigo (o mais comum em conferências e periódicos).
Triple-Blind (Triplo-Cego): Até mesmo o editor/coordenador que gerencia a submissão desconhece a identidade dos autores durante a triagem.
Como aplicar isso no seu projeto em Next.js?

Para implementar um Double-Blind Review real em uma aplicação, não basta esconder o nome na tela com CSS ou if no frontend — se você enviar os dados do autor na resposta da API, qualquer revisor consegue abrir a aba Network (Inspeção do navegador) e ver quem escreveu.

Aqui estão os 4 pilares técnicos para implementar isso com segurança:

1. Sanitização no Backend / BFF (Server Components ou API)

A regra de ouro é: o payload JSON que chega ao navegador do revisor nunca deve conter dados sensíveis. No Next.js (usando Server Components ou Route Handlers) ou diretamente no seu backend (via DTOs/Interceptors), filtre os dados de acordo com o papel (role) do usuário logado:

(Techo de código)

2. Submissão de Arquivos (O Problema do PDF)

No mundo real de artigos científicos, a identidade vaza no arquivo PDF (na capa ou nos metadados ocultos do arquivo). Para resolver isso no seu projeto:

Abordagem Prática (Acadêmica/MVP): No formulário de submissão do Next.js, crie dois campos de upload separados:

Manuscrito Anonimizado (PDF): Onde o próprio autor sobe o PDF sem nomes/afiliações (é esse link que o revisor baixa).
Folha de Rosto / Versão Identificada: Visível apenas para o Editor.
Toque Extra (Limpeza de Metadados): Quando o autor salva um PDF no Word/LaTeX, o nome dele fica gravado nas propriedades do arquivo (Author nos metadados do PDF). Você pode usar a biblioteca pdf-lib no Node/Next.js durante o upload para limpar os metadados (pdfDoc.setAuthor(''), pdfDoc.setCreator('')) antes de salvar no storage.

3. Prevenção de Conflito de Interesses (COI) no Sorteio de Revisores

Mesmo sem o revisor ver o nome do autor, ele pode reconhecer o trabalho de um colega de laboratório.

No cadastro do usuário, guarde o domínio do e-mail institucional (ex: @usp.br, @unicamp.br) ou a instituição.
Na lógica de atribuição de revisores, bloqueie automaticamente que um artigo de um autor da instituição X seja atribuído a um revisor da mesma instituição X, ou que o próprio autor seja listado para revisar o próprio artigo.
4. Máquina de Estados da Submissão (Reveal / Desanonimização)

O anonimato do autor geralmente tem prazo de validade (até o artigo ser aceito e publicado):

Crie um campo status na submissão: SUBMITTED -> UNDER_REVIEW -> DECISION_MADE -> PUBLISHED.
Enquanto o status for UNDER_REVIEW, o middleware/serializer aplica o filtro cego. Quando mudar para PUBLISHED, a visualização pública passa a exibir os autores reais, mantendo os revisores anônimos (ou abertos, se o sistema tiver opção de Open Peer Review).

### 3. Código Gerado pela IA

```typescript
// Exemplo em um Server Component ou camada de serviço no Next.js
export async function getSubmissionForUser(submissionId: string, currentUser: User) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { author: true, reviews: { include: { reviewer: true } } },
  });

  // 1. Se quem está vendo é um REVISOR (Double-Blind):
  if (currentUser.role === 'REVIEWER') {
    return {
      id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      fileUrl: submission.anonymizedFileUrl, // PDF sem nomes!
      author: null, // Oculta completamente o autor da rede
    };
  }

  // 2. Se quem está vendo é o AUTOR (vendo os pareceres):
  if (currentUser.id === submission.authorId) {
    return {
      ...submission,
      reviews: submission.reviews.map((review, index) => ({
        id: review.id,
        score: review.score,
        comments: review.comments,
        reviewerName: `Revisor #${index + 1}`, // Mascaramento de identidade
      })),
    };
  }

  // 3. Se for EDITOR / CHAIR, retorna tudo (caso seja Double-Blind e não Triple-Blind)
  return submission;
}
```

### 4. Reflexão e Crítica do Aluno

Analisando o a resposta pude inferir como funciona a blind review, além de seus 3 modos
Single-blind review
Double-blind review
Triple-blind review
E em minha opinião prosseguir com Double-blind review seria o mais adequado pois garante a imparcialidade completa dos revisores e o autor. 

Além do conceito, a parte de implementação é bem técnica e difícil. Pois não se pode em hipótese alguma deixar vazar o nome do autor do projeto, portanto a IA sugere as seguintes necessidades:

1) Sanitização no Backend / BFF (Server Components ou API)
A respeito desse tópico eu entendi que a sanitização é  limpar a entrada de dados, garantindo que haja confidencialidade e segurança
Além do BFF: que é Backend for Frontend  uma camada que centraliza os micro-serviços  para uma interface expecifica garantindo que não seja responsabilidade do front-ent esconder os dados. Mas sim o back-end  envia apenas o necessário para fazer a requisição

2) Geralmente os PDF de artigos cientificos sempre veem com nome, instituição e etc. por isso para garantir anonimidade . Por isso, será necessário a criação de 1 campo extra onde será enviado o PDF de anônimo que será o link que o revisor baixara
e a versão identificavel ainda assim continua. Porém será entregue apenas ao editor.

Além disso, vou implementar a biblioteca pdf-lib no Node/Next.js durante o upload para limpar os metadados (pdfDoc.setAuthor(''), pdfDoc.setCreator('')) antes de salvar no storage. Dessa forma, os meta dados com nome de quem cria ou criará será limpo. Garantindo anonimicidade 100%

3) O terceiro tópico é uma regra de negócio extremamente importante, pois coloca identificação por email institucional garante que pessoas do mesmo campus não possam analisar seus projetos. Dessa maneira, mesmo que você tenha diversos companheiros de pesquisa ou laboratório, sempre será pessoas diferentes que serão analisadas. Portanto, para executar isso, existirá uma trava lógica que não permitira o editor atribuir uma pessoa que enviou um artigo com mesmo email institucional que um revisor

4) na maquina de estado será aplicado SUBMITTED -> UNDER_REVIEW -> DECISION_MADE -> PUBLISHED. Com objetivo de garantir consistência as outras regras e evitar que tópicos sejam quebrados.

Porém, analisando o código que a IA gerou, eu percebi dois problemas que precisei corrigir para adaptar ao meu projeto

5) O primeiro erro da IA foi na arquitetura. Ela colocou a chamada do banco de dados (db.submission.findUnique) direto como se fosse no Next.js, mas no meu projeto o banco de dados fica separado no backend em NestJS com Prisma (ppw_server).

6) O segundo problema é uma falha de segurança e validação no código dela. Primeiro que ela nem verificou se o artigo realmente existe no banco antes de acessar as propriedades (se o findUnique retornar null, o sistema quebra). Além disso, na parte do REVISOR, ela apenas checou se o cargo é 'REVIEWER', mas esqueceu de validar se aquele revisor realmente foi atribuído para avaliar aquele artigo específico. asdasd

---
