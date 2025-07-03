import React, { useState } from 'react';
import { X, Save, FileText, Settings, Building2, MapPin, Phone, Mail, HelpCircle, Shield, ExternalLink } from 'lucide-react';
import { NFCeConfig } from '../types/nfce';
import { useNFCe } from '../hooks/useNFCe';
import { NFCeCertificateGuide } from './NFCeCertificateGuide';

interface NFCeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NFCeConfigModal({ isOpen, onClose }: NFCeConfigModalProps) {
  const { config, saveConfig } = useNFCe();
  const [showCertificateGuide, setShowCertificateGuide] = useState(false);
  const [formData, setFormData] = useState<NFCeConfig>(
    config || {
      emitente: {
        cnpj: '',
        inscricaoEstadual: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: {
          logradouro: '',
          numero: '',
          bairro: '',
          municipio: '',
          uf: 'SP',
          cep: ''
        },
        telefone: '',
        email: ''
      },
      serie: 1,
      proximoNumero: 1,
      ambiente: 'homologacao',
      contingencia: false
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.emitente.cnpj || !formData.emitente.razaoSocial) {
      alert('CNPJ e Razão Social são obrigatórios');
      return;
    }
    
    saveConfig(formData);
    alert('Configuração salva com sucesso!');
    onClose();
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4], match[5]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{3})\.(\d{3})\./, '.$1.$2/')
        .replace(/\.(\d{4})\./, '.$1-');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/30 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-yellow-400 mr-2" />
              <h2 className="text-xl font-bold text-white">Configuração NFCe</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCertificateGuide(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                title="Guia de Certificados Digitais"
              >
                <Shield className="h-4 w-4 mr-2" />
                Certificados
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Aviso sobre Certificados */}
        <div className="p-6 border-b border-gray-700">
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-300 mb-2">⚠️ ATENÇÃO - Sistema em Desenvolvimento</h3>
                <p className="text-red-200 text-sm mb-3">
                  Esta configuração é apenas para demonstração. Para emitir NFCe válidas no Brasil, você precisa:
                </p>
                <ul className="text-red-200 text-sm space-y-1 list-disc list-inside mb-3">
                  <li>Certificado Digital A1 ou A3 válido</li>
                  <li>Integração com WebServices da SEFAZ</li>
                  <li>Homologação oficial no seu estado</li>
                  <li>Assinatura digital dos XMLs</li>
                </ul>
                <button
                  onClick={() => setShowCertificateGuide(true)}
                  className="flex items-center text-red-300 hover:text-red-200 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver guia completo de implementação
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados da Empresa */}
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.emitente.cnpj}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, cnpj: formatCNPJ(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Inscrição Estadual *
                </label>
                <input
                  type="text"
                  value={formData.emitente.inscricaoEstadual}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, inscricaoEstadual: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="123.456.789.123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.emitente.razaoSocial}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, razaoSocial: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="EMPRESA LTDA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.emitente.nomeFantasia}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, nomeFantasia: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Depósito Vitana"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.emitente.telefone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, telefone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.emitente.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logradouro *
                </label>
                <input
                  type="text"
                  value={formData.emitente.endereco.logradouro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { 
                      ...prev.emitente, 
                      endereco: { ...prev.emitente.endereco, logradouro: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Rua das Flores"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  value={formData.emitente.endereco.numero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { 
                      ...prev.emitente, 
                      endereco: { ...prev.emitente.endereco, numero: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  value={formData.emitente.endereco.bairro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { 
                      ...prev.emitente, 
                      endereco: { ...prev.emitente.endereco, bairro: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Centro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Município *
                </label>
                <input
                  type="text"
                  value={formData.emitente.endereco.municipio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { 
                      ...prev.emitente, 
                      endereco: { ...prev.emitente.endereco, municipio: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="São Paulo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  value={formData.emitente.endereco.cep}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emitente: { 
                      ...prev.emitente, 
                      endereco: { ...prev.emitente.endereco, cep: formatCEP(e.target.value) }
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="01234-567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Configurações Técnicas */}
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações Técnicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Série
                </label>
                <input
                  type="number"
                  value={formData.serie}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    serie: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Próximo Número
                </label>
                <input
                  type="number"
                  value={formData.proximoNumero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    proximoNumero: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ambiente
                </label>
                <select
                  value={formData.ambiente}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ambiente: e.target.value as 'homologacao' | 'producao'
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                >
                  <option value="homologacao">Homologação</option>
                  <option value="producao">Produção</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.contingencia}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contingencia: e.target.checked
                  }))}
                  className="mr-2 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-300">Modo Contingência</span>
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </button>
          </div>
        </form>

        {/* Modal do Guia de Certificados */}
        <NFCeCertificateGuide 
          isOpen={showCertificateGuide}
          onClose={() => setShowCertificateGuide(false)}
        />
      </div>
    </div>
  );
}