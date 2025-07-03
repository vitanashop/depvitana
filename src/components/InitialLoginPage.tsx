import React, { useState } from 'react';
import { 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Clock,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  Coffee,
  Building2,
  Key,
  UserPlus,
  Settings,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BusinessSelector } from './BusinessSelector';
import { LoginPage } from './LoginPage';

export function InitialLoginPage() {
  const { 
    checkEmailAccess, 
    checkUserPasswordStatus, 
    setupDualPasswords,
    requestPasswordReset,
    resetPassword,
    validateResetCode,
    superAdminLogin,
    requestAccess,
    isLoading 
  } = useAuth();
  
  const [step, setStep] = useState<'initial' | 'access-check' | 'password-setup' | 'password-reset' | 'business-select' | 'login' | 'super-admin' | 'request-access'>('initial');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [userStatus, setUserStatus] = useState<'not_found' | 'needs_setup' | 'ready' | null>(null);
  
  // Estados para configuração de senhas DUPLAS
  const [passwordSetup, setPasswordSetup] = useState({
    // Credenciais do Administrador
    adminUsername: '',
    adminPassword: '',
    adminConfirmPassword: '',
    
    // Credenciais do Operador
    operatorUsername: '',
    operatorPassword: '',
    operatorConfirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    adminPassword: false,
    adminConfirmPassword: false,
    operatorPassword: false,
    operatorConfirmPassword: false
  });
  
  // Estados para recuperação de senha
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'code' | 'new-password'>('request');

  // Estados para Super Admin
  const [superAdminPassword, setSuperAdminPassword] = useState('');

  // Estados para solicitação de acesso
  const [accessRequest, setAccessRequest] = useState({
    fullName: '',
    email: '',
    businessName: '',
    businessDescription: ''
  });

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Digite seu e-mail');
      return;
    }

    // Verificar se o e-mail tem acesso autorizado
    const hasAccess = checkEmailAccess(email);
    
    if (!hasAccess) {
      setError('E-mail não autorizado. Solicite acesso ao administrador.');
      return;
    }

    // Verificar status da senha do usuário
    const status = checkUserPasswordStatus(email);
    setUserStatus(status);

    switch (status) {
      case 'not_found':
        setError('Usuário não encontrado no sistema.');
        break;
      case 'needs_setup':
        setStep('password-setup');
        break;
      case 'ready':
        setStep('login');
        break;
    }
  };

  const handleDualPasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ VALIDAÇÕES RIGOROSAS
    
    // Validar campos do Administrador
    if (!passwordSetup.adminUsername.trim()) {
      setError('Digite o nome de usuário do Administrador');
      return;
    }
    if (passwordSetup.adminUsername.length < 3) {
      setError('Nome de usuário do Administrador deve ter pelo menos 3 caracteres');
      return;
    }
    if (!passwordSetup.adminPassword) {
      setError('Digite a senha do Administrador');
      return;
    }
    if (passwordSetup.adminPassword.length < 6) {
      setError('Senha do Administrador deve ter pelo menos 6 caracteres');
      return;
    }
    if (passwordSetup.adminPassword !== passwordSetup.adminConfirmPassword) {
      setError('Confirmação de senha do Administrador não confere');
      return;
    }

    // Validar campos do Operador
    if (!passwordSetup.operatorUsername.trim()) {
      setError('Digite o nome de usuário do Operador');
      return;
    }
    if (passwordSetup.operatorUsername.length < 3) {
      setError('Nome de usuário do Operador deve ter pelo menos 3 caracteres');
      return;
    }
    if (!passwordSetup.operatorPassword) {
      setError('Digite a senha do Operador');
      return;
    }
    if (passwordSetup.operatorPassword.length < 6) {
      setError('Senha do Operador deve ter pelo menos 6 caracteres');
      return;
    }
    if (passwordSetup.operatorPassword !== passwordSetup.operatorConfirmPassword) {
      setError('Confirmação de senha do Operador não confere');
      return;
    }

    // ✅ VALIDAR QUE AS CREDENCIAIS SÃO DIFERENTES
    if (passwordSetup.adminUsername.toLowerCase() === passwordSetup.operatorUsername.toLowerCase()) {
      setError('Os nomes de usuário do Administrador e Operador devem ser diferentes');
      return;
    }
    if (passwordSetup.adminPassword === passwordSetup.operatorPassword) {
      setError('As senhas do Administrador e Operador devem ser diferentes');
      return;
    }

    // ✅ Configurar senhas duplas
    const adminCredentials = {
      username: passwordSetup.adminUsername,
      password: passwordSetup.adminPassword,
      role: 'admin' as const
    };

    const operatorCredentials = {
      username: passwordSetup.operatorUsername,
      password: passwordSetup.operatorPassword,
      role: 'operator' as const
    };

    const success = await setupDualPasswords(email, adminCredentials, operatorCredentials);

    if (success) {
      // Login automático como administrador já é feito na função setupDualPasswords
      setStep('business-select');
    } else {
      setError('Erro ao configurar senhas. Tente novamente.');
    }
  };

  const handlePasswordReset = async () => {
    setError('');

    if (resetStep === 'request') {
      const success = await requestPasswordReset(email);
      if (success) {
        setResetStep('code');
        alert('📧 Código de recuperação enviado para seu e-mail!');
      } else {
        setError('Erro ao solicitar recuperação. Verifique seu e-mail.');
      }
    } else if (resetStep === 'code') {
      if (!resetCode.trim()) {
        setError('Digite o código de recuperação');
        return;
      }
      
      const isValid = validateResetCode(email, resetCode);
      if (isValid) {
        setResetStep('new-password');
      } else {
        setError('Código inválido ou expirado');
      }
    } else if (resetStep === 'new-password') {
      if (!newPassword || newPassword.length < 6) {
        setError('Nova senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      if (newPassword !== confirmNewPassword) {
        setError('Senhas não coincidem');
        return;
      }
      
      const success = await resetPassword(email, resetCode, newPassword);
      if (success) {
        alert('✅ Senha redefinida com sucesso!');
        setStep('login');
      } else {
        setError('Erro ao redefinir senha');
      }
    }
  };

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!superAdminPassword) {
      setError('Digite a senha do Super Administrador');
      return;
    }

    const success = await superAdminLogin(superAdminPassword);
    if (!success) {
      setError('Senha incorreta');
      setSuperAdminPassword('');
    }
  };

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessRequest.fullName.trim() || !accessRequest.email.trim() || !accessRequest.businessName.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await requestAccess(accessRequest);
      alert('✅ Solicitação enviada com sucesso!\n\nSua solicitação foi enviada para análise do administrador. Você receberá um e-mail quando for aprovada.');
      setStep('initial');
      setAccessRequest({ fullName: '', email: '', businessName: '', businessDescription: '' });
    } catch (error) {
      setError('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  // Renderizar componentes específicos baseado no step
  if (step === 'business-select') {
    return <BusinessSelector onBusinessSelected={() => {}} />;
  }

  if (step === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-yellow-900/20"></div>
      
      {/* Partículas animadas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
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

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/25">
            <Shield className="h-10 w-10 text-black" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Gestão</h1>
          <p className="text-gray-400 mb-4">Acesso controlado para estabelecimentos autorizados</p>
        </div>

        {/* Card principal */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-8">
          
          {/* Etapa Inicial - Menu Principal */}
          {step === 'initial' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Escolha uma Opção</h2>
              </div>

              <div className="space-y-4">
                {/* Solicitar Acesso */}
                <button
                  onClick={() => setStep('request-access')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-500/25"
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-bold">Solicitar Acesso</div>
                    <div className="text-sm opacity-90">Primeira vez? Peça autorização</div>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto" />
                </button>

                {/* Verificar Acesso */}
                <button
                  onClick={() => setStep('access-check')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg shadow-yellow-500/25"
                >
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-bold">Acessar Sistema</div>
                    <div className="text-sm opacity-90">Já tenho autorização</div>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto" />
                </button>
              </div>

              {/* Link Super Admin discreto */}
              <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                <button
                  onClick={() => setStep('super-admin')}
                  className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
                >
                  Painel Administrativo
                </button>
              </div>

              {/* Informações */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  <Coffee className="h-3 w-3 inline mr-1" />
                  Sistema de Gestão v2.0
                </p>
                <p className="text-xs text-gray-500">
                  ⚠️ Acesso restrito a usuários autorizados pelo administrador
                </p>
              </div>
            </>
          )}

          {/* Etapa de Verificação de E-mail */}
          {step === 'access-check' && (
            <>
              <div className="text-center mb-6">
                <Mail className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Verificação de Acesso</h2>
                <p className="text-gray-400 text-sm">Digite seu e-mail para verificar autorização</p>
              </div>

              <form onSubmit={handleEmailCheck} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail Autorizado
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/25"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  Verificar Acesso
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('initial')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  disabled={isLoading}
                >
                  ← Voltar
                </button>
              </div>
            </>
          )}

          {/* Etapa de Super Admin */}
          {step === 'super-admin' && (
            <>
              <div className="text-center mb-6">
                <Crown className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Super Administrador</h2>
                <p className="text-gray-400 text-sm">Acesso ao painel de controle administrativo</p>
              </div>

              <form onSubmit={handleSuperAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Senha do Super Administrador
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={superAdminPassword}
                      onChange={(e) => setSuperAdminPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                      placeholder="Digite a senha master"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Settings className="h-5 w-5 mr-2" />
                  )}
                  Acessar Painel
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('initial')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  disabled={isLoading}
                >
                  ← Voltar
                </button>
              </div>
            </>
          )}

          {/* Etapa de Solicitação de Acesso */}
          {step === 'request-access' && (
            <>
              <div className="text-center mb-6">
                <UserPlus className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Solicitar Acesso</h2>
                <p className="text-gray-400 text-sm">Preencha os dados para solicitar autorização</p>
              </div>

              <form onSubmit={handleAccessRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={accessRequest.fullName}
                    onChange={(e) => setAccessRequest(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="Seu nome completo"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={accessRequest.email}
                    onChange={(e) => setAccessRequest(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Estabelecimento *
                  </label>
                  <input
                    type="text"
                    value={accessRequest.businessName}
                    onChange={(e) => setAccessRequest(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="Nome do seu negócio"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição do Negócio
                  </label>
                  <textarea
                    value={accessRequest.businessDescription}
                    onChange={(e) => setAccessRequest(prev => ({ ...prev, businessDescription: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
                    placeholder="Descreva brevemente seu negócio..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-5 w-5 mr-2" />
                  )}
                  Enviar Solicitação
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('initial')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  disabled={isLoading}
                >
                  ← Voltar
                </button>
              </div>
            </>
          )}

          {/* ✅ Etapa de Configuração de Senhas DUPLAS */}
          {step === 'password-setup' && (
            <>
              <div className="text-center mb-6">
                <Key className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Configurar Credenciais</h2>
                <p className="text-gray-400 text-sm">Configure senhas para Administrador e Operador</p>
                <div className="mt-3 p-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-xs">✅ E-mail verificado: {email}</p>
                </div>
              </div>

              <form onSubmit={handleDualPasswordSetup} className="space-y-6">
                {/* ✅ SEÇÃO ADMINISTRADOR */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-blue-300 font-semibold mb-3 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Credenciais do Administrador
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Nome de Usuário *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={passwordSetup.adminUsername}
                          onChange={(e) => setPasswordSetup(prev => ({ ...prev, adminUsername: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                          placeholder="admin_usuario"
                          required
                          minLength={3}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Senha *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPasswords.adminPassword ? 'text' : 'password'}
                          value={passwordSetup.adminPassword}
                          onChange={(e) => setPasswordSetup(prev => ({ ...prev, adminPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                          placeholder="Senha do administrador"
                          required
                          minLength={6}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, adminPassword: !prev.adminPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          disabled={isLoading}
                        >
                          {showPasswords.adminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">
                        Confirmar Senha *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPasswords.adminConfirmPassword ? 'text' : 'password'}
                          value={passwordSetup.adminConfirmPassword}
                          onChange={(e) => setPasswordSetup(prev => ({ ...prev, adminConfirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                          placeholder="Confirme a senha"
                          required
                          minLength={6}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, adminConfirmPassword: !prev.adminConfirmPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          disabled={isLoading}
                        >
                          {showPasswords.adminConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ SEÇÃO OPERADOR */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-300 font-semibold mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Credenciais do Operador
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-1">
                        Nome de Usuário *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={passwordSetup.operatorUsername}
                          onChange={(e) => setPasswordSetup(prev => ({ ...prev, operatorUsername: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                          placeholder="operador_usuario"
                          required
                          minLength={3}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-1">
                        Senha *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPasswords.operatorPassword ? 'text' : 'password'}
                          value={passwordSetup.operatorPassword}
                          onChange={(e) => setPasswordSetup(prev => ({ ...prev, operatorPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                          placeholder="Senha do operador"
                          required
                          minLength={6}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, operatorPassword: !prev.operatorPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          disabled={isLoading}
                        >
                          {showPasswords.operatorPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-1">
                        Confirmar Senha *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPasswords.operatorConfirmPassword ? 'text' : 'password'}
                          value={passwordSetup.operatorConfirmPassword}
                          onChange={(e) => setPasswordSetup(prev => ({ ...prev, operatorConfirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                          placeholder="Confirme a senha"
                          required
                          minLength={6}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, operatorConfirmPassword: !prev.operatorConfirmPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          disabled={isLoading}
                        >
                          {showPasswords.operatorConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ AVISO DE SEGURANÇA */}
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                  <h4 className="text-yellow-300 font-medium text-sm mb-2">🔒 Importante:</h4>
                  <ul className="text-yellow-200 text-xs space-y-1">
                    <li>• <strong>Administrador:</strong> Acesso completo ao sistema</li>
                    <li>• <strong>Operador:</strong> Acesso limitado ao PDV e vendas</li>
                    <li>• <strong>Senhas devem ser diferentes</strong> para garantir segurança</li>
                    <li>• <strong>Usuários devem ser únicos</strong> para cada tipo</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Configurar e Entrar
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('access-check')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  disabled={isLoading}
                >
                  ← Voltar
                </button>
              </div>
            </>
          )}

          {/* Etapa de Recuperação de Senha */}
          {step === 'password-reset' && (
            <>
              <div className="text-center mb-6">
                <Clock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Recuperar Senha</h2>
                <p className="text-gray-400 text-sm">
                  {resetStep === 'request' && 'Solicitar código de recuperação'}
                  {resetStep === 'code' && 'Digite o código recebido por e-mail'}
                  {resetStep === 'new-password' && 'Defina sua nova senha'}
                </p>
              </div>

              <div className="space-y-4">
                {resetStep === 'request' && (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      Um código será enviado para: <strong>{email}</strong>
                    </p>
                    <button
                      onClick={handlePasswordReset}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Enviando...' : 'Enviar Código'}
                    </button>
                  </div>
                )}

                {resetStep === 'code' && (
                  <>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white text-center font-mono text-lg"
                      placeholder="CÓDIGO"
                      maxLength={6}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handlePasswordReset}
                      disabled={isLoading || !resetCode.trim()}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Verificar Código
                    </button>
                  </>
                )}

                {resetStep === 'new-password' && (
                  <>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Nova senha"
                      minLength={6}
                      disabled={isLoading}
                    />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Confirmar nova senha"
                      minLength={6}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handlePasswordReset}
                      disabled={isLoading || !newPassword || !confirmNewPassword}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Redefinir Senha
                    </button>
                  </>
                )}

                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={() => setStep('access-check')}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                    disabled={isLoading}
                  >
                    ← Voltar ao login
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Link para recuperação de senha (apenas no step access-check) */}
          {step === 'access-check' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('password-reset')}
                className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}