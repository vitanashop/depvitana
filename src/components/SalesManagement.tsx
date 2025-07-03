import React, { useState } from 'react';
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
  Keyboard,
  Camera,
  Zap
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useStockMovements } from '../hooks/useStockMovements';
import { useNotifications } from '../contexts/NotificationContext';
import { BarcodeScanner } from './BarcodeScanner';
import { useNFCe } from '../hooks/useNFCe';
import { NFCeService } from '../services/nfceService';
import { SaleItem } from '../types';

interface CartItem extends SaleItem {
  product: any;
}

export function SalesManagement() {
  const { products, updateStock, findByBarcode } = useProducts();
  const { addSale, sales } = useSales();
  const { addMovement } = useStockMovements();
  const { showNotification, settings } = useNotifications();
  const { getNFCeByVendaId, isConfigured: isNFCeConfigured } = useNFCe();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartão' | 'débito'>('dinheiro');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'usb'>('camera');

  const cartTotal = cart.reduce((total, item) => total + item.total, 0);
  const cartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product: any, quantity: number = 1) => {
    if (product.stock < quantity) {
      alert('Estoque insuficiente!');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        alert('Estoque insuficiente!');
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
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.productId === productId);
    if (!item) return;

    if (item.product.stock < quantity) {
      alert('Estoque insuficiente!');
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
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleBarcodeScan = () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    const product = findByBarcode(barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      
      // Mostrar notificação de produto adicionado
      if (settings.enableSaleNotifications) {
        showNotification({
          type: 'success',
          title: '✅ Produto Adicionado',
          message: `${product.name} adicionado ao carrinho`,
          duration: 3000
        });
      }
    } else {
      alert('Produto não encontrado!');
      setBarcodeInput('');
    }
  };

  const handleScannerResult = (barcode: string) => {
    const product = findByBarcode(barcode);
    if (product) {
      addToCart(product);
      
      // Mostrar notificação de produto encontrado
      if (settings.enableSaleNotifications) {
        showNotification({
          type: 'success',
          title: '🎯 Produto Escaneado!',
          message: `${product.name} adicionado automaticamente`,
          duration: 4000
        });
      }
    } else {
      showNotification({
        type: 'error',
        title: '❌ Produto Não Encontrado',
        message: `Código ${barcode} não está cadastrado`,
        duration: 5000
      });
    }
  };

  const completeSale = () => {
    if (cart.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    if (paymentMethod === 'dinheiro') {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < cartTotal) {
        alert('Valor recebido insuficiente!');
        return;
      }
    }

    // Adicionar venda
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

    // Atualizar estoque e criar movimentações
    cart.forEach(item => {
      const newStock = item.product.stock - item.quantity;
      updateStock(item.productId, newStock);
      
      addMovement({
        productId: item.productId,
        type: 'saída',
        quantity: item.quantity,
        reason: 'Venda'
      });
      
      // Verificar estoque baixo e mostrar notificação se necessário
      if (settings.enableStockNotifications) {
        if (newStock <= 0) {
          showNotification({
            type: 'error',
            title: '❌ Produto Sem Estoque!',
            message: `${item.productName} está sem estoque`,
            duration: 10000
          });
        } else if (newStock <= item.product.minStock) {
          showNotification({
            type: 'warning',
            title: '⚠️ Estoque Baixo!',
            message: `${item.productName} está com estoque baixo (${newStock} restantes)`,
            duration: 6000
          });
        }
      }
    });

    setCart([]);
    setBarcodeInput('');
    setCashReceived('');
    setShowPaymentModal(false);
    
    // Mostrar notificação de venda se habilitada
    if (settings.enableSaleNotifications) {
      showNotification({
        type: 'sale',
        title: '🎉 Venda Concluída!',
        message: `Venda de ${formatCurrency(cartTotal)} realizada com sucesso`,
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
        duration: 8000
      });
    }
    
    // Sugerir emissão de NFCe se configurada
    if (isNFCeConfigured()) {
      setTimeout(() => {
        showNotification({
          type: 'info',
          title: '📄 Emitir NFCe?',
          message: 'Venda concluída! Deseja emitir a Nota Fiscal?',
          duration: 8000
        });
      }, 2000);
    }
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Deseja limpar o carrinho?')) {
      setCart([]);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Últimas Vendas com NFCe */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Últimas Vendas</h2>
          
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {sales.slice(0, 5).map((sale) => {
              const nfce = getNFCeByVendaId(sale.id);
              return (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      Venda #{sale.id.slice(-6)} - {formatCurrency(sale.total)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {sale.date.toLocaleDateString('pt-BR')} às {sale.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {nfce ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        nfce.status === 'autorizada' ? 'bg-green-900/50 text-green-300' :
                        nfce.status === 'rejeitada' ? 'bg-red-900/50 text-red-300' :
                        nfce.status === 'cancelada' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        NFCe {nfce.status === 'autorizada' ? nfce.numero : nfce.status}
                      </span>
                    ) : isNFCeConfigured() ? (
                      <span className="text-xs text-gray-500">Sem NFCe</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Calculator className="h-6 w-6 mr-2 text-yellow-400" />
            Frente de Caixa
          </h1>
          <p className="text-gray-400">Sistema de vendas e PDV</p>
        </div>
        
        {cart.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold px-4 py-2 rounded-lg">
            {cartItems} {cartItems === 1 ? 'item' : 'itens'} • R$ {cartTotal.toFixed(2)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner e Produtos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scanner Manual e por Câmera */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Scanner de Produto</h2>
              
              {/* Seletor de modo */}
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setScannerMode('usb')}
                  className={`flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
                    scannerMode === 'usb'
                      ? 'bg-yellow-500 text-black font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Scanner USB/Teclado"
                >
                  <Keyboard className="h-4 w-4 mr-1" />
                  USB
                </button>
                <button
                  onClick={() => setScannerMode('camera')}
                  className={`flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
                    scannerMode === 'camera'
                      ? 'bg-yellow-500 text-black font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Scanner por Câmera"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Câmera
                </button>
              </div>
            </div>
            
            {scannerMode === 'usb' ? (
              // Scanner USB/Manual
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
                    placeholder="Digite ou escaneie o código de barras..."
                    className="flex-1 px-4 py-3 text-lg bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white font-mono"
                    autoFocus
                  />
                  <button
                    onClick={handleBarcodeScan}
                    disabled={!barcodeInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Adicionar
                  </button>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-200 text-sm flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    <strong>Scanner USB:</strong> Conecte seu scanner físico e escaneie diretamente. Os códigos aparecerão automaticamente no campo acima.
                  </p>
                </div>
              </div>
            ) : (
              // Scanner por Câmera
              <div className="space-y-4">
                <div className="text-center">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center mx-auto shadow-lg"
                  >
                    <Scan className="h-6 w-6 mr-3" />
                    Abrir Scanner por Câmera
                  </button>
                </div>
                
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-200 text-sm flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    <strong>Scanner por Câmera:</strong> Use a câmera do seu dispositivo para escanear códigos de barras automaticamente.
                  </p>
                </div>
              </div>
            )}
            
            {/* Entrada manual sempre disponível */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="block text-sm text-gray-400 mb-2">Entrada Manual (backup):</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
                  placeholder="Código manual..."
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white text-sm font-mono"
                />
                <button
                  onClick={handleBarcodeScan}
                  disabled={!barcodeInput.trim()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>

          {/* Produtos Disponíveis */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Produtos Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {products.filter(p => p.stock > 0).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg hover:bg-yellow-600/20 hover:border-yellow-500/50 transition-colors text-left"
                >
                  <div className="font-medium text-sm text-white">{product.name}</div>
                  <div className="text-yellow-400 font-bold">R$ {product.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Est: {product.stock}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrinho ({cartItems})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">R$ {item.unitPrice.toFixed(2)} cada</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-yellow-400"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm font-bold text-yellow-400">R$ {item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Carrinho vazio</p>
              </div>
            )}
          </div>

          {/* Total e Pagamento */}
          {cart.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6">
              <div className="mb-4">
                <div className="flex justify-between text-lg">
                  <span className="text-white">Subtotal:</span>
                  <span className="text-white">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-yellow-400 border-t border-gray-600 pt-2 mt-2">
                  <span>TOTAL:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors text-lg"
              >
                FINALIZAR VENDA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScannerResult}
        title="Scanner de Código de Barras"
      />

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl max-w-md w-full p-6 border border-yellow-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Finalizar Pagamento</h3>
            
            <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">R$ {cartTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-300">{cartItems} {cartItems === 1 ? 'item' : 'itens'}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'dinheiro' 
                      ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' 
                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Dinheiro
                </button>
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'pix' 
                      ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' 
                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  PIX
                </button>
                <button
                  onClick={() => setPaymentMethod('cartão')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'cartão' 
                      ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' 
                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Cartão
                </button>
                <button
                  onClick={() => setPaymentMethod('débito')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'débito' 
                      ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' 
                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Débito
                </button>
              </div>
            </div>

            {paymentMethod === 'dinheiro' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor Recebido</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-lg bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                />
                {cashReceived && parseFloat(cashReceived) >= cartTotal && (
                  <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded">
                    <p className="text-lg font-bold text-yellow-400">
                      Troco: R$ {(parseFloat(cashReceived) - cartTotal).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={completeSale}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center justify-center"
              >
                <Check className="h-4 w-4 mr-2" />
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}