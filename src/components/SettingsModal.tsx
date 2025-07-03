import React, { useState } from 'react';
import { X, Save, RotateCcw, Settings, Upload, Package, Eye, Cloud } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { CloudSyncModal } from './CloudSyncModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCloudSync, setShowCloudSync] = useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
    setPreviewImage(null);
  }, [settings, isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setLocalSettings(prev => ({
          ...prev,
          logoUrl: result,
          useCustomLogo: true
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await updateSettings(localSettings);
    alert('Configurações salvas com sucesso!');
    onClose();
  };

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      await resetSettings();
      setLocalSettings(settings);
      setPreviewImage(null);
    }
  };

  const removeCustomLogo = () => {
    setLocalSettings(prev => ({
      ...prev,
      logoUrl: '',
      useCustomLogo: false
    }));
    setPreviewImage(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-yellow-400 mr-2" />
                <h2 className="text-xl font-bold text-white">Personalização do Sistema</h2>
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
            {/* Sincronização na Nuvem */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-blue-400" />
                Sincronização na Nuvem
              </h3>
              
              <p className="text-blue-200 text-sm mb-4">
                Configure a sincronização para manter seus dados acessíveis de qualquer dispositivo.
              </p>
              
              <button
                onClick={() => setShowCloudSync(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Configurar Sincronização
              </button>
            </div>

            {/* Logo Section */}
            <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-yellow-400" />
                Logo do Negócio
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {localSettings.useCustomLogo && (localSettings.logoUrl || previewImage) ? (
                      <img 
                        src={previewImage || localSettings.logoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher Nova Logo
                    </label>
                    
                    {localSettings.useCustomLogo && (
                      <button
                        onClick={removeCustomLogo}
                        className="ml-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover Logo
                      </button>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Recomendado: PNG ou JPG, tamanho máximo 2MB, proporção quadrada
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useCustomLogo"
                    checked={localSettings.useCustomLogo}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, useCustomLogo: e.target.checked }))}
                    className="mr-2 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="useCustomLogo" className="text-sm text-gray-300">
                    Usar logo personalizada
                  </label>
                </div>
              </div>
            </div>

            {/* Business Info Section */}
            <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informações do Negócio</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Negócio
                  </label>
                  <input
                    type="text"
                    value={localSettings.businessName}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="Ex: Depósito São João"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subtítulo/Descrição
                  </label>
                  <input
                    type="text"
                    value={localSettings.businessSubtitle}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, businessSubtitle: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                    placeholder="Ex: Distribuidora de Bebidas"
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-yellow-400" />
                Visualização
              </h3>
              
              <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-yellow-500/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-yellow-500/25 overflow-hidden">
                    {localSettings.useCustomLogo && (localSettings.logoUrl || previewImage) ? (
                      <img 
                        src={previewImage || localSettings.logoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-black" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">{localSettings.businessName}</h1>
                    <p className="text-xs text-gray-400">{localSettings.businessSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 px-6 py-4">
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Sincronização na Nuvem */}
      <CloudSyncModal 
        isOpen={showCloudSync}
        onClose={() => setShowCloudSync(false)}
      />
    </>
  );
}