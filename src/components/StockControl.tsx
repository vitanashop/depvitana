import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Search, Package, History } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useStockMovements } from '../hooks/useStockMovements';

export function StockControl() {
  const { products, updateStock } = useProducts();
  const { movements, addMovement } = useStockMovements();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [movementType, setMovementType] = useState<'entrada' | 'saída'>('entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const handleMovement = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || !reason) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const movementQuantity = parseInt(quantity);
    const newStock = movementType === 'entrada' 
      ? product.stock + movementQuantity 
      : product.stock - movementQuantity;

    if (newStock < 0) {
      alert('Estoque insuficiente para esta saída!');
      return;
    }

    addMovement({
      productId: selectedProduct,
      type: movementType,
      quantity: movementQuantity,
      reason: reason,
    });

    updateStock(selectedProduct, newStock);

    setSelectedProduct('');
    setQuantity('');
    setReason('');
  };

  const recentMovements = movements
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Controle de Estoque</h1>
        <p className="text-gray-400">Gerencie entradas e saídas de produtos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Movimentação */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Nova Movimentação
          </h2>
          
          <form onSubmit={handleMovement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Movimentação
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="entrada"
                    checked={movementType === 'entrada'}
                    onChange={(e) => setMovementType(e.target.value as 'entrada')}
                    className="mr-2 text-blue-500"
                  />
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-white">Entrada</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="saída"
                    checked={movementType === 'saída'}
                    onChange={(e) => setMovementType(e.target.value as 'saída')}
                    className="mr-2 text-blue-500"
                  />
                  <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-white">Saída</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Produto
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">Selecione um produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Estoque: {product.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Digite a quantidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Motivo
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Ex: Compra, Venda, Avaria, Devolução"
              />
            </div>

            <button
              type="submit"
              className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                movementType === 'entrada'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
            </button>
          </form>
        </div>

        {/* Histórico de Movimentações */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Movimentações Recentes
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentMovements.map((movement) => {
              const product = products.find(p => p.id === movement.productId);
              return (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg">
                  <div className="flex items-center">
                    {movement.type === 'entrada' ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-white">{product?.name || 'Produto não encontrado'}</p>
                      <p className="text-xs text-gray-400">{movement.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      {movement.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {recentMovements.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma movimentação registrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Produtos com Estoque */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Estoque Atual</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Produto</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Categoria</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-300">Estoque</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-300">Mínimo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.brand}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{product.category}</td>
                  <td className="py-3 px-4 text-center font-medium text-white">
                    {product.stock} {product.unit}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">
                    {product.minStock} {product.unit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {product.stock <= product.minStock ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300">
                        Baixo
                      </span>
                    ) : product.stock <= product.minStock * 2 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300">
                        Atenção
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}