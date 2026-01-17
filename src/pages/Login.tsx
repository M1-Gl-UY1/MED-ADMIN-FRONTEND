import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/ui';
import { Lock, Mail, AlertCircle, Loader2, Shield, Car, BarChart3, Users } from 'lucide-react';
import logoMed from '../assets/logo_med.jpeg';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  const features = [
    { icon: Car, label: 'Gestion des vehicules' },
    { icon: BarChart3, label: 'Statistiques de ventes' },
    { icon: Users, label: 'Suivi des clients' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-400 to-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="mb-12">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <img
                src={logoMed}
                alt="MED Motors Logo"
                className="w-16 h-16 object-contain rounded-xl"
              />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
              MED Motors
            </h1>
            <p className="text-xl text-white/70">
              Panneau d'Administration
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 text-white/80 group"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-secondary/20 group-hover:border-secondary/40 transition-all duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-lg">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-secondary">50+</p>
              <p className="text-white/60 text-sm">Vehicules</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">200+</p>
              <p className="text-white/60 text-sm">Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">4</p>
              <p className="text-white/60 text-sm">Pays</p>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 shadow-lg">
              <img
                src={logoMed}
                alt="MED Motors Logo"
                className="w-16 h-16 object-contain rounded-xl"
              />
            </div>
            <h1 className="text-2xl font-bold text-primary">MED Motors Admin</h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary/60 uppercase tracking-wider">
                Acces securise
              </span>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Bienvenue
            </h2>
            <p className="text-gray-500">
              Connectez-vous pour acceder au tableau de bord administrateur
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="error" className="animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </Alert>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@med-motors.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 text-base bg-white border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 text-base bg-white border-gray-200 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} MED Motors. Tous droits reserves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
