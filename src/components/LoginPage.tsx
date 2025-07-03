import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff,
  Shield,
  Package,
  Coffee,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempting, setLoginAttempting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginAttempting(true);

    if (!email || !username || !password) {
      setError('Preencha todos os campos');
      setLoginAttempting(false);
      return;
    }

    // ✅ Usar a função de login corrigida com 3 parâmetros
    const success = await login(email, username, password);
    
    if (!success) {
      setError('E-mail, usuário ou senha incorretos');
      setPassword('');
    }
    
    setLoginAttempting(false);
  };

  const fillDemo = (role: 'admin' | 'operator') => {
    // ✅ Preencher com dados de demonstração
    setEmail('demo@vitana.com');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('operador');
      setPassword('operador123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Efeitos de fundo dourado */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-transparent to-yellow-900/10"></div>
      </div>
      
      {/* Partículas douradas animadas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 opacity-20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Container principal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo e header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/25 overflow-hidden">
            {settings.useCustomLogo && settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.businessName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-10 w-10 text-black" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">{settings.businessName}</h1>
          <p className="text-gray-400 mb-4">{settings.businessSubtitle}</p>
          
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30">
            <div className="text-yellow-400 font-mono text-lg">
              {new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Card de login */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-yellow-400 mr-2" />
            <h2 className="text-xl font-bold text-white">Acesso ao Sistema</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ✅ Campo E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400"
                  placeholder="Digite seu e-mail"
                  disabled={loginAttempting}
                />
              </div>
            </div>

            {/* ✅ Campo Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400"
                  placeholder="Digite seu usuário"
                  disabled={loginAttempting}
                />
              </div>
            </div>

            {/* ✅ Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400"
                  placeholder="Digite sua senha"
                  disabled={loginAttempting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={loginAttempting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginAttempting || isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/25"
            >
              {loginAttempting || isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Dados de demonstração */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center mb-4">
              <Coffee className="h-4 w-4 inline mr-1" />
              Contas de demonstração:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => fillDemo('admin')}
                className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg hover:bg-yellow-900/50 transition-colors text-left"
                disabled={loginAttempting}
              >
                <div className="text-sm font-medium text-yellow-300">👨‍💼 Administrador</div>
                <div className="text-xs text-gray-400">demo@vitana.com / admin / admin123</div>
              </button>
              
              <button
                onClick={() => fillDemo('operator')}
                className="p-3 bg-gray-800/30 border border-gray-500/30 rounded-lg hover:bg-gray-800/50 transition-colors text-left"
                disabled={loginAttempting}
              >
                <div className="text-sm font-medium text-gray-300">👩‍💼 Operador de Caixa</div>
                <div className="text-xs text-gray-400">demo@vitana.com / operador / operador123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}