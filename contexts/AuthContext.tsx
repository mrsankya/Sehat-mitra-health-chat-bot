
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string, role?: 'user' | 'admin', points?: number) => void;
  logout: () => void;
  addPoints: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('sehat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (name: string, email: string, forcedRole?: 'user' | 'admin', forcedPoints?: number) => {
    const role = forcedRole || (email.includes('admin') ? 'admin' : 'user');
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      points: forcedPoints !== undefined ? forcedPoints : 100 // Starting points or forced points
    };
    setUser(newUser);
    localStorage.setItem('sehat_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sehat_user');
  };

  const addPoints = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, points: (prev.points || 0) + amount };
      localStorage.setItem('sehat_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
