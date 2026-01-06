
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  pin?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, pin: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateWalletBalance: (amount: number) => void;
  verifyPin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('smartpulse_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt:', { email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in localStorage (registered users)
      const existingUsers = JSON.parse(localStorage.getItem('smartpulse_users') || '[]');
      const existingUser = existingUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        // Validate password
        if (existingUser.password !== password) {
          console.log('Password mismatch');
          return false;
        }
        // User exists and password matches - load their saved data
        setUser(existingUser);
        localStorage.setItem('smartpulse_user', JSON.stringify(existingUser));
        return true;
      }
      
      // Demo accounts for testing
      if (email === 'user@test.com' && password === 'password123') {
        const demoUser: User = {
          id: 'demo-user',
          name: 'Demo User',
          email,
          role: 'user',
          walletBalance: 500,
          pin: '1234',
          password: 'password123'
        };
        existingUsers.push(demoUser);
        localStorage.setItem('smartpulse_users', JSON.stringify(existingUsers));
        setUser(demoUser);
        localStorage.setItem('smartpulse_user', JSON.stringify(demoUser));
        return true;
      }
      
      if (email === 'admin@ParkEZE.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'demo-admin',
          name: 'Admin User',
          email,
          role: 'admin',
          walletBalance: 1000,
          pin: '1234',
          password: 'admin123'
        };
        existingUsers.push(adminUser);
        localStorage.setItem('smartpulse_users', JSON.stringify(existingUsers));
        setUser(adminUser);
        localStorage.setItem('smartpulse_user', JSON.stringify(adminUser));
        return true;
      }
      
      // User not found
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, pin: string): Promise<boolean> => {
    try {
      console.log('Register attempt:', { name, email, pin });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const existingUsers = JSON.parse(localStorage.getItem('smartpulse_users') || '[]');
      const emailExists = existingUsers.some((u: any) => u.email === email);
      
      if (emailExists) {
        console.log('Email already registered');
        return false;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'user',
        walletBalance: 500,
        pin,
        password // Store password for validation
      };
      
      // Store user in localStorage
      existingUsers.push(newUser);
      localStorage.setItem('smartpulse_users', JSON.stringify(existingUsers));
      
      setUser(newUser);
      localStorage.setItem('smartpulse_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateWalletBalance = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: user.walletBalance + amount };
      setUser(updatedUser);
      localStorage.setItem('smartpulse_user', JSON.stringify(updatedUser));
      
      // Update in users array
      const existingUsers = JSON.parse(localStorage.getItem('smartpulse_users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('smartpulse_users', JSON.stringify(existingUsers));
      }
    }
  };

  const verifyPin = (pin: string): boolean => {
    return user?.pin === pin;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartpulse_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateWalletBalance, verifyPin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
