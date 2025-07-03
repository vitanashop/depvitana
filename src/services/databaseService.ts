// Serviço de banco de dados real usando localStorage como fallback
// e API externa para sincronização

interface DatabaseConfig {
  useRemoteDB: boolean;
  apiUrl: string;
  apiKey: string;
  syncInterval: number;
}

interface SyncData {
  userId: string;
  businessId: string;
  data: any;
  lastModified: Date;
  version: number;
}

export class DatabaseService {
  private static config: DatabaseConfig = {
    useRemoteDB: false,
    apiUrl: '',
    apiKey: '',
    syncInterval: 30000 // 30 segundos
  };

  private static syncTimer: number | null = null;
  private static isOnline = navigator.onLine;

  static init() {
    // Detectar status de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopSync();
    });

    // Carregar configuração
    const savedConfig = localStorage.getItem('database-config');
    if (savedConfig) {
      this.config = { ...this.config, ...JSON.parse(savedConfig) };
    }

    // Iniciar sincronização se configurado
    if (this.config.useRemoteDB && this.isOnline) {
      this.startSync();
    }
  }

  static configureRemoteDB(apiUrl: string, apiKey: string) {
    this.config = {
      ...this.config,
      useRemoteDB: true,
      apiUrl,
      apiKey
    };
    
    localStorage.setItem('database-config', JSON.stringify(this.config));
    
    if (this.isOnline) {
      this.startSync();
    }
  }

  static async saveData(key: string, data: any, userId: string, businessId: string): Promise<void> {
    // Sempre salvar localmente primeiro
    const localData = {
      data,
      lastModified: new Date(),
      version: Date.now(),
      userId,
      businessId
    };
    
    localStorage.setItem(key, JSON.stringify(localData));

    // Tentar sincronizar com servidor se configurado
    if (this.config.useRemoteDB && this.isOnline) {
      try {
        await this.syncToRemote(key, localData);
      } catch (error) {
        console.warn('Falha na sincronização, dados salvos localmente:', error);
      }
    }
  }

  static async loadData(key: string, userId: string, businessId: string): Promise<any> {
    // Tentar carregar do servidor primeiro se configurado
    if (this.config.useRemoteDB && this.isOnline) {
      try {
        const remoteData = await this.loadFromRemote(key, userId, businessId);
        if (remoteData) {
          // Salvar localmente para cache
          localStorage.setItem(key, JSON.stringify(remoteData));
          return remoteData.data;
        }
      } catch (error) {
        console.warn('Falha ao carregar do servidor, usando dados locais:', error);
      }
    }

    // Fallback para dados locais
    const localData = localStorage.getItem(key);
    if (localData) {
      const parsed = JSON.parse(localData);
      return parsed.data;
    }

    return null;
  }

  private static async syncToRemote(key: string, data: SyncData): Promise<void> {
    if (!this.config.apiUrl || !this.config.apiKey) return;

    const response = await fetch(`${this.config.apiUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-User-ID': data.userId,
        'X-Business-ID': data.businessId
      },
      body: JSON.stringify({
        key,
        data: data.data,
        lastModified: data.lastModified,
        version: data.version
      })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  private static async loadFromRemote(key: string, userId: string, businessId: string): Promise<SyncData | null> {
    if (!this.config.apiUrl || !this.config.apiKey) return null;

    const response = await fetch(`${this.config.apiUrl}/sync/${key}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-User-ID': userId,
        'X-Business-ID': businessId
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Load failed: ${response.statusText}`);
    }

    return await response.json();
  }

  private static startSync() {
    if (this.syncTimer) return;

    this.syncTimer = window.setInterval(async () => {
      await this.performFullSync();
    }, this.config.syncInterval);
  }

  private static stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private static async performFullSync() {
    if (!this.isOnline || !this.config.useRemoteDB) return;

    try {
      // Sincronizar todos os dados locais modificados
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('business-') || key.startsWith('user-')
      );

      for (const key of keys) {
        const localData = localStorage.getItem(key);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.lastModified) {
            await this.syncToRemote(key, parsed);
          }
        }
      }
    } catch (error) {
      console.warn('Erro na sincronização automática:', error);
    }
  }

  // Método para configurar Firebase/Supabase
  static async setupFirebase(config: any) {
    // Implementação futura para Firebase
    console.log('Firebase setup:', config);
  }

  static async setupSupabase(url: string, key: string) {
    // Implementação futura para Supabase
    console.log('Supabase setup:', url, key);
  }

  // Método para usar JSONBin.io (gratuito)
  static setupJSONBin(apiKey: string) {
    this.configureRemoteDB('https://api.jsonbin.io/v3/b', apiKey);
  }

  // Método para usar RestDB.io (gratuito)
  static setupRestDB(apiKey: string, databaseId: string) {
    this.configureRemoteDB(`https://${databaseId}.restdb.io/rest`, apiKey);
  }
}

// Inicializar automaticamente
DatabaseService.init();