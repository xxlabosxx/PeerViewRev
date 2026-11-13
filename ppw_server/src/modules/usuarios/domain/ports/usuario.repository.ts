import { Usuario } from '../Usuario';

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';

export interface UsuarioRepository {
  salvar(usuario: Usuario): Promise<void>;
  criar(
    nome: string,
    senha: string,
    papel: 'AUTOR' | 'EDITOR' | 'REVISOR',
    email: string,
    instituicao: string,
  ): Promise<Usuario>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorNome(nome: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  listarPorPapel(papel: 'AUTOR' | 'EDITOR' | 'REVISOR'): Promise<Usuario[]>;
  listarTodos(): Promise<Usuario[]>;
}

