import { useState, useEffect } from 'react';
import { Sale } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';

const getStorageKey = (businessId: string) => `business-${businessId}-sales`;

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const loadSales = async () => {
      const storageKey = getStorageKey(user.businessId);
      
      // Tentar carregar da nuvem primeiro
      const cloudData = await DatabaseService.loadData(storageKey, user.id, user.businessId);
      
      if (cloudData) {
        const parsedSales = cloudData.map((s: any) => ({
          ...s,
          date: new Date(s.date),
        }));
        setSales(parsedSales);
      } else {
        // Fallback para dados locais
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const parsedSales = JSON.parse(stored).map((s: any) => ({
            ...s,
            date: new Date(s.date),
          }));
          setSales(parsedSales);
        }
      }
    };

    loadSales();
  }, [user]);

  const saveSales = async (updatedSales: Sale[]) => {
    if (!user) return;
    
    setSales(updatedSales);
    const storageKey = getStorageKey(user.businessId);
    
    // Salvar na nuvem e localmente
    await DatabaseService.saveData(storageKey, updatedSales, user.id, user.businessId);
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      date: new Date(),
    };
    const updatedSales = [...sales, newSale];
    await saveSales(updatedSales);
  };

  const getSalesByDateRange = (startDate: Date, endDate: Date) => {
    return sales.filter(
      (sale) => sale.date >= startDate && sale.date <= endDate
    );
  };

  const getDailyRevenue = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return getSalesByDateRange(startOfDay, endOfDay).reduce(
      (total, sale) => total + sale.total,
      0
    );
  };

  const getMonthlyRevenue = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return getSalesByDateRange(startOfMonth, endOfMonth).reduce(
      (total, sale) => total + sale.total,
      0
    );
  };

  const getYearlyRevenue = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 11, 31);
    
    return getSalesByDateRange(startOfYear, endOfYear).reduce(
      (total, sale) => total + sale.total,
      0
    );
  };

  return {
    sales,
    addSale,
    getSalesByDateRange,
    getDailyRevenue,
    getMonthlyRevenue,
    getYearlyRevenue,
  };
}