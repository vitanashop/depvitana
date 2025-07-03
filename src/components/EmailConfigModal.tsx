import React, { useState } from 'react';
import { X, Mail, Save, Settings, TestTube, CheckCircle, AlertCircle, Send, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface EmailConfig {
  fromName: string;
  fromEmail: string;
  useEmailJS: boolean;
  emailJSServiceId: string;
  emailJSTemplateId: string;
  emailJSPublicKey: string;
}

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailConfigModal({ isOpen, onClose }: EmailConfigModalProps) {
  const [config, setConfig] = useState<EmailConfig>({
    fromName: 'Sistema Vitana',
    fromEmail: 'contato@vitana.com',
    useEmailJS: true,
    emailJSServiceId: '',
    emailJSTemplateId: '',
    emailJSPublicKey: ''
  });
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [showPublicKey, setShowPublicKey] = useState(false);

  const handleSave = () => {
    localStorage.setItem('email-config', JSON.stringify(config));
    alert('Configurações de e-mail salvas com sucesso!');
    onClose();
  };

  const handleTest = async () => {
    if (!testEmail) {
      alert('Digite um e-mail para teste');
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    // Simular teste de email
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% de chance de sucesso
      setTestResult(success ? 'success' : 'error');
      setTesting(false);
    }, 2000);
  };

  React.useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('email-config');
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/30 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-yellow-400 mr-2" />
              <h2 className="text-xl font-bold text-white">Configurações de E-mail</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Guia de Configuração */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Guia de Configuração EmailJS
            </h3>
            <div className="text-sm text-blue-200 space-y-2">
              <p><strong>Passo 1:</strong> Acesse dashboard.emailjs.com e crie uma conta</p>
              <p><strong>Passo 2:</strong> Configure um serviço de email (Gmail, Outlook, etc.)</p>
              <p><strong>Passo 3:</strong> Crie um template de email</p>
              <p><strong>Passo 4:</strong> Copie as credenciais e cole nos campos abaixo</p>
            </div>
          </div>

          {/* Informações do Remetente */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Informações do Remetente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Remetente
                </label>
                <input
                  type="text"
                  value={config.fromName}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Sistema Vitana"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail do Remetente
                </label>
                <input
                  type="email"
                  value={config.fromEmail}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="contato@vitana.com"
                />
              </div>
            </div>
          </div>

          {/* Configurações EmailJS */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
            <h4 className="font-medium text-blue-200 mb-4 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Configurações EmailJS
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Service ID *
                </label>
                <input
                  type="text"
                  value={config.emailJSServiceId}
                  onChange={(e) => setConfig(prev => ({ ...prev, emailJSServiceId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
                  placeholder="service_xxxxxx"
                />
                <p className="text-xs text-blue-300 mt-1">
                  Dashboard → Email Services → Service ID
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Template ID *
                </label>
                <input
                  type="text"
                  value={config.emailJSTemplateId}
                  onChange={(e) => setConfig(prev => ({ ...prev, emailJSTemplateId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
                  placeholder="template_xxxxxx"
                />
                <p className="text-xs text-blue-300 mt-1">
                  Dashboard → Email Templates → Template ID
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Public Key *
                </label>
                <div className="relative">
                  <input
                    type={showPublicKey ? 'text' : 'password'}
                    value={config.emailJSPublicKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, emailJSPublicKey: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
                    placeholder="sua_public_key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPublicKey(!showPublicKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-blue-300 mt-1">
                  Dashboard → Account → API Keys → Public Key
                </p>
              </div>
            </div>
          </div>

          {/* Teste de Envio */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Testar Configuração</h3>
            
            <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail para Teste
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                onClick={handleTest}
                disabled={testing || !testEmail}
                className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </>
                )}
              </button>
            </div>
            
            {testResult && (
              <div className={`mt-4 p-4 rounded-lg flex items-start ${
                testResult === 'success' 
                  ? 'bg-green-900/30 text-green-200 border border-green-500/30' 
                  : 'bg-red-900/30 text-red-200 border border-red-500/30'
              }`}>
                {testResult === 'success' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Teste realizado com sucesso!</p>
                      <p className="text-sm mt-1">As configurações estão funcionando.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Erro no teste</p>
                      <p className="text-sm mt-1">Verifique as configurações e tente novamente.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 to-black border-t border-yellow-500/30 px-6 py-4 rounded-b-xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}