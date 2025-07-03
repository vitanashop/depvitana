import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Trash2, 
  Eye,
  CheckCircle,
  X,
  ShoppingCart,
  Clock
} from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    settings, 
    updateSettings, 
    clearAllNotifications, 
    markAllAsRead,
    removeNotification,
    markAsRead
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'sales'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'sales':
        return notification.type === 'sale';
      default:
        return true;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'agora';
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Bell className="h-4 w-4 text-blue-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-yellow-500/30 w-96 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-bold text-white">Notificações</h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Configurações"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex space-x-2 mt-3">
            {[
              { key: 'all', label: 'Todas', count: notifications.length },
              { key: 'unread', label: 'Não lidas', count: notifications.filter(n => !n.read).length },
              { key: 'sales', label: 'Vendas', count: notifications.filter(n => n.type === 'sale').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === key 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-3 w-3 mr-1" />
                Marcar lidas
              </button>
              <button
                onClick={clearAllNotifications}
                className="flex items-center px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <h4 className="text-sm font-semibold text-white mb-3">Configurações</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Sons</span>
                <button
                  onClick={() => updateSettings({ enableSound: !settings.enableSound })}
                  className={`p-1 rounded transition-colors ${
                    settings.enableSound 
                      ? 'text-yellow-400 hover:text-yellow-300' 
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {settings.enableSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Notif. de Vendas</span>
                <button
                  onClick={() => updateSettings({ enableSaleNotifications: !settings.enableSaleNotifications })}
                  className={`p-1 rounded transition-colors ${
                    settings.enableSaleNotifications 
                      ? 'text-yellow-400 hover:text-yellow-300' 
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {settings.enableSaleNotifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Alertas de Estoque</span>
                <button
                  onClick={() => updateSettings({ enableStockNotifications: !settings.enableStockNotifications })}
                  className={`p-1 rounded transition-colors ${
                    settings.enableStockNotifications 
                      ? 'text-yellow-400 hover:text-yellow-300' 
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {settings.enableStockNotifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </button>
              </div>

              {settings.enableSound && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Volume: {Math.round(settings.soundVolume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full accent-yellow-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 mb-2 rounded-lg transition-colors cursor-pointer ${
                    notification.read 
                      ? 'bg-gray-800/30 hover:bg-gray-800/50' 
                      : 'bg-yellow-900/20 border border-yellow-500/30 hover:bg-yellow-900/30'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Sale Details */}
                        {notification.type === 'sale' && notification.data && (
                          <div className="mt-2 p-2 bg-black/30 rounded text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-yellow-400 font-bold">
                                {formatCurrency(notification.data.total)}
                              </span>
                              <span className="text-gray-400">
                                {notification.data.itemCount} {notification.data.itemCount === 1 ? 'item' : 'itens'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-2">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Remover"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}