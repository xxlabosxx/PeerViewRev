export class Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public senha: string,
    public papel: 'AUTOR' | 'EDITOR' | 'REVISOR'
  ) {}
}
