'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile, Role } from '../../contexts/ProfileContext';
import { api } from '../../services/api';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useProfile();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    instituicao: '',
    senha: '',
    papel: 'AUTOR' as Role,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const data = await api.loginUsuario({ nome: formData.nome, senha: formData.senha });
        login(data.id, data.nome, data.papel, data.email, data.instituicao);
      } else {
        const data = await api.cadastrarUsuario({
          nome: formData.nome,
          email: formData.email,
          instituicao: formData.instituicao,
          senha: formData.senha,
          papel: formData.papel,
        });
        login(data.id, data.nome, data.papel, data.email, data.instituicao);
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600">
          Ou{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="font-semibold text-blue-600 hover:text-blue-500 transition-all"
          >
            {isLogin ? 'faça seu cadastro agora' : 'entre se já possui uma conta'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl border border-white/40 sm:rounded-3xl sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm relative animate-in fade-in slide-in-from-top-2"
                role="alert"
                aria-live="polite"
              >
                <span className="block sm:inline font-medium">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-700">
                {isLogin ? 'Nome de Usuário ou E-mail' : 'Nome Completo'}
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  autoComplete={isLogin ? 'username' : 'name'}
                  spellCheck={false}
                  autoCapitalize={isLogin ? 'none' : 'words'}
                  enterKeyHint="next"
                  value={formData.nome}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 transition-all placeholder-gray-400"
                  placeholder={isLogin ? 'Seu nome ou e-mail institucional' : 'Seu nome completo'}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    E-mail Institucional <span aria-hidden="true">*</span>
                  </label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      autoCapitalize="none"
                      enterKeyHint="next"
                      aria-describedby="email-coi-help"
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 transition-all placeholder-gray-400"
                      placeholder="nome@ifsp.edu.br"
                    />
                  </div>
                  <p id="email-coi-help" className="mt-1.5 text-xs text-gray-500">
                    O domínio do e-mail é usado para detectar conflitos de interesse no Blind Review.
                  </p>
                </div>

                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label htmlFor="instituicao" className="block text-sm font-semibold text-gray-700">
                    Instituição de Vínculo <span aria-hidden="true">*</span>
                  </label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <input
                      id="instituicao"
                      name="instituicao"
                      type="text"
                      required
                      autoComplete="organization"
                      enterKeyHint="next"
                      value={formData.instituicao}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 transition-all placeholder-gray-400"
                      placeholder="Ex: IFSP, USP, UNICAMP"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="senha" className="block text-sm font-semibold text-gray-700">
                Senha
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  enterKeyHint={isLogin ? 'done' : 'next'}
                  value={formData.senha}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-20 px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 transition-all placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label htmlFor="papel" className="block text-sm font-semibold text-gray-700">
                  Qual o seu papel?
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    id="papel"
                    name="papel"
                    value={formData.papel}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 text-base border border-gray-200 focus:bg-white bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-xl text-gray-900 transition-all"
                  >
                    <option value="AUTOR">Autor (Submete artigos)</option>
                    <option value="REVISOR">Revisor (Lê e avalia artigos)</option>
                    <option value="EDITOR">Editor (Atribui artigos e dá o Veredito)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all ${isLoading ? 'opacity-75 cursor-wait translate-y-0 shadow-md' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                  </span>
                ) : (isLogin ? 'Entrar no Sistema' : 'Criar Conta e Entrar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>}>
      <AuthContent />
    </Suspense>
  );
}
