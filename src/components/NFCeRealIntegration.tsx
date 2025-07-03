import React, { useState } from 'react';
import { 
  Shield, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Settings,
  FileText,
  Clock,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface NFCeRealIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NFCeRealIntegration({ isOpen, onClose }: NFCeRealIntegrationProps) {
  const [integrationMethod, setIntegrationMethod] = useState<'own' | 'service' | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Integração NFCe Real - 100% Funcional</h2>
              <p className="text-gray-400">Duas abordagens para implementar NFCe válida no Brasil</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="Fechar sem implementar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Escolha do Método */}
          {!integrationMethod && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Escolha sua Abordagem</h3>
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto">
                  <p className="text-yellow-200 text-sm">
                    💡 <strong>Não é obrigatório implementar agora!</strong> Você pode usar o sistema normalmente e implementar NFCe real quando estiver pronto.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Método 1: Integração Própria */}
                <div 
                  onClick={() => setIntegrationMethod('own')}
                  className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all cursor-pointer group"
                >
                  <div className="text-center">
                    <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xl font-bold text-white mb-3">Integração Própria</h4>
                    <p className="text-blue-200 text-sm mb-4">
                      Sistema integra diretamente com WebServices da SEFAZ
                    </p>
                    
                    <div className="space-y-3 text-left">
                      <div className="bg-blue-800/30 p-3 rounded">
                        <h5 className="font-semibold text-blue-300 mb-2">✅ Vantagens:</h5>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>• Controle total do processo</li>
                          <li>• Sem custos por NFCe emitida</li>
                          <li>• Dados ficam no seu servidor</li>
                          <li>• Customização completa</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-800/30 p-3 rounded">
                        <h5 className="font-semibold text-red-300 mb-2">⚠️ Requisitos:</h5>
                        <ul className="text-red-200 text-sm space-y-1">
                          <li>• Certificado Digital A1/A3</li>
                          <li>• Desenvolvimento especializado</li>
                          <li>• Homologação SEFAZ</li>
                          <li>• Manutenção contínua</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-800/30 p-3 rounded">
                        <h5 className="font-semibold text-yellow-300 mb-2">💰 Custos:</h5>
                        <div className="text-yellow-200 text-sm">
                          <p>• Certificado: R$ 180-300/ano</p>
                          <p>• Desenvolvimento: R$ 8.000-15.000</p>
                          <p>• Total inicial: ~R$ 8.500</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Método 2: Serviço Terceirizado */}
                <div 
                  onClick={() => setIntegrationMethod('service')}
                  className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all cursor-pointer group"
                >
                  <div className="text-center">
                    <Globe className="h-16 w-16 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xl font-bold text-white mb-3">API de Terceiros</h4>
                    <p className="text-green-200 text-sm mb-4">
                      Integração via API especializada em NFCe
                    </p>
                    
                    <div className="space-y-3 text-left">
                      <div className="bg-green-800/30 p-3 rounded">
                        <h5 className="font-semibold text-green-300 mb-2">✅ Vantagens:</h5>
                        <ul className="text-green-200 text-sm space-y-1">
                          <li>• Implementação rápida (1-2 semanas)</li>
                          <li>• Sem certificado próprio</li>
                          <li>• Homologação já feita</li>
                          <li>• Suporte especializado</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-800/30 p-3 rounded">
                        <h5 className="font-semibold text-yellow-300 mb-2">⚠️ Considerações:</h5>
                        <ul className="text-yellow-200 text-sm space-y-1">
                          <li>• Custo por NFCe emitida</li>
                          <li>• Dependência do provedor</li>
                          <li>• Dados em servidor terceiro</li>
                          <li>• Menos customização</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-800/30 p-3 rounded">
                        <h5 className="font-semibold text-blue-300 mb-2">💰 Custos:</h5>
                        <div className="text-blue-200 text-sm">
                          <p>• Setup: R$ 0-500</p>
                          <p>• Por NFCe: R$ 0,15-0,35</p>
                          <p>• 1000/mês = R$ 150-350</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Opção de não implementar agora */}
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                >
                  📋 Usar Sistema Sem NFCe Real (Por Enquanto)
                </button>
                <p className="text-gray-400 text-sm mt-2">
                  Você pode implementar NFCe real mais tarde quando precisar emitir notas fiscais válidas
                </p>
              </div>
            </div>
          )}

          {/* Integração Própria */}
          {integrationMethod === 'own' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Integração Própria - WebServices SEFAZ</h3>
                <button
                  onClick={() => setIntegrationMethod(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ← Voltar
                </button>
              </div>

              {/* Cronograma */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
                <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Cronograma de Implementação
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                    <div>
                      <h5 className="font-medium text-white">Semana 1-2: Preparação</h5>
                      <ul className="text-blue-200 text-sm mt-1 space-y-1">
                        <li>• Comprar certificado digital A1</li>
                        <li>• Estudar documentação SEFAZ</li>
                        <li>• Configurar ambiente de desenvolvimento</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                    <div>
                      <h5 className="font-medium text-white">Semana 3-6: Desenvolvimento</h5>
                      <ul className="text-blue-200 text-sm mt-1 space-y-1">
                        <li>• Implementar assinatura digital XML</li>
                        <li>• Integrar WebServices de autorização</li>
                        <li>• Desenvolver geração de DANF-Ce</li>
                        <li>• Implementar cancelamento</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                    <div>
                      <h5 className="font-medium text-white">Semana 7-8: Homologação</h5>
                      <ul className="text-blue-200 text-sm mt-1 space-y-1">
                        <li>• Emitir 10 NFCe de teste</li>
                        <li>• Solicitar habilitação SEFAZ</li>
                        <li>• Corrigir possíveis problemas</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                    <div>
                      <h5 className="font-medium text-white">Semana 9: Produção</h5>
                      <ul className="text-blue-200 text-sm mt-1 space-y-1">
                        <li>• Aprovação da SEFAZ</li>
                        <li>• Configurar ambiente produção</li>
                        <li>• Go-live!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Código de Exemplo */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">💻 Exemplo de Implementação</h4>
                <div className="bg-black rounded p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <pre>{`// src/services/nfceReal.ts
import { X509Certificate, PrivateKey } from 'node-forge';
import axios from 'axios';

export class NFCeRealService {
  private certificate: X509Certificate;
  private privateKey: PrivateKey;
  
  constructor(pfxBuffer: Buffer, password: string) {
    // Carregar certificado do usuário
    this.loadCertificate(pfxBuffer, password);
  }
  
  async emitirNFCe(dadosVenda: any): Promise<NFCeResponse> {
    // 1. Gerar XML da NFCe
    const xml = this.gerarXML(dadosVenda);
    
    // 2. Assinar digitalmente
    const xmlAssinado = this.assinarXML(xml);
    
    // 3. Enviar para SEFAZ
    const response = await this.transmitirSEFAZ(xmlAssinado);
    
    return response;
  }
  
  private async transmitirSEFAZ(xml: string): Promise<any> {
    const soapEnvelope = this.buildSOAP(xml);
    
    return await axios.post(
      'https://nfce.fazenda.sp.gov.br/ws/nfceautorizacao4.asmx',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'nfceAutorizacao'
        }
      }
    );
  }
}`}</pre>
                </div>
              </div>

              {/* Links Úteis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h5 className="font-semibold text-white mb-3">📚 Documentação</h5>
                  <div className="space-y-2 text-sm">
                    <a href="http://www.nfe.fazenda.gov.br" target="_blank" className="block text-blue-400 hover:text-blue-300">
                      <ExternalLink className="h-4 w-4 inline mr-1" />
                      Portal Nacional NFe
                    </a>
                    <a href="https://www.nfce.fazenda.sp.gov.br" target="_blank" className="block text-blue-400 hover:text-blue-300">
                      <ExternalLink className="h-4 w-4 inline mr-1" />
                      NFCe São Paulo
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h5 className="font-semibold text-white mb-3">🛠️ Ferramentas</h5>
                  <div className="space-y-2 text-sm">
                    <a href="https://github.com/nfe/xml_schemas" target="_blank" className="block text-blue-400 hover:text-blue-300">
                      <ExternalLink className="h-4 w-4 inline mr-1" />
                      Schemas XSD Oficiais
                    </a>
                    <a href="https://www.npmjs.com/package/node-forge" target="_blank" className="block text-blue-400 hover:text-blue-300">
                      <ExternalLink className="h-4 w-4 inline mr-1" />
                      Node Forge (Certificados)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API de Terceiros */}
          {integrationMethod === 'service' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Integração via API de Terceiros</h3>
                <button
                  onClick={() => setIntegrationMethod(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ← Voltar
                </button>
              </div>

              {/* Provedores Recomendados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Focus NFe',
                    price: 'R$ 0,25/NFCe',
                    setup: 'Grátis',
                    features: ['API REST', 'DANF-Ce automático', 'Cancelamento', 'Consulta'],
                    url: 'https://focusnfe.com.br',
                    recommended: true
                  },
                  {
                    name: 'WebmaniaBR',
                    price: 'R$ 0,15/NFCe',
                    setup: 'R$ 29,90/mês',
                    features: ['API JSON', 'Webhook', 'Relatórios', 'Multi-empresa'],
                    url: 'https://webmaniabr.com',
                    recommended: false
                  },
                  {
                    name: 'eNotas',
                    price: 'R$ 0,35/NFCe',
                    setup: 'Grátis',
                    features: ['API REST', 'SDK JavaScript', 'Contingência', 'Backup'],
                    url: 'https://enotas.com.br',
                    recommended: false
                  }
                ].map((provider, index) => (
                  <div key={index} className={`bg-gradient-to-br ${provider.recommended ? 'from-green-900/50 to-green-800/50 border-green-500/30' : 'from-gray-800/50 to-gray-700/50 border-gray-600/30'} border rounded-lg p-4`}>
                    <div className="text-center">
                      {provider.recommended && (
                        <div className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">
                          RECOMENDADO
                        </div>
                      )}
                      <h4 className="font-bold text-white mb-2">{provider.name}</h4>
                      <div className="text-lg font-bold text-yellow-400 mb-1">{provider.price}</div>
                      <div className="text-sm text-gray-400 mb-4">Setup: {provider.setup}</div>
                      
                      <div className="space-y-2 text-left mb-4">
                        <h5 className="font-medium text-white text-sm">Recursos:</h5>
                        <ul className="text-gray-300 text-xs space-y-1">
                          {provider.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <a
                        href={provider.url}
                        target="_blank"
                        className={`block w-full py-2 rounded text-sm font-medium transition-colors ${
                          provider.recommended
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        Conhecer Serviço
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exemplo de Integração */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">💻 Exemplo - Focus NFe</h4>
                <div className="bg-black rounded p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <pre>{`// Integração com Focus NFe
async function emitirNFCe(dadosVenda) {
  const response = await fetch('https://api.focusnfe.com.br/v2/nfce', {
    method: 'POST',
    headers: {
      'Authorization': 'Token SUA_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      natureza_operacao: "Venda",
      data_emissao: new Date().toISOString(),
      tipo_documento: "1",
      finalidade_emissao: "1",
      cnpj_emitente: "11222333000181",
      
      items: dadosVenda.items.map(item => ({
        numero_item: item.id,
        codigo_produto: item.codigo,
        descricao: item.nome,
        quantidade: item.quantidade,
        unidade: "UN",
        valor_unitario: item.preco
      })),
      
      formas_pagamento: [{
        forma_pagamento: "01", // Dinheiro
        valor_pagamento: dadosVenda.total
      }]
    })
  });
  
  return await response.json();
}`}</pre>
                </div>
              </div>

              {/* Comparação de Custos */}
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-300 mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Simulação de Custos (Por Mês)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-yellow-500/30">
                        <th className="text-left text-yellow-300 p-2">NFCe/Mês</th>
                        <th className="text-center text-yellow-300 p-2">Focus (R$ 0,25)</th>
                        <th className="text-center text-yellow-300 p-2">WebmaniaBR (R$ 0,15)</th>
                        <th className="text-center text-yellow-300 p-2">eNotas (R$ 0,35)</th>
                      </tr>
                    </thead>
                    <tbody className="text-yellow-200">
                      <tr><td className="p-2">100</td><td className="text-center p-2">R$ 25</td><td className="text-center p-2">R$ 45*</td><td className="text-center p-2">R$ 35</td></tr>
                      <tr><td className="p-2">500</td><td className="text-center p-2">R$ 125</td><td className="text-center p-2">R$ 105*</td><td className="text-center p-2">R$ 175</td></tr>
                      <tr><td className="p-2">1000</td><td className="text-center p-2">R$ 250</td><td className="text-center p-2">R$ 180*</td><td className="text-center p-2">R$ 350</td></tr>
                      <tr><td className="p-2">2000</td><td className="text-center p-2">R$ 500</td><td className="text-center p-2">R$ 330*</td><td className="text-center p-2">R$ 700</td></tr>
                    </tbody>
                  </table>
                  <p className="text-yellow-200 text-xs mt-2">* Inclui taxa mensal de R$ 29,90</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-gray-400 text-sm">
                💡 <strong>Recomendação:</strong> Para iniciantes, use API de terceiros. Para grandes volumes, considere integração própria.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                ⏰ Você pode voltar aqui a qualquer momento para implementar NFCe real
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📝 Continuar Usando Sistema
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}