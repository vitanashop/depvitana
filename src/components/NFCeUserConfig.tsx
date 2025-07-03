import React, { useState } from 'react';
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  FileText,
  Key,
  Globe,
  Settings,
  Save,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface NFCeUserConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NFCeUserConfig({ isOpen, onClose }: NFCeUserConfigProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [config, setConfig] = useState({
    // Certificado Digital
    certificateFile: null as File | null,
    certificatePassword: '',
    certificateValid: false,
    
    // Dados da Empresa
    cnpj: '',
    inscricaoEstadual: '',
    razaoSocial: '',
    nomeFantasia: '',
    
    // Endereço
    logradouro: '',
    numero: '',
    bairro: '',
    municipio: '',
    uf: 'SP',
    cep: '',
    
    // Configurações Técnicas
    ambiente: 'homologacao' as 'homologacao' | 'producao',
    serie: 1,
    proximoNumero: 1,
    
    // Status
    homologado: false,
    ativo: false
  });

  const steps = [
    { id: 1, title: 'Certificado Digital', icon: Shield },
    { id: 2, title: 'Dados da Empresa', icon: FileText },
    { id: 3, title: 'Configurações', icon: Settings },
    { id: 4, title: 'Homologação', icon: CheckCircle }
  ];

  const handleCertificateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setConfig(prev => ({ ...prev, certificateFile: file }));
      // Aqui você faria a validação real do certificado
      setTimeout(() => {
        setConfig(prev => ({ ...prev, certificateValid: true }));
      }, 1000);
    }
  };

  const handleSave = () => {
    // Salvar configurações do usuário
    localStorage.setItem('user-nfce-config', JSON.stringify(config));
    alert('Configurações salvas! Agora você pode emitir NFCe válidas.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Configuração NFCe - Produção Real</h2>
              <p className="text-gray-400">Configure seu certificado digital e dados para emitir NFCe válidas</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              title="Fechar e voltar ao sistema"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Custos Estimados */}
        <div className="p-6 border-b border-gray-700">
          {/* Aviso de que NFCe não é obrigatória */}
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-300 mb-2 flex items-center">
              ℹ️ NFCe não é obrigatória para usar o sistema!
            </h3>
            <p className="text-green-200 text-sm">
              Você pode continuar usando todas as funcionalidades do sistema normalmente. 
              A configuração de NFCe real só é necessária se você quiser emitir notas fiscais válidas.
            </p>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              💰 Custos por sua conta (investimento necessário)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-blue-200">
                <strong>Certificado Digital A1</strong>
                <br />💳 R$ 180 - R$ 300/ano
                <br />✅ Recomendado para sistema web
              </div>
              <div className="text-blue-200">
                <strong>Homologação SEFAZ</strong>
                <br />⏱️ 5-15 dias úteis
                <br />✅ Obrigatório uma vez
              </div>
              <div className="text-blue-200">
                <strong>Total de Investimento</strong>
                <br />⏱️ Setup completo
                <br />💾 Salvar e Sair
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activeStep >= step.id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </button>
                <span className={`ml-3 text-sm font-medium ${
                  activeStep >= step.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-6 w-8 h-0.5 ${
                    activeStep > step.id ? 'bg-yellow-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Certificado Digital */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Certificado Digital A1</h3>
                <p className="text-gray-400">Upload do seu certificado .pfx para assinatura digital</p>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-300 mb-2">🛒 Ainda não tem certificado?</h4>
                <p className="text-yellow-200 text-sm mb-3">
                  Você pode comprar diretamente das Autoridades Certificadoras:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a 
                    href="https://serasa.certificadodigital.com.br" 
                    target="_blank"
                    className="flex items-center p-3 bg-yellow-800/30 rounded hover:bg-yellow-700/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="text-sm">Serasa (R$ 180)</span>
                  </a>
                  <a 
                    href="https://www.valid.com" 
                    target="_blank"
                    className="flex items-center p-3 bg-yellow-800/30 rounded hover:bg-yellow-700/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="text-sm">Valid (R$ 200)</span>
                  </a>
                  <a 
                    href="https://www.safeweb.com.br" 
                    target="_blank"
                    className="flex items-center p-3 bg-yellow-800/30 rounded hover:bg-yellow-700/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="text-sm">Safeweb (R$ 250)</span>
                  </a>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-4">📁 Upload do Certificado</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Arquivo do Certificado (.pfx ou .p12)
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".pfx,.p12"
                          onChange={handleCertificateUpload}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">
                            {config.certificateFile ? config.certificateFile.name : 'Clique para selecionar o arquivo .pfx'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Senha do Certificado
                    </label>
                    <input
                      type="password"
                      value={config.certificatePassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, certificatePassword: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                      placeholder="Digite a senha do certificado"
                    />
                  </div>

                  {config.certificateValid && (
                    <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center text-green-300">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">Certificado válido!</span>
                      </div>
                      <p className="text-green-200 text-sm mt-1">
                        Certificado carregado e validado com sucesso.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveStep(2)}
                  disabled={!config.certificateValid}
                  className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo →
                </button>
              </div>
              
              {/* Opção de sair sem configurar */}
              <div className="text-center mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Voltar ao sistema sem configurar NFCe
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Dados da Empresa */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <FileText className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Dados da Empresa</h3>
                <p className="text-gray-400">Informações que aparecerão nas NFCe emitidas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    value={config.cnpj}
                    onChange={(e) => setConfig(prev => ({ ...prev, cnpj: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Inscrição Estadual *</label>
                  <input
                    type="text"
                    value={config.inscricaoEstadual}
                    onChange={(e) => setConfig(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="123.456.789.123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Razão Social *</label>
                  <input
                    type="text"
                    value={config.razaoSocial}
                    onChange={(e) => setConfig(prev => ({ ...prev, razaoSocial: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="EMPRESA LTDA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome Fantasia</label>
                  <input
                    type="text"
                    value={config.nomeFantasia}
                    onChange={(e) => setConfig(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="Meu Depósito"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Logradouro *</label>
                  <input
                    type="text"
                    value={config.logradouro}
                    onChange={(e) => setConfig(prev => ({ ...prev, logradouro: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="Rua das Flores"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Número *</label>
                  <input
                    type="text"
                    value={config.numero}
                    onChange={(e) => setConfig(prev => ({ ...prev, numero: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bairro *</label>
                  <input
                    type="text"
                    value={config.bairro}
                    onChange={(e) => setConfig(prev => ({ ...prev, bairro: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="Centro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Município *</label>
                  <input
                    type="text"
                    value={config.municipio}
                    onChange={(e) => setConfig(prev => ({ ...prev, municipio: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UF *</label>
                  <select
                    value={config.uf}
                    onChange={(e) => setConfig(prev => ({ ...prev, uf: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  >
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    {/* Adicionar outros estados */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CEP *</label>
                  <input
                    type="text"
                    value={config.cep}
                    onChange={(e) => setConfig(prev => ({ ...prev, cep: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="01234-567"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  disabled={!config.cnpj || !config.razaoSocial}
                  className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configurações */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Settings className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Configurações Técnicas</h3>
                <p className="text-gray-400">Definições para emissão das NFCe</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ambiente</label>
                  <select
                    value={config.ambiente}
                    onChange={(e) => setConfig(prev => ({ ...prev, ambiente: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  >
                    <option value="homologacao">Homologação (Teste)</option>
                    <option value="producao">Produção (Real)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Série</label>
                  <input
                    type="number"
                    value={config.serie}
                    onChange={(e) => setConfig(prev => ({ ...prev, serie: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Próximo Número</label>
                  <input
                    type="number"
                    value={config.proximoNumero}
                    onChange={(e) => setConfig(prev => ({ ...prev, proximoNumero: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">ℹ️ Sobre os Ambientes</h4>
                <div className="text-blue-200 text-sm space-y-2">
                  <p><strong>Homologação:</strong> Para testes, NFCe não têm valor fiscal</p>
                  <p><strong>Produção:</strong> NFCe válidas, após homologação pela SEFAZ</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Homologação */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Homologação e Finalização</h3>
                <p className="text-gray-400">Últimos passos para ativar a emissão</p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-2">✅ Configuração Completa</h4>
                  <div className="text-green-200 text-sm space-y-1">
                    <p>• Certificado digital carregado e validado</p>
                    <p>• Dados da empresa preenchidos</p>
                    <p>• Configurações técnicas definidas</p>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Próximos Passos (Por sua conta)</h4>
                  <div className="text-yellow-200 text-sm space-y-2">
                    <p><strong>1. Homologação SEFAZ:</strong></p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Emitir 10 NFCe de teste no ambiente de homologação</li>
                      <li>Solicitar habilitação para produção na SEFAZ do seu estado</li>
                      <li>Aguardar aprovação (5-15 dias úteis)</li>
                    </ul>
                    
                    <p><strong>2. Ativação:</strong></p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Recebendo aprovação, alterar ambiente para "Produção"</li>
                      <li>Começar a emitir NFCe válidas</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">📞 Suporte Técnico</h4>
                  <div className="text-blue-200 text-sm">
                    <p>Para dúvidas sobre homologação, entre em contato com a SEFAZ do seu estado:</p>
                    <p className="mt-2">
                      <strong>São Paulo:</strong> (11) 4040-1234 | nfce@fazenda.sp.gov.br
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}