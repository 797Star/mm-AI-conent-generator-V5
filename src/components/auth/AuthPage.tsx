import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        await signUp(formData.email, formData.password, formData.fullName);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-myanmar-50 to-gold-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="bg-myanmar-600 p-3 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="ml-3 text-3xl font-bold text-gray-900">
              Myanmar Content Creator
            </h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-ဖြင့် Myanmar Social Media Content များ ဖန်တီးပါ
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Professional Myanmar content creation tool with AI-powered generation
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-gold-100 p-2 rounded-lg mr-4">
                <Zap className="w-6 h-6 text-gold-600" />
              </div>
              <span className="text-lg text-gray-700">AI-powered Myanmar content generation</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-myanmar-100 p-2 rounded-lg mr-4">
                <Users className="w-6 h-6 text-myanmar-600" />
              </div>
              <span className="text-lg text-gray-700">Cultural intelligence & authentic voice</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h3>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              )}
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
              />
              
              <Input
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                showPasswordToggle
                placeholder="Your password"
              />

              {!isLogin && (
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  showPasswordToggle
                  placeholder="Confirm your password"
                />
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-myanmar-600 hover:text-myanmar-700 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}