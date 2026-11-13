import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface PdfProcessadoResult {
  nomeArquivo: string;
  arquivoSalvo: string;
  tipo: 'anonimizado' | 'identificado';
  metadadosLimpos: boolean;
}

@Injectable()
export class PdfSanitizerService {
  private readonly uploadsDir = path.resolve(process.cwd(), 'uploads');

  async processarESalvarPdf(
    buffer: Buffer,
    originalName: string,
    tipo: 'anonimizado' | 'identificado',
    baseUrl: string,
  ): Promise<{ nomeArquivo: string; url: string; tipo: 'anonimizado' | 'identificado'; metadadosLimpos: boolean }> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Nenhum arquivo PDF válido foi enviado.');
    }

    const extensaoValida = originalName.toLowerCase().endsWith('.pdf');
    if (!extensaoValida) {
      throw new BadRequestException('Apenas arquivos com extensão .pdf são permitidos.');
    }

    await fs.mkdir(this.uploadsDir, { recursive: true });

    let bytesFinais: Uint8Array = buffer;
    let metadadosLimpos = false;

    if (tipo === 'anonimizado') {
      try {
        const pdfDoc = await PDFDocument.load(buffer, {
          ignoreEncryption: true,
          updateMetadata: false,
        });

        // Remove todos os metadados que possam revelar autoria ou instituição no Blind Review
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setCreator('');
        pdfDoc.setProducer('');

        bytesFinais = await pdfDoc.save();
        metadadosLimpos = true;
      } catch {
        throw new BadRequestException(
          'Não foi possível processar o PDF para anonimização de metadados. Verifique se o arquivo é um PDF válido.',
        );
      }
    }

    const prefixo = tipo === 'anonimizado' ? 'blind' : 'identified';
    const nomeArmazenado = `${prefixo}_${randomUUID()}.pdf`;
    const destino = path.join(this.uploadsDir, nomeArmazenado);

    await fs.writeFile(destino, bytesFinais);

    return {
      nomeArquivo: originalName,
      url: `${baseUrl}/submissoes/arquivos/${nomeArmazenado}`,
      tipo,
      metadadosLimpos,
    };
  }

  async obterCaminhoArquivo(filename: string): Promise<string> {
    const safeName = path.basename(filename);
    if (!safeName || safeName !== filename || !safeName.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Nome de arquivo inválido.');
    }

    const fullPath = path.join(this.uploadsDir, safeName);
    try {
      await fs.access(fullPath);
      return fullPath;
    } catch {
      throw new NotFoundException('Arquivo PDF não encontrado no armazenamento.');
    }
  }
}
