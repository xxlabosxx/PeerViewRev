import { IsString, IsNotEmpty, IsIn, IsEmail } from 'class-validator';

export class CadastrarUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome: string;

  @IsEmail({}, { message: 'Informe um e-mail institucional válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A instituição é obrigatória para prevenção de conflito de interesse.' })
  instituicao: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
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
  email: string;
  instituicao: string;
  papel: 'AUTOR' | 'EDITOR' | 'REVISOR';
}
