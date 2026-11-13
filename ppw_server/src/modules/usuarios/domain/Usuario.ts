const DOMINIOS_PUBLICOS_GENERICOS = new Set([
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'uol.com.br',
  'bol.com.br',
  'proton.me',
  'protonmail.com',
]);

export class Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public senha: string,
    public papel: 'AUTOR' | 'EDITOR' | 'REVISOR',
    public email: string = '',
    public instituicao: string = '',
  ) {}

  public obterDominioEmail(): string | null {
    if (!this.email || !this.email.includes('@')) return null;
    const parts = this.email.trim().toLowerCase().split('@');
    return parts.length === 2 && parts[1] ? parts[1] : null;
  }

  public obterInstituicaoNormalizada(): string {
    return (this.instituicao || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Verifica conflito de interesse (COI) para Blind Review por autoria,
   * instituição de vínculo ou domínio de e-mail institucional.
   */
  public possuiConflitoInstitucionalCom(outroUsuario: Usuario): {
    conflito: boolean;
    motivo?: string;
  } {
    if (this.id === outroUsuario.id) {
      return {
        conflito: true,
        motivo: 'O autor não pode revisar o próprio artigo.',
      };
    }

    const instA = this.obterInstituicaoNormalizada();
    const instB = outroUsuario.obterInstituicaoNormalizada();
    if (instA && instB && instA !== 'nao informada' && instA === instB) {
      return {
        conflito: true,
        motivo: `Mesma instituição (${outroUsuario.instituicao}).`,
      };
    }

    const domA = this.obterDominioEmail();
    const domB = outroUsuario.obterDominioEmail();
    if (
      domA &&
      domB &&
      domA === domB &&
      !DOMINIOS_PUBLICOS_GENERICOS.has(domA)
    ) {
      return {
        conflito: true,
        motivo: `Mesmo domínio de e-mail institucional (@${domB}).`,
      };
    }

    return { conflito: false };
  }
}
