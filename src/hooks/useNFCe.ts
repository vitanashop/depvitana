import { useState, useEffect } from 'react';
import { NFCe, NFCeConfig } from '../types/nfce';
import { useAuth } from '../contexts/AuthContext';

const getStorageKey = (businessId: string) => `business-${businessId}-nfce`;
const getConfigKey = (businessId: string) => `business-${businessId}-nfce-config`;

export function useNFCe() {
  const { user } = useAuth();
  const [nfces, setNfces] = useState<NFCe[]>([]);
  const [config, setConfigState] = useState<NFCeConfig | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const storageKey = getStorageKey(user.businessId);
    const configKey = getConfigKey(user.businessId);
    
    // Carregar NFCe
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsedNFCes = JSON.parse(stored).map((n: any) => ({
        ...n,
        dataEmissao: new Date(n.dataEmissao),
        dataVencimento: n.dataVencimento ? new Date(n.dataVencimento) : undefined,
        dataAutorizacao: n.dataAutorizacao ? new Date(n.dataAutorizacao) : undefined,
      }));
      setNfces(parsedNFCes);
    }
    
    // Carregar configuração
    const storedConfig = localStorage.getItem(configKey);
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setConfigState(parsedConfig);
    }
  }, [user]);

  const saveNFCes = (updatedNFCes: NFCe[]) => {
    if (!user) return;
    
    setNfces(updatedNFCes);
    const storageKey = getStorageKey(user.businessId);
    localStorage.setItem(storageKey, JSON.stringify(updatedNFCes));
  };

  const saveConfig = (newConfig: NFCeConfig) => {
    if (!user) return;
    
    setConfigState(newConfig);
    const configKey = getConfigKey(user.businessId);
    localStorage.setItem(configKey, JSON.stringify(newConfig));
  };

  const addNFCe = (nfce: NFCe) => {
    const updatedNFCes = [...nfces, nfce];
    saveNFCes(updatedNFCes);
  };

  const updateNFCe = (id: string, updates: Partial<NFCe>) => {
    const updatedNFCes = nfces.map((nfce) =>
      nfce.id === id ? { ...nfce, ...updates } : nfce
    );
    saveNFCes(updatedNFCes);
  };

  const getNFCeByVendaId = (vendaId: string) => {
    return nfces.find(nfce => nfce.vendaId === vendaId);
  };

  const getProximoNumero = () => {
    if (!config) return 1;
    return config.proximoNumero;
  };

  const incrementarNumero = () => {
    if (config) {
      const newConfig = { ...config, proximoNumero: config.proximoNumero + 1 };
      saveConfig(newConfig);
    }
  };

  const isConfigured = () => {
    return config !== null && config.emitente.cnpj !== '';
  };

  return {
    nfces,
    config,
    addNFCe,
    updateNFCe,
    getNFCeByVendaId,
    getProximoNumero,
    incrementarNumero,
    saveConfig,
    isConfigured
  };
}