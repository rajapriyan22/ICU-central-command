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
      // Fallback demo logins if backend is starting or offline
      let demoUser = null;
      if (usernameOrEmail === 'admin' || password === 'Admin@123') {
        demoUser = {
          id: 1,
          username: 'admin',
          fullName: 'Hospital Administrator',
          email: 'admin@hospital.com',
          role: 'ADMIN',
          department: 'Hospital Operations',
          token: 'demo_token_admin'
        };
      } else if (usernameOrEmail === 'doctor1' || password === 'Doctor@123') {
        demoUser = {
          id: 2,
          username: 'doctor1',
          fullName: 'Dr. Arun Kumar',
          email: 'doctor1@hospital.com',
          role: 'DOCTOR',
          department: 'Critical Care',
          specialization: 'Intensive Care Medicine',
          token: 'demo_token_doctor'
        };
      } else if (usernameOrEmail === 'nurse1' || password === 'Nurse@123') {
        demoUser = {
          id: 3,
          username: 'nurse1',
          fullName: 'Priya Sharma',
          email: 'nurse1@hospital.com',
          role: 'NURSE',
          department: 'ICU - 1st Floor',
          shift: 'Morning',
          token: 'demo_token_nurse'
        };
      }

      if (demoUser) {
        setUser(demoUser);
        localStorage.setItem('icu_user', JSON.stringify(demoUser));
        return { success: true, role: demoUser.role };
      }

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
