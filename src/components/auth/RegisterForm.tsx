
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, Car, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password, pin);
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to Smart Pulse! You can start booking parking slots now.",
        });
        navigate('/dashboard');
      } else {
        const errorMessage = result.error === 'email_exists' 
          ? "This email is already registered. Please sign in instead."
          : "Unable to create account. Please try again.";
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-white to-midnight-50 px-4">
      <Card className="w-full max-w-md border-cream-200">
        <CardHeader className="text-center bg-gradient-to-r from-cream-50 to-midnight-50">
          <div className="flex justify-center mb-4">
            <div className="bg-cream-100 p-3 rounded-full">
              <Car className="h-8 w-8 text-midnight-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-midnight-900">Create Account</CardTitle>
          <CardDescription className="text-midnight-700">Join Smart Pulse for seamless parking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-midnight-800">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-midnight-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 border-cream-200 focus:border-midnight-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-midnight-800">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-midnight-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-cream-200 focus:border-midnight-400"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-plum-800">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-plum-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-plum-200 focus:border-plum-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-plum-800">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-plum-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 border-plum-200 focus:border-plum-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="text-plum-800">Set Payment PIN</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-plum-400" />
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 4 && /^\d*$/.test(value)) {
                      setPin(value);
                    }
                  }}
                  className="pl-10 border-plum-200 focus:border-plum-400 text-center tracking-widest"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin" className="text-plum-800">Confirm Payment PIN</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-plum-400" />
                <Input
                  id="confirmPin"
                  type="password"
                  placeholder="Confirm 4-digit PIN"
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 4 && /^\d*$/.test(value)) {
                      setConfirmPin(value);
                    }
                  }}
                  className="pl-10 border-plum-200 focus:border-plum-400 text-center tracking-widest"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full midnight-gradient hover:opacity-90" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-plum-600">
              Already have an account?{' '}
              <Link to="/login" className="text-plum-700 hover:text-plum-900 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
