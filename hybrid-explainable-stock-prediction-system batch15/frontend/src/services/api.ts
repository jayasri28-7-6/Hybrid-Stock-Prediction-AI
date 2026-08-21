// API Base URL - points to your FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface NewsArticle {
  id: string;
  headlineKey: string;
  summaryKey: string;
  source: string;
  date: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
}

export interface StockData {
  date: string;
  price: number;
}

export interface PredictionData {
  symbol: string;
  prediction: {
    predictedPrice: number;
    confidence: number;
    trend: 'Up' | 'Down' | 'Stable';
    reasoning: string;
  };
  timestamp: string;
}

export interface CompanyDetails {
  name: string;
  sector: string;
  industry: string;
  marketCategory: string;
  description: string;
  recentTrend: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface Bookmark {
  symbol: string;
  name: string;
  smartAlertEnabled: boolean;
}

export interface Alert {
  id: string;
  stock: string;
  change: string;
  trend: 'Up' | 'Down' | 'Stable';
  action: 'Buy' | 'Sell' | 'Hold';
  message: string;
  timestamp: string;
  priceAtAlert: number;
  recipient: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck() {
    try {
      return await this.request<{ status: string; message: string }>('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================
  async login(username: string, password: string) {
    try {
      const response = await this.request<{ access_token: string; token_type: string; user?: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: { username: string; email: string; password: string; name?: string }) {
    try {
      return await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async verifyToken() {
    try {
      return await this.request<{ user: any }>('/auth/verify');
    } catch (error) {
      console.error('Token verification failed:', error);
      this.logout();
      throw error;
    }
  }

  // ==================== STOCK PREDICTIONS ====================
  async getPrediction(symbol: string, timeframe?: string) {
    try {
      return await this.request<ApiResponse<PredictionData>>(`/api/predict/${symbol}${timeframe ? `?timeframe=${timeframe}` : ''}`);
    } catch (error) {
      console.error('Failed to get prediction:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, timeframe: string = '1M') {
    try {
      return await this.request<ApiResponse<StockData[]>>(`/api/historical/${symbol}?timeframe=${timeframe}`);
    } catch (error) {
      console.error('Failed to get historical data:', error);
      throw error;
    }
  }

  async getCompanyDetails(symbol: string) {
    try {
      return await this.request<ApiResponse<CompanyDetails>>(`/api/company/${symbol}`);
    } catch (error) {
      console.error('Failed to get company details:', error);
      throw error;
    }
  }

  async getForecast(symbol: string, days: number = 30) {
    try {
      return await this.request<ApiResponse<any[]>>(`/api/forecast/${symbol}?days=${days}`);
    } catch (error) {
      console.error('Failed to get forecast:', error);
      throw error;
    }
  }

  // ==================== NEWS AND SENTIMENT ====================
  async getStockNews(symbol: string) {
    try {
      return await this.request<ApiResponse<NewsArticle[]>>(`/api/news/${symbol}`);
    } catch (error) {
      console.error('Failed to get news:', error);
      // Return empty data instead of throwing to prevent UI breakage
      return { success: false, data: [] };
    }
  }

  async getNewsInLanguage(symbol: string, language: string) {
    try {
      return await this.request<ApiResponse<NewsArticle[]>>(`/api/news/${symbol}/${language}`);
    } catch (error) {
      console.error('Failed to get news in language:', error);
      return { success: false, data: [] };
    }
  }

  async getMarketSentiment() {
    try {
      return await this.request<ApiResponse<any>>('/api/news/market/sentiment');
    } catch (error) {
      console.error('Failed to get market sentiment:', error);
      throw error;
    }
  }

  // ==================== USER PROFILE & PREFERENCES ====================
  async getUserProfile() {
    try {
      return await this.request<ApiResponse<any>>('/user/profile');
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>) {
    try {
      return await this.request<ApiResponse<UserPreferences>>('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  // ==================== BOOKMARKS ====================
  async getBookmarks() {
    try {
      return await this.request<ApiResponse<Bookmark[]>>('/user/bookmarks');
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      return { success: false, data: [] };
    }
  }

  async addBookmark(symbol: string, name: string, smartAlertEnabled: boolean = false) {
    try {
      return await this.request<ApiResponse<Bookmark>>('/user/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ symbol, name, smartAlertEnabled }),
      });
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(symbol: string) {
    try {
      return await this.request<ApiResponse<any>>(`/user/bookmarks/${symbol}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  }

  // ==================== ALERTS ====================
  async getAlerts() {
    try {
      return await this.request<ApiResponse<Alert[]>>('/user/alerts');
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return { success: false, data: [] };
    }
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'timestamp'>) {
    try {
      return await this.request<ApiResponse<Alert>>('/user/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }

  async updateAlert(id: string, alertData: Partial<Alert>) {
    try {
      return await this.request<ApiResponse<Alert>>(`/user/alerts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alertData),
      });
    } catch (error) {
      console.error('Failed to update alert:', error);
      throw error;
    }
  }

  async deleteAlert(id: string) {
    try {
      return await this.request<ApiResponse<any>>(`/user/alerts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete alert:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

// Create and export a single instance
export const api = new ApiService();