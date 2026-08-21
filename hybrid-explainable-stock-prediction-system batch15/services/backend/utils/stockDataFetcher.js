// This is a mock stock data fetcher
// In production, replace with actual API calls (e.g., Alpha Vantage, Yahoo Finance, etc.)

class StockDataFetcher {
  async getHistoricalData(symbol, timeframe = '1M') {
    // Mock data - replace with actual API call
    const days = this.getDaysFromTimeframe(timeframe);
    const data = [];
    let price = 100 + Math.random() * 50;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      price = price + (Math.random() - 0.5) * 5;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 10) // Ensure price doesn't go negative
      });
    }
    
    return data;
  }

  async getCurrentPrice(symbol) {
    // Mock data - replace with actual API call
    return {
      symbol,
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5
    };
  }

  async getCompanyDetails(symbol) {
    // Mock data - replace with actual API call
    const companies = {
      'AAPL': {
        name: 'Apple Inc.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCategory: 'Large Cap',
        description: 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
        recentTrend: 'Bullish'
      },
      'GOOGL': {
        name: 'Alphabet Inc.',
        sector: 'Technology',
        industry: 'Internet Content & Information',
        marketCategory: 'Large Cap',
        description: 'Google is a multinational technology company focusing on search engine, advertising, cloud computing, and AI.',
        recentTrend: 'Bullish'
      }
    };
    
    return companies[symbol] || {
      name: symbol,
      sector: 'Unknown',
      industry: 'Unknown',
      marketCategory: 'Unknown',
      description: 'No description available',
      recentTrend: 'Neutral'
    };
  }

  async getKeyStatistics(symbol) {
    // Mock data - replace with actual API call
    return {
      dayRange: `$${(100 + Math.random() * 10).toFixed(2)} - $${(110 + Math.random() * 10).toFixed(2)}`,
      open: 100 + Math.random() * 10,
      previousClose: 100 + Math.random() * 10,
      fiftyTwoWeekRange: `$${(80 + Math.random() * 20).toFixed(2)} - $${(120 + Math.random() * 30).toFixed(2)}`,
      avgVolume: `${(Math.random() * 50 + 10).toFixed(1)}M`,
      marketCap: `$${(Math.random() * 2000 + 500).toFixed(0)}B`,
      sharesOutstanding: `${(Math.random() * 10 + 5).toFixed(1)}B`,
      epsTTM: 5 + Math.random() * 2,
      peTTM: 20 + Math.random() * 10,
      forwardDividendYield: `${(Math.random() * 2).toFixed(2)}%`,
      exDividendDate: new Date().toISOString().split('T')[0]
    };
  }

  getDaysFromTimeframe(timeframe) {
    const map = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825
    };
    return map[timeframe] || 30;
  }
}

module.exports = new StockDataFetcher();// This is a mock stock data fetcher
// In production, replace with actual API calls (e.g., Alpha Vantage, Yahoo Finance, etc.)

class StockDataFetcher {
  async getHistoricalData(symbol, timeframe = '1M') {
    // Mock data - replace with actual API call
    const days = this.getDaysFromTimeframe(timeframe);
    const data = [];
    let price = 100 + Math.random() * 50;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      price = price + (Math.random() - 0.5) * 5;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 10) // Ensure price doesn't go negative
      });
    }
    
    return data;
  }

  async getCurrentPrice(symbol) {
    // Mock data - replace with actual API call
    return {
      symbol,
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5
    };
  }

  async getCompanyDetails(symbol) {
    // Mock data - replace with actual API call
    const companies = {
      'AAPL': {
        name: 'Apple Inc.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCategory: 'Large Cap',
        description: 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
        recentTrend: 'Bullish'
      },
      'GOOGL': {
        name: 'Alphabet Inc.',
        sector: 'Technology',
        industry: 'Internet Content & Information',
        marketCategory: 'Large Cap',
        description: 'Google is a multinational technology company focusing on search engine, advertising, cloud computing, and AI.',
        recentTrend: 'Bullish'
      }
    };
    
    return companies[symbol] || {
      name: symbol,
      sector: 'Unknown',
      industry: 'Unknown',
      marketCategory: 'Unknown',
      description: 'No description available',
      recentTrend: 'Neutral'
    };
  }

  async getKeyStatistics(symbol) {
    // Mock data - replace with actual API call
    return {
      dayRange: `$${(100 + Math.random() * 10).toFixed(2)} - $${(110 + Math.random() * 10).toFixed(2)}`,
      open: 100 + Math.random() * 10,
      previousClose: 100 + Math.random() * 10,
      fiftyTwoWeekRange: `$${(80 + Math.random() * 20).toFixed(2)} - $${(120 + Math.random() * 30).toFixed(2)}`,
      avgVolume: `${(Math.random() * 50 + 10).toFixed(1)}M`,
      marketCap: `$${(Math.random() * 2000 + 500).toFixed(0)}B`,
      sharesOutstanding: `${(Math.random() * 10 + 5).toFixed(1)}B`,
      epsTTM: 5 + Math.random() * 2,
      peTTM: 20 + Math.random() * 10,
      forwardDividendYield: `${(Math.random() * 2).toFixed(2)}%`,
      exDividendDate: new Date().toISOString().split('T')[0]
    };
  }

  getDaysFromTimeframe(timeframe) {
    const map = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825
    };
    return map[timeframe] || 30;
  }
}

module.exports = new StockDataFetcher();