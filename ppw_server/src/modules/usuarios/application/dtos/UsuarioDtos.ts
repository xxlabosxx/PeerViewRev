import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CadastrarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  senha: string;

  @IsString()
  @IsIn(['AUTOR', 'EDITOR', 'REVISOR'])
  papel: 'AUTOR' | 'EDITOR' | 'REVISOR';
}

export class LoginUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class UsuarioResponseDto {
  id: string;
  nome: string;
  papel: 'AUTOR' | 'EDITOR' | 'REVISOR';
}
