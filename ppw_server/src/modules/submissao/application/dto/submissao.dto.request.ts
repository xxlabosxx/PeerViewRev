import { IsString, IsNotEmpty, IsUrl, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class SubmeterArtigoRequest {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  resumo: string;

  @IsString()
  @IsNotEmpty()
  autorId: string;

  @IsString()
  @IsNotEmpty()
  nomeArquivoManuscrito: string;

  @IsUrl()
  @IsNotEmpty()
  urlManuscrito: string;
}

export class AlterarArtigoRequest {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  resumo: string;

  @IsOptional()
  @IsString()
  nomeArquivoManuscrito?: string;

  @IsOptional()
  @IsUrl()
  urlManuscrito?: string;
}

export class AssumirArtigoRequest {
  @IsString()
  @IsNotEmpty()
  editorId: string;
}

export class AtribuirRevisorRequest {
  @IsString()
  @IsNotEmpty()
  artigoId: string;

  @IsString()
  @IsNotEmpty()
  revisorId: string;
}

export class DesatribuirRevisorRequest {
  @IsString()
  @IsNotEmpty()
  revisorId: string;
}

export class SubmeterRevisaoRequest {
  @IsString()
  @IsNotEmpty()
  artigoId: string;

  @IsString()
  @IsNotEmpty()
  revisorId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  nota: number;

  @IsString()
  @IsNotEmpty()
  comentarios: string;

  @IsBoolean()
  estaAprovado: boolean;
}

export class DecidirStatusRequest {
  @IsString()
  @IsNotEmpty()
  status: 'ACEITO' | 'REJEITADO';
}
