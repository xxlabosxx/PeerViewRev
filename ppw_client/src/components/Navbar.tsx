'use client';

import Link from 'next/link';
import { useProfile } from '../contexts/ProfileContext';

export default function Navbar() {
  const { role, nome, instituicao, logout } = useProfile();

  const roleColors = {
    AUTOR: 'bg-blue-100 text-blue-800 border-blue-200',
    EDITOR: 'bg-purple-100 text-purple-800 border-purple-200',
    REVISOR: 'bg-green-100 text-green-800 border-green-200',
    NEUTRO: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 tracking-tighter">PeerRev</span>
          </Link>

          <div className="flex items-center gap-4">
            {role !== 'NEUTRO' ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Olá, {nome}
                    {instituicao ? ` (${instituicao})` : ''}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColors[role]}`}>
                    {role}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/auth?mode=login"
                  className="text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
                >
                  Entrar
                </Link>
                <Link 
                  href="/auth?mode=register"
                  className="text-sm font-medium text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
