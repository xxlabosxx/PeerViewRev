'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'AUTOR' | 'EDITOR' | 'REVISOR' | 'NEUTRO';

interface ProfileContextData {
  role: Role;
  userId: string;
  nome: string;
  login: (userId: string, nome: string, role: Role) => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<Role>('NEUTRO');
  const [userId, setUserId] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('@App:role') as Role;
    const savedUserId = localStorage.getItem('@App:userId');
    const savedNome = localStorage.getItem('@App:nome');
    
    if (savedRole && savedUserId) {
      setRoleState(savedRole);
      setUserId(savedUserId);
      setNome(savedNome || '');
    }
    setMounted(true);
  }, []);

  const login = (newUserId: string, newNome: string, newRole: Role) => {
    setRoleState(newRole);
    setUserId(newUserId);
    setNome(newNome);
    
    localStorage.setItem('@App:role', newRole);
    localStorage.setItem('@App:userId', newUserId);
    localStorage.setItem('@App:nome', newNome);
  };

  const logout = () => {
    setRoleState('NEUTRO');
    setUserId('');
    setNome('');
    
    localStorage.removeItem('@App:role');
    localStorage.removeItem('@App:userId');
    localStorage.removeItem('@App:nome');
  };

  if (!mounted) {
    return null;
  }

  return (
    <ProfileContext.Provider value={{ role, userId, nome, login, logout }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
