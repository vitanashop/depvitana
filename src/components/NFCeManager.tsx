import React, { useState } from 'react';
import { FileText, Plus, Eye, Printer as Print, Settings, Search, CheckCircle, XCircle, Clock, Ban, Download, AlertTriangle, Shield, ExternalLink, Zap } from 'lucide-react';
import { useNFCe } from '../hooks/useNFCe';
import { useSales } from '../hooks/useSales';
import { useNotifications } from '../contexts/NotificationContext';
import { NFCeService } from '../services/nfceService';
import { NFCeConfigModal } from './NFCeConfig';
import { NFCeCertificateGuide } from './NFCeCertificateGuide';
import { NFCeUserConfig } from './NFCeUserConfig';
import { NFCeRealIntegration } from './NFCeRealIntegration';
import { NFCe } from '../types/nfce';

export function NFCeManager() {
  const { nfces, config, addNFCe, updateNFCe, getNFCeByVendaId, isConfigured } = useNFCe();
  const { sales } = useSales();
  const { showNotification } = useNotifications();
  
  const [showConfig, setShowConfig] = useState(false);
  const [showCertificateGuide, setShowCertificateGuide] = useState(false);
  const [showUserConfig, setShowUserConfig] = useState(false);
  const [showRealIntegration, setShowRealIntegration] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFCe, setSelectedNFCe] = useState<NFCe | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelJustificativa, setCancelJustificativa] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const filteredNFCes = nfces.filter(nfce =>
    nfce.numero.toString().includes(searchTerm) ||
    nfce.chaveAcesso?.includes(searchTerm) ||
    nfce.emitente.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vendasSemNFCe = sales.filter(venda => !getNFCeByVendaId(venda.id));

  const handleGerarNFCe = async (vendaId: string) => {
    if (!isConfigured()) {
      showNotification({
        type: 'warning',
        title: '⚠️ Configuração Necessária',
        message: 'Configure a NFCe antes de gerar notas fiscais',
        duration: 5000
      });
      setShowConfig(true);
      return;
    }

    const venda = sales.find(s => s.id === vendaId);
    if (!venda) return;

    setIsProcessing(true);

    try {
      // Gerar NFCe
      const nfce = await NFCeService.gerarNFCe(venda);
      addNFCe(nfce);

      showNotification({
        type: 'success',
        title: '📄 NFCe Gerada!',
        message: `NFCe nº ${nfce.numero} criada com sucesso`,
        duration: 4000
      });

      // Transmitir automaticamente
      await handleTransmitirNFCe(nfce.id);

    } catch (error) {
      showNotification({
        type: 'error',
        title: '❌ Erro ao Gerar NFCe',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: 6000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransmitirNFCe = async (nfceId: string) => {
    const nfce = nfces.find(n => n.id === nfceId);
    if (!nfce) return;

    if (nfce.status !== 'pendente') {
      showNotification({
        type: 'warning',
        title: '⚠️ NFCe Já Transmitida',
        message: 'Esta NFCe já foi transmitida para a SEFAZ',
        duration: 4000
      });
      return;
    }

    setIsProcessing(true);

    try {
      const nfceAtualizada = await NFCeService.transmitirNFCe(nfce);
      updateNFCe(nfceId, nfceAtualizada);

      if (nfceAtualizada.status === 'autorizada') {
        showNotification({
          type: 'success',
          title: '✅ NFCe Autorizada!',
          message: `NFCe nº ${nfceAtualizada.numero} autorizada pela SEFAZ`,
          duration: 5000
        });
      } else {
        showNotification({
          type: 'error',
          title: '❌ NFCe Rejeitada',
          message: nfceAtualizada.motivoRejeicao || 'Erro na transmissão',
          duration: 6000
        });
      }

    } catch (error) {
      showNotification({
        type: 'error',
        title: '❌ Erro na Transmissão',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: 6000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelarNFCe = async () => {
    if (!selectedNFCe || !cancelJustificativa.trim()) return;

    if (cancelJustificativa.length < 15) {
      showNotification({
        type: 'warning',
        title: '⚠️ Justificativa Insuficiente',
        message: 'A justificativa deve ter pelo menos 15 caracteres',
        duration: 4000
      });
      return;
    }

    setIsProcessing(true);

    try {
      const nfceAtualizada = await NFCeService.cancelarNFCe(selectedNFCe, cancelJustificativa);
      updateNFCe(selectedNFCe.id, nfceAtualizada);

      showNotification({
        type: 'success',
        title: '🚫 NFCe Cancelada',
        message: `NFCe nº ${nfceAtualizada.numero} cancelada com sucesso`,
        duration: 5000
      });

      setShowCancelModal(false);
      setCancelJustificativa('');
      setSelectedNFCe(null);

    } catch (error) {
      showNotification({
        type: 'error',
        title: '❌ Erro no Cancelamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: 6000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprimirDANFCe = (nfce: NFCe) => {
    if (nfce.status !== 'autorizada') {
      showNotification({
        type: 'warning',
        title: '⚠️ NFCe Não Autorizada',
        message: 'Apenas NFCe autorizadas podem ser impressas',
        duration: 4000
      });
      return;
    }

    const danfce = NFCeService.gerarDANFCe(nfce);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(danfce);
      newWindow.document.close();
      newWindow.print();
    }
  };

  const getStatusIcon = (status: NFCe['status']) => {
    switch (status) {
      case 'autorizada':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'rejeitada':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'cancelada':
        return <Ban className="h-5 w-5 text-yellow-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: NFCe['status']) => {
    switch (status) {
      case 'autorizada':
        return 'Autorizada';
      case 'rejeitada':
        return 'Rejeitada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestão de NFCe</h1>
            <p className="text-gray-400">Nota Fiscal de Consumidor Eletrônica</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </button>
            
            <button
              onClick={() => setShowUserConfig(true)}
              className="flex items-center px-4 py-2 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Zap className="h-4 w-4 mr-2" />
              NFCe Real
            </button>
            
            <button
              onClick={() => setShowRealIntegration(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Implementar
            </button>
            
            {!isConfigured() && (
              <div className="flex items-center text-red-400">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">Sistema em desenvolvimento - Não válido para produção</span>
              </div>
            )}
          </div>
        </div>

        {/* Vendas sem NFCe */}
        {vendasSemNFCe.length > 0 && isConfigured() && (
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-yellow-400" />
              Vendas Pendentes de NFCe ({vendasSemNFCe.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendasSemNFCe.slice(0, 6).map((venda) => (
                <div key={venda.id} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium">Venda #{venda.id.slice(-6)}</p>
                      <p className="text-gray-400 text-sm">
                        {venda.date.toLocaleDateString('pt-BR')} às {venda.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-yellow-400 font-bold">{formatCurrency(venda.total)}</p>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    {venda.items.length} {venda.items.length === 1 ? 'item' : 'itens'} • {venda.paymentMethod}
                  </div>
                  
                  <button
                    onClick={() => handleGerarNFCe(venda.id)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Gerar NFCe
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de NFCe */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">NFCe Emitidas ({nfces.length})</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por número, chave ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Número</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Data/Hora</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-300">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-300">Valor</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredNFCes.map((nfce) => (
                  <tr key={nfce.id} className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">NFCe {nfce.numero.toString().padStart(9, '0')}</p>
                        <p className="text-gray-400 text-xs">Série {nfce.serie}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white text-sm">{nfce.dataEmissao.toLocaleDateString('pt-BR')}</p>
                        <p className="text-gray-400 text-xs">{nfce.dataEmissao.toLocaleTimeString('pt-BR')}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getStatusIcon(nfce.status)}
                        <span className={`ml-2 text-sm ${
                          nfce.status === 'autorizada' ? 'text-green-400' :
                          nfce.status === 'rejeitada' ? 'text-red-400' :
                          nfce.status === 'cancelada' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {getStatusText(nfce.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="text-white font-medium">{formatCurrency(nfce.valorTotalNota)}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedNFCe(nfce);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {nfce.status === 'autorizada' && (
                          <button
                            onClick={() => handleImprimirDANFCe(nfce)}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Imprimir DANF-Ce"
                          >
                            <Print className="h-4 w-4" />
                          </button>
                        )}
                        
                        {nfce.status === 'pendente' && (
                          <button
                            onClick={() => handleTransmitirNFCe(nfce.id)}
                            disabled={isProcessing}
                            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                            title="Transmitir para SEFAZ"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {nfce.status === 'autorizada' && (
                          <button
                            onClick={() => {
                              setSelectedNFCe(nfce);
                              setShowCancelModal(true);
                            }}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Cancelar NFCe"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}

                        {nfce.xmlAutorizado && (
                          <button
                            onClick={() => {
                              const blob = new Blob([nfce.xmlAutorizado!], { type: 'application/xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `NFCe_${nfce.numero}_${nfce.chaveAcesso}.xml`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                            title="Download XML"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredNFCes.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma NFCe encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configuração */}
      <NFCeConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
      
      {/* Modal do Guia de Certificados */}
      <NFCeCertificateGuide 
        isOpen={showCertificateGuide}
        onClose={() => setShowCertificateGuide(false)}
      />
      
      {/* Modal de Configuração do Usuário */}
      <NFCeUserConfig 
        isOpen={showUserConfig}
        onClose={() => setShowUserConfig(false)}
      />
      
      {/* Modal de Integração Real */}
      <NFCeRealIntegration 
        isOpen={showRealIntegration}
        onClose={() => setShowRealIntegration(false)}
      />

      {/* Modal de Cancelamento */}
      {showCancelModal && selectedNFCe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-md w-full p-6 border border-red-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Ban className="h-5 w-5 text-red-400 mr-2" />
              Cancelar NFCe
            </h3>
            
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <p className="text-red-100 font-medium">NFCe {selectedNFCe.numero}</p>
              <p className="text-red-200 text-sm">{formatCurrency(selectedNFCe.valorTotalNota)}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Justificativa de Cancelamento *
              </label>
              <textarea
                value={cancelJustificativa}
                onChange={(e) => setCancelJustificativa(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white resize-none"
                placeholder="Digite o motivo do cancelamento (mínimo 15 caracteres)..."
                rows={3}
                minLength={15}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {cancelJustificativa.length}/15 caracteres mínimos
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelJustificativa('');
                  setSelectedNFCe(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCancelarNFCe}
                disabled={isProcessing || cancelJustificativa.length < 15}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}