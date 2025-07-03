import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Download, 
  ExternalLink,
  Info,
  Clock,
  DollarSign,
  Settings,
  Key,
  Lock,
  Globe,
  Building2,
  Phone,
  Mail
} from 'lucide-react';

interface NFCeCertificateGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NFCeCertificateGuide({ isOpen, onClose }: NFCeCertificateGuideProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'step-by-step' | 'technical' | 'testing'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/30 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-yellow-400 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-white">Guia de Certificados Digitais para NFCe</h2>
                <p className="text-gray-400 text-sm">Passo a passo completo para produção</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Info },
              { id: 'step-by-step', label: 'Passo a Passo', icon: CheckCircle },
              { id: 'technical', label: 'Implementação', icon: Settings },
              { id: 'testing', label: 'Homologação', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-yellow-500 text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Visão Geral */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-300 mb-2">⚠️ ATENÇÃO - OBRIGATÓRIO PARA PRODUÇÃO</h3>
                    <p className="text-red-200 text-sm">
                      Para emitir NFCe válidas no Brasil, você DEVE ter um certificado digital válido e estar integrado aos WebServices da SEFAZ.
                      O sistema atual é apenas para demonstração e desenvolvimento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-3 flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Certificado Digital A1
                  </h3>
                  <ul className="text-blue-200 text-sm space-y-2">
                    <li>• <strong>Arquivo .pfx/.p12</strong> com senha</li>
                    <li>• <strong>Validade:</strong> 1 ano</li>
                    <li>• <strong>Preço:</strong> R$ 180 - R$ 300</li>
                    <li>• <strong>Uso:</strong> Instalado no servidor</li>
                    <li>• <strong>Ideal para:</strong> Aplicações web</li>
                  </ul>
                </div>

                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-green-300 mb-3 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Certificado Digital A3
                  </h3>
                  <ul className="text-green-200 text-sm space-y-2">
                    <li>• <strong>Token/Smartcard</strong> físico</li>
                    <li>• <strong>Validade:</strong> 1-3 anos</li>
                    <li>• <strong>Preço:</strong> R$ 200 - R$ 500</li>
                    <li>• <strong>Uso:</strong> Hardware dedicado</li>
                    <li>• <strong>Ideal para:</strong> Máxima segurança</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-300 mb-3 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Autoridades Certificadoras Recomendadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-yellow-200">
                    <strong>Serasa Experian</strong>
                    <br />• Líder de mercado
                    <br />• Suporte 24/7
                    <br />• Emissão rápida
                  </div>
                  <div className="text-yellow-200">
                    <strong>Valid Certificadora</strong>
                    <br />• Preços competitivos
                    <br />• Boa qualidade
                    <br />• Suporte técnico
                  </div>
                  <div className="text-yellow-200">
                    <strong>AC Safeweb</strong>
                    <br />• Especializada em NFe
                    <br />• Integração facilitada
                    <br />• Suporte especializado
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Passo a Passo */}
          {activeTab === 'step-by-step' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">📋 Roteiro Completo para Produção</h3>

              {/* Etapa 1 */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/30">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-3">🏢 Documentação e Preparação</h4>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-blue-900/30 p-3 rounded border border-blue-500/30">
                        <strong className="text-blue-300">Documentos Necessários:</strong>
                        <ul className="mt-2 space-y-1 text-blue-200">
                          <li>• CNPJ ativo na Receita Federal</li>
                          <li>• Inscrição Estadual ativa na SEFAZ</li>
                          <li>• Contrato social ou certificado MEI</li>
                          <li>• CPF e RG do responsável</li>
                          <li>• Comprovante de endereço da empresa</li>
                        </ul>
                      </div>
                      <div className="text-yellow-300">
                        <strong>⏱️ Tempo estimado:</strong> 1-2 dias para reunir documentos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etapa 2 */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/30">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-3">🛒 Comprar Certificado Digital</h4>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-900/30 p-3 rounded border border-green-500/30">
                          <strong className="text-green-300">Para Certificado A1:</strong>
                          <ol className="mt-2 space-y-1 text-green-200 list-decimal list-inside">
                            <li>Acesse site da AC escolhida</li>
                            <li>Escolha "A1 para NFe/NFCe"</li>
                            <li>Preencha dados da empresa</li>
                            <li>Faça pagamento (R$ 180-300)</li>
                            <li>Agende videoconferência</li>
                          </ol>
                        </div>
                        <div className="bg-purple-900/30 p-3 rounded border border-purple-500/30">
                          <strong className="text-purple-300">Para Certificado A3:</strong>
                          <ol className="mt-2 space-y-1 text-purple-200 list-decimal list-inside">
                            <li>Escolha "A3 para NFe/NFCe"</li>
                            <li>Selecione token/smartcard</li>
                            <li>Preencha dados da empresa</li>
                            <li>Faça pagamento (R$ 200-500)</li>
                            <li>Agende presencial ou AR</li>
                          </ol>
                        </div>
                      </div>
                      <div className="text-yellow-300">
                        <strong>⏱️ Tempo estimado:</strong> 2-5 dias úteis para emissão
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etapa 3 */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/30">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-3">🔧 Configurar no Sistema</h4>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-yellow-900/30 p-3 rounded border border-yellow-500/30">
                        <strong className="text-yellow-300">Configuração A1 (.pfx):</strong>
                        <ol className="mt-2 space-y-1 text-yellow-200 list-decimal list-inside">
                          <li>Faça upload do arquivo .pfx</li>
                          <li>Insira a senha do certificado</li>
                          <li>Teste a validação</li>
                          <li>Configure ambiente (homologação/produção)</li>
                        </ol>
                      </div>
                      <div className="bg-red-900/30 p-3 rounded border border-red-500/30">
                        <strong className="text-red-300">⚠️ Segurança:</strong>
                        <ul className="mt-2 space-y-1 text-red-200">
                          <li>• NUNCA compartilhe o arquivo .pfx</li>
                          <li>• Faça backup seguro do certificado</li>
                          <li>• Use senhas fortes</li>
                          <li>• Monitore a validade</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etapa 4 */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/30">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-3">🧪 Homologação na SEFAZ</h4>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-purple-900/30 p-3 rounded border border-purple-500/30">
                        <strong className="text-purple-300">Testes Obrigatórios:</strong>
                        <ol className="mt-2 space-y-1 text-purple-200 list-decimal list-inside">
                          <li>Emitir 10 NFCe de teste</li>
                          <li>Testar cancelamento</li>
                          <li>Validar impressão DANF-Ce</li>
                          <li>Testar contingência</li>
                          <li>Solicitar habilitação produção</li>
                        </ol>
                      </div>
                      <div className="text-yellow-300">
                        <strong>⏱️ Tempo estimado:</strong> 3-7 dias úteis para aprovação
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etapa 5 */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/30">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">5</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-3">🚀 Produção</h4>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-green-900/30 p-3 rounded border border-green-500/30">
                        <strong className="text-green-300">Go Live!</strong>
                        <ul className="mt-2 space-y-1 text-green-200">
                          <li>• Alternar para ambiente produção</li>
                          <li>• Configurar numeração oficial</li>
                          <li>• Treinar equipe</li>
                          <li>• Monitorar primeiras emissões</li>
                          <li>• Fazer backup das configurações</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Implementação Técnica */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">⚙️ Implementação Técnica</h3>

              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-300 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Modificações Necessárias no Código
                </h4>
                <div className="text-red-200 text-sm space-y-2">
                  <p>O código atual é simulado. Para produção, você deve:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Implementar assinatura digital XML com certificado</li>
                    <li>Integrar WebServices reais da SEFAZ</li>
                    <li>Adicionar validação de schemas XSD</li>
                    <li>Implementar retry e tratamento de erros</li>
                    <li>Adicionar logs detalhados para auditoria</li>
                  </ul>
                </div>
              </div>

              {/* Exemplo de integração */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Exemplo de Integração (Node.js)
                </h4>
                <div className="bg-black rounded p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <pre>{`// Exemplo usando node-forge para assinatura
import forge from 'node-forge';
import axios from 'axios';

class NFCeService {
  private certificate: forge.pki.Certificate;
  private privateKey: forge.pki.PrivateKey;
  
  constructor(pfxBuffer: Buffer, password: string) {
    const p12 = forge.pkcs12.pkcs12FromAsn1(
      forge.asn1.fromDer(pfxBuffer.toString('binary'))
    );
    
    const bags = forge.pkcs12.getBags(p12, password);
    this.certificate = bags.certBags[0].cert;
    this.privateKey = bags.keyBags[0].key;
  }
  
  async signXML(xml: string): Promise<string> {
    // Implementar assinatura digital XML
    // Usar XMLDSig com SHA-256
    // Inserir assinatura no local correto
    return signedXML;
  }
  
  async transmitirNFCe(xml: string): Promise<any> {
    const soapEnvelope = this.buildSOAPEnvelope(xml);
    
    const response = await axios.post(
      'https://nfce.fazenda.sp.gov.br/ws/nfceautorizacao4.asmx',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'nfceAutorizacao'
        }
      }
    );
    
    return this.parseResponse(response.data);
  }
}`}</pre>
                </div>
              </div>

              {/* WebServices por Estado */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  WebServices por Estado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="text-blue-200">
                      <strong>São Paulo (SP)</strong>
                      <br />Produção: nfce.fazenda.sp.gov.br
                      <br />Homologação: homologacao.nfce.fazenda.sp.gov.br
                    </div>
                    <div className="text-blue-200">
                      <strong>Rio de Janeiro (RJ)</strong>
                      <br />Produção: nfce.sefaz.rj.gov.br
                      <br />Homologação: nfce-homologacao.sefaz.rj.gov.br
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-blue-200">
                      <strong>Minas Gerais (MG)</strong>
                      <br />Produção: nfce.fazenda.mg.gov.br
                      <br />Homologação: hnfce.fazenda.mg.gov.br
                    </div>
                    <div className="text-blue-200">
                      <strong>Demais Estados</strong>
                      <br />Consulte portal da SEFAZ local
                      <br />Layout padrão nacional disponível
                    </div>
                  </div>
                </div>
              </div>

              {/* Bibliotecas Recomendadas */}
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-300 mb-3">📚 Bibliotecas Recomendadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="text-green-200">
                    <strong>Node.js</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>node-forge (certificados)</li>
                      <li>xml2js (manipulação XML)</li>
                      <li>xmldsigjs (assinatura digital)</li>
                      <li>soap (WebServices)</li>
                    </ul>
                  </div>
                  <div className="text-green-200">
                    <strong>Python</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>pynfe (biblioteca NFe/NFCe)</li>
                      <li>cryptography (certificados)</li>
                      <li>lxml (XML)</li>
                      <li>requests (HTTP)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Homologação */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">🧪 Processo de Homologação</h3>

              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-300 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  O que é Homologação?
                </h4>
                <p className="text-yellow-200 text-sm">
                  A homologação é um processo obrigatório onde a SEFAZ testa se seu sistema está emitindo NFCe corretamente.
                  Você deve emitir notas de teste e aguardar aprovação antes de usar em produção.
                </p>
              </div>

              {/* Checklist de Homologação */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4">✅ Checklist de Homologação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-300 mb-3">Testes Obrigatórios</h5>
                    <div className="space-y-2 text-sm">
                      {[
                        'Emitir 10 NFCe sequenciais',
                        'Testar diferentes formas de pagamento',
                        'Validar cálculos de impostos',
                        'Testar cancelamento de NFCe',
                        'Verificar impressão DANF-Ce',
                        'Testar consulta de status',
                        'Validar contingência offline'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-blue-300 mb-3">Validações Técnicas</h5>
                    <div className="space-y-2 text-sm">
                      {[
                        'Schema XSD correto',
                        'Assinatura digital válida',
                        'Chave de acesso correta',
                        'CNPJ e IE válidos',
                        'Endereço completo',
                        'Códigos de produtos (NCM)',
                        'Tributos calculados corretamente'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center text-gray-300">
                          <CheckCircle className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados de Teste */}
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-purple-300 mb-3">🧪 Dados para Teste</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/30 p-3 rounded">
                    <strong className="text-purple-200">CNPJ de Teste (SP):</strong>
                    <br /><span className="font-mono text-purple-100">99.999.999/0001-99</span>
                    <br /><strong className="text-purple-200">IE de Teste:</strong>
                    <br /><span className="font-mono text-purple-100">123.456.789.123</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded">
                    <strong className="text-purple-200">CPF de Teste:</strong>
                    <br /><span className="font-mono text-purple-100">111.444.777-XX</span>
                    <br /><strong className="text-purple-200">Email:</strong>
                    <br /><span className="font-mono text-purple-100">teste@teste.com</span>
                  </div>
                </div>
                <p className="text-purple-200 text-xs mt-3">
                  ⚠️ Use apenas em ambiente de homologação. Cada estado tem dados específicos.
                </p>
              </div>

              {/* Contatos SEFAZ */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contatos de Suporte SEFAZ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-gray-300">
                    <strong className="text-white">São Paulo</strong>
                    <br />📞 (11) 4040-1234
                    <br />📧 nfce@fazenda.sp.gov.br
                    <br />🕒 Seg-Sex: 8h-17h
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-white">Rio de Janeiro</strong>
                    <br />📞 (21) 2334-4000
                    <br />📧 suporte.nfce@sefaz.rj.gov.br
                    <br />🕒 Seg-Sex: 9h-18h
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-white">Suporte Geral</strong>
                    <br />📞 Portal de cada estado
                    <br />📧 Consulte site oficial
                    <br />🌐 Fóruns especializados
                  </div>
                </div>
              </div>

              {/* Prazos */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Prazos Típicos
                </h4>
                <div className="text-blue-200 text-sm space-y-2">
                  <div>📅 <strong>Solicitação inicial:</strong> 1-2 dias úteis</div>
                  <div>📅 <strong>Testes de homologação:</strong> 3-5 dias úteis</div>
                  <div>📅 <strong>Análise da SEFAZ:</strong> 5-10 dias úteis</div>
                  <div>📅 <strong>Liberação produção:</strong> 1-3 dias úteis</div>
                  <div className="border-t border-blue-500/30 pt-2 mt-3">
                    <strong>🎯 Total estimado: 10-20 dias úteis</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Links Úteis */}
        <div className="border-t border-gray-700 p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            Links Úteis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-yellow-300">Documentação Oficial</strong>
              <ul className="mt-2 space-y-1 text-gray-300">
                <li>• <a href="http://www.nfe.fazenda.gov.br" target="_blank" className="hover:text-yellow-400">Portal Nacional NFe</a></li>
                <li>• <a href="https://www.confaz.fazenda.gov.br" target="_blank" className="hover:text-yellow-400">CONFAZ</a></li>
                <li>• <a href="https://www.nfce.fazenda.sp.gov.br" target="_blank" className="hover:text-yellow-400">NFCe São Paulo</a></li>
              </ul>
            </div>
            <div>
              <strong className="text-yellow-300">Certificadoras</strong>
              <ul className="mt-2 space-y-1 text-gray-300">
                <li>• <a href="https://serasa.certificadodigital.com.br" target="_blank" className="hover:text-yellow-400">Serasa Experian</a></li>
                <li>• <a href="https://www.valid.com" target="_blank" className="hover:text-yellow-400">Valid</a></li>
                <li>• <a href="https://www.safeweb.com.br" target="_blank" className="hover:text-yellow-400">Safeweb</a></li>
              </ul>
            </div>
            <div>
              <strong className="text-yellow-300">Ferramentas</strong>
              <ul className="mt-2 space-y-1 text-gray-300">
                <li>• <a href="https://www.receita.fazenda.gov.br" target="_blank" className="hover:text-yellow-400">Receita Federal</a></li>
                <li>• <a href="https://dfe-portal.svrs.rs.gov.br" target="_blank" className="hover:text-yellow-400">Portal DFe</a></li>
                <li>• <a href="https://github.com/nfe" target="_blank" className="hover:text-yellow-400">Bibliotecas Open Source</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}