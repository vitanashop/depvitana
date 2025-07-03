import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';

interface AppSettings {
  businessName: string;
  businessSubtitle: string;
  logoUrl: string;
  useCustomLogo: boolean;
}

const getStorageKey = (businessId: string) => `business-${businessId}-settings`;

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    businessName: 'Sistema de Gestão',
    businessSubtitle: 'Depósito de Bebidas',
    logoUrl: '',
    useCustomLogo: false,
  });

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      const storageKey = getStorageKey(user.businessId);
      
      // Tentar carregar da nuvem primeiro
      const cloudData = await DatabaseService.loadData(storageKey, user.id, user.businessId);
      
      if (cloudData) {
        setSettings(cloudData);
      } else {
        // Fallback para dados locais ou padrão
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          setSettings(parsedSettings);
        } else {
          // Configurações padrão
          const defaultSettings: AppSettings = {
            businessName: 'Sistema de Gestão',
            businessSubtitle: 'Depósito de Bebidas',
            logoUrl: '',
            useCustomLogo: false,
          };
          setSettings(defaultSettings);
          await DatabaseService.saveData(storageKey, defaultSettings, user.id, user.businessId);
        }
      }
    };

    loadSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    const storageKey = getStorageKey(user.businessId);
    await DatabaseService.saveData(storageKey, updatedSettings, user.id, user.businessId);
  };

  const resetSettings = async () => {
    if (!user) return;
    
    const defaultSettings: AppSettings = {
      businessName: 'Sistema de Gestão',
      businessSubtitle: 'Depósito de Bebidas',
      logoUrl: '',
      useCustomLogo: false,
    };
    
    setSettings(defaultSettings);
    const storageKey = getStorageKey(user.businessId);
    await DatabaseService.saveData(storageKey, defaultSettings, user.id, user.businessId);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}