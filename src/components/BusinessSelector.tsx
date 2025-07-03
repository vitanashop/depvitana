import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Building2, 
  ArrowRight,
  Coffee,
  Package,
  Sparkles,
  Users,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth, BusinessInfo } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';

interface BusinessSelectorProps {
  onBusinessSelected: (businessId: string) => void;
}

export function BusinessSelector({ onBusinessSelected }: BusinessSelectorProps) {
  const { getBusinesses, createBusiness } = useAuth();
  const { settings } = useSettings();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Atualizar horário
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const businesses = getBusinesses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-yellow-900/20"></div>
      
      {/* Partículas animadas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 opacity-20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/25 overflow-hidden">
            {settings.useCustomLogo && settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.businessName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="h-12 w-12 text-gray-900" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {settings.businessName}
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Selecione seu estabelecimento ou crie um novo
          </p>
          
          {/* Data e hora */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/20 inline-block">
            <div className="text-yellow-400 font-mono text-xl">
              {currentTime.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-gray-400 text-sm">
              {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {!showCreateForm ? (
          <div className="space-y-6">
            {/* Lista de estabelecimentos */}
            {businesses.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/20 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Building2 className="h-6 w-6 mr-3 text-yellow-400" />
                  Estabelecimentos Registrados
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => onBusinessSelected(business.id)}
                      className="p-6 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-xl border border-gray-600/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 group text-left"
                    >
                      <div className="flex items-center mb-4">
                        {business.useCustomLogo && business.logoUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-yellow-500/30 mr-3">
                            <img 
                              src={business.logoUrl} 
                              alt={business.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-3">
                            <Package className="h-6 w-6 text-gray-900" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg group-hover:text-yellow-400 transition-colors">
                            {business.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{business.subtitle}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          <span className="capitalize">{business.plan}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Criado em {business.createdAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botão criar novo */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/20 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Criar Novo Estabelecimento
                </h3>
                <p className="text-gray-400 mb-6">
                  Configure um novo sistema para seu negócio
                </p>
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 flex items-center mx-auto shadow-lg shadow-blue-500/25"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Começar Agora
                </button>
              </div>
            </div>

            {/* Demonstração */}
            {businesses.length === 0 && (
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/20 p-8">
                <div className="text-center">
                  <Coffee className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Experimente o Sistema
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Teste com dados de demonstração
                  </p>
                  
                  <button
                    onClick={async () => {
                      const demoId = await createBusiness({
                        name: 'Depósito Demo',
                        subtitle: 'Estabelecimento de Demonstração',
                        logoUrl: '',
                        useCustomLogo: false,
                        plan: 'free'
                      });
                      onBusinessSelected(demoId);
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 flex items-center mx-auto shadow-lg shadow-green-500/25"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Criar Demo
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <CreateBusinessForm 
            onCancel={() => setShowCreateForm(false)}
            onSuccess={(businessId) => {
              setShowCreateForm(false);
              onBusinessSelected(businessId);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface CreateBusinessFormProps {
  onCancel: () => void;
  onSuccess: (businessId: string) => void;
}

function CreateBusinessForm({ onCancel, onSuccess }: CreateBusinessFormProps) {
  const { createBusiness } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    logoUrl: '',
    useCustomLogo: false,
    plan: 'free' as 'free' | 'premium'
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Digite o nome do estabelecimento');
      return;
    }

    setIsCreating(true);
    
    try {
      const businessId = await createBusiness(formData);
      onSuccess(businessId);
    } catch (error) {
      alert('Erro ao criar estabelecimento');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          logoUrl: result,
          useCustomLogo: true
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/20 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Plus className="h-6 w-6 mr-3 text-yellow-400" />
          Criar Novo Estabelecimento
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
          disabled={isCreating}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400"
              placeholder="Ex: Meu Depósito"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400"
              placeholder="Ex: Distribuidora de Bebidas"
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Logo do Estabelecimento
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              {formData.useCustomLogo && formData.logoUrl ? (
                <img 
                  src={formData.logoUrl} 
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
                disabled={isCreating}
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Escolher Logo
              </label>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG até 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Plano
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.plan === 'free' 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-600 hover:border-gray-500'
            }`}>
              <input
                type="radio"
                value="free"
                checked={formData.plan === 'free'}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as 'free' }))}
                className="sr-only"
                disabled={isCreating}
              />
              <div className="text-center">
                <div className="text-lg font-bold text-white">Gratuito</div>
                <div className="text-sm text-gray-400">Recursos básicos</div>
              </div>
            </label>
            
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.plan === 'premium' 
                ? 'border-yellow-500 bg-yellow-900/20' 
                : 'border-gray-600 hover:border-gray-500'
            }`}>
              <input
                type="radio"
                value="premium"
                checked={formData.plan === 'premium'}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as 'premium' }))}
                className="sr-only"
                disabled={isCreating}
              />
              <div className="text-center">
                <div className="text-lg font-bold text-white">Premium</div>
                <div className="text-sm text-gray-400">Recursos avançados</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            disabled={isCreating}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isCreating || !formData.name.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
          >
            {isCreating ? 'Criando...' : 'Criar Estabelecimento'}
          </button>
        </div>
      </form>
    </div>
  );
}