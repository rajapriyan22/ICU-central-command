import React, { createContext, useContext, useState } from 'react';
import { AuthService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('icu_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await AuthService.login({ usernameOrEmail, password });
      setUser(res);
      localStorage.setItem('icu_user', JSON.stringify(res));
      return { success: true, role: res.role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('icu_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
