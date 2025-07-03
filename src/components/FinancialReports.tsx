import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  BarChart3,
  FileText,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';

export function FinancialReports() {
  const { sales, getDailyRevenue, getMonthlyRevenue, getYearlyRevenue } = useSales();
  const { products } = useProducts();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const todayRevenue = getDailyRevenue(today);
  const monthRevenue = getMonthlyRevenue(today);
  const yearRevenue = getYearlyRevenue(today);
  const lastMonthRevenue = getMonthlyRevenue(lastMonth);

  const monthlyGrowth = lastMonthRevenue > 0 
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Top produtos
  const productStats = products.map(product => {
    const productSales = sales.filter(sale => 
      sale.items.some(item => item.productId === product.id)
    );
    
    const totalQuantity = productSales.reduce((total, sale) => {
      const productItems = sale.items.filter(item => item.productId === product.id);
      return total + productItems.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    const totalRevenue = productSales.reduce((total, sale) => {
      const productItems = sale.items.filter(item => item.productId === product.id);
      return total + productItems.reduce((sum, item) => sum + item.total, 0);
    }, 0);

    return {
      ...product,
      totalQuantity,
      totalRevenue,
      profit: totalRevenue - (totalQuantity * product.cost)
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Vendas por método de pagamento
  const paymentMethodStats = sales.reduce((acc, sale) => {
    if (!acc[sale.paymentMethod]) {
      acc[sale.paymentMethod] = { count: 0, total: 0 };
    }
    acc[sale.paymentMethod].count += 1;
    acc[sale.paymentMethod].total += sale.total;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro': return '💵';
      case 'pix': return '📱';
      case 'cartão': return '💳';
      case 'débito': return '💳';
      default: return '💰';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios Financeiros</h1>
          <p className="text-gray-400">Análise detalhada das vendas e performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Vendas Hoje</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(todayRevenue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Vendas do Mês</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(monthRevenue)}</p>
              <p className={`text-sm flex items-center mt-1 ${
                monthlyGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {monthlyGrowth >= 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(monthlyGrowth).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-600">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Vendas do Ano</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(yearRevenue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total de Vendas</p>
              <p className="text-2xl font-bold text-white">{sales.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produtos */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Produtos
          </h2>
          
          <div className="space-y-3">
            {productStats.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.totalQuantity} vendidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(product.totalRevenue)}</p>
                  <p className="text-sm text-green-400">+{formatCurrency(product.profit)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Métodos de Pagamento</h2>
          
          <div className="space-y-3">
            {Object.entries(paymentMethodStats).map(([method, stats]) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getPaymentMethodIcon(method)}</span>
                  <div>
                    <p className="font-medium text-white capitalize">{method}</p>
                    <p className="text-sm text-gray-400">{stats.count} transações</p>
                  </div>
                </div>
                <p className="font-medium text-white">{formatCurrency(stats.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas Vendas */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-blue-500/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Últimas Vendas</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Data</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-300">Itens</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-300">Pagamento</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white">
                    {sale.date.toLocaleDateString('pt-BR')} às {sale.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-300">
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 capitalize">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-white">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Nenhuma venda registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}