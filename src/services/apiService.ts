const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth-token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth-token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos de autenticação
  async superAdminLogin(password: string) {
    const response = await this.request('/auth/super-admin', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async requestAccess(data: {
    fullName: string;
    email: string;
    businessName: string;
    businessDescription: string;
  }) {
    return this.request('/auth/request-access', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setupPasswords(data: {
    email: string;
    adminCredentials: { username: string; password: string };
    operatorCredentials: { username: string; password: string };
  }) {
    return this.request('/auth/setup-passwords', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async checkUserStatus(email: string) {
    return this.request('/auth/check-status', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async getAccessRequests() {
    return this.request('/auth/requests');
  }

  async approveAccess(userId: string) {
    return this.request(`/auth/approve/${userId}`, {
      method: 'POST',
    });
  }

  async rejectAccess(userId: string, reason: string) {
    return this.request(`/auth/reject/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Métodos de produtos
  async getProducts() {
    return this.request('/products');
  }

  async getProductByBarcode(barcode: string) {
    return this.request(`/products/barcode/${barcode}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductStock(id: string, quantity: number) {
    return this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  // Métodos de vendas
  async getSales(params?: { startDate?: string; endDate?: string; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request(`/sales${query ? `?${query}` : ''}`);
  }

  async createSale(sale: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getSalesStats() {
    return this.request('/sales/stats');
  }

  // Métodos de estoque
  async getStockMovements(params?: { productId?: string; startDate?: string; endDate?: string; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request(`/stock/movements${query ? `?${query}` : ''}`);
  }

  async addStockMovement(movement: any) {
    return this.request('/stock/movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    });
  }

  async getLowStockProducts() {
    return this.request('/stock/low-stock');
  }

  // Métodos de relatórios
  async getSalesReport(params?: { startDate?: string; endDate?: string; groupBy?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);
    
    const query = queryParams.toString();
    return this.request(`/reports/sales${query ? `?${query}` : ''}`);
  }

  async getTopProducts(params?: { startDate?: string; endDate?: string; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request(`/reports/top-products${query ? `?${query}` : ''}`);
  }

  async getInventoryReport() {
    return this.request('/reports/inventory');
  }

  async getDashboardStats() {
    return this.request('/reports/dashboard');
  }

  // Métodos de estabelecimento
  async getBusinessSettings() {
    return this.request('/business/settings');
  }

  async updateBusinessSettings(settings: any) {
    return this.request('/business/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Métodos de NFCe
  async getNFCes(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/nfce${query}`);
  }

  async createNFCe(nfce: any) {
    return this.request('/nfce', {
      method: 'POST',
      body: JSON.stringify(nfce),
    });
  }

  async updateNFCeStatus(id: string, status: any) {
    return this.request(`/nfce/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();