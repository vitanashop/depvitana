import { useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';

const getStorageKey = (businessId: string) => `business-${businessId}-products`;

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola 2L',
    barcode: '7894900011517',
    category: 'Refrigerante',
    brand: 'Coca-Cola',
    price: 8.50,
    cost: 5.20,
    stock: 48,
    minStock: 10,
    unit: 'unidade',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Cerveja Skol Lata 350ml',
    barcode: '7891991010924',
    category: 'Cerveja',
    brand: 'Skol',
    price: 3.20,
    cost: 2.10,
    stock: 120,
    minStock: 24,
    unit: 'unidade',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Água Crystal 500ml',
    barcode: '7891910000147',
    category: 'Água',
    brand: 'Crystal',
    price: 2.00,
    cost: 1.20,
    stock: 8,
    minStock: 20,
    unit: 'unidade',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    name: 'Guaraná Antarctica 2L',
    barcode: '7891991010931',
    category: 'Refrigerante',
    brand: 'Antarctica',
    price: 7.80,
    cost: 4.90,
    stock: 32,
    minStock: 15,
    unit: 'unidade',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    name: 'Cerveja Brahma Long Neck',
    barcode: '7891991010948',
    category: 'Cerveja',
    brand: 'Brahma',
    price: 4.50,
    cost: 2.80,
    stock: 96,
    minStock: 30,
    unit: 'unidade',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const loadProducts = async () => {
      const storageKey = getStorageKey(user.businessId);
      
      // Tentar carregar da nuvem primeiro
      const cloudData = await DatabaseService.loadData(storageKey, user.id, user.businessId);
      
      if (cloudData) {
        const parsedProducts = cloudData.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        setProducts(parsedProducts);
      } else {
        // Fallback para dados locais ou iniciais
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const parsedProducts = JSON.parse(stored).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          setProducts(parsedProducts);
        } else {
          setProducts(initialProducts);
          await DatabaseService.saveData(storageKey, initialProducts, user.id, user.businessId);
        }
      }
    };

    loadProducts();
  }, [user]);

  const saveProducts = async (updatedProducts: Product[]) => {
    if (!user) return;
    
    setProducts(updatedProducts);
    const storageKey = getStorageKey(user.businessId);
    
    // Salvar na nuvem e localmente
    await DatabaseService.saveData(storageKey, updatedProducts, user.id, user.businessId);
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedProducts = [...products, newProduct];
    await saveProducts(updatedProducts);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map((product) =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date() }
        : product
    );
    await saveProducts(updatedProducts);
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    await saveProducts(updatedProducts);
  };

  const updateStock = async (productId: string, quantity: number) => {
    await updateProduct(productId, { stock: quantity });
  };

  const findByBarcode = (barcode: string) => {
    return products.find((product) => product.barcode === barcode);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    findByBarcode,
  };
}