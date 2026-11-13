import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import { ArtigoInMemoryReadRepository } from './infrastructure/adapters/artigo.inmemory.read.repository';
import { ArtigoInMemoryWriteRepository } from './infrastructure/adapters/artigo.inmemory.write.repository';
import { InMemoryArtigoStore } from './infrastructure/adapters/artigo.inmemory.store';
import { PdfSanitizerService } from './infrastructure/pdf/pdf-sanitizer.service';
import { BuscarArtigosService } from './application/service/read/buscar.artigos.service';
import { BuscarArtigoPorIdService } from './application/service/read/buscar.artigo-por-id.service';
import { SubmeterArtigoService } from './application/service/write/submeter.artigo.service';
import { AssumirArtigoService } from './application/service/write/assumir.artigo.service';
import { AtribuirRevisorService } from './application/service/write/atribuir.revisor.service';
import { SubmeterRevisaoService } from './application/service/write/submeter.revisao.service';
import { DecidirStatusArtigoService } from './application/service/write/decidir.status.artigo.service';
import { PublicarArtigoService } from './application/service/write/publicar.artigo.service';
import { InMemoryUsuarioRepository } from '../usuarios/infrastructure/InMemoryUsuarioRepository';

describe('Double-Blind Review & Anonimização (Backend)', () => {
  const arquivosCriados: string[] = [];

  let usuarioRepo: InMemoryUsuarioRepository;
  let readRepo: ArtigoInMemoryReadRepository;
  let writeRepo: ArtigoInMemoryWriteRepository;

  let submeterArtigoService: SubmeterArtigoService;
  let assumirArtigoService: AssumirArtigoService;
  let atribuirRevisorService: AtribuirRevisorService;
  let submeterRevisaoService: SubmeterRevisaoService;
  let decidirStatusService: DecidirStatusArtigoService;
  let publicarArtigoService: PublicarArtigoService;
  let buscarArtigosService: BuscarArtigosService;
  let buscarArtigoPorIdService: BuscarArtigoPorIdService;
  let pdfSanitizerService: PdfSanitizerService;

  beforeEach(() => {
    InMemoryArtigoStore.artigos.clear();
    usuarioRepo = new InMemoryUsuarioRepository();
    readRepo = new ArtigoInMemoryReadRepository();
    writeRepo = new ArtigoInMemoryWriteRepository();

    submeterArtigoService = new SubmeterArtigoService(writeRepo, usuarioRepo);
    assumirArtigoService = new AssumirArtigoService(readRepo, writeRepo, usuarioRepo);
    atribuirRevisorService = new AtribuirRevisorService(readRepo, writeRepo, usuarioRepo);
    submeterRevisaoService = new SubmeterRevisaoService(readRepo, writeRepo, usuarioRepo);
    decidirStatusService = new DecidirStatusArtigoService(readRepo, writeRepo);
    publicarArtigoService = new PublicarArtigoService(readRepo, writeRepo);
    buscarArtigosService = new BuscarArtigosService(readRepo, usuarioRepo);
    buscarArtigoPorIdService = new BuscarArtigoPorIdService(readRepo, usuarioRepo);
    pdfSanitizerService = new PdfSanitizerService();
  });

  afterAll(async () => {
    await Promise.all(
      arquivosCriados.map(async (filePath) => {
        await fs.unlink(filePath).catch(() => undefined);
      }),
    );
  });

  it('deve remover metadados identificadores de PDFs anonimizados usando pdf-lib e preservar no identificado', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.setTitle('Artigo Secreto IFSP');
    doc.setAuthor('Gustavo Labos');
    doc.setSubject('Peer Review');
    doc.setKeywords(['blind', 'review', 'ifsp']);
    doc.setCreator('Microsoft Word');
    doc.setProducer('LibreOffice Writer');

    const pdfBuffer = Buffer.from(await doc.save());

    const anonResult = await pdfSanitizerService.processarESalvarPdf(
      pdfBuffer,
      'manuscrito.pdf',
      'anonimizado',
      'http://localhost:3000',
    );
    const anonFilename = path.basename(anonResult.url);
    const anonPath = await pdfSanitizerService.obterCaminhoArquivo(anonFilename);
    arquivosCriados.push(anonPath);

    expect(anonResult.metadadosLimpos).toBe(true);
    expect(anonResult.url).toContain('/submissoes/arquivos/blind_');

    const anonSavedBytes = await fs.readFile(anonPath);
    const loadedAnon = await PDFDocument.load(anonSavedBytes, { updateMetadata: false });
    expect(loadedAnon.getAuthor() || '').toBe('');
    expect(loadedAnon.getTitle() || '').toBe('');
    expect(loadedAnon.getSubject() || '').toBe('');
    expect(loadedAnon.getCreator() || '').toBe('');
    expect(loadedAnon.getProducer() || '').toBe('');

    const idResult = await pdfSanitizerService.processarESalvarPdf(
      pdfBuffer,
      'manuscrito_identificado.pdf',
      'identificado',
      'http://localhost:3000',
    );
    const idFilename = path.basename(idResult.url);
    const idPath = await pdfSanitizerService.obterCaminhoArquivo(idFilename);
    arquivosCriados.push(idPath);

    expect(idResult.metadadosLimpos).toBe(false);
    const idSavedBytes = await fs.readFile(idPath);
    const loadedId = await PDFDocument.load(idSavedBytes, { updateMetadata: false });
    expect(loadedId.getAuthor()).toBe('Gustavo Labos');
    expect(loadedId.getTitle()).toBe('Artigo Secreto IFSP');
  });

  it('deve bloquear conflito de interesse institucional e por domínio corporativo, permitindo gmail de instituições distintas', async () => {
    const autor = await usuarioRepo.criar(
      'Autor Teste',
      '123',
      'AUTOR',
      'autor@ifsp.edu.br',
      'IFSP - Câmpus São Paulo',
    );
    const revisorMesmaInst = await usuarioRepo.criar(
      'Revisor Mesma Inst',
      '123',
      'REVISOR',
      'prof@gmail.com',
      'ifsp - campus sao paulo',
    );
    const revisorMesmoDominio = await usuarioRepo.criar(
      'Revisor Mesmo Dominio',
      '123',
      'REVISOR',
      'outro@ifsp.edu.br',
      'Instituto Federal de SP',
    );
    const revisorExternoGmailAutor = await usuarioRepo.criar(
      'Autor Gmail',
      '123',
      'AUTOR',
      'pessoa1@gmail.com',
      'USP',
    );
    const revisorExternoGmail = await usuarioRepo.criar(
      'Revisor Externo',
      '123',
      'REVISOR',
      'pessoa2@gmail.com',
      'UNICAMP',
    );

    const submissao1 = await submeterArtigoService.execute({
      titulo: 'Artigo COI',
      resumo: 'Resumo completo do artigo sobre conflito institucional.',
      autorId: autor.id,
      nomeArquivoManuscrito: 'blind.pdf',
      urlManuscrito: 'http://localhost:3000/submissoes/arquivos/blind_1.pdf',
    });

    await expect(
      atribuirRevisorService.execute({
        artigoId: submissao1.artigoId,
        revisorId: revisorMesmaInst.id,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      atribuirRevisorService.execute({
        artigoId: submissao1.artigoId,
        revisorId: revisorMesmoDominio.id,
      }),
    ).rejects.toThrow(BadRequestException);

    const submissao2 = await submeterArtigoService.execute({
      titulo: 'Artigo Externo',
      resumo: 'Resumo do artigo entre instituições diferentes com Gmail.',
      autorId: revisorExternoGmailAutor.id,
      nomeArquivoManuscrito: 'blind2.pdf',
      urlManuscrito: 'http://localhost:3000/submissoes/arquivos/blind_2.pdf',
    });

    await expect(
      atribuirRevisorService.execute({
        artigoId: submissao2.artigoId,
        revisorId: revisorExternoGmail.id,
      }),
    ).resolves.toEqual({ mensagem: 'Revisor atribuído com sucesso' });
  });

  it('deve aplicar sanitização Double-Blind por papel no backend e revelar autoria apenas no status PUBLICADO', async () => {
    const autor = await usuarioRepo.criar(
      'Maria Silva',
      '123',
      'AUTOR',
      'maria@usp.br',
      'USP',
    );
    const editor = await usuarioRepo.criar(
      'Editor Chefe',
      '123',
      'EDITOR',
      'editor@revista.org',
      'Revista Científica',
    );
    const revisor1 = await usuarioRepo.criar(
      'Dr. Carlos',
      '123',
      'REVISOR',
      'carlos@unicamp.br',
      'UNICAMP',
    );
    const revisorNaoAtribuido = await usuarioRepo.criar(
      'Dr. Intruso',
      '123',
      'REVISOR',
      'intruso@ufrj.br',
      'UFRJ',
    );

    const sub = await submeterArtigoService.execute({
      titulo: 'Arquitetura Blind Review em NestJS',
      resumo: 'Estudo sobre sanitização de DTOs e remoção de metadados em PDFs.',
      autorId: autor.id,
      nomeArquivoManuscrito: 'versao_anonima.pdf',
      urlManuscrito: 'http://localhost:3000/submissoes/arquivos/blind_demo.pdf',
      nomeArquivoIdentificado: 'versao_identificada.pdf',
      urlManuscritoIdentificado: 'http://localhost:3000/submissoes/arquivos/identified_demo.pdf',
    });

    await assumirArtigoService.execute(sub.artigoId, editor.id);
    await atribuirRevisorService.execute({ artigoId: sub.artigoId, revisorId: revisor1.id });

    // Revisor não atribuído não pode acessar o artigo
    await expect(
      buscarArtigoPorIdService.execute(sub.artigoId, {
        userId: revisorNaoAtribuido.id,
        role: 'REVISOR',
      }),
    ).rejects.toThrow(ForbiddenException);
    const listaIntruso = await buscarArtigosService.execute({
      userId: revisorNaoAtribuido.id,
      role: 'REVISOR',
    });
    expect(listaIntruso).toHaveLength(0);

    // Revisor atribuído vê apenas versão anonimizada e sem identidade do autor
    const visaoRevisorDurante = await buscarArtigoPorIdService.execute(sub.artigoId, {
      userId: revisor1.id,
      role: 'REVISOR',
    });
    expect(visaoRevisorDurante.autorId).toBe('ANONIMO');
    expect(visaoRevisorDurante.autorNome).toBe('Autor Anônimo (Double-Blind)');
    expect(visaoRevisorDurante.autorInstituicao).toBeUndefined();
    expect(visaoRevisorDurante.urlManuscrito).toContain('blind_demo.pdf');
    expect(visaoRevisorDurante.urlManuscritoIdentificado).toBeUndefined();
    expect(visaoRevisorDurante.blindReviewAtivo).toBe(true);

    // Revisor envia avaliação
    await submeterRevisaoService.execute({
      artigoId: sub.artigoId,
      revisorId: revisor1.id,
      nota: 5,
      comentarios: 'Excelente rigor metodológico.',
      estaAprovado: true,
    });

    // Antes da decisão editorial, autor não vê pareceres nem revisores
    const visaoAutorAntes = await buscarArtigoPorIdService.execute(sub.artigoId, {
      userId: autor.id,
      role: 'AUTOR',
    });
    expect(visaoAutorAntes.revisoresIds).toEqual([]);
    expect(visaoAutorAntes.revisoes).toEqual([]);

    // Editor vê tudo (autor, ambos PDFs e identidade real do revisor)
    const visaoEditor = await buscarArtigoPorIdService.execute(sub.artigoId, {
      userId: editor.id,
      role: 'EDITOR',
    });
    expect(visaoEditor.autorNome).toBe('Maria Silva');
    expect(visaoEditor.urlManuscritoIdentificado).toContain('identified_demo.pdf');
    expect(visaoEditor.revisoes[0].revisorNome).toBe('Dr. Carlos');

    // Não permite publicar antes de ACEITO
    await expect(publicarArtigoService.execute(sub.artigoId)).rejects.toThrow(
      BadRequestException,
    );

    // Editor decide ACEITO
    await decidirStatusService.execute(sub.artigoId, 'ACEITO');

    // Autor vê pareceres com identidade do revisor mascarada (Revisor #1)
    const visaoAutorAceito = await buscarArtigoPorIdService.execute(sub.artigoId, {
      userId: autor.id,
      role: 'AUTOR',
    });
    expect(visaoAutorAceito.revisoresIds).toEqual([]);
    expect(visaoAutorAceito.revisoes).toHaveLength(1);
    expect(visaoAutorAceito.revisoes[0].revisorId).toBe('REVISOR_1');
    expect(visaoAutorAceito.revisoes[0].revisorNome).toBe('Revisor #1');

    // Revisor ainda NÃO vê identidade do autor enquanto status for apenas ACEITO
    const visaoRevisorAceito = await buscarArtigoPorIdService.execute(sub.artigoId, {
      userId: revisor1.id,
      role: 'REVISOR',
    });
    expect(visaoRevisorAceito.autorId).toBe('ANONIMO');

    // Publicar (Reveal) -> PUBLICADO
    const pubResult = await publicarArtigoService.execute(sub.artigoId);
    expect(pubResult.status).toBe('PUBLICADO');

    // Após PUBLICADO, revisor e público veem identidade do autor e versão identificada
    const visaoRevisorPublicado = await buscarArtigoPorIdService.execute(sub.artigoId, {
      userId: revisor1.id,
      role: 'REVISOR',
    });
    expect(visaoRevisorPublicado.autorId).toBe(autor.id);
    expect(visaoRevisorPublicado.autorNome).toBe('Maria Silva');
    expect(visaoRevisorPublicado.autorInstituicao).toBe('USP');
    expect(visaoRevisorPublicado.urlManuscritoIdentificado).toContain('identified_demo.pdf');
    expect(visaoRevisorPublicado.blindReviewAtivo).toBe(false);

    const vitrinePublica = await buscarArtigosService.execute({ role: 'NEUTRO' });
    expect(vitrinePublica).toHaveLength(1);
    expect(vitrinePublica[0].autorNome).toBe('Maria Silva');
    expect(vitrinePublica[0].revisoresIds).toEqual([]);
    expect(vitrinePublica[0].revisoes).toEqual([]);
  });
});
