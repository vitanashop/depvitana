import { useState, useEffect } from 'react';
import { StockMovement } from '../types';
import { useAuth } from '../contexts/AuthContext';

const getStorageKey = (businessId: string) => `business-${businessId}-movements`;

export function useStockMovements() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const storageKey = getStorageKey(user.businessId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const parsedMovements = JSON.parse(stored).map((m: any) => ({
        ...m,
        date: new Date(m.date),
      }));
      setMovements(parsedMovements);
    }
  }, [user]);

  const saveMovements = (updatedMovements: StockMovement[]) => {
    if (!user) return;
    
    setMovements(updatedMovements);
    const storageKey = getStorageKey(user.businessId);
    localStorage.setItem(storageKey, JSON.stringify(updatedMovements));
  };

  const addMovement = (movement: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
      date: new Date(),
    };
    const updatedMovements = [...movements, newMovement];
    saveMovements(updatedMovements);
  };

  const getMovementsByProduct = (productId: string) => {
    return movements.filter((movement) => movement.productId === productId);
  };

  const getMovementsByDateRange = (startDate: Date, endDate: Date) => {
    return movements.filter(
      (movement) => movement.date >= startDate && movement.date <= endDate
    );
  };

  return {
    movements,
    addMovement,
    getMovementsByProduct,
    getMovementsByDateRange,
  };
}