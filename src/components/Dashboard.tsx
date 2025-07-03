import React from 'react';
import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  BarChart3,
  ShoppingCart,
  Users
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 p-6 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-yellow-400 mt-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { products } = useProducts();
  const { sales, getDailyRevenue, getMonthlyRevenue } = useSales();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const today = new Date();
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalInventoryValue = products.reduce((total, p) => total + (p.stock * p.cost), 0);
  
  const recentSales = sales
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>
          Dashboard
        </h1>
        <p className={`text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
          {isMobile ? 'Visão geral do depósito' : 'Visão geral do seu depósito de bebidas'}
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
        <StatCard
          title="Total de Produtos"
          value={products.length.toString()}
          icon={<Package className="h-6 w-6 text-black" />}
          color="from-yellow-400 to-yellow-600"
        />
        
        <StatCard
          title="Estoque Baixo"
          value={lowStockItems.length.toString()}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="from-red-500 to-red-600"
        />
        
        <StatCard
          title="Vendas Hoje"
          value={formatCurrency(getDailyRevenue(today))}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="from-green-500 to-green-600"
          trend="+12% hoje"
        />
        
        <StatCard
          title="Vendas do Mês"
          value={formatCurrency(getMonthlyRevenue(today))}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="from-purple-500 to-purple-600"
          trend="+8% este mês"
        />
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
        {/* Produtos com Estoque Baixo */}
        <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center mb-4">
            <AlertTriangle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-500 mr-2`} />
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              {isMobile ? 'Estoque Baixo' : 'Produtos com Estoque Baixo'}
            </h2>
          </div>
          
          {lowStockItems.length > 0 ? (
            <div className={`space-y-${isMobile ? '2' : '3'}`}>
              {lowStockItems.slice(0, 5).map((product) => (
                <div key={product.id} className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg border border-red-500/30`}>
                  <div>
                    <p className={`font-medium text-white ${isMobile ? 'text-sm' : ''}`}>
                      {product.name}
                    </p>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
                      {product.brand} - {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-red-400`}>
                      {product.stock} {product.unit}
                    </p>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
                      Mín: {product.minStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Package className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-4 opacity-30`} />
              <p className={isMobile ? 'text-sm' : ''}>
                {isMobile ? 'Estoque adequado' : 'Todos os produtos com estoque adequado'}
              </p>
            </div>
          )}
        </div>

        {/* Últimas Vendas */}
        <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white flex items-center`}>
              <ShoppingCart className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-yellow-400`} />
              {isMobile ? 'Vendas' : 'Últimas Vendas'}
            </h2>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              {recentSales.length} vendas recentes
            </div>
          </div>
          
          {recentSales.length > 0 ? (
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              {recentSales.map((sale, index) => (
                <div key={sale.id} className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600/30`}>
                  <div className="flex items-center">
                    <div className={`${isMobile ? 'w-8 h-8 mr-3' : 'w-10 h-10 mr-4'} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg`}>
                      <span className={`text-black font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div>
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white`}>
                        {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                      </div>
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>
                        {isMobile ? 
                          sale.date.toLocaleDateString('pt-BR') : 
                          `${sale.date.toLocaleDateString('pt-BR')} às ${sale.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-yellow-400`}>
                      {formatCurrency(sale.total)}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 capitalize`}>
                      {sale.paymentMethod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-4 opacity-30`} />
              <p className={isMobile ? 'text-sm' : ''}>
                {isMobile ? 'Sem vendas' : 'Nenhuma venda registrada ainda'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className={`bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg border border-yellow-500/30 ${isMobile ? 'p-4' : 'p-6'}`}>
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-4 flex items-center`}>
          <BarChart3 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-yellow-400`} />
          Resumo Rápido
        </h2>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
          <div className="text-center">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-400 mb-2`}>
              {formatCurrency(totalInventoryValue)}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              {isMobile ? 'Valor do Estoque' : 'Valor Total do Estoque'}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>
              {sales.length}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              Total de Vendas
            </div>
          </div>
          
          <div className="text-center">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-400 mb-2`}>
              {products.reduce((total, p) => total + p.stock, 0)}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              Itens em Estoque
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}