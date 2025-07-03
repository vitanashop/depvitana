import { useState, useEffect } from 'react';
import { DatabaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

export function useCloudSync() {
  const { user } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setupJSONBin = async (apiKey: string) => {
    try {
      setSyncStatus('syncing');
      DatabaseService.setupJSONBin(apiKey);
      setIsConfigured(true);
      setLastSync(new Date());
      setSyncStatus('success');
      
      // Salvar configuração
      localStorage.setItem('cloud-sync-config', JSON.stringify({
        provider: 'jsonbin',
        apiKey,
        configured: true
      }));
      
      return true;
    } catch (error) {
      setSyncStatus('error');
      console.error('Erro ao configurar JSONBin:', error);
      return false;
    }
  };

  const setupRestDB = async (apiKey: string, databaseId: string) => {
    try {
      setSyncStatus('syncing');
      DatabaseService.setupRestDB(apiKey, databaseId);
      setIsConfigured(true);
      setLastSync(new Date());
      setSyncStatus('success');
      
      localStorage.setItem('cloud-sync-config', JSON.stringify({
        provider: 'restdb',
        apiKey,
        databaseId,
        configured: true
      }));
      
      return true;
    } catch (error) {
      setSyncStatus('error');
      console.error('Erro ao configurar RestDB:', error);
      return false;
    }
  };

  const manualSync = async () => {
    if (!user || !isConfigured) return false;

    try {
      setSyncStatus('syncing');
      
      // Forçar sincronização de todos os dados
      const keys = [
        `business-${user.businessId}-products`,
        `business-${user.businessId}-sales`,
        `business-${user.businessId}-movements`,
        `business-${user.businessId}-settings`
      ];

      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          await DatabaseService.saveData(key, JSON.parse(data), user.id, user.businessId);
        }
      }

      setLastSync(new Date());
      setSyncStatus('success');
      return true;
    } catch (error) {
      setSyncStatus('error');
      console.error('Erro na sincronização manual:', error);
      return false;
    }
  };

  const checkConfiguration = () => {
    const config = localStorage.getItem('cloud-sync-config');
    if (config) {
      const parsed = JSON.parse(config);
      setIsConfigured(parsed.configured || false);
    }
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  return {
    isConfigured,
    isOnline,
    lastSync,
    syncStatus,
    setupJSONBin,
    setupRestDB,
    manualSync,
    checkConfiguration
  };
}