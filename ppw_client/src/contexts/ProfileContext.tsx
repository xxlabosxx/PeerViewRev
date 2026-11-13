'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'AUTOR' | 'EDITOR' | 'REVISOR' | 'NEUTRO';

interface ProfileContextData {
  role: Role;
  userId: string;
  nome: string;
  email: string;
  instituicao: string;
  login: (userId: string, nome: string, role: Role, email?: string, instituicao?: string) => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<Role>('NEUTRO');
  const [userId, setUserId] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [instituicao, setInstituicao] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('@App:role') as Role;
    const savedUserId = localStorage.getItem('@App:userId');
    const savedNome = localStorage.getItem('@App:nome');
    const savedEmail = localStorage.getItem('@App:email');
    const savedInstituicao = localStorage.getItem('@App:instituicao');

    if (savedRole && savedUserId) {
      setRoleState(savedRole);
      setUserId(savedUserId);
      setNome(savedNome || '');
      setEmail(savedEmail || '');
      setInstituicao(savedInstituicao || '');
    }
    setMounted(true);
  }, []);

  const login = (
    newUserId: string,
    newNome: string,
    newRole: Role,
    newEmail = '',
    newInstituicao = '',
  ) => {
    setRoleState(newRole);
    setUserId(newUserId);
    setNome(newNome);
    setEmail(newEmail);
    setInstituicao(newInstituicao);

    localStorage.setItem('@App:role', newRole);
    localStorage.setItem('@App:userId', newUserId);
    localStorage.setItem('@App:nome', newNome);
    localStorage.setItem('@App:email', newEmail);
    localStorage.setItem('@App:instituicao', newInstituicao);
  };

  const logout = () => {
    setRoleState('NEUTRO');
    setUserId('');
    setNome('');
    setEmail('');
    setInstituicao('');

    localStorage.removeItem('@App:role');
    localStorage.removeItem('@App:userId');
    localStorage.removeItem('@App:nome');
    localStorage.removeItem('@App:email');
    localStorage.removeItem('@App:instituicao');
  };

  if (!mounted) {
    return null;
  }

  return (
    <ProfileContext.Provider value={{ role, userId, nome, email, instituicao, login, logout }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
