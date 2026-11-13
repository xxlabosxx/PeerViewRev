import { Injectable } from '@nestjs/common';
import { Usuario } from '../domain/Usuario';
import { UsuarioRepository } from '../domain/ports/usuario.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class InMemoryUsuarioRepository implements UsuarioRepository {
  private readonly usuarios: Usuario[] = [];

  async salvar(usuario: Usuario): Promise<void> {
    const index = this.usuarios.findIndex((u) => u.id === usuario.id);
    if (index >= 0) {
      this.usuarios[index] = usuario;
    } else {
      this.usuarios.push(usuario);
    }
  }

  async criar(nome: string, senha: string, papel: 'AUTOR' | 'EDITOR' | 'REVISOR'): Promise<Usuario> {
    const id = randomUUID();
    const novoUsuario = new Usuario(id, nome, senha, papel);
    await this.salvar(novoUsuario);
    return novoUsuario;
  }

  async buscarPorNome(nome: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.nome.toLowerCase() === nome.toLowerCase()) || null;
  }

  async listarPorPapel(papel: 'AUTOR' | 'EDITOR' | 'REVISOR'): Promise<Usuario[]> {
    return this.usuarios.filter((u) => u.papel === papel);
  }

  async listarTodos(): Promise<Usuario[]> {
    return this.usuarios;
  }
}
