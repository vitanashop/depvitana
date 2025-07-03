import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  BarChart3, 
  TrendingUp, 
  ShoppingCart,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronLeft
} from 'lucide-react';
import { FileText } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { NotificationContainer } from './components/NotificationContainer';
import { NotificationCenter } from './components/NotificationCenter';
import { useSettings } from './hooks/useSettings';
import { InitialLoginPage } from './components/InitialLoginPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { StockControl } from './components/StockControl';
import { SalesManagement } from './components/SalesManagement';
import { FinancialReports } from './components/FinancialReports';
import { SettingsModal } from './components/SettingsModal';
import { EnhancedPDV } from './components/EnhancedPDV';
import { NFCeManager } from './components/NFCeManager';

type ActiveView = 'dashboard' | 'products' | 'stock' | 'sales' | 'reports' | 'nfce' | 'pdv';

interface NavItemProps {
  id: ActiveView;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: (id: ActiveView) => void;
  isMobile?: boolean;
}

function NavItem({ id, icon, label, active, onClick, isMobile = false }: NavItemProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`mobile-nav-item ${
        active
          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/25'
          : 'text-gray-300 hover:bg-gray-800/50 hover:text-yellow-400'
      } ${isMobile ? 'justify-center flex-col py-2 px-3 text-xs' : ''}`}
    >
      <span className={isMobile ? 'mb-1' : 'mr-3'}>{icon}</span>
      <span className={`font-medium ${isMobile ? 'text-xs' : ''}`}>{label}</span>
    </button>
  );
}

function AppContent() {
  const { user, logout, isLoading, isSuperAdmin } = useAuth();
  const { settings } = useSettings();
  const [activeView, setActiveView] = useState<ActiveView>(user?.role === 'operator' ? 'pdv' : 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { unreadCount } = useNotifications();

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fechar sidebar ao mudar de view no mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeView, isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center safe-area-top safe-area-bottom">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-yellow-500/25">
            <Package className="h-8 w-8 text-black" />
          </div>
          <p className="text-white text-lg">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  if (!user) {
    return <InitialLoginPage />;
  }

  const getNavItems = () => {
    if (user.role === 'operator') {
      return [
        { id: 'pdv' as ActiveView, icon: <ShoppingCart className="h-5 w-5" />, label: isMobile ? 'PDV' : 'PDV (Vendas)' },
        { id: 'products' as ActiveView, icon: <Package className="h-5 w-5" />, label: isMobile ? 'Produtos' : 'Consultar Produtos' }
      ];
    } else {
      return [
        { id: 'dashboard' as ActiveView, icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
        { id: 'products' as ActiveView, icon: <Package className="h-5 w-5" />, label: 'Produtos' },
        { id: 'stock' as ActiveView, icon: <BarChart3 className="h-5 w-5" />, label: 'Estoque' },
        { id: 'sales' as ActiveView, icon: <ShoppingCart className="h-5 w-5" />, label: 'Vendas' },
        { id: 'reports' as ActiveView, icon: <TrendingUp className="h-5 w-5" />, label: 'Relatórios' },
        { id: 'nfce' as ActiveView, icon: <FileText className="h-5 w-5" />, label: 'NFCe' },
      ];
    }
  };

  const navItems = getNavItems();

  const renderContent = () => {
    if (user.role === 'operator') {
      switch (activeView) {
        case 'pdv':
          return <EnhancedPDV />;
        case 'products':
          return <ProductManagement readOnly={true} />;
        default:
          return <EnhancedPDV />;
      }
    } else {
      switch (activeView) {
        case 'dashboard':
          return <Dashboard />;
        case 'products':
          return <ProductManagement readOnly={false} />;
        case 'stock':
          return <StockControl />;
        case 'sales':
          return <SalesManagement />;
        case 'reports':
          return <FinancialReports />;
        case 'nfce':
          return <NFCeManager />;
        case 'pdv':
          return <EnhancedPDV />;
        default:
          return <Dashboard />;
      }
    }
  };

  const getViewTitle = () => {
    const item = navItems.find(item => item.id === activeView);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-black flex safe-area-top safe-area-bottom">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 bg-gradient-to-b from-gray-900 to-black border-r border-yellow-500/30">
          <div className="flex items-center justify-between h-16 px-6 border-b border-yellow-500/30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-yellow-500/25 overflow-hidden">
                {settings.useCustomLogo && settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt={settings.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-black" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{settings.businessName}</h1>
                <p className="text-xs text-gray-400">{settings.businessSubtitle}</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-4">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                active={activeView === item.id}
                onClick={setActiveView}
              />
            ))}
          </nav>

          {user.role === 'admin' && (
            <div className="absolute bottom-16 left-4 right-4">
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-yellow-400 rounded-lg transition-colors touch-manipulation"
              >
                <Settings className="h-5 w-5 mr-3" />
                <span className="font-medium">Configurações</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-2 left-4 right-4">
            <p className="text-xs text-gray-500">Sistema v2.0</p>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-gray-900 to-black border-r border-yellow-500/30 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-yellow-500/30 safe-area-top">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-yellow-500/25 overflow-hidden">
                  {settings.useCustomLogo && settings.logoUrl ? (
                    <img 
                      src={settings.logoUrl} 
                      alt={settings.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-black" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{settings.businessName}</h1>
                  <p className="text-xs text-gray-400">{settings.businessSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-yellow-400 transition-colors touch-manipulation p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-6 px-4 pb-20">
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeView === item.id}
                  onClick={setActiveView}
                />
              ))}
              
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    setSettingsOpen(true);
                    setSidebarOpen(false);
                  }}
                  className="mobile-nav-item text-gray-300 hover:bg-gray-800/50 hover:text-yellow-400 mt-6"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span className="font-medium">Configurações</span>
                </button>
              )}
              
              <button
                onClick={logout}
                className="mobile-nav-item text-gray-300 hover:bg-red-500/20 hover:text-red-400 mt-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-medium">Sair</span>
              </button>
            </nav>

            <div className="absolute bottom-4 left-4 right-4 safe-area-bottom">
              <p className="text-xs text-gray-500">Sistema v2.0</p>
            </div>
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        {isMobile ? (
          <header className="bg-gradient-to-r from-gray-900 to-black shadow-lg border-b border-yellow-500/30 h-16 flex items-center justify-between px-4 safe-area-top">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-300 hover:text-yellow-400 transition-colors mr-3 p-2 touch-manipulation"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">{getViewTitle()}</h2>
                <p className="text-xs text-gray-400">
                  {user.role === 'admin' ? '👑 Admin' : '👨‍💼 Operador'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setNotificationCenterOpen(true)}
                className="p-2 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-800/50 relative touch-manipulation"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>
        ) : (
          /* Desktop Header */
          <header className="bg-gradient-to-r from-gray-900 to-black shadow-lg border-b border-yellow-500/30 h-16 flex items-center justify-between px-6">
            <div className="flex items-center">
              <div className="text-gray-300">
                <span className="text-sm">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-300">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {user.role === 'admin' ? '👑 Admin' : '👨‍💼 Operador'}
                </span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setNotificationCenterOpen(true)}
                  className="p-2 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-800/50 relative"
                  title="Notificações"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-800/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </header>
        )}

        {/* Content */}
        <main className={`flex-1 overflow-auto bg-black ${isMobile ? 'p-4' : 'p-6'} safe-area-bottom`}>
          <div className="mobile-fade-in">
            {renderContent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation (apenas para operadores) */}
        {isMobile && user.role === 'operator' && (
          <div className="bg-gradient-to-r from-gray-900 to-black border-t border-yellow-500/30 safe-area-bottom">
            <div className="flex">
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeView === item.id}
                  onClick={setActiveView}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {user.role === 'admin' && (
        <SettingsModal 
          isOpen={settingsOpen} 
          onClose={() => setSettingsOpen(false)} 
        />
      )}
      
      <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
      
      <NotificationContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;