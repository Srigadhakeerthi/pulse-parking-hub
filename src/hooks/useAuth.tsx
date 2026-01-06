
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  pin?: string;
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
        // User exists - load their saved data
        setUser(existingUser);
        localStorage.setItem('smartpulse_user', JSON.stringify(existingUser));
        return true;
      }
      
      // Create new user only if not found (for admin or first-time mock users)
      const newUser: User = {
        id: Date.now().toString(),
        name: email === 'admin@smartpulse.com' ? 'Admin User' : email.split('@')[0],
        email,
        role: email === 'admin@smartpulse.com' ? 'admin' : 'user',
        walletBalance: 500,
        pin: '1234'
      };
      
      // Save new user to users array
      existingUsers.push(newUser);
      localStorage.setItem('smartpulse_users', JSON.stringify(existingUsers));
      
      setUser(newUser);
      localStorage.setItem('smartpulse_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, pin: string): Promise<boolean> => {
    try {
      console.log('Register attempt:', { name, email, password, pin });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'user',
        walletBalance: 500, // Initial wallet balance
        pin
      };
      
      // Store user in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('smartpulse_users') || '[]');
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
