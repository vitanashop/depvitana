import React, { useState } from 'react';
import { X, Cloud, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2, ExternalLink, Key, Database, FolderSync as Sync, Info } from 'lucide-react';
import { useCloudSync } from '../hooks/useCloudSync';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CloudSyncModal({ isOpen, onClose }: CloudSyncModalProps) {
  const { 
    isConfigured, 
    isOnline, 
    lastSync, 
    syncStatus, 
    setupJSONBin, 
    setupRestDB, 
    manualSync 
  } = useCloudSync();

  const [selectedProvider, setSelectedProvider] = useState<'jsonbin' | 'restdb' | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [isSetupLoading, setIsSetupLoading] = useState(false);

  const handleSetup = async () => {
    if (!selectedProvider || !apiKey.trim()) return;

    setIsSetupLoading(true);
    
    let success = false;
    if (selectedProvider === 'jsonbin') {
      success = await setupJSONBin(apiKey);
    } else if (selectedProvider === 'restdb' && databaseId.trim()) {
      success = await setupRestDB(apiKey, databaseId);
    }

    if (success) {
      alert('✅ Sincronização configurada com sucesso!\n\nAgora seus dados serão sincronizados automaticamente entre dispositivos.');
      onClose();
    } else {
      alert('❌ Erro na configuração. Verifique suas credenciais e tente novamente.');
    }
    
    setIsSetupLoading(false);
  };

  const handleManualSync = async () => {
    const success = await manualSync();
    if (success) {
      alert('✅ Sincronização concluída com sucesso!');
    } else {
      alert('❌ Erro na sincronização. Verifique sua conexão.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="h-6 w-6 text-yellow-400 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-white">Sincronização na Nuvem</h2>
                <p className="text-gray-400 text-sm">Mantenha seus dados sincronizados entre dispositivos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Status */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Status da Sincronização</h3>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className={`font-medium ${isConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isConfigured ? 'Configurado' : 'Não Configurado'}
                </div>
                <div className="text-gray-400">Configuração</div>
              </div>
              
              <div className="text-center">
                <div className={`font-medium ${
                  syncStatus === 'success' ? 'text-green-400' :
                  syncStatus === 'syncing' ? 'text-blue-400' :
                  syncStatus === 'error' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {syncStatus === 'success' ? 'Sucesso' :
                   syncStatus === 'syncing' ? 'Sincronizando' :
                   syncStatus === 'error' ? 'Erro' : 'Inativo'}
                </div>
                <div className="text-gray-400">Status</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-white">
                  {lastSync ? lastSync.toLocaleTimeString('pt-BR') : 'Nunca'}
                </div>
                <div className="text-gray-400">Última Sync</div>
              </div>
            </div>

            {isConfigured && (
              <div className="mt-4">
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncStatus === 'syncing'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <Sync className="h-4 w-4 mr-2" />
                      Sincronizar Agora
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {!isConfigured && (
            <>
              {/* Aviso */}
              <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-2">Por que configurar a sincronização?</h4>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Acesse seus dados de qualquer dispositivo</li>
                      <li>• Backup automático na nuvem</li>
                      <li>• Sincronização em tempo real</li>
                      <li>• Nunca perca seus dados</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Seleção de Provedor */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Escolha um Provedor</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* JSONBin.io */}
                  <button
                    onClick={() => setSelectedProvider('jsonbin')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedProvider === 'jsonbin'
                        ? 'border-yellow-500 bg-yellow-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Database className="h-5 w-5 text-yellow-400 mr-2" />
                      <span className="font-semibold text-white">JSONBin.io</span>
                      <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded">GRÁTIS</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Serviço gratuito e confiável para armazenar dados JSON na nuvem
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      • 100.000 requests/mês grátis
                      • Sem necessidade de cartão
                    </div>
                  </button>

                  {/* RestDB.io */}
                  <button
                    onClick={() => setSelectedProvider('restdb')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedProvider === 'restdb'
                        ? 'border-yellow-500 bg-yellow-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Cloud className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="font-semibold text-white">RestDB.io</span>
                      <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded">GRÁTIS</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Banco de dados NoSQL com API REST completa
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      • 10.000 requests/mês grátis
                      • Interface web incluída
                    </div>
                  </button>
                </div>
              </div>

              {/* Configuração */}
              {selectedProvider && (
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
                  <h4 className="font-semibold text-white mb-4">
                    Configurar {selectedProvider === 'jsonbin' ? 'JSONBin.io' : 'RestDB.io'}
                  </h4>

                  {selectedProvider === 'jsonbin' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded text-sm">
                        <p className="text-blue-200 mb-2"><strong>Como obter a API Key:</strong></p>
                        <ol className="text-blue-200 space-y-1 list-decimal list-inside">
                          <li>Acesse <a href="https://jsonbin.io" target="_blank" className="text-blue-400 hover:underline">jsonbin.io</a></li>
                          <li>Crie uma conta gratuita</li>
                          <li>Vá em "API Keys" no painel</li>
                          <li>Copie sua Master Key</li>
                        </ol>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Key *
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                          placeholder="$2a$10$..."
                        />
                      </div>
                    </div>
                  )}

                  {selectedProvider === 'restdb' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded text-sm">
                        <p className="text-blue-200 mb-2"><strong>Como configurar:</strong></p>
                        <ol className="text-blue-200 space-y-1 list-decimal list-inside">
                          <li>Acesse <a href="https://restdb.io" target="_blank" className="text-blue-400 hover:underline">restdb.io</a></li>
                          <li>Crie uma conta e database gratuito</li>
                          <li>Copie o Database ID da URL</li>
                          <li>Gere uma API Key nas configurações</li>
                        </ol>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Database ID *
                        </label>
                        <input
                          type="text"
                          value={databaseId}
                          onChange={(e) => setDatabaseId(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                          placeholder="vitana-1234"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Key *
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                          placeholder="1234567890abcdef..."
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSetup}
                    disabled={isSetupLoading || !apiKey.trim() || (selectedProvider === 'restdb' && !databaseId.trim())}
                    className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSetupLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Configurar Sincronização
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Informações de Segurança */}
          <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
            <h4 className="font-semibold text-green-300 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Segurança dos Dados
            </h4>
            <ul className="text-green-200 text-sm space-y-1">
              <li>• Seus dados são criptografados durante a transmissão</li>
              <li>• API Keys são armazenadas localmente no seu navegador</li>
              <li>• Você mantém controle total dos seus dados</li>
              <li>• Sincronização funciona apenas com sua autorização</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}