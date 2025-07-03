import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Filter,
  Download,
  Upload,
  BarChart3,
  Eye,
  Lock
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Product } from '../types';

interface ProductManagementProps {
  readOnly?: boolean; // ✅ Nova prop para modo somente leitura
}

export function ProductManagement({ readOnly = false }: ProductManagementProps) {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { showNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ✅ VERIFICAR PERMISSÕES
  const canEdit = !readOnly && user?.role === 'admin';
  const isOperatorView = user?.role === 'operator';

  const categories = [...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!canEdit) return;
    
    try {
      await addProduct(productData);
      setShowAddModal(false);
      showNotification({
        type: 'success',
        title: 'Produto Adicionado',
        message: `${productData.name} foi adicionado com sucesso!`
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao adicionar produto'
      });
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    if (!canEdit) return;
    
    try {
      await updateProduct(id, updates);
      setEditingProduct(null);
      showNotification({
        type: 'success',
        title: 'Produto Atualizado',
        message: 'Produto atualizado com sucesso!'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao atualizar produto'
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!canEdit) return;
    
    try {
      await deleteProduct(id);
      setShowDeleteConfirm(null);
      showNotification({
        type: 'success',
        title: 'Produto Removido',
        message: 'Produto removido com sucesso!'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao remover produto'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ HEADER COM INDICAÇÃO DE MODO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Package className="h-8 w-8 mr-3 text-yellow-400" />
            {isOperatorView ? 'Consulta de Produtos' : 'Gestão de Produtos'}
          </h1>
          {isOperatorView && (
            <p className="text-gray-400 mt-1 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Modo consulta - Visualização apenas
            </p>
          )}
        </div>
        
        {/* ✅ BOTÕES APENAS PARA ADMINISTRADORES */}
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 flex items-center shadow-lg shadow-yellow-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </button>
          </div>
        )}
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-red-400 font-semibold">
              {lowStockProducts.length} produto(s) com estoque baixo
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.map(product => (
              <div key={product.id} className="text-sm text-red-300">
                {product.name} - {product.stock} unidades
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 appearance-none"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-gray-400">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {filteredProducts.length} produto(s) encontrado(s)
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                {/* ✅ AÇÕES APENAS PARA ADMINISTRADORES */}
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{product.name}</div>
                      <div className="text-sm text-gray-400">{product.brand}</div>
                      <div className="text-xs text-gray-500">Código: {product.barcode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-500/30">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">
                      R$ {product.price.toFixed(2)}
                    </div>
                    {canEdit && (
                      <div className="text-xs text-gray-400">
                        Custo: R$ {product.cost.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{product.stock} {product.unit}</div>
                    <div className="text-xs text-gray-400">Mín: {product.minStock}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock <= product.minStock
                        ? 'bg-red-900/50 text-red-300 border border-red-500/30'
                        : product.stock <= product.minStock * 2
                        ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30'
                        : 'bg-green-900/50 text-green-300 border border-green-500/30'
                    }`}>
                      {product.stock <= product.minStock ? 'Baixo' : 
                       product.stock <= product.minStock * 2 ? 'Médio' : 'Normal'}
                    </span>
                  </td>
                  {/* ✅ AÇÕES APENAS PARA ADMINISTRADORES */}
                  {canEdit && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-800/50"
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800/50"
                          title="Excluir produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar os filtros de busca'
                : canEdit 
                  ? 'Comece adicionando seu primeiro produto'
                  : 'Não há produtos cadastrados no sistema'
              }
            </p>
          </div>
        )}
      </div>

      {/* ✅ MODAIS APENAS PARA ADMINISTRADORES */}
      {canEdit && (
        <>
          {/* Modal Adicionar Produto */}
          {showAddModal && (
            <ProductModal
              onSave={handleAddProduct}
              onClose={() => setShowAddModal(false)}
            />
          )}

          {/* Modal Editar Produto */}
          {editingProduct && (
            <ProductModal
              product={editingProduct}
              onSave={(data) => handleUpdateProduct(editingProduct.id, data)}
              onClose={() => setEditingProduct(null)}
            />
          )}

          {/* Modal Confirmar Exclusão */}
          {showDeleteConfirm && (
            <DeleteConfirmModal
              productName={products.find(p => p.id === showDeleteConfirm)?.name || ''}
              onConfirm={() => handleDeleteProduct(showDeleteConfirm)}
              onCancel={() => setShowDeleteConfirm(null)}
            />
          )}
        </>
      )}

      {/* ✅ INDICADOR PARA OPERADORES */}
      {isOperatorView && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center text-blue-400">
            <Lock className="h-5 w-5 mr-2" />
            <span className="text-sm">
              Você está no modo consulta. Para editar produtos, entre como Administrador.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Modal para Adicionar/Editar Produto
interface ProductModalProps {
  product?: Product;
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function ProductModal({ product, onSave, onClose }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    category: product?.category || '',
    brand: product?.brand || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || 'unidade',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Código de Barras
            </label>
            <input
              type="text"
              required
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Categoria
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Marca
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Estoque
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Estoque Mín.
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Unidade
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              >
                <option value="unidade">Unidade</option>
                <option value="kg">Kg</option>
                <option value="litro">Litro</option>
                <option value="caixa">Caixa</option>
                <option value="pacote">Pacote</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200"
            >
              {product ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente Modal de Confirmação de Exclusão
interface DeleteConfirmModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ productName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
          <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
        </div>
        
        <p className="text-gray-300 mb-6">
          Tem certeza que deseja excluir o produto <strong>{productName}</strong>? 
          Esta ação não pode ser desfeita.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}