import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Notification } from '../contexts/NotificationContext';

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

export function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Mostrar notificação
    const showTimer = window.setTimeout(() => setIsVisible(true), 100);
    
    // Auto-remover se tiver duração
    let hideTimer: number | undefined;
    if (notification.duration && notification.duration > 0) {
      hideTimer = window.setTimeout(() => {
        handleRemove();
      }, notification.duration);
    }

    return () => {
      window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [notification.duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'sale':
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'sale':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .toast-enter {
          animation: slideInRight 0.3s ease-out;
        }
        
        .toast-exit {
          animation: slideOutRight 0.3s ease-in;
        }
      `}</style>
      
      <div
        className={`
          max-w-sm w-full bg-gray-900 border rounded-lg shadow-lg p-4 mb-3
          ${getColors()}
          ${isVisible && !isExiting ? 'toast-enter' : ''}
          ${isExiting ? 'toast-exit' : ''}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-300">
              {notification.message}
            </p>
            
            {notification.data && (
              <div className="mt-2 text-xs text-gray-400">
                {typeof notification.data === 'object' ? (
                  Object.entries(notification.data).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))
                ) : (
                  <div>{String(notification.data)}</div>
                )}
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              {notification.timestamp.toLocaleTimeString('pt-BR')}
            </div>
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}