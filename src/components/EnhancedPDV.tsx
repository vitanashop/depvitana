import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  DollarSign,
  Smartphone,
  Check,
  Calculator,
  Scan,
  Monitor,
  User,
  Clock,
  Zap,
  Package
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useStockMovements } from '../hooks/useStockMovements';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { BarcodeScanner } from './BarcodeScanner';
import { SaleItem } from '../types';

interface CartItem extends SaleItem {
  product: any;
}

export function EnhancedPDV() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { products, updateStock, findByBarcode } = useProducts();
  const { addSale } = useSales();
  const { addMovement } = useStockMovements();
  const { showNotification, settings: notificationSettings } = useNotifications();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartão' | 'débito'>('dinheiro');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [standByMode, setStandByMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const cartTotal = cart.reduce((total, item) => total + item.total, 0);
  const cartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Atualizar horário
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Controle de stand-by automático
  useEffect(() => {
    const checkStandBy = setInterval(() => {
      if (Date.now() - lastActivity > 120000 && cart.length === 0) { // 2 minutos
        setStandByMode(true);
      }
    }, 10000);

    return () => clearInterval(checkStandBy);
  }, [lastActivity, cart.length]);

  // Registrar atividade
  const registerActivity = () => {
    setLastActivity(Date.now());
    setStandByMode(false);
  };

  // Focus automático no campo de scanner
  useEffect(() => {
    if (barcodeInputRef.current && !standByMode) {
      barcodeInputRef.current.focus();
    }
  }, [standByMode, cart]);

  const addToCart = (product: any, quantity: number = 1) => {
    registerActivity();
    
    if (product.stock < quantity) {
      showNotification({
        type: 'error',
        title: '❌ Estoque Insuficiente',
        message: `${product.name} não tem estoque suficiente`,
        duration: 4000
      });
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        showNotification({
          type: 'error',
          title: '❌ Estoque Insuficiente',
          message: `Quantidade solicitada excede o estoque disponível`,
          duration: 4000
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.productId === product.id
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.unitPrice
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: quantity * product.price,
        product
      };
      setCart([...cart, newItem]);
    }

    // Som de beep
    playBeepSound();
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    registerActivity();
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.productId === productId);
    if (!item) return;

    if (item.product.stock < quantity) {
      showNotification({
        type: 'error',
        title: '❌ Estoque Insuficiente',
        message: `Quantidade solicitada excede o estoque disponível`,
        duration: 4000
      });
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? {
            ...item,
            quantity,
            total: quantity * item.unitPrice
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    registerActivity();
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleBarcodeScan = () => {
    registerActivity();
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    const product = findByBarcode(barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      
      if (notificationSettings.enableSaleNotifications) {
        showNotification({
          type: 'success',
          title: '✅ Produto Adicionado',
          message: `${product.name} - ${formatCurrency(product.price)}`,
          duration: 2000
        });
      }
    } else {
      showNotification({
        type: 'error',
        title: '❌ Produto Não Encontrado',
        message: `Código ${barcode} não cadastrado`,
        duration: 3000
      });
      setBarcodeInput('');
    }
  };

  const handleScannerResult = (barcode: string) => {
    registerActivity();
    const product = findByBarcode(barcode);
    if (product) {
      addToCart(product);
      
      if (notificationSettings.enableSaleNotifications) {
        showNotification({
          type: 'success',
          title: '🎯 Produto Escaneado!',
          message: `${product.name} adicionado automaticamente`,
          duration: 3000
        });
      }
    } else {
      showNotification({
        type: 'error',
        title: '❌ Produto Não Encontrado',
        message: `Código ${barcode} não está cadastrado`,
        duration: 4000
      });
    }
  };

  const completeSale = () => {
    registerActivity();
    
    if (cart.length === 0) {
      showNotification({
        type: 'warning',
        title: '⚠️ Carrinho Vazio',
        message: 'Adicione produtos antes de finalizar a venda',
        duration: 3000
      });
      return;
    }

    if (paymentMethod === 'dinheiro') {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < cartTotal) {
        showNotification({
          type: 'error',
          title: '❌ Valor Insuficiente',
          message: 'O valor recebido deve ser maior ou igual ao total',
          duration: 4000
        });
        return;
      }
    }

    // Processar venda
    addSale({
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      total: cartTotal,
      paymentMethod
    });

    // Atualizar estoque
    cart.forEach(item => {
      const newStock = item.product.stock - item.quantity;
      updateStock(item.productId, newStock);
      
      addMovement({
        productId: item.productId,
        type: 'saída',
        quantity: item.quantity,
        reason: 'Venda PDV'
      });
      
      // Verificar estoque baixo
      if (notificationSettings.enableStockNotifications) {
        if (newStock <= 0) {
          showNotification({
            type: 'error',
            title: '❌ Estoque Zerado!',
            message: `${item.productName} está sem estoque`,
            duration: 8000
          });
        } else if (newStock <= item.product.minStock) {
          showNotification({
            type: 'warning',
            title: '⚠️ Estoque Baixo!',
            message: `${item.productName} - Restam ${newStock} unidades`,
            duration: 6000
          });
        }
      }
    });

    // Limpar carrinho
    setCart([]);
    setBarcodeInput('');
    setCashReceived('');
    setShowPaymentModal(false);
    
    // Notificação de sucesso
    if (notificationSettings.enableSaleNotifications) {
      showNotification({
        type: 'sale',
        title: '🎉 Venda Concluída!',
        message: `Total: ${formatCurrency(cartTotal)} - ${paymentMethod.toUpperCase()}`,
        data: {
          total: cartTotal,
          itemCount: cartItems,
          paymentMethod,
          items: cart.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            total: item.total
          }))
        },
        duration: 5000
      });
    }

    // Som de sucesso
    playSuccessSound();
  };

  const clearCart = () => {
    registerActivity();
    if (cart.length > 0) {
      setCart([]);
      setBarcodeInput('');
      showNotification({
        type: 'info',
        title: '🗑️ Carrinho Limpo',
        message: 'Todos os itens foram removidos',
        duration: 2000
      });
    }
  };

  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Som não disponível');
    }
  };

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Som não disponível');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (standByMode) return;
      
      registerActivity();
      
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          clearCart();
          break;
        case 'F2':
          e.preventDefault();
          if (cart.length > 0) {
            setShowPaymentModal(true);
          }
          break;
        case 'F3':
          e.preventDefault();
          setStandByMode(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart.length, standByMode]);

  // Modo Stand By
  if (standByMode) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center text-center p-8 cursor-pointer"
        onClick={() => {
          setStandByMode(false);
          registerActivity();
        }}
      >
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden">
            {settings.useCustomLogo && settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.businessName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Monitor className="h-16 w-16 text-black" />
            )}
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">{settings.businessName.toUpperCase()}</h1>
          <p className="text-2xl text-gray-400 mb-8">{settings.businessSubtitle}</p>
          
          <div className="text-4xl font-mono text-yellow-400 mb-2">
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-lg text-gray-500">
            {currentTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center text-green-400 text-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            Sistema Ativo - Frente de Caixa em Stand By
          </div>
          
          <p className="text-gray-400 text-lg">
            Toque na tela ou pressione qualquer tecla para ativar
          </p>
          
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 max-w-md">
            <p className="text-sm text-gray-500">
              Operador: <span className="text-white font-medium">{user?.name}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="min-h-screen bg-black">
        {/* Header do PDV */}
        <div className="bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <Calculator className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`}>
                  FRENTE DE CAIXA
                </h1>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {cartItems} {cartItems === 1 ? 'item' : 'itens'} • {formatCurrency(cartTotal)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className={`text-yellow-400 font-mono ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {isMobile 
                    ? currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : currentTime.toLocaleDateString('pt-BR')
                  }
                </div>
              </div>
              
              {!isMobile && (
                <div className="flex items-center text-gray-300">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user?.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'} p-6`}>
          {/* Scanner e Controles */}
          <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-6`}>
            {/* Scanner Principal */}
            <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white flex items-center`}>
                  <Scan className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-yellow-400`} />
                  {isMobile ? 'Scanner' : 'Scanner de Código de Barras'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowScanner(true)}
                    className={`bg-blue-600 text-white ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} rounded-lg hover:bg-blue-700 transition-colors flex items-center touch-manipulation`}
                  >
                    <Scan className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    {isMobile ? '📷' : 'Câmera'}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
                  placeholder={isMobile ? "Código..." : "Escaneie ou digite o código de barras..."}
                  className={`flex-1 px-4 ${isMobile ? 'py-3 text-lg' : 'py-4 text-xl'} bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white font-mono touch-manipulation`}
                  autoFocus
                />
                <button
                  onClick={handleBarcodeScan}
                  disabled={!barcodeInput.trim()}
                  className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation`}
                >
                  <Plus className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                </button>
              </div>
              
              <div className={`${isMobile ? 'mt-2' : 'mt-4'} text-xs text-gray-500`}>
                Scanner USB conectado: Digite ou escaneie diretamente
              </div>
            </div>

            {/* Produtos Rápidos */}
            <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-4 flex items-center`}>
                <Package className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-yellow-400`} />
                {isMobile ? 'Produtos' : 'Produtos Mais Vendidos'}
              </h3>
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-3'}`}>
                {products.filter(p => p.stock > 0).slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`${isMobile ? 'p-2' : 'p-3'} bg-gray-800/50 border border-gray-600/50 rounded-lg hover:bg-yellow-600/20 hover:border-yellow-500/50 transition-colors text-left touch-manipulation`}
                  >
                    <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} text-white truncate`}>
                      {product.name}
                    </div>
                    <div className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>
                      {formatCurrency(product.price)}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>
                      Est: {product.stock}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Carrinho e Total */}
          <div className="space-y-6">
            {/* Carrinho */}
            <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white flex items-center`}>
                  <ShoppingCart className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                  Carrinho ({cartItems})
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className={`text-red-400 hover:text-red-300 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center touch-manipulation`}
                  >
                    <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                    {isMobile ? 'Limpar' : 'F1'}
                  </button>
                )}
              </div>

              <div className={`space-y-3 ${isMobile ? 'max-h-60' : 'max-h-80'} overflow-y-auto`}>
                {cart.map((item) => (
                  <div key={item.productId} className={`bg-gray-800/50 border border-gray-600/50 rounded-lg ${isMobile ? 'p-3' : 'p-3'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'} text-white truncate`}>
                          {item.productName}
                        </p>
                        <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>
                          {formatCurrency(item.unitPrice)} cada
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className={`text-red-400 hover:text-red-300 ml-2 ${isMobile ? 'p-1 touch-target' : ''} touch-manipulation`}
                      >
                        <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className={`${isMobile ? 'p-1' : 'p-1'} text-gray-400 hover:text-red-400 bg-gray-700 rounded touch-manipulation`}
                        >
                          <Minus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </button>
                        <span className={`w-8 text-center ${isMobile ? 'text-sm' : 'text-sm'} font-bold text-white bg-gray-700 rounded px-2 py-1`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className={`${isMobile ? 'p-1' : 'p-1'} text-gray-400 hover:text-yellow-400 bg-gray-700 rounded touch-manipulation`}
                        >
                          <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </button>
                      </div>
                      
                      <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-bold text-yellow-400`}>
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length === 0 && (
                <div className={`text-center ${isMobile ? 'py-8' : 'py-8'} text-gray-400`}>
                  <ShoppingCart className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-2 opacity-30`} />
                  <p>Carrinho vazio</p>
                </div>
              )}
            </div>

            {/* Total e Pagamento */}
            {cart.length > 0 && (
              <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="mb-4">
                  <div className={`flex justify-between ${isMobile ? 'text-base' : 'text-lg'}`}>
                    <span className="text-white">Subtotal:</span>
                    <span className="text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className={`flex justify-between ${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-yellow-400 border-t border-gray-600 pt-2 mt-2`}>
                    <span>TOTAL:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className={`w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold ${isMobile ? 'py-3 text-lg' : 'py-4 text-xl'} rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center justify-center touch-manipulation`}
                >
                  <DollarSign className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-2`} />
                  {isMobile ? 'FINALIZAR (F2)' : 'FINALIZAR VENDA (F2)'}
                </button>
              </div>
            )}

            {/* Atalhos */}
            {!isMobile && (
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Atalhos de Teclado</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>F1: Limpar carrinho</span>
                    <span>F2: Finalizar venda</span>
                  </div>
                  <div className="flex justify-between">
                    <span>F3: Stand-by</span>
                    <span>Enter: Adicionar código</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScannerResult}
        title="Scanner de Código de Barras - PDV"
      />

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl ${isMobile ? 'w-full' : 'max-w-md w-full'} p-6 border border-yellow-500/30`}>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-4`}>
              Finalizar Pagamento
            </h3>
            
            <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-yellow-400`}>
                {formatCurrency(cartTotal)}
              </p>
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-300`}>
                {cartItems} {cartItems === 1 ? 'item' : 'itens'}
              </p>
            </div>

            <div className="mb-6">
              <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-300 mb-3`}>
                Forma de Pagamento
              </label>
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-2'}`}>
                {[
                  { key: 'dinheiro', label: 'Dinheiro', icon: DollarSign },
                  { key: 'pix', label: 'PIX', icon: Smartphone },
                  { key: 'cartão', label: 'Cartão', icon: CreditCard },
                  { key: 'débito', label: 'Débito', icon: CreditCard }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key as any)}
                    className={`flex items-center justify-center ${isMobile ? 'p-2' : 'p-3'} rounded-lg border-2 transition-colors touch-manipulation ${
                      paymentMethod === key 
                        ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' 
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <Icon className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-5 w-5 mr-2'}`} />
                    <span className={isMobile ? 'text-xs' : 'text-sm'}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'dinheiro' && (
              <div className="mb-6">
                <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-300 mb-2`}>
                  Valor Recebido
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3 ${isMobile ? 'py-3 text-lg' : 'py-3 text-xl'} bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white text-center touch-manipulation`}
                  autoFocus
                />
                {cashReceived && parseFloat(cashReceived) >= cartTotal && (
                  <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded">
                    <p className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-yellow-400 text-center`}>
                      Troco: {formatCurrency(parseFloat(cashReceived) - cartTotal)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`flex-1 px-4 ${isMobile ? 'py-3' : 'py-3'} border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors touch-manipulation`}
              >
                Cancelar
              </button>
              <button
                onClick={completeSale}
                className={`flex-1 px-4 ${isMobile ? 'py-3' : 'py-3'} bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center justify-center touch-manipulation`}
              >
                <Check className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-4 w-4 mr-2'}`} />
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}